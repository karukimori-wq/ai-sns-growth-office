import { AppShell, PageHeader } from "../components/app-shell";
import { CompanyTaskBoard } from "../components/company-task-board";
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
  const employeeTaskAliases: Record<string, string[]> = {
    agent_secretary: ["秘書AI"],
    agent_target: ["ターゲット分析AI"],
    agent_customer_insight: ["顧客理解AI"],
    agent_pain: ["悩み分析AI"],
    agent_strategy: ["SNS戦略AI"],
    agent_theme: ["投稿テーマAI", "投稿企画AI"],
    agent_content: ["投稿制作AI"],
    agent_hashtag: ["ハッシュタグAI"],
    agent_image: ["画像方針AI"],
    agent_ops: ["運用AI"],
    agent_analytics: ["分析AI"]
  };
  const employeeRoleLabels: Record<string, string> = {
    agent_secretary: "部署連携",
    agent_target: "対象整理",
    agent_customer_insight: "顧客理解",
    agent_pain: "悩み整理",
    agent_strategy: "SNS方針",
    agent_theme: "投稿テーマ",
    agent_content: "投稿作成",
    agent_hashtag: "タグ作成",
    agent_image: "画像方針",
    agent_ops: "公開運用",
    agent_analytics: "数値確認"
  };

  for (const task of data.dashboardEmployeeTasks) {
    const keys = [task.employeeId, task.employeeName].filter(Boolean);

    for (const key of keys) {
      const current = employeeTasksByEmployee.get(key) ?? [];
      employeeTasksByEmployee.set(key, [...current, task]);
    }
  }
  const activeEmployeeTaskCount = data.dashboardEmployeeTasks.filter((task: EmployeeTask) =>
    ["in_progress", "waiting_approval", "blocked"].includes(task.status)
  ).length;
  const remainingTaskCount = data.dashboardEmployeeTasks.filter((task: EmployeeTask) => !["completed", "cancelled"].includes(task.status)).length;

  return (
    <AppShell active="company" pendingApprovalCount={data.pendingApprovalCount}>
      <PageHeader eyebrow="Company" title="会社" badge="1-3" />
      <div className="pageTabs companyPageTabs" aria-label="会社ページの切り替え">
        <a href="#tasks">タスク</a>
        <a href="#employees">AIエージェント</a>
      </div>

      <section className="panel wide" id="tasks">
        <div className="panelHeader">
          <h2>案件・投稿作成</h2>
          <span>戦略 → 企画 → 投稿を作る</span>
        </div>
        <CompanyTaskBoard
          tasks={data.dashboardCompanyTasks}
          contentDrafts={data.dashboardContentDrafts}
          employeeTasks={data.dashboardEmployeeTasks}
        />
      </section>

      <section className="panel wide" id="employees">
        <div className="panelHeader">
          <h2>AIエージェント</h2>
          <span>{activeEmployeeTaskCount}件進行中</span>
        </div>
        <div className="employeeList">
          {data.employees.map((employee) => (
            (() => {
              const assignedTasks = employeeTasksByEmployee.get(employee.id) ?? employeeTasksByEmployee.get(employee.name) ?? [];
              const aliasTasks = (employeeTaskAliases[employee.id] ?? [])
                .flatMap((alias) => employeeTasksByEmployee.get(alias) ?? [])
                .filter((task, index, tasks) => tasks.findIndex((item) => item.id === task.id) === index);
              const displayTasks = [...assignedTasks, ...aliasTasks].filter(
                (task, index, tasks) => tasks.findIndex((item) => item.id === task.id) === index
              );
              const remainingTasks = displayTasks.filter((task) => !["completed", "cancelled"].includes(task.status));

              return (
                <details className="employeeDetail" id={`employee-${employee.id}`} key={employee.id} open={remainingTasks.length > 0}>
                  <summary className="employeeRow">
                    <div className="avatar">{employee.shortName}</div>
                    <div>
                      <strong>{employee.name}</strong>
                      <p>{employeeRoleLabels[employee.id] ?? employee.currentTask}</p>
                    </div>
                    <span className={`status ${employee.status}`}>{employee.statusLabel}</span>
                    <strong className="remainingTaskCount">{remainingTasks.length}件</strong>
                    <small className="remainingTaskLabel">残タスク</small>
                  </summary>
                  <div className="employeeDetailBody">
                    {displayTasks.length > 0 ? (
                      displayTasks.map((task) => (
                        <article className="employeeAssignment" id={`employee-task-${task.id}`} key={task.id}>
                          <div className="employeeAssignmentHeader">
                            <span className="taskStatus in_progress">案件</span>
                            <div>
                              <small>対象コンテンツ</small>
                              <strong>{instructionProjectNamesById.get(task.instructionId ?? "") ?? "案件未設定"}</strong>
                            </div>
                          </div>
                          <div className="employeeAssignmentBody">
                            <div>
                              <small>社長指示</small>
                              <strong>{instructionTitlesById.get(task.instructionId ?? "") ?? "案件未設定"}</strong>
                            </div>
                            <div>
                              <small>進行中タスク</small>
                              <p>{task.title}</p>
                            </div>
                            <div className="employeeAssignmentMeta">
                              <span className={`taskStatus ${task.status}`}>{task.statusLabel}</span>
                              <span>{task.progress}%</span>
                              <span>{task.outputType}</span>
                            </div>
                            <div className="progressTrack taskProgressTrack">
                              <div style={{ width: `${task.progress}%` }} />
                            </div>
                            <div>
                              <small>成果物・次に見ること</small>
                              <p>{task.deliverable ?? task.output?.nextAction ?? "成果物を作成中です。"}</p>
                            </div>
                          </div>
                        </article>
                      ))
                    ) : (
                      <article className="employeeAssignment">
                        <div className="employeeAssignmentBody">
                          <div>
                            <small>現在の担当</small>
                            <p>{employee.currentTask}</p>
                          </div>
                          <div className="employeeAssignmentMeta">
                            <span className={`taskStatus ${employee.status}`}>{employee.statusLabel}</span>
                            <span>残タスク未設定</span>
                          </div>
                        </div>
                      </article>
                    )}
                  </div>
                </details>
              );
            })()
          ))}
        </div>
      </section>
    </AppShell>
  );
}
