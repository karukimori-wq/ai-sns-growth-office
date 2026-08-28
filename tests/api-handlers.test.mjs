import assert from "node:assert/strict";
import test from "node:test";
import {
  handleApproveApproval,
  handleCancelCompanyTaskAsync,
  handleCreateCeoInstruction,
  handleCreateMediaUploadJob,
  handleCreatePublishJob,
  handleMarkMediaUploadManualReady,
  handleRequestApprovalRevision,
  handleUpdateEmployeeTaskStatus
} from "../src/domain/api-handlers.mjs";
import { handleCreatePublishApprovalRequest } from "../src/domain/publish-approval-request.mjs";

test("CEO instruction handler decomposes work and creates a draft", () => {
  const repository = createTestRepository();

  const result = handleCreateCeoInstruction({
    body: {
      id: "instruction_test_numeria",
      appProjectId: "app_numeria_studio",
      title: "Numeria Studio daily X",
      body: "Numeria StudioのX投稿を画像つきで作る",
      createdAt: "2026-08-25T09:00:00.000Z"
    },
    repository
  });

  assert.equal(result.status, 201);
  assert.equal(result.body.instruction.status, "decomposed");
  assert.equal(result.body.employeeTasks.length, 8);
  assert.equal(repository.listCeoInstructions().length, 1);
  assert.equal(repository.listEmployeeTasks().length, 8);
  assert.equal(repository.getContentDraftById("draft_x_instruction_test_numeria").status, "waiting_approval");
});

test("CEO instruction handler uses selected marketing content and objective", () => {
  const repository = createTestRepository({
    marketingContents: [
      {
        id: "content_event_test",
        type: "event",
        typeLabel: "イベント",
        name: "無料体験イベント",
        appProjectId: "app_numeria_studio",
        audiences: ["占いに興味がある人", "無料で試したい人"],
        imagePolicy: "無料体験の入口が分かる画像"
      }
    ]
  });

  const result = handleCreateCeoInstruction({
    body: {
      id: "instruction_event_test",
      marketingContentId: "content_event_test",
      objective: "無料体験につなげる",
      audience: "無料で試したい人",
      body: "イベントに来てほしい人へXで投稿セットを作る",
      createdAt: "2026-08-25T09:00:00.000Z"
    },
    repository
  });

  assert.equal(result.status, 201);
  assert.equal(result.body.instruction.marketingContentName, "無料体験イベント");
  assert.equal(result.body.instruction.objective, "無料体験につなげる");
  assert.equal(result.body.employeeTasks.some((task) => task.employeeName === "ハッシュタグAI"), true);
  assert.equal(result.body.employeeTasks.every((task) => task.marketingContentId === "content_event_test"), true);
  assert.equal(result.body.contentDraft.marketingContentName, "無料体験イベント");
  assert.match(result.body.contentDraft.body, /無料で試したい人/);
});

test("company task cancel handler persists stopped task", async () => {
  const repository = createTestRepository({
    companyTasks: [
      {
        id: "task_test",
        title: "Test task",
        owner: "秘書AI",
        priority: "high",
        priorityLabel: "高",
        dueLabel: "今日",
        status: "in_progress",
        statusLabel: "進行中"
      }
    ]
  });

  const result = await handleCancelCompanyTaskAsync({
    companyTaskId: "task_test",
    body: { reason: "stop from test" },
    repository
  });

  assert.equal(result.status, 200);
  assert.equal(result.body.task.status, "blocked");
  assert.equal(result.body.task.statusLabel, "中止");
  assert.equal(repository.listCompanyTasks()[0].cancelReason, "stop from test");
});

test("company task cancel handler blocks completed task", async () => {
  const repository = createTestRepository({
    companyTasks: [
      {
        id: "task_done",
        title: "Done task",
        owner: "秘書AI",
        priority: "medium",
        priorityLabel: "中",
        dueLabel: "今日",
        status: "completed",
        statusLabel: "完了"
      }
    ]
  });

  const result = await handleCancelCompanyTaskAsync({ companyTaskId: "task_done", repository });

  assert.equal(result.status, 409);
  assert.equal(result.body.error, "completed_company_task_cannot_be_cancelled");
});

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

