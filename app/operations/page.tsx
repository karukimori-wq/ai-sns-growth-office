import { AppShell, PageHeader } from "../components/app-shell";
import { ExecutionQueue } from "../components/execution-queue";
import { loadDashboardData } from "../lib/dashboard-data";

export const dynamic = "force-dynamic";

export default async function OperationsPage() {
  const data = await loadDashboardData();
  const todayScheduledCount = data.snsOperations.reduce((total, operation) => total + operation.scheduledCount, 0);
  const publishedCount = data.snsOperations.reduce((total, operation) => total + operation.publishedCount, 0);
  const reactionCheckCount = data.dashboardPublishJobs.filter((job) => job.status === "published").length + publishedCount;
  const mediaWaitingCount = data.dashboardMediaUploadJobs.filter((job) => job.status === "queued").length;
  const publishWaitingCount = data.dashboardPublishJobs.filter((job) => !["published", "cancelled"].includes(job.status)).length;
  const nextAction =
    data.pendingApprovalCount > 0
      ? {
          label: "社長の承認待ち",
          title: `${data.pendingApprovalCount}件を確認する`,
          description: "承認後、予約・公開管理へ進みます。",
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
      <PageHeader eyebrow="Operations" title="運用" badge="4-7" />

      <section className="snsStagePanel" aria-label="運用で行うSNS運用ステップ">
        <article>
          <span>4</span>
          <strong>管理</strong>
          <small>日時 / 予約 / 展開 / 漏れ確認</small>
        </article>
        <article>
          <span>5</span>
          <strong>反応</strong>
          <small>コメント / DM / 質問 / ネガ反応</small>
        </article>
        <article>
          <span>6</span>
          <strong>分析</strong>
          <small>表示 / 保存 / クリック / 問合せ</small>
        </article>
        <article>
          <span>7</span>
          <strong>改善</strong>
          <small>伸びたテーマを次の企画へ</small>
        </article>
      </section>

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
          <span>反応確認</span>
          <strong>{reactionCheckCount}件</strong>
        </article>
        <article>
          <span>公開済み</span>
          <strong>{publishedCount}件</strong>
        </article>
      </section>

      <section className="panel wide">
        <div className="panelHeader">
          <h2>案件別 投稿管理</h2>
          <span>投稿日時・予約・展開・漏れ確認</span>
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
                <a className="detailLink" href="#today-schedule">予定</a>
                <a className="detailLink" href="#execution-queue">公開</a>
                {operation.pendingApprovalCount > 0 ? (
                  <a className="detailLink primaryInlineLink" href="/instructions#approval-center">承認へ</a>
                ) : (
                  <a className="detailLink primaryInlineLink" href="#daily-metrics">分析へ</a>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel wide" id="today-schedule">
        <div className="panelHeader">
          <h2>4. 投稿管理</h2>
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
          <h2>4-7. 公開後の運用</h2>
          <span>予約 → 公開 → 反応 → 分析 → 改善</span>
        </div>
        <ExecutionQueue initialMediaUploadJobs={data.dashboardMediaUploadJobs} initialPublishJobs={data.dashboardPublishJobs} />
      </section>
    </AppShell>
  );
}
