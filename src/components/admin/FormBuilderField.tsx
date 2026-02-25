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

const REFERENCE_FIELD_TYPE = 'fieldReference'

/** FormIO types that are layout/group only – not referenceable as a single field. */
const REFERENCE_EXCLUDED_TYPES = new Set([
  'panel',
  'fieldset',
  'columns',
  'tabs',
  'table',
  'well',
  'content',
  'htmlelement',
  'form',
  'datagrid',
  'editgrid',
  'container',
  'nested',
  REFERENCE_FIELD_TYPE,
])

/** Collect component keys from form (recursive: components, panels, tabs). */
function collectComponentKeys(components: unknown[], excludeKey?: string): string[] {
  const keys: string[] = []
  if (!Array.isArray(components)) return keys
  for (const c of components) {
    if (typeof c !== 'object' || c === null) continue
    const comp = c as Record<string, unknown>
    if (typeof comp.key === 'string' && comp.key && comp.key !== excludeKey) {
      keys.push(comp.key)
    }
    if (Array.isArray(comp.components)) {
      keys.push(...collectComponentKeys(comp.components as unknown[], excludeKey))
    }
    const tabs = comp.tabs as Array<{ components?: unknown[] }> | undefined
    if (Array.isArray(tabs)) {
      for (const tab of tabs) {
        if (tab && Array.isArray(tab.components)) {
          keys.push(...collectComponentKeys(tab.components, excludeKey))
        }
      }
    }
  }
  return [...new Set(keys)]
}

/** Collect only field keys (exclude layout/group types) for Reference Field dropdown. */
function collectFieldKeysForReference(components: unknown[], excludeKey?: string): string[] {
  const keys: string[] = []
  if (!Array.isArray(components)) return keys
  for (const c of components) {
    if (typeof c !== 'object' || c === null) continue
    const comp = c as Record<string, unknown>
    const type = comp.type as string | undefined
    if (
      typeof comp.key === 'string' &&
      comp.key &&
      comp.key !== excludeKey &&
      type &&
      !REFERENCE_EXCLUDED_TYPES.has(type)
    ) {
      keys.push(comp.key)
    }
    if (Array.isArray(comp.components)) {
      keys.push(...collectFieldKeysForReference(comp.components as unknown[], excludeKey))
    }
    const tabs = comp.tabs as Array<{ components?: unknown[] }> | undefined
    if (Array.isArray(tabs)) {
      for (const tab of tabs) {
        if (tab && Array.isArray(tab.components)) {
          keys.push(...collectFieldKeysForReference(tab.components, excludeKey))
        }
      }
    }
    const columns = comp.columns as Array<{ components?: unknown[] }> | undefined
    if (Array.isArray(columns)) {
      for (const col of columns) {
        if (col?.components) {
          keys.push(...collectFieldKeysForReference(col.components as unknown[], excludeKey))
        }
      }
    }
    const rows = comp.rows as unknown[] | undefined
    if (Array.isArray(rows)) {
      for (const row of rows) {
        if (!Array.isArray(row)) continue
        for (const col of row) {
          const cell = col as { components?: unknown[] }
          if (cell?.components) {
            keys.push(...collectFieldKeysForReference(cell.components, excludeKey))
          }
        }
      }
    }
  }
  return [...new Set(keys)]
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
      // Register custom components and use the same Formio instance for the builder
      const { registerCustomComponents, getBuilderConfig } = await import('../../utils/formio-component-registry')
      const FormioInstance = await registerCustomComponents()
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

      // Get builder config with custom components; pass getFormSchema so Reference Field preview can resolve refs
      const builderConfig = getBuilderConfig({
        getFormSchema: () => {
          const inst = builderInstanceRef.current as { form?: { components?: unknown[] } } | null
          return inst?.form ?? valueRef.current
        },
      })

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
        const comps = (schema as { components?: unknown[] }).components
        if (!Array.isArray(comps)) return
        const current = valueRef.current as { components?: unknown[] } | null | undefined
        const currentComps = current && typeof current === 'object' && Array.isArray(current.components) ? current.components : []
        if (comps.length === 0 && currentComps.length > 0) return
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

      // Populate Reference Field dropdown with form component keys when edit dialog opens
      instance.on('editComponent', (component: Record<string, unknown>) => {
        if (component && (component.type === REFERENCE_FIELD_TYPE || component.type === 'schemaReference')) {
          setTimeout(() => {
            try {
              const inst = builderInstanceRef.current as { form?: { components?: unknown[] }; editForm?: { getComponent: (key: string) => { component: Record<string, unknown>; updateItems?: (a?: unknown, b?: unknown) => void } } } | null
              if (!inst?.form?.components || !inst?.editForm) return
              const keys = collectFieldKeysForReference(inst.form.components, component.key as string)
              const values = keys.map((k) => ({ label: k, value: k }))
              const refKeyComp = inst.editForm.getComponent('referenceKey')
              if (refKeyComp?.component) {
                const comp = refKeyComp.component as Record<string, unknown>
                if (!comp.data) comp.data = {}
                const data = comp.data as Record<string, unknown>
                data.values = values
                if (typeof (refKeyComp as { updateItems?: (a?: unknown, b?: unknown) => void }).updateItems === 'function') {
                  (refKeyComp as { updateItems: (a?: unknown, b?: unknown) => void }).updateItems()
                }
              }
            } catch (_) {
              // ignore
            }
          }, 100)
        }
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
