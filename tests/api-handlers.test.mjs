import assert from "node:assert/strict";
import test from "node:test";
import {
  handleApproveApproval,
  handleCreateMediaUploadJob,
  handleCreatePublishJob,
  handleRequestApprovalRevision
} from "../src/domain/api-handlers.mjs";

test("approve approval handler persists approval and media upload follow-up job", () => {
  const repository = createTestRepository({
    approvals: [
      {
        id: "approval_image",
        type: "image_asset",
        title: "Image asset",
        relatedAppProjectId: "app_numeria_studio",
        status: "pending",
        history: [{ status: "pending", reason: "created" }]
      }
    ],
    mediaAssets: [
      {
        id: "media_numeria_day1",
        appProjectId: "app_numeria_studio",
        contentDraftId: "draft_x_numeria_day1",
        status: "waiting_approval"
      }
    ]
  });

  const result = handleApproveApproval({
    approvalId: "approval_image",
    body: { reason: "CEO approved image" },
    repository
  });

  assert.equal(result.status, 200);
  assert.equal(result.body.approval.status, "approved");
  assert.equal(repository.getApprovalById("approval_image").status, "approved");
  assert.equal(result.body.followUpActions.created[0].type, "media_upload_job");
  assert.equal(repository.listMediaUploadJobs().length, 1);
});

test("approve approval handler returns not found for missing approval", () => {
  const repository = createTestRepository();

  const result = handleApproveApproval({
    approvalId: "missing",
    body: {},
    repository
  });

  assert.equal(result.status, 404);
  assert.equal(result.body.error, "approval_not_found");
});

test("approve approval handler returns conflict for already handled approval", () => {
  const repository = createTestRepository({
    approvals: [
      {
        id: "approval_done",
        type: "strategy",
        title: "Strategy",
        relatedAppProjectId: "app_numeria_studio",
        status: "approved",
        history: [{ status: "approved", reason: "already approved" }]
      }
    ]
  });

  const result = handleApproveApproval({
    approvalId: "approval_done",
    body: {},
    repository
  });

  assert.equal(result.status, 409);
  assert.match(result.body.error, /not pending/);
});

test("revision handler persists revision request", () => {
  const repository = createTestRepository({
    approvals: [
      {
        id: "approval_strategy",
        type: "strategy",
        title: "Strategy",
        relatedAppProjectId: "app_numeria_studio",
        status: "pending",
        history: [{ status: "pending", reason: "created" }]
      }
    ]
  });

  const result = handleRequestApprovalRevision({
    approvalId: "approval_strategy",
    body: { reason: "Need narrower target" },
    repository
  });

  assert.equal(result.status, 200);
  assert.equal(result.body.approval.status, "revision_requested");
  assert.equal(repository.getApprovalById("approval_strategy").status, "revision_requested");
});

test("media upload job handler persists job when image approval is approved", () => {
  const repository = createTestRepository({
    approvals: [
      {
        id: "approval_image",
        type: "image_asset",
        title: "Image",
        relatedAppProjectId: "app_numeria_studio",
        status: "approved",
        history: []
      }
    ],
    mediaAssets: [
      {
        id: "media_numeria_day1",
        appProjectId: "app_numeria_studio",
        contentDraftId: "draft_x_numeria_day1",
        status: "waiting_approval"
      }
    ]
  });

  const result = handleCreateMediaUploadJob({
    body: {
      mediaAssetId: "media_numeria_day1",
      imageApprovalId: "approval_image"
    },
    repository
  });

  assert.equal(result.status, 201);
  assert.equal(result.body.mediaUploadJob.status, "queued");
  assert.equal(repository.listMediaUploadJobs().length, 1);
});

