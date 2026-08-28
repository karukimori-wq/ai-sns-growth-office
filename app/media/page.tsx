import { mediaAssets } from "../../src/domain/seed.mjs";
import { getRepositoryRuntime } from "../../src/domain/repository-runtime.mjs";
import type { DashboardMediaAsset } from "../components/dashboard-events";
import { MediaAssetBoard } from "../components/media-asset-board";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  const { repository } = getRepositoryRuntime();
  const persistedMediaAssets = await repository.listMediaAssets();
  const dashboardMediaAssets = (persistedMediaAssets.length > 0 ? persistedMediaAssets : mediaAssets) as DashboardMediaAsset[];
  const waitingCount = dashboardMediaAssets.filter((asset) => asset.status === "waiting_approval").length;

  return (
    <main className="singlePageShell">
      <header className="singlePageHeader">
        <div>
          <p className="eyebrow">Media Assets</p>
          <h1>画像管理</h1>
          <p>投稿用の画像案、承認待ち、使用可否をここで確認します。</p>
        </div>
        <a className="detailLink" href="/#settings">
          ダッシュボードへ戻る
        </a>
      </header>

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
    </main>
  );
}
