"use client";

import { useState } from "react";

export type CompanyTask = {
  id: string;
  title: string;
  owner: string;
  priority: string;
  priorityLabel: string;
  dueLabel: string;
  status: string;
  statusLabel: string;
};

type ContentDraft = {
  id: string;
  title: string;
  body: string;
  cta: string;
  imagePrompt?: string;
  appProjectId?: string;
  marketingContentId?: string;
  marketingContentName?: string;
  objective?: string;
};

type PublishJob = {
  id?: string;
  status: string;
  contentDraftId?: string;
  scheduledFor?: string | null;
};

type EmployeeTaskReference = {
  id: string;
  employeeId?: string;
  employeeName: string;
  status: string;
};

const statusCopy: Record<string, { now: string; next: string }> = {
  in_progress: {
    now: "作業中",
    next: "承認待ちで確認"
  },
  waiting_approval: {
    now: "社長確認待ち",
    next: "承認 / 修正"
  },
  queued: {
    now: "待機中",
    next: "開始待ち"
  },
  blocked: {
    now: "停止中",
    next: "不足確認"
  },
  completed: {
    now: "完了",
    next: "次工程へ"
  }
};

function employeeHref(task: CompanyTask, employeeTasks: EmployeeTaskReference[]) {
  const activeStatuses = ["in_progress", "waiting_approval", "blocked", "queued"];
  const relatedTask =
    employeeTasks.find((item) => item.employeeName === task.owner && activeStatuses.includes(item.status)) ??
    employeeTasks.find((item) => item.employeeName === task.owner);

  if (!relatedTask?.employeeId) return "#employees";

  return `#employee-task-${relatedTask.id}`;
}

function relatedHref(task: CompanyTask, employeeTasks: EmployeeTaskReference[]) {
  if (task.status === "waiting_approval") return "/instructions";
  if (task.id.includes("media")) return "/media";
  if (task.id.includes("metric")) return "/";
  return employeeHref(task, employeeTasks);
}

function relatedLabel(task: CompanyTask) {
  if (task.status === "waiting_approval") return "承認へ";
  if (task.id.includes("media")) return "画像管理へ";
  if (task.id.includes("metric")) return "日次指標へ";
  return "担当AIへ";
}

function matchesTask(task: CompanyTask, draft: ContentDraft) {
  const haystack = [task.id, task.title, draft.appProjectId, draft.marketingContentId, draft.marketingContentName]
    .filter(Boolean)
    .join(" ");

  return haystack.includes("numeria") || haystack.includes("Numeria") || task.title.includes(draft.marketingContentName ?? "");
}

function publishStatusLabel(job: PublishJob | undefined) {
  if (!job) return "公開予定なし";
  if (job.status === "waiting_approval") return "公開承認待ち";
  if (job.status === "queued") return "公開予約中";
  if (job.status === "published") return "公開済み";
  if (job.status === "manual_required") return "手動対応";
  if (job.status === "cancelled") return "中止済み";
  return job.status;
}

export function CompanyTaskBoard({
  tasks,
  contentDrafts,
  publishJobs,
  employeeTasks
}: {
  tasks: CompanyTask[];
  contentDrafts: ContentDraft[];
  publishJobs: PublishJob[];
  employeeTasks: EmployeeTaskReference[];
}) {
  const [items, setItems] = useState(tasks);
  const [openTaskId, setOpenTaskId] = useState<string | null>(tasks[0]?.id ?? null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function cancelTask(task: CompanyTask) {
    setBusyId(task.id);
    setMessage(null);

    try {
      const response = await fetch(`/api/company-tasks/${task.id}/cancel`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reason: "社長がタスク一覧から中止" })
      });
      const payload = await response.json();

      if (!response.ok || !payload.task) {
        setMessage(payload.error ?? "タスクの中止に失敗しました");
        return;
      }

      setItems((current) => current.map((item) => (item.id === payload.task.id ? payload.task : item)));
      setMessage(`${payload.task.title} を中止しました`);
    } catch {
      setMessage("通信に失敗しました");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <div className="companyTaskList">
      {items.map((task) => {
        const isOpen = openTaskId === task.id;
        const copy = statusCopy[task.status] ?? statusCopy.queued;
        const relatedDrafts = contentDrafts.filter((draft) => matchesTask(task, draft)).slice(0, 3);

        return (
          <article className={isOpen ? "companyTaskCard open" : "companyTaskCard"} key={task.id}>
            <button
              aria-expanded={isOpen}
              className="companyTaskButton"
              onClick={() => setOpenTaskId(isOpen ? null : task.id)}
              type="button"
            >
              <span className={`priority ${task.priority}`}>{task.priorityLabel}</span>
              <span>
                <strong>{task.title}</strong>
                <small>
                  <span aria-hidden="true">◉</span> {task.owner} / {task.dueLabel}
                </small>
              </span>
              <span className={`taskStatus ${task.status}`}>{task.statusLabel}</span>
            </button>
            {isOpen ? (
              <div className="companyTaskDetail">
                <dl>
                  <div>
                    <dt><span aria-hidden="true">▶</span> 状態</dt>
                    <dd>{copy.now}</dd>
                  </div>
                  <div>
                    <dt><span aria-hidden="true">→</span> 次</dt>
                    <dd>{copy.next}</dd>
                  </div>
                </dl>
                {relatedDrafts.length > 0 ? (
                  <div className="taskRelatedContent">
                    <strong>この案件の投稿テーマ・公開予定</strong>
                    {relatedDrafts.map((draft) => {
                      const publishJob = publishJobs.find((job) => job.contentDraftId === draft.id);

                      return (
                        <article key={draft.id}>
                          <span>{draft.objective ?? "X投稿セット"}</span>
                          <h3>{draft.title}</h3>
                          <p>{draft.body}</p>
                          <small>CTA: {draft.cta}</small>
                          {draft.imagePrompt ? <small>画像案: {draft.imagePrompt}</small> : null}
                          <small>
                            公開: {publishStatusLabel(publishJob)}
                            {publishJob?.scheduledFor ? ` / ${publishJob.scheduledFor}` : ""}
                          </small>
                        </article>
                      );
                    })}
                  </div>
                ) : null}
                <a className="detailLink" href={relatedHref(task, employeeTasks)}>
                  {relatedLabel(task)}
                </a>
                <button
                  className="dangerButton"
                  disabled={busyId === task.id || task.status === "completed" || task.status === "blocked"}
                  onClick={() => cancelTask(task)}
                  type="button"
                >
                  中止
                </button>
              </div>
            ) : null}
          </article>
        );
      })}
      </div>
      {message ? <p className="actionMessage">{message}</p> : null}
    </>
  );
}
