'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useField } from '@payloadcms/ui'
import styles from './FormBuilderField.module.scss'
import { BootstrapProvider } from './BootstrapProvider'

// Form.io styles are now loaded by BootstrapProvider

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
      <div className={styles.formBuilderError}>
        {error}
      </div>
    )
  }

  return (
    <BootstrapProvider>
      <div
        className={`formio-builder formbuilder ${styles.formBuilderWrapper}`}
        data-form-builder-instance
      >
        {isLoading && (
          <div className={styles.formBuilderLoading}>
            <span>Loading Form Builder...</span>
          </div>
        )}

        <div
          ref={builderRef}
          className={`${styles.formBuilderContainer} ${isLoading ? styles.hidden : ''}`}
        />
      </div>
    </BootstrapProvider>
  )
}

export default FormBuilderField
