"use client";

import { useState } from "react";
import type { MarketingContent } from "../lib/dashboard-data";

const contentTypes = [
  { value: "app", label: "アプリ" },
  { value: "event", label: "イベント" },
  { value: "service", label: "サービス" },
  { value: "document", label: "資料" },
  { value: "campaign", label: "企画" },
  { value: "other", label: "その他" }
];

export function MarketingContentManager({ initialContents }: { initialContents: MarketingContent[] }) {
  const [contents, setContents] = useState(initialContents);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submitContent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/marketing-contents", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          type: formData.get("type"),
          name: formData.get("name"),
          summary: formData.get("summary"),
          explanation: formData.get("explanation"),
          audiences: formData.get("audiences"),
          defaultObjectives: formData.get("defaultObjectives"),
          imagePolicy: formData.get("imagePolicy"),
          links: [{ label: "導線URL", url: formData.get("url") }]
        })
      });
      const payload = (await response.json()) as { marketingContent?: MarketingContent; error?: string };

      if (!response.ok || !payload.marketingContent) {
        setMessage(payload.error ?? "コンテンツ登録に失敗しました");
        return;
      }

      setContents((current) => [
        payload.marketingContent as MarketingContent,
        ...current.filter((content) => content.id !== payload.marketingContent?.id)
      ]);
      form.reset();
      setMessage(`${payload.marketingContent.name} を登録しました`);
    } catch {
      setMessage("通信に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <form className="marketingContentForm" onSubmit={submitContent}>
        <label>
          種別
          <select name="type" defaultValue="app">
            {contentTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          名称
          <input name="name" placeholder="Numeria Studio 無料体験" required />
        </label>
        <label>
          ひとことで
          <input name="summary" placeholder="Xで集客したい対象コンテンツの短い説明" />
        </label>
        <label>
          解説
          <textarea name="explanation" placeholder="何をするものか、誰にどんな価値があるか" rows={4} />
        </label>
        <label>
          誰向け
          <textarea name="audiences" placeholder="1行に1つ。例: 占いに興味がある人" rows={3} />
        </label>
        <label>
          目的
          <textarea name="defaultObjectives" placeholder="1行に1つ。例: 無料体験へ誘導" rows={3} />
        </label>
        <label>
          導線URL
          <input name="url" placeholder="https://..." type="url" />
        </label>
        <label>
          画像方針
          <textarea name="imagePolicy" placeholder="使ってほしい画像、雰囲気、避けたい表現" rows={3} />
        </label>
        <button disabled={isSubmitting} type="submit">
          {isSubmitting ? "登録中" : "コンテンツ追加"}
        </button>
      </form>
      {message ? <p className="actionMessage">{message}</p> : null}
      <div className="marketingContentGrid">
        {contents.map((content) => (
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
    </>
  );
}
