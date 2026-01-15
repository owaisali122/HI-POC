'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useField } from '@payloadcms/ui'

// Import Form.io styles
import 'formiojs/dist/formio.full.min.css'

interface FormBuilderFieldProps {
  path: string
  field: {
    name: string
    label?: string
    required?: boolean
  }
}

const DEFAULT_SCHEMA = {
  display: 'form',
  components: [],
}

export const FormBuilderField: React.FC<FormBuilderFieldProps> = ({ path }) => {
  const { value, setValue } = useField<object>({ path })
  const builderRef = useRef<HTMLDivElement>(null)
  const builderInstanceRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isInitializedRef = useRef(false)

  // Set default value immediately if no value exists
  useEffect(() => {
    if (!value && !isInitializedRef.current) {
      setValue(DEFAULT_SCHEMA)
    }
  }, [value, setValue])

  const initBuilder = useCallback(async () => {
    if (!builderRef.current) return

    try {
      // Dynamically import Form.io to avoid SSR issues
      const FormioModule = await import('formiojs')
      const Formio = (FormioModule as any).default || FormioModule
      const FormBuilder = Formio.FormBuilder

      // Destroy existing instance if any
      if (builderInstanceRef.current) {
        try {
          builderInstanceRef.current.destroy()
        } catch (e) {
          // Ignore destroy errors
        }
      }

      // Clear the container
      builderRef.current.innerHTML = ''

      // Initialize the builder with current value or default schema
      const initialSchema = value && typeof value === 'object' && Object.keys(value).length > 0
        ? value
        : DEFAULT_SCHEMA

      // Create the builder instance
      const builder = new FormBuilder(builderRef.current, initialSchema, {
        builder: {
          basic: {
            default: true,
            components: {
              textfield: true,
              textarea: true,
              number: true,
              password: true,
              checkbox: true,
              selectboxes: true,
              select: true,
              radio: true,
              button: true,
            },
          },
          advanced: {
            default: true,
            components: {
              email: true,
              url: true,
              phoneNumber: true,
              datetime: true,
              day: true,
              time: true,
              currency: true,
              signature: true,
            },
          },
          layout: {
            default: true,
            components: {
              htmlelement: true,
              content: true,
              columns: true,
              fieldset: true,
              panel: true,
              well: true,
            },
          },
          data: {
            default: false,
          },
          premium: false,
        },
      })

      // Wait for builder to be ready
      await builder.ready

      builderInstanceRef.current = builder
      isInitializedRef.current = true

      // Set the initial value to ensure it's saved
      if (!value || Object.keys(value).length === 0) {
        setValue(builder.schema)
      }

      // Listen for schema changes
      builder.on('change', (schema: object) => {
        if (schema && typeof schema === 'object') {
          setValue(schema)
        }
      })

      // Also listen for component add/remove events
      builder.on('addComponent', () => {
        setTimeout(() => {
          if (builderInstanceRef.current?.schema) {
            setValue(builderInstanceRef.current.schema)
          }
        }, 100)
      })

      builder.on('removeComponent', () => {
        setTimeout(() => {
          if (builderInstanceRef.current?.schema) {
            setValue(builderInstanceRef.current.schema)
          }
        }, 100)
      })

      builder.on('updateComponent', () => {
        setTimeout(() => {
          if (builderInstanceRef.current?.schema) {
            setValue(builderInstanceRef.current.schema)
          }
        }, 100)
      })

      setIsLoading(false)
    } catch (err) {
      console.error('Error initializing Form.io builder:', err)
      setError('Failed to load form builder. Please refresh the page.')
      setIsLoading(false)
    }
  }, []) // Remove value dependency to prevent re-initialization

  useEffect(() => {
    initBuilder()

    return () => {
      if (builderInstanceRef.current) {
        try {
          builderInstanceRef.current.destroy()
        } catch (e) {
          // Ignore destroy errors
        }
      }
    }
  }, [initBuilder])

  if (error) {
    return (
      <div className="form-builder-error" style={{ 
        padding: '20px', 
        color: '#dc2626',
        background: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        margin: '16px 0'
      }}>
        {error}
      </div>
    )
  }

  return (
    <div className="form-builder-wrapper">
      <style>{`
        .form-builder-wrapper {
          margin: 16px 0;
          border: 1px solid var(--theme-elevation-150);
          border-radius: 8px;
          overflow: hidden;
        }
        .form-builder-wrapper .formio-builder {
          background: #ffffff;
          min-height: 500px;
        }
        .form-builder-wrapper .formbuilder {
          background: #ffffff;
        }
        .form-builder-wrapper .builder-sidebar {
          background: #f8fafc;
        }
        .form-builder-wrapper .formio-component {
          margin: 0;
        }
        .form-builder-wrapper .drag-container {
          padding: 10px;
        }
        .form-builder-wrapper .formio-component-textfield,
        .form-builder-wrapper .formio-component-textarea,
        .form-builder-wrapper .formio-component-email,
        .form-builder-wrapper .formio-component-number,
        .form-builder-wrapper .formio-component-password,
        .form-builder-wrapper .formio-component-select,
        .form-builder-wrapper .formio-component-radio,
        .form-builder-wrapper .formio-component-checkbox,
        .form-builder-wrapper .formio-component-button {
          padding: 8px;
          margin: 4px 0;
          border: 1px dashed #e2e8f0;
          border-radius: 4px;
        }
        .form-builder-wrapper .formio-component:hover {
          border-color: #3b82f6;
        }
        .form-builder-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 500px;
          background: #f8fafc;
          color: #64748b;
          font-size: 1rem;
        }
        .form-builder-loading::before {
          content: '';
          width: 24px;
          height: 24px;
          border: 3px solid #e2e8f0;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-right: 12px;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      {isLoading && (
        <div className="form-builder-loading">
          <span>Loading Form Builder...</span>
        </div>
      )}

      <div
        ref={builderRef}
        style={{ display: isLoading ? 'none' : 'block' }}
      />
    </div>
  )
}

export default FormBuilderField
