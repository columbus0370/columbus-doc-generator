import React from 'react'
import { WIZARD_STEPS, buildContent } from '../../config/wizardConfig'
import WizardProgress from './WizardProgress'
import StepBasicInfo from './StepBasicInfo'
import StepQuestion from './StepQuestion'
import StepConfirm from './StepConfirm'

const TOTAL_STEPS = 5 // Step0 + Step1,2,3 + Step4

const initialBasicInfo = {
  doc_type: 'estimate',
  client_name: '',
  company_name: '',
  amount: '',
}

export default function WizardContainer({ onGenerate, loading, error }) {
  const [currentStep, setCurrentStep] = React.useState(0)
  const [basicInfo, setBasicInfo] = React.useState(initialBasicInfo)
  // answers[0] = Step1 の選択, answers[1] = Step2, answers[2] = Step3
  const [answers, setAnswers] = React.useState(['', '', ''])

  // 書類種別が変わったら回答をリセット
  const handleBasicChange = (field, value) => {
    setBasicInfo((prev) => ({ ...prev, [field]: value }))
    if (field === 'doc_type') {
      setAnswers(['', '', ''])
    }
  }

  const handleAnswerSelect = (stepIndex, value) => {
    setAnswers((prev) => {
      const next = [...prev]
      next[stepIndex] = value
      return next
    })
  }

  const goNext = () => setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS - 1))
  const goBack = () => setCurrentStep((s) => Math.max(s - 1, 0))

  const handleSubmit = () => {
    const content = buildContent(basicInfo.doc_type, answers)
    const payload = {
      doc_type: basicInfo.doc_type,
      client_name: basicInfo.client_name,
      company_name: basicInfo.company_name,
      content,
      amount: basicInfo.amount,
      notes: '',
    }
    onGenerate(payload)
  }

  const steps = WIZARD_STEPS[basicInfo.doc_type] ?? []

  const renderStep = () => {
    // Step0: 基本情報
    if (currentStep === 0) {
      return (
        <StepBasicInfo
          data={basicInfo}
          onChange={handleBasicChange}
          onNext={goNext}
        />
      )
    }

    // Step1〜3: 書類固有の質問
    if (currentStep >= 1 && currentStep <= 3) {
      const stepDef = steps[currentStep - 1]
      if (!stepDef) return null
      return (
        <StepQuestion
          stepIndex={currentStep}
          question={stepDef.question}
          options={stepDef.options}
          selected={answers[currentStep - 1]}
          onSelect={(val) => handleAnswerSelect(currentStep - 1, val)}
          onNext={goNext}
          onBack={goBack}
        />
      )
    }

    // Step4: 確認
    if (currentStep === 4) {
      return (
        <StepConfirm
          basicInfo={basicInfo}
          answers={answers}
          onSubmit={handleSubmit}
          onBack={goBack}
          loading={loading}
          error={error}
        />
      )
    }

    return null
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <WizardProgress currentStep={currentStep} />
      <div className="bg-navy-800 rounded-2xl p-6 sm:p-8 border border-navy-700 transition-all duration-300">
        {renderStep()}
      </div>
    </div>
  )
}
