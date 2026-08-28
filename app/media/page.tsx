import { mediaAssets } from "../../src/domain/seed.mjs";
import { getRepositoryRuntime } from "../../src/domain/repository-runtime.mjs";
import { AppShell, PageHeader } from "../components/app-shell";
import type { DashboardMediaAsset } from "../components/dashboard-events";
import { MediaAssetBoard } from "../components/media-asset-board";
import { loadDashboardData } from "../lib/dashboard-data";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  const { repository } = getRepositoryRuntime();
  const [dashboardData, persistedMediaAssets] = await Promise.all([
    loadDashboardData(),
    repository.listMediaAssets()
  ]);
  const dashboardMediaAssets = (persistedMediaAssets.length > 0 ? persistedMediaAssets : mediaAssets) as DashboardMediaAsset[];
  const waitingCount = dashboardMediaAssets.filter((asset) => asset.status === "waiting_approval").length;

  return (
    <AppShell active="settings" pendingApprovalCount={dashboardData.pendingApprovalCount}>
      <PageHeader eyebrow="Media Assets" title="画像管理" badge={`${dashboardMediaAssets.length}件`} />

      <section className="statsGrid" aria-label="画像管理サマリー">
        <article className="statCard amber">
          <span>確認待ち</span>
          <strong>{waitingCount}</strong>
          <small>社長判断が必要な画像</small>
        </article>
        <article className="statCard teal">
          <span>画像案</span>
          <strong>{dashboardMediaAssets.length}</strong>
          <small>現在登録されている画像アセット</small>
        </article>
      </section>

      <section className="panel wide">
        <div className="panelHeader">
          <h2>画像アセット一覧</h2>
          <span>投稿に使う前に確認</span>
        </div>
        <MediaAssetBoard initialMediaAssets={dashboardMediaAssets} />
      </section>
    </AppShell>
  );
}
