export const dashboardStats = [
  { label: "稼働AI", value: 11, caption: "画像方針AIを含む" },
  { label: "進行中", value: 18, caption: "会社タスクとAI社員タスク" },
  { label: "本日完了", value: 4, caption: "診断と下書きの完了数" },
  { label: "要確認", value: 5, caption: "社長承認待ち" }
];

export const employees = [
  { id: "agent_secretary", shortName: "秘", name: "秘書AI", status: "in_progress", statusLabel: "稼働中", progress: 82, currentTask: "Numeria Studioキャンペーンの全体進行を整理" },
  { id: "agent_target", shortName: "対", name: "ターゲット分析AI", status: "in_progress", statusLabel: "稼働中", progress: 68, currentTask: "対象コンテンツごとの来てほしい人を整理" },
  { id: "agent_pain", shortName: "悩", name: "悩み分析AI", status: "in_progress", statusLabel: "稼働中", progress: 64, currentTask: "Xで反応が出る悩みと言葉を抽出" },
  { id: "agent_strategy", shortName: "戦", name: "導線設計AI", status: "in_progress", statusLabel: "稼働中", progress: 74, currentTask: "認知から体験開始までのX導線を設計" },
  { id: "agent_theme", shortName: "柱", name: "投稿企画AI", status: "in_progress", statusLabel: "稼働中", progress: 70, currentTask: "悩み共感、失敗例、改善方法、事例の投稿柱を設計" },
  { id: "agent_content", shortName: "稿", name: "投稿制作AI", status: "waiting_approval", statusLabel: "確認待ち", progress: 91, currentTask: "本日のX投稿案とスレッド案を作成済み" },
  { id: "agent_hashtag", shortName: "#", name: "ハッシュタグAI", status: "queued", statusLabel: "待機中", progress: 20, currentTask: "投稿セットに合わせたタグ候補を準備" },
  { id: "agent_image", shortName: "画", name: "画像方針AI", status: "waiting_approval", statusLabel: "確認待ち", progress: 88, currentTask: "Numeria Studio向け画像案を確認待ち" }
];

export const ceoInstructions = [
  {
    id: "instruction_numeria_daily_x_route",
    appProjectId: "app_numeria_studio",
    title: "Numeria Studioの毎日X運用を進める",
    body: "Numeria Studioの認知から無料チェック開始までの導線を作る。投稿は日本語、画像つき、なるべく毎日。投稿単体ではなく、気づき、信頼、行動までを設計する。",
    requestedBy: "ceo",
    status: "decomposed",
    createdAt: "2026-08-25T09:00:00.000Z",
    decompositionSummary: "秘書AIが5部署へ分解済み。戦略、顧客理解、投稿制作、画像方針、分析へ割り当て。"
  }
];

export const employeeTasks = [
  { id: "employee_task_customer_pain_language", instructionId: "instruction_numeria_daily_x_route", employeeId: "agent_customer_insight", employeeName: "顧客理解AI", title: "読者の悩みと言葉を整理", outputType: "customer_insight", status: "in_progress", statusLabel: "進行中", progress: 68, deliverable: "占いに興味はあるが一歩目が分からない人へ、自分の現在地を知りたいという言葉で入口を作る。" },
  { id: "employee_task_strategy_route", instructionId: "instruction_numeria_daily_x_route", employeeId: "agent_strategy", employeeName: "SNS戦略AI", title: "Xから無料チェックまでの導線設計", outputType: "route_design", status: "in_progress", statusLabel: "進行中", progress: 74, deliverable: "痛みの言語化、無料チェックの必要性、安心材料、CTAの順で投稿とプロフィールを接続する。" },
  { id: "employee_task_content_draft", instructionId: "instruction_numeria_daily_x_route", employeeId: "agent_content", employeeName: "投稿制作AI", title: "本日のX投稿下書きを作成", outputType: "x_draft", status: "waiting_approval", statusLabel: "確認待ち", progress: 91, deliverable: "毎日投稿より先に導線を整えるテーマで、Numeria Studioの無料チェックへ案内する下書きを作成。" },
  { id: "employee_task_image_direction", instructionId: "instruction_numeria_daily_x_route", employeeId: "agent_image", employeeName: "画像方針AI", title: "X画像コンセプトを作成", outputType: "image_direction", status: "waiting_approval", statusLabel: "確認待ち", progress: 88, deliverable: "白背景、数字、柔らかい光のモチーフで、自己理解と安心感を優先する。" },
  { id: "employee_task_daily_metrics", instructionId: "instruction_numeria_daily_x_route", employeeId: "agent_analytics", employeeName: "分析AI", title: "投稿後の日次指標を確認", outputType: "daily_metrics", status: "queued", statusLabel: "待機中", progress: 20, deliverable: "表示、プロフィール遷移、フォロー、CTA、無料チェック開始数を日次で確認する。" }
];

