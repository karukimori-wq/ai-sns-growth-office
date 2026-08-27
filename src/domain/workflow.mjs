export const approvalTypes = ["strategy", "draft", "image_asset", "publish_schedule"];

export function createApprovalRequest({ id, type, title, relatedAppProjectId }) {
  if (!approvalTypes.includes(type)) {
    throw new Error(`Unsupported approval type: ${type}`);
  }

  return {
    id,
    type,
    title,
    relatedAppProjectId,
    status: "pending",
    history: [{ status: "pending", reason: "created" }]
  };
}

export function approveRequest(request, reason = "approved by CEO") {
  assertPending(request);

  return {
    ...request,
    status: "approved",
    history: [...request.history, { status: "approved", reason }]
  };
}

export function requestRevision(request, reason) {
  assertPending(request);

  return {
    ...request,
    status: "revision_requested",
    history: [...request.history, { status: "revision_requested", reason }]
  };
}

export function canCreateXMediaUploadJob({ imageApproval }) {
  return imageApproval?.type === "image_asset" && imageApproval.status === "approved";
}

export function canCreateXPublishJob({ draftApproval, publishApproval, mediaUploadJob }) {
  const draftApproved = draftApproval?.status === "approved";
  const publishApproved =
    publishApproval?.type === "publish_schedule" && publishApproval.status === "approved";
  const mediaReady =
    !mediaUploadJob || mediaUploadJob.status === "uploaded" || mediaUploadJob.status === "manual_required";

  return draftApproved && publishApproved && mediaReady;
}

export function createXMediaUploadJob({ id, mediaAssetId, imageApproval }) {
  if (!canCreateXMediaUploadJob({ imageApproval })) {
    throw new Error("Cannot create X media upload job before image approval");
  }

  return {
    id,
    mediaAssetId,
    status: "queued",
    xMediaId: null
  };
}

export function markMediaUploaded(job, xMediaId) {
  if (!xMediaId) {
    throw new Error("xMediaId is required");
  }

  return {
    ...job,
    status: "uploaded",
    xMediaId
  };
}

export function markMediaManualReady(job, reason = "manual media upload confirmed") {
  const occurredAt = new Date().toISOString();

  return {
    ...job,
    status: "manual_required",
    manualReason: reason,
    history: [
      ...(job.history ?? []),
      {
        status: "manual_required",
        reason,
        occurredAt
      }
    ]
  };
}

export function createXPublishJob({ id, contentDraftId, draftApproval, publishApproval, mediaUploadJob }) {
  if (!canCreateXPublishJob({ draftApproval, publishApproval, mediaUploadJob })) {
    throw new Error("Cannot create X publish job before required CEO approvals");
  }

  return {
    id,
    contentDraftId,
    mediaUploadJobId: mediaUploadJob?.id ?? null,
    scheduledFor: publishApproval.scheduledFor ?? null,
    status: "queued"
  };
}

