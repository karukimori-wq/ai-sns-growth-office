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
