import { AppShell, PageHeader } from "../components/app-shell";
import { CompanyTaskBoard } from "../components/company-task-board";
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

  return (
    <AppShell active="operations" pendingApprovalCount={data.pendingApprovalCount}>
      <PageHeader eyebrow="Operations" title="運用" badge={`${data.snsOperations.length}件`} />
      <div className="pageTabs operationPageTabs" aria-label="運用ページの切り替え">
        <a href="#creating">作成中</a>
        <a href="#operating">運用中</a>
      </div>

      <section className="operationSummary">
        <article>
          <span>作成中</span>
          <strong>{data.dashboardCompanyTasks.length}件</strong>
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

      <section className="panel wide" id="creating">
        <div className="panelHeader">
          <h2>作成中の案件</h2>
          <span>戦略・企画・投稿文までを作る</span>
        </div>
        <CompanyTaskBoard
          tasks={data.dashboardCompanyTasks}
          contentDrafts={data.dashboardContentDrafts}
          employeeTasks={data.dashboardEmployeeTasks}
          employeeBaseHref="/company#"
        />
      </section>

      <section className="panel wide" id="operating">
        <div className="panelHeader">
          <h2>運用中の案件</h2>
          <span>案件別に投稿内容と進行状況を見る</span>
        </div>
        <div className="operationProjectList">
          {data.snsOperations.map((operation) => {
            const appProjectId = operation.id.replace("operation_", "");
            const drafts = data.dashboardContentDrafts.filter((draft) => draft.appProjectId === appProjectId).slice(0, 3);
            const publishJobs = data.dashboardPublishJobs.filter((job) => drafts.some((draft) => draft.id === job.contentDraftId));
            const latestDraft = drafts[0];
            const latestPublishJob = latestDraft ? publishJobs.find((job) => job.contentDraftId === latestDraft.id) : null;
            const latestPerformance = performanceByProject.get(appProjectId);
            const operationStatus = createOperationStatus({ drafts, publishJobs, latestPerformance });

            return (
              <details className="operationProjectCard" id={`operation-${appProjectId}`} key={operation.id}>
                <summary className="operationProjectHeader">
                  <span className="avatar">{operation.projectName.slice(0, 1)}</span>
                  <div>
                    <strong>{operation.projectName}</strong>
                    <p>{operation.description}</p>
                  </div>
                  <span className={`taskStatus ${operationStatus.status}`}>{operationStatus.label}</span>
                </summary>
                <div className="operationProjectBody">
                  <div className="operationProjectStats">
                    <span>投稿予定<strong>{operation.scheduledCount}件</strong></span>
                    <span>公開待ち<strong>{publishJobs.filter((job) => !["published", "cancelled"].includes(job.status)).length}件</strong></span>
                    <span>公開済み<strong>{operation.publishedCount}件</strong></span>
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
                    <span className={latestDraft ? "active" : ""}><i />受取</span>
                    <span className={publishJobs.length > 0 ? "active" : ""}><i />予約</span>
                    <span className={latestPublishJob?.status === "published" || latestPerformance ? "active" : ""}><i />反応</span>
                    <span className={latestPerformance ? "active" : ""}><i />改善</span>
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
                </div>
              </details>
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
