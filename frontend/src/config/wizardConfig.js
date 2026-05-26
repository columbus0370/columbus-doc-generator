// ウィザード質問定義と buildContent 関数

export const DOC_TYPES = [
  { value: 'estimate', label: '見積書' },
  { value: 'proposal', label: '提案書' },
  { value: 'report', label: '業務レポート' },
]

export const WIZARD_STEPS = {
  estimate: [
    {
      question: 'どのような業務の見積ですか？',
      options: [
        'ウェブサイト制作・デザイン',
        'システム開発・アプリ開発',
        'コンサルティング・調査',
        '保守・運用・サポート',
        'その他',
      ],
    },
    {
      question: '業務の規模・期間はどれくらいですか？',
      options: [
        '単発作業（1日〜1週間）',
        '短期プロジェクト（1ヶ月以内）',
        '中期プロジェクト（1〜3ヶ月）',
        '長期契約（3ヶ月以上）',
      ],
    },
    {
      question: 'この見積で特に強調したいことは？',
      options: [
        '価格の明確さ・透明性',
        '品質・技術力',
        '納期の速さ',
        'アフターサポートの充実',
      ],
    },
  ],

  proposal: [
    {
      question: 'この提案書の目的を教えてください',
      options: [
        '新規取引・初回営業',
        '既存顧客への追加提案',
        '課題解決の具体策提示',
        '契約更新・継続提案',
      ],
    },
    {
      question: '提案する主なソリューションは？',
      options: [
        'ツール・システムの導入',
        '業務プロセスの改善',
        'コンサルティング・アドバイザリー',
        '人材・チームの提供',
      ],
    },
    {
      question: '提案書のトーン・スタイルを選んでください',
      options: [
        '具体的な数値・根拠を重視',
        'ビジョン・将来像を重視',
        'コスト削減・ROIを重視',
        'スピード・即効性を重視',
      ],
    },
  ],

  report: [
    {
      question: 'レポートの対象期間を教えてください',
      options: [
        '週次レポート（直近1週間）',
        '月次レポート（直近1ヶ月）',
        '四半期レポート（直近3ヶ月）',
        'プロジェクト完了報告',
      ],
    },
    {
      question: '報告する業務の種類は？',
      options: [
        '営業・販売活動',
        '開発・制作プロジェクト',
        '運用・保守・サポート',
        '調査・マーケティング',
      ],
    },
    {
      question: '特に強調したい内容は？',
      options: [
        '目標達成状況（数値・KPI）',
        '課題・リスクの報告',
        '今後のアクションプラン',
        '完了事項の実績まとめ',
      ],
    },
  ],
}

/**
 * ウィザードの選択結果を content 文字列に変換する
 * @param {'estimate'|'proposal'|'report'} docType
 * @param {string[]} answers - 各ステップの選択テキスト（3要素）
 * @returns {string}
 */
export function buildContent(docType, answers) {
  const [ans0, ans1, ans2] = answers

  const filled = answers.filter(Boolean)
  if (filled.length < 3) return filled.join('。') + '。'

  switch (docType) {
    case 'estimate':
      return `${ans0}業務（${ans1}）。${ans2}を重視した見積内容で作成してください。`

    case 'proposal':
      return `目的：${ans0}。主なソリューション：${ans1}。${ans2}で作成してください。`

    case 'report':
      return `${ans0}。対象業務：${ans1}。${ans2}を中心に報告してください。`

    default:
      return filled.join('。') + '。'
  }
}
