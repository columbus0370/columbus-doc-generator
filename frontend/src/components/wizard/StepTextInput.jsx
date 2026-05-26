import React from 'react'

export default function StepTextInput({ question, placeholder, value, onChange, onNext, onBack, stepIndex, totalSteps }) {
  const canProceed = value && value.trim().length > 0

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-semibold text-accent uppercase tracking-wider">
          質問 {stepIndex} / {totalSteps}
        </span>
        <h3 className="mt-2 text-lg font-bold text-white leading-snug">{question}</h3>
        <p className="text-xs text-gray-500 mt-1">具体的に入力するほど精度の高い書類が生成されます</p>
      </div>

      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || ''}
        rows={5}
        className="w-full bg-navy-900/60 border border-navy-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-accent resize-none transition-colors leading-relaxed"
      />

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
