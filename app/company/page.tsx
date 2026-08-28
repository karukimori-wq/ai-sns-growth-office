import { AppShell, PageHeader } from "../components/app-shell";
import { CompanyTaskBoard } from "../components/company-task-board";
import { EmployeeTaskBoard } from "../components/employee-task-board";
import { loadDashboardData } from "../lib/dashboard-data";

export const dynamic = "force-dynamic";

export default async function CompanyPage() {
  const data = await loadDashboardData();

  return (
    <AppShell active="company" pendingApprovalCount={data.pendingApprovalCount}>
      <PageHeader eyebrow="Company" title="会社" badge={`${data.dashboardCompanyTasks.length}案件`} />
      <div className="pageTabs companyPageTabs" aria-label="会社ページの切り替え">
        <a href="#tasks">タスク</a>
        <a href="#employees">社員</a>
      </div>
      <section className="panel wide" id="tasks">
        <div className="panelHeader">
          <h2>案件一覧</h2>
          <span>折りたたみで確認、投稿テーマや公開予定もここから見る</span>
        </div>
        <CompanyTaskBoard
          tasks={data.dashboardCompanyTasks}
          contentDrafts={data.dashboardContentDrafts}
          publishJobs={data.dashboardPublishJobs}
        />
      </section>

      <section className="panel wide" id="employees">
        <div className="panelHeader">
          <h2>社員</h2>
          <span>担当と進捗</span>
        </div>
        <div className="agentToolbar">
          <p>各AI社員の担当、状態、作業中タスクを確認します。</p>
          <button type="button">社員追加</button>
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
        <div className="sectionDivider" />
        <EmployeeTaskBoard initialEmployeeTasks={data.dashboardEmployeeTasks} />
      </section>
    </AppShell>
  );
}
