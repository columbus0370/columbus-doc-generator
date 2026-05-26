import React from 'react'
import { DOC_TYPES } from '../../config/wizardConfig'

const DOC_TYPE_ICONS = {
  estimate: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  proposal: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  report: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
}

const DOC_TYPE_DESCS = {
  estimate: '商品・サービスの価格と内容を提示',
  proposal: '課題解決策や新規施策を提案',
  report: '業務進捗や成果を報告・まとめ',
}

export default function StepBasicInfo({ data, onChange, onNext }) {
  const inputClass =
    'w-full bg-navy-900 border border-navy-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors'
  const labelClass = 'block text-sm font-medium text-gray-300 mb-1.5'

  const canProceed = data.client_name.trim() !== ''

  const handleSubmit = (e) => {
    e.preventDefault()
    if (canProceed) onNext()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      {/* 書類種別選択 */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">書類種別</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {DOC_TYPES.map((type) => {
            const isSelected = data.doc_type === type.value
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => onChange('doc_type', type.value)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  isSelected
                    ? 'border-accent bg-accent/10 text-white'
                    : 'border-navy-700 bg-navy-900/50 text-gray-400 hover:border-navy-600 hover:text-gray-200'
                }`}
              >
                <div className={isSelected ? 'text-accent' : 'text-gray-500'}>
                  {DOC_TYPE_ICONS[type.value]}
                </div>
                <span className="font-bold text-sm">{type.label}</span>
                <span className="text-xs text-center leading-relaxed opacity-70">
                  {DOC_TYPE_DESCS[type.value]}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 基本情報入力 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>
            顧客名 <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={data.client_name}
            onChange={(e) => onChange('client_name', e.target.value)}
            placeholder="株式会社〇〇"
            required
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>自社名・担当者名</label>
          <input
            type="text"
            value={data.company_name}
            onChange={(e) => onChange('company_name', e.target.value)}
            placeholder="山田 太郎"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>金額（任意）</label>
        <div className="relative">
          <input
            type="text"
            value={data.amount}
            onChange={(e) => onChange('amount', e.target.value)}
            placeholder="例: 300000"
            className={`${inputClass} pr-12`}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">円</span>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={!canProceed}
          className="bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-8 py-3 rounded-lg transition-colors flex items-center gap-2"
        >
          次へ
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </form>
  )
}
