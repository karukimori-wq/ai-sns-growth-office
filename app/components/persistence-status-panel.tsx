"use client";

import { useState } from "react";

type RepositoryReadinessReport = {
  activeDriver: string;
  requestedDriver: string;
  durablePersistenceRequested: boolean;
  databaseBackedPersistenceReady: boolean;
  d1Configured: boolean;
  d1Reachable: boolean;
  fallbackUsed: boolean;
  issues: string[];
};

type RoundtripReport = {
  status: string;
  roundtripReady: boolean;
  operation?: {
    recordId?: string;
  };
  issues?: string[];
};

export function PersistenceStatusPanel({ initialReport }: { initialReport: RepositoryReadinessReport }) {
  const [report, setReport] = useState(initialReport);
  const [roundtrip, setRoundtrip] = useState<RoundtripReport | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function runPersistenceCheck() {
    setBusy(true);
    setMessage(null);

    try {
      const statusResponse = await fetch("/api/persistence/status", { cache: "no-store" });
      const statusPayload = await statusResponse.json();
      setReport({
        activeDriver: statusPayload.repositoryDriver,
        requestedDriver: statusPayload.requestedDriver,
        durablePersistenceRequested: statusPayload.durablePersistenceRequested,
        databaseBackedPersistenceReady: statusPayload.databaseBackedPersistenceReady,
        d1Configured: statusPayload.d1Configured,
        d1Reachable: statusPayload.d1Reachable,
        fallbackUsed: statusPayload.fallbackUsed,
        issues: statusPayload.issues ?? []
      });

      const roundtripResponse = await fetch("/api/persistence/roundtrip", { method: "POST" });
      const roundtripPayload = await roundtripResponse.json();
      setRoundtrip(roundtripPayload);

      if (!statusResponse.ok || !roundtripResponse.ok) {
        setMessage(roundtripPayload.issues?.[0] ?? statusPayload.issues?.[0] ?? "永続化検証に失敗しました");
        return;
      }

      setMessage("永続化の読み書き検証が完了しました");
    } catch {
      setMessage("永続化検証の通信に失敗しました");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="persistencePanel" aria-label="永続化ステータス">
      <div>
        <p className="eyebrow">Persistence</p>
        <h2>{formatPersistenceStatus(report)}</h2>
        <p>
          driver: {report.activeDriver} / requested: {report.requestedDriver}
        </p>
        {roundtrip ? (
          <p>
            roundtrip: {formatBoolean(roundtrip.roundtripReady)}
            {roundtrip.operation?.recordId ? ` / ${roundtrip.operation.recordId}` : ""}
          </p>
        ) : null}
      </div>
      <div className="persistenceChecks">
        <article>
          <span>D1設定</span>
          <strong>{formatBoolean(report.d1Configured)}</strong>
        </article>
        <article>
          <span>D1到達</span>
          <strong>{formatBoolean(report.d1Reachable)}</strong>
        </article>
        <article>
          <span>DB永続化</span>
          <strong>{formatBoolean(report.databaseBackedPersistenceReady)}</strong>
        </article>
        <article>
          <span>fallback</span>
          <strong>{formatBoolean(report.fallbackUsed)}</strong>
        </article>
      </div>
      <div className="persistenceActions">
        <button className="secondaryButton" disabled={busy} onClick={runPersistenceCheck} type="button">
          {busy ? "検証中" : "D1検証"}
        </button>
        {message ? <p className={roundtrip?.roundtripReady ? "persistenceSuccess" : "persistenceIssue"}>{message}</p> : null}
        {!message && report.issues.length > 0 ? <p className="persistenceIssue">{report.issues[0]}</p> : null}
      </div>
    </section>
  );
}

function formatPersistenceStatus(report: RepositoryReadinessReport) {
  if (report.databaseBackedPersistenceReady) {
    return "永続化OK";
  }

  if (report.durablePersistenceRequested) {
    return "要設定";
  }

  return "seed運用";
}

function formatBoolean(value: boolean) {
  return value ? "Yes" : "No";
}
