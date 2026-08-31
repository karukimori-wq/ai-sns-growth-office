"use client";

import { useRef, useState } from "react";
import type { MarketingContent } from "../lib/dashboard-data";

const contentTypes = [
  { value: "app", label: "アプリ" },
  { value: "event", label: "イベント" },
  { value: "service", label: "サービス" },
  { value: "document", label: "資料" },
  { value: "campaign", label: "企画" },
  { value: "other", label: "その他" }
];

const defaultChannels = ["X", "Instagram", "TikTok", "LINE"];

export function MarketingContentManager({ initialContents }: { initialContents: MarketingContent[] }) {
  const [contents, setContents] = useState(initialContents);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingContent, setEditingContent] = useState<MarketingContent | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  async function submitContent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setIsSubmitting(true);
    setMessage(null);

    try {
      const contentId = editingContent?.id;
      const url = contentId ? `/api/marketing-contents/${encodeURIComponent(contentId)}` : "/api/marketing-contents";
      const response = await fetch(url, {
        method: contentId ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          type: formData.get("type"),
          name: formData.get("name"),
          summary: formData.get("summary"),
          explanation: formData.get("explanation"),
          audiences: formData.get("audiences"),
          defaultObjectives: formData.get("defaultObjectives"),
          imagePolicy: formData.get("imagePolicy"),
          supportedChannels: formData.getAll("supportedChannels"),
          driveFolder: {
            provider: "google_drive",
            name: formData.get("driveFolderName"),
            path: formData.get("driveFolderPath"),
            url: formData.get("driveFolderUrl"),
            autoCreateRequested: formData.get("autoCreateDriveFolder") === "on"
          },
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
      setEditingContent(null);
      setIsFormOpen(false);
      setMessage(`${payload.marketingContent.name} を${contentId ? "更新" : "登録"}しました`);
    } catch {
      setMessage("通信に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  }

  function startEditing(content: MarketingContent) {
    setEditingContent(content);
    setIsFormOpen(true);
    setMessage(`${content.name} を編集中です`);
    window.requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  async function deleteContent(content: MarketingContent) {
    if (!window.confirm(`${content.name} を削除しますか？`)) {
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/marketing-contents/${encodeURIComponent(content.id)}`, { method: "DELETE" });
      const payload = (await response.json()) as { deleted?: boolean; error?: string };

      if (!response.ok || !payload.deleted) {
        setMessage(payload.error ?? "削除に失敗しました");
        return;
      }

      setContents((current) => current.filter((item) => item.id !== content.id));
      if (editingContent?.id === content.id) {
        setEditingContent(null);
      }
      setMessage(`${content.name} を削除しました`);
    } catch {
      setMessage("通信に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  }

  const editingLink = editingContent?.links?.find((link) => link.label === "導線URL")?.url ?? editingContent?.links?.[0]?.url ?? "";
  const defaultDrivePath = editingContent?.driveFolder?.path ?? `アプリフォルダ / コンテンツ / ${editingContent?.name ?? ""}`;
  const selectedChannels = editingContent?.supportedChannels?.length ? editingContent.supportedChannels : defaultChannels;

  return (
    <>
      <div className="contentAddBar">
        <div>
          <strong>売る・広める対象</strong>
          <small>{contents.length}件登録中</small>
        </div>
        <button
          aria-expanded={isFormOpen}
          className="roundAddButton"
          type="button"
          onClick={() => {
            setEditingContent(null);
            setIsFormOpen((current) => !current);
          }}
        >
          ＋
        </button>
      </div>
      {isFormOpen ? (
        <form className="marketingContentForm" key={editingContent?.id ?? "new"} ref={formRef} onSubmit={submitContent}>
          <div className="formHeader">
            <div>
              <strong>{editingContent ? "コンテンツ編集" : "コンテンツ追加"}</strong>
            </div>
            {editingContent ? (
              <button className="secondaryButton" type="button" onClick={() => setEditingContent(null)}>
                新規追加に戻る
              </button>
            ) : null}
          </div>
          <label>
            種別
            <select name="type" defaultValue={editingContent?.type ?? "app"}>
              {contentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            名称
            <input name="name" defaultValue={editingContent?.name ?? ""} placeholder="Numeria Studio 無料体験" required />
          </label>
          <label>
            ひとことで
            <input name="summary" defaultValue={editingContent?.summary ?? ""} placeholder="SNSで広めたい対象コンテンツの短い説明" />
          </label>
          <label>
            解説
            <textarea
              name="explanation"
              defaultValue={editingContent?.explanation ?? ""}
              placeholder="何をするものか、誰にどんな価値があるか"
              rows={4}
            />
          </label>
          <label>
            誰向け
            <textarea
              name="audiences"
              defaultValue={editingContent?.audiences.join("\n") ?? ""}
              placeholder="1行に1つ。例: 占いに興味がある人"
              rows={3}
            />
          </label>
          <label>
            目的
            <textarea
              name="defaultObjectives"
              defaultValue={editingContent?.defaultObjectives.join("\n") ?? ""}
              placeholder="1行に1つ。例: 無料体験へ誘導"
              rows={3}
            />
          </label>
          <label>
            導線URL
            <input name="url" defaultValue={editingLink} placeholder="https://..." type="url" />
          </label>
          <label>
            素材方針
            <textarea
              name="imagePolicy"
              defaultValue={editingContent?.imagePolicy ?? ""}
              placeholder="使ってほしい画像・動画、雰囲気、避けたい表現"
              rows={3}
            />
          </label>
          <fieldset className="channelCheckboxGroup">
            <legend>展開先SNS</legend>
            {defaultChannels.map((channel) => (
              <label key={channel}>
                <input name="supportedChannels" defaultChecked={selectedChannels.includes(channel)} type="checkbox" value={channel} />
                <span>{channel}</span>
              </label>
            ))}
          </fieldset>
          <fieldset className="driveFolderFields">
            <legend>Google Drive素材フォルダ</legend>
            <label>
              フォルダ名
              <input name="driveFolderName" defaultValue={editingContent?.driveFolder?.name ?? editingContent?.name ?? ""} placeholder="Numeria Studio" />
            </label>
            <label>
              保存場所
              <input name="driveFolderPath" defaultValue={defaultDrivePath} placeholder="アプリフォルダ / コンテンツ / Numeria Studio" />
            </label>
            <label>
              フォルダURL
              <input name="driveFolderUrl" defaultValue={editingContent?.driveFolder?.url ?? ""} placeholder="https://drive.google.com/drive/folders/..." type="url" />
            </label>
            <label className="checkboxLabel">
              <input name="autoCreateDriveFolder" defaultChecked={editingContent?.driveFolder?.autoCreateRequested ?? true} type="checkbox" />
              <span>コンテンツ追加時にフォルダ作成</span>
            </label>
          </fieldset>
          <button disabled={isSubmitting} type="submit">
            {isSubmitting ? "保存中" : editingContent ? "変更を保存" : "コンテンツ追加"}
          </button>
        </form>
      ) : null}
      {message ? <p className="actionMessage">{message}</p> : null}
      <div className="marketingContentGrid">
        {contents.map((content) => (
          <article className="marketingContentCard" key={content.id}>
            <div className="cardHeaderLine">
              <div>
                <span>{content.typeLabel}</span>
                <strong>{content.name}</strong>
              </div>
              <div className="cardActions">
                <button className="secondaryButton" type="button" onClick={() => startEditing(content)}>
                  編集
                </button>
                <button className="dangerButton" disabled={isSubmitting} type="button" onClick={() => deleteContent(content)}>
                  削除
                </button>
              </div>
            </div>
            <p>{content.summary}</p>
            <small>{content.explanation}</small>
            {content.supportedChannels?.length ? (
              <div className="channelVariantList">
                {content.supportedChannels.map((channel) => (
                  <span key={channel}>{channel}</span>
                ))}
              </div>
            ) : null}
            <div className="tagList">
              {content.audiences.map((audience) => (
                <span key={audience}>{audience}</span>
              ))}
            </div>
            <small>素材方針: {content.imagePolicy || "未設定"}</small>
            <div className="driveFolderSummary">
              <strong>素材フォルダ</strong>
              <span>{content.driveFolder?.path ?? `アプリフォルダ / コンテンツ / ${content.name}`}</span>
              {content.driveFolder?.url ? (
                <a href={content.driveFolder.url} rel="noreferrer" target="_blank">
                  Google Driveで開く
                </a>
              ) : (
                <small>フォルダURL未設定</small>
              )}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
