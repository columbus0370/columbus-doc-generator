import React from 'react'

const ZOOM_SCRIPT = `<script>
(function(){
  function applyZoom(){
    var vw=window.innerWidth;
    var intended=800;
    if(vw<intended){
      document.documentElement.style.zoom=(vw/intended).toFixed(4);
      document.body.style.minWidth='0';
    } else {
      document.documentElement.style.zoom='';
      document.body.style.minWidth='';
    }
  }
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',applyZoom);
  } else {
    applyZoom();
  }
  window.addEventListener('resize',applyZoom);
})();
</script>`

function injectZoom(html) {
  if (html.includes('</body>')) return html.replace('</body>', ZOOM_SCRIPT + '\n</body>')
  if (html.includes('</html>')) return html.replace('</html>', ZOOM_SCRIPT + '\n</html>')
  return html + ZOOM_SCRIPT
}

function wrapInShell(content) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${content}${ZOOM_SCRIPT}</body></html>`
}

export default function DocumentEditor({ htmlString, title }) {
  const previewRef = React.useRef(null)

  const isFullHtml = htmlString && /^(﻿)?\s*<!doctype|^(﻿)?\s*<html/i.test(htmlString)
  const srcDoc = htmlString
    ? isFullHtml
      ? injectZoom(htmlString)
      : wrapInShell(htmlString)
    : wrapInShell('')

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

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-accent">{title}</h3>
        <span className="text-xs text-gray-400 bg-navy-700 px-2 py-1 rounded">プレビュー</span>
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
