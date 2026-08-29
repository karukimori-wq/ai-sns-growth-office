import { AppShell, PageHeader } from "./components/app-shell";
import type { EmployeeTask } from "./components/employee-task-board";
import { loadDashboardData } from "./lib/dashboard-data";

export const dynamic = "force-dynamic";

const statTone: Record<string, string> = {
  "稼働AI": "teal",
  "進行中": "blue",
  "本日完了": "green",
  "要確認": "amber"
};

export default async function Home() {
  const data = await loadDashboardData();
  const stats = data.dashboardStats.map((stat) =>
    stat.label === "要確認"
      ? { ...stat, value: data.pendingApprovalCount, caption: "承認センターの未処理件数" }
      : stat.label === "稼働AI"
        ? { ...stat, value: data.workingCount, caption: "稼働中のAI社員" }
        : stat
  );
  const pendingApprovals = data.dashboardApprovals.filter((approval) => approval.status === "pending");
  const topEmployeeTasks = data.dashboardEmployeeTasks
    .filter((task: EmployeeTask) => ["in_progress", "waiting_approval", "queued"].includes(task.status))
    .slice(0, 5);
  const topCompanyTasks = data.dashboardCompanyTasks.slice(0, 4);

  return (
    <AppShell active="dashboard" pendingApprovalCount={data.pendingApprovalCount}>
      <PageHeader eyebrow="Home" title="ホーム" badge="運用中" />

      <section className="dashboardSection" aria-label="KPIサマリー">
        <div className="sectionHeading">
          <h2>KPIサマリー</h2>
        </div>
        <div className="statsGrid">
          {stats.map((stat) => (
            <article className={`statCard ${statTone[stat.label]}`} key={stat.label}>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
              <small>{stat.caption}</small>
            </article>
          ))}
        </div>
      </section>

      <a className="ceoAlertCard" href="/instructions">
        <div className="alertIcon">!</div>
        <div>
          <strong>社長の確認待ち {data.pendingApprovalCount}件</strong>
          <ul>
            {pendingApprovals.slice(0, 3).map((approval) => (
              <li key={approval.id}>{approval.title}</li>
            ))}
          </ul>
        </div>
        <span>確認へ</span>
      </a>

      {data.repositoryReadiness.databaseBackedPersistenceReady ? null : (
        <section className="systemNotice" aria-label="システム通知">
          <strong>保存基盤の確認が必要です</strong>
          <span>{data.repositoryReadiness.issues[0] ?? "永続化の状態を確認してください。"}</span>
        </section>
      )}

      <section className="panel wide">
        <div className="panelHeader">
          <h2>エージェントの仕事進捗</h2>
          <a className="panelHeaderLink" href="/company#employees">すべて見る</a>
        </div>
        <div className="compactProgressList">
          {topEmployeeTasks.map((task: EmployeeTask) => (
            <article key={task.id}>
              <span className="avatar">{task.employeeName.slice(0, 1)}</span>
              <div>
                <strong>{task.employeeName}</strong>
                <div className="progressTrack">
                  <div style={{ width: `${task.progress}%` }} />
                </div>
              </div>
              <strong>{task.progress}%</strong>
              <span className={`taskStatus ${task.status}`}>{task.statusLabel}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="panel wide">
        <div className="panelHeader">
          <h2>会社のタスク一覧</h2>
          <a className="panelHeaderLink" href="/company#tasks">すべて見る</a>
        </div>
        <div className="simpleTaskList">
          {topCompanyTasks.map((task) => (
            <a href="/company#tasks" key={task.id}>
              <strong>{task.title}</strong>
              <span>期限: {task.dueLabel}</span>
              <small>{task.owner}</small>
            </a>
          ))}
        </div>
      </section>

      <section className="panel wide">
        <div className="panelHeader">
          <h2>案件別SNS運用のミニ概要</h2>
          <a className="panelHeaderLink" href="/operations">すべて見る</a>
        </div>
        <div className="operationMiniList">
          {data.snsOperations.slice(0, 3).map((operation) => (
            <a href="/operations" key={operation.id}>
              <span className="avatar">{operation.projectName.slice(0, 1)}</span>
              <strong>{operation.projectName}</strong>
              <small>進行中投稿数 {operation.scheduledCount}件</small>
              <small>次の予定 {operation.nextPostAt}</small>
            </a>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
