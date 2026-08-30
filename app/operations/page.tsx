import { AppShell, PageHeader } from "../components/app-shell";
import { ExecutionQueue } from "../components/execution-queue";
import { loadDashboardData } from "../lib/dashboard-data";

export const dynamic = "force-dynamic";

export default async function OperationsPage() {
  const data = await loadDashboardData();
  const todayScheduledCount = data.snsOperations.reduce((total, operation) => total + operation.scheduledCount, 0);
  const publishedCount = data.snsOperations.reduce((total, operation) => total + operation.publishedCount, 0);
  const mediaWaitingCount = data.dashboardMediaUploadJobs.filter((job) => job.status === "queued").length;
  const publishWaitingCount = data.dashboardPublishJobs.filter((job) => !["published", "cancelled"].includes(job.status)).length;
  const nextAction =
    data.pendingApprovalCount > 0
      ? {
          label: "社長の承認待ち",
          title: `${data.pendingApprovalCount}件を確認する`,
          description: "承認すると、画像準備と公開待ちへ進みます。",
          href: "/instructions#approval-center",
          action: "承認を見る"
        }
      : mediaWaitingCount > 0
        ? {
            label: "画像準備待ち",
            title: `${mediaWaitingCount}件の画像を準備する`,
            description: "使える画像だけ「画像準備OK」にします。",
            href: "#execution-queue",
            action: "画像準備へ"
          }
        : publishWaitingCount > 0
          ? {
              label: "公開待ち",
              title: `${publishWaitingCount}件を公開する`,
              description: "公開後は「公開済みにする」で記録します。",
              href: "#execution-queue",
              action: "公開管理へ"
            }
          : {
              label: "運用は順調",
              title: "投稿後の反応を見る",
              description: "数字を入れると、次の改善タスクが作れます。",
              href: "#daily-metrics",
              action: "数字を入れる"
            };

  return (
    <AppShell active="operations" pendingApprovalCount={data.pendingApprovalCount}>
      <PageHeader eyebrow="Operations" title="運用" badge="SNS" />

      <section className="nextActionPanel">
        <div>
          <span>{nextAction.label}</span>
          <h2>{nextAction.title}</h2>
          <p>{nextAction.description}</p>
        </div>
        <a className="primaryActionLink" href={nextAction.href}>{nextAction.action}</a>
      </section>

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
          <span>案件を選んで、投稿案・予定・承認へ進む</span>
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
                {operation.pendingApprovalCount > 0 ? (
                  <a className="detailLink primaryInlineLink" href="/instructions#approval-center">承認へ</a>
                ) : (
                  <a className="detailLink primaryInlineLink" href="#execution-queue">公開管理へ</a>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel wide" id="today-schedule">
        <div className="panelHeader">
          <h2>今日の投稿予定</h2>
          <a className="panelHeaderLink" href="#execution-queue">公開前チェックへ</a>
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
          <h2>公開前チェック・実行管理</h2>
          <span>画像OK → 公開済み → 数字入力</span>
        </div>
        <ExecutionQueue initialMediaUploadJobs={data.dashboardMediaUploadJobs} initialPublishJobs={data.dashboardPublishJobs} />
      </section>
    </AppShell>
  );
}
