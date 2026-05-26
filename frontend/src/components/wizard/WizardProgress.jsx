import React from 'react'

// totalSteps = 5 (Step0 基本情報, Step1〜3 質問, Step4 確認)
const STEP_LABELS = ['基本情報', '質問1', '質問2', '質問3', '確認']

export default function WizardProgress({ currentStep }) {
  const totalSteps = STEP_LABELS.length

  return (
    <div className="w-full mb-8">
      {/* ステップインジケーター */}
      <div className="flex items-center justify-between relative">
        {/* 背景の連結ライン */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-navy-700 z-0" />
        {/* 進捗ライン */}
        <div
          className="absolute top-4 left-0 h-0.5 bg-accent z-0 transition-all duration-500"
          style={{ width: `${(currentStep / (totalSteps - 1)) * 100}%` }}
        />

        {STEP_LABELS.map((label, index) => {
          const isDone = index < currentStep
          const isActive = index === currentStep
          return (
            <div key={label} className="flex flex-col items-center z-10">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${
                  isDone
                    ? 'bg-accent border-accent text-white'
                    : isActive
                    ? 'bg-navy-800 border-accent text-accent'
                    : 'bg-navy-800 border-navy-700 text-gray-500'
                }`}
              >
                {isDone ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={`mt-1.5 text-xs font-medium hidden sm:block transition-colors duration-300 ${
                  isActive ? 'text-accent' : isDone ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
