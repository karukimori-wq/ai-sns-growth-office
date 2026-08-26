import {
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
import { repository, repositoryRuntimeStatus } from "../src/domain/repository-runtime.mjs";
import {
  calculateBottleneckRates,
  createPerformanceActionPlan,
  normalizeDailyMetrics
} from "../src/domain/workflow.mjs";
import { ApprovalCenter } from "./components/approval-center";
import { CeoInstructionComposer } from "./components/ceo-instruction-composer";
import { DailyMetricsForm } from "./components/daily-metrics-form";
import { EmployeeTaskBoard } from "./components/employee-task-board";
import { ExecutionQueue } from "./components/execution-queue";
import { MediaAssetBoard } from "./components/media-asset-board";
import { PerformanceActionMaterializer } from "./components/performance-action-materializer";

const navItems = [
  "ダッシュボード",
  "秘書Inbox",
  "会社タスク",
  "AI社員",
  "承認センター",
  "Xカレンダー",
  "画像アセット",
  "日次指標",
  "設定"
];

const statTone: Record<string, string> = {
  "稼働AI": "teal",
  "進行中": "blue",
  "本日完了": "green",
  "要確認": "amber"
};

type SnapshotNextAction = { id: string; owner: string; title: string; action: string };
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
type ConfirmationAgendaItem = { id: string; title: string; reason: string; suggestedDecision: string; priority: string };
type BuyPathStage = { id: string; label: string; requiredContentRole: string; status: string };
type OperationGate = { id: string; label: string; status: string; blocker?: string; nextAction: string };
type PerformanceAction = { id: string; owner: string; priority: string; title: string; action: string; reason: string };
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

const latestPerformance = performanceSnapshots[0];
const dailyBrief = createCeoDailyBrief({
  appProject: { id: "app_numeria_studio", name: "Numeria Studio" },
  approvals: approvalRequests,
  employeeTasks,
  contentDrafts,
  mediaAssets,
  performanceSnapshots
}) as DailyBrief;
const secretaryDispatchPlan = createSecretaryDispatchPlan({
  appProject: { id: "app_numeria_studio", name: "Numeria Studio" },
  approvals: approvalRequests,
  employeeTasks,
  contentDrafts,
  mediaAssets,
  performanceSnapshots
}) as { dispatches: DispatchItem[] };
const ceoOperatingSnapshot = createCeoOperatingSnapshot({
  appProject: { id: "app_numeria_studio", name: "Numeria Studio" },
  approvals: approvalRequests,
  employeeTasks,
  contentDrafts,
  mediaAssets,
  performanceSnapshots
}) as CeoOperatingSnapshot;
const snapshotNextActions: SnapshotNextAction[] = ceoOperatingSnapshot.nextActions.filter(
  (action: SnapshotNextAction | null): action is SnapshotNextAction => Boolean(action)
);

function formatValue(value: number | string) {
  return value === "unknown" ? "未入力" : value.toLocaleString("ja-JP");
}

function formatRate(value: number | string) {
  return value === "unknown" ? "未判定" : `${Math.round(Number(value) * 1000) / 10}%`;
}

function formatPersistenceStatus(report: RepositoryReadinessReport) {
  if (report.databaseBackedPersistenceReady) {
    return "永続化OK";
  }

  if (report.durablePersistenceRequested) {
    return "要設定";
  }

  return "seed運用";
}

function formatBoolean(value: boolean) {
  return value ? "Yes" : "No";
}

export default async function Home() {
  const [repositoryReadiness, persistedPerformanceSnapshots, persistedEmployeeTasks] = await Promise.all([
    createRepositoryReadinessReport({
      repository,
      status: repositoryRuntimeStatus
    }) as Promise<RepositoryReadinessReport>,
    repository.listPerformanceSnapshots(),
    repository.listEmployeeTasks()
  ]);
  const persistedLatestPerformance = (persistedPerformanceSnapshots[0] ?? latestPerformance) as PerformanceSnapshot;
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

  return (
    <main className="shell">
      <aside className="sidebar" aria-label="メインナビゲーション">
        <div className="brand">AI SNS Growth Office</div>
        <nav>
          {navItems.map((item, index) => (
            <a className={index === 0 ? "navItem active" : "navItem"} href="#" key={item}>
              {item}
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

        <section className="snapshotPanel" aria-label="社長運用スナップショット">
          <div>
            <p className="eyebrow">Operating Snapshot</p>
            <h2>{ceoOperatingSnapshot.appProjectName} 今日の判断</h2>
            <p>{ceoOperatingSnapshot.executiveSummary}</p>
          </div>
          <div className="snapshotMetrics">
            <article>
              <span>状態</span>
              <strong>
                {ceoOperatingSnapshot.status === "needs_ceo_decision"
                  ? "社長判断待ち"
                  : ceoOperatingSnapshot.status === "ready_for_publish"
                    ? "公開準備OK"
                    : "進行中"}
              </strong>
            </article>
            <article>
              <span>確認</span>
              <strong>{ceoOperatingSnapshot.metrics.pendingApprovalCount}</strong>
            </article>
            <article>
              <span>ブロック</span>
              <strong>{ceoOperatingSnapshot.metrics.blockedGateCount}</strong>
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
          </div>
        </section>

        <section className="persistencePanel" aria-label="永続化ステータス">
          <div>
            <p className="eyebrow">Persistence</p>
            <h2>{formatPersistenceStatus(repositoryReadiness)}</h2>
            <p>
              driver: {repositoryReadiness.activeDriver} / requested: {repositoryReadiness.requestedDriver}
            </p>
          </div>
          <div className="persistenceChecks">
            <article>
              <span>D1設定</span>
              <strong>{formatBoolean(repositoryReadiness.d1Configured)}</strong>
            </article>
            <article>
              <span>D1到達</span>
              <strong>{formatBoolean(repositoryReadiness.d1Reachable)}</strong>
            </article>
            <article>
              <span>DB永続化</span>
              <strong>{formatBoolean(repositoryReadiness.databaseBackedPersistenceReady)}</strong>
            </article>
            <article>
              <span>fallback</span>
              <strong>{formatBoolean(repositoryReadiness.fallbackUsed)}</strong>
            </article>
          </div>
          {repositoryReadiness.issues.length > 0 ? (
            <p className="persistenceIssue">{repositoryReadiness.issues[0]}</p>
          ) : null}
        </section>

        <div className="contentGrid">
          <section className="panel wide">
            <div className="panelHeader">
              <h2>社長指示</h2>
              <span>Numeria Studio / X</span>
            </div>
            <CeoInstructionComposer
              initialContentDrafts={contentDrafts}
              initialEmployeeTasks={employeeTasks}
              initialInstructions={ceoInstructions}
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
              {ceoInstructions.map((instruction) => (
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

          <section className="panel wide">
            <div className="panelHeader">
              <h2>AI社員の進捗</h2>
              <span>画像つきX投稿まで承認制</span>
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
            <EmployeeTaskBoard initialEmployeeTasks={persistedEmployeeTasks} />
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
                    <strong>{item.title}</strong>
                    <p>{item.reason}</p>
                    <p>判断: {item.suggestedDecision}</p>
                  </div>
                  <button type="button">{item.priority === "high" ? "優先確認" : "確認"}</button>
                </article>
              ))}
            </div>
          </section>

          <section className="panel wide">
            <div className="panelHeader">
              <h2>承認センター</h2>
              <span>3段階承認</span>
            </div>
            <ApprovalCenter approvals={approvalRequests} />
          </section>

          <section className="panel">
            <div className="panelHeader">
              <h2>公開準備ジョブ</h2>
              <span>承認後の実行</span>
            </div>
            <ExecutionQueue initialMediaUploadJobs={mediaUploadJobs} initialPublishJobs={publishJobs} />
          </section>

          <section className="panel">
            <div className="panelHeader">
              <h2>画像アセット</h2>
              <span>社長確認後に使用</span>
            </div>
            <MediaAssetBoard initialMediaAssets={mediaAssets} />
          </section>

          <section className="panel wide">
            <div className="panelHeader">
              <h2>会社タスク</h2>
              <span>Numeria Studio / X</span>
            </div>
            <div className="taskTable">
              {companyTasks.map((task) => (
                <article className="taskRow" key={task.id}>
                  <span className={`priority ${task.priority}`}>{task.priorityLabel}</span>
                  <strong>{task.title}</strong>
                  <span>{task.owner}</span>
                  <span>{task.dueLabel}</span>
                  <span className={`taskStatus ${task.status}`}>{task.statusLabel}</span>
                </article>
              ))}
            </div>
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

          <section className="panel wide">
            <div className="panelHeader">
              <h2>X公開キュー</h2>
              <span>公開予約は最終承認後</span>
            </div>
            <div className="publishQueue">
              {contentDrafts.map((draft) => (
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

          <section className="panel">
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
        </div>
      </section>
    </main>
  );
}
