import React from 'react'
import DocumentForm from './components/DocumentForm'
import PreviewPanel from './components/PreviewPanel'
import DownloadButton from './components/DownloadButton'
import { generateDocument } from './api/generate'

export default function App() {
  const [result, setResult] = React.useState(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  const handleGenerate = async (formData) => {
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const data = await generateDocument(formData)
      setResult(data)
    } catch (e) {
      if (e instanceof TypeError && e.message === 'Failed to fetch') {
        setError('サーバーに接続できませんでした。バックエンドが起動しているか確認してください。')
      } else {
        setError(e.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy-900">
      <header className="border-b border-navy-700 bg-navy-800/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white">
            Columbus AI <span className="text-accent">書類ジェネレーター</span>
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="bg-navy-800 rounded-2xl p-6 border border-navy-700">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-accent text-white text-xs flex items-center justify-center font-bold">1</span>
              書類情報を入力
            </h2>
            <DocumentForm onSubmit={handleGenerate} loading={loading} />
            {error && (
              <div className="mt-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}
          </section>

          <section className="bg-navy-800 rounded-2xl p-6 border border-navy-700">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-accent text-white text-xs flex items-center justify-center font-bold">2</span>
              生成された書類
            </h2>
            <PreviewPanel title={result?.title} text={result?.generated_text} />
            <DownloadButton text={result?.generated_text} title={result?.title} />
          </section>
        </div>
      </main>

      <footer className="text-center py-6 text-gray-600 text-sm">
        Columbus AI 書類ジェネレーター — Powered by Claude API
      </footer>
    </div>
  )
}
