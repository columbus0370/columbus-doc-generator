import React from 'react'

export default function WizardProgress({ currentStep, totalSteps }) {
  const labels = [
    '基本情報',
    ...Array.from({ length: totalSteps - 2 }, (_, i) => `Q${i + 1}`),
    '確認',
  ]

  // Use smaller circles when many steps to avoid overcrowding
  const circleClass = totalSteps > 6
    ? 'w-6 h-6 text-xs'
    : 'w-8 h-8 text-sm'

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between relative">
        {/* Background line */}
        <div className="absolute top-3 left-0 right-0 h-0.5 bg-navy-700 z-0" style={totalSteps > 6 ? {} : { top: '1rem' }} />
        {/* Progress line */}
        <div
          className="absolute h-0.5 bg-accent z-0 transition-all duration-500"
          style={{
            top: totalSteps > 6 ? '0.75rem' : '1rem',
            width: `${(currentStep / (totalSteps - 1)) * 100}%`,
          }}
        />

        {labels.map((label, index) => {
          const isDone = index < currentStep
          const isActive = index === currentStep
          return (
            <div key={label} className="flex flex-col items-center z-10">
              <div
                className={`${circleClass} rounded-full flex items-center justify-center font-bold border-2 transition-all duration-300 ${
                  isDone
                    ? 'bg-accent border-accent text-white'
                    : isActive
                    ? 'bg-navy-800 border-accent text-accent'
                    : 'bg-navy-800 border-navy-700 text-gray-500'
                }`}
              >
                {isDone ? (
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
