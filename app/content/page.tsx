import { AppShell, PageHeader } from "../components/app-shell";
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
          <div className="contentRegistrationMock">
            <strong>登録する情報</strong>
            <p>種別、名称、説明、誰向けか、目的、LPや予約先、使ってほしい画像方針をここに集約します。</p>
            <button type="button">コンテンツ追加</button>
          </div>
          <div className="marketingContentGrid">
            {data.dashboardMarketingContents.map((content) => (
              <article className="marketingContentCard" key={content.id}>
                <div>
                  <span>{content.typeLabel}</span>
                  <strong>{content.name}</strong>
                </div>
                <p>{content.summary}</p>
                <small>{content.explanation}</small>
                <div className="tagList">
                  {content.audiences.map((audience) => (
                    <span key={audience}>{audience}</span>
                  ))}
                </div>
                <small>画像方針: {content.imagePolicy}</small>
              </article>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
