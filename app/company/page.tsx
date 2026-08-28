import { AppShell, PageHeader } from "../components/app-shell";
import { CompanyTaskBoard } from "../components/company-task-board";
import { EmployeeTaskBoard } from "../components/employee-task-board";
import type { EmployeeTask } from "../components/employee-task-board";
import { loadDashboardData } from "../lib/dashboard-data";

export const dynamic = "force-dynamic";

export default async function CompanyPage() {
  const data = await loadDashboardData();
  const instructionTitlesById = new Map(data.dashboardCeoInstructions.map((instruction) => [instruction.id, instruction.title]));
  const projectNamesById = new Map(data.dashboardAppProjects.map((project) => [project.id, project.name]));
  const instructionProjectNamesById = new Map(
    data.dashboardCeoInstructions.map((instruction) => [
      instruction.id,
      instruction.appProjectId ? (projectNamesById.get(instruction.appProjectId) ?? instruction.appProjectId) : "未紐づけ"
    ])
  );
  const employeeTasksByEmployee = new Map<string, EmployeeTask[]>();

  for (const task of data.dashboardEmployeeTasks) {
    const keys = [task.employeeId, task.employeeName].filter(Boolean);

    for (const key of keys) {
      const current = employeeTasksByEmployee.get(key) ?? [];
      employeeTasksByEmployee.set(key, [...current, task]);
    }
  }

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
            (() => {
              const assignedTasks = employeeTasksByEmployee.get(employee.id) ?? employeeTasksByEmployee.get(employee.name) ?? [];

              return (
                <details className="employeeDetail" key={employee.id}>
                  <summary className="employeeRow">
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
                  </summary>
                  <div className="employeeDetailBody">
                    {assignedTasks.length > 0 ? (
                      assignedTasks.map((task) => (
                        <article className="employeeAssignment" key={task.id}>
                          <div>
                            <span>{instructionProjectNamesById.get(task.instructionId ?? "") ?? "案件未設定"}</span>
                            <strong>{instructionTitlesById.get(task.instructionId ?? "") ?? "案件未設定"}</strong>
                          </div>
                          <p>{task.title}</p>
                          <small>
                            {task.statusLabel} / {task.progress}% / {task.outputType}
                          </small>
                          <small>{task.deliverable ?? task.output?.nextAction ?? "成果物を作成中です。"}</small>
                        </article>
                      ))
                    ) : (
                      <p className="muted">この社員に紐づく進行中タスクはまだありません。</p>
                    )}
                  </div>
                </details>
              );
            })()
          ))}
        </div>
        <div className="sectionDivider" />
        <EmployeeTaskBoard initialEmployeeTasks={data.dashboardEmployeeTasks} />
      </section>
    </AppShell>
  );
}
