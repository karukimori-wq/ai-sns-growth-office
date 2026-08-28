import assert from "node:assert/strict";
import test from "node:test";
import {
  handleApproveApprovalAsync,
  handleCreateCeoInstructionAsync,
  handleCreateMediaUploadJobAsync,
  handleCreatePublishJobAsync,
  handleMarkMediaUploadManualReadyAsync,
  handleRequestApprovalRevisionAsync,
  handleUpdateEmployeeTaskStatusAsync
} from "../src/domain/api-handlers.mjs";
import { handleCreatePublishApprovalRequestAsync } from "../src/domain/publish-approval-request.mjs";
import { createRepositoryFromEnv } from "../src/domain/repository-factory.mjs";

test("async CEO instruction handler creates employee tasks and draft", async () => {
  const repository = createAsyncRepository();

  const result = await handleCreateCeoInstructionAsync({
    body: {
      id: "instruction_async_numeria",
      appProjectId: "app_numeria_studio",
      title: "Async Numeria instruction",
      body: "Numeria Studioの投稿導線を作る",
      createdAt: "2026-08-25T09:00:00.000Z"
    },
    repository
  });

  assert.equal(result.status, 201);
  assert.equal(result.body.employeeTasks.length, 9);
  assert.equal((await repository.listCeoInstructions()).some((item) => item.id === "instruction_async_numeria"), true);
  assert.equal((await repository.listEmployeeTasks()).some((item) => item.instructionId === "instruction_async_numeria"), true);
  assert.equal((await repository.getContentDraftById("draft_x_instruction_async_numeria")).status, "waiting_approval");
});

test("async approval handler persists approval and follow-up jobs with promise repository", async () => {
  const repository = createAsyncRepository();

  const result = await handleApproveApprovalAsync({
    approvalId: "approval_image_numeria_day1",
    body: { reason: "async approved" },
    repository
  });

  assert.equal(result.status, 200);
  assert.equal(result.body.approval.status, "approved");
  assert.equal((await repository.getApprovalById("approval_image_numeria_day1")).status, "approved");
  assert.equal((await repository.listMediaUploadJobs()).length, 1);
});

test("async approval handler materializes approved employee draft output", async () => {
  const repository = createAsyncRepository();

  await repository.saveEmployeeTask({
    id: "employee_task_async_materialized_draft",
    appProjectId: "app_numeria_studio",
    employeeName: "投稿制作AI",
    output: {
      id: "output_employee_task_async_materialized_draft",
      title: "X投稿下書き",
      summary: "現在地整理から無料チェックへ案内する投稿本文",
      items: ["CTA: 無料チェックを開始"],
      nextAction: "CEOが確認する",
      approvalRequired: true
    }
  });
  await repository.saveApproval({
    id: "approval_employee_task_async_materialized_draft",
    type: "draft",
    title: "Draft output",
    relatedAppProjectId: "app_numeria_studio",
    relatedEmployeeTaskId: "employee_task_async_materialized_draft",
    status: "pending",
    history: [{ status: "pending", reason: "created" }]
  });

  const result = await handleApproveApprovalAsync({
    approvalId: "approval_employee_task_async_materialized_draft",
    body: { reason: "draft approved" },
    repository
  });

  assert.equal(result.status, 200);
  assert.equal(result.body.materializedOutput.contentDraft.id, "draft_employee_task_async_materialized_draft");
  assert.equal((await repository.getContentDraftById("draft_employee_task_async_materialized_draft")).sourceApprovalId, "approval_employee_task_async_materialized_draft");
});

test("async revision handler persists revision request with promise repository", async () => {
  const repository = createAsyncRepository();

  const result = await handleRequestApprovalRevisionAsync({
    approvalId: "approval_strategy_numeria_week1",
    body: { reason: "async revision" },
    repository
  });

  assert.equal(result.status, 200);
  assert.equal(result.body.approval.status, "revision_requested");
  assert.equal((await repository.getApprovalById("approval_strategy_numeria_week1")).status, "revision_requested");
});

