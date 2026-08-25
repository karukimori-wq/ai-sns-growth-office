import assert from "node:assert/strict";
import test from "node:test";

import {
  handleCancelPublishJobAsync,
  handleMarkPublishJobManualPublishedAsync,
  handleMarkPublishJobManualRequiredAsync
} from "../src/domain/publish-job-status-handlers.mjs";

function createRepository(initialJob) {
  let job = initialJob;

  return {
    async getPublishJobById(id) {
      return job?.id === id ? job : null;
    },
    async savePublishJob(nextJob) {
      job = nextJob;
      return nextJob;
    },
    get savedJob() {
      return job;
    }
  };
}

test("publish job status handlers persist manual required and published states", async () => {
  const repository = createRepository({ id: "publish_1", status: "queued", contentDraftId: "draft_1" });

  const manualRequired = await handleMarkPublishJobManualRequiredAsync({
    publishJobId: "publish_1",
    body: { reason: "X API not connected" },
    repository
  });

  assert.equal(manualRequired.status, 200);
  assert.equal(repository.savedJob.status, "manual_required");
  assert.equal(repository.savedJob.manualReason, "X API not connected");

  const manualPublished = await handleMarkPublishJobManualPublishedAsync({
    publishJobId: "publish_1",
    body: { publishedAt: "2026-08-26T09:00:00.000Z" },
    repository
  });

  assert.equal(manualPublished.status, 200);
  assert.equal(repository.savedJob.status, "published");
  assert.equal(repository.savedJob.publishedAt, "2026-08-26T09:00:00.000Z");
});

test("publish job status handlers persist cancelled state", async () => {
  const repository = createRepository({ id: "publish_1", status: "queued", contentDraftId: "draft_1" });

  const result = await handleCancelPublishJobAsync({
    publishJobId: "publish_1",
    body: { reason: "CEO stopped campaign" },
    repository
  });

  assert.equal(result.status, 200);
  assert.equal(repository.savedJob.status, "cancelled");
  assert.equal(repository.savedJob.cancelReason, "CEO stopped campaign");
});

test("publish job status handlers report missing and invalid transitions", async () => {
  const missingRepository = createRepository(null);
  const missing = await handleCancelPublishJobAsync({
    publishJobId: "missing",
    repository: missingRepository
  });

  assert.equal(missing.status, 404);
  assert.equal(missing.body.error, "publish_job_not_found");

  const publishedRepository = createRepository({ id: "publish_1", status: "published", contentDraftId: "draft_1" });
  const cancelled = await handleCancelPublishJobAsync({
    publishJobId: "publish_1",
    repository: publishedRepository
  });

  assert.equal(cancelled.status, 409);
  assert.match(cancelled.body.error, /cannot be cancelled/);
});
