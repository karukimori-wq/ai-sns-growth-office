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