test("async employee task status handler supports promise repository", async () => {
  const repository = createAsyncRepository();

  await repository.saveEmployeeTask({
    id: "employee_task_async_status",
    employeeName: "分析AI",
    title: "CTA率を確認",
    status: "queued",
    statusLabel: "未着手",
    progress: 0,
    outputType: "analysis"
  });

  const result = await handleUpdateEmployeeTaskStatusAsync({
    employeeTaskId: "employee_task_async_status",
    body: {
      status: "completed",
      updatedAt: "2026-08-26T10:30:00.000Z"
    },
    repository
  });

  assert.equal(result.status, 200);
  assert.equal(result.body.employeeTask.status, "completed");
  assert.equal(result.body.employeeTask.progress, 100);
  assert.equal(result.body.employeeTask.output.title, "日次分析チェック");
  assert.equal(result.body.employeeTask.output.approvalRequired, false);
  assert.equal(result.body.approvalRequest, null);
  assert.equal(
    (await repository.listEmployeeTasks()).find((item) => item.id === "employee_task_async_status").status,
    "completed"
  );
});

test("async employee task status handler creates approval requests for approval-required outputs", async () => {
  const repository = createAsyncRepository();

  await repository.saveEmployeeTask({
    id: "employee_task_async_draft",
    employeeName: "投稿制作AI",
    title: "X投稿下書きを作成",
    status: "queued",
    statusLabel: "未着手",
    progress: 0,
    outputType: "x_draft",
    appProjectId: "app_numeria_studio"
  });

  const result = await handleUpdateEmployeeTaskStatusAsync({
    employeeTaskId: "employee_task_async_draft",
    body: {
      status: "waiting_approval",
      updatedAt: "2026-08-26T11:00:00.000Z"
    },
    repository
  });

  assert.equal(result.status, 200);
  assert.equal(result.body.approvalRequest.type, "draft");
  assert.equal(result.body.approvalRequest.relatedEmployeeTaskId, "employee_task_async_draft");
  assert.equal((await repository.listApprovals()).filter((approval) => approval.id === "approval_employee_task_async_draft").length, 1);
});

test("async media upload and publish handlers support promise repository", async () => {
  const repository = createAsyncRepository();

  await repository.saveApproval({
    id: "approval_image_async",
    type: "image_asset",
    title: "Async image",
    relatedAppProjectId: "app_numeria_studio",
    status: "approved",
    history: []
  });
  await repository.saveApproval({
    id: "approval_draft_async",
    type: "draft",
    title: "Async draft",
    relatedAppProjectId: "app_numeria_studio",
    status: "approved",
    history: []
  });
  await repository.saveApproval({
    id: "approval_publish_async",
    type: "publish_schedule",
    title: "Async publish",
    relatedAppProjectId: "app_numeria_studio",
    status: "approved",
    history: []
  });

  const mediaResult = await handleCreateMediaUploadJobAsync({
    body: {
      mediaAssetId: "media_numeria_day1",
      imageApprovalId: "approval_image_async"
    },
    repository
  });

  assert.equal(mediaResult.status, 201);

  const uploadedJob = {
    ...mediaResult.body.mediaUploadJob,
    status: "uploaded",
    xMediaId: "x_media_async"
  };
  await repository.saveMediaUploadJob(uploadedJob);

  const publishResult = await handleCreatePublishJobAsync({
    body: {
      contentDraftId: "draft_x_numeria_day1",
      draftApprovalId: "approval_draft_async",
      publishApprovalId: "approval_publish_async",
      mediaUploadJobId: uploadedJob.id
    },
    repository
  });

  assert.equal(publishResult.status, 201);
  assert.equal((await repository.listPublishJobs()).some((job) => job.id === publishResult.body.publishJob.id), true);
});

test("async manual media ready handler creates publish approval when gates are ready", async () => {
  const repository = createAsyncRepository();

  await repository.saveApproval({
    id: "approval_draft_async_ready",
    type: "draft",
    title: "Async draft",
    relatedAppProjectId: "app_async_ready",
    status: "approved",
    history: []
  });
  await repository.saveContentDraft({
    id: "draft_async_ready",
    appProjectId: "app_async_ready",
    status: "waiting_approval",
    title: "Async ready draft"
  });
  await repository.saveMediaAsset({
    id: "media_async_ready",
    appProjectId: "app_async_ready",
    contentDraftId: "draft_async_ready",
    status: "waiting_approval"
  });
  await repository.saveMediaUploadJob({
    id: "x_media_upload_async_ready",
    mediaAssetId: "media_async_ready",
    status: "queued",
    xMediaId: null
  });

  const result = await handleMarkMediaUploadManualReadyAsync({
    mediaUploadJobId: "x_media_upload_async_ready",
    body: { reason: "manual media ready" },
    repository
  });

  assert.equal(result.status, 200);
  assert.equal(result.body.mediaUploadJob.history.length, 1);
  assert.equal(result.body.mediaUploadJob.history[0].status, "manual_required");
  assert.equal(result.body.mediaUploadJob.history[0].reason, "manual media ready");
  assert.equal(result.body.approvalRequest.type, "publish_schedule");
  assert.equal(result.body.approvalRequest.relatedContentDraftId, "draft_async_ready");
});

