import {
  appProjects,
  approvalRequests,
  ceoInstructions,
  companyTasks,
  contentDrafts,
  dashboardStats,
  employeeTasks,
  employees,
  mediaAssets,
  mediaUploadJobs,
  marketingContents,
  performanceSnapshots,
  publishJobs,
  todaySchedule
} from "../../src/domain/seed.mjs";
import {
  createCeoDailyBrief,
  createCeoOperatingSnapshot,
  createSecretaryDispatchPlan
} from "../../src/domain/daily-brief.mjs";
import { createRepositoryReadinessReport } from "../../src/domain/repository-readiness.mjs";
import { getRepositoryRuntime } from "../../src/domain/repository-runtime.mjs";
import {
  calculateBottleneckRates,
  createPerformanceActionPlan,
  normalizeDailyMetrics
} from "../../src/domain/workflow.mjs";
import type { CompanyTask } from "../components/company-task-board";

export type SnapshotNextAction = { id: string; owner: string; title: string; action: string };
export type ApprovalPolicy = {
  id: string;
  label: string;
  owner: string;
  decisionMode: "approval" | "delegated";
  reason: string;
};
export type AppProject = { id: string; name: string };
export type CeoInstruction = { id: string; appProjectId?: string; title: string; body: string; decompositionSummary: string };
export type ContentDraft = {
  id: string;
  title: string;
  body: string;
  cta: string;
  imagePrompt?: string;
};
export type MarketingContent = {
  id: string;
  type: string;
  typeLabel: string;
  name: string;
  appProjectId?: string;
  status: string;
  summary: string;
  explanation: string;
  audiences: string[];
  defaultObjectives: string[];
  imagePolicy: string;
  driveFolder?: {
    provider: string;
    name: string;
    path: string;
    url: string;
    autoCreateRequested?: boolean;
  };
  links?: Array<{ label: string; url: string }>;
};
export type DispatchItem = { id: string; priority: string; assignee: string; instruction: string; expectedOutput: string };
export type ConfirmationAgendaItem = {
  id: string;
  sourceId?: string;
  type?: string;
  title: string;
  reason: string;
  suggestedDecision: string;
  priority: string;
};
export type BuyPathStage = { id: string; label: string; requiredContentRole: string; status: string };
export type OperationGate = { id: string; label: string; status: string; blocker?: string; nextAction: string };
export type PerformanceAction = { id: string; owner: string; priority: string; title: string; action: string; reason: string };
type ExecutionHistoryEntry = {
  status: string;
  reason?: string | null;
  occurredAt?: string | null;
  publishResultUrl?: string | null;
};
export type ApprovalRequest = {
  id: string;
  type: string;
  title: string;
  reason: string;
  status: string;
  history: Array<{ status: string; reason: string }>;
  relatedEmployeeTaskId?: string;
};
export type MediaUploadJob = {
  id: string;
  mediaAssetId: string;
  status: string;
  xMediaId?: string | null;
  manualReason?: string;
  history?: ExecutionHistoryEntry[];
};
export type PublishJob = {
  id: string;
  contentDraftId: string;
  mediaUploadJobId?: string | null;
  scheduledFor?: string | null;
  publishedAt?: string | null;
  publishResultUrl?: string | null;
  manualReason?: string | null;
  cancelReason?: string | null;
  status: string;
  history?: ExecutionHistoryEntry[];
};
export type PerformanceActionPlan = {
  snapshotId: string;
  date: string;
  actions: PerformanceAction[];
};
export type PerformanceSnapshot = {
  id: string;
  appProjectId?: string;
  channel?: string;
  date: string;
  metrics: Record<string, number | string | null>;
};
export type DailyBrief = {
  summary: string;
  priorities: string[];
  confirmationAgenda: ConfirmationAgendaItem[];
  buyPathChecklist: BuyPathStage[];
  operationGates: {
    readyForPublish: boolean;
    blockedGateCount: number;
    gates: OperationGate[];
  };
  recommendedContentAngles: string[];
};

