import { AppShell, PageHeader } from "../components/app-shell";
import { MarketingContentManager } from "../components/marketing-content-manager";
import { loadDashboardData } from "../lib/dashboard-data";

export const dynamic = "force-dynamic";

export default async function ContentPage() {
  const data = await loadDashboardData();

  return (
    <AppShell active="content" pendingApprovalCount={data.pendingApprovalCount}>
      <PageHeader eyebrow="Content" title="PR対象" badge={`${data.dashboardMarketingContents.length}件`} />
      <div className="contentGrid singleColumnOnMobile">
        <section className="panel wide">
          <div className="panelHeader">
            <h2>売る・広める対象</h2>
            <span>アプリ・イベント・サービス・資料</span>
          </div>
          <MarketingContentManager initialContents={data.dashboardMarketingContents} />
        </section>
      </div>
    </AppShell>
  );
}
