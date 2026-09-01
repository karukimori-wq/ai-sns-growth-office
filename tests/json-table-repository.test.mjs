import assert from "node:assert/strict";
import test from "node:test";
import {
  handleApproveApproval,
  handleCreateMediaUploadJob,
  handleCreatePublishJob
} from "../src/domain/api-handlers.mjs";
import { createRepositoryFromEnv } from "../src/domain/repository-factory.mjs";

test("json table repository supports approval, media upload, and publish roundtrip", () => {
  const { repository, status } = createRepositoryFromEnv({
    AI_SNS_REPOSITORY_DRIVER: "json_table"
  });

  assert.equal(status.activeDriver, "json_table");
  assert.equal(status.databaseBackedPersistenceReady, true);

  repository.saveApproval({
    id: "approval_image_roundtrip",
    type: "image_asset",
    title: "Roundtrip image approval",
    relatedAppProjectId: "app_numeria_studio",
    status: "approved",
    history: []
  });
  repository.saveApproval({
    id: "approval_draft_roundtrip",
    type: "draft",
    title: "Roundtrip draft approval",
    relatedAppProjectId: "app_numeria_studio",
    status: "approved",
    history: []
  });
  repository.saveApproval({
    id: "approval_publish_roundtrip",
    type: "publish_schedule",
    title: "Roundtrip publish approval",
    relatedAppProjectId: "app_numeria_studio",
    status: "approved",
    history: []
  });

  const mediaResult = handleCreateMediaUploadJob({
    body: {
      mediaAssetId: "media_numeria_day1",
      imageApprovalId: "approval_image_roundtrip"
    },
    repository
  });

  assert.equal(mediaResult.status, 201);

  const uploadedJob = {
    ...mediaResult.body.mediaUploadJob,
    status: "uploaded",
    xMediaId: "x_media_roundtrip"
  };
  repository.saveMediaUploadJob(uploadedJob);

  const publishResult = handleCreatePublishJob({
    body: {
      contentDraftId: "draft_x_numeria_day1",
      draftApprovalId: "approval_draft_roundtrip",
      publishApprovalId: "approval_publish_roundtrip",
      mediaUploadJobId: uploadedJob.id
    },
    repository
  });

  assert.equal(publishResult.status, 201);
  assert.equal(repository.getMediaUploadJobById(uploadedJob.id).xMediaId, "x_media_roundtrip");
  assert.ok(repository.listPublishJobs().some((job) => job.id === publishResult.body.publishJob.id));
});

test("json table repository persists approved approval updates", () => {
  const { repository } = createRepositoryFromEnv({
    AI_SNS_REPOSITORY_DRIVER: "json_table"
  });

  repository.saveApproval({
    id: "approval_strategy_roundtrip",
    type: "strategy",
    title: "Roundtrip strategy",
    relatedAppProjectId: "app_numeria_studio",
    status: "pending",
    history: []
  });

  const result = handleApproveApproval({
    approvalId: "approval_strategy_roundtrip",
    body: { reason: "roundtrip approved" },
    repository
  });

  assert.equal(result.status, 200);
  assert.equal(repository.getApprovalById("approval_strategy_roundtrip").status, "approved");
});

test("json table repository seeds SNS account settings", () => {
  const { repository } = createRepositoryFromEnv({
    AI_SNS_REPOSITORY_DRIVER: "json_table"
  });

  assert.ok(repository.listSnsAccounts().some((account) => account.channel === "LINE"));
});

test("json table repository persists LINE webhook events and deliveries", () => {
  const { repository } = createRepositoryFromEnv({
    AI_SNS_REPOSITORY_DRIVER: "json_table"
  });

  repository.saveLineWebhookEvent({ id: "line_event_roundtrip", provider: "line", status: "received" });
  repository.saveLineMessageDelivery({ id: "line_delivery_roundtrip", provider: "line", status: "sent" });

  assert.equal(repository.getLineWebhookEventById("line_event_roundtrip").status, "received");
  assert.equal(repository.getLineMessageDeliveryById("line_delivery_roundtrip").status, "sent");
});
