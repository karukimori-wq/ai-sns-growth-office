import { AppShell, PageHeader } from "../components/app-shell";
import { EmployeeTaskBoard } from "../components/employee-task-board";
import { loadDashboardData } from "../lib/dashboard-data";

export const dynamic = "force-dynamic";

export default async function AgentsPage() {
  const data = await loadDashboardData();

  return (
    <AppShell active="settings" pendingApprovalCount={data.pendingApprovalCount}>
      <PageHeader eyebrow="Company Ops" title="会社運用設定" badge={`${data.workingCount}稼働`} />
      <div className="contentGrid singleColumnOnMobile">
        <section className="panel wide">
          <div className="panelHeader">
            <h2>エージェント一覧</h2>
            <span>追加・担当・進捗</span>
          </div>
          <div className="agentToolbar">
            <p>各エージェントの担当、状態、作業中タスクを確認します。</p>
            <button type="button">エージェント追加</button>
          </div>
          <div className="employeeList">
            {data.employees.map((employee) => (
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
            <span>開始・承認待ち・完了・停止</span>
          </div>
          <EmployeeTaskBoard initialEmployeeTasks={data.dashboardEmployeeTasks} />
        </section>
      </div>
    </AppShell>
  );
}
