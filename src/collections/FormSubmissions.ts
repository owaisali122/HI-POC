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
    // Public can create submissions
    create: () => true,
    // Only admins can update/delete
    update: ({ req: { user } }) => Boolean(user),
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
          ({ operation }) => {
            if (operation === 'create') {
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
