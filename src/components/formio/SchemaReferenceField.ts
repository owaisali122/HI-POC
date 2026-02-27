/**
 * FormIO Schema Reference – Designer-only component.
 * When configured and saved: clones the selected field's schema into this location and removes the reference.
 * Use: drag in → select source field key → enter new key → Save. Result: cloned field with new key.
 */

export class SchemaReferenceFieldComponent {
  static schema(overrides?: Record<string, unknown>) {
    return {
      type: 'fieldReference',
      label: 'Reference Field',
      key: 'referenceField',
      input: false,
      tableView: false,
      referenceKey: '',
      ...overrides,
    }
  }

  static get builderInfo() {
    return {
      title: 'Reference Field',
      group: 'basic',
      icon: 'clone',
      weight: 24,
      documentation: 'Clone an existing field from this form. Select the field to clone and give the clone a new key, then Save.',
      schema: SchemaReferenceFieldComponent.schema(),
    }
  }

  static editForm() {
    return {
      components: [
        {
          type: 'select',
          key: 'referenceKey',
          label: 'Field to clone',
          input: true,
          required: true,
          data: {
            values: [],
          },
          dataSrc: 'values',
          valueProperty: 'value',
          labelProperty: 'label',
          template: '<span>{{ item.label }}</span>',
          description: 'Select a field from this form to clone. Only fields already in the form appear here.',
        },
        {
          type: 'textfield',
          key: 'key',
          label: 'New key',
          input: true,
          required: true,
          description: 'Unique key for the cloned component (e.g. firstNameCopy).',
        },
      ],
    }
  }
}
