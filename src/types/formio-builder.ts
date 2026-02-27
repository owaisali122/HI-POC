/**
 * Form.io builder instance and edit-form types for type-safe usage in FormBuilderField.
 * Use these instead of ad-hoc `as` casts.
 */

export interface FormioSchema {
  display?: string
  components?: unknown[]
}

export interface FormioEditFormComponentRef {
  component: Record<string, unknown> & { data?: Record<string, unknown> }
  updateItems?: (a?: unknown, b?: unknown) => void
}

export interface FormioEditForm {
  getComponent: (key: string) => FormioEditFormComponentRef | undefined
  on?: (event: string, fn: (value: unknown) => void) => void
  redraw?: () => void
}

export interface FormioBuilderInstance {
  form?: FormioSchema & Record<string, unknown>
  schema?: FormioSchema & Record<string, unknown>
  editForm?: FormioEditForm
  redraw?: () => void
  root?: { redraw?: () => void }
  parent?: { redraw?: () => void }
  destroy?: () => void
}

export interface FormDocFromApi extends Record<string, unknown> {
  id: string | number
  title?: string
  slug?: string
  schema?: FormioSchema
  components?: unknown[]
  form?: FormioSchema
}

export interface SelectOption {
  value: string
  label: string
}
