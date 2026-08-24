import assert from "node:assert/strict";
import test from "node:test";
import { createSeedRepository } from "../src/domain/repository.mjs";

test("seed repository separates company tasks and approval requests", () => {
  const repository = createSeedRepository();

  assert.ok(repository.listCompanyTasks().length > 0);
  assert.ok(repository.listApprovals().length > 0);
  assert.equal(repository.listCompanyTasks().some((task) => task.id.startsWith("approval_")), false);
});

test("seed repository returns null for missing lookup records", () => {
  const repository = createSeedRepository();

  assert.equal(repository.getApprovalById("missing"), null);
  assert.equal(repository.getMediaAssetById("missing"), null);
  assert.equal(repository.getMediaUploadJobById("missing"), null);
  assert.equal(repository.getContentDraftById("missing"), null);
});
