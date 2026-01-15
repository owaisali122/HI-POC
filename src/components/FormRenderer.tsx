'use client'

import React, { useState, useEffect, useRef } from 'react'

interface FormSchema {
  display?: string
  components: any[]
  [key: string]: any
}

interface FormRendererProps {
  schema: FormSchema
  onSubmit: (data: object) => Promise<void>
  onError?: (error: Error) => void
  className?: string
}

// Extend window to include Formio
declare global {
  interface Window {
    Formio?: {
      createForm: (element: HTMLElement, schema: object, options?: object) => Promise<any>
    }
  }
}

export const FormRenderer: React.FC<FormRendererProps> = ({
  schema,
  onSubmit,
  onError,
  className = '',
}) => {
  const formRef = useRef<HTMLDivElement>(null)
  const formInstanceRef = useRef<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const initRef = useRef(false)

  // Load Formio from CDN
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    // Check if already loaded
    if (window.Formio) return

    // Load CSS
    const cssLink = document.createElement('link')
    cssLink.rel = 'stylesheet'
    cssLink.href = 'https://cdn.jsdelivr.net/npm/formiojs@4.21.7/dist/formio.full.min.css'
    document.head.appendChild(cssLink)

    // Load JS
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/formiojs@4.21.7/dist/formio.full.min.js'
    script.async = true
    document.head.appendChild(script)

    return () => {
      // Cleanup not needed for CDN scripts
    }
  }, [])

  // Initialize form when Formio is available
  useEffect(() => {
    if (initRef.current) return
    
    const initForm = async () => {
      if (!formRef.current) {
        setError('Form container not found')
        setIsLoading(false)
        return
      }

      // Wait for Formio to be available
      let attempts = 0
      const maxAttempts = 50 // 5 seconds max wait
      
      while (!window.Formio && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 100))
        attempts++
      }

      if (!window.Formio) {
        setError('Failed to load Form.io library')
        setIsLoading(false)
        return
      }

      try {
        initRef.current = true
        
        // Clear container
        formRef.current.innerHTML = ''

        // Ensure schema has required structure
        const formSchema = {
          display: schema?.display || 'form',
          components: schema?.components || [],
        }

        // Create form
        const form = await window.Formio.createForm(formRef.current, formSchema, {
          noAlerts: true,
          readOnly: false,
        })

        formInstanceRef.current = form

        // Handle submission
        form.on('submit', async (submission: { data: object }) => {
          setIsSubmitting(true)
          setError(null)
          try {
            await onSubmit(submission.data)
          } catch (err) {
            const submitError = err instanceof Error ? err : new Error('Submission failed')
            setError(submitError.message)
            onError?.(submitError)
          } finally {
            setIsSubmitting(false)
          }
        })

        form.on('error', (errors: any) => {
          console.error('Form validation errors:', errors)
        })

        setIsLoading(false)
      } catch (err) {
        console.error('Form init error:', err)
        setError(`Failed to load form: ${err instanceof Error ? err.message : 'Unknown error'}`)
        setIsLoading(false)
      }
    }

    // Start initialization
    if (typeof window !== 'undefined') {
      initForm()
    }

    return () => {
      if (formInstanceRef.current) {
        try {
          formInstanceRef.current.destroy()
        } catch (e) {
          // Ignore
        }
      }
    }
  }, [schema, onSubmit, onError])

  if (error) {
    return (
      <div className="form-error" style={{ 
        padding: '24px', 
        color: '#dc2626', 
        textAlign: 'center',
        background: '#fef2f2',
        borderRadius: '8px',
        border: '1px solid #fecaca'
      }}>
        <p style={{ margin: 0, fontWeight: 500 }}>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            marginTop: '12px',
            padding: '8px 16px',
            background: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Reload Page
        </button>
      </div>
    )
  }

  return (
    <div className={`form-renderer ${className}`}>
      <style>{`
        .form-renderer {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .form-renderer .formio-form {
          max-width: 100%;
        }
        .form-renderer .formio-component {
          margin-bottom: 1.25rem;
        }
        .form-renderer .form-group {
          margin-bottom: 1.25rem;
        }
        .form-renderer .control-label,
        .form-renderer label.col-form-label,
        .form-renderer .field-label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #374151;
          font-size: 0.875rem;
        }
        .form-renderer .form-control {
          width: 100%;
          padding: 0.75rem 1rem;
          font-size: 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 0.5rem;
          transition: border-color 0.15s, box-shadow 0.15s;
          background: white;
        }
        .form-renderer .form-control:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }
        .form-renderer .form-check {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .form-renderer .form-check-input {
          width: 1.25rem;
          height: 1.25rem;
          accent-color: #3b82f6;
        }
        .form-renderer .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          font-weight: 600;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.15s;
          margin-right: 0.5rem;
          margin-top: 0.5rem;
        }
        .form-renderer .btn-primary {
          color: white !important;
          background: linear-gradient(135deg, #3b82f6, #2563eb) !important;
          border: none !important;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
        }
        .form-renderer .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
        }
        .form-renderer .btn-secondary,
        .form-renderer .btn-danger {
          color: #374151;
          background: #f3f4f6;
          border: 1px solid #d1d5db;
        }
        .form-renderer .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        .form-renderer .formio-errors,
        .form-renderer .error {
          color: #dc2626;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }
        .form-renderer .has-error .form-control {
          border-color: #dc2626;
        }
        .form-renderer .field-required::after {
          content: ' *';
          color: #dc2626;
        }
        .form-renderer select.form-control {
          appearance: none;
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 0.75rem center;
          background-repeat: no-repeat;
          background-size: 1.5em 1.5em;
          padding-right: 2.5rem;
        }
        .form-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 200px;
          color: #6b7280;
        }
        .form-loading::before {
          content: '';
          width: 24px;
          height: 24px;
          border: 3px solid #e5e7eb;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-right: 12px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {isLoading && (
        <div className="form-loading">
          <span>Loading form...</span>
        </div>
      )}

      <div
        ref={formRef}
        style={{
          display: isLoading ? 'none' : 'block',
          opacity: isSubmitting ? 0.6 : 1,
          pointerEvents: isSubmitting ? 'none' : 'auto',
          transition: 'opacity 0.2s',
        }}
      />
    </div>
  )
}

export default FormRenderer
