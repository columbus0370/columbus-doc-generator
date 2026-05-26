import React from 'react'

export default function StepQuestion({ stepIndex, totalSteps, question, options, selected, onSelect, onNext, onBack }) {
  const canProceed = selected !== null && selected !== undefined && selected !== ''

  return (
    <div className="space-y-6">
      {/* 質問ヘッダー */}
      <div>
        <span className="text-xs font-semibold text-accent uppercase tracking-wider">
          質問 {stepIndex} / {totalSteps}
        </span>
        <h3 className="mt-2 text-lg font-bold text-white leading-snug">{question}</h3>
      </div>

      {/* 選択肢カード */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((option) => {
          const isSelected = selected === option
          return (
            <button
              key={option}
              type="button"
              onClick={() => onSelect(option)}
              className={`text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                isSelected
                  ? 'border-accent bg-accent/10 text-white shadow-lg shadow-accent/10'
                  : 'border-navy-700 bg-navy-900/40 text-gray-300 hover:border-navy-600 hover:text-white hover:bg-navy-900/60'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* チェック丸 */}
                <div
                  className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200 ${
                    isSelected ? 'border-accent bg-accent' : 'border-navy-600'
                  }`}
                >
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-sm font-medium leading-relaxed">{option}</span>
              </div>
            </button>
          )
        })}
      </div>

      {/* ナビゲーション */}
      <div className="flex justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-navy-700 text-gray-400 hover:text-white hover:border-navy-600 transition-colors font-medium text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          戻る
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className="bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-8 py-2.5 rounded-lg transition-colors flex items-center gap-2 text-sm"
        >
          次へ
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
