import React from 'react'

export default function DownloadButton({ text, title }) {
  const handlePrintPdf = () => {
    const win = window.open('', '_blank', 'noopener,noreferrer')
    if (!win) {
      alert('ポップアップがブロックされました。ブラウザの設定でポップアップを許可してください。')
      return
    }
    // Set onload before writing to avoid missing the event when it fires synchronously
    win.onload = () => {
      win.focus()
      win.print()
    }
    win.document.write(text)
    win.document.close()
    // Fallback: if load already fired before the listener was attached, trigger print via setTimeout
    if (win.document.readyState === 'complete') {
      win.focus()
      win.print()
    }
  }

  if (!text) return null

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button
          onClick={handlePrintPdf}
          className="w-full bg-navy-800 hover:bg-navy-700 border border-accent text-accent hover:text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          印刷 / PDF保存
        </button>
      </div>
      <p className="text-xs text-gray-500 text-center">
        PDF保存は印刷ダイアログで「PDFに保存」を選択してください
      </p>
    </div>
  )
}
