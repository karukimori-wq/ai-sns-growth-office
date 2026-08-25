import { createPerformanceRecommendation } from "./workflow.mjs";

export const buyPathStages = [
  ["awareness", "知らない", "集客投稿"],
  ["interest", "気になる", "痛み・未来・思い込み破壊"],
  ["need", "自分に必要だと思う", "教育投稿"],
  ["trust", "あなたから使いたい", "証拠・思想投稿"],
  ["action", "実行する", "CTA"],
  ["purchase", "買う", "販売投稿"],
  ["repeat", "リピート・紹介", "成果・改善投稿"]
].map(([id, label, requiredContentRole]) => ({ id, label, requiredContentRole }));

export function createBuyPathChecklist({ draft, approvals = [], mediaAssets = [] }) {
  const approvedTypes = new Set(approvals.filter((approval) => approval.status === "approved").map((approval) => approval.type));
  const hasMediaAsset = mediaAssets.some((asset) => asset.contentDraftId === draft?.id);

  return buyPathStages.map((stage) => ({
    ...stage,
    status: isStageReady({ stageId: stage.id, draft, approvedTypes, hasMediaAsset }) ? "ready" : "needs_work"
  }));
}

export function createCeoDailyBrief({
  date = new Date().toISOString().slice(0, 10),
  appProject,
  approvals = [],
  employeeTasks = [],
  contentDrafts = [],
  mediaAssets = [],
  performanceSnapshots = []
} = {}) {
  const pendingApprovals = approvals.filter((approval) => approval.status === "pending");
  const activeTasks = employeeTasks.filter((task) => ["queued", "in_progress", "waiting_approval"].includes(task.status));
  const draft = contentDrafts.find((item) => item.appProjectId === appProject?.id) ?? contentDrafts[0] ?? null;
  const snapshot =
    performanceSnapshots.find((item) => item.appProjectId === appProject?.id) ?? performanceSnapshots[0] ?? null;
  const recommendation = snapshot ? createPerformanceRecommendation({ snapshot }) : null;
  const checklist = draft ? createBuyPathChecklist({ draft, approvals, mediaAssets }) : [];
  const weakStage = checklist.find((stage) => stage.status === "needs_work");
  const operationGates = createOperationGates({
    appProject,
    approvals,
    employeeTasks,
    contentDrafts,
    mediaAssets
  });
  const confirmationAgenda = createCeoConfirmationAgenda({
    approvals,
    employeeTasks,
    contentDrafts,
    mediaAssets,
    performanceSnapshots,
    appProject
  });

  return {
    date,
    appProjectId: appProject?.id ?? "app_numeria_studio",
    appProjectName: appProject?.name ?? "Numeria Studio",
    summary: `承認待ち${pendingApprovals.length}件、稼働タスク${activeTasks.length}件。`,
    priorities: [
      pendingApprovals.length > 0 ? `承認待ち${pendingApprovals.length}件を処理する` : null,
      recommendation?.severity === "warning" ? recommendation.recommendation : null,
      weakStage ? `${weakStage.label}段階を補強する${weakStage.requiredContentRole}を作る` : null
    ].filter(Boolean),
    buyPathChecklist: checklist,
    operationGates,
    confirmationAgenda,
    recommendedContentAngles: [
      recommendation?.stage === "attention_to_profile"
        ? "投稿冒頭で、占いに興味はあるが一歩目が分からない人へ明確に呼びかける"
        : null,
      weakStage ? `${weakStage.requiredContentRole}で、次の行動までの道を明確にする` : null,
      "無料チェック後に何が分かるかを1投稿1メッセージで説明する"
    ].filter(Boolean),
    pendingApprovalCount: pendingApprovals.length,
    activeTaskCount: activeTasks.length,
    latestDraftId: draft?.id ?? null,
    latestPerformanceSnapshotId: snapshot?.id ?? null
  };
}

