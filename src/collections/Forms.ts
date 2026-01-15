import type { CollectionConfig } from 'payload'

export const Forms: CollectionConfig = {
  slug: 'forms',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'status', 'updatedAt'],
    group: 'Form Management',
  },
  access: {
    read: () => true, // Public can read published forms
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          admin: { width: '50%' },
        },
        {
          name: 'slug',
          type: 'text',
          required: true,
          unique: true,
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      admin: { description: 'Optional description for this form' },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      defaultValue: 'draft',
      required: true,
    },
    {
      name: 'schema',
      type: 'json',
      required: true,
      defaultValue: {
        display: 'form',
        components: [],
      },
      admin: {
        description: 'Form.io JSON schema - Use the Form Builder below to design your form',
        components: {
          Field: '/components/admin/FormBuilderField',
        },
      },
      validate: (value) => {
        if (!value) return 'Schema is required'
        if (typeof value !== 'object') return 'Schema must be an object'
        return true
      },
    },
    {
      name: 'settings',
      type: 'group',
      admin: {
        condition: () => true,
      },
      fields: [
        {
          name: 'submitButtonText',
          type: 'text',
          defaultValue: 'Submit',
        },
        {
          name: 'successMessage',
          type: 'textarea',
          defaultValue: 'Thank you for your submission!',
        },
        {
          name: 'allowMultipleSubmissions',
          type: 'checkbox',
          defaultValue: true,
        },
      ],
    },
  ],
  timestamps: true,
}
