'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useField } from '@payloadcms/ui'
import { APP_DETAIL_REF_EXCLUDE_TYPES } from '../formio/AppDetailRef'
import { getFormsListUrl } from '../../config/formio'
import type { FormioBuilderInstance, FormioSchema, FormDocFromApi, SelectOption } from '../../types/formio-builder'
import styles from './FormBuilderField.module.scss'
import { BootstrapProvider } from './BootstrapProvider'

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
const APP_DETAIL_REF_TYPE = 'appDetailRef'

function getFormsCache(): { docs?: FormDocFromApi[] } | undefined {
  if (typeof window === 'undefined') return undefined
  const w = window as Window & { __appDetailRefFormsCache?: { docs?: FormDocFromApi[] }; top?: Window & { __appDetailRefFormsCache?: { docs?: FormDocFromApi[] } } }
  return w.__appDetailRefFormsCache ?? w.top?.__appDetailRefFormsCache
}

function setFormsCache(raw: { docs?: FormDocFromApi[] }): void {
  if (typeof window === 'undefined') return
  const w = window as Window & { __appDetailRefFormsCache?: unknown; top?: Window & { __appDetailRefFormsCache?: unknown } }
  w.__appDetailRefFormsCache = raw
  try {
    w.top.__appDetailRefFormsCache = raw
  } catch {
    // cross-origin
  }
}

/** Collect selectedFormId from all appDetailRef components in the tree. */
function collectSelectedFormIds(components: unknown[]): string[] {
  const ids: string[] = []
  if (!Array.isArray(components)) return ids
  for (const c of components) {
    const comp = c as Record<string, unknown>
    if (comp?.type === APP_DETAIL_REF_TYPE) {
      const id = comp.selectedFormId ?? comp.value
      if (id && typeof id === 'string') ids.push(String(id))
    }
    if (Array.isArray(comp?.components)) ids.push(...collectSelectedFormIds(comp.components as unknown[]))
    const tabs = comp?.tabs as Array<{ components?: unknown[] }> | undefined
    if (Array.isArray(tabs)) for (const t of tabs) { if (t?.components) ids.push(...collectSelectedFormIds(t.components)) }
    const cols = comp?.columns as Array<{ components?: unknown[] }> | undefined
    if (Array.isArray(cols)) for (const col of cols) { if (col?.components) ids.push(...collectSelectedFormIds(col.components as unknown[])) }
  }
  return [...new Set(ids)]
}