export function createOperationGates({
  appProject,
  approvals = [],
  employeeTasks = [],
  contentDrafts = [],
  mediaAssets = []
} = {}) {
  const appProjectId = appProject?.id ?? "app_numeria_studio";
  const projectApprovals = approvals.filter((approval) => approval.relatedAppProjectId === appProjectId);
  const projectTasks = employeeTasks.filter((task) => task.appProjectId === appProjectId);
  const draft = contentDrafts.find((item) => item.appProjectId === appProjectId) ?? null;
  const mediaAsset = draft ? mediaAssets.find((asset) => asset.contentDraftId === draft.id) : null;
  const approvalStatus = (type) => projectApprovals.find((approval) => approval.type === type)?.status ?? "missing";

  const gates = [
    {
      id: "gate_strategy",
      label: "戦略承認",
      status: gateStatus(approvalStatus("strategy") === "approved"),
      blocker: approvalStatus("strategy") === "approved" ? null : "ターゲットと購入導線の方向性が未承認です。",
      nextAction: "SNS戦略AIの提案を承認または差し戻しする"
    },
    {
      id: "gate_draft",
      label: "投稿下書き",
      status: gateStatus(Boolean(draft) && approvalStatus("draft") === "approved"),
      blocker: approvalStatus("draft") === "approved" ? null : "投稿本文が公開判断まで進んでいません。",
      nextAction: "投稿制作AIの下書きを確認する"
    },
    {
      id: "gate_media",
      label: "画像準備",
      status: gateStatus(Boolean(mediaAsset) && approvalStatus("image_asset") === "approved"),
      blocker: approvalStatus("image_asset") === "approved" ? null : "画像案が未承認です。",
      nextAction: "画像案を承認または再生成指示する"
    },
    {
      id: "gate_publish",
      label: "公開予約",
      status: gateStatus(approvalStatus("publish_schedule") === "approved"),
      blocker: approvalStatus("publish_schedule") === "approved" ? null : "公開日時が未承認です。",
      nextAction: "公開時刻と公開可否を決める"
    }
  ];

  return {
    appProjectId,
    gates,
    blockedGateCount: gates.filter((gate) => gate.status === "blocked").length,
    waitingTaskCount: projectTasks.filter((task) => task.status === "waiting_approval").length,
    readyForPublish: gates.every((gate) => gate.status === "ready")
  };
}

export function createCeoConfirmationAgenda({
  approvals = [],
  employeeTasks = [],
  contentDrafts = [],
  mediaAssets = [],
  performanceSnapshots = [],
  appProject
} = {}) {
  const appProjectId = appProject?.id ?? "app_numeria_studio";
  const pendingApprovals = approvals
    .filter((approval) => approval.status === "pending" && approval.relatedAppProjectId === appProjectId)
    .map((approval) => ({
      id: `confirm_${approval.id}`,
      sourceId: approval.id,
      type: "approval",
      priority: priorityForApprovalType(approval.type),
      owner: "社長",
      title: approval.title,
      reason: reasonForApprovalType(approval.type),
      suggestedDecision: suggestedDecisionForApprovalType(approval.type)
    }));

  const blockedTasks = employeeTasks
    .filter((task) => task.appProjectId === appProjectId && task.status === "waiting_approval")
    .map((task) => ({
      id: `confirm_${task.id}`,
      sourceId: task.id,
      type: "task_blocker",
      priority: "high",
      owner: task.assignee ?? "秘書AI",
      title: task.title ?? "承認待ちタスク",
      reason: "担当AIの作業が社長確認で止まっています。",
      suggestedDecision: "承認、差し戻し、または優先度変更を決める"
    }));

  const draft = contentDrafts.find((item) => item.appProjectId === appProjectId) ?? contentDrafts[0] ?? null;
  const routeGaps = draft
    ? createBuyPathChecklist({ draft, approvals, mediaAssets })
        .filter((stage) => stage.status === "needs_work")
        .slice(0, 2)
        .map((stage) => ({
          id: `confirm_route_${stage.id}`,
          sourceId: draft.id,
          type: "buy_path_gap",
          priority: stage.id === "action" || stage.id === "purchase" ? "high" : "medium",
          owner: "SNS戦略AI",
          title: `${stage.label}段階の補強`,
          reason: `${stage.requiredContentRole}が弱く、投稿から購入までの道が途切れています。`,
          suggestedDecision: `${stage.requiredContentRole}を追加制作するか決める`
        }))
    : [];

  const performanceSnapshot =
    performanceSnapshots.find((item) => item.appProjectId === appProjectId) ?? performanceSnapshots[0] ?? null;
  const performanceRecommendation = performanceSnapshot
    ? createPerformanceRecommendation({ snapshot: performanceSnapshot })
    : null;
  const performanceItem =
    performanceRecommendation?.severity === "warning"
      ? [
          {
            id: `confirm_performance_${performanceSnapshot.id}`,
            sourceId: performanceSnapshot.id,
            type: "performance_warning",
            priority: "high",
            owner: "顧客分析AI",
            title: performanceRecommendation.title,
            reason: performanceRecommendation.recommendation,
            suggestedDecision: "次の投稿で改善する指標を1つに絞る"
          }
        ]
      : [];

  return [...pendingApprovals, ...blockedTasks, ...routeGaps, ...performanceItem]
    .sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority))
    .slice(0, 8);
}

