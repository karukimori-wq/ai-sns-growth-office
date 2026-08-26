export function handleCreatePublishApprovalRequest({ body = {}, repository }) {
  const contentDraft = repository.getContentDraftById(body.contentDraftId);
  const mediaAsset = repository.getMediaAssetById(body.mediaAssetId);

  if (!contentDraft) {
    return { status: 404, body: { error: "content_draft_not_found" } };
  }

  if (!mediaAsset) {
    return { status: 404, body: { error: "media_asset_not_found" } };
  }

  try {
    const approvalRequest = createPublishApprovalRequestForSelectedPair({
      contentDraft,
      mediaAsset,
      scheduledFor: body.scheduledFor,
      repository
    });

    return { status: 201, body: { approvalRequest } };
  } catch (error) {
    return {
      status: 409,
      body: { error: error instanceof Error ? error.message : "publish_approval_request_failed" }
    };
  }
}

export async function handleCreatePublishApprovalRequestAsync({ body = {}, repository }) {
  const [contentDraft, mediaAsset] = await Promise.all([
    repository.getContentDraftById(body.contentDraftId),
    repository.getMediaAssetById(body.mediaAssetId)
  ]);

  if (!contentDraft) {
    return { status: 404, body: { error: "content_draft_not_found" } };
  }

  if (!mediaAsset) {
    return { status: 404, body: { error: "media_asset_not_found" } };
  }

  try {
    const approvalRequest = await createPublishApprovalRequestForSelectedPairAsync({
      contentDraft,
      mediaAsset,
      scheduledFor: body.scheduledFor,
      repository
    });

    return { status: 201, body: { approvalRequest } };
  } catch (error) {
    return {
      status: 409,
      body: { error: error instanceof Error ? error.message : "publish_approval_request_failed" }
    };
  }
}

function createPublishApprovalRequestForSelectedPair({ contentDraft, mediaAsset, scheduledFor, repository }) {
  const approvals = repository.listApprovals();
  const mediaUploadJob = repository.listMediaUploadJobs().find((item) => item.mediaAssetId === mediaAsset.id);
  const draftApproval = approvals.find(
    (item) =>
      item.type === "draft" &&
      item.relatedAppProjectId === contentDraft.appProjectId &&
      item.status === "approved"
  );

  return persistSelectedPublishApprovalRequest({
    approvals,
    contentDraft,
    draftApproval,
    mediaAsset,
    mediaUploadJob,
    scheduledFor,
    saveApproval: (approval) => repository.saveApproval(approval)
  });
}

async function createPublishApprovalRequestForSelectedPairAsync({ contentDraft, mediaAsset, scheduledFor, repository }) {
  const [approvals, mediaUploadJobs] = await Promise.all([
    repository.listApprovals(),
    repository.listMediaUploadJobs()
  ]);
  const mediaUploadJob = mediaUploadJobs.find((item) => item.mediaAssetId === mediaAsset.id);
  const draftApproval = approvals.find(
    (item) =>
      item.type === "draft" &&
      item.relatedAppProjectId === contentDraft.appProjectId &&
      item.status === "approved"
  );

  return persistSelectedPublishApprovalRequest({
    approvals,
    contentDraft,
    draftApproval,
    mediaAsset,
    mediaUploadJob,
    scheduledFor,
    saveApproval: (approval) => repository.saveApproval(approval)
  });
}

function persistSelectedPublishApprovalRequest({
  approvals,
  contentDraft,
  draftApproval,
  mediaAsset,
  mediaUploadJob,
  scheduledFor,
  saveApproval
}) {
  if (mediaAsset.contentDraftId !== contentDraft.id) {
    throw new Error("media_asset_does_not_match_content_draft");
  }

  if (!draftApproval) {
    throw new Error("draft_approval_not_approved");
  }

  if (!mediaUploadJob || !["uploaded", "manual_required"].includes(mediaUploadJob.status)) {
    throw new Error("media_upload_not_ready");
  }

  const id = `approval_publish_${contentDraft.id}_${mediaAsset.id}`;
  const existing = approvals.find(
    (approval) =>
      approval.id === id ||
      (approval.type === "publish_schedule" &&
        approval.relatedContentDraftId === contentDraft.id &&
        ["pending", "approved"].includes(approval.status))
  );

  if (existing) {
    return existing;
  }

  const createdAt = new Date().toISOString();
  const scheduleLabel = scheduledFor ? ` 希望公開時刻: ${scheduledFor}` : "";

  return saveApproval({
    id,
    type: "publish_schedule",
    title: `${contentDraft.title}の公開承認`,
    reason: `選択した下書きと画像の準備が完了しました。公開または予約の最終判断が必要です。${scheduleLabel}`,
    relatedAppProjectId: contentDraft.appProjectId,
    proposedBy: "秘書AI",
    relatedContentDraftId: contentDraft.id,
    relatedMediaAssetId: mediaAsset.id,
    relatedMediaUploadJobId: mediaUploadJob.id,
    scheduledFor: scheduledFor ?? null,
    status: "pending",
    createdAt,
    history: [{ status: "pending", reason: "created from selected draft and media pair", at: createdAt }]
  });
}
