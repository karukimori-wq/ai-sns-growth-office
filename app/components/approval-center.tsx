"use client";

import { useEffect, useState } from "react";
import {
  notifyContentDraftCreated,
  notifyExecutionJobsChanged,
  notifyMediaAssetCreated,
  subscribeApprovalRequestCreated
} from "./dashboard-events";

type ApprovalRequest = {
  id: string;
  type: string;
  title: string;
  reason: string;
  status: string;
  history: Array<{ status: string; reason: string }>;
  relatedEmployeeTaskId?: string;
  relatedContentDraftId?: string;
};

type ContentDraft = {
  id: string;
  title: string;
  body: string;
  cta: string;
  imagePrompt?: string;
};

type EmployeeTask = {
  id: string;
  title: string;
  employeeName: string;
  outputType: string;
  statusLabel: string;
  progress: number;
  deliverable?: string;
  output?: {
    title: string;
    summary: string;
    nextAction: string;
  };
};

type FollowUpAction = {
  type: string;
  job?: {
    id: string;
    status: string;
  };
  reason?: string;
};

const approvalLabels: Record<string, string> = {
  strategy: "方針",
  draft: "下書き",
  image_asset: "画像",
  publish_schedule: "公開"
};

const statusLabels: Record<string, string> = {
  pending: "確認待ち",
  approved: "承認済み",
  revision_requested: "修正依頼済み"
};

const approvalDetails: Record<string, { target: string; detail: string }> = {
  strategy: {
    target: "承認対象: SNS導線の方針",
    detail: "ターゲット、教育順序、投稿から無料導線までの流れをこの方針で進めてよいか確認します。"
  },
  draft: {
    target: "承認対象: 投稿下書き",
    detail: "投稿本文、CTA、読者に伝える内容がこのまま公開準備へ進めてよいか確認します。"
  },
  image_asset: {
    target: "承認対象: 画像案",
    detail: "画像の雰囲気、文章との整合、投稿に使う素材として問題ないか確認します。"
  },
  publish_schedule: {
    target: "承認対象: 公開予約",
    detail: "公開タイミング、対象投稿、公開してよい状態かを最終確認します。"
  }
};

function findApprovalTask(approval: ApprovalRequest, employeeTasks: EmployeeTask[]) {
  if (approval.relatedEmployeeTaskId) {
    return employeeTasks.find((task) => task.id === approval.relatedEmployeeTaskId) ?? null;
  }

  if (approval.type === "strategy") {
    return employeeTasks.find((task) => ["route_design", "strategy"].includes(task.outputType)) ?? null;
  }
  if (approval.type === "image_asset") {
    return employeeTasks.find((task) => task.outputType === "image_direction") ?? null;
  }
  if (approval.type === "draft") {
    return employeeTasks.find((task) => task.outputType === "x_draft") ?? null;
  }

  return null;
}

function findApprovalDraft(approval: ApprovalRequest, contentDrafts: ContentDraft[]) {
  if (approval.relatedContentDraftId) {
    return contentDrafts.find((draft) => draft.id === approval.relatedContentDraftId) ?? null;
  }

  if (["draft", "image_asset", "publish_schedule"].includes(approval.type)) {
    return contentDrafts[0] ?? null;
  }

  return null;
}

export function ApprovalCenter({
  approvals,
  contentDrafts = [],
  employeeTasks = []
}: {
  approvals: ApprovalRequest[];
  contentDrafts?: ContentDraft[];
  employeeTasks?: EmployeeTask[];
}) {
  const pendingApprovals = approvals.filter((approval) => approval.status === "pending");
  const [items, setItems] = useState(pendingApprovals);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [followUps, setFollowUps] = useState<FollowUpAction[]>([]);
  const [openId, setOpenId] = useState<string | null>(pendingApprovals[0]?.id ?? null);

  useEffect(() => {
    return subscribeApprovalRequestCreated((approvalRequest) => {
      setItems((current) => [
        approvalRequest as ApprovalRequest,
        ...current.filter((item) => item.id !== approvalRequest.id)
      ]);
      setMessage(`${approvalRequest.title} を承認センターに追加しました`);
    });
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

      setItems((current) => current.filter((item) => item.id !== approvalId));
      const nextFollowUps = [...(payload.followUpActions?.created ?? []), ...(payload.followUpActions?.blocked ?? [])];
      setFollowUps(nextFollowUps);
      notifyContentDraftCreated(payload.materializedOutput?.contentDraft);
      notifyMediaAssetCreated(payload.materializedOutput?.mediaAsset);
      notifyExecutionJobsChanged(nextFollowUps);
      if (payload.approvalRequest) {
        setItems((current) => [
          payload.approvalRequest,
          ...current.filter((item) => item.id !== payload.approvalRequest.id)
        ]);
      }
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
        {items.length === 0 ? <p className="emptyState">現在、社長の承認待ちはありません。</p> : null}
        {items.map((approval) => {
          const detail = approvalDetails[approval.type] ?? {
            target: "承認対象: 確認事項",
            detail: approval.reason
          };
          const isOpen = openId === approval.id;
          const relatedTask = findApprovalTask(approval, employeeTasks);
          const relatedDraft = findApprovalDraft(approval, contentDrafts);

          return (
            <article className={isOpen ? "approvalCard open" : "approvalCard"} id={`approval-${approval.id}`} key={approval.id}>
              <button
                aria-expanded={isOpen}
                className="approvalSummaryButton"
                onClick={() => setOpenId(isOpen ? null : approval.id)}
                type="button"
              >
                <span className="approvalType">{approvalLabels[approval.type] ?? approval.type}</span>
                <span>
                  <strong>{approval.title}</strong>
                  <small>{detail.target}</small>
                </span>
                <small className={`approvalStatus ${approval.status}`}>{statusLabels[approval.status] ?? approval.status}</small>
              </button>
              {isOpen ? (
                <div className="approvalDetail">
                  <p>{approval.reason}</p>
                  <p>{detail.detail}</p>
                  <div className="approvalEvidence">
                    <strong>確認するもの</strong>
                    {relatedTask ? (
                      <article>
                        <span>{relatedTask.employeeName}</span>
                        <h3>{relatedTask.title}</h3>
                        <p>{relatedTask.deliverable ?? relatedTask.output?.summary ?? relatedTask.output?.nextAction}</p>
                        <small>
                          {relatedTask.statusLabel} / {relatedTask.progress}% / {relatedTask.outputType}
                        </small>
                      </article>
                    ) : null}
                    {relatedDraft ? (
                      <article>
                        <span>投稿下書き</span>
                        <h3>{relatedDraft.title}</h3>
                        <p>{relatedDraft.body}</p>
                        <small>CTA: {relatedDraft.cta}</small>
                        {relatedDraft.imagePrompt ? <small>画像案: {relatedDraft.imagePrompt}</small> : null}
                      </article>
                    ) : null}
                    {!relatedTask && !relatedDraft ? <p>関連する確認材料がまだ作成されていません。</p> : null}
                  </div>
                  {approval.history.length > 0 ? (
                    <small>履歴: {approval.history.map((history) => history.status).join(" → ")}</small>
                  ) : null}
                  <div className="approvalActions">
                    <button disabled={busyId === approval.id} onClick={() => submitDecision(approval.id, "approve")} type="button">
                      承認
                    </button>
                    <button
                      className="secondaryButton"
                      disabled={busyId === approval.id}
                      onClick={() => submitDecision(approval.id, "revision")}
                      type="button"
                    >
                      修正依頼
                    </button>
                  </div>
                </div>
              ) : null}
            </article>
          );
        })}
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
