import React from 'react'
import EditorToolbar from './EditorToolbar'

function wrapInShell(content) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${content}</body></html>`
}

function PencilIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828A2 2 0 0110 16.414H8v-2a2 2 0 01.586-1.414z"
      />
    </svg>
  )
}

export default function DocumentEditor({ htmlString, title, onHtmlChange }) {
  const [isEditing, setIsEditing] = React.useState(false)
  const previewRef = React.useRef(null)
  const editRef = React.useRef(null)

  const isFullHtml = htmlString && /^(﻿)?\s*<!doctype|^(﻿)?\s*<html/i.test(htmlString)
  const srcDoc = htmlString
    ? isFullHtml
      ? htmlString
      : wrapInShell(htmlString)
    : wrapInShell('')

  const handleStartEdit = () => {
    setIsEditing(true)
  }

  const handleEditLoad = () => {
    const iframe = editRef.current
    if (!iframe) return
    try {
      iframe.contentDocument.designMode = 'on'
    } catch {
      // cross-origin guard (shouldn't happen with srcDoc)
    }
  }

  const handleCommand = (cmd) => {
    const iframe = editRef.current
    if (!iframe) return
    try {
      iframe.contentDocument.execCommand(cmd, false, null)
      iframe.contentDocument.designMode = 'on'
    } catch {
      // ignore
    }
  }

  const handleDone = () => {
    const iframe = editRef.current
    if (iframe) {
      try {
        const newHtml = '<!DOCTYPE html>' + iframe.contentDocument.documentElement.outerHTML
        onHtmlChange(newHtml)
      } catch {
        // ignore
      }
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  if (!htmlString) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <svg className="w-16 h-16 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p>書類を生成するとここにプレビューが表示されます</p>
      </div>
    )
  }

  if (isEditing) {
    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-accent">{title}</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 bg-navy-700 px-2 py-1 rounded">編集中</span>
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-1.5 rounded-lg border border-navy-700 text-gray-400 hover:text-white hover:border-navy-600 transition-colors text-sm font-medium"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleDone}
              className="px-4 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-white font-bold text-sm transition-colors"
            >
              完了
            </button>
          </div>
        </div>

        <div className="mb-2">
          <EditorToolbar onCommand={handleCommand} />
        </div>

        <iframe
          ref={editRef}
          srcDoc={srcDoc}
          title={`${title}-edit`}
          onLoad={handleEditLoad}
          className="w-full rounded-lg border border-navy-700"
          style={{ height: 'calc(100vh - 400px)', minHeight: '500px', background: '#fff' }}
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-accent">{title}</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 bg-navy-700 px-2 py-1 rounded">プレビュー</span>
          <button
            type="button"
            onClick={handleStartEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-navy-700 text-gray-300 hover:text-white hover:border-accent hover:bg-navy-700 transition-colors text-sm font-medium"
          >
            <PencilIcon />
            編集
          </button>
        </div>
      </div>
      <iframe
        ref={previewRef}
        srcDoc={srcDoc}
        title={title}
        className="w-full rounded-lg border border-navy-700"
        style={{ height: 'calc(100vh - 320px)', minHeight: '600px', background: '#fff' }}
        sandbox="allow-scripts"
      />
    </div>
  )
}
