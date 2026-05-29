import React from 'react'
import { generateEmail } from '../api/generate'
import { downloadPdf } from '../api/generate'

function formatDate() {
  const d = new Date()
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
}

export default function EmailDraftModal({
  htmlString,
  clientName,
  companyName,
  workTypeLabel,
  totalAmount,
  deadline,
  onClose,
}) {
  const [loading, setLoading] = React.useState(false)
  const [sharing, setSharing] = React.useState(false)
  const [subject, setSubject] = React.useState('')
  const [body, setBody] = React.useState('')
  const [error, setError] = React.useState('')
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    generate()
  }, [])

  const generate = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await generateEmail({
        client_name: clientName || '',
        company_name: companyName || '',
        work_type: workTypeLabel || '',
        total_amount: totalAmount || '',
        deadline: deadline || '',
      })
      setSubject(data.subject || '')
      setBody(data.body || '')
    } catch (e) {
      setError(e.message || 'メール文面の生成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenMailApp = async () => {
    setSharing(true)
    try {
      const filename = clientName
        ? `見積書_${clientName}_${formatDate()}.pdf`
        : `見積書_${formatDate()}.pdf`

      // Web Share API（iOS/Android: アプリ選択 → PDF添付）が使える場合
      if (htmlString && navigator.share && navigator.canShare) {
        const blob = await downloadPdf(htmlString)
        const file = new File([blob], filename, { type: 'application/pdf' })
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: subject,
            text: body,
            files: [file],
          })
          return
        }
      }

      // デスクトップ等フォールバック: PDFダウンロード + mailto
      if (htmlString) {
        const blob = await downloadPdf(htmlString)
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.click()
        URL.revokeObjectURL(url)
      }
      const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      window.open(mailto, '_blank')
    } catch (e) {
      if (e.name !== 'AbortError') {
        setError('メールアプリを開けませんでした。「全文コピー」をお使いください。')
      }
    } finally {
      setSharing(false)
    }
  }

  const handleCopy = () => {
    const full = `件名：${subject}\n\n${body}`
    navigator.clipboard.writeText(full).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

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
            <h2 className="text-base font-bold text-white">送付メール文面</h2>
            <p className="text-xs text-gray-400 mt-0.5">内容を確認・編集してからメールアプリで開いてください</p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-white transition-colors p-1">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <svg className="animate-spin h-8 w-8 text-accent" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <p className="text-sm text-gray-400">メール文面を生成中...</p>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-sm">
              {error}
              <button type="button" onClick={generate} className="ml-3 underline hover:text-red-200 transition-colors">
                再試行
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">件名</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-navy-900 border border-navy-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">本文</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={10}
                  className="w-full bg-navy-900 border border-navy-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-accent resize-none transition-colors leading-relaxed"
                />
              </div>

              {/* メールアプリで開くボタン */}
              <button
                type="button"
                onClick={handleOpenMailApp}
                disabled={sharing}
                className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
              >
                {sharing ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    PDF生成中...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    メールアプリで開く（PDF添付）
                  </>
                )}
              </button>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={generate}
                  className="px-4 py-2.5 rounded-lg border border-navy-700 text-gray-400 hover:text-white hover:border-navy-600 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  再生成
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex-1 border border-navy-600 text-gray-300 hover:text-white hover:border-navy-500 font-medium px-4 py-2.5 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                >
                  {copied ? (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                      コピー済み
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      全文コピー
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
