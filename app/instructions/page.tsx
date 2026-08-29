import { AppShell, PageHeader } from "../components/app-shell";
import { ApprovalCenter } from "../components/approval-center";
import { CeoInstructionComposer } from "../components/ceo-instruction-composer";
import { loadDashboardData } from "../lib/dashboard-data";

export const dynamic = "force-dynamic";

export default async function InstructionsPage() {
  const data = await loadDashboardData();

  return (
    <AppShell active="instructions" pendingApprovalCount={data.pendingApprovalCount}>
      <PageHeader eyebrow="Instructions" title="指示" badge={`${data.pendingApprovalCount}件`} />
      <section className="statusChips" aria-label="指示サマリー">
        <span>社長の判断待ち {data.pendingApprovalCount}件</span>
        <span>AIへの新規指示 {data.dashboardCeoInstructions.length}件</span>
      </section>
      <div className="contentGrid singleColumnOnMobile">
        <section className="panel wide">
          <div className="panelHeader">
            <h2>AI会社へ指示する</h2>
            <span>対象コンテンツを選んで新しい仕事を頼む</span>
          </div>
          <CeoInstructionComposer
            initialContentDrafts={data.dashboardContentDrafts}
            initialEmployeeTasks={data.dashboardEmployeeTasks}
            initialInstructions={data.dashboardCeoInstructions}
            marketingContents={data.dashboardMarketingContents}
          />
        </section>

        <section className="panel wide">
          <div className="panelHeader">
            <h2>承認待ち</h2>
            <span>承認対象の中身を確認</span>
          </div>
          <ApprovalCenter
            approvals={data.dashboardApprovals}
            contentDrafts={data.dashboardContentDrafts}
            employeeTasks={data.dashboardEmployeeTasks}
          />
        </section>
      </div>
    </AppShell>
  );
}
