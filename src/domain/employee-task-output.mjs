const outputTemplates = {
  customer_insight: {
    title: "顧客理解メモ",
    summary:
      "Numeria Studioに興味を持つ見込み客は、占い結果そのものよりも、今の停滞感を整理して次の一歩を決めたい状態です。",
    items: [
      "夜にSNSを見ながら、同年代の変化や成果と自分を比べて焦っている。",
      "占いに興味はあるが、抽象的な助言だけで終わることには不安がある。",
      "無料チェックでは、今のテーマと次に見直す行動が分かることを明確に伝える。"
    ],
    nextAction: "投稿では『自分の現在地を知る』という言葉を入口にする。"
  },
  route_design: {
    title: "購入導線設計",
    summary:
      "X投稿からプロフィール、固定投稿、無料チェック、Numeria Studio利用までを一つの道として接続します。",
    items: [
      "知らない: 停滞感や迷いを言語化する短い投稿で認知を作る。",
      "気になる: 数字で現在地を整理できる具体例を見せる。",
      "必要だと思う: 無料チェックで分かることと、分からないことを明確にする。",
      "使いたい: 画像つき投稿と固定投稿で安心感と手順を示す。",
      "実行する: CTAを無料チェック開始に絞る。"
    ],
    nextAction: "プロフィールと固定投稿のCTAを無料チェックに統一する。"
  },
  x_draft: {
    title: "X投稿下書き",
    summary:
      "なんとなく今の流れを変えたい。でも何から見直せばいいか分からない。そんな時は、答えを急ぐ前に自分の現在地を整理することが先です。Numeria Studioでは、数字を手がかりに今のテーマと次の一歩を確認できます。",
    items: [
      "冒頭: 今の流れを変えたい人へ",
      "本文: 答えを急ぐ前に現在地を整理する重要性を伝える。",
      "CTA: まずは無料チェックで現在地を見てください。"
    ],
    nextAction: "CEOが投稿本文とCTAを確認し、必要なら修正依頼を出す。"
  },
  image_direction: {
    title: "画像方針",
    summary:
      "白背景、数字モチーフ、スマホ画面上の無料チェック入口を組み合わせ、安心感と自己理解を表現します。",
    items: [
      "主題: 数字で現在地を確認する。",
      "構図: 中央にスマホ、周辺に1から9の柔らかい数字モチーフ。",
      "文字: 『今のテーマを無料チェック』を短く配置する。"
    ],
    nextAction: "画像生成前に、文言とトーンをCEO確認へ回す。"
  },
  daily_metrics: {
    title: "日次分析チェック",
    summary:
      "売上につながる導線の詰まりを、表示数ではなくプロフィール遷移、CTA反応、無料チェック開始数で確認します。",
    items: [
      "表示数からプロフィール遷移率を見る。",
      "プロフィールから無料チェックCTAへの反応を見る。",
      "無料チェック開始後の離脱点を記録する。",
      "数字が欠けている日は、改善判断ではなく計測整備を優先する。"
    ],
    nextAction: "毎日、表示数・プロフィール遷移・CTA・無料チェック開始数を入力する。"
  }
};

const fallbackOutput = {
  title: "社員タスク成果物",
  summary: "担当AIがタスク内容を整理し、CEO確認に回せる作業メモを作成しました。",
  items: ["依頼内容を確認する。", "成果物をCEO確認へ回す。"],
  nextAction: "CEOが内容を確認し、承認または修正依頼を出す。"
};

const outputTypeAliases = {
  strategy: "route_design",
  analysis: "daily_metrics",
  performance_improvement: "daily_metrics",
  cta_improvement: "x_draft",
  profile_improvement: "route_design",
  metrics_completion: "daily_metrics"
};

export function createEmployeeTaskOutput(task, { generatedAt = new Date().toISOString() } = {}) {
  const outputType = outputTypeAliases[task.outputType] ?? task.outputType;
  const template = outputTemplates[outputType] ?? fallbackOutput;

  return {
    id: `output_${task.id}`,
    taskId: task.id,
    employeeId: task.employeeId,
    employeeName: task.employeeName,
    outputType,
    title: template.title,
    summary: template.summary,
    items: template.items,
    nextAction: template.nextAction,
    generatedAt,
    approvalRequired: ["route_design", "x_draft", "image_direction"].includes(outputType)
  };
}

export function shouldGenerateEmployeeTaskOutput(task, nextStatus) {
  return ["waiting_approval", "completed"].includes(nextStatus) && !task.output;
}
