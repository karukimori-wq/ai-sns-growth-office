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
} from "../src/domain/seed.mjs";
import {
  createCeoDailyBrief,
  createCeoOperatingSnapshot,
  createSecretaryDispatchPlan
} from "../src/domain/daily-brief.mjs";
import { createRepositoryReadinessReport } from "../src/domain/repository-readiness.mjs";
import { getRepositoryRuntime } from "../src/domain/repository-runtime.mjs";
import {
  calculateBottleneckRates,
  createPerformanceActionPlan,
  normalizeDailyMetrics
} from "../src/domain/workflow.mjs";
import { ApprovalCenter } from "./components/approval-center";
import { CeoInstructionComposer } from "./components/ceo-instruction-composer";
import { CompanyTaskBoard } from "./components/company-task-board";
import { DailyMetricsForm } from "./components/daily-metrics-form";
import { EmployeeTaskBoard } from "./components/employee-task-board";
import { ExecutionQueue } from "./components/execution-queue";
import { PerformanceActionMaterializer } from "./components/performance-action-materializer";
import { PublishApprovalSelector } from "./components/publish-approval-selector";

const navItems = [
  { label: "指示・承認", shortLabel: "指示", icon: "指", href: "#instructions" },
  { label: "会社タスク", shortLabel: "会社", icon: "会", href: "#company-tasks" },
  { label: "ダッシュボード", shortLabel: "ダッシュ", icon: "D", href: "#dashboard", primary: true },
  { label: "エージェント", shortLabel: "AI", icon: "AI", href: "#agents" },
  { label: "設定", shortLabel: "設定", icon: "設", href: "#settings" }
];

export const dynamic = "force-dynamic";

const statTone: Record<string, string> = {
  "稼働AI": "teal",
  "進行中": "blue",
  "本日完了": "green",
  "要確認": "amber"
};

