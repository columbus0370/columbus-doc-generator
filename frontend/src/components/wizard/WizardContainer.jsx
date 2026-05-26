import React from 'react'
import { WIZARD_STEPS, buildContent } from '../../config/wizardConfig'
import { formatProfileForPrompt } from '../../hooks/useBusinessProfile'
import WizardProgress from './WizardProgress'
import StepBasicInfo from './StepBasicInfo'
import StepQuestion from './StepQuestion'
import StepLineItems from './StepLineItems'
import StepTextInput from './StepTextInput'
import StepConfirm from './StepConfirm'

const makeInitialBasicInfo = (profile) => ({
  doc_type: 'estimate',
  client_name: '',
  company_name: profile?.business_name ?? '',
  amount: '',
})

export default function WizardContainer({ onGenerate, loading, error, profile }) {
  const [currentStep, setCurrentStep] = React.useState(0)
  const [basicInfo, setBasicInfo] = React.useState(() => makeInitialBasicInfo(profile))

  const steps = WIZARD_STEPS[basicInfo.doc_type] ?? []
  // Step0 = 基本情報, Steps 1..N = questions, Step N+1 = 確認
  const totalSteps = steps.length + 2

  const [answers, setAnswers] = React.useState(() => new Array(steps.length).fill(null))

  const handleBasicChange = (field, value) => {
    setBasicInfo((prev) => ({ ...prev, [field]: value }))
    if (field === 'doc_type') {
      const newSteps = WIZARD_STEPS[value] ?? []
      setAnswers(new Array(newSteps.length).fill(null))
      setCurrentStep(0)
    }
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
    const content = buildContent(basicInfo.doc_type, answers)
    // Use full profile (name + address + tel + email) if available, otherwise wizard input
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
    })
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
          question={stepDef.question}
          value={answers[stepIdx]}
          onChange={(val) => handleAnswerChange(stepIdx, val)}
          onNext={goNext}
          onBack={goBack}
          stepIndex={currentStep}
          totalSteps={questionCount}
        />
      )
    }

    if (stepDef.type === 'text') {
      return (
        <StepTextInput
          question={stepDef.question}
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

    // default: select
    return (
      <StepQuestion
        stepIndex={currentStep}
        totalSteps={questionCount}
        question={stepDef.question}
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
      <WizardProgress currentStep={currentStep} totalSteps={totalSteps} />
      <div className="bg-navy-800 rounded-2xl p-6 sm:p-8 border border-navy-700 transition-all duration-300">
        {renderStep()}
      </div>
    </div>
  )
}
