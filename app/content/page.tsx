import { AppShell, PageHeader } from "../components/app-shell";
import { DailyMetricsForm } from "../components/daily-metrics-form";
import { PerformanceActionMaterializer } from "../components/performance-action-materializer";
import { PublishApprovalSelector } from "../components/publish-approval-selector";
import { loadDashboardData } from "../lib/dashboard-data";

export const dynamic = "force-dynamic";

function formatValue(value: number | string) {
  return value === "unknown" ? "未入力" : value.toLocaleString("ja-JP");
}

function formatRate(value: number | string) {
  return value === "unknown" ? "未判定" : `${Math.round(Number(value) * 1000) / 10}%`;
}

export default async function ContentPage() {
  const data = await loadDashboardData();
  const metricCards = [
    { label: "表示", value: data.metrics.impressions },
    { label: "プロフィール", value: data.metrics.profile_visits },
    { label: "フォロー", value: data.metrics.follows },
    { label: "CTA", value: data.metrics.cta_clicks },
    { label: "LP", value: data.metrics.landing_page_visits },
    { label: "登録", value: data.metrics.trial_or_signup_count }
  ];
  const rateCards = [
    { label: "プロフィール率", value: data.rates.profile_visit_rate },
    { label: "フォロー率", value: data.rates.follow_rate },
    { label: "CTA率", value: data.rates.cta_click_rate },
    { label: "LP到達率", value: data.rates.landing_page_rate }
  ];

  return (
    <AppShell active="settings" pendingApprovalCount={data.pendingApprovalCount}>
      <PageHeader eyebrow="Content" title="コンテンツ管理" badge={`${data.dashboardContentDrafts.length}件`} />
      <div className="contentGrid singleColumnOnMobile">
        <section className="panel wide">
          <div className="panelHeader">
            <h2>X公開キュー</h2>
            <span>公開予約は最終承認後</span>
          </div>
          <PublishApprovalSelector
            contentDrafts={data.dashboardContentDrafts}
            mediaAssets={data.dashboardMediaAssets}
            mediaUploadJobs={data.dashboardMediaUploadJobs}
          />
          <div className="publishQueue">
            {data.dashboardContentDrafts.map((draft) => (
              <article className="publishItem" key={draft.id}>
                <div>
                  <strong>{draft.title}</strong>
                  <p>{draft.body}</p>
                  <small>CTA: {draft.cta}</small>
                  {draft.imagePrompt ? <small>画像案: {draft.imagePrompt}</small> : null}
                </div>
                <div className="publishState">
                  <span className="taskStatus waiting_approval">下書き確認待ち</span>
                  <span className="taskStatus waiting_approval">公開承認待ち</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panelHeader">
            <h2>日次指標</h2>
            <span>{data.latestPerformance.date}</span>
          </div>
          <div className="metricGrid">
            {metricCards.map((metric) => (
              <article className="metricCard" key={metric.label}>
                <span>{metric.label}</span>
                <strong>{formatValue(metric.value)}</strong>
              </article>
            ))}
          </div>
          <div className="rateList">
            {rateCards.map((rate) => (
              <div className="rateRow" key={rate.label}>
                <span>{rate.label}</span>
                <strong>{formatRate(rate.value)}</strong>
              </div>
            ))}
          </div>
          <DailyMetricsForm latestSnapshot={data.latestPerformance} />
        </section>

        <section className="panel">
          <div className="panelHeader">
            <h2>日次改善指示</h2>
            <span>{data.performanceActionPlan.date}</span>
          </div>
          <div className="approvalList">
            {data.performanceActionPlan.actions.map((action) => (
              <article className="approvalItem" key={action.id}>
                <div>
                  <strong>{action.title}</strong>
                  <p>{action.action}</p>
                  <p>{action.owner} / {action.reason}</p>
                </div>
                <span className={`priority ${action.priority}`}>{action.priority}</span>
              </article>
            ))}
          </div>
          <PerformanceActionMaterializer snapshotId={data.performanceActionPlan.snapshotId} />
        </section>
      </div>
    </AppShell>
  );
}
