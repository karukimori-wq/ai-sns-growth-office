"use client";

import { useEffect, useState } from "react";
import { notifyApprovalRequestCreated, notifyExecutionJobsChanged, subscribeExecutionJobsChanged } from "./dashboard-events";
import { DailyMetricsForm } from "./daily-metrics-form";
import styles from "./execution-queue.module.css";

type MediaUploadJob = {
  id: string;
  mediaAssetId: string;
  status: string;
  xMediaId?: string | null;
  manualReason?: string;
  history?: ExecutionHistoryEntry[];
};

type ExecutionHistoryEntry = {
  status: string;
  reason?: string | null;
  occurredAt?: string | null;
  publishResultUrl?: string | null;
};

type PublishJob = {
  id: string;
  contentDraftId: string;
  mediaUploadJobId?: string | null;
  scheduledFor?: string | null;
  publishedAt?: string | null;
  publishResultUrl?: string | null;
  manualReason?: string | null;
  cancelReason?: string | null;
  status: string;
  history?: ExecutionHistoryEntry[];
};

const jobStatusLabels: Record<string, string> = {
  queued: "待機中",
  uploaded: "アップロード済み",
  manual_required: "手動対応中",
  published: "公開済み",
  cancelled: "取消済み"
};

const publishActionDescriptions = [
  "画像が使える状態なら「画像準備OK」",
  "公開できたら「公開済みにする」",
  "出さない投稿は「公開を止める」"
];

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
  const queuedMediaCount = mediaUploadJobs.filter((job) => job.status === "queued").length;
  const readyMediaCount = mediaUploadJobs.filter((job) => ["uploaded", "manual_required"].includes(job.status)).length;
  const pendingPublishCount = publishJobs.filter((job) => !["published", "cancelled"].includes(job.status)).length;
  const completedPublishCount = publishJobs.filter((job) => job.status === "published").length;
  const nextExecutionFocus =
    queuedMediaCount > 0
      ? "メディア準備を確認"
      : pendingPublishCount > 0
        ? "公開するか確認"
        : completedPublishCount > 0
          ? "公開結果を確認"
          : "承認後にジョブ作成";

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
      notifyExecutionJobsChanged([{ type: "media_upload_job", job: payload.mediaUploadJob }]);
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
      notifyExecutionJobsChanged([{ type: "publish_job", job: payload.publishJob }]);
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
        <div>
          <strong>ここでやること</strong>
          <p>承認済みの投稿を、公開できる状態まで進めて記録します。</p>
        </div>
        <button className="secondaryButton" onClick={refreshJobs} type="button">
          更新
        </button>
      </div>

      <section className={styles.howToUse} aria-label="公開前チェックの使い方">
        {publishActionDescriptions.map((description, index) => (
          <article key={description}>
            <span>{index + 1}</span>
            <p>{description}</p>
          </article>
        ))}
      </section>

      <section className={styles.executionSummary} aria-label="公開準備サマリー">
        <article>
          <span>次に見ること</span>
          <strong>{nextExecutionFocus}</strong>
        </article>
        <article>
          <span>メディア待ち</span>
          <strong>{queuedMediaCount}</strong>
        </article>
        <article>
          <span>準備済み画像</span>
          <strong>{readyMediaCount}</strong>
        </article>
        <article>
          <span>公開待ち</span>
          <strong>{pendingPublishCount}</strong>
        </article>
        <article>
          <span>公開済み</span>
          <strong>{completedPublishCount}</strong>
        </article>
      </section>

      <nav className={styles.quickLinks} aria-label="公開前チェックの近道">
        <a href="#media-ready">画像準備</a>
        <a href="#publish-ready">公開予約</a>
        <a href="#daily-metrics">数字入力</a>
      </nav>

      <section id="media-ready">
        <h3>画像準備</h3>
        {mediaUploadJobs.length === 0 ? (
          <p className={styles.emptyText}>画像承認後にアップロード準備ジョブが表示されます。</p>
        ) : (
          <div className={styles.jobList}>
            {mediaUploadJobs.map((job) => (
              <article className={styles.jobCard} key={job.id}>
                <div>
                  <strong>画像をX投稿に使える状態にする</strong>
                  <p>対象画像: {job.mediaAssetId}</p>
                  {job.manualReason ? <p>理由: {job.manualReason}</p> : null}
                  {renderHistory(`${job.id} の準備履歴`, job.history)}
                </div>
                <span className={`taskStatus ${job.status}`}>{jobStatusLabels[job.status] ?? job.status}</span>
                <button
                  className="secondaryButton"
                  disabled={job.status !== "queued" || busyId === job.id}
                  onClick={() => markManualReady(job.id)}
                  type="button"
                >
                  画像準備OK
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <section id="publish-ready">
        <h3>公開予約</h3>
        {publishJobs.length === 0 ? (
          <p className={styles.emptyText}>下書き承認、画像準備、公開承認が揃うと、ここに公開待ちの投稿が表示されます。</p>
        ) : (
          <div className={styles.jobList}>
            {publishJobs.map((job) => (
              <article className={styles.jobCard} key={job.id}>
                <div>
                  <strong>投稿を公開して記録する</strong>
                  <p>対象下書き: {job.contentDraftId}</p>
                  {job.scheduledFor ? <p>公開予定: {job.scheduledFor}</p> : null}
                  {job.publishedAt ? <p>公開完了: {job.publishedAt}</p> : null}
                  {job.publishResultUrl ? <p>公開URL: {job.publishResultUrl}</p> : null}
                  {job.manualReason ? <p>理由: {job.manualReason}</p> : null}
                  {job.cancelReason ? <p>取消理由: {job.cancelReason}</p> : null}
                  {renderHistory(`${job.id} の実行履歴`, job.history)}
                </div>
                <span className={`taskStatus ${job.status}`}>{jobStatusLabels[job.status] ?? job.status}</span>
                <div className={styles.jobActions}>
                  <button
                    className="secondaryButton"
                    disabled={["published", "cancelled"].includes(job.status) || busyId === job.id}
                    onClick={() => updatePublishJob(job.id, "manual-published")}
                    type="button"
                  >
                    公開済みにする
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
                    公開を止める
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section id="daily-metrics">
        <h3>投稿後の日次指標</h3>
        <p className={styles.emptyText}>公開後に、表示・プロフィール・CTAなどの数字を入れて反応を見ます。</p>
        <DailyMetricsForm />
      </section>

      {message ? <p className="actionMessage">{message}</p> : null}
    </div>
  );
}

function renderHistory(label: string, history: ExecutionHistoryEntry[] | undefined) {
  if (!history?.length) {
    return null;
  }

  return (
    <ol className={styles.historyList} aria-label={label}>
      {history.map((entry, index) => (
        <li key={`${entry.status}-${entry.occurredAt ?? index}`}>
          <span>{jobStatusLabels[entry.status] ?? entry.status}</span>
          {entry.occurredAt ? <time>{entry.occurredAt}</time> : null}
          {entry.reason ? <small>{entry.reason}</small> : null}
          {entry.publishResultUrl ? <small>URL: {entry.publishResultUrl}</small> : null}
        </li>
      ))}
    </ol>
  );
}
