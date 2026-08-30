import type { ReactNode } from "react";

const navItems = [
  { key: "dashboard", label: "ホーム", shortLabel: "ホーム", icon: "⌂", href: "/" },
  { key: "instructions", label: "指示・承認", shortLabel: "指示", icon: "✎", href: "/instructions" },
  { key: "company", label: "会社", shortLabel: "会社", icon: "▦", href: "/company" },
  { key: "operations", label: "運用", shortLabel: "運用", icon: "▥", href: "/operations" },
  { key: "content", label: "コンテンツ", shortLabel: "コンテンツ", icon: "◫", href: "/content" },
  { key: "settings", label: "設定", shortLabel: "設定", icon: "⚙", href: "/settings" }
];

type AppShellProps = {
  active: "dashboard" | "instructions" | "company" | "operations" | "content" | "settings";
  pendingApprovalCount?: number;
  children: ReactNode;
};

export function AppShell({ active, pendingApprovalCount = 0, children }: AppShellProps) {
  return (
    <main className="shell">
      <aside className="sidebar" aria-label="メインナビゲーション">
        <a className="brand" href="/">
          AI SNS Growth Office
        </a>
        <nav>
          {navItems.map((item) => {
            const isActive = item.key === active;
            const showBadge = item.key === "instructions" && pendingApprovalCount > 0;

            return (
              <a
                aria-current={isActive ? "page" : undefined}
                className={isActive ? "navItem active" : "navItem"}
                href={item.href}
                key={item.href}
              >
                <span className="navIcon" aria-hidden="true">
                  {item.icon}
                  {showBadge ? <span className="navBadge">{pendingApprovalCount}</span> : null}
                </span>
                <span className="navText">{item.label}</span>
                <span className="navShortText">{item.shortLabel}</span>
              </a>
            );
          })}
        </nav>
        <div className="sidebarNote">Numeria Studio campaign</div>
      </aside>
      <section className="workspace">{children}</section>
    </main>
  );
}

export function PageHeader({ eyebrow, title, badge }: { eyebrow: string; title: string; badge: string }) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
      </div>
      <div className="ceoBadge">{badge}</div>
    </header>
  );
}
