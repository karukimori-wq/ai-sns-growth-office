import {
  createNumeriaXDraftFromInstruction,
  decomposeCeoInstruction
} from "./orchestration.mjs";
import {
  createEmployeeTaskOutput,
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
  const instruction = createCeoInstructionRecord(body);
  const savedInstruction = repository.saveCeoInstruction(instruction);
  const employeeTasks = decomposeCeoInstruction(savedInstruction).map((task) => repository.saveEmployeeTask(task));
  const contentDraft = repository.saveContentDraft(
    createNumeriaXDraftFromInstruction({
      id: `draft_x_${savedInstruction.id}`,
      appProjectId: savedInstruction.appProjectId,
      instructionId: savedInstruction.id
    })
  );

  return { status: 201, body: { instruction: savedInstruction, employeeTasks, contentDraft } };
}

export async function handleCreateCeoInstructionAsync({ body = {}, repository }) {
  const instruction = createCeoInstructionRecord(body);
  const savedInstruction = await repository.saveCeoInstruction(instruction);
  const employeeTasks = [];

  for (const task of decomposeCeoInstruction(savedInstruction)) {
    employeeTasks.push(await repository.saveEmployeeTask(task));
  }

  const contentDraft = await repository.saveContentDraft(
    createNumeriaXDraftFromInstruction({
      id: `draft_x_${savedInstruction.id}`,
      appProjectId: savedInstruction.appProjectId,
      instructionId: savedInstruction.id
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
    return { status: 200, body: { employeeTask: repository.saveEmployeeTask(updatedTask) } };
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
    return { status: 200, body: { employeeTask: await repository.saveEmployeeTask(updatedTask) } };
  } catch (error) {
    return {
      status: 409,
      body: { error: error instanceof Error ? error.message : "employee_task_status_update_failed" }
    };
  }
}

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

function createCeoInstructionRecord(body) {
  const now = body.createdAt ?? new Date().toISOString();
  const id = body.id ?? `instruction_${now.replaceAll(/[^0-9]/g, "").slice(0, 14)}`;

  return {
    id,
    appProjectId: body.appProjectId ?? "app_numeria_studio",
    title: body.title ?? "社長指示",
    body: body.body ?? "Numeria Studioの毎日X運用を進める",
    requestedBy: "ceo",
    status: "decomposed",
    createdAt: now,
    decompositionSummary:
      body.decompositionSummary ??
      "秘書AIが顧客理解、SNS戦略、投稿制作、画像方針、分析へタスク分解しました。"
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

    const followUpActions = await createFollowUpActionsAfterApprovalAsync({ approval: approved, repository });
    const persistedFollowUpActions = await persistFollowUpActionsAsync(followUpActions, repository);

    return { status: 200, body: { approval: approved, followUpActions: persistedFollowUpActions } };
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

  return { status: 200, body: { mediaUploadJob: repository.saveMediaUploadJob(readyJob) } };
}

export async function handleMarkMediaUploadManualReadyAsync({ mediaUploadJobId, body = {}, repository }) {
  const job = await repository.getMediaUploadJobById(mediaUploadJobId);

  if (!job) {
    return { status: 404, body: { error: "media_upload_job_not_found" } };
  }

  const readyJob = markMediaManualReady(job, body.reason ?? "manual media upload confirmed by CEO");

  return { status: 200, body: { mediaUploadJob: await repository.saveMediaUploadJob(readyJob) } };
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
    const contentDraft = contentDrafts.find(
      (item) => item.appProjectId === approval.relatedAppProjectId && item.status === "waiting_approval"
    );
    const draftApproval = approvals.find(
      (item) =>
        item.type === "draft" &&
        item.relatedAppProjectId === approval.relatedAppProjectId &&
        item.status === "approved"
    );
    const mediaAsset = contentDraft ? mediaAssets.find((item) => item.contentDraftId === contentDraft.id) : null;
    const mediaUploadJob = mediaAsset
      ? mediaUploadJobs.find((item) => item.mediaAssetId === mediaAsset.id)
      : undefined;

    const blocked = [];
    if (!contentDraft) {
      blocked.push({ type: "publish_job", reason: "content_draft_not_found" });
    }
    if (!draftApproval) {
      blocked.push({ type: "publish_job", reason: "draft_approval_not_approved" });
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