export const approvalRequests = [
  { id: "approval_strategy_numeria_week1", type: "strategy", title: "Numeria Studio 1週目導線方針", reason: "ターゲットと教育順序の確定が必要です", relatedAppProjectId: "app_numeria_studio", status: "pending", history: [{ status: "pending", reason: "created from seed" }] },
  { id: "approval_image_numeria_day1", type: "image_asset", title: "本日の画像つきX投稿案", reason: "画像の雰囲気と文章の整合確認が必要です", relatedAppProjectId: "app_numeria_studio", status: "pending", history: [{ status: "pending", reason: "created from seed" }] },
  { id: "approval_draft_numeria_day1", type: "draft", title: "本日のX投稿下書き", reason: "投稿本文とCTAの確認が必要です", relatedAppProjectId: "app_numeria_studio", status: "approved", history: [{ status: "pending", reason: "created from seed" }, { status: "approved", reason: "approved in seed to exercise publish gate" }] },
  { id: "approval_publish_numeria_day1", type: "publish_schedule", title: "21:00 X公開予約", reason: "公開予約は社長承認後のみ実行できます", relatedAppProjectId: "app_numeria_studio", status: "pending", history: [{ status: "pending", reason: "created from seed" }] }
];

export const companyTasks = [
  { id: "task_route_diagnosis", title: "Numeria StudioのSNS導線診断", owner: "SNS戦略AI", priority: "high", priorityLabel: "高", dueLabel: "今日", status: "in_progress", statusLabel: "進行中" },
  { id: "task_x_drafts", title: "本日の画像つきX投稿案", owner: "投稿制作AI", priority: "high", priorityLabel: "高", dueLabel: "今日", status: "waiting_approval", statusLabel: "確認待ち" },
  { id: "task_media_asset", title: "画像アセットの承認準備", owner: "画像方針AI", priority: "medium", priorityLabel: "中", dueLabel: "今日", status: "waiting_approval", statusLabel: "確認待ち" },
  { id: "task_daily_metrics", title: "昨日分のX指標入力", owner: "分析AI", priority: "medium", priorityLabel: "中", dueLabel: "毎日", status: "in_progress", statusLabel: "進行中" }
];

export const todaySchedule = [
  { time: "09:00", title: "秘書AIから本日の方針確認" },
  { time: "12:00", title: "Numeria Studio投稿案レビュー" },
  { time: "18:00", title: "画像アセット承認" },
  { time: "21:00", title: "X公開予約の実行確認" },
  { time: "22:00", title: "日次指標入力" }
];

export const appProjects = [
  { id: "app_numeria_studio", name: "Numeria Studio", campaignStatus: "active", primaryChannel: "x", language: "ja", contentFormat: "text_plus_images" },
  { id: "app_velvet", name: "Velvet", campaignStatus: "secondary", primaryChannel: "x", language: "ja", contentFormat: "text_plus_images" }
];