type SnapshotNextAction = { id: string; owner: string; title: string; action: string };
type AppProject = { id: string; name: string };
type CeoInstruction = { id: string; title: string; body: string; decompositionSummary: string };
type CompanyTask = {
  id: string;
  title: string;
  owner: string;
  priority: string;
  priorityLabel: string;
  dueLabel: string;
  status: string;
  statusLabel: string;
};
type ContentDraft = {
  id: string;
  title: string;
  body: string;
  cta: string;
  imagePrompt?: string;
};
type CeoOperatingSnapshot = {
  appProjectName: string;
  executiveSummary: string;
  status: string;
  metrics: {
    pendingApprovalCount: number;
    blockedGateCount: number;
  };
  nextActions: Array<SnapshotNextAction | null>;
};
type DispatchItem = { id: string; priority: string; assignee: string; instruction: string; expectedOutput: string };
type ConfirmationAgendaItem = {
  id: string;
  sourceId?: string;
  type?: string;
  title: string;
  reason: string;
  suggestedDecision: string;
  priority: string;
};
type BuyPathStage = { id: string; label: string; requiredContentRole: string; status: string };
type OperationGate = { id: string; label: string; status: string; blocker?: string; nextAction: string };
type PerformanceAction = { id: string; owner: string; priority: string; title: string; action: string; reason: string };
type ApprovalRequest = { status: string };
type PublishJob = { status: string };
type RepositoryReadinessReport = {
  activeDriver: string;
  requestedDriver: string;
  durablePersistenceRequested: boolean;
  databaseBackedPersistenceReady: boolean;
  d1Configured: boolean;
  d1Reachable: boolean;
  fallbackUsed: boolean;
  issues: string[];
};
type PerformanceActionPlan = {
  snapshotId: string;
  date: string;
  actions: PerformanceAction[];
};
type PerformanceSnapshot = {
  id: string;
  appProjectId?: string;
  channel?: string;
  date: string;
  metrics: Record<string, number | string | null>;
};
type DailyBrief = {
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

function formatValue(value: number | string) {
  return value === "unknown" ? "未入力" : value.toLocaleString("ja-JP");
}

function formatRate(value: number | string) {
  return value === "unknown" ? "未判定" : `${Math.round(Number(value) * 1000) / 10}%`;
}

export default async function Home() {
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
    createRepositoryReadinessReport({
      repository,
      status
    }) as Promise<RepositoryReadinessReport>,
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
  const dashboardApprovals = persistedApprovals.length > 0 ? persistedApprovals : approvalRequests;
  const dashboardCeoInstructions = (
    persistedCeoInstructions.length > 0 ? persistedCeoInstructions : ceoInstructions
  ) as CeoInstruction[];
  const dashboardCompanyTasks = (persistedCompanyTasks.length > 0 ? persistedCompanyTasks : companyTasks) as CompanyTask[];
  const dashboardEmployeeTasks = persistedEmployeeTasks.length > 0 ? persistedEmployeeTasks : employeeTasks;
  const dashboardContentDrafts = (persistedContentDrafts.length > 0 ? persistedContentDrafts : contentDrafts) as ContentDraft[];
  const dashboardMediaAssets = persistedMediaAssets.length > 0 ? persistedMediaAssets : mediaAssets;
  const dashboardMediaUploadJobs = persistedMediaUploadJobs.length > 0 ? persistedMediaUploadJobs : mediaUploadJobs;
  const dashboardPublishJobs = persistedPublishJobs.length > 0 ? persistedPublishJobs : publishJobs;
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
  const snapshotNextActions: SnapshotNextAction[] = ceoOperatingSnapshot.nextActions.filter(
    (action: SnapshotNextAction | null): action is SnapshotNextAction => Boolean(action)
  );
  const persistedLatestPerformance = dashboardPerformanceSnapshots[0] as PerformanceSnapshot;
  const persistedMetrics = normalizeDailyMetrics(persistedLatestPerformance.metrics);
  const persistedRates = calculateBottleneckRates(persistedMetrics);
  const persistedMetricCards = [
    { label: "表示", value: persistedMetrics.impressions },
    { label: "プロフィール", value: persistedMetrics.profile_visits },
    { label: "フォロー", value: persistedMetrics.follows },
    { label: "CTA", value: persistedMetrics.cta_clicks },
    { label: "LP", value: persistedMetrics.landing_page_visits },
    { label: "登録", value: persistedMetrics.trial_or_signup_count }
  ];
  const persistedRateCards = [
    { label: "プロフィール率", value: persistedRates.profile_visit_rate },
    { label: "フォロー率", value: persistedRates.follow_rate },
    { label: "CTA率", value: persistedRates.cta_click_rate },
    { label: "LP到達率", value: persistedRates.landing_page_rate }
  ];
  const performanceActionPlan = createPerformanceActionPlan({
    snapshot: persistedLatestPerformance,
    metrics: persistedMetrics
  }) as PerformanceActionPlan;
  const waitingForCeoCount =
    dailyBrief.confirmationAgenda.length +
    (dashboardApprovals as ApprovalRequest[]).filter((approval) => approval.status === "pending").length +
    (dashboardPublishJobs as PublishJob[]).filter((job) => job.status === "waiting_approval").length;
  const workingCount = employees.filter((employee) => employee.status === "in_progress").length;
  const stoppedCount =
    dailyBrief.operationGates.blockedGateCount +
    (dashboardPublishJobs as PublishJob[]).filter((job) => job.status === "manual_required" || job.status === "cancelled").length;
  const settingsItems = [
    { label: "コンテンツ管理", caption: "投稿テーマ、下書き、公開ルール", href: "#publish-queue" },
    { label: "画像管理", caption: "画像アセット、アップロード準備、利用可否", href: "/media" },
    { label: "SNSアカウント管理", caption: "X、Instagramなどの接続先メモ", href: "#settings" },
    { label: "会社運用設定", caption: "部署、エージェント、承認ルール", href: "#agents" }
  ];

  return (
    <main className="shell">
      <aside className="sidebar" aria-label="メインナビゲーション">
        <div className="brand">AI SNS Growth Office</div>
        <nav>
          {navItems.map((item) => (
            <a className={item.primary ? "navItem active primary" : "navItem"} href={item.href} key={item.href}>
              <span className="navIcon" aria-hidden="true">
                {item.icon}
              </span>
              <span className="navText">{item.label}</span>
              <span className="navShortText">{item.shortLabel}</span>
            </a>
          ))}
        </nav>
        <div className="sidebarNote">Numeria Studio campaign</div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">CEO View</p>
            <h1>AI会社ダッシュボード</h1>
          </div>
          <div className="ceoBadge">社長</div>
        </header>

        <section className="statsGrid" aria-label="主要指標">
          {dashboardStats.map((stat) => (
            <article className={`statCard ${statTone[stat.label]}`} key={stat.label}>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
              <small>{stat.caption}</small>
            </article>
          ))}
        </section>

        <section className="snapshotPanel" id="dashboard" aria-label="社長運用スナップショット">
          <div>
            <p className="eyebrow">Operating Snapshot</p>
            <h2>{ceoOperatingSnapshot.appProjectName} 今日の判断</h2>
            <p>{ceoOperatingSnapshot.executiveSummary}</p>
          </div>
          <div className="snapshotMetrics">
            <article>
              <span>動いている</span>
              <strong>{workingCount}</strong>
              <small>稼働中エージェント</small>
            </article>
            <article>
              <span>待っている</span>
              <strong>{waitingForCeoCount}</strong>
              <small>社長判断・承認待ち</small>
            </article>
            <article>
              <span>止まっている</span>
              <strong>{stoppedCount}</strong>
              <small>ゲート停止・手動対応</small>
            </article>
          </div>
          <div className="snapshotActions">
            {snapshotNextActions.slice(0, 3).map((action) => (
              <article key={action.id}>
                <span>{action.owner}</span>
                <strong>{action.title}</strong>
                <p>{action.action}</p>
              </article>
            ))}
            <a className="detailLink" href="#instructions">社長アクションを見る</a>
            <a className="detailLink" href="#company-tasks">会社タスクを見る</a>
          </div>
        </section>

        {repositoryReadiness.databaseBackedPersistenceReady ? null : (
          <section className="systemNotice" aria-label="システム通知">
            <strong>保存基盤の確認が必要です</strong>
            <span>{repositoryReadiness.issues[0] ?? "永続化の状態を確認してください。"}</span>
          </section>
        )}

        <div className="contentGrid">
          <section className="panel wide" id="instructions">
            <div className="panelHeader">
              <h2>指示・承認</h2>
              <span>社長からのトリガーと判断案件</span>
            </div>
            <CeoInstructionComposer
              initialContentDrafts={dashboardContentDrafts}
              initialEmployeeTasks={dashboardEmployeeTasks}
              initialInstructions={dashboardCeoInstructions}
            />
          </section>

          <section className="panel wide">
            <div className="panelHeader">
              <h2>秘書Inbox</h2>
              <span>社長指示を分解</span>
            </div>
            <article className="approvalItem">
              <div>
                <strong>本日の秘書ブリーフ</strong>
                <p>{dailyBrief.summary}</p>
                {dailyBrief.priorities.map((priority) => (
                  <p key={priority}>{priority}</p>
                ))}
              </div>
              <span className="taskStatus in_progress">本日</span>
            </article>
            <div className="approvalList">
              {dashboardCeoInstructions.map((instruction) => (
                <article className="approvalItem" key={instruction.id}>
                  <div>
                    <strong>{instruction.title}</strong>
                    <p>{instruction.body}</p>
                    <p>{instruction.decompositionSummary}</p>
                  </div>
                  <span className="taskStatus in_progress">分解済み</span>
                </article>
              ))}
            </div>
          </section>

          <section className="panel wide" id="agents">
            <div className="panelHeader">
              <h2>エージェント</h2>
              <span>担当タスクと進捗管理</span>
            </div>
            <div className="agentToolbar">
              <p>各エージェントの担当、状態、作業中タスクを確認します。</p>
              <button type="button">エージェント追加</button>
            </div>
            <div className="employeeList">
              {employees.map((employee) => (
                <article className="employeeRow" key={employee.id}>
                  <div className="avatar">{employee.shortName}</div>
                  <div>
                    <strong>{employee.name}</strong>
                    <p>{employee.currentTask}</p>
                  </div>
                  <span className={`status ${employee.status}`}>{employee.statusLabel}</span>
                  <div className="progressTrack">
                    <div style={{ width: `${employee.progress}%` }} />
                  </div>
                  <strong className="progressValue">{employee.progress}%</strong>
                </article>
              ))}
            </div>
          </section>

          <section className="panel wide">
            <div className="panelHeader">
              <h2>社員別タスク</h2>
              <span>秘書AIから割り当て</span>
            </div>
            <EmployeeTaskBoard initialEmployeeTasks={dashboardEmployeeTasks} />
          </section>

          <section className="panel wide">
            <div className="panelHeader">
              <h2>秘書から各部署へ</h2>
              <span>次アクション {secretaryDispatchPlan.dispatches.length}件</span>
            </div>
            <div className="taskTable">
              {secretaryDispatchPlan.dispatches.map((dispatch) => (
                <article className="taskRow" key={dispatch.id}>
                  <span className={`priority ${dispatch.priority}`}>{dispatch.priority}</span>
                  <strong>{dispatch.assignee}</strong>
                  <span>{dispatch.instruction}</span>
                  <span>{dispatch.expectedOutput}</span>
                </article>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="panelHeader">
              <h2>社長への確認</h2>
              <span>{dailyBrief.confirmationAgenda.length}件</span>
            </div>
            <div className="approvalList">
              {dailyBrief.confirmationAgenda.map((item) => (
                <article className="approvalItem" key={item.id}>
                  <div>
                    <small className={`decisionType ${item.type ?? "other"}`}>{decisionTypeLabel(item.type)}</small>
                    <strong>{item.title}</strong>
                    <p>{item.reason}</p>
                    <p>判断: {item.suggestedDecision}</p>
                  </div>
                  {item.type === "approval" && item.sourceId ? (
                    <a className="actionLink" href={`#approval-${item.sourceId}`}>
                      {item.priority === "high" ? "優先確認" : "確認"}
                    </a>
                  ) : (
                    <span className={`priority ${item.priority}`}>{item.priority}</span>
                  )}
                </article>
              ))}
            </div>
          </section>

          <section className="panel wide">
            <div className="panelHeader">
              <h2>承認センター</h2>
              <span>3段階承認</span>
            </div>
            <ApprovalCenter approvals={dashboardApprovals} />
          </section>

          <section className="panel">
            <div className="panelHeader">
              <h2>公開準備ジョブ</h2>
              <span>承認後の実行</span>
            </div>
            <ExecutionQueue initialMediaUploadJobs={dashboardMediaUploadJobs} initialPublishJobs={dashboardPublishJobs} />
          </section>

          <section className="panel compactMediaPanel">
            <div className="panelHeader">
              <h2>画像アセット</h2>
              <a className="panelHeaderLink" href="/media">画像管理を開く</a>
            </div>
            <p className="compactPanelText">
              画像は専用ページで確認します。トップ画面では承認待ちの有無だけ見ます。
            </p>
            <strong className="compactCount">{dashboardMediaAssets.length}件</strong>
          </section>

          <section className="panel wide" id="company-tasks">
            <div className="panelHeader">
              <h2>会社タスク</h2>
              <span>案件一覧・承認・進捗</span>
            </div>
            <CompanyTaskBoard tasks={dashboardCompanyTasks} />
          </section>

          <section className="panel">
            <div className="panelHeader">
              <h2>本日の流れ</h2>
              <span>毎日入力</span>
            </div>
            <ol className="scheduleList">
              {todaySchedule.map((item) => (
                <li key={item.time}>
                  <time>{item.time}</time>
                  <span>{item.title}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="panel wide" id="publish-queue">
            <div className="panelHeader">
              <h2>X公開キュー</h2>
              <span>公開予約は最終承認後</span>
            </div>
            <PublishApprovalSelector
              contentDrafts={dashboardContentDrafts}
              mediaAssets={dashboardMediaAssets}
              mediaUploadJobs={dashboardMediaUploadJobs}
            />
            <div className="publishQueue">
              {dashboardContentDrafts.map((draft) => (
                <article className="publishItem" key={draft.id}>
                  <div>
                    <strong>{draft.title}</strong>
                    <p>{draft.body}</p>
                    <small>CTA: {draft.cta}</small>
                    {"imagePrompt" in draft && draft.imagePrompt ? <small>画像案: {draft.imagePrompt}</small> : null}
                  </div>
                  <div className="publishState">
                    <span className="taskStatus waiting_approval">下書き確認待ち</span>
                    <span className="taskStatus waiting_approval">公開承認待ち</span>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="panel" id="metrics">
            <div className="panelHeader">
              <h2>日次指標</h2>
              <span>{persistedLatestPerformance.date}</span>
            </div>
            <div className="metricGrid">
              {persistedMetricCards.map((metric) => (
                <article className="metricCard" key={metric.label}>
                  <span>{metric.label}</span>
                  <strong>{formatValue(metric.value)}</strong>
                </article>
              ))}
            </div>
            <div className="rateList">
              {persistedRateCards.map((rate) => (
                <div className="rateRow" key={rate.label}>
                  <span>{rate.label}</span>
                  <strong>{formatRate(rate.value)}</strong>
                </div>
              ))}
            </div>
            <DailyMetricsForm latestSnapshot={persistedLatestPerformance} />
          </section>

          <section className="panel">
            <div className="panelHeader">
              <h2>日次改善指示</h2>
              <span>{performanceActionPlan.date}</span>
            </div>
            <div className="approvalList">
              {performanceActionPlan.actions.map((action) => (
                <article className="approvalItem" key={action.id}>
                  <div>
                    <strong>{action.title}</strong>
                    <p>{action.action}</p>
                    <p>
                      {action.owner} / {action.reason}
                    </p>
                  </div>
                  <span className={`priority ${action.priority}`}>{action.priority}</span>
                </article>
              ))}
            </div>
            <PerformanceActionMaterializer snapshotId={performanceActionPlan.snapshotId} />
          </section>

          <section className="panel wide">
            <div className="panelHeader">
              <h2>買うまでの導線チェック</h2>
              <span>投稿単体ではなく道を見る</span>
            </div>
            <div className="taskTable">
              {dailyBrief.buyPathChecklist.map((stage) => (
                <article className="taskRow" key={stage.id}>
                  <span className={`taskStatus ${stage.status === "ready" ? "in_progress" : "waiting_approval"}`}>
                    {stage.status === "ready" ? "準備済み" : "要補強"}
                  </span>
                  <strong>{stage.label}</strong>
                  <span>{stage.requiredContentRole}</span>
                  <span>{stage.id}</span>
                  <span>{stage.status}</span>
                </article>
              ))}
            </div>
          </section>

          <section className="panel wide">
            <div className="panelHeader">
              <h2>公開までの運用ゲート</h2>
              <span>{dailyBrief.operationGates.readyForPublish ? "公開準備OK" : `${dailyBrief.operationGates.blockedGateCount}件ブロック`}</span>
            </div>
            <div className="taskTable">
              {dailyBrief.operationGates.gates.map((gate) => (
                <article className="taskRow" key={gate.id}>
                  <span className={`taskStatus ${gate.status === "ready" ? "in_progress" : "waiting_approval"}`}>
                    {gate.status === "ready" ? "準備済み" : "停止中"}
                  </span>
                  <strong>{gate.label}</strong>
                  <span>{gate.blocker ?? "ブロックなし"}</span>
                  <span>{gate.nextAction}</span>
                </article>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="panelHeader">
              <h2>次の投稿テーマ</h2>
              <span>分析AIから提案</span>
            </div>
            <div className="approvalList">
              {dailyBrief.recommendedContentAngles.map((angle) => (
                <article className="approvalItem" key={angle}>
                  <div>
                    <strong>推奨テーマ</strong>
                    <p>{angle}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="panel wide" id="settings">
            <div className="panelHeader">
              <h2>設定</h2>
              <span>各種管理</span>
            </div>
            <div className="settingsGrid">
              {settingsItems.map((item) => (
                <a className="settingsCard" href={item.href} key={item.label}>
                  <strong>{item.label}</strong>
                  <p>{item.caption}</p>
                </a>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function decisionTypeLabel(type: string | undefined) {
  if (type === "approval") return "承認判断";
  if (type === "task_blocker") return "作業停止";
  if (type === "buy_path_gap") return "導線補強";
  if (type === "performance_warning") return "指標改善";
  return "確認";
}
