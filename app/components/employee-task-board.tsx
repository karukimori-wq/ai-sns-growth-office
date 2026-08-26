"use client";

import { useEffect, useState } from "react";

export type EmployeeTask = {
  id: string;
  employeeName: string;
  title: string;
  status: string;
  statusLabel: string;
  progress: number;
  outputType: string;
};

const performanceTasksMaterializedEvent = "performance-actions:materialized";

export function notifyPerformanceTasksMaterialized(employeeTasks: EmployeeTask[]) {
  window.dispatchEvent(
    new CustomEvent(performanceTasksMaterializedEvent, {
      detail: { employeeTasks }
    })
  );
}

export function EmployeeTaskBoard({ initialEmployeeTasks }: { initialEmployeeTasks: EmployeeTask[] }) {
  const [employeeTasks, setEmployeeTasks] = useState(initialEmployeeTasks);

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

  return (
    <div className="taskTable">
      {employeeTasks.map((task) => (
        <article className="taskRow" key={task.id}>
          <span className={`taskStatus ${task.status}`}>{task.statusLabel}</span>
          <strong>{task.title}</strong>
          <span>{task.employeeName}</span>
          <span>{task.progress}%</span>
          <span>{task.outputType}</span>
        </article>
      ))}
    </div>
  );
}