export const marketingContents = [
  {
    id: "content_numeria_studio_app",
    type: "app",
    typeLabel: "アプリ",
    name: "Numeria Studio",
    appProjectId: "app_numeria_studio",
    status: "active",
    summary: "数秘を使って、今のテーマと次の一歩を整理できる鑑定アプリ。",
    explanation: "ユーザーが自分の現在地を知り、行動のきっかけを作るための入口。Xでは、悩み共感から無料チェックへつなげる。",
    audiences: ["占いに興味がある人", "自分の今の流れを整理したい人", "鑑定を効率化したい占い師"],
    defaultObjectives: ["認知を増やす", "無料体験につなげる", "プロフィール改善", "固定ポスト作成"],
    imagePolicy: "白背景、数字、やわらかい光。安心感と自己理解が伝わる画像を使う。",
    links: [{ label: "Production", url: "https://numeria-studio.illusionddt.chatgpt.site" }]
  },
  {
    id: "content_velvet_app",
    type: "app",
    typeLabel: "アプリ",
    name: "Velvet",
    appProjectId: "app_velvet",
    status: "active",
    summary: "プロフェッショナルの記憶と接客文脈を扱う支援アプリ。",
    explanation: "接客や相談の品質を安定させるため、重要な記憶や引き継ぎ情報を整理する。Xでは、仕事の抜け漏れや記憶管理の悩みに寄せる。",
    audiences: ["個人事業主", "相談業のプロ", "顧客対応を効率化したい人"],
    defaultObjectives: ["認知を増やす", "問い合わせを増やす", "事例投稿を作る", "導線を作る"],
    imagePolicy: "落ち着いた業務画面、記憶、整理、安心感が伝わる画像を使う。",
    links: [{ label: "Production", url: "https://velvet.karukimori.workers.dev" }]
  },
  {
    id: "content_numeria_trial_event",
    type: "event",
    typeLabel: "イベント",
    name: "Numeria Studio 無料チェック導線",
    appProjectId: "app_numeria_studio",
    status: "planning",
    summary: "Xから無料チェックへ進んでもらうための導線企画。",
    explanation: "投稿、プロフィール、固定ポスト、LPを一体で見せ、興味を持った人が迷わず試せる状態を作る。",
    audiences: ["占いを受ける前に軽く試したい人", "自分のテーマを知りたい人"],
    defaultObjectives: ["無料体験につなげる", "固定ポスト作成", "LP誘導を強める", "投稿セット作成"],
    imagePolicy: "無料チェックの入口、スマホ、数字、やさしい導線を表す画像を使う。",
    links: []
  }
];

export const contentDrafts = [
  { id: "draft_x_numeria_day1", appProjectId: "app_numeria_studio", channel: "x", language: "ja", format: "text_plus_image", status: "waiting_approval", title: "毎日投稿より先に導線を作る", body: "SNSで成果が出ない原因は投稿数ではなく、読者が次に何をすればよいか分からないことです。Numeria Studioでは、自分の現在地を知り、次の一歩を選べる体験を作ります。", cta: "まずは無料の数秘チェックへ", imagePrompt: "白背景、数字、やわらかい光。無料チェックへの入口を安心感あるトーンで見せる。" }
];

export const mediaAssets = [
  { id: "media_numeria_day1", appProjectId: "app_numeria_studio", contentDraftId: "draft_x_numeria_day1", type: "image", status: "waiting_approval", concept: "落ち着いた白背景に、数字と小さな光のモチーフ。安心感と自己理解を優先する。" }
];

export const mediaUploadJobs = [];

export const publishJobs = [];

export const performanceSnapshots = [
  { id: "perf_numeria_2026_08_24", appProjectId: "app_numeria_studio", channel: "x", date: "2026-08-24", metrics: { impressions: 1200, profile_visits: 96, follows: 14, engagement_count: 87, cta_clicks: null, landing_page_visits: null, trial_or_signup_count: null, purchase_count: null, revenue: null } }
];
