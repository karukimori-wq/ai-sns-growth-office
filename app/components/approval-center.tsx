"use client";

import { useEffect, useState } from "react";
import { notifyExecutionJobsChanged } from "./execution-queue";

type ApprovalRequest = {
  id: string;
  type: string;
  title: string;
  reason: string;
  status: string;
  history: Array<{ status: string; reason: string }>;
};

type FollowUpAction = {
  type: string;
  job?: {
    id: string;
    status: string;
  };
  reason?: string;
};

const approvalRequestCreatedEvent = "approval-requests:created";

export function notifyApprovalRequestCreated(approvalRequest: ApprovalRequest | null | undefined) {
  if (!approvalRequest) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(approvalRequestCreatedEvent, {
      detail: { approvalRequest }
    })
  );
}

const approvalLabels: Record<string, string> = {
  strategy: "方針",
  draft: "下書き",
  image_asset: "画像",
  publish_schedule: "公開"
};

const statusLabels: Record<string, string> = {
  pending: "確認待ち",
  approved: "承認済み",
  revision_requested: "修正依頼"
};

export function ApprovalCenter({ approvals }: { approvals: ApprovalRequest[] }) {
  const [items, setItems] = useState(approvals);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [followUps, setFollowUps] = useState<FollowUpAction[]>([]);

  useEffect(() => {
    function handleCreated(event: Event) {
      const customEvent = event as CustomEvent<{ approvalRequest?: ApprovalRequest }>;
      const approvalRequest = customEvent.detail?.approvalRequest;

      if (!approvalRequest) {
        return;
      }

      setItems((current) => [
        approvalRequest,
        ...current.filter((item) => item.id !== approvalRequest.id)
      ]);
      setMessage(`${approvalRequest.title} を承認センターに追加しました`);
    }

    window.addEventListener(approvalRequestCreatedEvent, handleCreated);

    return () => window.removeEventListener(approvalRequestCreatedEvent, handleCreated);
  }, []);

  async function submitDecision(approvalId: string, action: "approve" | "revision") {
    setBusyId(approvalId);
    setMessage(null);

    try {
      const response = await fetch(`/api/approvals/${approvalId}/${action}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          reason: action === "approve" ? "approved from CEO dashboard" : "revision requested from CEO dashboard"
        })
      });

      const payload = await response.json();

      if (!response.ok) {
        setMessage(payload.error ?? "承認処理に失敗しました");
        return;
      }

      setItems((current) => current.map((item) => (item.id === approvalId ? payload.approval : item)));
      const nextFollowUps = [...(payload.followUpActions?.created ?? []), ...(payload.followUpActions?.blocked ?? [])];
      setFollowUps(nextFollowUps);
      notifyExecutionJobsChanged(nextFollowUps);
      setMessage(action === "approve" ? "承認しました" : "修正依頼を送りました");
    } catch {
      setMessage("通信に失敗しました");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <div className="approvalCenter">
        {items.map((approval) => (
          <article className="approvalCard" key={approval.id}>
            <span className="approvalType">{approvalLabels[approval.type] ?? approval.type}</span>
            <div>
              <strong>{approval.title}</strong>
              <p>{approval.reason}</p>
              <small className={`approvalStatus ${approval.status}`}>{statusLabels[approval.status] ?? approval.status}</small>
            </div>
            <div className="approvalActions">
              <button
                disabled={approval.status !== "pending" || busyId === approval.id}
                onClick={() => submitDecision(approval.id, "approve")}
                type="button"
              >
                承認
              </button>
              <button
                className="secondaryButton"
                disabled={approval.status !== "pending" || busyId === approval.id}
                onClick={() => submitDecision(approval.id, "revision")}
                type="button"
              >
                修正
              </button>
            </div>
          </article>
        ))}
      </div>
      {message ? <p className="actionMessage">{message}</p> : null}
      {followUps.length > 0 ? (
        <div className="followUpList">
          {followUps.map((action, index) => (
            <article key={`${action.type}-${index}`}>
              <strong>{action.type}</strong>
              <p>{action.job ? `${action.job.id} / ${action.job.status}` : action.reason}</p>
            </article>
          ))}
        </div>
      ) : null}
    </>
  );
}
