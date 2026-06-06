import React from 'react'
import { setAccessKey } from '../hooks/useUsageLimit'

const squarePaymentUrl = import.meta.env.VITE_SQUARE_PAYMENT_URL || '#'
const apiUrl = import.meta.env.VITE_API_URL || ''

export default function UsageLimitModal({ isOpen, onClose }) {
  const [showKeyInput, setShowKeyInput] = React.useState(false)
  const [keyValue, setKeyValue] = React.useState('')
  const [keyError, setKeyError] = React.useState('')
  const [keyLoading, setKeyLoading] = React.useState(false)
  const [keySuccess, setKeySuccess] = React.useState(false)

  if (!isOpen) return null

  const handleApplyKey = async () => {
    const trimmed = keyValue.trim()
    if (!trimmed) return
    setKeyLoading(true)
    setKeyError('')
    try {
      const res = await fetch(`${apiUrl}/api/verify-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_key: trimmed }),
      })
      const data = await res.json()
      if (data.valid) {
        setAccessKey(trimmed)
        setKeySuccess(true)
        setTimeout(() => onClose(), 1000)
      } else {
        setKeyError('アクセスキーが正しくありません')
      }
    } catch {
      setKeyError('通信エラーが発生しました')
    } finally {
      setKeyLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleApplyKey()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 bg-navy-900 border border-navy-700 rounded-2xl p-6 sm:p-8 w-full max-w-md mx-4 shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-2">無料枠を使い切りました</h2>
        <p className="text-gray-400 text-sm mb-6">今月の無料枠（3回）を使い切りました。</p>

        <div className="bg-navy-800 rounded-xl p-4 border border-navy-700 mb-6">
          <div className="flex items-center justify-between mb-1">
            <span className="text-white font-bold">スタンダードプラン</span>
            <span className="text-accent font-bold text-lg">980円/月</span>
          </div>
          <p className="text-gray-400 text-sm">書類生成が無制限に使えます</p>
        </div>

        <a
          href={squarePaymentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center bg-accent hover:bg-accent-hover text-white font-bold py-3 rounded-lg transition-colors mb-4 text-sm"
        >
          プランに登録する
        </a>

        {!showKeyInput ? (
          <button
            type="button"
            onClick={() => setShowKeyInput(true)}
            className="w-full text-center text-gray-400 hover:text-white text-sm underline mb-4 transition-colors"
          >
            アクセスキーをお持ちの方はこちら
          </button>
        ) : (
          <div className="mb-4 space-y-2">
            <input
              type="text"
              value={keyValue}
              onChange={(e) => setKeyValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="アクセスキーを入力"
              autoFocus
              className="w-full bg-navy-800 border border-navy-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-accent"
            />
            {keySuccess && (
              <p className="text-green-400 text-sm">プランが有効になりました</p>
            )}
            {keyError && (
              <p className="text-red-400 text-sm">{keyError}</p>
            )}
            <button
              type="button"
              onClick={handleApplyKey}
              disabled={keyLoading || !keyValue.trim()}
              className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2 rounded-lg transition-colors text-sm"
            >
              {keyLoading ? '確認中...' : '適用'}
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-full text-center text-gray-500 hover:text-gray-300 text-sm transition-colors"
        >
          キャンセル
        </button>
      </div>
    </div>
  )
}
