import { AppShell, PageHeader } from "../components/app-shell";
import { CompanyTaskBoard } from "../components/company-task-board";
import { loadDashboardData } from "../lib/dashboard-data";

export const dynamic = "force-dynamic";

export default async function CompanyPage() {
  const data = await loadDashboardData();

  return (
    <AppShell active="company" pendingApprovalCount={data.pendingApprovalCount}>
      <PageHeader eyebrow="Company Tasks" title="会社タスク" badge={`${data.dashboardCompanyTasks.length}件`} />
      <section className="panel wide">
        <div className="panelHeader">
          <h2>案件一覧</h2>
          <span>押すと詳細確認、中止も可能</span>
        </div>
        <CompanyTaskBoard tasks={data.dashboardCompanyTasks} />
      </section>
    </AppShell>
  );
}
