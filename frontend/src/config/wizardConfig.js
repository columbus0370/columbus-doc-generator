export const DOC_TYPES = [
  { value: 'estimate', label: '見積書' },
  { value: 'proposal', label: '提案書' },
  { value: 'report', label: '業務レポート' },
]

export const WIZARD_STEPS = {
  estimate: [
    {
      type: 'select',
      question: 'どのような業務の見積ですか？',
      options: [
        'ウェブサイト制作・デザイン',
        'システム開発・アプリ開発',
        'コンサルティング・調査',
        '保守・運用・サポート',
        'SNS・マーケティング支援',
        'その他',
      ],
    },
    {
      type: 'select',
      question: '業務の規模・期間はどれくらいですか？',
      options: [
        '単発作業（1日〜1週間）',
        '短期プロジェクト（1ヶ月以内）',
        '中期プロジェクト（1〜3ヶ月）',
        '長期契約（3ヶ月以上）',
      ],
    },
    {
      type: 'line_items',
      question: '見積の明細を入力してください',
    },
    {
      type: 'select',
      question: '納期の目安を教えてください',
      options: [
        'ご発注後1週間以内',
        'ご発注後2〜3週間',
        'ご発注後1ヶ月以内',
        'ご発注後2〜3ヶ月',
        '別途ご相談',
      ],
    },
    {
      type: 'select',
      question: '支払条件を選んでください',
      options: [
        '納品後即払い',
        '納品後月末締め翌月払い（銀行振込）',
        '前払い50% ＋ 納品後50%',
        '月次請求（継続契約）',
        '別途ご相談',
      ],
    },
    {
      type: 'select',
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
      type: 'select',
      question: 'この提案書の目的を教えてください',
      options: [
        '新規取引・初回営業',
        '既存顧客への追加提案',
        '課題解決の具体策提示',
        '契約更新・継続提案',
      ],
    },
    {
      type: 'text',
      question: '顧客が抱えている課題・背景を教えてください',
      placeholder: '例: 問い合わせ対応に時間がかかりすぎている、Webからの集客が少ない、業務フローが属人化しているなど',
    },
    {
      type: 'select',
      question: '提案する主なソリューションは？',
      options: [
        'ツール・システムの導入',
        '業務プロセスの改善',
        'コンサルティング・アドバイザリー',
        '人材・チームの提供',
      ],
    },
    {
      type: 'text',
      question: '提案する解決策の具体的な内容を教えてください',
      placeholder: '例: チャットボット導入により問い合わせ対応を自動化し月20時間削減、SEO対策とコンテンツ制作で月間PV3倍を目標など',
    },
    {
      type: 'select',
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
      type: 'select',
      question: 'レポートの対象期間を教えてください',
      options: [
        '週次レポート（直近1週間）',
        '月次レポート（直近1ヶ月）',
        '四半期レポート（直近3ヶ月）',
        'プロジェクト完了報告',
      ],
    },
    {
      type: 'select',
      question: '報告する業務の種類は？',
      options: [
        '営業・販売活動',
        '開発・制作プロジェクト',
        '運用・保守・サポート',
        '調査・マーケティング',
      ],
    },
    {
      type: 'text',
      question: '主な実績・達成したKPIを入力してください',
      placeholder: '例: 新規顧客獲得12件（目標10件・達成率120%）、売上1,250万円（前月比+8%）、バグ対応件数23件など',
    },
    {
      type: 'text',
      question: '現在の課題・リスクを入力してください',
      placeholder: '例: 人員不足により納期遅延リスクあり（優先度：高）、競合他社の価格攻勢が激化、サーバー負荷が増加傾向など',
    },
    {
      type: 'text',
      question: '来月の目標・アクションプランを入力してください',
      placeholder: '例: 新規商談15件以上創出、サービス改善リリース予定（v2.3）、採用活動開始（エンジニア2名）など',
    },
  ],
}

/**
 * ウィザードの選択結果を content 文字列に変換する
 * @param {'estimate'|'proposal'|'report'} docType
 * @param {Array} answers
 * @returns {string}
 */
export function buildContent(docType, answers) {
  switch (docType) {
    case 'estimate': {
      const [category, scale, lineItems, deadline, payment, emphasis] = answers
      let lineItemsSection = ''
      if (lineItems === '未定') {
        lineItemsSection = '【明細】未定（業務内容から適切な明細を補完してください）'
      } else if (Array.isArray(lineItems) && lineItems.length > 0) {
        const validRows = lineItems.filter((r) => r.name.trim())
        if (validRows.length > 0) {
          lineItemsSection =
            '【明細】\n' +
            validRows
              .map((r) => {
                const price = r.price ? `単価${Number(r.price).toLocaleString()}円` : ''
                return `・${r.name}${r.desc ? `（${r.desc}）` : ''}: ${r.qty}${r.unit}${price ? `、${price}` : ''}`
              })
              .join('\n')
        }
      }
      return [
        `業務種別：${category || '未指定'}（${scale || '未指定'}）`,
        lineItemsSection,
        `納期目安：${deadline || '未指定'}`,
        `支払条件：${payment || '未指定'}`,
        `${emphasis || '品質'}を重視した見積内容で作成してください。`,
      ]
        .filter(Boolean)
        .join('\n')
    }

    case 'proposal': {
      const [purpose, challenge, solution, detail, tone] = answers
      return [
        `目的：${purpose || '未指定'}`,
        `顧客課題：${challenge || '（詳細なし）'}`,
        `提案ソリューション：${solution || '未指定'}`,
        `提案内容詳細：${detail || '（詳細なし）'}`,
        `${tone || '具体的な数値・根拠を重視'}で作成してください。`,
      ]
        .filter(Boolean)
        .join('\n')
    }

    case 'report': {
      const [period, type, kpi, issues, nextGoal] = answers
      return [
        `対象期間：${period || '未指定'}`,
        `業務種別：${type || '未指定'}`,
        `主な実績・KPI：${kpi || '（未入力）'}`,
        `課題・リスク：${issues || '（未入力）'}`,
        `来月の目標・施策：${nextGoal || '（未入力）'}`,
      ]
        .filter(Boolean)
        .join('\n')
    }

    default:
      return answers.filter(Boolean).join('\n')
  }
}
