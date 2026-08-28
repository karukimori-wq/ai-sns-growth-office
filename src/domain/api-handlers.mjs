import {
  createNumeriaXDraftFromInstruction,
  decomposeCeoInstruction
} from "./orchestration.mjs";
import {
  createApprovalRequestFromEmployeeTaskOutput,
  createContentDraftFromApprovedEmployeeOutput,
  createEmployeeTaskOutput,
  createMediaAssetFromApprovedEmployeeOutput,
  shouldGenerateEmployeeTaskOutput
} from "./employee-task-output.mjs";
import {
  approveRequest,
  createFollowUpActionsAfterApproval,
  createXMediaUploadJob,
  createXPublishJob,
  markMediaManualReady,
  requestRevision
} from "./workflow.mjs";

export function handleCreateCeoInstruction({ body = {}, repository }) {
  const marketingContent = body.marketingContentId ? repository.getMarketingContentById(body.marketingContentId) : null;
  const instruction = createCeoInstructionRecord({ ...body, marketingContent });
  const savedInstruction = repository.saveCeoInstruction(instruction);
  const employeeTasks = decomposeCeoInstruction({ ...savedInstruction, marketingContent }).map((task) => repository.saveEmployeeTask(task));
  const contentDraft = repository.saveContentDraft(
    createNumeriaXDraftFromInstruction({
      id: `draft_x_${savedInstruction.id}`,
      appProjectId: savedInstruction.appProjectId,
      instructionId: savedInstruction.id,
      marketingContent,
      objective: savedInstruction.objective,
      audience: savedInstruction.audience,
      body: savedInstruction.body
    })
  );

  return { status: 201, body: { instruction: savedInstruction, employeeTasks, contentDraft } };
}

export async function handleCreateCeoInstructionAsync({ body = {}, repository }) {
  const marketingContent = body.marketingContentId ? await repository.getMarketingContentById(body.marketingContentId) : null;
  const instruction = createCeoInstructionRecord({ ...body, marketingContent });
  const savedInstruction = await repository.saveCeoInstruction(instruction);
  const employeeTasks = [];

  for (const task of decomposeCeoInstruction({ ...savedInstruction, marketingContent })) {
    employeeTasks.push(await repository.saveEmployeeTask(task));
  }

  const contentDraft = await repository.saveContentDraft(
    createNumeriaXDraftFromInstruction({
      id: `draft_x_${savedInstruction.id}`,
      appProjectId: savedInstruction.appProjectId,
      instructionId: savedInstruction.id,
      marketingContent,
      objective: savedInstruction.objective,
      audience: savedInstruction.audience,
      body: savedInstruction.body
    })
  );

  return { status: 201, body: { instruction: savedInstruction, employeeTasks, contentDraft } };
}

const employeeTaskStatusLabels = {
  queued: "未着手",
  in_progress: "進行中",
  waiting_approval: "承認待ち",
  completed: "完了",
  blocked: "停止中"
};

const employeeTaskProgressDefaults = {
  queued: 0,
  in_progress: 50,
  waiting_approval: 90,
  completed: 100,
  blocked: 50
};

export function updateEmployeeTaskStatus(task, body = {}) {
  const nextStatus = body.status;

  if (!Object.hasOwn(employeeTaskStatusLabels, nextStatus)) {
    throw new Error("invalid_employee_task_status");
  }

  if (task.status === "completed" && nextStatus !== "completed") {
    throw new Error("completed_employee_task_cannot_be_reopened");
  }

  const output =
    body.output ??
    (shouldGenerateEmployeeTaskOutput(task, nextStatus)
      ? createEmployeeTaskOutput(task, { generatedAt: body.updatedAt })
      : task.output);

  return {
    ...task,
    status: nextStatus,
    statusLabel: body.statusLabel ?? employeeTaskStatusLabels[nextStatus],
    progress: body.progress ?? employeeTaskProgressDefaults[nextStatus],
    updatedAt: body.updatedAt ?? new Date().toISOString(),
    statusReason: body.reason ?? task.statusReason,
    output
  };
}

