import React from 'react'
import WizardContainer from './components/wizard/WizardContainer'
import PreviewPanel from './components/PreviewPanel'
import DownloadButton from './components/DownloadButton'
import { generateDocument } from './api/generate'

export default function App() {
  const [result, setResult] = React.useState(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const [wizardKey, setWizardKey] = React.useState(0)

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

  const handleReset = () => {
    setResult(null)
    setError('')
    setWizardKey((k) => k + 1)
  }

  return (
    <div className="min-h-screen bg-navy-900">
      {/* ヘッダー */}
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
        {result ? (
          /* 生成完了後: 全幅プレビュー */
          <div>
            {/* 上部: タイトル + やり直しボタン */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">{result.title}</h2>
                <p className="text-sm text-gray-400 mt-0.5">書類が生成されました</p>
              </div>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-navy-700 text-gray-300 hover:text-white hover:border-navy-600 transition-colors font-medium text-sm self-start sm:self-auto"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                最初からやり直す
              </button>
            </div>

            {/* ダウンロードボタン */}
            <div className="mb-4">
              <DownloadButton text={result.generated_text} title={result.title} />
            </div>

            {/* 全幅プレビュー */}
            <div className="bg-navy-800 rounded-2xl p-4 sm:p-6 border border-navy-700">
              <PreviewPanel title={result.title} text={result.generated_text} />
            </div>
          </div>
        ) : (
          /* ウィザード */
          <div className="flex flex-col items-center">
            <div className="w-full max-w-2xl mb-8 text-center">
              <h2 className="text-2xl font-bold text-white">書類を作成する</h2>
              <p className="text-gray-400 mt-2 text-sm">
                ステップに沿って回答するだけで、プロ品質のビジネス書類をAIが生成します
              </p>
            </div>
            <WizardContainer
              key={wizardKey}
              onGenerate={handleGenerate}
              loading={loading}
              error={error}
            />
          </div>
        )}
      </main>

      <footer className="text-center py-6 text-gray-600 text-sm">
        Columbus AI 書類ジェネレーター — Powered by Claude API
      </footer>
    </div>
  )
}
