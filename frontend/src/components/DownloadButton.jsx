import React from 'react'

export default function DownloadButton({ text, title }) {
  const handlePrintPdf = () => {
    const win = window.open('', '_blank')
    if (!win) {
      alert('ポップアップがブロックされました。ブラウザの設定でポップアップを許可してください。')
      return
    }
    win.document.write(text)
    win.document.close()
    // Wait for resources (fonts, images) to load before printing
    win.addEventListener('load', () => {
      win.focus()
      win.print()
    })
  }

  const handleDownloadHtml = () => {
    const blob = new Blob([text], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!text) return null

  return (
    <div className="mt-4 space-y-2">
      <div className="flex gap-2">
        <button
          onClick={handlePrintPdf}
          className="flex-1 bg-navy-800 hover:bg-navy-700 border border-accent text-accent hover:text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          印刷 / PDF保存
        </button>
        <button
          onClick={handleDownloadHtml}
          className="flex-1 bg-navy-800 hover:bg-navy-700 border border-navy-600 text-gray-300 hover:text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          HTMLでダウンロード
        </button>
      </div>
      <p className="text-xs text-gray-500 text-center">
        PDF保存は印刷ダイアログで「PDFに保存」を選択してください
      </p>
    </div>
  )
}
