import { AppShell, PageHeader } from "../components/app-shell";
import { MarketingContentManager } from "../components/marketing-content-manager";
import { loadDashboardData } from "../lib/dashboard-data";

export const dynamic = "force-dynamic";

export default async function ContentPage() {
  const data = await loadDashboardData();

  return (
    <AppShell active="content" pendingApprovalCount={data.pendingApprovalCount}>
      <PageHeader eyebrow="Content" title="集客対象コンテンツ" badge={`${data.dashboardMarketingContents.length}件`} />
      <div className="contentGrid singleColumnOnMobile">
        <section className="panel wide">
          <div className="panelHeader">
            <h2>集客対象コンテンツ</h2>
            <span>アプリ・イベント・サービス・資料を登録</span>
          </div>
          <MarketingContentManager initialContents={data.dashboardMarketingContents} />
        </section>
        <section className="panel wide">
          <div className="panelHeader">
            <h2>画像管理</h2>
            <span>投稿に使う画像とGoogle Driveフォルダを確認</span>
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
