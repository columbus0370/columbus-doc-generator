import React from 'react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

export default function PreviewPanel({ title, text }) {
  const html = React.useMemo(() => {
    if (!text) return ''
    return DOMPurify.sanitize(marked.parse(text))
  }, [text])

  if (!text) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <svg className="w-16 h-16 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p>書類を生成するとここにプレビューが表示されます</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-accent">{title}</h3>
        <span className="text-xs text-gray-400 bg-navy-700 px-2 py-1 rounded">プレビュー</span>
      </div>
      <div
        className="prose-doc bg-navy-800 rounded-lg p-6 border border-navy-700"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
