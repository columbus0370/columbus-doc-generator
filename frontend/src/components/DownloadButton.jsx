import React from 'react'

export default function DownloadButton({ text }) {
  if (!text) return null

  const handlePrint = () => {
    const win = window.open('', '_blank')
    if (!win) {
      alert('ポップアップがブロックされました。ブラウザの設定でポップアップを許可してください。')
      return
    }
    win.document.write(text)
    win.document.close()
    win.addEventListener('load', () => win.print(), { once: true })
  }

  return (
    <button
      onClick={handlePrint}
      className="w-full bg-navy-800 hover:bg-navy-700 border border-accent text-accent hover:text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
      </svg>
      PDFとして印刷・保存
    </button>
  )
}
