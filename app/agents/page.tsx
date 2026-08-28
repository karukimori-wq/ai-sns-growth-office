import { AppShell, PageHeader } from "../components/app-shell";
import { ApprovalPolicyManager } from "../components/approval-policy-manager";
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
            <span>担当・状態・運用役割</span>
          </div>
          <div className="agentToolbar">
            <p>今のMVPで稼働するAI社員です。追加操作はまだ持たせず、必要な社員はここで構成として管理します。</p>
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
            <h2>承認・委任ルール</h2>
            <span>社長承認が必要なものを明確化</span>
          </div>
          <ApprovalPolicyManager initialPolicies={data.approvalPolicies} />
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
