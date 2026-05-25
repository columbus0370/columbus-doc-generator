import React from 'react'

const DOC_TYPES = [
  { value: 'estimate', label: '見積書' },
  { value: 'proposal', label: '提案書' },
  { value: 'report', label: '業務レポート' },
]

export default function DocumentForm({ onSubmit, loading }) {
  const [form, setForm] = React.useState({
    doc_type: 'estimate',
    client_name: '',
    company_name: '',
    content: '',
    amount: '',
    notes: '',
  })

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form)
  }

  const inputClass =
    'w-full bg-navy-800 border border-navy-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors'
  const labelClass = 'block text-sm font-medium text-gray-300 mb-1.5'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className={labelClass}>書類種別</label>
        <select
          name="doc_type"
          value={form.doc_type}
          onChange={handleChange}
          className={inputClass}
        >
          {DOC_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>
          顧客名 <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          name="client_name"
          value={form.client_name}
          onChange={handleChange}
          placeholder="株式会社〇〇"
          required
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>担当者名</label>
        <input
          type="text"
          name="company_name"
          value={form.company_name}
          onChange={handleChange}
          placeholder="山田 太郎"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>
          業務内容 <span className="text-red-400">*</span>
        </label>
        <textarea
          name="content"
          value={form.content}
          onChange={handleChange}
          placeholder="業務内容を詳しく入力してください"
          required
          rows={5}
          className={`${inputClass} resize-none`}
        />
      </div>

      <div>
        <label className={labelClass}>金額（任意）</label>
        <input
          type="text"
          name="amount"
          value={form.amount}
          onChange={handleChange}
          placeholder="300000"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>備考（任意）</label>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          placeholder="特記事項など"
          rows={3}
          className={`${inputClass} resize-none`}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            生成中...
          </>
        ) : (
          'AIで書類を生成'
        )}
      </button>
    </form>
  )
}
