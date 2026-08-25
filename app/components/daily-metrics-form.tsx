"use client";

import { useState } from "react";
import styles from "./daily-metrics-form.module.css";

type PerformanceSnapshot = {
  id?: string;
  appProjectId?: string;
  channel?: string;
  date: string;
  metrics: Record<string, number | string | null>;
};

type SnapshotResponse = {
  performanceSnapshot?: PerformanceSnapshot & {
    bottleneckRates?: Record<string, number | string>;
  };
  error?: string;
};

const defaultSnapshot: PerformanceSnapshot = {
  appProjectId: "app_numeria_studio",
  channel: "x",
  date: new Date().toISOString().slice(0, 10),
  metrics: {}
};

const metricFields = [
  { key: "impressions", label: "表示" },
  { key: "profile_visits", label: "プロフィール" },
  { key: "follows", label: "フォロー" },
  { key: "cta_clicks", label: "CTA" },
  { key: "landing_page_visits", label: "LP" },
  { key: "trial_or_signup_count", label: "登録" }
];

export function DailyMetricsForm({ latestSnapshot = defaultSnapshot }: { latestSnapshot?: PerformanceSnapshot }) {
  const [date, setDate] = useState(latestSnapshot.date);
  const [values, setValues] = useState(() =>
    Object.fromEntries(
      metricFields.map((field) => [
        field.key,
        latestSnapshot.metrics[field.key] === "unknown" ? "" : String(latestSnapshot.metrics[field.key] ?? "")
      ])
    )
  );
  const [status, setStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function saveSnapshot() {
    setIsSaving(true);
    setStatus(null);

    try {
      const response = await fetch("/api/performance-snapshots", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          appProjectId: latestSnapshot.appProjectId ?? "app_numeria_studio",
          channel: latestSnapshot.channel ?? "x",
          date,
          metrics: values
        })
      });
      const payload = (await response.json()) as SnapshotResponse;

      if (!response.ok || !payload.performanceSnapshot) {
        setStatus(payload.error ?? "保存に失敗しました");
        return;
      }

      setStatus(`${payload.performanceSnapshot.date} の日次指標を保存しました`);
    } catch {
      setStatus("通信に失敗しました");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className={styles.metricsForm}>
      <label>
        日付
        <input onChange={(event) => setDate(event.target.value)} type="date" value={date} />
      </label>
      <div className={styles.metricInputGrid}>
        {metricFields.map((field) => (
          <label key={field.key}>
            {field.label}
            <input
              inputMode="numeric"
              min="0"
              onChange={(event) => setValues((current) => ({ ...current, [field.key]: event.target.value }))}
              placeholder="未入力"
              type="number"
              value={values[field.key]}
            />
          </label>
        ))}
      </div>
      <button disabled={isSaving} onClick={saveSnapshot} type="button">
        {isSaving ? "保存中" : "保存"}
      </button>
      {status ? <p className="actionMessage">{status}</p> : null}
    </div>
  );
}
