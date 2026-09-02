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
          <span>予約待ち</span>
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
            const draftRows = drafts.map((draft) => ({
              draft,
              publishJob: publishJobs.find((job) => job.contentDraftId === draft.id) ?? null
            }));
            const latestDraft = drafts[0];
            const latestPublishJob = latestDraft ? publishJobs.find((job) => job.contentDraftId === latestDraft.id) : null;
            const latestPerformance = performanceByProject.get(appProjectId);
            const operationStatus = createOperationStatus({ drafts, publishJobs, latestPerformance });
            const nextAction = createOperationNextAction({ drafts, publishJobs, latestPerformance, nextPostAt: operation.nextPostAt });
            const reservedCount = draftRows.filter(({ publishJob }) =>
              publishJob ? !["published", "cancelled"].includes(publishJob.status) : false
            ).length;
            const publishedDraftCount = draftRows.filter(({ publishJob }) => publishJob?.status === "published").length;

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
                  <div className="operationNextAction">
                    <span>{nextAction.badge}</span>
                    <div>
                      <strong>{nextAction.title}</strong>
                      <p>{nextAction.detail}</p>
                    </div>
                  </div>
                  <div className="operationProjectStats">
                    <span>投稿内容<strong>{draftRows.length}件</strong></span>
                    <span>予約済み<strong>{reservedCount}件</strong></span>
                    <span>公開済み<strong>{publishedDraftCount}件</strong></span>
                  </div>
                  <div className="operationDraftPreview">
                    <span>投稿内容</span>
                    {drafts.length > 0 ? (
                      <div className="operationDraftList">
                        {draftRows.map(({ draft, publishJob }) => {
                          return (
                            <article key={draft.id}>
                              <div>
                                <div className="operationDraftHeader">
                                  <strong>{draft.title}</strong>
                                  <em>{publishJob ? publishStatusLabel(publishJob.status) : "予約待ち"}</em>
                                </div>
                                <div className="operationDraftMeta">
                                  <span>{draftChannelLabel(draft)}</span>
                                  <span>{draftScheduleLabel({ publishJob, fallback: operation.nextPostAt })}</span>
                                </div>
                                <p>{draft.body}</p>
                                <small>CTA: {draft.cta}</small>
                              </div>
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
                </div>
              </details>
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

function draftChannelLabel(draft: ContentDraft) {
  const channel = draft.channelVariants?.[0]?.channel ?? draft.channel ?? "SNS未設定";
  const format = draft.channelVariants?.[0]?.format ?? draft.format;

  return format ? `${channel} / ${format}` : channel;
}

function draftScheduleLabel({ publishJob, fallback }: { publishJob?: PublishJob | null; fallback: string }) {
  if (publishJob?.publishedAt) return `公開済み: ${publishJob.publishedAt}`;
  if (publishJob?.scheduledFor) return `予定: ${publishJob.scheduledFor}`;
  if (publishJob && publishJob.status !== "published") return `予定: ${fallback}`;
  return "予定未設定";
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

function createOperationNextAction({
  drafts,
  publishJobs,
  latestPerformance,
  nextPostAt
}: {
  drafts: ContentDraft[];
  publishJobs: PublishJob[];
  latestPerformance?: PerformanceSnapshot;
  nextPostAt: string;
}) {
  const waitingPublishJob = publishJobs.find((job) => !["published", "cancelled"].includes(job.status));

  if (!drafts.length) {
    return {
      badge: "受取待ち",
      title: "会社で承認された投稿を待つ",
      detail: "投稿文が承認されると、ここで予約と公開管理に進めます。"
    };
  }

  if (waitingPublishJob) {
    return {
      badge: "次の投稿",
      title: `${nextPostAt} に公開予定`,
      detail: `${drafts[0].title} / ${publishStatusLabel(waitingPublishJob.status)}`
    };
  }

  if (publishJobs.some((job) => job.status === "published") && !latestPerformance) {
    return {
      badge: "反応待ち",
      title: "投稿後の反応を確認",
      detail: "表示、保存、クリックなどの数字を入力すると改善判断へ進めます。"
    };
  }

  if (latestPerformance) {
    return {
      badge: "改善",
      title: "次の企画へ反映",
      detail: "反応結果を見て、次の投稿テーマやCTAを見直します。"
    };
  }

  return {
    badge: "予約待ち",
    title: "投稿日時を決める",
    detail: `${drafts[0].title} を予約できる状態です。`
  };
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
