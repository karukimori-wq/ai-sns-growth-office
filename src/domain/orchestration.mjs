const defaultInstructionText =
  "Numeria Studioの認知から無料チェック開始までの導線を作る。投稿は日本語、画像つき、なるべく毎日。";

export function decomposeCeoInstruction({
  id,
  instructionId = "instruction_generated",
  appProjectId = "app_numeria_studio",
  body = defaultInstructionText,
  marketingContent = null,
  objective = "投稿セット作成",
  channels = marketingContent?.supportedChannels ?? ["X"]
} = {}) {
  const resolvedInstructionId = id ?? instructionId;
  const contentName = marketingContent?.name ?? "対象コンテンツ";
  const audienceSummary = marketingContent?.audiences?.join("、") ?? "来てほしい人";
  const channelSummary = normalizeChannels(channels).join(" / ");
  const materialPolicy = marketingContent?.imagePolicy ?? "対象コンテンツの画像・動画素材方針に合わせる。";

  return [
    {
      id: `${resolvedInstructionId}_target`,
      instructionId: resolvedInstructionId,
      employeeId: "agent_target",
      employeeName: "ターゲット分析AI",
      title: "来てほしい人を選定",
      outputType: "target_selection",
      status: "queued",
      statusLabel: "待機中",
      progress: 0,
      appProjectId,
      marketingContentId: marketingContent?.id,
      marketingContentName: contentName,
      objective,
      deliverable: `${contentName}について、候補読者（${audienceSummary}）から今回のSNS集客で優先する対象を選ぶ。展開先: ${channelSummary}。社長指示: ${body}`
    },
    {
      id: `${resolvedInstructionId}_pain`,
      instructionId: resolvedInstructionId,
      employeeId: "agent_pain",
      employeeName: "悩み分析AI",
      title: "対象読者の悩みを言語化",
      outputType: "pain_language",
      status: "queued",
      statusLabel: "待機中",
      progress: 0,
      appProjectId,
      marketingContentId: marketingContent?.id,
      marketingContentName: contentName,
      objective,
      deliverable: `${contentName}へ来てほしい人が、SNS投稿を見る前に困っていること、諦めていること、欲しい未来を言葉にする。`
    },
    {
      id: `${resolvedInstructionId}_hook`,
      instructionId: resolvedInstructionId,
      employeeId: "agent_theme",
      employeeName: "投稿企画AI",
      title: "入口メッセージと投稿テーマを作成",
      outputType: "sns_theme_plan",
      status: "queued",
      statusLabel: "待機中",
      progress: 0,
      appProjectId,
      marketingContentId: marketingContent?.id,
      marketingContentName: contentName,
      objective,
      deliverable: "目を止める入口メッセージ、悩み共感、失敗例、改善方法、事例、紹介の投稿柱を作る。"
    },
    {
      id: `${resolvedInstructionId}_draft`,
      instructionId: resolvedInstructionId,
      employeeId: "agent_content",
      employeeName: "投稿制作AI",
      title: "SNS別投稿セットを作成",
      outputType: "sns_post_set",
      status: "queued",
      statusLabel: "待機中",
      progress: 0,
      appProjectId,
      marketingContentId: marketingContent?.id,
      marketingContentName: contentName,
      objective,
      deliverable: `${channelSummary}へ同じ企画を展開できるよう、投稿本文、フック、CTA、画像・動画素材案をSNS別に作る。`
    },
    {
      id: `${resolvedInstructionId}_profile`,
      instructionId: resolvedInstructionId,
      employeeId: "agent_route",
      employeeName: "導線設計AI",
      title: "プロフィール・固定ポスト・導線を整える",
      outputType: "profile_route",
      status: "queued",
      statusLabel: "待機中",
      progress: 0,
      appProjectId,
      marketingContentId: marketingContent?.id,
      marketingContentName: contentName,
      objective,
      deliverable: "投稿を見た人が何者か分かり、SNSからLP、無料体験、問い合わせ、予約へ進める道筋を作る。"
    },
    {
      id: `${resolvedInstructionId}_hashtag`,
      instructionId: resolvedInstructionId,
      employeeId: "agent_hashtag",
      employeeName: "ハッシュタグAI",
      title: "SNS別タグ候補を作成",
      outputType: "hashtag_plan",
      status: "queued",
      statusLabel: "待機中",
      progress: 0,
      appProjectId,
      marketingContentId: marketingContent?.id,
      marketingContentName: contentName,
      objective,
      deliverable: "対象読者、悩み、投稿テーマに合う検索・発見用ハッシュタグ候補を作る。"
    },
    {
      id: `${resolvedInstructionId}_image`,
      instructionId: resolvedInstructionId,
      employeeId: "agent_image",
      employeeName: "画像方針AI",
      title: "画像・動画素材コンセプトを作成",
      outputType: "material_direction",
      status: "queued",
      statusLabel: "待機中",
      progress: 0,
      appProjectId,
      marketingContentId: marketingContent?.id,
      marketingContentName: contentName,
      objective,
      deliverable: materialPolicy
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
      marketingContentId: marketingContent?.id,
      marketingContentName: contentName,
      objective,
      deliverable: "表示、プロフィール遷移、フォロー、CTA、無料チェック開始数を確認する。"
    },
    {
      id: `${resolvedInstructionId}_ops`,
      instructionId: resolvedInstructionId,
      employeeId: "agent_ops",
      employeeName: "運用AI",
      title: "承認済み成果物を運用へ回す",
      outputType: "operation_management",
      status: "queued",
      statusLabel: "待機中",
      progress: 0,
      appProjectId,
      marketingContentId: marketingContent?.id,
      marketingContentName: contentName,
      objective,
      deliverable: "承認された投稿、画像、公開予約を実行キューへ移し、公開結果と次回確認を記録する。"
    }
  ];
}

