import React from 'react'

const commands = [
  { cmd: 'bold', label: 'B', title: '太字', style: 'font-bold' },
  { cmd: 'italic', label: 'I', title: '斜体', style: 'italic' },
  { cmd: 'underline', label: 'U', title: '下線', style: 'underline' },
  { cmd: 'strikeThrough', label: 'S', title: '取り消し線', style: 'line-through' },
]

const divider = { type: 'divider' }

const historyCommands = [
  { cmd: 'undo', title: '元に戻す', icon: 'undo' },
  { cmd: 'redo', title: 'やり直し', icon: 'redo' },
]

function UndoIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 010 16H3m0-16l4-4m-4 4l4 4" />
    </svg>
  )
}

function RedoIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 000 16h10m0-16l-4-4m4 4l-4 4" />
    </svg>
  )
}

export default function EditorToolbar({ onCommand }) {
  const btnBase =
    'px-2.5 py-1.5 rounded text-sm text-gray-300 hover:text-white hover:bg-navy-600 transition-colors border border-transparent hover:border-navy-500 focus:outline-none'

  return (
    <div className="flex items-center gap-1 px-3 py-2 bg-navy-800 border border-navy-700 rounded-lg flex-wrap">
      {commands.map((c) => (
        <button
          key={c.cmd}
          type="button"
          title={c.title}
          onMouseDown={(e) => {
            e.preventDefault()
            onCommand(c.cmd)
          }}
          className={`${btnBase} ${c.style}`}
        >
          {c.label}
        </button>
      ))}

      <div className="w-px h-5 bg-navy-600 mx-1" />

      <button
        type="button"
        title="元に戻す"
        onMouseDown={(e) => {
          e.preventDefault()
          onCommand('undo')
        }}
        className={btnBase}
      >
        <UndoIcon />
      </button>
      <button
        type="button"
        title="やり直し"
        onMouseDown={(e) => {
          e.preventDefault()
          onCommand('redo')
        }}
        className={btnBase}
      >
        <RedoIcon />
      </button>
    </div>
  )
}
