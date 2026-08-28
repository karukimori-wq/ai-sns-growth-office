import { AppShell, PageHeader } from "../components/app-shell";
import { ApprovalCenter } from "../components/approval-center";
import { CeoInstructionComposer } from "../components/ceo-instruction-composer";
import { loadDashboardData } from "../lib/dashboard-data";

export const dynamic = "force-dynamic";

export default async function InstructionsPage() {
  const data = await loadDashboardData();

  return (
    <AppShell active="instructions" pendingApprovalCount={data.pendingApprovalCount}>
      <PageHeader eyebrow="Instructions" title="指示・承認" badge={`${data.pendingApprovalCount}件`} />
      <div className="contentGrid singleColumnOnMobile">
        <section className="panel wide">
          <div className="panelHeader">
            <h2>社長からの指示</h2>
            <span>入力後は会社の案件と社員タスクへ追加</span>
          </div>
          <CeoInstructionComposer
            marketingContents={data.dashboardMarketingContents}
          />
        </section>

        <section className="panel wide">
          <div className="panelHeader">
            <h2>承認センター</h2>
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
