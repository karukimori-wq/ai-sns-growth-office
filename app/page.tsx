import {
  approvalRequests,
  ceoInstructions,
  companyTasks,
  contentDrafts,
  dashboardStats,
  employeeTasks,
  employees,
  mediaAssets,
  performanceSnapshots,
  todaySchedule
} from "../src/domain/seed.mjs";
import { calculateBottleneckRates, normalizeDailyMetrics } from "../src/domain/workflow.mjs";
import { ApprovalCenter } from "./components/approval-center";

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

const latestPerformance = performanceSnapshots[0];
const normalizedMetrics = normalizeDailyMetrics(latestPerformance.metrics);
const bottleneckRates = calculateBottleneckRates(normalizedMetrics);

const metricCards = [
  { label: "表示", value: normalizedMetrics.impressions },
  { label: "プロフィール", value: normalizedMetrics.profile_visits },
  { label: "フォロー", value: normalizedMetrics.follows },
  { label: "CTA", value: normalizedMetrics.cta_clicks },
  { label: "LP", value: normalizedMetrics.landing_page_visits },
  { label: "登録", value: normalizedMetrics.trial_or_signup_count }
];

const rateCards = [
  { label: "プロフィール率", value: bottleneckRates.profile_visit_rate },
  { label: "フォロー率", value: bottleneckRates.follow_rate },
  { label: "CTA率", value: bottleneckRates.cta_click_rate },
  { label: "LP到達率", value: bottleneckRates.landing_page_rate }
];

function formatValue(value: number | string) {
  return value === "unknown" ? "未入力" : value.toLocaleString("ja-JP");
}

function formatRate(value: number | string) {
  return value === "unknown" ? "未判定" : `${Math.round(Number(value) * 1000) / 10}%`;
}

export default function Home() {
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

        <div className="contentGrid">
          <section className="panel wide">
            <div className="panelHeader">
              <h2>秘書Inbox</h2>
              <span>社長指示を分解</span>
            </div>
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
            <div className="taskTable">
              {employeeTasks.map((task) => (
                <article className="taskRow" key={task.id}>
                  <span className={`taskStatus ${task.status}`}>{task.statusLabel}</span>
                  <strong>{task.title}</strong>
                  <span>{task.employeeName}</span>
                  <span>{task.progress}%</span>
                  <span>{task.outputType}</span>
                </article>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="panelHeader">
              <h2>社長への確認</h2>
              <span>{approvalRequests.length}件</span>
            </div>
            <div className="approvalList">
              {approvalRequests.map((approval) => (
                <article className="approvalItem" key={approval.id}>
                  <div>
                    <strong>{approval.title}</strong>
                    <p>{approval.reason}</p>
                  </div>
                  <button type="button">確認</button>
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
              <h2>画像アセット</h2>
              <span>社長確認後に使用</span>
            </div>
            <div className="assetList">
              {mediaAssets.map((asset) => (
                <article className="assetCard" key={asset.id}>
                  <div className="assetPreview">IMG</div>
                  <div>
                    <strong>{asset.type === "image" ? "X投稿画像案" : asset.type}</strong>
                    <p>{asset.concept}</p>
                  </div>
                  <span className="taskStatus waiting_approval">確認待ち</span>
                </article>
              ))}
            </div>
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
              <span>{latestPerformance.date}</span>
            </div>
            <div className="metricGrid">
              {metricCards.map((metric) => (
                <article className="metricCard" key={metric.label}>
                  <span>{metric.label}</span>
                  <strong>{formatValue(metric.value)}</strong>
                </article>
              ))}
            </div>
            <div className="rateList">
              {rateCards.map((rate) => (
                <div className="rateRow" key={rate.label}>
                  <span>{rate.label}</span>
                  <strong>{formatRate(rate.value)}</strong>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
