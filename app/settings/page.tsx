import { AppShell, PageHeader } from "../components/app-shell";
import { loadDashboardData } from "../lib/dashboard-data";

export const dynamic = "force-dynamic";

const settingsItems = [
  { label: "コンテンツ管理", caption: "投稿テーマ、下書き、公開ルール", href: "/content" },
  { label: "画像管理", caption: "画像アセット、アップロード準備、利用可否", href: "/media" },
  { label: "SNSアカウント管理", caption: "X、Instagramなどの接続先メモ", href: "/settings" },
  { label: "会社運用設定", caption: "部署、エージェント、承認ルール", href: "/agents" }
];

export default async function SettingsPage() {
  const data = await loadDashboardData();

  return (
    <AppShell active="settings" pendingApprovalCount={data.pendingApprovalCount}>
      <PageHeader eyebrow="Settings" title="設定" badge="管理" />
      <section className="panel wide">
        <div className="panelHeader">
          <h2>各種設定</h2>
          <span>必要な管理画面へ移動</span>
        </div>
        <div className="settingsGrid">
          {settingsItems.map((item) => (
            <a className="settingsCard" href={item.href} key={item.label}>
              <strong>{item.label}</strong>
              <p>{item.caption}</p>
            </a>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
