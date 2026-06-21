export const DOC_TYPES = [
  { value: 'estimate', label: '見積書' },
  { value: 'invoice', label: '請求書' },
]

export const WIZARD_STEPS = {
  invoice: [
    {
      type: 'select',
      key: 'work_type',
      label: '業務種別',
      options: [
        { value: 'web', label: 'Webサイト制作' },
        { value: 'system', label: 'システム開発' },
        { value: 'maintenance', label: '保守・運用' },
        { value: 'design', label: 'デザイン（LP・バナー等）' },
        { value: 'other', label: 'その他' },
      ],
    },
    {
      type: 'text',
      key: 'work_detail',
      label: '作業内容の概要',
      placeholder: '例：コーポレートサイト5ページ制作・納品済み。WordPress導入、レスポンシブ対応含む。',
    },
    {
      type: 'line_items',
      key: 'line_items',
      label: '明細入力',
    },
    {
      type: 'text',
      key: 'service_period',
      label: '対象期間（任意）',
      placeholder: '例：2026年5月1日〜2026年5月31日',
    },
    {
      type: 'select_multi',
      key: 'conditions',
      label: '支払条件',
      fields: [
        {
          key: 'payment_due',
          label: '支払期限',
          options: ['請求日より30日以内', '翌月末日まで', '当月末日まで', '即時払い'],
        },
      ],
    },
  ],
  estimate: [
    {
      type: 'select',
      key: 'work_type',
      label: '業務種別',
      options: [
        { value: 'web', label: 'Webサイト制作' },
        { value: 'system', label: 'システム開発' },
        { value: 'maintenance', label: '保守・運用' },
        { value: 'design', label: 'デザイン（LP・バナー等）' },
        { value: 'other', label: 'その他' },
      ],
    },
    {
      type: 'text',
      key: 'work_detail',
      label: '作業内容の概要',
      placeholder: '例：コーポレートサイト5ページ制作。WordPress導入、レスポンシブ対応含む。',
    },
    {
      type: 'line_items',
      key: 'line_items',
      label: '明細入力',
    },
    {
      type: 'select_multi',
      key: 'conditions',
      label: '条件設定',
      fields: [
        {
          key: 'payment',
          label: '支払条件',
          options: ['月末締め翌月払い', '納品後即払い', '前払い50%・納品後50%', '別途相談'],
        },
        {
          key: 'revision',
          label: '修正対応回数',
          options: ['修正2回まで含む', '修正3回まで含む', '修正無制限（別途相談）', '修正は別途費用'],
        },
        {
          key: 'deadline',
          label: '納期',
          options: ['2週間以内', '1ヶ月以内', '2ヶ月以内', '3ヶ月以内', '別途相談'],
        },
      ],
    },
  ],
}

export const PRICE_GUIDE = {
  web: {
    title: 'Webサイト制作の相場',
    items: [
      { label: 'LP（1ページ）', range: '5万〜20万円' },
      { label: 'コーポレートサイト（5ページ）', range: '15万〜50万円' },
      { label: 'WordPress構築', range: '10万〜40万円' },
      { label: 'ECサイト', range: '30万〜100万円+' },
      { label: '保守月額', range: '1万〜5万円/月' },
    ],
    note: '人日単価の目安：1.5万〜5万円（スキル・経験による）',
  },
  system: {
    title: 'システム開発の相場',
    items: [
      { label: '業務ツール（小規模）', range: '20万〜80万円' },
      { label: 'API開発・連携', range: '10万〜50万円' },
      { label: 'スクレイピング・自動化', range: '5万〜30万円' },
      { label: 'AIツール開発', range: '20万〜100万円+' },
    ],
    note: '人日単価の目安：2万〜8万円（スキル・経験による）',
  },
  maintenance: {
    title: '保守・運用の相場',
    items: [
      { label: 'WordPress保守（月次）', range: '1万〜3万円/月' },
      { label: 'サーバー・インフラ管理', range: '2万〜10万円/月' },
      { label: 'システム保守（月次）', range: '3万〜15万円/月' },
    ],
    note: '継続契約のため、やや低めに設定して長期安定を狙うのが一般的',
  },
  design: {
    title: 'デザインの相場',
    items: [
      { label: 'バナー（1点）', range: '3千〜3万円' },
      { label: 'LP デザイン', range: '5万〜20万円' },
      { label: 'ロゴデザイン', range: '3万〜30万円' },
      { label: '名刺デザイン', range: '1万〜5万円' },
    ],
    note: 'デザイン費とコーディング費は分けて記載すると節税になる場合あり',
  },
  other: {
    title: '一般的な目安',
    items: [
      { label: '作業時間単価（初級）', range: '2千〜4千円/時' },
      { label: '作業時間単価（中級）', range: '4千〜8千円/時' },
      { label: '作業時間単価（上級）', range: '8千〜2万円/時' },
    ],
    note: '目標年収 ÷ 稼働日数 ÷ 8時間 = 時間単価の目安',
  },
}

