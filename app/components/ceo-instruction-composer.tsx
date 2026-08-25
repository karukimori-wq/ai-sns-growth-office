"use client";

import { FormEvent, useState } from "react";

type CreatedInstruction = {
  instruction: {
    id: string;
    title: string;
    body: string;
    decompositionSummary: string;
  };
  employeeTasks: Array<{
    id: string;
    employeeName: string;
    title: string;
    statusLabel: string;
  }>;
  contentDraft: {
    id: string;
    title: string;
    body: string;
    cta: string;
    imagePrompt?: string;
  };
};

const defaultInstruction =
  "Numeria StudioのX投稿を画像つきで作成。投稿単体ではなく、プロフィール、固定投稿、無料導線、相談までの流れを前提に今日の下書きを作る。";

export function CeoInstructionComposer() {
  const [title, setTitle] = useState("Numeria Studio 今日のX運用");
  const [body, setBody] = useState(defaultInstruction);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<CreatedInstruction | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submitInstruction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/ceo-instructions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appProjectId: "app_numeria_studio",
          title,
          body
        })
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "ceo_instruction_failed");
      }

      setResult(payload);
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
            <strong>{result.instruction.title}</strong>
            <p>{result.instruction.decompositionSummary}</p>
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
            <p>{result.contentDraft.body}</p>
            <small>CTA: {result.contentDraft.cta}</small>
            {result.contentDraft.imagePrompt ? <small>画像案: {result.contentDraft.imagePrompt}</small> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
