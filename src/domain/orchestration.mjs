const defaultInstructionText =
  "Numeria Studioの認知から無料チェック開始までの導線を作る。投稿は日本語、画像つき、なるべく毎日。";

export function decomposeCeoInstruction({
  id,
  instructionId = "instruction_generated",
  appProjectId = "app_numeria_studio",
  body = defaultInstructionText
} = {}) {
  const resolvedInstructionId = id ?? instructionId;

  return [
    {
      id: `${resolvedInstructionId}_customer_insight`,
      instructionId: resolvedInstructionId,
      employeeId: "agent_customer_insight",
      employeeName: "顧客理解AI",
      title: "顧客の悩みと言葉を整理",
      outputType: "customer_insight",
      status: "queued",
      statusLabel: "待機中",
      progress: 0,
      appProjectId,
      deliverable: `${body} 対象読者がまだ言語化できていない不安、誤解、欲しい未来を抽出する。`
    },
    {
      id: `${resolvedInstructionId}_route_design`,
      instructionId: resolvedInstructionId,
      employeeId: "agent_strategy",
      employeeName: "SNS戦略AI",
      title: "投稿から行動までの導線を設計",
      outputType: "route_design",
      status: "queued",
      statusLabel: "待機中",
      progress: 0,
      appProjectId,
      deliverable: "知らない、気になる、必要だと思う、あなたから使いたい、実行する、の順に導線を作る。"
    },
    {
      id: `${resolvedInstructionId}_draft`,
      instructionId: resolvedInstructionId,
      employeeId: "agent_content",
      employeeName: "投稿制作AI",
      title: "X投稿下書きを作成",
      outputType: "x_draft",
      status: "queued",
      statusLabel: "待機中",
      progress: 0,
      appProjectId,
      deliverable: "痛み、原因、新しい判断基準、CTAを1投稿にまとめる。"
    },
    {
      id: `${resolvedInstructionId}_image`,
      instructionId: resolvedInstructionId,
      employeeId: "agent_image",
      employeeName: "画像方針AI",
      title: "画像コンセプトを作成",
      outputType: "image_direction",
      status: "queued",
      statusLabel: "待機中",
      progress: 0,
      appProjectId,
      deliverable: "数字、現在地、次の一歩が直感的に伝わる画像方針を作る。"
    },
    {
      id: `${resolvedInstructionId}_analytics`,
      instructionId: resolvedInstructionId,
      employeeId: "agent_analytics",
      employeeName: "分析AI",
      title: "日次指標の確認項目を設定",
      outputType: "daily_metrics",
      status: "queued",
      statusLabel: "待機中",
      progress: 0,
      appProjectId,
      deliverable: "表示、プロフィール遷移、フォロー、CTA、無料チェック開始数を確認する。"
    }
  ];
}

export function createNumeriaXDraftFromInstruction({
  id = "draft_x_numeria_generated",
  appProjectId = "app_numeria_studio",
  instructionId = "instruction_generated"
} = {}) {
  return {
    id,
    appProjectId,
    instructionId,
    channel: "x",
    language: "ja",
    format: "text_plus_image",
    status: "waiting_approval",
    title: "占いを受ける前に、自分の現在地を知る",
    body:
      "なんとなく今の流れを変えたい。でも何から見直せばいいか分からない。そんな時は、答えを急ぐ前に自分の現在地を整理することが先です。Numeria Studioでは、数字を手がかりに今のテーマと次の一歩を確認できます。",
    cta: "まずは無料チェックで現在地を見てください",
    imagePrompt:
      "白背景、やわらかい光、数字のモチーフ、スマホ画面に無料チェックの入口。安心感と自己理解を表現する。"
  };
}
