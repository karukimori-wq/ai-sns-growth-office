import { AppShell, PageHeader } from "../../components/app-shell";
import { SnsAccountManager } from "../../components/sns-account-manager";
import { loadDashboardData } from "../../lib/dashboard-data";

export const dynamic = "force-dynamic";

const snsAccounts = [
  { channel: "X", account: "未設定", purpose: "投稿公開、プロフィール導線、反応確認" },
  { channel: "Instagram", account: "未設定", purpose: "将来の画像投稿・ストーリー展開用" }
];

export default async function SnsAccountsPage() {
  const data = await loadDashboardData();

  return (
    <AppShell active="settings" pendingApprovalCount={data.pendingApprovalCount}>
      <PageHeader eyebrow="Settings" title="SNSアカウント管理" badge="接続先" />
      <section className="panel wide">
        <div className="panelHeader">
          <h2>接続先メモ</h2>
          <span>X以外のSNSも追加できます</span>
        </div>
        <SnsAccountManager initialAccounts={snsAccounts} />
      </section>
      <section className="panel wide">
        <div className="panelHeader">
          <h2>次に設定する項目</h2>
          <span>実接続前の整理</span>
        </div>
        <div className="settingsChecklist">
          <span>運用するXアカウント</span>
          <span>投稿前に必ず社長承認するか</span>
          <span>プロフィールURLと固定ポストURL</span>
          <span>返信・DM対応をどのアプリへ渡すか</span>
        </div>
      </section>
    </AppShell>
  );
}
