import React from 'react'
import WizardContainer from './components/wizard/WizardContainer'
import DocumentEditor from './components/DocumentEditor'
import DownloadButton from './components/DownloadButton'
import BusinessProfileModal from './components/BusinessProfileModal'
import { generateDocument } from './api/generate'
import { useBusinessProfile } from './hooks/useBusinessProfile'
import { injectLogo } from './utils/logoInjector'

export default function App() {
  const [result, setResult] = React.useState(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const [wizardKey, setWizardKey] = React.useState(0)
  const [showProfile, setShowProfile] = React.useState(false)

  const { profile, saveProfile } = useBusinessProfile()

  const handleGenerate = async (formData) => {
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const data = await generateDocument(formData)
      const logoDataUrl = profile?.logo_data_url || null
      const enrichedHtml = logoDataUrl
        ? injectLogo(data.generated_text, logoDataUrl)
        : data.generated_text
      setResult({ ...data, generated_text: enrichedHtml })
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

  const handleSaveProfile = (data) => {
    saveProfile(data)
  }

  const handleHtmlChange = (newHtml) => {
    setResult((prev) => ({ ...prev, generated_text: newHtml }))
  }

  return (
    <div className="min-h-screen bg-navy-900">
      {/* ヘッダー */}
      <header className="border-b border-navy-700 bg-navy-800/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white">
              Columbus AI <span className="text-accent">書類ジェネレーター</span>
            </h1>
          </div>

          {/* 事業者情報ボタン */}
          <button
            type="button"
            onClick={() => setShowProfile(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-navy-700 text-gray-300 hover:text-white hover:border-navy-600 transition-colors text-sm font-medium relative"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="hidden sm:inline">事業者情報</span>
            {/* 登録済みインジケーター */}
            {profile?.business_name && (
              <span className="w-2 h-2 rounded-full bg-green-400 absolute -top-0.5 -right-0.5" />
            )}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {result ? (
          /* 生成完了後: 全幅プレビュー */
          <div>
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

            <div className="mb-4">
              <DownloadButton text={result.generated_text} title={result.title} />
            </div>

            <div className="bg-navy-800 rounded-2xl p-4 sm:p-6 border border-navy-700">
              <DocumentEditor
                title={result.title}
                htmlString={result.generated_text}
                onHtmlChange={handleHtmlChange}
              />
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
              profile={profile}
            />
          </div>
        )}
      </main>

      <footer className="text-center py-6 text-gray-600 text-sm">
        Columbus AI 書類ジェネレーター — Powered by Claude API
      </footer>

      {/* 事業者情報モーダル */}
      {showProfile && (
        <BusinessProfileModal
          profile={profile}
          onSave={handleSaveProfile}
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  )
}