/** Collect key + label (for dropdown) from components; excludes layout types in exclude list. */
function collectFieldKeysForReference(components: unknown[], excludeKey?: string): Array<{ key: string; label: string }> {
  const out: Array<{ key: string; label: string }> = []
  if (!Array.isArray(components)) return out
  for (const c of components) {
    if (typeof c !== 'object' || c === null) continue
    const comp = c as Record<string, unknown>
    const type = comp.type as string | undefined
    if (
      typeof comp.key === 'string' &&
      comp.key &&
      comp.key !== excludeKey &&
      type &&
      !APP_DETAIL_REF_EXCLUDE_TYPES.includes(type)
    ) {
      const label = (comp.label as string) || (comp.title as string) || comp.key
      out.push({ key: comp.key, label: label || comp.key })
    }
    if (Array.isArray(comp.components)) {
      out.push(...collectFieldKeysForReference(comp.components as unknown[], excludeKey))
    }
    const tabs = comp.tabs as Array<{ components?: unknown[] }> | undefined
    if (Array.isArray(tabs)) {
      for (const tab of tabs) {
        if (tab && Array.isArray(tab.components)) {
          out.push(...collectFieldKeysForReference(tab.components, excludeKey))
        }
      }
    }
    const columns = comp.columns as Array<{ components?: unknown[] }> | undefined
    if (Array.isArray(columns)) {
      for (const col of columns) {
        if (col?.components) {
          out.push(...collectFieldKeysForReference(col.components as unknown[], excludeKey))
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
            out.push(...collectFieldKeysForReference(cell.components, excludeKey))
          }
        }
      }
    }
  }
  const seen = new Set<string>()
  return out.filter((x) => {
    if (seen.has(x.key)) return false
    seen.add(x.key)
    return true
  })
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

  // Current display type from schema (for the dropdown) – memoized to avoid unnecessary re-renders
  const displayType = useMemo<DisplayType>(() => {
    if (value && typeof value === 'object' && 'display' in value && (value.display === 'wizard' || value.display === 'form')) {
      return value.display as DisplayType
    }
    return 'form'
  }, [value])

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

      const formsListUrl = getFormsListUrl()
      const FormioGlobal = typeof window !== 'undefined' ? (window as Window & { Formio?: { makeRequest?: (method: string, url: string) => Promise<unknown> } }).Formio : undefined
      const fetchForms = FormioGlobal?.makeRequest ? () => FormioGlobal.makeRequest!('GET', formsListUrl) : () => fetch(formsListUrl).then((r) => r.json())
      fetchForms().then((raw: unknown) => setFormsCache(raw as { docs?: FormDocFromApi[] })).catch(() => {})

      const getSchemaFromInstance = (): FormioSchema | null => {
        try {
          const inst = builderInstanceRef.current as FormioBuilderInstance | null
          if (!inst) return null
          const form = inst.form
          if (form && typeof form === 'object' && Array.isArray(form.components)) {
            return { ...form, display: schemaWithDisplay.display }
          }
          if (inst.schema && typeof inst.schema === 'object') {
            return inst.schema as FormioSchema
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

      instance.on('saveComponent', () => {
        queueMicrotask(() => {
          const s = getSchemaFromInstance()
          if (s) syncSchemaToField(s)
        })
      })

      /** Main form = saved value pehle, phir builder schema. */
      const getMainFormComponents = (): unknown[] | null => {
        const saved = valueRef.current as { components?: unknown[] } | null | undefined
        if (saved && Array.isArray(saved.components) && saved.components.length > 0) return saved.components
        const schema = getSchemaFromInstance() as { components?: unknown[] } | null
        if (Array.isArray(schema?.components)) return schema.components
        const inst = builderInstanceRef.current as FormioBuilderInstance | null
        return Array.isArray(inst?.form?.components) ? inst.form.components : null
      }

      const populateReferenceFieldDropdown = async (editComponent?: Record<string, unknown>) => {
        const inst = builderInstanceRef.current as FormioBuilderInstance | null
        if (!inst?.editForm) return
        const rootComps = getMainFormComponents()
        if (!rootComps?.length) return
        const excludeKey = (editComponent?.key as string) || undefined
        const currentItems = collectFieldKeysForReference(rootComps, excludeKey)
        const values: SelectOption[] = currentItems.map(({ key, label }) => ({ label: label || key, value: key }))
        const cache = getFormsCache()
        const docs = cache?.docs ?? []
        const selectedIds = collectSelectedFormIds(rootComps)
        if (docs.length && selectedIds.length) {
          const { getDocComponents, getReferencableComponents } = await import('../../utils/formio-app-detail-ref-logic')
          for (const formId of selectedIds) {
            const doc = docs.find((d) => String(d.id) === String(formId))
            if (!doc) continue
            const comps = getDocComponents(doc)
            const refs = getReferencableComponents(comps)
            const title = (doc.title as string) || (doc.slug as string) || String(formId)
            for (const { key: k, label: lbl } of refs) {
              if (!values.some((v) => v.value === k)) values.push({ label: `${lbl || k} (Form ${title})`, value: k })
            }
          }
        }
        const refKeyComp = inst.editForm.getComponent('referenceKey')
        if (refKeyComp?.component) {
          const comp = refKeyComp.component
          if (!comp.data) comp.data = {}
          ;(comp.data as Record<string, unknown>).values = values
          refKeyComp.updateItems?.()
        }
      }

      instance.on('editComponent', (component: Record<string, unknown>) => {
        if (component && (component.type === REFERENCE_FIELD_TYPE || component.type === 'schemaReference')) {
          requestAnimationFrame(() => {
            try {
              populateReferenceFieldDropdown(component)
            } catch (_) {}
          })
        }
        if (component && component.type === APP_DETAIL_REF_TYPE) {
          requestAnimationFrame(async () => {
            try {
              const inst = builderInstanceRef.current as FormioBuilderInstance | null
              if (!inst?.editForm) return
              let raw = getFormsCache()
              if (!raw?.docs?.length) {
                const Formio = typeof window !== 'undefined' ? (window as Window & { Formio?: { makeRequest?: (m: string, u: string) => Promise<unknown> } }).Formio : undefined
                const url = getFormsListUrl()
                const data = Formio?.makeRequest ? await Formio.makeRequest('GET', url) : await fetch(url).then((r) => r.json())
                raw = data as { docs?: FormDocFromApi[] }
                setFormsCache(raw)
              }
              const docs = raw?.docs ?? []
              const values: SelectOption[] = docs.map((d) => {
                const title = (d.title as string) ?? String(d.id)
                const slug = typeof d.slug === 'string' ? d.slug : ''
                return { value: String(d.id), label: slug ? `${title} (${slug})` : title }
              })
              const selectComp = inst.editForm.getComponent('selectedFormId')
              if (selectComp?.component) {
                const comp = selectComp.component
                if (!comp.data) comp.data = {}
                ;(comp.data as Record<string, unknown>).values = values
                selectComp.updateItems?.()
              }
              const editingComp = component as Record<string, unknown>
              const docIds = new Set(docs.map((d) => String(d.id)))
              const findFormSelect = (): HTMLSelectElement | null => {
                const container = document.querySelector('.formio-dialog') ?? document.querySelector('[class*="formio-builder"]') ?? document.body
                for (const sel of container.querySelectorAll<HTMLSelectElement>('select')) {
                  if (Array.from(sel.options).some((o) => docIds.has(o.value))) return sel
                }
                return null
              }
              const onDropdownChange = (id: string | undefined) => {
                editingComp.selectedFormId = id
                inst.redraw?.()
              }
              inst.editForm.on?.('change', (value: unknown) => {
                const id = (value as Record<string, unknown>)?.selectedFormId as string | undefined
                if (id !== undefined) onDropdownChange(id)
              })
              requestAnimationFrame(() => {
                const sel = findFormSelect()
                if (sel && !(sel as HTMLElement).dataset.appDetailRefListener) {
                  ;(sel as HTMLElement).dataset.appDetailRefListener = '1'
                  sel.addEventListener('change', () => onDropdownChange(sel.value || undefined))
                }
                inst.redraw?.()
              })
            } catch {
              // edit form not ready
            }
          })
        }
      })

      const syncAfterChange = () => {
        queueMicrotask(() => {
          const s = getSchemaFromInstance()
          if (s) syncSchemaToField(s)
        })
      }
      instance.on('addComponent', syncAfterChange)
      instance.on('removeComponent', syncAfterChange)
      instance.on('updateComponent', syncAfterChange)

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
