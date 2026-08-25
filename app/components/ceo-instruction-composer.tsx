"use client";

import { FormEvent, useState } from "react";

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
};

const defaultInstruction =
  "Numeria StudioのX投稿を画像つきで作成。投稿単体ではなく、プロフィール、固定投稿、無料導線、相談までの流れを前提に今日の下書きを作る。";

type CeoInstructionComposerProps = {
  initialInstructions: CeoInstruction[];
  initialEmployeeTasks: EmployeeTask[];
  initialContentDrafts: ContentDraft[];
};

export function CeoInstructionComposer({
  initialInstructions,
  initialEmployeeTasks,
  initialContentDrafts
}: CeoInstructionComposerProps) {
  const [title, setTitle] = useState("Numeria Studio 今日のX運用");
  const [body, setBody] = useState(defaultInstruction);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<CreatedInstruction | null>(null);
  const [instructions, setInstructions] = useState(initialInstructions);
  const [employeeTasks, setEmployeeTasks] = useState(initialEmployeeTasks);
  const [contentDrafts, setContentDrafts] = useState(initialContentDrafts);
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
      setInstructions((current) => [payload.instruction, ...current.filter((item) => item.id !== payload.instruction.id)]);
      setEmployeeTasks((current) => [
        ...payload.employeeTasks,
        ...current.filter((item) => !payload.employeeTasks.some((task: EmployeeTask) => task.id === item.id))
      ]);
      setContentDrafts((current) => [
        payload.contentDraft,
        ...current.filter((item) => item.id !== payload.contentDraft.id)
      ]);
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

      <div className="composerBoard" aria-live="polite">
        <section>
          <div className="composerBoardHeader">
            <strong>秘書Inbox</strong>
            <span>{instructions.length}件</span>
          </div>
          <div className="composerMiniList">
            {instructions.slice(0, 3).map((instruction) => (
              <article key={instruction.id}>
                <strong>{instruction.title}</strong>
                <p>{instruction.decompositionSummary}</p>
              </article>
            ))}
          </div>
        </section>

        <section>
          <div className="composerBoardHeader">
            <strong>社員別タスク</strong>
            <span>{employeeTasks.length}件</span>
          </div>
          <div className="composerMiniList">
            {employeeTasks.slice(0, 5).map((task) => (
              <article key={task.id}>
                <strong>{task.employeeName}</strong>
                <p>
                  {task.title} / {task.progress}% / {task.outputType}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section>
          <div className="composerBoardHeader">
            <strong>X下書き</strong>
            <span>{contentDrafts.length}件</span>
          </div>
          <div className="composerMiniList">
            {contentDrafts.slice(0, 3).map((draft) => (
              <article key={draft.id}>
                <strong>{draft.title}</strong>
                <p>{draft.body}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
