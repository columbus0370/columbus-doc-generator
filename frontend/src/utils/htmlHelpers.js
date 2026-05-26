export function extractBodyAndStyles(htmlString) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlString, 'text/html')

  // Remove scripts for security
  doc.querySelectorAll('script').forEach((s) => s.remove())

  // Collect styles
  const styleTexts = []
  doc.querySelectorAll('style').forEach((s) => {
    styleTexts.push(s.textContent)
  })
  const styles = styleTexts.join('\n')

  // Collect head extras: charset meta + title
  const headExtraParts = []
  doc.querySelectorAll('meta[charset]').forEach((m) => {
    headExtraParts.push(m.outerHTML)
  })
  doc.querySelectorAll('title').forEach((t) => {
    headExtraParts.push(t.outerHTML)
  })
  const headExtra = headExtraParts.join('')

  const body = doc.body.innerHTML

  return { body, styles, headExtra }
}

export function reassembleHtml(body, styles, headExtra) {
  return `<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8">${headExtra}<style>${styles}</style></head><body>${body}</body></html>`
}
