"use client";

import { FormEvent, useEffect, useState } from "react";

type CreatedInstruction = {
  instruction: CeoInstruction;
  employeeTasks: EmployeeTask[];
  contentDraft: ContentDraft;
};

type CeoInstruction = {
  id: string;
  title: string;
  body: string;
  decompositionSummary: string;
};

type EmployeeTask = {
  id: string;
  employeeName: string;
  title: string;
  status: string;
  statusLabel: string;
  progress: number;
  outputType: string;
};

type ContentDraft = {
  id: string;
  title: string;
  body: string;
  cta: string;
  imagePrompt?: string;
  channelVariants?: Array<{ channel: string; format: string; title: string; note: string }>;
};

type MarketingContent = {
  id: string;
  type: string;
  typeLabel: string;
  name: string;
  appProjectId?: string;
  summary: string;
  explanation: string;
  audiences: string[];
  defaultObjectives: string[];
  imagePolicy: string;
  supportedChannels?: string[];
};

const defaultInstruction =
  "SNSによる集客を目的に、対象読者の悩み、入口メッセージ、投稿テーマ、プロフィール、固定ポスト、導線までをセットで準備する。";

type CeoInstructionComposerProps = {
  initialInstructions: CeoInstruction[];
  initialEmployeeTasks: EmployeeTask[];
  initialContentDrafts: ContentDraft[];
  marketingContents: MarketingContent[];
};

export function CeoInstructionComposer({
  marketingContents
}: CeoInstructionComposerProps) {
  const firstContent = marketingContents[0];
  const [marketingContentId, setMarketingContentId] = useState(firstContent?.id ?? "");
  const selectedContent = marketingContents.find((content) => content.id === marketingContentId) ?? firstContent;
  const objectiveOptions = selectedContent?.defaultObjectives ?? ["投稿セット作成"];
  const [objective, setObjective] = useState(objectiveOptions[0] ?? "投稿セット作成");
  const [customObjective, setCustomObjective] = useState("");
  const [audience, setAudience] = useState(selectedContent?.audiences?.[0] ?? "");
  const [channels, setChannels] = useState(selectedContent?.supportedChannels ?? ["X", "Instagram", "TikTok", "LINE"]);
  const [title, setTitle] = useState("SNS集客の投稿セット準備");
  const [body, setBody] = useState(defaultInstruction);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<CreatedInstruction | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedContent) return;
    setObjective(selectedContent.defaultObjectives[0] ?? "投稿セット作成");
    setAudience(selectedContent.audiences[0] ?? "");
    setChannels(selectedContent.supportedChannels ?? ["X", "Instagram", "TikTok", "LINE"]);
    setTitle(`${selectedContent.name}のSNS集客セット準備`);
    setBody(defaultInstruction);
  }, [selectedContent]);

  async function submitInstruction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/ceo-instructions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appProjectId: selectedContent?.appProjectId ?? "app_numeria_studio",
          marketingContentId,
          objective: customObjective.trim() || objective,
          audience,
          channels,
          title,
          body
        })
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "ceo_instruction_failed");
      }

      setResult(payload);
      setTitle("");
      setBody("");
      setCustomObjective("");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "送信に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="composerShell">
      <form className="composerForm" onSubmit={submitInstruction}>
        <label>
          <span>対象コンテンツ</span>
          <select value={marketingContentId} onChange={(event) => setMarketingContentId(event.target.value)} required>
            {marketingContents.map((content) => (
              <option key={content.id} value={content.id}>
                {content.typeLabel}: {content.name}
              </option>
            ))}
          </select>
        </label>
        {selectedContent ? (
          <div className="selectedContentPreview">
            <span>{selectedContent.typeLabel}</span>
            <strong>{selectedContent.name}</strong>
            <p>{selectedContent.summary}</p>
            <small>{selectedContent.explanation}</small>
            <small>素材方針: {selectedContent.imagePolicy}</small>
            <small>展開先: {(selectedContent.supportedChannels ?? ["X", "Instagram", "TikTok", "LINE"]).join(" / ")}</small>
          </div>
        ) : null}
        <fieldset className="channelCheckboxGroup">
          <legend>展開先SNS</legend>
          {(selectedContent?.supportedChannels ?? ["X", "Instagram", "TikTok", "LINE"]).map((channel) => (
            <label key={channel}>
              <input
                checked={channels.includes(channel)}
                onChange={(event) => {
                  setChannels((current) =>
                    event.target.checked ? [...current, channel] : current.filter((item) => item !== channel)
                  );
                }}
                type="checkbox"
              />
              <span>{channel}</span>
            </label>
          ))}
        </fieldset>
        <label>
          <span>目的</span>
          <select value={objective} onChange={(event) => setObjective(event.target.value)} required>
            {objectiveOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>目的の自由記入</span>
          <input
            value={customObjective}
            onChange={(event) => setCustomObjective(event.target.value)}
            placeholder="候補にない場合だけ入力"
          />
        </label>
        <label>
          <span>今回優先する読者</span>
          <select value={audience} onChange={(event) => setAudience(event.target.value)} required>
            {(selectedContent?.audiences ?? []).map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>指示タイトル</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} required />
        </label>
        <label>
          <span>社長指示</span>
          <textarea value={body} onChange={(event) => setBody(event.target.value)} rows={6} required />
        </label>
        <button disabled={isSubmitting} type="submit">
          {isSubmitting ? "秘書AIが分解中" : "秘書AIへ指示する"}
        </button>
      </form>

      {error ? <p className="composerError">Error: {error}</p> : null}

      {result ? (
        <div className="composerResult" aria-live="polite">
          <div>
            <strong>タスクに追加しました</strong>
            <p>{result.instruction.title} を会社タスクと社員タスクへ追加しました。</p>
          </div>
          <div>
            <strong>作成タスク</strong>
            <ul>
              {result.employeeTasks.map((task) => (
                <li key={task.id}>
                  {task.employeeName}: {task.title}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <strong>生成下書き</strong>
            <small>{result.contentDraft.title}</small>
            <p>{result.contentDraft.body}</p>
            <small>CTA: {result.contentDraft.cta}</small>
            {result.contentDraft.imagePrompt ? <small>素材案: {result.contentDraft.imagePrompt}</small> : null}
            {result.contentDraft.channelVariants?.length ? (
              <div className="channelVariantList">
                {result.contentDraft.channelVariants.map((variant) => (
                  <span key={variant.channel}>
                    {variant.channel}: {variant.format}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
