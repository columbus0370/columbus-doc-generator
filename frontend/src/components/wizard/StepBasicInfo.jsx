import React from 'react'

export default function StepBasicInfo({ data, onChange, onNext, profile }) {
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
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-gray-300">自社名・担当者名</label>
            {profile?.business_name && data.company_name === profile.business_name && (
              <span className="text-xs text-green-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                事業者情報から入力済み
              </span>
            )}
          </div>
          <input
            type="text"
            value={data.company_name}
            onChange={(e) => onChange('company_name', e.target.value)}
            placeholder="例: 株式会社テック / 山田 太郎"
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>{data.doc_type === 'invoice' ? '請求金額（任意）' : '金額（任意）'}</label>
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
        <div className="flex items-center gap-4 mt-2">
          <span className="text-xs text-gray-500">明細単価の税区分：</span>
          {[
            { value: 'exclusive', label: '税抜' },
            { value: 'inclusive', label: '税込' },
          ].map(({ value, label }) => (
            <label key={value} className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="radio"
                name="tax_type"
                value={value}
                checked={(data.tax_type ?? 'exclusive') === value}
                onChange={() => onChange('tax_type', value)}
                className="accent-accent w-3.5 h-3.5"
              />
              <span className="text-sm text-gray-300">{label}</span>
            </label>
          ))}
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