test("async publish approval request handler creates approval for selected ready pair", async () => {
  const repository = createAsyncRepository();

  await repository.saveApproval({
    id: "approval_draft_async_selected",
    type: "draft",
    title: "Async draft",
    relatedAppProjectId: "app_async_selected",
    status: "approved",
    history: []
  });
  await repository.saveContentDraft({
    id: "draft_async_selected",
    appProjectId: "app_async_selected",
    status: "waiting_approval",
    title: "Async selected draft"
  });
  await repository.saveMediaAsset({
    id: "media_async_selected",
    appProjectId: "app_async_selected",
    contentDraftId: "draft_async_selected",
    status: "waiting_approval"
  });
  await repository.saveMediaUploadJob({
    id: "x_media_upload_async_selected",
    mediaAssetId: "media_async_selected",
    status: "manual_required",
    xMediaId: null
  });

  const result = await handleCreatePublishApprovalRequestAsync({
    body: {
      contentDraftId: "draft_async_selected",
      mediaAssetId: "media_async_selected",
      scheduledFor: "21:30"
    },
    repository
  });

  assert.equal(result.status, 201);
  assert.equal(result.body.approvalRequest.type, "publish_schedule");
  assert.equal(result.body.approvalRequest.relatedContentDraftId, "draft_async_selected");
  assert.equal(result.body.approvalRequest.relatedMediaAssetId, "media_async_selected");
  assert.equal(result.body.approvalRequest.scheduledFor, "21:30");
});

test("async approval handler creates publish job from selected publish approval pair", async () => {
  const repository = createAsyncRepository();

  await repository.saveApproval({
    id: "approval_draft_async_pair",
    type: "draft",
    title: "Selected draft approval",
    relatedAppProjectId: "app_async_pair",
    status: "approved",
    history: []
  });
  await repository.saveApproval({
    id: "approval_publish_async_pair",
    type: "publish_schedule",
    title: "Selected publish approval",
    relatedAppProjectId: "app_async_pair",
    relatedContentDraftId: "draft_async_pair",
    relatedMediaAssetId: "media_async_pair",
    relatedMediaUploadJobId: "x_media_upload_async_pair",
    scheduledFor: "20:45",
    status: "pending",
    history: [{ status: "pending", reason: "created" }]
  });
  await repository.saveContentDraft({
    id: "draft_other_pair",
    appProjectId: "app_async_pair",
    status: "waiting_approval",
    title: "Other draft"
  });
  await repository.saveContentDraft({
    id: "draft_async_pair",
    appProjectId: "app_async_pair",
    status: "waiting_approval",
    title: "Selected draft"
  });
  await repository.saveMediaAsset({
    id: "media_async_pair",
    appProjectId: "app_async_pair",
    contentDraftId: "draft_async_pair",
    status: "waiting_approval"
  });
  await repository.saveMediaUploadJob({
    id: "x_media_upload_async_pair",
    mediaAssetId: "media_async_pair",
    status: "uploaded",
    xMediaId: "x_media_pair"
  });

  const result = await handleApproveApprovalAsync({
    approvalId: "approval_publish_async_pair",
    body: { reason: "selected pair approved" },
    repository
  });

  assert.equal(result.status, 200);
  assert.equal(result.body.followUpActions.created.length, 1);
  assert.equal(result.body.followUpActions.created[0].job.contentDraftId, "draft_async_pair");
  assert.equal(result.body.followUpActions.created[0].job.mediaUploadJobId, "x_media_upload_async_pair");
  assert.equal(result.body.followUpActions.created[0].job.scheduledFor, "20:45");
});

function createAsyncRepository() {
  const { repository } = createRepositoryFromEnv({
    AI_SNS_REPOSITORY_DRIVER: "json_table"
  });

  return Object.fromEntries(
    Object.entries(repository).map(([key, value]) => [
      key,
      async (...args) => value(...args)
    ])
  );
}