export function handleUpdateEmployeeTaskStatus({ employeeTaskId, body = {}, repository }) {
  const task = repository.listEmployeeTasks().find((item) => item.id === employeeTaskId);

  if (!task) {
    return { status: 404, body: { error: "employee_task_not_found" } };
  }

  try {
    const updatedTask = updateEmployeeTaskStatus(task, body);
    const savedTask = repository.saveEmployeeTask(updatedTask);
    const approvalRequest = persistEmployeeTaskApprovalRequest({ task: savedTask, repository });

    return { status: 200, body: { employeeTask: savedTask, approvalRequest } };
  } catch (error) {
    return {
      status: 409,
      body: { error: error instanceof Error ? error.message : "employee_task_status_update_failed" }
    };
  }
}

export async function handleUpdateEmployeeTaskStatusAsync({ employeeTaskId, body = {}, repository }) {
  const tasks = await repository.listEmployeeTasks();
  const task = tasks.find((item) => item.id === employeeTaskId);

  if (!task) {
    return { status: 404, body: { error: "employee_task_not_found" } };
  }

  try {
    const updatedTask = updateEmployeeTaskStatus(task, body);
    const savedTask = await repository.saveEmployeeTask(updatedTask);
    const approvalRequest = await persistEmployeeTaskApprovalRequestAsync({ task: savedTask, repository });

    return { status: 200, body: { employeeTask: savedTask, approvalRequest } };
  } catch (error) {
    return {
      status: 409,
      body: { error: error instanceof Error ? error.message : "employee_task_status_update_failed" }
    };
  }
}

export async function handleCancelCompanyTaskAsync({ companyTaskId, body = {}, repository }) {
  const tasks = await repository.listCompanyTasks();
  const task = tasks.find((item) => item.id === companyTaskId);

  if (!task) {
    return { status: 404, body: { error: "company_task_not_found" } };
  }

  if (task.status === "completed") {
    return { status: 409, body: { error: "completed_company_task_cannot_be_cancelled" } };
  }

  const cancelledTask = {
    ...task,
    status: "blocked",
    statusLabel: "中止",
    cancelledAt: body.cancelledAt ?? new Date().toISOString(),
    cancelReason: body.reason ?? "cancelled from company task list"
  };

  return { status: 200, body: { task: await repository.saveCompanyTask(cancelledTask) } };
}

export function handleApproveApproval({ approvalId, body = {}, repository }) {
  const approval = repository.getApprovalById(approvalId);

  if (!approval) {
    return { status: 404, body: { error: "approval_not_found" } };
  }

  try {
    const approved = approveRequest(approval, body.reason ?? "approved by CEO");
    repository.saveApproval(approved);

    const materializedOutput = materializeApprovedEmployeeOutput({ approval: approved, repository });
    const followUpActions = createFollowUpActionsAfterApproval({ approval: approved, repository });
    const persistedFollowUpActions = persistFollowUpActions(followUpActions, repository);
    const approvalRequest = persistPublishApprovalRequestIfReady({ appProjectId: approved.relatedAppProjectId, repository });

    return { status: 200, body: { approval: approved, materializedOutput, followUpActions: persistedFollowUpActions, approvalRequest } };
  } catch (error) {
    return {
      status: 409,
      body: { error: error instanceof Error ? error.message : "approval_cannot_be_approved" }
    };
  }
}

function persistEmployeeTaskApprovalRequest({ task, repository }) {
  const approvalRequest = createApprovalRequestFromEmployeeTaskOutput(task);

  if (!approvalRequest) {
    return null;
  }

  const existing = repository.listApprovals().find((approval) => approval.id === approvalRequest.id);

  if (existing) {
    return existing;
  }

  return repository.saveApproval(approvalRequest);
}

async function persistEmployeeTaskApprovalRequestAsync({ task, repository }) {
  const approvalRequest = createApprovalRequestFromEmployeeTaskOutput(task);

  if (!approvalRequest) {
    return null;
  }

  const approvals = await repository.listApprovals();
  const existing = approvals.find((approval) => approval.id === approvalRequest.id);

  if (existing) {
    return existing;
  }

  return repository.saveApproval(approvalRequest);
}

