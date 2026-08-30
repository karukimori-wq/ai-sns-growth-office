import { AppShell, PageHeader } from "../components/app-shell";
import { MarketingContentManager } from "../components/marketing-content-manager";
import { loadDashboardData } from "../lib/dashboard-data";

export const dynamic = "force-dynamic";

export default async function ContentPage() {
  const data = await loadDashboardData();

  return (
    <AppShell active="content" pendingApprovalCount={data.pendingApprovalCount}>
      <PageHeader eyebrow="Content" title="PR対象" badge={`${data.dashboardMarketingContents.length}件`} />
      <section className="contentRolePanel" aria-label="コンテンツページの役割">
        <span>素材</span>
        <div>
          <strong>ここでは「何を売る・広めるか」を登録します。</strong>
          <p>投稿の本文作成は会社、公開後の管理は運用で進めます。</p>
        </div>
        <a className="detailLink primaryInlineLink" href="/company#tasks">投稿作成へ</a>
      </section>
      <div className="contentGrid singleColumnOnMobile">
        <section className="panel wide">
          <div className="panelHeader">
            <h2>売る・広める対象</h2>
            <span>アプリ・イベント・サービス・資料</span>
          </div>
          <MarketingContentManager initialContents={data.dashboardMarketingContents} />
        </section>
        <section className="panel wide">
          <div className="panelHeader">
            <h2>画像管理</h2>
            <span>素材画像とGoogle Driveフォルダ</span>
          </div>
          <div className="navigationPanelGrid">
            <a className="navigationPanel" href="/media">
              <strong>画像アセット一覧へ</strong>
              <p>PR対象コンテンツに紐づく画像案、アップロード準備、利用可否を確認します。</p>
            </a>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
