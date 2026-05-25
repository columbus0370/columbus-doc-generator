const BASE_URL = import.meta.env.VITE_API_URL || ''

export async function generateDocument(payload) {
  const res = await fetch(`${BASE_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: '不明なエラー' }))
    throw new Error(err.detail || '生成に失敗しました')
  }

  return res.json()
}

export async function downloadPdf(htmlContent) {
  const res = await fetch(`${BASE_URL}/api/download-pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ html_content: htmlContent }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: '不明なエラー' }))
    throw new Error(err.detail || 'PDF生成に失敗しました')
  }

  return res.blob()
}
