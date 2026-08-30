import { AppShell, PageHeader } from "../components/app-shell";
import { loadDashboardData } from "../lib/dashboard-data";
import type { ContentDraft, PerformanceSnapshot, PublishJob } from "../lib/dashboard-data";

export const dynamic = "force-dynamic";

export default async function OperationsPage() {
  const data = await loadDashboardData();
  const todayScheduledCount = data.snsOperations.reduce((total, operation) => total + operation.scheduledCount, 0);
  const publishedCount = data.snsOperations.reduce((total, operation) => total + operation.publishedCount, 0);
  const operatingDraftCount = data.dashboardContentDrafts.length;
  const waitingPublishCount = data.dashboardPublishJobs.filter((job) => !["published", "cancelled"].includes(job.status)).length;
  const reactionInputCount = data.dashboardPerformanceSnapshots.length;
  const performanceByProject = latestPerformanceByProject(data.dashboardPerformanceSnapshots);
  const primaryImprovementAction = data.performanceActionPlan.actions[0] ?? null;

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
        <article>
          <span>反応入力</span>
          <strong>{reactionInputCount}件</strong>
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
            const latestPerformance = performanceByProject.get(appProjectId);
            const operationStatus = createOperationStatus({ drafts, publishJobs, latestPerformance });

            return (
              <article className="operationProjectCard" id={`operation-${appProjectId}`} key={operation.id}>
                <div className="operationProjectHeader">
                  <span className="avatar">{operation.projectName.slice(0, 1)}</span>
                  <div>
                    <strong>{operation.projectName}</strong>
                    <p>{operation.description}</p>
                  </div>
                  <span className={`taskStatus ${operationStatus.status}`}>{operationStatus.label}</span>
                </div>
                <div className="operationProjectStats">
                  <span>投稿予定 <strong>{operation.scheduledCount}件</strong></span>
                  <span>公開待ち <strong>{publishJobs.filter((job) => !["published", "cancelled"].includes(job.status)).length}件</strong></span>
                  <span>公開済み <strong>{operation.publishedCount}件</strong></span>
                </div>
                <div className="operationDraftPreview">
                  <span>投稿内容</span>
                  {drafts.length > 0 ? (
                    <div className="operationDraftList">
                      {drafts.map((draft) => {
                        const publishJob = publishJobs.find((job) => job.contentDraftId === draft.id);

                        return (
                          <article key={draft.id}>
                            <div>
                              <strong>{draft.title}</strong>
                              <p>{draft.body}</p>
                              <small>CTA: {draft.cta}</small>
                            </div>
                            <em>{publishJob ? publishStatusLabel(publishJob.status) : "予約待ち"}</em>
                          </article>
                        );
                      })}
                    </div>
                  ) : (
                    <p>会社で投稿文が承認されると、ここに表示されます。</p>
                  )}
                </div>
                <div className="operationPipeline">
                  <span className={latestDraft ? "active" : ""}>受取</span>
                  <span className={publishJobs.length > 0 ? "active" : ""}>予約</span>
                  <span className={latestPublishJob?.status === "published" || latestPerformance ? "active" : ""}>反応</span>
                  <span className={latestPerformance ? "active" : ""}>改善</span>
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
          {data.snsOperations.slice(0, 4).map((operation) => {
            const appProjectId = operation.id.replace("operation_", "");
            const latestPerformance = performanceByProject.get(appProjectId);
            const improvementAction = latestPerformance ? primaryImprovementAction : null;

            return (
              <article id={`operation-analysis-${appProjectId}`} key={`${operation.id}-insight`}>
                <strong>{operation.projectName}</strong>
                <div className="operationInsightMetrics">
                  <span>表示 {formatMetric(latestPerformance, "impressions")}</span>
                  <span>遷移 {formatMetric(latestPerformance, "profile_visits")}</span>
                  <span>CTA {formatMetric(latestPerformance, "cta_clicks")}</span>
                </div>
                <p id={`operation-reactions-${appProjectId}`}>{createReactionSummary(latestPerformance)}</p>
                <div className="operationImprovement">
                  <span>改善</span>
                  <strong>{improvementAction?.title ?? "反応入力後に改善案を作成"}</strong>
                  <p>{improvementAction?.action ?? "公開後にコメント・DM・クリック・問い合わせを記録して、次の企画へ戻します。"}</p>
                </div>
              </article>
            );
          })}
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

function latestPerformanceByProject(snapshots: PerformanceSnapshot[]) {
  const sortedSnapshots = [...snapshots].sort((a, b) => b.date.localeCompare(a.date));
  const performanceByProject = new Map<string, PerformanceSnapshot>();

  for (const snapshot of sortedSnapshots) {
    if (snapshot.appProjectId && !performanceByProject.has(snapshot.appProjectId)) {
      performanceByProject.set(snapshot.appProjectId, snapshot);
    }
  }

  return performanceByProject;
}

function createOperationStatus({
  drafts,
  publishJobs,
  latestPerformance
}: {
  drafts: ContentDraft[];
  publishJobs: PublishJob[];
  latestPerformance?: PerformanceSnapshot;
}) {
  if (latestPerformance) return { status: "completed", label: "改善中" };
  if (publishJobs.some((job) => !["published", "cancelled"].includes(job.status))) {
    return { status: "queued", label: "予約管理" };
  }
  if (publishJobs.some((job) => job.status === "published")) return { status: "in_progress", label: "反応確認" };
  if (drafts.length > 0) return { status: "in_progress", label: "投稿受取" };
  return { status: "queued", label: "受取待ち" };
}

function formatMetric(snapshot: PerformanceSnapshot | undefined, key: string) {
  const value = snapshot?.metrics[key];
  if (typeof value === "number") return value.toLocaleString("ja-JP");
  return "未入力";
}

function createReactionSummary(snapshot: PerformanceSnapshot | undefined) {
  if (!snapshot) return "公開後にコメント・DM・クリック・問い合わせを記録します。";

  const impressions = typeof snapshot.metrics.impressions === "number" ? snapshot.metrics.impressions : 0;
  const profileVisits = typeof snapshot.metrics.profile_visits === "number" ? snapshot.metrics.profile_visits : 0;
  const ctaClicks = snapshot.metrics.cta_clicks;

  if (ctaClicks === null || ctaClicks === undefined) {
    return `表示${impressions.toLocaleString("ja-JP")}、プロフィール遷移${profileVisits.toLocaleString("ja-JP")}。CTAクリックは未入力のため、導線確認を次アクションにします。`;
  }

  return `表示${impressions.toLocaleString("ja-JP")}、プロフィール遷移${profileVisits.toLocaleString("ja-JP")}、CTA${Number(ctaClicks).toLocaleString("ja-JP")}。次の投稿企画へ反映します。`;
}
