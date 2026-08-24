import {
  approvalRequests,
  companyTasks,
  dashboardStats,
  employees,
  todaySchedule
} from "../src/domain/seed.mjs";

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
        </div>
      </section>
    </main>
  );
}
