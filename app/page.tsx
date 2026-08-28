import { AppShell, PageHeader } from "./components/app-shell";
import { loadDashboardData } from "./lib/dashboard-data";

export const dynamic = "force-dynamic";

const statTone: Record<string, string> = {
  "稼働AI": "teal",
  "進行中": "blue",
  "本日完了": "green",
  "要確認": "amber"
};

export default async function Home() {
  const data = await loadDashboardData();

  return (
    <AppShell active="dashboard" pendingApprovalCount={data.pendingApprovalCount}>
      <PageHeader eyebrow="CEO View" title="ダッシュボード" badge="社長" />

      <section className="statsGrid" aria-label="主要指標">
        {data.dashboardStats.map((stat) => (
          <article className={`statCard ${statTone[stat.label]}`} key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
            <small>{stat.caption}</small>
          </article>
        ))}
      </section>

      <section className="snapshotPanel" aria-label="社長運用スナップショット">
        <div>
          <p className="eyebrow">Operating Snapshot</p>
          <h2>{data.ceoOperatingSnapshot.appProjectName} 今日の判断</h2>
          <p>{data.ceoOperatingSnapshot.executiveSummary}</p>
        </div>
        <div className="snapshotMetrics">
          <a href="/agents">
            <span>動いている</span>
            <strong>{data.workingCount}</strong>
            <small>稼働中エージェント</small>
          </a>
          <a href="/instructions">
            <span>待っている</span>
            <strong>{data.waitingForCeoCount}</strong>
            <small>社長判断・承認待ち</small>
          </a>
          <a href="/company">
            <span>止まっている</span>
            <strong>{data.stoppedCount}</strong>
            <small>ゲート停止・手動対応</small>
          </a>
        </div>
        <div className="snapshotActions">
          {data.snapshotNextActions.slice(0, 3).map((action) => (
            <a className="snapshotActionCard" href="/instructions" key={action.id}>
              <span>{action.owner}</span>
              <strong>{action.title}</strong>
              <p>{action.action}</p>
            </a>
          ))}
          <a className="detailLink" href="/instructions">社長アクションを見る</a>
          <a className="detailLink" href="/company">会社タスクを見る</a>
        </div>
      </section>

      {data.repositoryReadiness.databaseBackedPersistenceReady ? null : (
        <section className="systemNotice" aria-label="システム通知">
          <strong>保存基盤の確認が必要です</strong>
          <span>{data.repositoryReadiness.issues[0] ?? "永続化の状態を確認してください。"}</span>
        </section>
      )}

      <section className="contentGrid dashboardGrid">
        <a className="panel navigationPanel" href="/instructions">
          <strong>指示・承認</strong>
          <p>社長指示、秘書Inbox、承認センターを開く</p>
          <span className="taskStatus waiting_approval">{data.pendingApprovalCount}件</span>
        </a>
        <a className="panel navigationPanel" href="/company">
          <strong>会社タスク</strong>
          <p>案件ごとの進行状況と中止操作を確認</p>
          <span className="taskStatus in_progress">{data.dashboardCompanyTasks.length}件</span>
        </a>
        <a className="panel navigationPanel" href="/content">
          <strong>コンテンツ管理</strong>
          <p>集客対象のアプリ、イベント、サービスを登録</p>
          <span className="taskStatus queued">{data.dashboardMarketingContents.length}件</span>
        </a>
        <a className="panel navigationPanel" href="/media">
          <strong>画像管理</strong>
          <p>画像アセットを別ページで確認</p>
          <span className="taskStatus waiting_approval">{data.dashboardMediaAssets.length}件</span>
        </a>
      </section>
    </AppShell>
  );
}
