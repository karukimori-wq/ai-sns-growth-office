import assert from "node:assert/strict";
import test from "node:test";
import {
  handleApproveApprovalAsync,
  handleCreateCeoInstructionAsync,
  handleCreateMediaUploadJobAsync,
  handleCreatePublishJobAsync,
  handleRequestApprovalRevisionAsync,
  handleUpdateEmployeeTaskStatusAsync
} from "../src/domain/api-handlers.mjs";
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
  assert.equal(result.body.employeeTasks.length, 5);
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
  assert.equal(
    (await repository.listEmployeeTasks()).find((item) => item.id === "employee_task_async_status").status,
    "completed"
  );
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