/**
 * ウィザードの選択結果を content 文字列に変換する
 * @param {'estimate'|'invoice'} docType
 * @param {Array} answers
 * @returns {string}
 */
export function buildContent(docType, answers, options = {}) {
  const { tax_type = 'exclusive' } = options

  const taxInstruction = tax_type === 'inclusive'
    ? '税区分：税込入力（明細の単価・金額はすべて税込金額です。消費税は合計金額÷1.1×0.1で逆算し端数切り捨てで内税表示してください。合計欄の「消費税（10%）」行は「消費税（10%内税）」と表記してください）'
    : '税区分：税抜入力（明細の単価・金額は税抜金額です。消費税は各行ではなく小計合計に10%を一括で掛けて端数切り捨てで計算してください）'

  const buildLineItemsSection = (lineItems) => {
    if (lineItems === '未定') return '【明細】未定（業務内容から適切な明細を補完してください）'
    if (!Array.isArray(lineItems) || lineItems.length === 0) return ''
    const validRows = lineItems.filter((r) => r.name.trim())
    if (validRows.length === 0) return ''
    return (
      '【明細】\n' +
      validRows
        .map((r) => {
          const price = r.price ? `単価${Number(r.price).toLocaleString()}円` : ''
          return `・${r.name}${r.desc ? `（${r.desc}）` : ''}: ${r.qty}${r.unit}${price ? `、${price}` : ''}`
        })
        .join('\n')
    )
  }

  switch (docType) {
    case 'invoice': {
      const [work_type, work_detail, lineItems, service_period, conditions] = answers
      const workTypeOption = WIZARD_STEPS.invoice[0].options.find((o) => o.value === work_type)
      const workTypeLabel = workTypeOption?.label || work_type || '未指定'
      return [
        `業務種別：${workTypeLabel}`,
        work_detail ? `作業内容：${work_detail}` : '',
        buildLineItemsSection(lineItems),
        taxInstruction,
        service_period ? `対象期間：${service_period}` : '',
        conditions?.payment_due ? `支払期限：${conditions.payment_due}` : '',
      ]
        .filter(Boolean)
        .join('\n')
    }
    case 'estimate': {
      const [work_type, work_detail, lineItems, conditions] = answers
      const workTypeOption = WIZARD_STEPS.estimate[0].options.find((o) => o.value === work_type)
      const workTypeLabel = workTypeOption?.label || work_type || '未指定'
      return [
        `業務種別：${workTypeLabel}`,
        work_detail ? `作業内容：${work_detail}` : '',
        buildLineItemsSection(lineItems),
        taxInstruction,
        conditions?.deadline ? `納期：${conditions.deadline}` : '',
        conditions?.payment ? `支払条件：${conditions.payment}` : '',
        conditions?.revision ? `修正対応：${conditions.revision}` : '',
      ]
        .filter(Boolean)
        .join('\n')
    }
    default:
      return answers.filter(Boolean).join('\n')
  }
}
