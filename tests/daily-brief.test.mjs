import assert from "node:assert/strict";
import test from "node:test";
import {
  createBuyPathChecklist,
  createCeoConfirmationAgenda,
  createCeoDailyBrief
} from "../src/domain/daily-brief.mjs";

test("buy path checklist evaluates the seven route stages", () => {
  const checklist = createBuyPathChecklist({
    draft: {
      id: "draft_check",
      title: "現在地を知る",
      body: "何から始めればいいか分からない人は、現在地を整理する必要があります。",
      cta: "無料チェックへ"
    },
    approvals: [{ type: "draft", status: "approved" }],
    mediaAssets: [{ contentDraftId: "draft_check" }]
  });

  assert.equal(checklist.length, 7);
  assert.equal(checklist.find((stage) => stage.id === "awareness").status, "ready");
  assert.equal(checklist.find((stage) => stage.id === "purchase").status, "needs_work");
});

test("CEO daily brief summarizes approvals, active tasks, route gaps, and content angles", () => {
  const brief = createCeoDailyBrief({
    date: "2026-08-25",
    appProject: { id: "app_numeria_studio", name: "Numeria Studio" },
    approvals: [{ id: "approval_pending", type: "draft", status: "pending" }],
    employeeTasks: [{ id: "task_draft", status: "waiting_approval", outputType: "x_draft" }],
    contentDrafts: [
      {
        id: "draft_daily",
        appProjectId: "app_numeria_studio",
        title: "無料チェック",
        body: "分からない状態を整理する必要があります。",
        cta: "無料チェックへ"
      }
    ],
    mediaAssets: [{ contentDraftId: "draft_daily" }],
    performanceSnapshots: [
      {
        id: "perf_daily",
        appProjectId: "app_numeria_studio",
        metrics: {
          impressions: 1000,
          profile_visits: 30,
          follows: 4,
          cta_clicks: 5,
          landing_page_visits: 2,
          trial_or_signup_count: 0
        }
      }
    ]
  });

  assert.equal(brief.appProjectName, "Numeria Studio");
  assert.equal(brief.pendingApprovalCount, 1);
  assert.equal(brief.activeTaskCount, 1);
  assert.ok(brief.priorities.some((priority) => priority.includes("承認待ち")));
  assert.ok(brief.buyPathChecklist.length > 0);
  assert.ok(brief.confirmationAgenda.length > 0);
  assert.ok(brief.recommendedContentAngles.length > 0);
});

test("CEO confirmation agenda ranks approvals, blockers, route gaps, and performance warnings", () => {
  const agenda = createCeoConfirmationAgenda({
    appProject: { id: "app_numeria_studio", name: "Numeria Studio" },
    approvals: [
      {
        id: "approval_publish",
        type: "publish_schedule",
        title: "本日20時の公開予約",
        relatedAppProjectId: "app_numeria_studio",
        status: "pending"
      },
      {
        id: "approval_other",
        type: "draft",
        title: "Velvet draft",
        relatedAppProjectId: "app_velvet",
        status: "pending"
      }
    ],
    employeeTasks: [
      {
        id: "task_waiting",
        appProjectId: "app_numeria_studio",
        title: "画像案確認",
        assignee: "投稿制作AI",
        status: "waiting_approval"
      }
    ],
    contentDrafts: [
      {
        id: "draft_gap",
        appProjectId: "app_numeria_studio",
        title: "無料チェック",
        body: "何から始めればいいか分からない人へ。",
        cta: ""
      }
    ],
    mediaAssets: [],
    performanceSnapshots: [
      {
        id: "perf_warning",
        appProjectId: "app_numeria_studio",
        metrics: {
          impressions: 1000,
          profile_visits: 30,
          cta_clicks: 2,
          landing_page_visits: 0,
          trial_or_signup_count: 0
        }
      }
    ]
  });

  assert.equal(agenda[0].priority, "high");
  assert.equal(agenda.some((item) => item.sourceId === "approval_other"), false);
  assert.ok(agenda.some((item) => item.type === "approval"));
  assert.ok(agenda.some((item) => item.type === "task_blocker"));
  assert.ok(agenda.some((item) => item.type === "buy_path_gap"));
  assert.ok(agenda.some((item) => item.type === "performance_warning"));
});
