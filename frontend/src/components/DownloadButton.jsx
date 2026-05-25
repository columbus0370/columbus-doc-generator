import React from 'react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { downloadPdf } from '../api/generate'

export default function DownloadButton({ text, title }) {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  React.useEffect(() => {
    setError('')
  }, [text])

  const handleDownload = async () => {
    setLoading(true)
    setError('')
    try {
      const html = DOMPurify.sanitize(marked.parse(text))
      const blob = await downloadPdf(`<h1>${title}</h1>${html}`)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${title}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      if (e instanceof TypeError && e.message === 'Failed to fetch') {
        setError('サーバーに接続できませんでした。バックエンドが起動しているか確認してください。')
      } else {
        setError(e.message)
      }
    } finally {
      setLoading(false)
    }
  }

  if (!text) return null

  return (
    <div className="mt-4">
      {error && (
        <p className="text-red-400 text-sm mb-2">{error}</p>
      )}
      <button
        onClick={handleDownload}
        disabled={loading}
        className="w-full bg-navy-800 hover:bg-navy-700 border border-accent text-accent hover:text-white disabled:opacity-50 disabled:cursor-not-allowed font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            PDF生成中...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            PDFでダウンロード
          </>
        )}
      </button>
    </div>
  )
}