test("media upload job handler blocks pending image approval", () => {
  const repository = createTestRepository({
    approvals: [
      {
        id: "approval_image",
        type: "image_asset",
        title: "Image",
        relatedAppProjectId: "app_numeria_studio",
        status: "pending",
        history: []
      }
    ],
    mediaAssets: [
      {
        id: "media_numeria_day1",
        appProjectId: "app_numeria_studio",
        contentDraftId: "draft_x_numeria_day1",
        status: "waiting_approval"
      }
    ]
  });

  const result = handleCreateMediaUploadJob({
    body: {
      mediaAssetId: "media_numeria_day1",
      imageApprovalId: "approval_image"
    },
    repository
  });

  assert.equal(result.status, 409);
  assert.match(result.body.error, /before image approval/);
});

test("publish job handler persists job when approvals and media are ready", () => {
  const repository = createTestRepository({
    approvals: [
      {
        id: "approval_draft",
        type: "draft",
        title: "Draft",
        relatedAppProjectId: "app_numeria_studio",
        status: "approved",
        history: []
      },
      {
        id: "approval_publish",
        type: "publish_schedule",
        title: "Publish",
        relatedAppProjectId: "app_numeria_studio",
        status: "approved",
        history: []
      }
    ],
    contentDrafts: [
      {
        id: "draft_x_numeria_day1",
        appProjectId: "app_numeria_studio",
        status: "waiting_approval"
      }
    ],
    mediaUploadJobs: [
      {
        id: "x_media_upload_media_numeria_day1",
        mediaAssetId: "media_numeria_day1",
        status: "uploaded",
        xMediaId: "x_media_123"
      }
    ]
  });

  const result = handleCreatePublishJob({
    body: {
      contentDraftId: "draft_x_numeria_day1",
      draftApprovalId: "approval_draft",
      publishApprovalId: "approval_publish",
      mediaUploadJobId: "x_media_upload_media_numeria_day1"
    },
    repository
  });

  assert.equal(result.status, 201);
  assert.equal(result.body.publishJob.status, "queued");
  assert.equal(repository.listPublishJobs().length, 1);
});

test("publish job handler returns missing draft approval", () => {
  const repository = createTestRepository({
    approvals: [
      {
        id: "approval_publish",
        type: "publish_schedule",
        title: "Publish",
        relatedAppProjectId: "app_numeria_studio",
        status: "approved",
        history: []
      }
    ],
    contentDrafts: [
      {
        id: "draft_x_numeria_day1",
        appProjectId: "app_numeria_studio",
        status: "waiting_approval"
      }
    ]
  });

  const result = handleCreatePublishJob({
    body: {
      contentDraftId: "draft_x_numeria_day1",
      draftApprovalId: "missing",
      publishApprovalId: "approval_publish"
    },
    repository
  });

  assert.equal(result.status, 404);
  assert.equal(result.body.error, "draft_approval_not_found");
});

function createTestRepository(seed = {}) {
  const approvals = seed.approvals ?? [];
  const mediaAssets = seed.mediaAssets ?? [];
  const mediaUploadJobs = seed.mediaUploadJobs ?? [];
  const publishJobs = seed.publishJobs ?? [];
  const contentDrafts = seed.contentDrafts ?? [];

  return {
    listApprovals: () => approvals,
    getApprovalById: (id) => approvals.find((item) => item.id === id) ?? null,
    saveApproval: (approval) => upsertById(approvals, approval),
    listMediaAssets: () => mediaAssets,
    getMediaAssetById: (id) => mediaAssets.find((item) => item.id === id) ?? null,
    listMediaUploadJobs: () => mediaUploadJobs,
    getMediaUploadJobById: (id) => mediaUploadJobs.find((item) => item.id === id) ?? null,
    saveMediaUploadJob: (job) => upsertById(mediaUploadJobs, job),
    listPublishJobs: () => publishJobs,
    savePublishJob: (job) => upsertById(publishJobs, job),
    listContentDrafts: () => contentDrafts,
    getContentDraftById: (id) => contentDrafts.find((item) => item.id === id) ?? null
  };
}

function upsertById(collection, record) {
  const index = collection.findIndex((item) => item.id === record.id);

  if (index === -1) {
    collection.push(record);
    return record;
  }

  collection[index] = record;
  return record;
}
