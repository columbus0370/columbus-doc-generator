import React from 'react'
import { EMPTY_PROFILE } from '../hooks/useBusinessProfile'

const inputClass =
  'w-full bg-navy-900 border border-navy-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors text-sm'
const labelClass = 'block text-xs font-medium text-gray-400 mb-1.5'

export default function BusinessProfileModal({ profile, onSave, onClose }) {
  const [form, setForm] = React.useState(profile ?? EMPTY_PROFILE)
  const [logoError, setLogoError] = React.useState('')

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const handleLogoUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 500 * 1024) {
      setLogoError('ロゴ画像は500KB以下にしてください')
      return
    }
    setLogoError('')
    const reader = new FileReader()
    reader.onload = (ev) => set('logo_data_url', ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleSave = (e) => {
    e.preventDefault()
    onSave(form)
    onClose()
  }

  const handleClear = () => {
    if (window.confirm('事業者情報を削除しますか？')) {
      onSave(null)
      onClose()
    }
  }

  // Close on backdrop click
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={handleBackdrop}
    >
      <div className="w-full max-w-lg bg-navy-800 border border-navy-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-navy-700">
          <div>
            <h2 className="text-base font-bold text-white">事業者情報</h2>
            <p className="text-xs text-gray-400 mt-0.5">書類の発行者欄に自動挿入されます</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelClass}>
                事業者名・屋号 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.business_name}
                onChange={(e) => set('business_name', e.target.value)}
                placeholder="例: 株式会社テック / 山田 太郎"
                required
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>担当者名</label>
              <input
                type="text"
                value={form.contact_name}
                onChange={(e) => set('contact_name', e.target.value)}
                placeholder="例: 山田 太郎"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>郵便番号</label>
              <input
                type="text"
                value={form.zip}
                onChange={(e) => set('zip', e.target.value)}
                placeholder="例: 150-0001"
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>TEL</label>
              <input
                type="text"
                value={form.tel}
                onChange={(e) => set('tel', e.target.value)}
                placeholder="例: 03-1234-5678"
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>住所</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => set('address', e.target.value)}
                placeholder="例: 東京都渋谷区神南1-2-3"
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>メールアドレス</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="例: info@example.com"
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelClass}>ロゴ画像（任意・500KB以下）</label>
              {form.logo_data_url && (
                <div className="flex items-center gap-3 mb-2">
                  <img
                    src={form.logo_data_url}
                    alt="ロゴ"
                    className="h-12 object-contain rounded border border-navy-600"
                  />
                  <button
                    type="button"
                    onClick={() => set('logo_data_url', '')}
                    className="text-xs text-gray-500 hover:text-red-400 underline transition-colors"
                  >
                    削除
                  </button>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="block w-full text-sm text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-navy-600 file:text-xs file:font-medium file:text-gray-300 file:bg-navy-800 hover:file:bg-navy-700 file:cursor-pointer file:transition-colors"
              />
              {logoError && <p className="text-xs text-red-400 mt-1">{logoError}</p>}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-navy-700">
            {profile ? (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-gray-500 hover:text-red-400 underline transition-colors"
              >
                情報を削除
              </button>
            ) : (
              <span />
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-lg border border-navy-700 text-gray-400 hover:text-white hover:border-navy-600 transition-colors text-sm font-medium"
              >
                キャンセル
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg bg-accent hover:bg-accent-hover text-white font-bold text-sm transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
