"use client"

import { Sparkles, CheckCircle, Loader2 } from 'lucide-react'
import { Badge } from './ui/badge'

interface AIIndicatorProps {
  stage: 'analyzing' | 'complete' | 'idle'
  module?: string
  confidence?: number
}

export function AIIndicator({ stage, module, confidence }: AIIndicatorProps) {
  if (stage === 'idle') return null

  return (
    <div className="flex items-center gap-2 text-sm">
      {stage === 'analyzing' && (
        <>
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          <span className="text-blue-600">AI analyzing{module ? `: ${module}` : ''}...</span>
        </>
      )}
      {stage === 'complete' && (
        <>
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-green-600">AI analysis complete</span>
          {confidence && (
            <Badge variant="outline" className="ml-2">
              {(confidence * 100).toFixed(0)}% confidence
            </Badge>
          )}
        </>
      )}
    </div>
  )
}

interface AIProcessStepsProps {
  currentStep: number
  steps: string[]
}

export function AIProcessSteps({ currentStep, steps }: AIProcessStepsProps) {
  return (
    <div className="space-y-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-5 w-5 text-blue-600" />
        <p className="font-medium text-blue-900">AI Processing Pipeline</p>
      </div>
      <div className="space-y-2">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center gap-2">
            {index < currentStep ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : index === currentStep ? (
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            ) : (
              <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
            )}
            <span className={`text-sm ${
              index < currentStep ? 'text-green-600' : 
              index === currentStep ? 'text-blue-600 font-medium' : 
              'text-gray-500'
            }`}>
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

interface AIUsageStatsProps {
  tokensUsed?: number
  processingTime?: number
  model?: string
}

export function AIUsageStats({ tokensUsed, processingTime, model }: AIUsageStatsProps) {
  return (
    <div className="flex items-center gap-4 text-xs text-muted-foreground">
      {model && (
        <div className="flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          <span>{model}</span>
        </div>
      )}
      {processingTime && (
        <span>⚡ {processingTime}ms</span>
      )}
      {tokensUsed && (
        <span>📊 {tokensUsed.toLocaleString()} tokens</span>
      )}
    </div>
  )
}