export type CeoOperatingSnapshot = {
  appProjectName: string;
  executiveSummary: string;
  status: string;
  metrics: {
    pendingApprovalCount: number;
    blockedGateCount: number;
  };
  nextActions: Array<SnapshotNextAction | null>;
};

export async function loadDashboardData() {
  const { repository, status } = getRepositoryRuntime();
  const [
    repositoryReadiness,
    persistedAppProjects,
    persistedMarketingContents,
    persistedApprovals,
    persistedCeoInstructions,
    persistedCompanyTasks,
    persistedEmployeeTasks,
    persistedContentDrafts,
    persistedMediaAssets,
    persistedMediaUploadJobs,
    persistedPublishJobs,
    persistedPerformanceSnapshots
  ] = await Promise.all([
    createRepositoryReadinessReport({ repository, status }),
    repository.listAppProjects(),
    repository.listMarketingContents(),
    repository.listApprovals(),
    repository.listCeoInstructions(),
    repository.listCompanyTasks(),
    repository.listEmployeeTasks(),
    repository.listContentDrafts(),
    repository.listMediaAssets(),
    repository.listMediaUploadJobs(),
    repository.listPublishJobs(),
    repository.listPerformanceSnapshots()
  ]);

  const dashboardAppProjects = (persistedAppProjects.length > 0 ? persistedAppProjects : appProjects) as AppProject[];
  const dashboardMarketingContents = (
    persistedMarketingContents.length > 0 ? persistedMarketingContents : marketingContents
  ) as MarketingContent[];
  const dashboardApprovals = (persistedApprovals.length > 0 ? persistedApprovals : approvalRequests) as ApprovalRequest[];
  const dashboardCeoInstructions = (
    persistedCeoInstructions.length > 0 ? persistedCeoInstructions : ceoInstructions
  ) as CeoInstruction[];
  const dashboardCompanyTasks = (persistedCompanyTasks.length > 0 ? persistedCompanyTasks : companyTasks) as CompanyTask[];
  const dashboardEmployeeTasks = persistedEmployeeTasks.length > 0 ? persistedEmployeeTasks : employeeTasks;
  const dashboardContentDrafts = (persistedContentDrafts.length > 0 ? persistedContentDrafts : contentDrafts) as ContentDraft[];
  const dashboardMediaAssets = persistedMediaAssets.length > 0 ? persistedMediaAssets : mediaAssets;
  const dashboardMediaUploadJobs = (persistedMediaUploadJobs.length > 0 ? persistedMediaUploadJobs : mediaUploadJobs) as MediaUploadJob[];
  const dashboardPublishJobs = (persistedPublishJobs.length > 0 ? persistedPublishJobs : publishJobs) as PublishJob[];
  const dashboardPerformanceSnapshots =
    persistedPerformanceSnapshots.length > 0 ? persistedPerformanceSnapshots : performanceSnapshots;
  const activeAppProject =
    dashboardAppProjects.find((project) => project.id === "app_numeria_studio") ??
    dashboardAppProjects[0] ??
    appProjects[0];
  const dailyBrief = createCeoDailyBrief({
    appProject: activeAppProject,
    approvals: dashboardApprovals,
    employeeTasks: dashboardEmployeeTasks,
    contentDrafts: dashboardContentDrafts,
    mediaAssets: dashboardMediaAssets,
    performanceSnapshots: dashboardPerformanceSnapshots
  }) as DailyBrief;
  const secretaryDispatchPlan = createSecretaryDispatchPlan({
    appProject: activeAppProject,
    approvals: dashboardApprovals,
    employeeTasks: dashboardEmployeeTasks,
    contentDrafts: dashboardContentDrafts,
    mediaAssets: dashboardMediaAssets,
    performanceSnapshots: dashboardPerformanceSnapshots
  }) as { dispatches: DispatchItem[] };
  const ceoOperatingSnapshot = createCeoOperatingSnapshot({
    appProject: activeAppProject,
    approvals: dashboardApprovals,
    employeeTasks: dashboardEmployeeTasks,
    contentDrafts: dashboardContentDrafts,
    mediaAssets: dashboardMediaAssets,
    performanceSnapshots: dashboardPerformanceSnapshots
  }) as CeoOperatingSnapshot;
  const snapshotNextActions = ceoOperatingSnapshot.nextActions.filter(
    (action: SnapshotNextAction | null): action is SnapshotNextAction => Boolean(action)
  );
  const latestPerformance = dashboardPerformanceSnapshots[0] as PerformanceSnapshot;
  const metrics = normalizeDailyMetrics(latestPerformance.metrics);
  const rates = calculateBottleneckRates(metrics);
  const performanceActionPlan = createPerformanceActionPlan({ snapshot: latestPerformance, metrics }) as PerformanceActionPlan;
  const pendingApprovalCount = dashboardApprovals.filter((approval) => approval.status === "pending").length;
  const waitingForCeoCount = pendingApprovalCount;
  const approvalPolicies: ApprovalPolicy[] = [
    {
      id: "target_and_route_strategy",
      label: "ターゲット・悩み・導線方針",
      owner: "SNS戦略AI",
      decisionMode: "approval",
      reason: "誰に届けるか、無料導線へどう進めるかは会社の方針なので社長承認。"
    },
    {
      id: "x_post_draft",
      label: "X投稿本文・CTA",
      owner: "投稿制作AI",
      decisionMode: "approval",
      reason: "公開前に言葉と誘導先を確認する。"
    },
    {
      id: "image_direction",
      label: "画像方針・投稿画像案",
      owner: "画像方針AI",
      decisionMode: "approval",
      reason: "ブランドの見え方に関わるため、初期運用では社長確認。"
    },
    {
      id: "publish_execution",
      label: "公開予約・投稿実行",
      owner: "運用AI",
      decisionMode: "approval",
      reason: "外部SNSへの公開は実行前に確認する。"
    },
    {
      id: "target_research",
      label: "対象読者の調査・候補出し",
      owner: "ターゲット分析AI",
      decisionMode: "delegated",
      reason: "材料集めはAI社員へ委任し、方針化した時点で承認へ回す。"
    },
    {
      id: "pain_research",
      label: "悩み・反応ワード抽出",
      owner: "悩み分析AI",
      decisionMode: "delegated",
      reason: "社長判断前の作業材料としてAI社員が進める。"
    },
    {
      id: "hashtags",
      label: "ハッシュタグ候補",
      owner: "ハッシュタグAI",
      decisionMode: "delegated",
      reason: "投稿セットの補助要素なのでAI社員へ委任する。"
    },
    {
      id: "analytics",
      label: "反応分析・日次指標確認",
      owner: "分析AI",
      decisionMode: "delegated",
      reason: "数値の記録と一次分析はAI社員が進め、改善案だけ社長確認へ回す。"
    },
    {
      id: "operation_logging",
      label: "承認済み成果物の運用記録",
      owner: "運用AI",
      decisionMode: "delegated",
      reason: "承認済みの公開結果、実行履歴、次回確認項目を管理する。"
    }
  ];

  return {
    repositoryReadiness,
    dashboardStats,
    employees,
    todaySchedule,
    dashboardAppProjects,
    activeAppProject,
    dashboardMarketingContents,
    dashboardApprovals,
    dashboardCeoInstructions,
    dashboardCompanyTasks,
    dashboardEmployeeTasks,
    dashboardContentDrafts,
    dashboardMediaAssets,
    dashboardMediaUploadJobs,
    dashboardPublishJobs,
    latestPerformance,
    metrics,
    rates,
    dailyBrief,
    secretaryDispatchPlan,
    ceoOperatingSnapshot,
    snapshotNextActions,
    performanceActionPlan,
    approvalPolicies,
    pendingApprovalCount,
    waitingForCeoCount,
    workingCount: employees.filter((employee) => employee.status === "in_progress").length,
    stoppedCount:
      dailyBrief.operationGates.blockedGateCount +
      dashboardPublishJobs.filter((job) => job.status === "manual_required" || job.status === "cancelled").length
  };
}
