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

const statusCopy: Record<string, { now: string; next: string }> = {
  in_progress: {
    now: "担当AIが作業中です。成果物や判断材料を作っている段階です。",
    next: "進捗が承認待ちに変わったら、内容確認へ進みます。"
  },
  waiting_approval: {
    now: "社長確認待ちです。止まっている原因は作業ではなく判断待ちです。",
    next: "承認センターまたは関連する確認項目から、承認・修正依頼を行います。"
  },
  queued: {
    now: "待機中です。前段のタスクや承認が終わるまで開始しません。",
    next: "優先度が高い場合は担当AIに開始指示を出します。"
  },
  blocked: {
    now: "停止中です。何かの不足や判断待ちで進められません。",
    next: "停止理由を確認し、必要な入力や承認を行います。"
  },
  completed: {
    now: "完了済みです。次の工程や公開判断へ進められます。",
    next: "必要なら成果物を確認し、次のタスクを作成します。"
  }
};

function relatedHref(task: CompanyTask) {
  if (task.status === "waiting_approval") return "#instructions";
  if (task.id.includes("media")) return "/media";
  if (task.id.includes("metric")) return "#metrics";
  return "#agents";
}

function relatedLabel(task: CompanyTask) {
  if (task.status === "waiting_approval") return "承認へ";
  if (task.id.includes("media")) return "画像管理へ";
  if (task.id.includes("metric")) return "日次指標へ";
  return "担当AIへ";
}

export function CompanyTaskBoard({ tasks }: { tasks: CompanyTask[] }) {
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
                  {task.owner} / {task.dueLabel}
                </small>
              </span>
              <span className={`taskStatus ${task.status}`}>{task.statusLabel}</span>
            </button>
            {isOpen ? (
              <div className="companyTaskDetail">
                <dl>
                  <div>
                    <dt>今何してるか</dt>
                    <dd>{copy.now}</dd>
                  </div>
                  <div>
                    <dt>次に見ること</dt>
                    <dd>{copy.next}</dd>
                  </div>
                </dl>
                <a className="detailLink" href={relatedHref(task)}>
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
