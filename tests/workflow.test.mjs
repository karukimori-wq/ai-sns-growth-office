import assert from "node:assert/strict";
import test from "node:test";
import {
  approveRequest,
  canCreateXMediaUploadJob,
  canCreateXPublishJob,
  calculateBottleneckRates,
  createApprovalRequest,
  createFollowUpActionsAfterApproval,
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

test("pending image approval cannot create media upload job", () => {
  const imageApproval = createApprovalRequest({
    id: "approval_image_pending",
    type: "image_asset",
    title: "Image asset",
    relatedAppProjectId: "app_numeria_studio"
  });

  assert.equal(canCreateXMediaUploadJob({ imageApproval }), false);
  assert.throws(
    () =>
      createXMediaUploadJob({
        id: "x_media_pending",
        mediaAssetId: "media_1",
        imageApproval
      }),
    /before image approval/
  );
});

test("manual required media upload can still pass publish gate after CEO approvals", () => {
  const draftApproval = approveRequest(
    createApprovalRequest({
      id: "approval_draft_manual",
      type: "draft",
      title: "X draft",
      relatedAppProjectId: "app_numeria_studio"
    })
  );
  const publishApproval = approveRequest(
    createApprovalRequest({
      id: "approval_publish_manual",
      type: "publish_schedule",
      title: "Schedule X post",
      relatedAppProjectId: "app_numeria_studio"
    })
  );
  const mediaUploadJob = {
    id: "x_media_manual",
    mediaAssetId: "media_1",
    status: "manual_required",
    xMediaId: null
  };

  assert.equal(canCreateXPublishJob({ draftApproval, publishApproval, mediaUploadJob }), true);
});

test("approved image approval creates a media upload follow-up action", () => {
  const approval = approveRequest(
    createApprovalRequest({
      id: "approval_image_follow_up",
      type: "image_asset",
      title: "Image asset",
      relatedAppProjectId: "app_numeria_studio"
    })
  );
  const repository = {
    listMediaAssets: () => [
      {
        id: "media_numeria_day1",
        appProjectId: "app_numeria_studio",
        contentDraftId: "draft_x_numeria_day1",
        status: "waiting_approval"
      }
    ]
  };

  const followUpActions = createFollowUpActionsAfterApproval({ approval, repository });

  assert.equal(followUpActions.created.length, 1);
  assert.equal(followUpActions.created[0].type, "media_upload_job");
  assert.equal(followUpActions.created[0].job.mediaAssetId, "media_numeria_day1");
});

test("publish approval is blocked until media upload is ready", () => {
  const approval = approveRequest(
    createApprovalRequest({
      id: "approval_publish_follow_up",
      type: "publish_schedule",
      title: "Schedule X post",
      relatedAppProjectId: "app_numeria_studio"
    })
  );
  const repository = {
    listContentDrafts: () => [
      {
        id: "draft_x_numeria_day1",
        appProjectId: "app_numeria_studio",
        status: "waiting_approval"
      }
    ],
    listApprovals: () => [
      approveRequest(
        createApprovalRequest({
          id: "approval_draft_follow_up",
          type: "draft",
          title: "Draft",
          relatedAppProjectId: "app_numeria_studio"
        })
      )
    ],
    listMediaAssets: () => [
      {
        id: "media_numeria_day1",
        appProjectId: "app_numeria_studio",
        contentDraftId: "draft_x_numeria_day1",
        status: "waiting_approval"
      }
    ],
    listMediaUploadJobs: () => []
  };

  const followUpActions = createFollowUpActionsAfterApproval({ approval, repository });

  assert.equal(followUpActions.created.length, 0);
  assert.equal(followUpActions.blocked[0].reason, "media_upload_job_not_ready");
});

test("publish approval creates a publish job when draft and media gates are ready", () => {
  const approval = approveRequest(
    createApprovalRequest({
      id: "approval_publish_ready",
      type: "publish_schedule",
      title: "Schedule X post",
      relatedAppProjectId: "app_numeria_studio"
    })
  );
  const repository = {
    listContentDrafts: () => [
      {
        id: "draft_x_numeria_day1",
        appProjectId: "app_numeria_studio",
        status: "waiting_approval"
      }
    ],
    listApprovals: () => [
      approveRequest(
        createApprovalRequest({
          id: "approval_draft_ready",
          type: "draft",
          title: "Draft",
          relatedAppProjectId: "app_numeria_studio"
        })
      )
    ],
    listMediaAssets: () => [
      {
        id: "media_numeria_day1",
        appProjectId: "app_numeria_studio",
        contentDraftId: "draft_x_numeria_day1",
        status: "waiting_approval"
      }
    ],
    listMediaUploadJobs: () => [
      {
        id: "x_media_upload_media_numeria_day1",
        mediaAssetId: "media_numeria_day1",
        status: "uploaded",
        xMediaId: "x_media_123"
      }
    ]
  };

  const followUpActions = createFollowUpActionsAfterApproval({ approval, repository });

  assert.equal(followUpActions.created.length, 1);
  assert.equal(followUpActions.created[0].type, "publish_job");
  assert.equal(followUpActions.created[0].job.contentDraftId, "draft_x_numeria_day1");
});
