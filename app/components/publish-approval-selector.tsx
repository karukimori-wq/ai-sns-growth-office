"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DashboardContentDraft,
  DashboardMediaAsset,
  notifyApprovalRequestCreated,
  subscribeExecutionJobsChanged
} from "./dashboard-events";

type MediaUploadJob = {
  id: string;
  mediaAssetId: string;
  status: string;
};

type PublishApprovalSelectorProps = {
  contentDrafts: DashboardContentDraft[];
  mediaAssets: DashboardMediaAsset[];
  mediaUploadJobs: MediaUploadJob[];
};

const mediaReadyStatuses = new Set(["uploaded", "manual_required"]);

export function PublishApprovalSelector({
  contentDrafts,
  mediaAssets,
  mediaUploadJobs
}: PublishApprovalSelectorProps) {
  const [trackedMediaUploadJobs, setTrackedMediaUploadJobs] = useState(mediaUploadJobs);
  const pairs = useMemo(
    () =>
      contentDrafts
        .map((draft) => {
          const mediaAsset = mediaAssets.find((asset) => asset.contentDraftId === draft.id);
          const mediaUploadJob = mediaAsset
            ? trackedMediaUploadJobs.find((job) => job.mediaAssetId === mediaAsset.id)
            : null;

          return {
            draft,
            mediaAsset,
            mediaUploadJob,
            ready: Boolean(mediaAsset && mediaUploadJob && mediaReadyStatuses.has(mediaUploadJob.status))
          };
        })
        .filter((pair) => pair.mediaAsset),
    [contentDrafts, mediaAssets, trackedMediaUploadJobs]
  );
  const [selectedDraftId, setSelectedDraftId] = useState(pairs[0]?.draft.id ?? "");
  const [scheduledFor, setScheduledFor] = useState("21:00");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const selectedPair = pairs.find((pair) => pair.draft.id === selectedDraftId) ?? pairs[0];

  useEffect(() => {
    return subscribeExecutionJobsChanged((actions) => {
      const incomingMediaJobs = actions
        .filter((action) => action.type === "media_upload_job" && action.job?.mediaAssetId)
        .map((action) => action.job as MediaUploadJob);

      if (incomingMediaJobs.length === 0) {
        return;
      }

      setTrackedMediaUploadJobs((current) => [
        ...incomingMediaJobs,
        ...current.filter((job) => !incomingMediaJobs.some((incomingJob) => incomingJob.id === job.id))
      ]);
    });
  }, []);

  async function requestPublishApproval() {
    if (!selectedPair?.mediaAsset) {
      setMessage("下書きと画像のペアがありません");
      return;
    }

    setBusy(true);
    setMessage(null);

    try {
      const response = await fetch("/api/publish-approval-requests", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contentDraftId: selectedPair.draft.id,
          mediaAssetId: selectedPair.mediaAsset.id,
          scheduledFor
        })
      });
      const payload = await response.json();

      if (!response.ok) {
        setMessage(errorLabel(payload.error));
        return;
      }

      notifyApprovalRequestCreated(payload.approvalRequest);
      setMessage("公開承認を承認センターへ追加しました");
    } catch {
      setMessage("通信に失敗しました");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="publishApprovalSelector">
      <div className="selectorControls">
        <label>
          <span>下書きと画像</span>
          <select
            onChange={(event) => setSelectedDraftId(event.target.value)}
            value={selectedPair?.draft.id ?? ""}
          >
            {pairs.map((pair) => (
              <option key={pair.draft.id} value={pair.draft.id}>
                {pair.draft.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>希望公開時刻</span>
          <input
            onChange={(event) => setScheduledFor(event.target.value)}
            placeholder="21:00"
            value={scheduledFor}
          />
        </label>
      </div>

      {selectedPair ? (
        <article className="selectedPublishPair">
          <div>
            <strong>{selectedPair.draft.title}</strong>
            <p>{selectedPair.draft.body}</p>
            <small>画像: {selectedPair.mediaAsset?.concept}</small>
          </div>
          <span className={`taskStatus ${selectedPair.ready ? "completed" : "waiting_approval"}`}>
            {selectedPair.ready ? "準備OK" : "画像準備待ち"}
          </span>
        </article>
      ) : (
        <p className="emptyState">公開承認へ進められる下書きと画像のペアがありません。</p>
      )}

      <button disabled={!selectedPair?.ready || busy} onClick={requestPublishApproval} type="button">
        公開承認へ進める
      </button>
      {message ? <p className="actionMessage">{message}</p> : null}
    </div>
  );
}

function errorLabel(error: string | undefined) {
  if (error === "draft_approval_not_approved") return "下書き承認が完了していません";
  if (error === "media_upload_not_ready") return "画像アップロード準備が完了していません";
  if (error === "media_asset_does_not_match_content_draft") return "下書きと画像の組み合わせが一致していません";
  return error ?? "公開承認の作成に失敗しました";
}
