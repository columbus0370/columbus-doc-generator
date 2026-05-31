import React from 'react'
import { PRICE_GUIDE } from '../../config/wizardConfig'

const emptyRow = () => ({ name: '', desc: '', qty: '1', unit: '式', price: '' })

const inputClass =
  'w-full bg-navy-800 border border-navy-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent transition-colors'

function PriceGuidePanel({ workType }) {
  const [open, setOpen] = React.useState(false)
  const guide = PRICE_GUIDE[workType]
  if (!guide) return null

  return (
    <div className="rounded-xl border border-navy-600 bg-navy-900/40 overflow-hidden">
      {/* スマホ: アコーディオン / PC: 常時表示 */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-accent sm:cursor-default sm:pointer-events-none"
      >
        <span>💡 {guide.title}</span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform sm:hidden ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div className={`px-4 pb-4 space-y-2 ${open ? 'block' : 'hidden'} sm:block`}>
        {guide.items.map((item) => (
          <div key={item.label} className="flex items-center justify-between text-xs">
            <span className="text-gray-400">{item.label}</span>
            <span className="text-white font-medium">{item.range}</span>
          </div>
        ))}
        <p className="text-xs text-gray-500 mt-3 pt-2 border-t border-navy-700">{guide.note}</p>
      </div>
    </div>
  )
}

export default function StepLineItems({ question, value, onChange, onNext, onBack, stepIndex, totalSteps, workType }) {
  const isUndecided = value === '未定'
  const rows = Array.isArray(value) ? value : []

  const handleUndecided = () => onChange('未定')
  const handleStartInput = () => onChange([emptyRow()])

  const addRow = () => onChange([...rows, emptyRow()])
  const removeRow = (i) => {
    const next = rows.filter((_, idx) => idx !== i)
    onChange(next.length > 0 ? next : [emptyRow()])
  }
  const updateRow = (i, field, val) => {
    onChange(rows.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)))
  }

  const canProceed =
    isUndecided ||
    (Array.isArray(value) && value.length > 0 && value.some((r) => r.name.trim()))

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-semibold text-accent uppercase tracking-wider">
          質問 {stepIndex} / {totalSteps}
        </span>
        <h3 className="mt-2 text-lg font-bold text-white leading-snug">{question}</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 明細入力エリア */}
        <div className="lg:col-span-2 space-y-3">
          {/* 初期選択 */}
          {!isUndecided && rows.length === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleStartInput}
                className="p-4 rounded-xl border-2 border-navy-700 bg-navy-900/40 text-gray-300 hover:border-accent hover:text-white hover:bg-accent/10 transition-all duration-200 text-sm font-medium text-left"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 flex-shrink-0 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <div>
                    <div className="font-semibold text-white">明細を入力する</div>
                    <div className="text-xs text-gray-400 mt-0.5">品名・数量・単価を入力</div>
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={handleUndecided}
                className="p-4 rounded-xl border-2 border-navy-700 bg-navy-900/40 text-gray-300 hover:border-navy-600 hover:text-white hover:bg-navy-900/60 transition-all duration-200 text-sm font-medium text-left"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <div className="font-semibold">明細は未定</div>
                    <div className="text-xs text-gray-400 mt-0.5">AIが業務内容から補完</div>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* 未定選択済み */}
          {isUndecided && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl border-2 border-accent bg-accent/10 text-sm text-white flex items-start gap-3">
                <svg className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
                <span>明細未定を選択しました。AIが業務カテゴリーと金額をもとに明細を自動補完します。</span>
              </div>
              <button
                type="button"
                onClick={handleStartInput}
                className="text-sm text-gray-400 hover:text-accent underline transition-colors"
              >
                やはり明細を入力する
              </button>
            </div>
          )}

          {/* 明細テーブル入力 */}
          {Array.isArray(value) && value.length > 0 && (
            <div className="space-y-3">
              {rows.map((row, i) => (
                <div key={i} className="bg-navy-900/60 border border-navy-700 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-accent">明細 {i + 1}</span>
                    {rows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRow(i)}
                        className="text-gray-500 hover:text-red-400 transition-colors p-1"
                        title="この行を削除"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        品名 <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={row.name}
                        onChange={(e) => updateRow(i, 'name', e.target.value)}
                        placeholder="例: システム開発"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">作業内容・仕様（任意）</label>
                      <input
                        type="text"
                        value={row.desc}
                        onChange={(e) => updateRow(i, 'desc', e.target.value)}
                        placeholder="例: フロント・バックエンド開発"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">数量</label>
                      <input
                        type="text"
                        value={row.qty}
                        onChange={(e) => updateRow(i, 'qty', e.target.value)}
                        placeholder="1"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">単位</label>
                      <input
                        type="text"
                        value={row.unit}
                        onChange={(e) => updateRow(i, 'unit', e.target.value)}
                        placeholder="式"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">単価（円）</label>
                      <input
                        type="text"
                        value={row.price}
                        onChange={(e) => updateRow(i, 'price', e.target.value)}
                        placeholder="100000"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addRow}
                className="w-full py-3 rounded-xl border-2 border-dashed border-navy-600 text-gray-400 hover:border-accent hover:text-accent transition-all duration-200 text-sm flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                行を追加
              </button>

              <button
                type="button"
                onClick={handleUndecided}
                className="text-xs text-gray-500 hover:text-gray-300 underline transition-colors"
              >
                明細未定に変更する
              </button>
            </div>
          )}
        </div>

        {/* 相場ガイドパネル */}
        <div className="lg:col-span-1">
          <PriceGuidePanel workType={workType} />
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-navy-700 text-gray-400 hover:text-white hover:border-navy-600 transition-colors font-medium text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          戻る
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className="bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-8 py-2.5 rounded-lg transition-colors flex items-center gap-2 text-sm"
        >
          次へ
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
