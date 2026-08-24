import assert from "node:assert/strict";
import test from "node:test";
import { assertRepositoryContract, requiredRepositoryMethods } from "../src/domain/repository-contract.mjs";
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
      "getMediaAssetById",
      "saveMediaUploadJob",
      "getContentDraftById",
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

  assert.equal(repository.getApprovalById("approval_test_save").status, "approved");
  assert.equal(repository.getMediaUploadJobById("x_media_upload_test_save").status, "queued");
  assert.ok(repository.listPublishJobs().some((job) => job.id === "x_publish_test_save"));
});
