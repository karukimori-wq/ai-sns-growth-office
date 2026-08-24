import assert from "node:assert/strict";
import test from "node:test";
import {
  approveRequest,
  calculateBottleneckRates,
  createApprovalRequest,
  createXMediaUploadJob,
  createXPublishJob,
  markMediaUploaded,
  normalizeDailyMetrics,
  requestRevision
} from "../src/domain/workflow.mjs";

test("publish job is blocked until draft and publish approvals exist", () => {
  const draftApproval = approveRequest(
    createApprovalRequest({
      id: "approval_draft",
      type: "draft",
      title: "X draft",
      relatedAppProjectId: "app_numeria_studio"
    })
  );
  const publishApproval = createApprovalRequest({
    id: "approval_publish",
    type: "publish_schedule",
    title: "Schedule X post",
    relatedAppProjectId: "app_numeria_studio"
  });

  assert.throws(
    () =>
      createXPublishJob({
        id: "x_publish_1",
        contentDraftId: "draft_1",
        draftApproval,
        publishApproval
      }),
    /before required CEO approvals/
  );
});

test("image based publish job requires approved image and uploaded media", () => {
  const imageApproval = approveRequest(
    createApprovalRequest({
      id: "approval_image",
      type: "image_asset",
      title: "Image asset",
      relatedAppProjectId: "app_numeria_studio"
    })
  );
  const draftApproval = approveRequest(
    createApprovalRequest({
      id: "approval_draft",
      type: "draft",
      title: "X draft",
      relatedAppProjectId: "app_numeria_studio"
    })
  );
  const publishApproval = approveRequest(
    createApprovalRequest({
      id: "approval_publish",
      type: "publish_schedule",
      title: "Schedule X post",
      relatedAppProjectId: "app_numeria_studio"
    })
  );

  const uploadJob = createXMediaUploadJob({
    id: "x_media_1",
    mediaAssetId: "media_1",
    imageApproval
  });

  assert.throws(
    () =>
      createXPublishJob({
        id: "x_publish_1",
        contentDraftId: "draft_1",
        draftApproval,
        publishApproval,
        mediaUploadJob: uploadJob
      }),
    /before required CEO approvals/
  );

  const uploaded = markMediaUploaded(uploadJob, "media123");
  const publishJob = createXPublishJob({
    id: "x_publish_1",
    contentDraftId: "draft_1",
    draftApproval,
    publishApproval,
    mediaUploadJob: uploaded
  });

  assert.equal(publishJob.status, "queued");
  assert.equal(publishJob.mediaUploadJobId, "x_media_1");
});

test("revision preserves approval history", () => {
  const approval = createApprovalRequest({
    id: "approval_strategy",
    type: "strategy",
    title: "Campaign route",
    relatedAppProjectId: "app_numeria_studio"
  });

  const revised = requestRevision(approval, "Tone needs to be clearer");

  assert.equal(revised.status, "revision_requested");
  assert.equal(revised.history.length, 2);
});

test("missing daily metrics are unknown, not zero", () => {
  const metrics = normalizeDailyMetrics({
    impressions: 1000,
    profile_visits: 80,
    follows: 12
  });

  assert.equal(metrics.cta_clicks, "unknown");
  assert.equal(metrics.revenue, "unknown");

  const rates = calculateBottleneckRates(metrics);
  assert.equal(rates.profile_visit_rate, 0.08);
  assert.equal(rates.cta_click_rate, "unknown");
});
