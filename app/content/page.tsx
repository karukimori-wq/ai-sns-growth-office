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
      </div>
    </AppShell>
  );
}
