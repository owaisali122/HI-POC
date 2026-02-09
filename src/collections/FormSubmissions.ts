import type { CollectionConfig } from 'payload'

export const FormSubmissions: CollectionConfig = {
  slug: 'form-submissions',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['form', 'submittedAt', 'createdAt'],
    group: 'Form Management',
  },
  access: {
    // Only admins can read submissions
    read: ({ req: { user } }) => Boolean(user),
    // Public can create submissions (including drafts)
    create: () => true,
    // Allow updates for drafts (handled via API endpoints with proper validation)
    // Admins can update all
    update: ({ req: { user } }) => {
      // API endpoints will handle draft updates with proper validation
      // Admins can always update
      return Boolean(user)
    },
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'form',
      type: 'relationship',
      relationTo: 'forms',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'data',
      type: 'json',
      required: true,
      admin: {
        description: 'User submission payload',
        readOnly: true,
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Submitted', value: 'submitted' },
      ],
      defaultValue: 'draft',
      required: true,
      admin: {
        description: 'Submission status - Draft allows saving partial data',
      },
    },
    {
      name: 'currentTab',
      type: 'text',
      admin: {
        description: 'Current tab index or key for resuming form',
      },
    },
    {
      name: 'submittedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        readOnly: true,
      },
      hooks: {
        beforeChange: [
          ({ operation, data }) => {
            // Only set submittedAt when status changes to 'submitted'
            if (operation === 'create' && data?.status === 'submitted') {
              return new Date().toISOString()
            }
            if (operation === 'update' && data?.status === 'submitted') {
              return new Date().toISOString()
            }
          },
        ],
      },
    },
    {
      name: 'submitterEmail',
      type: 'email',
      admin: {
        description: 'Email of the person who submitted the form (if provided)',
        readOnly: true,
      },
    },
    {
      name: 'metadata',
      type: 'group',
      admin: {
        condition: () => true,
      },
      fields: [
        {
          name: 'ipAddress',
          type: 'text',
          admin: { readOnly: true },
        },
        {
          name: 'userAgent',
          type: 'text',
          admin: { readOnly: true },
        },
      ],
    },
  ],
  timestamps: true,
}
