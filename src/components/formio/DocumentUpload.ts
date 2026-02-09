/**
 * Custom Form.io Document Upload Component
 * 
 * A clean implementation for uploading documents with mandatory PDF support
 * and configurable upload endpoint.
 */

export class DocumentUploadComponent {
  static schema(overrides?: any) {
    return {
      type: 'documentUpload',
      label: 'Document Upload',
      key: 'document',
      input: true,
      placeholder: 'Select or drag a document file here',
      description: 'Upload a document file (PDF required, plus other formats)',
      // File configuration
      storage: 'url',
      url: '',
      fileTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf', 'odt', 'ods', 'odp'],
      filePattern: '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf,.odt,.ods,.odp',
      fileMinSize: '0KB',
      fileMaxSize: '10MB',
      // Custom properties
      uploadEndpoint: '', // MANDATORY: API endpoint for file upload
      allowMultiple: false,
      showPreview: true,
      ...overrides,
    }
  }

  static get builderInfo() {
    return {
      title: 'Document Upload',
      group: 'basic',
      icon: 'upload',
      weight: 25,
      documentation: 'Upload documents with mandatory PDF support',
      schema: DocumentUploadComponent.schema(),
    }
  }

  static editForm() {
    return {
      components: [
        {
          type: 'textfield',
          key: 'label',
          label: 'Label',
          input: true,
          defaultValue: 'Document Upload',
        },
        {
          type: 'textfield',
          key: 'key',
          label: 'Property Name',
          input: true,
          defaultValue: 'document',
        },
        {
          type: 'checkbox',
          key: 'required',
          label: 'Required',
          input: true,
          defaultValue: false,
        },
        {
          type: 'textfield',
          key: 'placeholder',
          label: 'Placeholder',
          input: true,
          defaultValue: 'Select or drag a document file here',
        },
        {
          type: 'textarea',
          key: 'description',
          label: 'Description',
          input: true,
          defaultValue: 'Upload a document file (PDF required, plus other formats)',
        },
        {
          type: 'textfield',
          key: 'uploadEndpoint',
          label: 'Upload Endpoint',
          input: true,
          required: true,
          placeholder: '/api/upload-document',
          description: 'MANDATORY: API endpoint for file upload',
          validate: {
            required: true,
          },
        },
        {
          type: 'textfield',
          key: 'fileMaxSize',
          label: 'Maximum File Size',
          input: true,
          defaultValue: '10MB',
          description: 'Maximum file size (e.g., 10MB, 5MB, 1GB)',
        },
        {
          type: 'checkbox',
          key: 'allowMultiple',
          label: 'Allow Multiple Files',
          input: true,
          defaultValue: false,
        },
        {
          type: 'checkbox',
          key: 'showPreview',
          label: 'Show File Preview',
          input: true,
          defaultValue: true,
        },
      ],
    }
  }
}
