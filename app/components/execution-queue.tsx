"use client";

import { useEffect, useState } from "react";
import { notifyApprovalRequestCreated, subscribeExecutionJobsChanged } from "./dashboard-events";
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
  published: "公開済み",
  cancelled: "取消済み"
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

  useEffect(() => {
    return subscribeExecutionJobsChanged((actions) => {
      const incomingMediaJobs = actions
        .filter((action) => action.type === "media_upload_job" && action.job)
        .map((action) => action.job as MediaUploadJob);
      const incomingPublishJobs = actions
        .filter((action) => action.type === "publish_job" && action.job)
        .map((action) => action.job as PublishJob);

      if (incomingMediaJobs.length > 0) {
        setMediaUploadJobs((current) => [
          ...incomingMediaJobs,
          ...current.filter((job) => !incomingMediaJobs.some((incomingJob) => incomingJob.id === job.id))
        ]);
      }

      if (incomingPublishJobs.length > 0) {
        setPublishJobs((current) => [
          ...incomingPublishJobs,
          ...current.filter((job) => !incomingPublishJobs.some((incomingJob) => incomingJob.id === job.id))
        ]);
      }
    });
  }, []);

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
      notifyApprovalRequestCreated(payload.approvalRequest);
      setMessage("メディア準備を確認しました");
    } catch {
      setMessage("通信に失敗しました");
    } finally {
      setBusyId(null);
    }
  }

  async function updatePublishJob(jobId: string, action: "manual-required" | "manual-published" | "cancel") {
    setBusyId(jobId);
    setMessage(null);

    const actionLabels = {
      "manual-required": "手動対応に切り替えました",
      "manual-published": "手動公開済みにしました",
      cancel: "公開ジョブを取り消しました"
    };

    try {
      const response = await fetch(`/api/publish-jobs/${jobId}/${action}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reason: "CEO updated publish job from dashboard" })
      });
      const payload = await response.json();

      if (!response.ok) {
        setMessage(payload.error ?? "公開ジョブの更新に失敗しました");
        return;
      }

      setPublishJobs((current) => current.map((job) => (job.id === jobId ? payload.publishJob : job)));
      setMessage(actionLabels[action]);
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
                <div className={styles.jobActions}>
                  <button
                    className="secondaryButton"
                    disabled={["published", "cancelled"].includes(job.status) || busyId === job.id}
                    onClick={() => updatePublishJob(job.id, "manual-published")}
                    type="button"
                  >
                    公開済み
                  </button>
                  <button
                    className="secondaryButton"
                    disabled={["published", "cancelled"].includes(job.status) || busyId === job.id}
                    onClick={() => updatePublishJob(job.id, "manual-required")}
                    type="button"
                  >
                    手動対応
                  </button>
                  <button
                    className="secondaryButton"
                    disabled={["published", "cancelled"].includes(job.status) || busyId === job.id}
                    onClick={() => updatePublishJob(job.id, "cancel")}
                    type="button"
                  >
                    取消
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {message ? <p className="actionMessage">{message}</p> : null}
    </div>
  );
}
