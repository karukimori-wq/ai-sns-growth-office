"use client";

import { useState } from "react";
import { DailyMetricsForm } from "./daily-metrics-form";
import styles from "./execution-queue.module.css";

type MediaUploadJob = {
  id: string;
  mediaAssetId: string;
  status: string;
  xMediaId?: string | null;
  manualReason?: string;
};

type PublishJob = {
  id: string;
  contentDraftId: string;
  mediaUploadJobId?: string | null;
  status: string;
};

const jobStatusLabels: Record<string, string> = {
  queued: "待機中",
  uploaded: "アップロード済み",
  manual_required: "手動確認済み",
  published: "公開済み"
};

export function ExecutionQueue({
  initialMediaUploadJobs,
  initialPublishJobs
}: {
  initialMediaUploadJobs: MediaUploadJob[];
  initialPublishJobs: PublishJob[];
}) {
  const [mediaUploadJobs, setMediaUploadJobs] = useState(initialMediaUploadJobs);
  const [publishJobs, setPublishJobs] = useState(initialPublishJobs);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function refreshJobs() {
    const [mediaResponse, publishResponse] = await Promise.all([
      fetch("/api/media-upload-jobs"),
      fetch("/api/publish-jobs")
    ]);
    const [mediaPayload, publishPayload] = await Promise.all([mediaResponse.json(), publishResponse.json()]);

    setMediaUploadJobs(mediaPayload.mediaUploadJobs ?? []);
    setPublishJobs(publishPayload.publishJobs ?? []);
  }

  async function markManualReady(jobId: string) {
    setBusyId(jobId);
    setMessage(null);

    try {
      const response = await fetch(`/api/media-upload-jobs/${jobId}/manual-ready`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reason: "CEO confirmed media is ready for X publish" })
      });
      const payload = await response.json();

      if (!response.ok) {
        setMessage(payload.error ?? "メディア確認に失敗しました");
        return;
      }

      setMediaUploadJobs((current) => current.map((job) => (job.id === jobId ? payload.mediaUploadJob : job)));
      setMessage("メディア準備を確認しました");
    } catch {
      setMessage("通信に失敗しました");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className={styles.executionQueue}>
      <div className={styles.queueToolbar}>
        <button className="secondaryButton" onClick={refreshJobs} type="button">
          更新
        </button>
      </div>

      <section>
        <h3>日次指標入力</h3>
        <DailyMetricsForm />
      </section>

      <section>
        <h3>メディア準備</h3>
        {mediaUploadJobs.length === 0 ? (
          <p className={styles.emptyText}>画像承認後にアップロード準備ジョブが表示されます。</p>
        ) : (
          <div className={styles.jobList}>
            {mediaUploadJobs.map((job) => (
              <article className={styles.jobCard} key={job.id}>
                <div>
                  <strong>{job.id}</strong>
                  <p>asset: {job.mediaAssetId}</p>
                </div>
                <span className={`taskStatus ${job.status}`}>{jobStatusLabels[job.status] ?? job.status}</span>
                <button
                  className="secondaryButton"
                  disabled={job.status !== "queued" || busyId === job.id}
                  onClick={() => markManualReady(job.id)}
                  type="button"
                >
                  準備確認
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <section>
        <h3>公開予約</h3>
        {publishJobs.length === 0 ? (
          <p className={styles.emptyText}>下書き承認、画像準備、公開承認が揃うと公開ジョブが表示されます。</p>
        ) : (
          <div className={styles.jobList}>
            {publishJobs.map((job) => (
              <article className={styles.jobCard} key={job.id}>
                <div>
                  <strong>{job.id}</strong>
                  <p>draft: {job.contentDraftId}</p>
                </div>
                <span className={`taskStatus ${job.status}`}>{jobStatusLabels[job.status] ?? job.status}</span>
                <span>{job.mediaUploadJobId ?? "画像なし"}</span>
              </article>
            ))}
          </div>
        )}
      </section>

      {message ? <p className="actionMessage">{message}</p> : null}
    </div>
  );
}