export function createNumeriaXDraftFromInstruction({
  id = "draft_x_numeria_generated",
  appProjectId = "app_numeria_studio",
  instructionId = "instruction_generated",
  marketingContent = null,
  objective = "投稿セット作成",
  audience = null,
  body = defaultInstructionText,
  channels = marketingContent?.supportedChannels ?? ["X"]
} = {}) {
  const contentName = marketingContent?.name ?? "Numeria Studio";
  const primaryAudience = audience ?? marketingContent?.audiences?.[0] ?? "SNSで集客したい人";
  const materialPolicy = marketingContent?.imagePolicy ?? "白背景、やわらかい光、数字のモチーフ。安心感と自己理解を表現する。";
  const normalizedChannels = normalizeChannels(channels);
  const channelVariants = normalizedChannels.map((channel) => createChannelVariant({ channel, contentName, objective }));

  return {
    id,
    appProjectId,
    instructionId,
    marketingContentId: marketingContent?.id,
    marketingContentName: contentName,
    objective,
    channel: normalizedChannels[0]?.toLowerCase() ?? "x",
    language: "ja",
    format: "multi_channel_post_set",
    status: "waiting_approval",
    title: `${contentName}のSNS別投稿セット`,
    body: `${primaryAudience}へ向けて、悩み共感、入口メッセージ、投稿テーマ、プロフィール、固定ポスト、導線までを1セットで準備し、${normalizedChannels.join(" / ")}へ展開します。社長指示: ${body}`,
    cta: objective.includes("問い合わせ") ? "詳しく相談する" : objective.includes("予約") ? "予約へ進む" : "まずは無料で試す",
    imagePrompt: materialPolicy,
    channelVariants
  };
}

function normalizeChannels(value) {
  const list = Array.isArray(value) ? value : String(value ?? "").split(/\n|,/);
  const channels = list.map((item) => String(item).trim()).filter(Boolean);

  return channels.length > 0 ? Array.from(new Set(channels.map((item) => item.replace(/^x$/i, "X")))) : ["X"];
}

function createChannelVariant({ channel, contentName, objective }) {
  const variants = {
    X: { format: "短文投稿", note: "フック、本文、CTAを短くまとめる" },
    Instagram: { format: "カルーセル / ストーリーズ", note: "保存される見出しと画像構成にする" },
    TikTok: { format: "ショート動画 / リール", note: "冒頭3秒、字幕、撮影素材を決める" },
    LINE: { format: "配信メッセージ", note: "既存登録者へ自然に案内し、返信はCommunication Plannerへ渡す" }
  };
  const variant = variants[channel] ?? { format: "投稿", note: "同じ企画を媒体に合わせて調整する" };

  return {
    channel,
    format: variant.format,
    title: `${contentName}: ${objective}`,
    note: variant.note
  };
}