export function createFollowUpActionsAfterApproval({ approval, repository }) {
  if (approval.status !== "approved") {
    return { created: [], blocked: [] };
  }

  if (approval.type === "image_asset") {
    const mediaAsset = repository
      .listMediaAssets()
      .find((item) => item.appProjectId === approval.relatedAppProjectId && item.status === "waiting_approval");

    if (!mediaAsset) {
      return {
        created: [],
        blocked: [{ type: "media_upload_job", reason: "media_asset_not_found" }]
      };
    }

    return {
      created: [
        {
          type: "media_upload_job",
          job: createXMediaUploadJob({
            id: `x_media_upload_${mediaAsset.id}`,
            mediaAssetId: mediaAsset.id,
            imageApproval: approval
          })
        }
      ],
      blocked: []
    };
  }

  if (approval.type === "publish_schedule") {
    const contentDrafts = repository.listContentDrafts();
    const approvals = repository.listApprovals();
    const mediaAssets = repository.listMediaAssets();
    const mediaUploadJobs = repository.listMediaUploadJobs();
    const contentDraft = approval.relatedContentDraftId
      ? contentDrafts.find((item) => item.id === approval.relatedContentDraftId)
      : contentDrafts.find((item) => item.appProjectId === approval.relatedAppProjectId && item.status === "waiting_approval");
    const draftApproval = approvals.find(
      (item) =>
        item.type === "draft" &&
        item.relatedAppProjectId === approval.relatedAppProjectId &&
        item.status === "approved"
    );
    const mediaAsset = approval.relatedMediaAssetId
      ? mediaAssets.find((item) => item.id === approval.relatedMediaAssetId)
      : contentDraft
        ? mediaAssets.find((item) => item.contentDraftId === contentDraft.id)
        : null;
    const mediaUploadJob = approval.relatedMediaUploadJobId
      ? mediaUploadJobs.find((item) => item.id === approval.relatedMediaUploadJobId)
      : mediaAsset
        ? mediaUploadJobs.find((item) => item.mediaAssetId === mediaAsset.id)
        : undefined;

    const blocked = [];
    if (!contentDraft) {
      blocked.push({ type: "publish_job", reason: "content_draft_not_found" });
    }
    if (contentDraft && contentDraft.appProjectId !== approval.relatedAppProjectId) {
      blocked.push({ type: "publish_job", reason: "content_draft_does_not_match_approval" });
    }
    if (!draftApproval) {
      blocked.push({ type: "publish_job", reason: "draft_approval_not_approved" });
    }
    if (contentDraft && mediaAsset && mediaAsset.contentDraftId !== contentDraft.id) {
      blocked.push({ type: "publish_job", reason: "media_asset_does_not_match_content_draft" });
    }
    if (mediaAsset && !mediaUploadJob) {
      blocked.push({ type: "publish_job", reason: "media_upload_job_not_ready" });
    }
    if (mediaUploadJob && !["uploaded", "manual_required"].includes(mediaUploadJob.status)) {
      blocked.push({ type: "publish_job", reason: "media_upload_not_ready" });
    }

    if (blocked.length > 0) {
      return { created: [], blocked };
    }

    return {
      created: [
        {
          type: "publish_job",
          job: createXPublishJob({
            id: `x_publish_${contentDraft.id}`,
            contentDraftId: contentDraft.id,
            draftApproval,
            publishApproval: approval,
            mediaUploadJob
          })
        }
      ],
      blocked: []
    };
  }

  return { created: [], blocked: [] };
}

export function normalizeDailyMetrics(input) {
  const metricKeys = [
    "impressions",
    "profile_visits",
    "follows",
    "engagement_count",
    "cta_clicks",
    "landing_page_visits",
    "trial_or_signup_count",
    "purchase_count",
    "revenue"
  ];

  return Object.fromEntries(
    metricKeys.map((key) => [key, input[key] === undefined || input[key] === null ? "unknown" : input[key]])
  );
}

export function calculateBottleneckRates(metrics) {
  return {
    profile_visit_rate: rate(metrics.profile_visits, metrics.impressions),
    follow_rate: rate(metrics.follows, metrics.profile_visits),
    cta_click_rate: rate(metrics.cta_clicks, metrics.impressions),
    landing_page_rate: rate(metrics.landing_page_visits, metrics.cta_clicks),
    signup_rate: rate(metrics.trial_or_signup_count, metrics.landing_page_visits),
    purchase_rate: rate(metrics.purchase_count, metrics.trial_or_signup_count)
  };
}

export function createPerformanceRecommendation({ snapshot, metrics = normalizeDailyMetrics(snapshot.metrics) }) {
  const rates = calculateBottleneckRates(metrics);

  if (rates.profile_visit_rate !== "unknown" && rates.profile_visit_rate < 0.06) {
    return {
      stage: "attention_to_profile",
      severity: "warning",
      title: "投稿からプロフィールへの移動が弱い",
      recommendation: "投稿内で誰向けか、何が得られるか、次に見る場所を明確にしてください。"
    };
  }

  if (rates.cta_click_rate !== "unknown" && rates.cta_click_rate < 0.01) {
    return {
      stage: "post_to_action",
      severity: "warning",
      title: "CTAへの移動が弱い",
      recommendation: "無料チェックや固定投稿など、読者の温度に合う小さい行動を提示してください。"
    };
  }

  if (rates.signup_rate !== "unknown" && rates.signup_rate < 0.08) {
    return {
      stage: "landing_to_signup",
      severity: "warning",
      title: "LP到達後の登録が弱い",
      recommendation: "LP冒頭で対象者、得られる結果、入力後に起きることを短く示してください。"
    };
  }

  return {
    stage: "route_health",
    severity: "ok",
    title: "大きな詰まりは未検出",
    recommendation: "表示、プロフィール、CTA、登録の各数字を継続入力して判断精度を上げてください。"
  };
}

