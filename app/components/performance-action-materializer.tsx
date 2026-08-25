"use client";

import { useState } from "react";

type EmployeeTask = {
  id: string;
  employeeName: string;
  title: string;
};

type MaterializeResponse = {
  employeeTasks?: EmployeeTask[];
  skipped?: Array<{ id: string; reason: string }>;
  error?: string;
};

export function PerformanceActionMaterializer({ snapshotId }: { snapshotId: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function materializeActions() {
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/performance-actions/materialize", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ performanceSnapshotId: snapshotId })
      });
      const payload = (await response.json()) as MaterializeResponse;

      if (!response.ok) {
        setMessage(payload.error ?? "社員タスク化に失敗しました");
        return;
      }

      const createdCount = payload.employeeTasks?.length ?? 0;
      const skippedCount = payload.skipped?.length ?? 0;
      setMessage(`社員タスク化: 新規${createdCount}件 / 重複スキップ${skippedCount}件`);
    } catch {
      setMessage("通信に失敗しました");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="inlineAction">
      <button disabled={isSubmitting} onClick={materializeActions} type="button">
        {isSubmitting ? "作成中" : "社員タスク化"}
      </button>
      {message ? <p className="actionMessage">{message}</p> : null}
    </div>
  );
}
