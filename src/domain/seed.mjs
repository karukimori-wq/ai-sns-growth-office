export const dashboardStats = [
  { label: "稼働AI", value: 11, caption: "画像方針AIを含む" },
  { label: "進行中", value: 18, caption: "会社タスクとAI社員タスク" },
  { label: "本日完了", value: 4, caption: "診断と下書きの完了数" },
  { label: "要確認", value: 5, caption: "社長承認待ち" }
];

export const employees = [
  {
    id: "agent_secretary",
    shortName: "秘",
    name: "秘書AI",
    status: "in_progress",
    statusLabel: "稼働中",
    progress: 82,
    currentTask: "Numeria Studioキャンペーンの全体進行を整理"
  },
  {
    id: "agent_customer_insight",
    shortName: "顧",
    name: "顧客理解AI",
    status: "in_progress",
    statusLabel: "稼働中",
    progress: 68,
    currentTask: "数秘に興味がある個人の悩みと言葉を整理"
  },
  {
    id: "agent_strategy",
    shortName: "戦",
    name: "SNS戦略AI",
    status: "in_progress",
    statusLabel: "稼働中",
    progress: 74,
    currentTask: "認知から体験開始までのX導線を設計"
  },
  {
    id: "agent_content",
    shortName: "稿",
    name: "投稿制作AI",
    status: "waiting_approval",
    statusLabel: "確認待ち",
    progress: 91,
    currentTask: "本日のX投稿案とスレッド案を作成済み"
  },
  {
    id: "agent_image",
    shortName: "画",
    name: "画像方針AI",
    status: "waiting_approval",
    statusLabel: "確認待ち",
    progress: 88,
    currentTask: "Numeria Studio向け画像案を確認待ち"
  }
];

export const approvalRequests = [
  {
    id: "approval_strategy_numeria_week1",
    type: "strategy",
    title: "Numeria Studio 1週目導線方針",
    reason: "ターゲットと教育順序の確定が必要です",
    relatedAppProjectId: "app_numeria_studio",
    status: "pending",
    history: [{ status: "pending", reason: "created from seed" }]
  },
  {
    id: "approval_image_numeria_day1",
    type: "image_asset",
    title: "本日の画像つきX投稿案",
    reason: "画像の雰囲気と文章の整合確認が必要です",
    relatedAppProjectId: "app_numeria_studio",
    status: "pending",
    history: [{ status: "pending", reason: "created from seed" }]
  },
  {
    id: "approval_draft_numeria_day1",
    type: "draft",
    title: "本日のX投稿下書き",
    reason: "投稿本文とCTAの確認が必要です",
    relatedAppProjectId: "app_numeria_studio",
    status: "approved",
    history: [
      { status: "pending", reason: "created from seed" },
      { status: "approved", reason: "approved in seed to exercise publish gate" }
    ]
  },
  {
    id: "approval_publish_numeria_day1",
    type: "publish_schedule",
    title: "21:00 X公開予約",
    reason: "公開予約は社長承認後のみ実行できます",
    relatedAppProjectId: "app_numeria_studio",
    status: "pending",
    history: [{ status: "pending", reason: "created from seed" }]
  }
];

export const companyTasks = [
  {
    id: "task_route_diagnosis",
    title: "Numeria StudioのSNS導線診断",
    owner: "SNS戦略AI",
    priority: "high",
    priorityLabel: "高",
    dueLabel: "今日",
    status: "in_progress",
    statusLabel: "進行中"
  },
  {
    id: "task_x_drafts",
    title: "本日の画像つきX投稿案",
    owner: "投稿制作AI",
    priority: "high",
    priorityLabel: "高",
    dueLabel: "今日",
    status: "waiting_approval",
    statusLabel: "確認待ち"
  },
  {
    id: "task_media_asset",
    title: "画像アセットの承認準備",
    owner: "画像方針AI",
    priority: "medium",
    priorityLabel: "中",
    dueLabel: "今日",
    status: "waiting_approval",
    statusLabel: "確認待ち"
  },
  {
    id: "task_daily_metrics",
    title: "昨日分のX指標入力",
    owner: "分析AI",
    priority: "medium",
    priorityLabel: "中",
    dueLabel: "毎日",
    status: "in_progress",
    statusLabel: "進行中"
  }
];

export const todaySchedule = [
  { time: "09:00", title: "秘書AIから本日の方針確認" },
  { time: "12:00", title: "Numeria Studio投稿案レビュー" },
  { time: "18:00", title: "画像アセット承認" },
  { time: "21:00", title: "X公開予約の実行確認" },
  { time: "22:00", title: "日次指標入力" }
];

export const appProjects = [
  {
    id: "app_numeria_studio",
    name: "Numeria Studio",
    campaignStatus: "active",
    primaryChannel: "x",
    language: "ja",
    contentFormat: "text_plus_images"
  },
  {
    id: "app_velvet",
    name: "Velvet",
    campaignStatus: "secondary",
    primaryChannel: "x",
    language: "ja",
    contentFormat: "text_plus_images"
  }
];

export const contentDrafts = [
  {
    id: "draft_x_numeria_day1",
    appProjectId: "app_numeria_studio",
    channel: "x",
    language: "ja",
    format: "text_plus_image",
    status: "waiting_approval",
    title: "毎日投稿より先に導線を作る",
    body:
      "SNSで成果が出ない原因は投稿数ではなく、読者が次に何をすればよいか分からないことです。Numeria Studioでは、自分の現在地を知り、次の一歩を選べる体験を作ります。",
    cta: "まずは無料の数秘チェックへ"
  }
];

export const mediaAssets = [
  {
    id: "media_numeria_day1",
    appProjectId: "app_numeria_studio",
    contentDraftId: "draft_x_numeria_day1",
    type: "image",
    status: "waiting_approval",
    concept: "落ち着いた白背景に、数字と小さな光のモチーフ。安心感と自己理解を優先する。"
  }
];

export const mediaUploadJobs = [];

export const publishJobs = [];

export const performanceSnapshots = [
  {
    id: "perf_numeria_2026_08_24",
    appProjectId: "app_numeria_studio",
    channel: "x",
    date: "2026-08-24",
    metrics: {
      impressions: 1200,
      profile_visits: 96,
      follows: 14,
      engagement_count: 87,
      cta_clicks: null,
      landing_page_visits: null,
      trial_or_signup_count: null,
      purchase_count: null,
      revenue: null
    }
  }
];