export function createPerformanceActionPlan({ snapshot, metrics = normalizeDailyMetrics(snapshot.metrics) }) {
  const rates = calculateBottleneckRates(metrics);
  const missingMetrics = Object.entries(metrics)
    .filter(([, value]) => value === "unknown")
    .map(([key]) => key);
  const actions = [];

  if (missingMetrics.length > 0) {
    actions.push({
      id: "complete_daily_metrics",
      owner: "分析AI",
      priority: "high",
      title: "未入力の指標を埋める",
      action: "表示、プロフィール、CTA、LP、登録までの数字を揃え、どこで止まっているかを判定できる状態にする。",
      reason: `未入力: ${missingMetrics.join(", ")}`
    });
  }

  if (rates.profile_visit_rate !== "unknown" && rates.profile_visit_rate < 0.06) {
    actions.push({
      id: "improve_profile_transition",
      owner: "SNS戦略AI",
      priority: "high",
      title: "投稿からプロフィールへの導線を強化",
      action: "投稿冒頭で対象者を明確にし、本文末尾で固定投稿またはプロフィールを見る理由を1つ示す。",
      reason: `プロフィール率: ${formatPercent(rates.profile_visit_rate)}`
    });
  }

  if (rates.follow_rate !== "unknown" && rates.follow_rate < 0.15) {
    actions.push({
      id: "improve_profile_promise",
      owner: "顧客理解AI",
      priority: "medium",
      title: "プロフィールの約束を見直す",
      action: "誰が、どんな悩みを解決し、何を得られるかをプロフィール先頭で言い切る。",
      reason: `フォロー率: ${formatPercent(rates.follow_rate)}`
    });
  }

  if (rates.cta_click_rate !== "unknown" && rates.cta_click_rate < 0.01) {
    actions.push({
      id: "improve_cta",
      owner: "投稿制作AI",
      priority: "high",
      title: "CTAを小さい行動にする",
      action: "いきなり購入ではなく、無料チェック、固定投稿、診断コメントなど低い温度でも動けるCTAにする。",
      reason: `CTA率: ${formatPercent(rates.cta_click_rate)}`
    });
  }

  if (rates.signup_rate !== "unknown" && rates.signup_rate < 0.08) {
    actions.push({
      id: "improve_landing_page",
      owner: "Offer Design AI",
      priority: "medium",
      title: "LP冒頭の納得材料を強化",
      action: "対象者、得られる結果、入力後に起きること、安心材料をファーストビューで短く示す。",
      reason: `登録率: ${formatPercent(rates.signup_rate)}`
    });
  }

  if (actions.length === 0) {
    actions.push({
      id: "continue_daily_learning",
      owner: "分析AI",
      priority: "medium",
      title: "日次入力を継続",
      action: "大きな詰まりは未検出。次の投稿でも同じ指標を入力し、3日分の推移で判断する。",
      reason: "主要率に重大な詰まりなし"
    });
  }

  return {
    snapshotId: snapshot.id,
    date: snapshot.date,
    rates,
    actions: actions.slice(0, 4)
  };
}

function assertPending(request) {
  if (request.status !== "pending") {
    throw new Error(`Approval request is not pending: ${request.status}`);
  }
}

function rate(numerator, denominator) {
  if (numerator === "unknown" || denominator === "unknown") {
    return "unknown";
  }

  if (denominator === 0) {
    return "unknown";
  }

  return Number((numerator / denominator).toFixed(4));
}

function formatPercent(value) {
  return value === "unknown" ? "未判定" : `${Math.round(value * 1000) / 10}%`;
}
