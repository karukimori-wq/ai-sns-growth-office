"use client";

export type DashboardApprovalRequest = {
  id: string;
  type: string;
  title: string;
  reason: string;
  status: string;
  history: Array<{ status: string; reason: string }>;
};

export type DashboardContentDraft = {
  id: string;
  title: string;
  body: string;
  cta?: string;
  imagePrompt?: string | null;
};

export type DashboardMediaAsset = {
  id: string;
  type: string;
  status: string;
  concept: string;
  contentDraftId?: string | null;
};

export type DashboardExecutionJob = {
  id: string;
  status: string;
  mediaAssetId?: string;
  contentDraftId?: string;
  mediaUploadJobId?: string | null;
  history?: Array<{
    status: string;
    reason?: string | null;
    occurredAt?: string | null;
    publishResultUrl?: string | null;
  }>;
};

export type DashboardFollowUpAction = {
  type: string;
  job?: DashboardExecutionJob;
  reason?: string;
};

const approvalRequestCreatedEvent = "approval-requests:created";
const contentDraftCreatedEvent = "content-drafts:created";
const mediaAssetCreatedEvent = "media-assets:created";
const executionJobsChangedEvent = "execution-jobs:changed";

export function notifyApprovalRequestCreated(approvalRequest: DashboardApprovalRequest | null | undefined) {
  if (!approvalRequest) {
    return;
  }

  window.dispatchEvent(new CustomEvent(approvalRequestCreatedEvent, { detail: { approvalRequest } }));
}

export function subscribeApprovalRequestCreated(handler: (approvalRequest: DashboardApprovalRequest) => void) {
  return subscribe(approvalRequestCreatedEvent, (detail) => {
    if (detail.approvalRequest) {
      handler(detail.approvalRequest as DashboardApprovalRequest);
    }
  });
}

export function notifyContentDraftCreated(contentDraft: DashboardContentDraft | null | undefined) {
  if (!contentDraft) {
    return;
  }

  window.dispatchEvent(new CustomEvent(contentDraftCreatedEvent, { detail: { contentDraft } }));
}

export function subscribeContentDraftCreated(handler: (contentDraft: DashboardContentDraft) => void) {
  return subscribe(contentDraftCreatedEvent, (detail) => {
    if (detail.contentDraft) {
      handler(detail.contentDraft as DashboardContentDraft);
    }
  });
}

export function notifyMediaAssetCreated(mediaAsset: DashboardMediaAsset | null | undefined) {
  if (!mediaAsset) {
    return;
  }

  window.dispatchEvent(new CustomEvent(mediaAssetCreatedEvent, { detail: { mediaAsset } }));
}

export function subscribeMediaAssetCreated(handler: (mediaAsset: DashboardMediaAsset) => void) {
  return subscribe(mediaAssetCreatedEvent, (detail) => {
    if (detail.mediaAsset) {
      handler(detail.mediaAsset as DashboardMediaAsset);
    }
  });
}

export function notifyExecutionJobsChanged(actions: DashboardFollowUpAction[]) {
  if (actions.length === 0) {
    return;
  }

  window.dispatchEvent(new CustomEvent(executionJobsChangedEvent, { detail: { actions } }));
}

export function subscribeExecutionJobsChanged(handler: (actions: DashboardFollowUpAction[]) => void) {
  return subscribe(executionJobsChangedEvent, (detail) => handler((detail.actions ?? []) as DashboardFollowUpAction[]));
}

function subscribe(eventName: string, handler: (detail: Record<string, unknown>) => void) {
  function listener(event: Event) {
    handler((event as CustomEvent<Record<string, unknown>>).detail ?? {});
  }

  window.addEventListener(eventName, listener);

  return () => window.removeEventListener(eventName, listener);
}
