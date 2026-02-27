/**
 * Form.io App Detail Ref – standalone designer component.
 *
 * Lets the form designer select a form from the configured Forms API and store that reference.
 * The builder does not inject fieldReference. Add Reference Field (fieldReference) separately.
 * The Forms API URL is from environment or central config.
 *
 * @see src/config/formio.ts for URL configuration
 */

import { getFormsApiUrl } from '../../config/formio'

/** Component type as used in schema and builder. */
export const APP_DETAIL_REF_TYPE = 'appDetailRef'

/** Exclude list: in is list mein jo type ho wo dropdown/search mein nahi aayega. */
export const APP_DETAIL_REF_EXCLUDE_TYPES: string[] = ['fieldReference', 'appDetailRef']

/** Default component key when not overridden. */
const DEFAULT_KEY = 'appDetailRef'

/** Default label in builder. */
const DEFAULT_LABEL = 'App Detail Reference'

/** Edit form field keys. */
const EDIT_FIELD_KEYS = {
  selectedFormId: 'selectedFormId',
  key: 'key',
} as const

export interface AppDetailRefSchema {
  type: string
  label: string
  key: string
  input: boolean
  tableView: boolean
  selectedFormId: string
  [k: string]: unknown
}

export interface AppDetailRefBuilderInfo {
  title: string
  group: string
  icon: string
  weight: number
  documentation: string
  schema: AppDetailRefSchema
}

export interface AppDetailRefEditFormComponent {
  type: string
  key: string
  label: string
  input: boolean
  required: boolean
  data?: { values: unknown[] }
  dataSrc?: string
  valueProperty?: string
  labelProperty?: string
  template?: string
  description?: string
}

export class AppDetailRefComponent {
  /**
   * Base schema for the App Detail Ref component.
   * Overrides are merged so the builder can set key, label, selectedFormId, etc.
   */
  static schema(overrides?: Record<string, unknown>): AppDetailRefSchema {
    return {
      type: APP_DETAIL_REF_TYPE,
      label: DEFAULT_LABEL,
      key: DEFAULT_KEY,
      input: false,
      tableView: false,
      selectedFormId: '',
      ...overrides,
    }
  }

  /**
   * Builder metadata: title, group, icon, weight, documentation.
   * Documentation includes the configured Forms API URL when available (from env/config).
   */
  static get builderInfo(): AppDetailRefBuilderInfo {
    const formsApiUrl = getFormsApiUrl()
    return {
      title: 'App Detail Ref',
      group: 'basic',
      icon: 'list-alt',
      weight: 25,
      documentation: `Select a form from the API (stores reference only; add Reference Field separately to reference fields). Options load from the configured Forms API (${formsApiUrl}).`,
      schema: AppDetailRefComponent.schema(),
    }
  }

  /**
   * Edit form definition for the builder sidebar: Form dropdown and Property Name.
   * Values for the Form dropdown are loaded at runtime (all forms, shown as "Title (slug)") by the builder.
   */
  static editForm(): { components: AppDetailRefEditFormComponent[] } {
    return {
      components: [
        {
          type: 'select',
          key: EDIT_FIELD_KEYS.selectedFormId,
          label: 'Form',
          input: true,
          required: false,
          data: {
            values: [],
          },
          dataSrc: 'values',
          valueProperty: 'value',
          labelProperty: 'label',
          template: '<span>{{ item.label }}</span>',
          description: 'Select a form (listed by title and slug). This stores the reference only; add Reference Field components separately to reference specific fields.',
        },
        {
          type: 'textfield',
          key: EDIT_FIELD_KEYS.key,
          label: 'Property Name',
          input: true,
          required: true,
          description: 'Unique key for this component (e.g. appDetailRef).',
        },
      ],
    }
  }
}
