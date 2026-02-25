/**
 * FormIO Field Reference – displays and edits the same data as another field by key.
 * Use in another panel so one field (e.g. firstName) appears in multiple places and stays in sync.
 */

export class FieldReferenceComponent {
  static schema(overrides?: any) {
    return {
      type: 'fieldReference',
      label: 'Field Reference',
      key: 'fieldReference',
      input: true,
      referenceKey: '',
      ...overrides,
    }
  }

  static get builderInfo() {
    return {
      title: 'Field Reference',
      group: 'basic',
      icon: 'link',
      weight: 25,
      documentation: 'Reference another field by key – same value, stays in sync across panels',
      schema: FieldReferenceComponent.schema(),
    }
  }

  static editForm() {
    return {
      components: [
        { type: 'textfield', key: 'label', label: 'Label', input: true },
        { type: 'textfield', key: 'key', label: 'Property Name', input: true, tooltip: 'Unique key for this component (e.g. firstNamePanel2). Value is stored under Reference Field Key.' },
        { type: 'textfield', key: 'referenceKey', label: 'Reference Field Key', input: true, required: true, description: 'API key of the field to mirror (e.g. firstName). This is where the value is stored.' },
      ],
    }
  }
}
