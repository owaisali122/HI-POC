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

type DisplayType = 'form' | 'wizard'

/** Deep clone so Payload sees a new value and enables Save / marks form dirty */
function cloneSchema(schema: object): object {
  try {
    return JSON.parse(JSON.stringify(schema))
  } catch {
    return { ...schema, components: Array.isArray((schema as { components?: unknown[] }).components) ? [...(schema as { components: unknown[] }).components] : [] }
  }
}

export const FormBuilderField: React.FC<FormBuilderFieldProps> = ({ path }) => {
  const { value, setValue } = useField<object>({ path })
  const builderRef = useRef<HTMLDivElement>(null)
  const builderInstanceRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isInitializedRef = useRef(false)
  const reinitWithSchemaRef = useRef<((schema: object) => Promise<void>) | null>(null)
  const valueRef = useRef(value)
  valueRef.current = value

  // Current display type from schema (for the dropdown)
  const displayType: DisplayType =
    (value && typeof value === 'object' && 'display' in value && (value.display === 'wizard' || value.display === 'form'))
      ? (value.display as DisplayType)
      : 'form'

  // Set default value immediately if no value exists
  useEffect(() => {
    if (!value && !isInitializedRef.current) {
      setValue(DEFAULT_SCHEMA)
    }
  }, [value, setValue])

  const initBuilder = useCallback(async (overrideSchema?: object) => {
    if (!builderRef.current) return

    try {
      // Register custom components first
      const { registerCustomComponents, getBuilderConfig } = await import('../../utils/formio-component-registry')
      await registerCustomComponents()

      // Dynamically import Form.io to avoid SSR issues
      const FormioModule = await import('formiojs')
      const FormioInstance = (FormioModule as any).default || FormioModule
      const FormBuilder = FormioInstance.FormBuilder

      // Destroy existing instance if any
      if (builderInstanceRef.current) {
        try {
          builderInstanceRef.current.destroy()
        } catch (e) {
          // Ignore destroy errors
        }
        builderInstanceRef.current = null
      }

      // Clear the container
      builderRef.current.innerHTML = ''

      // Schema: override (when switching display) or current value or default
      const currentValue = valueRef.current
      const initialSchema =
        overrideSchema ??
        (currentValue && typeof currentValue === 'object' && Object.keys(currentValue).length > 0
          ? currentValue
          : DEFAULT_SCHEMA)

      // Ensure display is set so Form.io picks WebformBuilder vs WizardBuilder
      const schemaWithDisplay = {
        ...initialSchema,
        display: initialSchema && typeof initialSchema === 'object' && 'display' in initialSchema
          ? (initialSchema as { display?: string }).display
          : 'form',
      }
      if (schemaWithDisplay.display !== 'form' && schemaWithDisplay.display !== 'wizard') {
        schemaWithDisplay.display = 'form'
      }

      // Get builder config with custom components
      const builderConfig = getBuilderConfig()

      // Create the builder (Form wrapper); .ready resolves to the inner builder (WizardBuilder / WebformBuilder)
      const formBuilder = new FormBuilder(builderRef.current, schemaWithDisplay, builderConfig)
      const instance = await formBuilder.ready

      builderInstanceRef.current = instance
      isInitializedRef.current = true

      // Get schema from inner instance (Form has no .schema; WizardBuilder/WebformBuilder have .schema or .form)
      const getSchemaFromInstance = (): object | null => {
        try {
          const inst = builderInstanceRef.current
          if (!inst) return null
          // WizardBuilder: .form is _form (has display + components); .schema getter can throw before attach
          if (inst.form && typeof inst.form === 'object' && Array.isArray((inst.form as { components?: unknown }).components)) {
            return { ...(inst.form as object), display: schemaWithDisplay.display }
          }
          if (inst.schema && typeof inst.schema === 'object') {
            return inst.schema as object
          }
          return null
        } catch {
          return null
        }
      }

      // Sync builder → field with a deep clone so Payload sees a new value (enables Save, marks form dirty)
      const syncSchemaToField = (schema: object) => {
        if (!schema || typeof schema !== 'object') return
        const withDisplay = 'display' in schema ? schema : { ...schema, display: schemaWithDisplay.display }
        setValue(cloneSchema(withDisplay))
      }

      // Always sync builder state to field after ready (e.g. Wizard adds default first page but doesn't emit 'change')
      const schemaToSave = getSchemaFromInstance()
      if (schemaToSave && Array.isArray((schemaToSave as { components?: unknown[] }).components)) {
        syncSchemaToField(schemaToSave)
      }

      // Listen on the inner instance (Form does not forward 'change' from WizardBuilder/WebformBuilder)
      instance.on('change', (schema: object) => {
        if (schema && typeof schema === 'object') syncSchemaToField(schema)
      })

      // saveComponent = user saved the edit dialog; ensure we persist and mark form dirty
      instance.on('saveComponent', () => {
        setTimeout(() => {
          const s = getSchemaFromInstance()
          if (s) syncSchemaToField(s)
        }, 50)
      })

      instance.on('addComponent', () => {
        setTimeout(() => {
          const s = getSchemaFromInstance()
          if (s) syncSchemaToField(s)
        }, 100)
      })

      instance.on('removeComponent', () => {
        setTimeout(() => {
          const s = getSchemaFromInstance()
          if (s) syncSchemaToField(s)
        }, 100)
      })

      instance.on('updateComponent', () => {
        setTimeout(() => {
          const s = getSchemaFromInstance()
          if (s) syncSchemaToField(s)
        }, 100)
      })

      setIsLoading(false)
    } catch (err) {
      console.error('Error initializing Form.io builder:', err)
      setError('Failed to load form builder. Please refresh the page.')
      setIsLoading(false)
    }
  }, [setValue])

  // Expose reinit so "Display as" dropdown can switch builder type
  reinitWithSchemaRef.current = useCallback(async (schema: object) => {
    setIsLoading(true)
    setError(null)
    await initBuilder(schema)
  }, [initBuilder])

  useEffect(() => {
    initBuilder()
    return () => {
      if (builderInstanceRef.current) {
        try {
          builderInstanceRef.current.destroy()
        } catch (e) {
          // Ignore
        }
      }
    }
  }, [initBuilder])

  const handleDisplayChange = useCallback(
    (newDisplay: DisplayType) => {
      const currentSchema =
        value && typeof value === 'object' && Object.keys(value).length > 0 ? { ...value } : { ...DEFAULT_SCHEMA }
      const newSchema = cloneSchema({ ...currentSchema, display: newDisplay })
      setValue(newSchema)
      reinitWithSchemaRef.current?.(newSchema)
    },
    [value, setValue],
  )

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
        <div className={styles.formBuilderToolbar}>
          <label htmlFor="formio-display-as" className={styles.formBuilderToolbarLabel}>
            Display as
          </label>
          <select
            id="formio-display-as"
            className={styles.formBuilderDisplaySelect}
            value={displayType}
            onChange={(e) => handleDisplayChange(e.target.value as DisplayType)}
            aria-label="Form display type"
          >
            <option value="form">Form</option>
            <option value="wizard">Wizard</option>
          </select>
          <span className={styles.formBuilderToolbarHint}>
            {displayType === 'wizard'
              ? 'Use Panels as pages; add pages with + PAGE.'
              : 'Single-page form.'}
          </span>
        </div>

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
