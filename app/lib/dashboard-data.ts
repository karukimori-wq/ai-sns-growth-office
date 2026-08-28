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
export type AppProject = { id: string; name: string };
export type CeoInstruction = { id: string; title: string; body: string; decompositionSummary: string };
export type ContentDraft = {
  id: string;
  title: string;
  body: string;
  cta: string;
  imagePrompt?: string;
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
export type ApprovalRequest = {
  id: string;
  type: string;
  title: string;
  reason: string;
  status: string;
  history: Array<{ status: string; reason: string }>;
  relatedEmployeeTaskId?: string;
};
export type PublishJob = { status: string };
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
  const dashboardApprovals = (persistedApprovals.length > 0 ? persistedApprovals : approvalRequests) as ApprovalRequest[];
  const dashboardCeoInstructions = (
    persistedCeoInstructions.length > 0 ? persistedCeoInstructions : ceoInstructions
  ) as CeoInstruction[];
  const dashboardCompanyTasks = (persistedCompanyTasks.length > 0 ? persistedCompanyTasks : companyTasks) as CompanyTask[];
  const dashboardEmployeeTasks = persistedEmployeeTasks.length > 0 ? persistedEmployeeTasks : employeeTasks;
  const dashboardContentDrafts = (persistedContentDrafts.length > 0 ? persistedContentDrafts : contentDrafts) as ContentDraft[];
  const dashboardMediaAssets = persistedMediaAssets.length > 0 ? persistedMediaAssets : mediaAssets;
  const dashboardMediaUploadJobs = persistedMediaUploadJobs.length > 0 ? persistedMediaUploadJobs : mediaUploadJobs;
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
  const waitingForCeoCount =
    dailyBrief.confirmationAgenda.length +
    pendingApprovalCount +
    dashboardPublishJobs.filter((job) => job.status === "waiting_approval").length;

  return {
    repositoryReadiness,
    dashboardStats,
    employees,
    todaySchedule,
    activeAppProject,
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
    pendingApprovalCount,
    waitingForCeoCount,
    workingCount: employees.filter((employee) => employee.status === "in_progress").length,
    stoppedCount:
      dailyBrief.operationGates.blockedGateCount +
      dashboardPublishJobs.filter((job) => job.status === "manual_required" || job.status === "cancelled").length
  };
}
