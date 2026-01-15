'use client'

import React, { useState } from 'react'
import { FormRenderer } from './FormRenderer'

interface FormSchema {
  display?: string
  components: any[]
  [key: string]: any
}

interface FormStep {
  id: string
  title: string
  description?: string
  schema: FormSchema
}

interface FormStepperProps {
  steps: FormStep[]
  formId: string
  onComplete?: (allData: object[]) => void
  successMessage?: string
}

export const FormStepper: React.FC<FormStepperProps> = ({
  steps,
  formId,
  onComplete,
  successMessage = 'Thank you for your submission!',
}) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [stepData, setStepData] = useState<object[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStepSubmit = async (data: object) => {
    const newStepData = [...stepData]
    newStepData[currentStep] = data
    setStepData(newStepData)

    if (currentStep < steps.length - 1) {
      // Move to next step
      setCurrentStep(currentStep + 1)
    } else {
      // Final step - submit all data
      try {
        const response = await fetch('/api/forms/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            formId,
            data: newStepData.length === 1 ? newStepData[0] : newStepData,
          }),
        })

        if (!response.ok) {
          const result = await response.json()
          throw new Error(result.error || 'Submission failed')
        }

        setIsComplete(true)
        onComplete?.(newStepData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Submission failed')
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  if (isComplete) {
    return (
      <div className="form-stepper-complete">
        <style>{`
          .form-stepper-complete {
            text-align: center;
            padding: 4rem 2rem;
            background: linear-gradient(135deg, #ecfdf5, #d1fae5);
            border-radius: 1rem;
          }
          .complete-icon {
            width: 80px;
            height: 80px;
            margin: 0 auto 1.5rem;
            background: #10b981;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .complete-icon svg {
            width: 40px;
            height: 40px;
            color: white;
          }
          .complete-message {
            font-size: 1.5rem;
            font-weight: 600;
            color: #065f46;
          }
        `}</style>
        <div className="complete-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="complete-message">{successMessage}</p>
      </div>
    )
  }

  const isSingleStep = steps.length === 1
  const currentStepData = steps[currentStep]

  return (
    <div className="form-stepper">
      <style>{`
        .form-stepper {
          max-width: 800px;
          margin: 0 auto;
        }
        
        /* Progress Steps */
        .stepper-progress {
          display: flex;
          justify-content: center;
          margin-bottom: 3rem;
          padding: 0 1rem;
        }
        .step-indicator {
          display: flex;
          align-items: center;
        }
        .step-dot {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.875rem;
          transition: all 0.3s;
        }
        .step-dot.active {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: white;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        .step-dot.completed {
          background: #10b981;
          color: white;
        }
        .step-dot.pending {
          background: #e5e7eb;
          color: #9ca3af;
        }
        .step-line {
          width: 60px;
          height: 3px;
          background: #e5e7eb;
          margin: 0 0.5rem;
        }
        .step-line.completed {
          background: #10b981;
        }
        
        /* Step Content */
        .step-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .step-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 0.5rem;
        }
        .step-description {
          color: #6b7280;
          font-size: 1rem;
        }
        
        /* Form Container */
        .step-form-container {
          background: white;
          border-radius: 1rem;
          padding: 2rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }
        
        /* Navigation */
        .stepper-nav {
          display: flex;
          justify-content: space-between;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e5e7eb;
        }
        .btn-back {
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          font-weight: 500;
          color: #374151;
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.15s;
        }
        .btn-back:hover {
          background: #f9fafb;
          border-color: #9ca3af;
        }
        .btn-back:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        /* Error */
        .stepper-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          padding: 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1.5rem;
          text-align: center;
        }
      `}</style>

      {/* Progress Indicator */}
      {!isSingleStep && (
        <div className="stepper-progress">
          {steps.map((step, index) => (
            <div key={step.id} className="step-indicator">
              <div
                className={`step-dot ${
                  index === currentStep ? 'active' : index < currentStep ? 'completed' : 'pending'
                }`}
              >
                {index < currentStep ? '✓' : index + 1}
              </div>
              {index < steps.length - 1 && (
                <div className={`step-line ${index < currentStep ? 'completed' : ''}`} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Step Header */}
      <div className="step-header">
        <h2 className="step-title">{currentStepData.title}</h2>
        {currentStepData.description && (
          <p className="step-description">{currentStepData.description}</p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="stepper-error">
          {error}
        </div>
      )}

      {/* Form */}
      <div className="step-form-container">
        <FormRenderer
          key={currentStep}
          schema={currentStepData.schema}
          onSubmit={handleStepSubmit}
          onError={(err) => setError(err.message)}
        />

        {/* Navigation for multi-step */}
        {!isSingleStep && currentStep > 0 && (
          <div className="stepper-nav">
            <button
              type="button"
              className="btn-back"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              ← Back
            </button>
            <div /> {/* Spacer */}
          </div>
        )}
      </div>
    </div>
  )
}

export default FormStepper
