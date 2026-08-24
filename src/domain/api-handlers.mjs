import {
  approveRequest,
  createFollowUpActionsAfterApproval,
  createXMediaUploadJob,
  createXPublishJob,
  requestRevision
} from "./workflow.mjs";

export function handleApproveApproval({ approvalId, body = {}, repository }) {
  const approval = repository.getApprovalById(approvalId);

  if (!approval) {
    return { status: 404, body: { error: "approval_not_found" } };
  }

  try {
    const approved = approveRequest(approval, body.reason ?? "approved by CEO");
    repository.saveApproval(approved);

    const followUpActions = createFollowUpActionsAfterApproval({ approval: approved, repository });
    const persistedFollowUpActions = persistFollowUpActions(followUpActions, repository);

    return { status: 200, body: { approval: approved, followUpActions: persistedFollowUpActions } };
  } catch (error) {
    return {
      status: 409,
      body: { error: error instanceof Error ? error.message : "approval_cannot_be_approved" }
    };
  }
}

export function handleRequestApprovalRevision({ approvalId, body = {}, repository }) {
  const approval = repository.getApprovalById(approvalId);

  if (!approval) {
    return { status: 404, body: { error: "approval_not_found" } };
  }

  try {
    const revised = requestRevision(approval, body.reason ?? "revision requested by CEO");
    repository.saveApproval(revised);

    return { status: 200, body: { approval: revised } };
  } catch (error) {
    return {
      status: 409,
      body: { error: error instanceof Error ? error.message : "approval_revision_cannot_be_requested" }
    };
  }
}

export function handleCreateMediaUploadJob({ body = {}, repository }) {
  const mediaAsset = repository.getMediaAssetById(body.mediaAssetId);
  const imageApproval = repository.getApprovalById(body.imageApprovalId);

  if (!mediaAsset) {
    return { status: 404, body: { error: "media_asset_not_found" } };
  }

  if (!imageApproval) {
    return { status: 404, body: { error: "image_approval_not_found" } };
  }

  try {
    const job = createXMediaUploadJob({
      id: body.id ?? `x_media_upload_${mediaAsset.id}`,
      mediaAssetId: mediaAsset.id,
      imageApproval
    });

    return { status: 201, body: { mediaUploadJob: repository.saveMediaUploadJob(job) } };
  } catch (error) {
    return {
      status: 409,
      body: { error: error instanceof Error ? error.message : "invalid_media_upload_job" }
    };
  }
}

export function handleCreatePublishJob({ body = {}, repository }) {
  const contentDraft = repository.getContentDraftById(body.contentDraftId);
  const draftApproval = repository.getApprovalById(body.draftApprovalId);
  const publishApproval = repository.getApprovalById(body.publishApprovalId);
  const mediaUploadJob = body.mediaUploadJobId
    ? repository.getMediaUploadJobById(body.mediaUploadJobId)
    : undefined;

  if (!contentDraft) {
    return { status: 404, body: { error: "content_draft_not_found" } };
  }

  if (!draftApproval) {
    return { status: 404, body: { error: "draft_approval_not_found" } };
  }

  if (!publishApproval) {
    return { status: 404, body: { error: "publish_approval_not_found" } };
  }

  try {
    const job = createXPublishJob({
      id: body.id ?? `x_publish_${contentDraft.id}`,
      contentDraftId: contentDraft.id,
      draftApproval,
      publishApproval,
      mediaUploadJob
    });

    return { status: 201, body: { publishJob: repository.savePublishJob(job) } };
  } catch (error) {
    return {
      status: 409,
      body: { error: error instanceof Error ? error.message : "invalid_publish_job" }
    };
  }
}

function persistFollowUpActions(followUpActions, repository) {
  return {
    ...followUpActions,
    created: followUpActions.created.map((action) => {
      if (action.type === "media_upload_job") {
        return { ...action, job: repository.saveMediaUploadJob(action.job) };
      }

      if (action.type === "publish_job") {
        return { ...action, job: repository.savePublishJob(action.job) };
      }

      return action;
    })
  };
}
