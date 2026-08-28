"use client";

import { useEffect, useState } from "react";
import { notifyApprovalRequestCreated } from "./dashboard-events";

type ApprovalRequest = {
  id: string;
  type: string;
  title: string;
  reason: string;
  status: string;
  history: Array<{ status: string; reason: string }>;
};

export type EmployeeTask = {
  id: string;
  instructionId?: string;
  employeeId?: string;
  employeeName: string;
  title: string;
  status: string;
  statusLabel: string;
  progress: number;
  outputType: string;
  deliverable?: string;
  output?: {
    title: string;
    summary: string;
    nextAction: string;
    approvalRequired: boolean;
  };
};

const performanceTasksMaterializedEvent = "performance-actions:materialized";
export type EmployeeTaskContext = {
  projectName: string;
  instructionTitle: string;
};

export function notifyPerformanceTasksMaterialized(employeeTasks: EmployeeTask[]) {
  window.dispatchEvent(
    new CustomEvent(performanceTasksMaterializedEvent, {
      detail: { employeeTasks }
    })
  );
}

export function EmployeeTaskBoard({
  initialEmployeeTasks,
  taskContextByInstructionId = {}
}: {
  initialEmployeeTasks: EmployeeTask[];
  taskContextByInstructionId?: Record<string, EmployeeTaskContext>;
}) {
  const [employeeTasks, setEmployeeTasks] = useState(initialEmployeeTasks);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    function handleMaterialized(event: Event) {
      const customEvent = event as CustomEvent<{ employeeTasks?: EmployeeTask[] }>;
      const incomingTasks = customEvent.detail?.employeeTasks ?? [];

      if (incomingTasks.length === 0) {
        return;
      }

      setEmployeeTasks((current) => [
        ...incomingTasks,
        ...current.filter((task) => !incomingTasks.some((incomingTask) => incomingTask.id === task.id))
      ]);
    }

    window.addEventListener(performanceTasksMaterializedEvent, handleMaterialized);

    return () => window.removeEventListener(performanceTasksMaterializedEvent, handleMaterialized);
  }, []);

  async function updateTaskStatus(
    task: EmployeeTask,
    status: "in_progress" | "waiting_approval" | "completed" | "blocked"
  ) {
    setUpdatingTaskId(task.id);
    setMessage(null);

    try {
      const response = await fetch(`/api/employee-tasks/${task.id}/status`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status })
      });
      const payload = (await response.json()) as {
        employeeTask?: EmployeeTask;
        approvalRequest?: ApprovalRequest | null;
        error?: string;
      };

      if (!response.ok || !payload.employeeTask) {
        setMessage(payload.error ?? "社員タスクの更新に失敗しました");
        return;
      }

      setEmployeeTasks((current) =>
        current.map((currentTask) => (currentTask.id === payload.employeeTask?.id ? payload.employeeTask : currentTask))
      );
      notifyApprovalRequestCreated(payload.approvalRequest);
      setMessage(`${payload.employeeTask.title} を更新しました`);
    } catch {
      setMessage("通信に失敗しました");
    } finally {
      setUpdatingTaskId(null);
    }
  }

  return (
    <>
      <div className="taskTable">
        {employeeTasks.map((task) => (
          <article className="taskRow" key={task.id}>
            <span className={`taskStatus ${task.status}`}>{task.statusLabel}</span>
            <span className="taskIdentity">
              <strong>{task.title}</strong>
              {task.instructionId && taskContextByInstructionId[task.instructionId] ? (
                <small>
                  {taskContextByInstructionId[task.instructionId].projectName} /{" "}
                  {taskContextByInstructionId[task.instructionId].instructionTitle}
                </small>
              ) : (
                <small>案件未設定</small>
              )}
            </span>
            <span>{task.employeeName}</span>
            <span>{task.progress}%</span>
            <span>{task.outputType}</span>
            {task.output ? (
              <span className="taskOutput">
                <strong>{task.output.title}</strong>
                <small>{task.output.summary}</small>
                <small>{task.output.approvalRequired ? "CEO承認が必要" : task.output.nextAction}</small>
              </span>
            ) : (
              <span className="taskOutput muted">成果物未生成</span>
            )}
            <span className="rowActions">
              <button
                disabled={updatingTaskId === task.id || task.status === "completed"}
                onClick={() => updateTaskStatus(task, "in_progress")}
                type="button"
              >
                開始
              </button>
              <button
                disabled={updatingTaskId === task.id || task.status === "completed"}
                onClick={() => updateTaskStatus(task, "waiting_approval")}
                type="button"
              >
                承認待ち
              </button>
              <button
                disabled={updatingTaskId === task.id || task.status === "completed"}
                onClick={() => updateTaskStatus(task, "completed")}
                type="button"
              >
                完了
              </button>
              <button
                disabled={updatingTaskId === task.id || task.status === "completed"}
                onClick={() => updateTaskStatus(task, "blocked")}
                type="button"
              >
                停止
              </button>
            </span>
          </article>
        ))}
      </div>
      {message ? <p className="actionMessage">{message}</p> : null}
    </>
  );
}
