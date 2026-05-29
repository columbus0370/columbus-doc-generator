import React from 'react'
import { downloadPdf } from '../api/generate'

function formatDate() {
  const d = new Date()
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
}

export default function DownloadButton({ text, clientName }) {
  const [loading, setLoading] = React.useState(false)

  if (!text) return null

  const handleDownload = async () => {
    setLoading(true)
    try {
      const blob = await downloadPdf(text)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = clientName ? `見積書_${clientName}_${formatDate()}.pdf` : `見積書_${formatDate()}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('PDFのダウンロードに失敗しました。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="w-full bg-navy-800 hover:bg-navy-700 disabled:opacity-50 disabled:cursor-not-allowed border border-accent text-accent hover:text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
    >
      {loading ? (
        <>
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          生成中…
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          PDFをダウンロード
        </>
      )}
    </button>
  )
}