export function createSecretaryDispatchPlan({
  appProject,
  approvals = [],
  employeeTasks = [],
  contentDrafts = [],
  mediaAssets = [],
  performanceSnapshots = []
} = {}) {
  const appProjectId = appProject?.id ?? "app_numeria_studio";
  const appProjectName = appProject?.name ?? "Numeria Studio";
  const agenda = createCeoConfirmationAgenda({
    appProject,
    approvals,
    employeeTasks,
    contentDrafts,
    mediaAssets,
    performanceSnapshots
  });
  const draft = contentDrafts.find((item) => item.appProjectId === appProjectId) ?? contentDrafts[0] ?? null;
  const checklist = draft ? createBuyPathChecklist({ draft, approvals, mediaAssets }) : [];
  const needsWorkStages = checklist.filter((stage) => stage.status === "needs_work");
  const pendingApprovals = approvals.filter(
    (approval) => approval.relatedAppProjectId === appProjectId && approval.status === "pending"
  );

  return {
    appProjectId,
    appProjectName,
    dispatches: [
      {
        id: "dispatch_secretary_ceo_confirmation",
        assignee: "秘書AI",
        priority: agenda.some((item) => item.priority === "high") ? "high" : "medium",
        instruction: `社長への確認事項${agenda.length}件を優先順に提示し、承認・差し戻し・保留の判断を回収する。`,
        expectedOutput: "CEO confirmation agenda"
      },
      {
        id: "dispatch_sns_strategy_buy_path",
        assignee: "SNS戦略AI",
        priority: needsWorkStages.length > 0 ? "high" : "low",
        instruction:
          needsWorkStages.length > 0
            ? `${needsWorkStages[0].label}段階を補強する${needsWorkStages[0].requiredContentRole}を1本設計する。`
            : "現在の購入導線を維持し、次の改善候補を1つだけ出す。",
        expectedOutput: "buy path improvement brief"
      },
      {
        id: "dispatch_content_next_draft",
        assignee: "投稿制作AI",
        priority: draft ? "medium" : "high",
        instruction: draft
          ? "既存下書きを社長確認の判断材料に沿って修正候補つきで整理する。"
          : `${appProjectName}向けの日本語X投稿下書きを画像案つきで1本作る。`,
        expectedOutput: "x post draft with image prompt"
      },
      {
        id: "dispatch_customer_analysis_metrics",
        assignee: "顧客分析AI",
        priority: performanceSnapshots.length > 0 ? "medium" : "high",
        instruction: "表示、プロフィール、CTA、LP、登録のどこで止まっているかを1つに絞って報告する。",
        expectedOutput: "single bottleneck recommendation"
      }
    ],
    gates: {
      pendingApprovalCount: pendingApprovals.length,
      needsWorkStageCount: needsWorkStages.length,
      canPreparePublish: pendingApprovals.some((approval) => approval.type === "publish_schedule")
    }
  };
}

function gateStatus(condition) {
  return condition ? "ready" : "blocked";
}

function isStageReady({ stageId, draft, approvedTypes, hasMediaAsset }) {
  if (!draft) return false;
  if (stageId === "awareness") return Boolean(draft.title && draft.body);
  if (stageId === "interest") return includesAny(draft.body, ["分からない", "悩み", "不安", "変えたい", "現在地"]);
  if (stageId === "need") return includesAny(draft.body, ["原因", "先", "整理", "見直", "必要"]);
  if (stageId === "trust") return hasMediaAsset || approvedTypes.has("strategy");
  if (stageId === "action") return Boolean(draft.cta);
  if (stageId === "purchase") return approvedTypes.has("publish_schedule");
  if (stageId === "repeat") return approvedTypes.has("draft") && approvedTypes.has("publish_schedule");
  return false;
}

function includesAny(text = "", keywords) {
  return keywords.some((keyword) => text.includes(keyword));
}

function priorityForApprovalType(type) {
  if (type === "publish_schedule") return "high";
  if (type === "draft" || type === "image_asset") return "medium";
  return "low";
}

function priorityRank(priority) {
  return { high: 0, medium: 1, low: 2 }[priority] ?? 3;
}

function reasonForApprovalType(type) {
  if (type === "strategy") return "戦略承認後に投稿導線と制作タスクが進みます。";
  if (type === "draft") return "投稿下書きの承認後に画像・公開準備へ進めます。";
  if (type === "image_asset") return "画像承認後にX用メディア準備へ進めます。";
  if (type === "publish_schedule") return "公開時刻の承認後に公開予約ジョブを作れます。";
  return "社長判断が必要です。";
}

function suggestedDecisionForApprovalType(type) {
  if (type === "publish_schedule") return "本日公開するか、公開時刻を変更するか決める";
  if (type === "draft") return "この文面で進めるか、訴求を差し替えるか決める";
  if (type === "image_asset") return "この画像で進めるか、再生成するか決める";
  if (type === "strategy") return "対象者と導線の方向性を承認する";
  return "承認または差し戻しを決める";
}