function materializeApprovedEmployeeOutput({ approval, repository }) {
  if (!approval.relatedEmployeeTaskId) {
    return null;
  }

  const task = repository.listEmployeeTasks().find((item) => item.id === approval.relatedEmployeeTaskId);

  if (!task?.output) {
    return null;
  }

  const existingDraft = repository
    .listContentDrafts()
    .find((draft) => draft.sourceApprovalId === approval.id || draft.sourceEmployeeTaskId === task.id);
  const existingAsset = repository
    .listMediaAssets()
    .find((asset) => asset.sourceApprovalId === approval.id || asset.sourceEmployeeTaskId === task.id);

  const contentDraft = existingDraft ?? createContentDraftFromApprovedEmployeeOutput({ task, approval });
  const mediaAsset = existingAsset ?? createMediaAssetFromApprovedEmployeeOutput({
    task,
    approval,
    contentDraftId: findLatestContentDraftIdForProject(repository, task.appProjectId)
  });

  return persistMaterializedOutput({ contentDraft, mediaAsset, existingDraft, existingAsset, repository });
}

async function materializeApprovedEmployeeOutputAsync({ approval, repository }) {
  if (!approval.relatedEmployeeTaskId) {
    return null;
  }

  const tasks = await repository.listEmployeeTasks();
  const task = tasks.find((item) => item.id === approval.relatedEmployeeTaskId);

  if (!task?.output) {
    return null;
  }

  const [contentDrafts, mediaAssets] = await Promise.all([
    repository.listContentDrafts(),
    repository.listMediaAssets()
  ]);
  const existingDraft = contentDrafts.find(
    (draft) => draft.sourceApprovalId === approval.id || draft.sourceEmployeeTaskId === task.id
  );
  const existingAsset = mediaAssets.find(
    (asset) => asset.sourceApprovalId === approval.id || asset.sourceEmployeeTaskId === task.id
  );

  const contentDraft = existingDraft ?? createContentDraftFromApprovedEmployeeOutput({ task, approval });
  const mediaAsset = existingAsset ?? createMediaAssetFromApprovedEmployeeOutput({
    task,
    approval,
    contentDraftId: findLatestContentDraftIdForProjectFromList(contentDrafts, task.appProjectId)
  });

  return persistMaterializedOutputAsync({ contentDraft, mediaAsset, existingDraft, existingAsset, repository });
}

function persistMaterializedOutput({ contentDraft, mediaAsset, existingDraft, existingAsset, repository }) {
  if (!contentDraft && !mediaAsset) {
    return null;
  }

  return {
    contentDraft: existingDraft ?? (contentDraft ? repository.saveContentDraft(contentDraft) : null),
    mediaAsset: existingAsset ?? (mediaAsset ? repository.saveMediaAsset(mediaAsset) : null)
  };
}

async function persistMaterializedOutputAsync({ contentDraft, mediaAsset, existingDraft, existingAsset, repository }) {
  if (!contentDraft && !mediaAsset) {
    return null;
  }

  return {
    contentDraft: existingDraft ?? (contentDraft ? await repository.saveContentDraft(contentDraft) : null),
    mediaAsset: existingAsset ?? (mediaAsset ? await repository.saveMediaAsset(mediaAsset) : null)
  };
}

function findLatestContentDraftIdForProject(repository, appProjectId) {
  return findLatestContentDraftIdForProjectFromList(repository.listContentDrafts(), appProjectId);
}

function findLatestContentDraftIdForProjectFromList(contentDrafts, appProjectId) {
  return contentDrafts.find((draft) => draft.appProjectId === appProjectId && draft.status === "waiting_approval")?.id ?? null;
}

