import { AppShell, PageHeader } from "../components/app-shell";
import { ExecutionQueue } from "../components/execution-queue";
import { loadDashboardData } from "../lib/dashboard-data";

export const dynamic = "force-dynamic";

export default async function OperationsPage() {
  const data = await loadDashboardData();
  const todayScheduledCount = data.snsOperations.reduce((total, operation) => total + operation.scheduledCount, 0);
  const publishedCount = data.snsOperations.reduce((total, operation) => total + operation.publishedCount, 0);

  return (
    <AppShell active="operations" pendingApprovalCount={data.pendingApprovalCount}>
      <PageHeader eyebrow="Operations" title="運用" badge="SNS" />

      <section className="operationSummary">
        <article>
          <span>今日の投稿予定</span>
          <strong>{todayScheduledCount}件</strong>
        </article>
        <article>
          <span>承認待ち</span>
          <strong>{data.pendingApprovalCount}件</strong>
        </article>
        <article>
          <span>公開済み</span>
          <strong>{publishedCount}件</strong>
        </article>
      </section>

      <section className="panel wide">
        <div className="panelHeader">
          <h2>案件別運用</h2>
          <span>投稿数、次の予定、担当AIを見る</span>
        </div>
        <div className="operationProjectList">
          {data.snsOperations.map((operation) => (
            <article className="operationProjectCard" key={operation.id}>
              <div className="operationProjectHeader">
                <span className="avatar">{operation.projectName.slice(0, 1)}</span>
                <div>
                  <strong>{operation.projectName}</strong>
                  <p>{operation.description}</p>
                </div>
                <span className={`taskStatus ${operation.status}`}>{operation.statusLabel}</span>
              </div>
              <div className="operationProjectStats">
                <span>投稿予定 <strong>{operation.scheduledCount}件</strong></span>
                <span>承認待ち <strong>{operation.pendingApprovalCount}件</strong></span>
                <span>公開済み <strong>{operation.publishedCount}件</strong></span>
              </div>
              <div className="operationProjectMeta">
                <span>次の投稿: {operation.nextPostAt}</span>
                <span>担当: {operation.owner}</span>
              </div>
              <div className="operationProjectActions">
                <a className="detailLink" href="/company#tasks">投稿案を見る</a>
                <a className="detailLink" href="#today-schedule">予定を見る</a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel wide" id="today-schedule">
        <div className="panelHeader">
          <h2>今日の投稿予定</h2>
          <a className="panelHeaderLink" href="#execution-queue">実行キューへ</a>
        </div>
        <div className="todayPostList">
          {data.snsOperations.slice(0, 3).map((operation, index) => (
            <article key={`${operation.id}-today`}>
              <span>{index === 0 ? "10:00" : index === 1 ? "14:00" : "18:00"}</span>
              <strong>{operation.projectName}</strong>
              <small>{index === 0 ? "事例投稿" : index === 1 ? "課題投稿" : "信頼投稿"}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="panel wide" id="execution-queue">
        <div className="panelHeader">
          <h2>運用ルール・実行キュー</h2>
          <span>投稿時間、承認フロー、公開記録</span>
        </div>
        <ExecutionQueue initialMediaUploadJobs={data.dashboardMediaUploadJobs} initialPublishJobs={data.dashboardPublishJobs} />
      </section>
    </AppShell>
  );
}
