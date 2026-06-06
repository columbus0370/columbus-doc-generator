import React from 'react'
import WizardContainer from './components/wizard/WizardContainer'
import DocumentEditor from './components/DocumentEditor'
import DownloadButton from './components/DownloadButton'
import BusinessProfileModal from './components/BusinessProfileModal'
import EmailDraftModal from './components/EmailDraftModal'
import { generateDocument } from './api/generate'
import { useBusinessProfile } from './hooks/useBusinessProfile'
import { useEstimateHistory } from './hooks/useEstimateHistory'
import { injectLogo } from './utils/logoInjector'
import { WIZARD_STEPS } from './config/wizardConfig'
import { increment } from './hooks/useUsageLimit'

function formatJpDate(isoString) {
  const d = new Date(isoString)
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
}

function computeTotal(lineItems) {
  if (!Array.isArray(lineItems)) return 0
  return lineItems.reduce((sum, r) => {
    const price = parseFloat(r.price) || 0
    const qty = parseFloat(r.qty) || 1
    return sum + price * qty
  }, 0)
}

function getWorkTypeLabel(value) {
  const opt = WIZARD_STEPS.estimate[0].options.find((o) => o.value === value)
  return opt?.label || value || ''
}

export default function App() {
  const [result, setResult] = React.useState(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')
  const [wizardKey, setWizardKey] = React.useState(0)
  const [showProfile, setShowProfile] = React.useState(false)
  const [showHistory, setShowHistory] = React.useState(false)
  const [showEmail, setShowEmail] = React.useState(false)
  const [initialData, setInitialData] = React.useState(null)
  const [history, setHistory] = React.useState([])

  const { profile, saveProfile } = useBusinessProfile()
  const { getHistory, saveEstimate, deleteEstimate } = useEstimateHistory()

  React.useEffect(() => {
    if (showHistory) setHistory(getHistory())
  }, [showHistory])

  const handleGenerate = async (formData) => {
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const data = await generateDocument({
        doc_type: formData.doc_type,
        client_name: formData.client_name,
        company_name: formData.company_name,
        content: formData.content,
        amount: formData.amount,
        notes: formData.notes,
      })
      const logoDataUrl = profile?.logo_data_url || null
      const enrichedHtml = logoDataUrl
        ? injectLogo(data.generated_text, logoDataUrl)
        : data.generated_text

      const wizard = formData._wizard || {}
      const totalAmount = computeTotal(wizard.line_items)
      const workTypeLabel = getWorkTypeLabel(wizard.work_type)

      const resultData = {
        ...data,
        generated_text: enrichedHtml,
        client_name: formData.client_name,
        _wizard: wizard,
        work_type_label: workTypeLabel,
        total_amount: totalAmount,
      }
      increment()
      setResult(resultData)

      saveEstimate({
        client_name: formData.client_name,
        work_type: wizard.work_type || '',
        work_type_label: workTypeLabel,
        work_detail: wizard.work_detail || '',
        line_items: wizard.line_items || [],
        conditions: wizard.conditions || {},
        total_amount: totalAmount,
        html: enrichedHtml,
        basicInfo: formData._basicInfo,
        answers: [wizard.work_type, wizard.work_detail, wizard.line_items, wizard.conditions],
      })
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
    setInitialData(null)
    setWizardKey((k) => k + 1)
  }

  const handleSaveProfile = (data) => {
    saveProfile(data)
  }

  const handleHtmlChange = (newHtml) => {
    setResult((prev) => ({ ...prev, generated_text: newHtml }))
  }

  const handleReuseEstimate = (item) => {
    setShowHistory(false)
    setResult(null)
    setError('')
    setInitialData({
      basicInfo: item.basicInfo || {
        doc_type: 'estimate',
        client_name: item.client_name || '',
        company_name: profile?.business_name || '',
        amount: '',
      },
      answers: item.answers || [],
    })
    setWizardKey((k) => k + 1)
  }

  const handleDeleteHistory = (id) => {
    deleteEstimate(id)
    setHistory(getHistory())
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
              Columbus AI <span className="text-accent">見積書ジェネレーター</span>
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* 履歴ボタン */}
            <button
              type="button"
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-navy-700 text-gray-300 hover:text-white hover:border-navy-600 transition-colors text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="hidden sm:inline">履歴</span>
            </button>

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
              {profile?.business_name && (
                <span className="w-2 h-2 rounded-full bg-green-400 absolute -top-0.5 -right-0.5" />
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {result ? (
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

            <div className="flex gap-3 mb-4">
              <div className="flex-1">
                <DownloadButton
                  text={result.generated_text}
                  clientName={result.client_name}
                />
              </div>
              <button
                type="button"
                onClick={() => setShowEmail(true)}
                className="px-4 py-3 rounded-lg border border-navy-700 bg-navy-800 text-gray-300 hover:text-white hover:border-navy-600 transition-colors text-sm font-medium flex items-center gap-2 whitespace-nowrap"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                送付メールを作成
              </button>
            </div>

            <div className="bg-navy-800 rounded-2xl p-4 sm:p-6 border border-navy-700">
              <DocumentEditor
                title={result.title}
                htmlString={result.generated_text}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-full max-w-2xl mb-8 text-center">
              <h2 className="text-2xl font-bold text-white">見積書を作成する</h2>
              <p className="text-gray-400 mt-2 text-sm">
                ステップに沿って回答するだけで、プロ品質の見積書をAIが生成します
              </p>
            </div>
            <WizardContainer
              key={wizardKey}
              onGenerate={handleGenerate}
              loading={loading}
              error={error}
              profile={profile}
              initialData={initialData}
            />
          </div>
        )}
      </main>

      <footer className="text-center py-6 text-gray-600 text-sm">
        Columbus AI 見積書ジェネレーター — Powered by Claude API
      </footer>

      {/* 事業者情報モーダル */}
      {showProfile && (
        <BusinessProfileModal
          profile={profile}
          onSave={handleSaveProfile}
          onClose={() => setShowProfile(false)}
        />
      )}

      {/* メール文面モーダル */}
      {showEmail && result && (
        <EmailDraftModal
          htmlString={result.generated_text}
          clientName={result.client_name || ''}
          companyName={profile?.business_name || ''}
          workTypeLabel={result.work_type_label || ''}
          totalAmount={result.total_amount ? `${result.total_amount.toLocaleString()}` : ''}
          deadline={result._wizard?.conditions?.deadline || ''}
          onClose={() => setShowEmail(false)}
        />
      )}

      {/* 履歴ドロワー */}
      {showHistory && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setShowHistory(false)}
        >
          <div className="w-full max-w-md bg-navy-800 border-l border-navy-700 h-full overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-navy-700 flex-shrink-0">
              <h2 className="text-base font-bold text-white">見積書の履歴</h2>
              <button
                type="button"
                onClick={() => setShowHistory(false)}
                className="text-gray-500 hover:text-white transition-colors p-1"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 px-4 py-4 space-y-3">
              {history.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-sm">
                  <p>履歴はまだありません</p>
                  <p className="mt-1 text-xs">見積書を生成すると自動保存されます</p>
                </div>
              ) : (
                history.map((item) => (
                  <div key={item.id} className="bg-navy-900/60 border border-navy-700 rounded-xl p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {item.client_name || '（顧客名なし）'}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{item.work_type_label || item.work_type || '—'}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteHistory(item.id)}
                        className="text-gray-600 hover:text-red-400 transition-colors p-1 flex-shrink-0"
                        title="削除"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        {item.total_amount > 0
                          ? `¥${item.total_amount.toLocaleString()}`
                          : '金額未定'}
                      </span>
                      <span>{formatJpDate(item.created_at)}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleReuseEstimate(item)}
                      className="w-full py-2 rounded-lg border border-navy-600 text-gray-300 hover:text-white hover:border-accent hover:bg-accent/10 transition-all text-xs font-medium"
                    >
                      この見積書を再利用
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
