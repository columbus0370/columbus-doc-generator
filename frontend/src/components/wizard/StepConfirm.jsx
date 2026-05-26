import React from 'react'
import { DOC_TYPES, WIZARD_STEPS } from '../../config/wizardConfig'

export default function StepConfirm({ basicInfo, answers, onSubmit, onBack, loading, error }) {
  const docTypeLabel = DOC_TYPES.find((t) => t.value === basicInfo.doc_type)?.label ?? basicInfo.doc_type
  const steps = WIZARD_STEPS[basicInfo.doc_type] ?? []

  const rows = [
    { label: '書類種別', value: docTypeLabel },
    { label: '顧客名', value: basicInfo.client_name || '—' },
    { label: '自社名・担当者名', value: basicInfo.company_name || '—' },
    { label: '金額', value: basicInfo.amount ? (isNaN(Number(basicInfo.amount)) ? `${basicInfo.amount} 円` : `${Number(basicInfo.amount).toLocaleString()} 円`) : '—' },
    ...steps.map((step, i) => ({
      label: `Q${i + 1}: ${step.question}`,
      value: answers[i] || '—',
    })),
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white">入力内容の確認</h3>
        <p className="text-sm text-gray-400 mt-1">以下の内容で書類を生成します。問題なければ「生成する」を押してください。</p>
      </div>

      {/* サマリーテーブル */}
      <div className="rounded-xl border border-navy-700 overflow-hidden">
        {rows.map((row, i) => (
          <div
            key={i}
            className={`flex flex-col sm:flex-row sm:items-start px-4 py-3 gap-1 sm:gap-4 ${
              i % 2 === 0 ? 'bg-navy-900/60' : 'bg-navy-900/30'
            }`}
          >
            <span className="text-xs text-gray-500 sm:w-52 sm:flex-shrink-0 pt-0.5 leading-relaxed">
              {row.label}
            </span>
            <span className="text-sm text-white font-medium leading-relaxed">{row.value}</span>
          </div>
        ))}
      </div>

      {/* エラー */}
      {error && (
        <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* ナビゲーション */}
      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-navy-700 text-gray-400 hover:text-white hover:border-navy-600 transition-colors font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          戻る
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={loading}
          className="bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-8 py-2.5 rounded-lg transition-colors flex items-center gap-2 text-sm"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              生成中...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              生成する
            </>
          )}
        </button>
      </div>
    </div>
  )
}
