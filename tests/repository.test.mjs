import assert from "node:assert/strict";
import test from "node:test";
import { assertRepositoryContract, requiredRepositoryMethods } from "../src/domain/repository-contract.mjs";
import { createRepositoryFromEnv, getRequestedRepositoryDriver } from "../src/domain/repository-factory.mjs";
import { createSeedRepository } from "../src/domain/repository.mjs";

test("seed repository separates company tasks and approval requests", () => {
  const repository = createSeedRepository();

  assert.equal(assertRepositoryContract(repository), true);
  assert.ok(repository.listCompanyTasks().length > 0);
  assert.ok(repository.listApprovals().length > 0);
  assert.equal(repository.listCompanyTasks().some((task) => task.id.startsWith("approval_")), false);
});

test("repository contract lists all methods required by API handlers", () => {
  assert.deepEqual(
    [
      "getApprovalById",
      "saveApproval",
      "listCeoInstructions",
      "saveCeoInstruction",
      "listEmployeeTasks",
      "saveEmployeeTask",
      "getMediaAssetById",
      "saveMediaUploadJob",
      "getContentDraftById",
      "saveContentDraft",
      "getMediaUploadJobById",
      "savePublishJob"
    ].every((method) => requiredRepositoryMethods.includes(method)),
    true
  );
});

test("repository contract fails fast when a method is missing", () => {
  assert.throws(
    () => assertRepositoryContract({ listCompanyTasks: () => [] }),
    /Repository contract missing methods/
  );
});

test("repository factory defaults to seed driver", () => {
  const { repository, status } = createRepositoryFromEnv({});

  assert.equal(assertRepositoryContract(repository), true);
  assert.equal(status.requestedDriver, "seed");
  assert.equal(status.activeDriver, "seed");
  assert.equal(status.durablePersistenceRequested, false);
  assert.equal(status.databaseBackedPersistenceReady, false);
  assert.equal(status.fallbackUsed, false);
  assert.deepEqual(status.issues, []);
});

test("repository factory reports D1 fallback when binding is missing", () => {
  const { repository, status } = createRepositoryFromEnv({
    AI_SNS_REPOSITORY_DRIVER: "d1"
  });

  assert.equal(assertRepositoryContract(repository), true);
  assert.equal(status.requestedDriver, "d1");
  assert.equal(status.activeDriver, "seed");
  assert.equal(status.durablePersistenceRequested, true);
  assert.equal(status.databaseBackedPersistenceReady, false);
  assert.equal(status.fallbackUsed, true);
  assert.match(status.issues[0], /requires a D1 database binding/);
});

test("repository factory normalizes unknown drivers to seed", () => {
  assert.equal(getRequestedRepositoryDriver({ AI_SNS_REPOSITORY_DRIVER: "unknown" }), "seed");
});

test("seed repository returns null for missing lookup records", () => {
  const repository = createSeedRepository();

  assert.equal(repository.getApprovalById("missing"), null);
  assert.equal(repository.getMediaAssetById("missing"), null);
  assert.equal(repository.getMediaUploadJobById("missing"), null);
  assert.equal(repository.getContentDraftById("missing"), null);
});

test("seed repository exposes content drafts for approval follow-up orchestration", () => {
  const repository = createSeedRepository();

  assert.ok(repository.listContentDrafts().some((draft) => draft.id === "draft_x_numeria_day1"));
});

test("seed repository exposes CEO instructions and employee tasks", () => {
  const repository = createSeedRepository();

  assert.ok(repository.listCeoInstructions().some((instruction) => instruction.id === "instruction_numeria_daily_x_route"));
  assert.ok(repository.listEmployeeTasks().some((task) => task.instructionId === "instruction_numeria_daily_x_route"));
});

test("seed repository can persist approval and generated jobs", () => {
  const repository = createSeedRepository();

  repository.saveApproval({
    id: "approval_test_save",
    type: "strategy",
    title: "Saved approval",
    relatedAppProjectId: "app_numeria_studio",
    status: "approved",
    history: []
  });
  repository.saveMediaUploadJob({
    id: "x_media_upload_test_save",
    mediaAssetId: "media_numeria_day1",
    status: "queued",
    xMediaId: null
  });
  repository.savePublishJob({
    id: "x_publish_test_save",
    contentDraftId: "draft_x_numeria_day1",
    mediaUploadJobId: "x_media_upload_test_save",
    status: "queued"
  });
  repository.saveCeoInstruction({
    id: "instruction_test_save",
    appProjectId: "app_numeria_studio",
    title: "Saved instruction",
    body: "Saved body",
    requestedBy: "ceo",
    status: "decomposed",
    createdAt: "2026-08-25T00:00:00.000Z"
  });
  repository.saveEmployeeTask({
    id: "employee_task_test_save",
    instructionId: "instruction_test_save",
    employeeId: "agent_content",
    employeeName: "投稿制作AI",
    title: "Saved task",
    outputType: "x_draft",
    status: "queued",
    statusLabel: "待機中",
    progress: 0,
    deliverable: "Saved deliverable"
  });
  repository.saveContentDraft({
    id: "draft_test_save",
    appProjectId: "app_numeria_studio",
    channel: "x",
    language: "ja",
    format: "text_plus_image",
    status: "waiting_approval",
    title: "Saved draft",
    body: "Saved body",
    cta: "Saved CTA"
  });

  assert.equal(repository.getApprovalById("approval_test_save").status, "approved");
  assert.equal(repository.getMediaUploadJobById("x_media_upload_test_save").status, "queued");
  assert.ok(repository.listPublishJobs().some((job) => job.id === "x_publish_test_save"));
  assert.ok(repository.listCeoInstructions().some((instruction) => instruction.id === "instruction_test_save"));
  assert.ok(repository.listEmployeeTasks().some((task) => task.id === "employee_task_test_save"));
  assert.equal(repository.getContentDraftById("draft_test_save").title, "Saved draft");
});
