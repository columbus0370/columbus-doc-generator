import React from 'react'
import { WIZARD_STEPS, buildContent } from '../../config/wizardConfig'
import { formatProfileForPrompt } from '../../hooks/useBusinessProfile'
import { getUsage } from '../../hooks/useUsageLimit'
import WizardProgress from './WizardProgress'
import StepBasicInfo from './StepBasicInfo'
import StepQuestion from './StepQuestion'
import StepLineItems from './StepLineItems'
import StepTextInput from './StepTextInput'
import StepConfirm from './StepConfirm'
import UsageLimitModal from '../UsageLimitModal'

const makeInitialBasicInfo = (profile) => ({
  doc_type: 'estimate',
  client_name: '',
  company_name: profile?.business_name ?? '',
  amount: '',
  tax_type: 'exclusive',
})

export default function WizardContainer({ onGenerate, loading, error, profile, initialData }) {
  const [currentStep, setCurrentStep] = React.useState(0)
  const [basicInfo, setBasicInfo] = React.useState(
    () => initialData?.basicInfo ?? makeInitialBasicInfo(profile)
  )
  const [showLimitModal, setShowLimitModal] = React.useState(false)
  const [usage, setUsage] = React.useState(() => getUsage())

  const steps = WIZARD_STEPS[basicInfo.doc_type] ?? []
  const totalSteps = steps.length + 2

  const [answers, setAnswers] = React.useState(
    () => initialData?.answers ?? new Array(steps.length).fill(null)
  )

  const handleBasicChange = (field, value) => {
    setBasicInfo((prev) => ({ ...prev, [field]: value }))
  }

  const handleAnswerChange = (stepIdx, value) => {
    setAnswers((prev) => {
      const next = [...prev]
      next[stepIdx] = value
      return next
    })
  }

  const goNext = () => setCurrentStep((s) => Math.min(s + 1, totalSteps - 1))
  const goBack = () => setCurrentStep((s) => Math.max(s - 1, 0))

  const handleSubmit = () => {
    const current = getUsage()
    if (!current.isUnlimited && current.count >= current.limit) {
      setShowLimitModal(true)
      return
    }

    const content = buildContent(basicInfo.doc_type, answers, { tax_type: basicInfo.tax_type ?? 'exclusive' })
    const companyName =
      profile?.business_name && basicInfo.company_name === profile.business_name
        ? formatProfileForPrompt(profile)
        : basicInfo.company_name

    onGenerate({
      doc_type: basicInfo.doc_type,
      client_name: basicInfo.client_name,
      company_name: companyName,
      content,
      amount: basicInfo.amount,
      notes: '',
      _wizard: {
        work_type: answers[0],
        work_detail: answers[1],
        line_items: answers[2],
        conditions: answers[3],
      },
      _basicInfo: basicInfo,
    })
  }

  const handleLimitModalClose = () => {
    setShowLimitModal(false)
    setUsage(getUsage())
  }

  const renderStep = () => {
    if (currentStep === 0) {
      return <StepBasicInfo data={basicInfo} onChange={handleBasicChange} onNext={goNext} profile={profile} />
    }

    const confirmStepIndex = totalSteps - 1
    if (currentStep === confirmStepIndex) {
      return (
        <StepConfirm
          basicInfo={basicInfo}
          answers={answers}
          steps={steps}
          onSubmit={handleSubmit}
          onBack={goBack}
          loading={loading}
          error={error}
        />
      )
    }

    const stepIdx = currentStep - 1
    const stepDef = steps[stepIdx]
    if (!stepDef) return null

    const questionCount = steps.length

    if (stepDef.type === 'line_items') {
      return (
        <StepLineItems
          question={stepDef.label || stepDef.question}
          value={answers[stepIdx]}
          onChange={(val) => handleAnswerChange(stepIdx, val)}
          onNext={goNext}
          onBack={goBack}
          stepIndex={currentStep}
          totalSteps={questionCount}
          workType={answers[0]}
        />
      )
    }

    if (stepDef.type === 'text') {
      return (
        <StepTextInput
          question={stepDef.label || stepDef.question}
          placeholder={stepDef.placeholder}
          value={answers[stepIdx]}
          onChange={(val) => handleAnswerChange(stepIdx, val)}
          onNext={goNext}
          onBack={goBack}
          stepIndex={currentStep}
          totalSteps={questionCount}
        />
      )
    }

    if (stepDef.type === 'select_multi') {
      return (
        <StepQuestion
          stepIndex={currentStep}
          totalSteps={questionCount}
          question={stepDef.label}
          type="select_multi"
          fields={stepDef.fields}
          selected={answers[stepIdx]}
          onSelect={(val) => handleAnswerChange(stepIdx, val)}
          onNext={goNext}
          onBack={goBack}
        />
      )
    }

    return (
      <StepQuestion
        stepIndex={currentStep}
        totalSteps={questionCount}
        question={stepDef.label || stepDef.question}
        options={stepDef.options}
        selected={answers[stepIdx]}
        onSelect={(val) => handleAnswerChange(stepIdx, val)}
        onNext={goNext}
        onBack={goBack}
      />
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* 使用状況バッジ */}
      <div className="flex justify-end mb-3">
        {usage.isUnlimited ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
            スタンダードプラン
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-700 border border-navy-600 text-gray-400 text-xs font-medium">
            今月 {usage.count}/{usage.limit} 回使用
          </span>
        )}
      </div>

      <WizardProgress currentStep={currentStep} totalSteps={totalSteps} />
      <div className="bg-navy-800 rounded-2xl p-6 sm:p-8 border border-navy-700 transition-all duration-300">
        {renderStep()}
      </div>

      <UsageLimitModal isOpen={showLimitModal} onClose={handleLimitModalClose} />
    </div>
  )
}
