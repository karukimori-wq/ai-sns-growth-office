import { AppShell, PageHeader } from "../components/app-shell";
import { loadDashboardData } from "../lib/dashboard-data";

export const dynamic = "force-dynamic";

export default async function OperationsPage() {
  const data = await loadDashboardData();
  const todayScheduledCount = data.snsOperations.reduce((total, operation) => total + operation.scheduledCount, 0);
  const publishedCount = data.snsOperations.reduce((total, operation) => total + operation.publishedCount, 0);
  const reactionCheckCount = data.dashboardPublishJobs.filter((job) => job.status === "published").length + publishedCount;
  const operatingDraftCount = data.dashboardContentDrafts.length;
  const waitingPublishCount = data.dashboardPublishJobs.filter((job) => !["published", "cancelled"].includes(job.status)).length;

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

      {data.pendingApprovalCount > 0 ? (
        <a className="approvalRouteNotice" href="/instructions#approval-center">
          <span>承認 {data.pendingApprovalCount}</span>
          <strong>判断が必要なものは指示メニューで確認</strong>
        </a>
      ) : null}

      <section className="operationSummary">
        <article>
          <span>運用中投稿</span>
          <strong>{operatingDraftCount}件</strong>
        </article>
        <article>
          <span>予約・公開待ち</span>
          <strong>{waitingPublishCount}件</strong>
        </article>
        <article>
          <span>今日の投稿</span>
          <strong>{publishedCount}/{todayScheduledCount}</strong>
        </article>
      </section>

      <section className="panel wide">
        <div className="panelHeader">
          <h2>運用中の案件</h2>
          <span>投稿内容・予定・反応・改善を案件別に見る</span>
        </div>
        <div className="operationProjectList">
          {data.snsOperations.map((operation, index) => {
            const appProjectId = operation.id.replace("operation_", "");
            const drafts = data.dashboardContentDrafts.filter((draft) => draft.appProjectId === appProjectId).slice(0, 3);
            const publishJobs = data.dashboardPublishJobs.filter((job) => drafts.some((draft) => draft.id === job.contentDraftId));
            const latestDraft = drafts[0];
            const latestPublishJob = latestDraft ? publishJobs.find((job) => job.contentDraftId === latestDraft.id) : null;

            return (
              <article className="operationProjectCard" id={`operation-${appProjectId}`} key={operation.id}>
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
                  <span>公開待ち <strong>{publishJobs.filter((job) => !["published", "cancelled"].includes(job.status)).length}件</strong></span>
                  <span>公開済み <strong>{operation.publishedCount}件</strong></span>
                </div>
                <div className="operationDraftPreview">
                  <span>投稿内容</span>
                  {latestDraft ? (
                    <>
                      <strong>{latestDraft.title}</strong>
                      <p>{latestDraft.body}</p>
                      <small>CTA: {latestDraft.cta}</small>
                    </>
                  ) : (
                    <p>会社で投稿文が承認されると、ここに表示されます。</p>
                  )}
                </div>
                <div className="operationPipeline">
                  <span className={latestDraft ? "active" : ""}>受取</span>
                  <span className={latestPublishJob ? "active" : ""}>予約</span>
                  <span className={latestPublishJob?.status === "published" ? "active" : ""}>反応</span>
                  <span className={index === 0 ? "active" : ""}>改善</span>
                </div>
                <div className="operationProjectMeta">
                  <span>次の投稿: {operation.nextPostAt}</span>
                  <span>担当: {operation.owner}</span>
                  <span>{latestPublishJob ? publishStatusLabel(latestPublishJob.status) : "予約未設定"}</span>
                </div>
                <div className="operationProjectActions">
                  <a className="detailLink" href={`#operation-schedule-${appProjectId}`}>予定</a>
                  <a className="detailLink" href={`#operation-reactions-${appProjectId}`}>反応</a>
                  <a className="detailLink primaryInlineLink" href={`#operation-analysis-${appProjectId}`}>分析</a>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="panel wide" id="today-schedule">
        <div className="panelHeader">
          <h2>4. 投稿予定</h2>
          <span>今日だけではなく、次に出す投稿まで見る</span>
        </div>
        <div className="operationScheduleList">
          {data.snsOperations.map((operation, index) => {
            const appProjectId = operation.id.replace("operation_", "");
            const draft = data.dashboardContentDrafts.find((item) => item.appProjectId === appProjectId);

            return (
              <article id={`operation-schedule-${appProjectId}`} key={`${operation.id}-schedule`}>
                <span>{operation.nextPostAt}</span>
                <div>
                  <strong>{draft?.title ?? operation.projectName}</strong>
                  <small>{draft?.body ?? "会社から投稿文が引き渡されたら予定化します。"}</small>
                </div>
                <em>{index === 0 ? "今日" : index === 1 ? "次回" : "準備中"}</em>
              </article>
            );
          })}
        </div>
      </section>

      <section className="panel wide">
        <div className="panelHeader">
          <h2>5-7. 反応・分析・改善</h2>
          <span>投稿後の反応を見て、次の企画へ戻す</span>
        </div>
        <div className="operationInsightGrid">
          {data.snsOperations.slice(0, 4).map((operation, index) => (
            <article id={`operation-analysis-${operation.id.replace("operation_", "")}`} key={`${operation.id}-insight`}>
              <strong>{operation.projectName}</strong>
              <div className="operationInsightMetrics">
                <span>表示 {index === 0 ? "1,240" : index === 1 ? "860" : "未入力"}</span>
                <span>保存 {index === 0 ? "18" : index === 1 ? "9" : "未入力"}</span>
                <span>CTA {index === 0 ? "7" : index === 1 ? "3" : "未入力"}</span>
              </div>
              <p id={`operation-reactions-${operation.id.replace("operation_", "")}`}>
                {index === 0
                  ? "無料チェックへの反応あり。導入文を短くして次回も継続。"
                  : index === 1
                    ? "共感系は保存が弱め。実例を先に出して改善。"
                    : "反応入力待ち。公開後にコメント・DM・クリックを記録。"}
              </p>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}

function publishStatusLabel(status: string) {
  if (status === "queued") return "予約済み";
  if (status === "manual_required") return "手動対応";
  if (status === "published") return "公開済み";
  if (status === "cancelled") return "停止";
  return "予約確認";
}