test("approve approval handler materializes approved employee draft output", () => {
  const repository = createTestRepository({
    approvals: [
      {
        id: "approval_employee_task_draft",
        type: "draft",
        title: "Draft output",
        relatedAppProjectId: "app_numeria_studio",
        relatedEmployeeTaskId: "employee_task_draft",
        status: "pending",
        history: [{ status: "pending", reason: "created" }]
      }
    ],
    employeeTasks: [
      {
        id: "employee_task_draft",
        appProjectId: "app_numeria_studio",
        employeeName: "投稿制作AI",
        output: {
          id: "output_employee_task_draft",
          title: "X投稿下書き",
          summary: "無料チェックへ案内する投稿本文",
          items: ["CTA: 無料チェックを開始"],
          nextAction: "CEOが確認する",
          approvalRequired: true
        }
      }
    ]
  });

  const result = handleApproveApproval({
    approvalId: "approval_employee_task_draft",
    body: { reason: "draft approved" },
    repository
  });

  assert.equal(result.status, 200);
  assert.equal(result.body.materializedOutput.contentDraft.id, "draft_employee_task_draft");
  assert.equal(repository.getContentDraftById("draft_employee_task_draft").sourceApprovalId, "approval_employee_task_draft");
});

test("approve approval handler materializes approved employee image output before media upload follow-up", () => {
  const repository = createTestRepository({
    approvals: [
      {
        id: "approval_employee_task_image",
        type: "image_asset",
        title: "Image output",
        relatedAppProjectId: "app_numeria_studio",
        relatedEmployeeTaskId: "employee_task_image",
        status: "pending",
        history: [{ status: "pending", reason: "created" }]
      }
    ],
    contentDrafts: [
      {
        id: "draft_existing",
        appProjectId: "app_numeria_studio",
        status: "waiting_approval"
      }
    ],
    employeeTasks: [
      {
        id: "employee_task_image",
        appProjectId: "app_numeria_studio",
        employeeName: "画像方針AI",
        output: {
          id: "output_employee_task_image",
          title: "画像方針",
          summary: "白背景と数字で安心感を出す",
          items: ["中央にスマホを置く"],
          nextAction: "CEOが確認する",
          approvalRequired: true
        }
      }
    ]
  });

  const result = handleApproveApproval({
    approvalId: "approval_employee_task_image",
    body: { reason: "image approved" },
    repository
  });

  assert.equal(result.status, 200);
  assert.equal(result.body.materializedOutput.mediaAsset.id, "media_employee_task_image");
  assert.equal(repository.getMediaAssetById("media_employee_task_image").contentDraftId, "draft_existing");
  assert.equal(result.body.followUpActions.created[0].job.mediaAssetId, "media_employee_task_image");
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

test("employee task status handler persists progress updates", () => {
  const repository = createTestRepository({
    employeeTasks: [
      {
        id: "employee_task_strategy",
        employeeName: "SNS戦略AI",
        title: "投稿導線を設計",
        status: "queued",
        statusLabel: "未着手",
        progress: 0,
        outputType: "strategy"
      }
    ]
  });

  const result = handleUpdateEmployeeTaskStatus({
    employeeTaskId: "employee_task_strategy",
    body: {
      status: "waiting_approval",
      reason: "strategy draft ready",
      updatedAt: "2026-08-26T10:00:00.000Z"
    },
    repository
  });

  assert.equal(result.status, 200);
  assert.equal(result.body.employeeTask.status, "waiting_approval");
  assert.equal(result.body.employeeTask.statusLabel, "承認待ち");
  assert.equal(result.body.employeeTask.progress, 90);
  assert.equal(result.body.employeeTask.output.title, "購入導線設計");
  assert.equal(result.body.employeeTask.output.approvalRequired, true);
  assert.equal(result.body.approvalRequest.type, "strategy");
  assert.equal(result.body.approvalRequest.relatedEmployeeTaskId, "employee_task_strategy");
  assert.equal(repository.listEmployeeTasks()[0].statusReason, "strategy draft ready");
  assert.equal(repository.listApprovals().filter((approval) => approval.id === "approval_employee_task_strategy").length, 1);
});

test("employee task status handler preserves existing output", () => {
  const repository = createTestRepository({
    employeeTasks: [
      {
        id: "employee_task_existing_output",
        employeeName: "投稿制作AI",
        title: "X投稿下書きを作成",
        status: "waiting_approval",
        statusLabel: "承認待ち",
        progress: 90,
        outputType: "x_draft",
        output: {
          id: "output_employee_task_existing_output",
          title: "Existing output",
          summary: "Already generated",
          items: [],
          nextAction: "Review",
          approvalRequired: true
        }
      }
    ]
  });

  const result = handleUpdateEmployeeTaskStatus({
    employeeTaskId: "employee_task_existing_output",
    body: { status: "completed" },
    repository
  });

  assert.equal(result.status, 200);
  assert.equal(result.body.employeeTask.output.title, "Existing output");
  assert.equal(result.body.approvalRequest.type, "draft");
  assert.equal(repository.listApprovals().filter((approval) => approval.id === "approval_employee_task_existing_output").length, 1);
});

test("employee task status handler rejects invalid status", () => {
  const repository = createTestRepository({
    employeeTasks: [{ id: "employee_task_strategy", status: "queued" }]
  });

  const result = handleUpdateEmployeeTaskStatus({
    employeeTaskId: "employee_task_strategy",
    body: { status: "unknown" },
    repository
  });

  assert.equal(result.status, 409);
  assert.equal(result.body.error, "invalid_employee_task_status");
});

test("employee task status handler returns not found", () => {
  const repository = createTestRepository();

  const result = handleUpdateEmployeeTaskStatus({
    employeeTaskId: "missing",
    body: { status: "in_progress" },
    repository
  });

  assert.equal(result.status, 404);
  assert.equal(result.body.error, "employee_task_not_found");
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

test("manual media ready handler persists manual required upload job", () => {
  const repository = createTestRepository({
    mediaUploadJobs: [
      {
        id: "x_media_upload_manual",
        mediaAssetId: "media_numeria_day1",
        status: "queued",
        xMediaId: null
      }
    ]
  });

  const result = handleMarkMediaUploadManualReady({
    mediaUploadJobId: "x_media_upload_manual",
    body: { reason: "uploaded through X console" },
    repository
  });

  assert.equal(result.status, 200);
  assert.equal(result.body.mediaUploadJob.status, "manual_required");
  assert.equal(repository.getMediaUploadJobById("x_media_upload_manual").manualReason, "uploaded through X console");
  assert.equal(repository.getMediaUploadJobById("x_media_upload_manual").history.length, 1);
  assert.equal(repository.getMediaUploadJobById("x_media_upload_manual").history[0].status, "manual_required");
  assert.equal(repository.getMediaUploadJobById("x_media_upload_manual").history[0].reason, "uploaded through X console");
});

test("manual media ready handler creates publish approval when draft and media gates are ready", () => {
  const repository = createTestRepository({
    approvals: [
      {
        id: "approval_draft_ready",
        type: "draft",
        title: "Draft",
        relatedAppProjectId: "app_numeria_studio",
        status: "approved",
        history: []
      }
    ],
    contentDrafts: [
      {
        id: "draft_ready",
        appProjectId: "app_numeria_studio",
        status: "waiting_approval",
        title: "Ready draft"
      }
    ],
    mediaAssets: [
      {
        id: "media_ready",
        appProjectId: "app_numeria_studio",
        contentDraftId: "draft_ready",
        status: "waiting_approval"
      }
    ],
    mediaUploadJobs: [
      {
        id: "x_media_upload_ready",
        mediaAssetId: "media_ready",
        status: "queued",
        xMediaId: null
      }
    ]
  });

  const result = handleMarkMediaUploadManualReady({
    mediaUploadJobId: "x_media_upload_ready",
    body: { reason: "manual media ready" },
    repository
  });

  assert.equal(result.status, 200);
  assert.equal(result.body.approvalRequest.type, "publish_schedule");
  assert.equal(result.body.approvalRequest.relatedContentDraftId, "draft_ready");
  assert.equal(repository.listApprovals().filter((approval) => approval.type === "publish_schedule").length, 1);
});

test("publish approval request handler creates approval for selected ready draft and media pair", () => {
  const repository = createTestRepository({
    approvals: [
      {
        id: "approval_draft_selected",
        type: "draft",
        title: "Draft",
        relatedAppProjectId: "app_numeria_studio",
        status: "approved",
        history: []
      }
    ],
    contentDrafts: [
      {
        id: "draft_selected",
        appProjectId: "app_numeria_studio",
        status: "waiting_approval",
        title: "Selected draft"
      }
    ],
    mediaAssets: [
      {
        id: "media_selected",
        appProjectId: "app_numeria_studio",
        contentDraftId: "draft_selected",
        status: "waiting_approval"
      }
    ],
    mediaUploadJobs: [
      {
        id: "x_media_upload_selected",
        mediaAssetId: "media_selected",
        status: "manual_required",
        xMediaId: null
      }
    ]
  });

  const result = handleCreatePublishApprovalRequest({
    body: {
      contentDraftId: "draft_selected",
      mediaAssetId: "media_selected",
      scheduledFor: "21:00"
    },
    repository
  });

  assert.equal(result.status, 201);
  assert.equal(result.body.approvalRequest.type, "publish_schedule");
  assert.equal(result.body.approvalRequest.relatedContentDraftId, "draft_selected");
  assert.equal(result.body.approvalRequest.relatedMediaAssetId, "media_selected");
  assert.equal(result.body.approvalRequest.scheduledFor, "21:00");
  assert.equal(repository.listApprovals().filter((approval) => approval.type === "publish_schedule").length, 1);
});

test("publish approval request handler blocks mismatched draft and media pair", () => {
  const repository = createTestRepository({
    approvals: [
      {
        id: "approval_draft_mismatch",
        type: "draft",
        title: "Draft",
        relatedAppProjectId: "app_numeria_studio",
        status: "approved",
        history: []
      }
    ],
    contentDrafts: [
      {
        id: "draft_mismatch",
        appProjectId: "app_numeria_studio",
        status: "waiting_approval",
        title: "Mismatch draft"
      }
    ],
    mediaAssets: [
      {
        id: "media_mismatch",
        appProjectId: "app_numeria_studio",
        contentDraftId: "another_draft",
        status: "waiting_approval"
      }
    ],
    mediaUploadJobs: [
      {
        id: "x_media_upload_mismatch",
        mediaAssetId: "media_mismatch",
        status: "manual_required",
        xMediaId: null
      }
    ]
  });

  const result = handleCreatePublishApprovalRequest({
    body: {
      contentDraftId: "draft_mismatch",
      mediaAssetId: "media_mismatch"
    },
    repository
  });

  assert.equal(result.status, 409);
  assert.equal(result.body.error, "media_asset_does_not_match_content_draft");
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
  const ceoInstructions = seed.ceoInstructions ?? [];
  const employeeTasks = seed.employeeTasks ?? [];
  const companyTasks = seed.companyTasks ?? [];
  const marketingContents = seed.marketingContents ?? [];

  return {
    listCompanyTasks: () => companyTasks,
    saveCompanyTask: (task) => upsertById(companyTasks, task),
    listCeoInstructions: () => ceoInstructions,
    saveCeoInstruction: (instruction) => upsertById(ceoInstructions, instruction),
    listEmployeeTasks: () => employeeTasks,
    saveEmployeeTask: (task) => upsertById(employeeTasks, task),
    listApprovals: () => approvals,
    getApprovalById: (id) => approvals.find((item) => item.id === id) ?? null,
    saveApproval: (approval) => upsertById(approvals, approval),
    listMarketingContents: () => marketingContents,
    getMarketingContentById: (id) => marketingContents.find((item) => item.id === id) ?? null,
    saveMarketingContent: (content) => upsertById(marketingContents, content),
    listMediaAssets: () => mediaAssets,
    getMediaAssetById: (id) => mediaAssets.find((item) => item.id === id) ?? null,
    saveMediaAsset: (asset) => upsertById(mediaAssets, asset),
    listMediaUploadJobs: () => mediaUploadJobs,
    getMediaUploadJobById: (id) => mediaUploadJobs.find((item) => item.id === id) ?? null,
    saveMediaUploadJob: (job) => upsertById(mediaUploadJobs, job),
    listPublishJobs: () => publishJobs,
    savePublishJob: (job) => upsertById(publishJobs, job),
    listContentDrafts: () => contentDrafts,
    getContentDraftById: (id) => contentDrafts.find((item) => item.id === id) ?? null,
    saveContentDraft: (draft) => upsertById(contentDrafts, draft),
    listPerformanceSnapshots: () => []
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
