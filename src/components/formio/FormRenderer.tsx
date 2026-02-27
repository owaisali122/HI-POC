'use client'

/**
 * FormRenderer – Renders a Form.io form from schema with all custom components
 * (documentUpload, documentViewer, appDetailRef, fieldReference, etc.).
 *
 * Use this in your React app (this repo or a separate app) wherever you need
 * to display a fillable form from schema (e.g. from GET /api/forms/:id).
 *
 * Prerequisites:
 * - formiojs installed (npm install formiojs)
 * - Bootstrap CSS loaded if your schema uses bootstrap template (e.g. from BootstrapProvider or global)
 *
 * Usage (in your app):
 *   import { FormRenderer } from '@/components/formio/FormRenderer'
 *   <FormRenderer
 *     schema={formSchema}
 *     onSubmit={(data) => console.log(data)}
 *     onReady={(form) => {}}
 *     readOnly={false}
 *   />
 */

import React, { useCallback, useEffect, useRef, useState } from 'react'

export interface FormRendererProps {
  /** Form.io schema (display + components). From API e.g. form.schema or after runAppDetailRefInjection. */
  schema: Record<string, unknown> | null | undefined
  /** Callback when form is submitted. */
  onSubmit?: (data: Record<string, unknown>) => void
  /** Callback when form instance is created (e.g. to attach more events). */
  onReady?: (form: { form: unknown; destroy?: () => void }) => void
  /** Whether the form is read-only. Default false. */
  readOnly?: boolean
  /** Extra Formio createForm options (e.g. baseUrl, language). */
  options?: Record<string, unknown>
  /** Class name for the wrapper div. */
  className?: string
  /** Optional form data to prefill. */
  submission?: Record<string, unknown>
}

let componentsRegistered: Promise<unknown> | null = null

function ensureComponentsRegistered(): Promise<unknown> {
  if (componentsRegistered) return componentsRegistered
  componentsRegistered = import('../../utils/formio-component-registry').then((m) => m.registerCustomComponents())
  return componentsRegistered
}

export const FormRenderer: React.FC<FormRendererProps> = ({
  schema,
  onSubmit,
  onReady,
  readOnly = false,
  options = {},
  className,
  submission,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const formInstanceRef = useRef<{ destroy?: () => void } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const renderForm = useCallback(async () => {
    const container = containerRef.current
    const schemaObj = schema && typeof schema === 'object' && Array.isArray((schema as { components?: unknown[] }).components)
      ? (schema as { display?: string; components: unknown[] })
      : null

    if (!container || !schemaObj) {
      if (!schemaObj && schema != null) setError('Invalid schema')
      return
    }

    setError(null)
    container.innerHTML = ''

    try {
      const FormioLib = (await ensureComponentsRegistered()) as Record<string, unknown>
      const createFormFn =
        typeof FormioLib?.createForm === 'function'
          ? FormioLib.createForm
          : (FormioLib?.GlobalFormio as Record<string, unknown>)?.createForm
      if (typeof createFormFn !== 'function') {
        setError('Formio.createForm not available')
        return
      }

      const formOptions = {
        readOnly: Boolean(readOnly),
        ...(submission && { submission: { data: submission } }),
        ...options,
      }

      const instance = await (createFormFn as (el: HTMLElement, s: object, o?: object) => Promise<{ destroy?: () => void }>)(
        container,
        schemaObj,
        formOptions
      )
      formInstanceRef.current = instance

      if (instance && typeof (instance as any).on === 'function') {
        (instance as any).on('submit', (sub: { data: Record<string, unknown> }) => {
          onSubmit?.(sub.data)
        })
      }

      onReady?.(instance as { form: unknown; destroy?: () => void })
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to render form'
      setError(message)
      console.error('FormRenderer:', e)
    }
  }, [schema, readOnly, submission, options, onSubmit, onReady])

  useEffect(() => {
    renderForm()
    return () => {
      const inst = formInstanceRef.current
      if (inst?.destroy) {
        try {
          inst.destroy()
        } catch (_) {}
        formInstanceRef.current = null
      }
    }
  }, [renderForm])

  if (error) {
    return (
      <div className={className} role="alert">
        {error}
      </div>
    )
  }

  return <div ref={containerRef} className={className} />
}
