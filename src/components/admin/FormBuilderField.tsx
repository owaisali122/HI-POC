'use client'

import React, { useCallback, useEffect, useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useField } from '@payloadcms/ui'
import styles from './FormBuilderField.module.scss'
import { BootstrapProvider } from './BootstrapProvider'

// Dynamically import FormBuilder from @formio/react with SSR disabled
// Import directly from components to avoid pulling in SubmissionGrid and other components with dependency issues
const FormBuilder = dynamic(
  () => import('@formio/react/lib/components/FormBuilder').then((mod) => mod.FormBuilder),
  {
    ssr: false,
    loading: () => (
      <div className={styles.formBuilderLoading}>
        <span>Loading Form Builder...</span>
      </div>
    ),
  }
)

interface FormBuilderFieldProps {
  path: string
  field: {
    name: string
    label?: string
    required?: boolean
  }
}

interface FormSchema {
  display?: string
  components: any[]
  [key: string]: any
}

const DEFAULT_SCHEMA: FormSchema = {
  display: 'form',
  components: [],
}

export const FormBuilderField: React.FC<FormBuilderFieldProps> = ({ path }) => {
  const { value, setValue } = useField<FormSchema>({ path })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get the initial schema from value or use default
  // Type as any to match FormType from @formio/react
  const initialSchema = useMemo<any>(() => {
    if (
      value &&
      typeof value === 'object' &&
      'components' in value &&
      Array.isArray(value.components)
    ) {
      return value as any
    }
    return DEFAULT_SCHEMA
  }, [value])

  // Set default value immediately if no value exists
  useEffect(() => {
    if (!value || (typeof value === 'object' && Object.keys(value).length === 0)) {
      setValue(DEFAULT_SCHEMA)
    }
  }, [value, setValue])

  // Handler for schema changes
  const handleChange = useCallback(
    (schema: any) => {
      if (schema && typeof schema === 'object') {
        console.log('FormBuilder onChange:', schema)
        setValue(schema)
        setIsLoading(false)
      }
    },
    [setValue]
  )

  // Builder options configuration
  const builderOptions = useMemo(
    () => ({
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
    }),
    []
  )

  // Handle component ready
  useEffect(() => {
    // Set loading to false after initial render
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

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

        <div className={`${styles.formBuilderContainer} ${isLoading ? styles.hidden : ''}`}>
          <FormBuilder
            initialForm={initialSchema}
            onChange={handleChange}
            options={builderOptions}
            onBuilderReady={(builder) => {
              console.log('FormBuilder ready:', builder)
              setIsLoading(false)
            }}
          />
        </div>
      </div>
    </BootstrapProvider>
  )
}

export default FormBuilderField
