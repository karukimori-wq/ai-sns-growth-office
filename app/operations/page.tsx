import { AppShell, PageHeader } from "../components/app-shell";
import { ExecutionQueue } from "../components/execution-queue";
import { loadDashboardData } from "../lib/dashboard-data";

export const dynamic = "force-dynamic";

export default async function OperationsPage() {
  const data = await loadDashboardData();
  const openExecutionCount =
    data.dashboardMediaUploadJobs.filter((job: { status: string }) => !["uploaded", "manual_required"].includes(job.status)).length +
    data.dashboardPublishJobs.filter((job: { status: string }) => !["published", "cancelled"].includes(job.status)).length;

  return (
    <AppShell active="settings" pendingApprovalCount={data.pendingApprovalCount}>
      <PageHeader eyebrow="Operations" title="運用管理" badge={`${openExecutionCount}件`} />

      <section className="panel wide">
        <div className="panelHeader">
          <h2>運用AIの担当</h2>
          <span>成果物を実際の運用へ進める</span>
        </div>
        <div className="operationGuide">
          <article>
            <strong>承認済み成果物を受け取る</strong>
            <p>投稿下書き、画像方針、公開予約が揃ったら運用AIの管理対象にします。</p>
          </article>
          <article>
            <strong>公開準備と実行を記録</strong>
            <p>画像準備、公開予約、公開済み、取消をここで確認します。</p>
          </article>
          <article>
            <strong>反応を見る</strong>
            <p>公開後の数字を日次で入力し、次の改善タスクへつなげます。</p>
          </article>
        </div>
      </section>

      <section className="panel wide">
        <div className="panelHeader">
          <h2>実行キュー</h2>
          <span>公開準備、公開予約、日次指標</span>
        </div>
        <ExecutionQueue
          initialMediaUploadJobs={data.dashboardMediaUploadJobs}
          initialPublishJobs={data.dashboardPublishJobs}
        />
      </section>
    </AppShell>
  );
}