function createCeoInstructionRecord(body) {
  const now = body.createdAt ?? new Date().toISOString();
  const id = body.id ?? `instruction_${now.replaceAll(/[^0-9]/g, "").slice(0, 14)}`;
  const marketingContent = body.marketingContent ?? null;
  const marketingContentName = marketingContent?.name ?? body.marketingContentName ?? null;
  const objective = body.objective ?? "投稿セット作成";
  const audience = body.audience ?? marketingContent?.audiences?.[0] ?? null;

  return {
    id,
    appProjectId: body.appProjectId ?? marketingContent?.appProjectId ?? "app_numeria_studio",
    marketingContentId: body.marketingContentId ?? marketingContent?.id ?? null,
    marketingContentName,
    objective,
    audience,
    title: body.title ?? `${marketingContentName ?? "X集客"}: ${objective}`,
    body: body.body ?? "Numeria Studioの毎日X運用を進める",
    requestedBy: "ceo",
    status: "decomposed",
    createdAt: now,
    decompositionSummary:
      body.decompositionSummary ??
      `${marketingContentName ?? "対象コンテンツ"}を対象に、ターゲット、悩み、入口、投稿セット、プロフィール、固定ポスト、導線、分析へ分解しました。`
  };
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

export async function handleApproveApprovalAsync({ approvalId, body = {}, repository }) {
  const approval = await repository.getApprovalById(approvalId);

  if (!approval) {
    return { status: 404, body: { error: "approval_not_found" } };
  }

  try {
    const approved = approveRequest(approval, body.reason ?? "approved by CEO");
    await repository.saveApproval(approved);

    const materializedOutput = await materializeApprovedEmployeeOutputAsync({ approval: approved, repository });
    const followUpActions = await createFollowUpActionsAfterApprovalAsync({ approval: approved, repository });
    const persistedFollowUpActions = await persistFollowUpActionsAsync(followUpActions, repository);
    const approvalRequest = await persistPublishApprovalRequestIfReadyAsync({
      appProjectId: approved.relatedAppProjectId,
      repository
    });

    return { status: 200, body: { approval: approved, materializedOutput, followUpActions: persistedFollowUpActions, approvalRequest } };
  } catch (error) {
    return {
      status: 409,
      body: { error: error instanceof Error ? error.message : "approval_cannot_be_approved" }
    };
  }
}

export async function handleRequestApprovalRevisionAsync({ approvalId, body = {}, repository }) {
  const approval = await repository.getApprovalById(approvalId);

  if (!approval) {
    return { status: 404, body: { error: "approval_not_found" } };
  }

  try {
    const revised = requestRevision(approval, body.reason ?? "revision requested by CEO");
    await repository.saveApproval(revised);

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

export async function handleCreateMediaUploadJobAsync({ body = {}, repository }) {
  const mediaAsset = await repository.getMediaAssetById(body.mediaAssetId);
  const imageApproval = await repository.getApprovalById(body.imageApprovalId);

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

    return { status: 201, body: { mediaUploadJob: await repository.saveMediaUploadJob(job) } };
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

export async function handleCreatePublishJobAsync({ body = {}, repository }) {
  const contentDraft = await repository.getContentDraftById(body.contentDraftId);
  const draftApproval = await repository.getApprovalById(body.draftApprovalId);
  const publishApproval = await repository.getApprovalById(body.publishApprovalId);
  const mediaUploadJob = body.mediaUploadJobId
    ? await repository.getMediaUploadJobById(body.mediaUploadJobId)
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

    return { status: 201, body: { publishJob: await repository.savePublishJob(job) } };
  } catch (error) {
    return {
      status: 409,
      body: { error: error instanceof Error ? error.message : "invalid_publish_job" }
    };
  }
}

export function handleMarkMediaUploadManualReady({ mediaUploadJobId, body = {}, repository }) {
  const job = repository.getMediaUploadJobById(mediaUploadJobId);

  if (!job) {
    return { status: 404, body: { error: "media_upload_job_not_found" } };
  }

  const readyJob = markMediaManualReady(job, body.reason ?? "manual media upload confirmed by CEO");
  const savedJob = repository.saveMediaUploadJob(readyJob);
  const approvalRequest = persistPublishApprovalRequestForMediaUploadJob({ mediaUploadJob: savedJob, repository });

  return { status: 200, body: { mediaUploadJob: savedJob, approvalRequest } };
}

export async function handleMarkMediaUploadManualReadyAsync({ mediaUploadJobId, body = {}, repository }) {
  const job = await repository.getMediaUploadJobById(mediaUploadJobId);

  if (!job) {
    return { status: 404, body: { error: "media_upload_job_not_found" } };
  }

  const readyJob = markMediaManualReady(job, body.reason ?? "manual media upload confirmed by CEO");
  const savedJob = await repository.saveMediaUploadJob(readyJob);
  const approvalRequest = await persistPublishApprovalRequestForMediaUploadJobAsync({
    mediaUploadJob: savedJob,
    repository
  });

  return { status: 200, body: { mediaUploadJob: savedJob, approvalRequest } };
}

function persistPublishApprovalRequestForMediaUploadJob({ mediaUploadJob, repository }) {
  const mediaAsset = repository.getMediaAssetById(mediaUploadJob.mediaAssetId);

  if (!mediaAsset) {
    return null;
  }

  return persistPublishApprovalRequestIfReady({ appProjectId: mediaAsset.appProjectId, repository });
}

async function persistPublishApprovalRequestForMediaUploadJobAsync({ mediaUploadJob, repository }) {
  const mediaAsset = await repository.getMediaAssetById(mediaUploadJob.mediaAssetId);

  if (!mediaAsset) {
    return null;
  }

  return persistPublishApprovalRequestIfReadyAsync({ appProjectId: mediaAsset.appProjectId, repository });
}

function persistPublishApprovalRequestIfReady({ appProjectId, repository }) {
  const contentDraft = findLatestWaitingContentDraft(repository.listContentDrafts(), appProjectId);
  const draftApproval = repository
    .listApprovals()
    .find((item) => item.type === "draft" && item.relatedAppProjectId === appProjectId && item.status === "approved");
  const mediaAsset = contentDraft ? findLatestMediaAssetForDraft(repository.listMediaAssets(), contentDraft.id) : null;
  const mediaUploadJob = mediaAsset
    ? repository.listMediaUploadJobs().find((item) => item.mediaAssetId === mediaAsset.id)
    : null;

  if (!contentDraft || !draftApproval || !mediaAsset || !["uploaded", "manual_required"].includes(mediaUploadJob?.status)) {
    return null;
  }

  const id = `approval_publish_${contentDraft.id}`;
  const existing = repository
    .listApprovals()
    .find(
      (approval) =>
        approval.id === id ||
        (approval.type === "publish_schedule" &&
          approval.relatedAppProjectId === appProjectId &&
          ["pending", "approved"].includes(approval.status))
    );

  if (existing) {
    return existing;
  }

  return repository.saveApproval({
    id,
    type: "publish_schedule",
    title: `${contentDraft.title}の公開承認`,
    reason: "下書き承認と画像準備が完了したため、公開または予約の最終判断が必要です。",
    relatedAppProjectId: appProjectId,
    proposedBy: "秘書AI",
    relatedContentDraftId: contentDraft.id,
    status: "pending",
    createdAt: new Date().toISOString(),
    history: [{ status: "pending", reason: "created from publish readiness", at: new Date().toISOString() }]
  });
}

async function persistPublishApprovalRequestIfReadyAsync({ appProjectId, repository }) {
  const [contentDrafts, approvals, mediaAssets, mediaUploadJobs] = await Promise.all([
    repository.listContentDrafts(),
    repository.listApprovals(),
    repository.listMediaAssets(),
    repository.listMediaUploadJobs()
  ]);
  const contentDraft = findLatestWaitingContentDraft(contentDrafts, appProjectId);
  const draftApproval = approvals.find(
    (item) => item.type === "draft" && item.relatedAppProjectId === appProjectId && item.status === "approved"
  );
  const mediaAsset = contentDraft ? findLatestMediaAssetForDraft(mediaAssets, contentDraft.id) : null;
  const mediaUploadJob = mediaAsset ? mediaUploadJobs.find((item) => item.mediaAssetId === mediaAsset.id) : null;

  if (!contentDraft || !draftApproval || !mediaAsset || !["uploaded", "manual_required"].includes(mediaUploadJob?.status)) {
    return null;
  }

  const id = `approval_publish_${contentDraft.id}`;
  const existing = approvals.find(
    (approval) =>
      approval.id === id ||
      (approval.type === "publish_schedule" &&
        approval.relatedAppProjectId === appProjectId &&
        ["pending", "approved"].includes(approval.status))
  );

  if (existing) {
    return existing;
  }

  const createdAt = new Date().toISOString();

  return repository.saveApproval({
    id,
    type: "publish_schedule",
    title: `${contentDraft.title}の公開承認`,
    reason: "下書き承認と画像準備が完了したため、公開または予約の最終判断が必要です。",
    relatedAppProjectId: appProjectId,
    proposedBy: "秘書AI",
    relatedContentDraftId: contentDraft.id,
    status: "pending",
    createdAt,
    history: [{ status: "pending", reason: "created from publish readiness", at: createdAt }]
  });
}

function findLatestWaitingContentDraft(contentDrafts, appProjectId) {
  return [...contentDrafts]
    .reverse()
    .find((item) => item.appProjectId === appProjectId && item.status === "waiting_approval") ?? null;
}

function findLatestMediaAssetForDraft(mediaAssets, contentDraftId) {
  return [...mediaAssets].reverse().find((item) => item.contentDraftId === contentDraftId) ?? null;
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

async function createFollowUpActionsAfterApprovalAsync({ approval, repository }) {
  if (approval.status !== "approved") {
    return { created: [], blocked: [] };
  }

  if (approval.type === "image_asset") {
    const mediaAssets = await repository.listMediaAssets();
    const mediaAsset = mediaAssets.find(
      (item) => item.appProjectId === approval.relatedAppProjectId && item.status === "waiting_approval"
    );

    if (!mediaAsset) {
      return {
        created: [],
        blocked: [{ type: "media_upload_job", reason: "media_asset_not_found" }]
      };
    }

    return {
      created: [
        {
          type: "media_upload_job",
          job: createXMediaUploadJob({
            id: `x_media_upload_${mediaAsset.id}`,
            mediaAssetId: mediaAsset.id,
            imageApproval: approval
          })
        }
      ],
      blocked: []
    };
  }

  if (approval.type === "publish_schedule") {
    const [contentDrafts, approvals, mediaAssets, mediaUploadJobs] = await Promise.all([
      repository.listContentDrafts(),
      repository.listApprovals(),
      repository.listMediaAssets(),
      repository.listMediaUploadJobs()
    ]);
    const contentDraft = approval.relatedContentDraftId
      ? contentDrafts.find((item) => item.id === approval.relatedContentDraftId)
      : contentDrafts.find(
        (item) => item.appProjectId === approval.relatedAppProjectId && item.status === "waiting_approval"
      );
    const draftApproval = approvals.find(
      (item) =>
        item.type === "draft" &&
        item.relatedAppProjectId === approval.relatedAppProjectId &&
        item.status === "approved"
    );
    const mediaAsset = approval.relatedMediaAssetId
      ? mediaAssets.find((item) => item.id === approval.relatedMediaAssetId)
      : contentDraft
        ? mediaAssets.find((item) => item.contentDraftId === contentDraft.id)
        : null;
    const mediaUploadJob = approval.relatedMediaUploadJobId
      ? mediaUploadJobs.find((item) => item.id === approval.relatedMediaUploadJobId)
      : mediaAsset
        ? mediaUploadJobs.find((item) => item.mediaAssetId === mediaAsset.id)
        : undefined;

    const blocked = [];
    if (!contentDraft) {
      blocked.push({ type: "publish_job", reason: "content_draft_not_found" });
    }
    if (contentDraft && contentDraft.appProjectId !== approval.relatedAppProjectId) {
      blocked.push({ type: "publish_job", reason: "content_draft_does_not_match_approval" });
    }
    if (!draftApproval) {
      blocked.push({ type: "publish_job", reason: "draft_approval_not_approved" });
    }
    if (contentDraft && mediaAsset && mediaAsset.contentDraftId !== contentDraft.id) {
      blocked.push({ type: "publish_job", reason: "media_asset_does_not_match_content_draft" });
    }
    if (mediaAsset && !mediaUploadJob) {
      blocked.push({ type: "publish_job", reason: "media_upload_job_not_ready" });
    }
    if (mediaUploadJob && !["uploaded", "manual_required"].includes(mediaUploadJob.status)) {
      blocked.push({ type: "publish_job", reason: "media_upload_not_ready" });
    }

    if (blocked.length > 0) {
      return { created: [], blocked };
    }

    return {
      created: [
        {
          type: "publish_job",
          job: createXPublishJob({
            id: `x_publish_${contentDraft.id}`,
            contentDraftId: contentDraft.id,
            draftApproval,
            publishApproval: approval,
            mediaUploadJob
          })
        }
      ],
      blocked: []
    };
  }

  return { created: [], blocked: [] };
}

async function persistFollowUpActionsAsync(followUpActions, repository) {
  return {
    ...followUpActions,
    created: await Promise.all(
      followUpActions.created.map(async (action) => {
        if (action.type === "media_upload_job") {
          return { ...action, job: await repository.saveMediaUploadJob(action.job) };
        }

        if (action.type === "publish_job") {
          return { ...action, job: await repository.savePublishJob(action.job) };
        }

        return action;
      })
    )
  };
}
