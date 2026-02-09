/**
 * Custom Form.io Document Viewer Component
 * 
 * Features:
 * - Displays documents from a configurable view endpoint (MANDATORY)
 * - Supports PDF, images, and other document formats
 * - Embedded viewer for PDFs
 * - Download functionality
 * - Responsive design
 */

export class DocumentViewerComponent {
  static schema(overrides?: any) {
    return {
      type: 'documentViewer',
      label: 'Document Viewer',
      key: 'documentViewer',
      input: false, // Display only, not an input field
      // Custom properties
      viewEndpoint: '', // MANDATORY: API endpoint for viewing documents
      documentId: '', // Document ID or URL to display
      documentUrl: '', // Direct document URL (alternative to documentId)
      showDownload: true,
      showToolbar: true,
      height: '600px',
      width: '100%',
      ...overrides,
    }
  }

  static get builderInfo() {
    return {
      title: 'Document Viewer',
      group: 'basic',
      icon: 'eye',
      weight: 27,
      documentation: 'Component for viewing documents from a configurable endpoint',
      schema: DocumentViewerComponent.schema(),
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
          defaultValue: 'Document Viewer',
        },
        {
          type: 'textfield',
          key: 'key',
          label: 'Property Name',
          input: true,
          defaultValue: 'documentViewer',
          tooltip: 'The property name in the data object',
        },
        {
          type: 'textfield',
          key: 'viewEndpoint',
          label: 'View Endpoint',
          input: true,
          required: true,
          placeholder: '/api/view-document',
          description: 'MANDATORY: API endpoint for viewing documents. Should accept document ID or URL and return document data.',
          tooltip: 'Example: /api/view-document?id=123 or /api/view-document?url=/path/to/doc.pdf',
          validate: {
            required: true,
            custom: 'if (!value) { valid = "View endpoint is required"; }',
          },
        },
        {
          type: 'textfield',
          key: 'documentId',
          label: 'Document ID',
          input: true,
          placeholder: '123',
          description: 'Document ID to display (can be dynamic from form data)',
          tooltip: 'Use {{data.fieldName}} to reference form data',
        },
        {
          type: 'textfield',
          key: 'documentUrl',
          label: 'Document URL',
          input: true,
          placeholder: '/media/document.pdf',
          description: 'Direct document URL (alternative to documentId)',
          tooltip: 'Use {{data.fieldName}} to reference form data',
        },
        {
          type: 'checkbox',
          key: 'showDownload',
          label: 'Show Download Button',
          input: true,
          defaultValue: true,
        },
        {
          type: 'checkbox',
          key: 'showToolbar',
          label: 'Show Toolbar',
          input: true,
          defaultValue: true,
          description: 'Show PDF viewer toolbar (zoom, print, etc.)',
        },
        {
          type: 'textfield',
          key: 'height',
          label: 'Viewer Height',
          input: true,
          defaultValue: '600px',
          description: 'Height of the document viewer (e.g., 600px, 100vh)',
        },
        {
          type: 'textfield',
          key: 'width',
          label: 'Viewer Width',
          input: true,
          defaultValue: '100%',
          description: 'Width of the document viewer (e.g., 100%, 800px)',
        },
      ],
    }
  }

  constructor(component: any, options: any, data: any) {
    // Get Form.io from global scope
    const Formio = (window as any).Formio || (global as any).Formio
    if (!Formio || !Formio.Components) {
      console.error('Form.io Components not available')
      return
    }

    // Extend from base component
    const BaseComponent = Formio.Components.components.component
    const instance = new BaseComponent(component, options, data)

    // Copy all properties and methods
    Object.setPrototypeOf(this, Object.getPrototypeOf(instance))
    Object.assign(this, instance)

    // Store component config
    this.component = component
    this.options = options
    this.data = data
    this.documentUrl = null
    this.errorMessage = null
  }

  init() {
    // Call parent init if it exists
    if (super.init && typeof super.init === 'function') {
      super.init.call(this)
    }
    this.setupDocumentViewer()
  }

  setupDocumentViewer() {
    if (!this.element) return

    // Validate view endpoint is configured
    if (!this.component.viewEndpoint) {
      this.setCustomError('View endpoint is required. Please configure the view endpoint in component settings.')
      return
    }

    // Load and display document
    this.loadDocument()
  }

  async loadDocument() {
    if (!this.component.viewEndpoint) {
      this.setCustomError('View endpoint is not configured')
      return
    }

    try {
      // Get document ID or URL from component config or form data
      let documentId = this.component.documentId || ''
      let documentUrl = this.component.documentUrl || ''

      // Resolve dynamic values from form data
      if (documentId && documentId.includes('{{')) {
        documentId = this.interpolate(documentId, this.data)
      }
      if (documentUrl && documentUrl.includes('{{')) {
        documentUrl = this.interpolate(documentUrl, this.data)
      }

      // Build view endpoint URL
      let viewUrl = this.component.viewEndpoint
      if (documentId) {
        viewUrl += (viewUrl.includes('?') ? '&' : '?') + `id=${encodeURIComponent(documentId)}`
      }
      if (documentUrl) {
        viewUrl += (viewUrl.includes('?') ? '&' : '?') + `url=${encodeURIComponent(documentUrl)}`
      }

      // Fetch document from view endpoint
      const response = await fetch(viewUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to load document' }))
        throw new Error(errorData.error || `Failed to load document: ${response.status}`)
      }

      const result = await response.json()
      
      // Get document URL from response
      if (result.success && result.document) {
        this.documentUrl = result.document.url || result.document.fileUrl || result.document.path
      } else if (result.url) {
        this.documentUrl = result.url
      } else {
        throw new Error('Document URL not found in response')
      }

      // Display document
      this.displayDocument(this.documentUrl)

    } catch (error: any) {
      this.setCustomError(`Failed to load document: ${error.message || 'Unknown error'}`)
      this.showError(error.message || 'Failed to load document')
    }
  }

  displayDocument(url: string) {
    if (!this.element || !url) return

    // Clear any existing content
    this.element.innerHTML = ''

    // Determine document type
    const fileExt = url.split('.').pop()?.toLowerCase() || ''
    const isPDF = fileExt === 'pdf' || url.toLowerCase().includes('.pdf')
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(fileExt)

    const container = document.createElement('div')
    container.className = 'document-viewer-container'
    container.style.cssText = `
      width: ${this.component.width || '100%'};
      height: ${this.component.height || '600px'};
      border: 1px solid #ddd;
      border-radius: 4px;
      overflow: hidden;
      background-color: #f5f5f5;
      position: relative;
    `

    // Add toolbar if enabled
    if (this.component.showToolbar) {
      const toolbar = document.createElement('div')
      toolbar.className = 'document-viewer-toolbar'
      toolbar.style.cssText = `
        background-color: #fff;
        border-bottom: 1px solid #ddd;
        padding: 8px 12px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      `

      const title = document.createElement('span')
      title.textContent = this.component.label || 'Document Viewer'
      title.style.cssText = `font-weight: 500;`
      toolbar.appendChild(title)

      const actions = document.createElement('div')
      actions.style.cssText = `display: flex; gap: 8px;`

      if (this.component.showDownload) {
        const downloadBtn = document.createElement('button')
        downloadBtn.textContent = 'Download'
        downloadBtn.className = 'document-viewer-download'
        downloadBtn.style.cssText = `
          padding: 4px 12px;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        `
        downloadBtn.addEventListener('click', () => {
          window.open(url, '_blank')
        })
        actions.appendChild(downloadBtn)
      }

      toolbar.appendChild(actions)
      container.appendChild(toolbar)
    }

    // Create viewer area
    const viewer = document.createElement('div')
    viewer.className = 'document-viewer-content'
    viewer.style.cssText = `
      width: 100%;
      height: ${this.component.showToolbar ? 'calc(100% - 41px)' : '100%'};
      overflow: auto;
      display: flex;
      align-items: center;
      justify-content: center;
    `

    if (isPDF) {
      // Embed PDF
      const iframe = document.createElement('iframe')
      iframe.src = url
      iframe.style.cssText = `
        width: 100%;
        height: 100%;
        border: none;
      `
      viewer.appendChild(iframe)
    } else if (isImage) {
      // Display image
      const img = document.createElement('img')
      img.src = url
      img.style.cssText = `
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      `
      img.alt = 'Document preview'
      viewer.appendChild(img)
    } else {
      // Fallback: show download link
      const fallback = document.createElement('div')
      fallback.style.cssText = `
        text-align: center;
        padding: 40px;
      `
      
      const icon = document.createElement('div')
      icon.textContent = '📄'
      icon.style.cssText = `font-size: 48px; margin-bottom: 16px;`
      fallback.appendChild(icon)

      const message = document.createElement('div')
      message.textContent = 'Document preview not available'
      message.style.cssText = `margin-bottom: 16px; color: #666;`
      fallback.appendChild(message)

      if (this.component.showDownload) {
        const downloadLink = document.createElement('a')
        downloadLink.href = url
        downloadLink.download = ''
        downloadLink.textContent = 'Download Document'
        downloadLink.style.cssText = `
          display: inline-block;
          padding: 8px 16px;
          background-color: #3b82f6;
          color: white;
          text-decoration: none;
          border-radius: 4px;
        `
        fallback.appendChild(downloadLink)
      }

      viewer.appendChild(fallback)
    }

    container.appendChild(viewer)
    this.element.appendChild(container)
  }

  showError(message: string) {
    if (!this.element) return

    this.element.innerHTML = ''

    const errorContainer = document.createElement('div')
    errorContainer.className = 'document-viewer-error'
    errorContainer.style.cssText = `
      padding: 40px;
      text-align: center;
      color: #dc3545;
    `

    const icon = document.createElement('div')
    icon.textContent = '⚠️'
    icon.style.cssText = `font-size: 48px; margin-bottom: 16px;`
    errorContainer.appendChild(icon)

    const errorText = document.createElement('div')
    errorText.textContent = message
    errorText.style.cssText = `font-size: 14px;`
    errorContainer.appendChild(errorText)

    this.element.appendChild(errorContainer)
  }

  setCustomError(message: string) {
    this.errorMessage = message
    if (message) {
      this.showError(message)
    }
  }

  interpolate(template: string, data: any): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      const keys = path.trim().split('.')
      let value = data
      for (const key of keys) {
        if (value && typeof value === 'object') {
          value = value[key]
        } else {
          return match
        }
      }
      return value != null ? String(value) : match
    })
  }

  getValue() {
    return this.documentUrl
  }

  setValue(value: any) {
    if (value && typeof value === 'string') {
      this.documentUrl = value
      this.displayDocument(value)
    } else if (value && value.url) {
      this.documentUrl = value.url
      this.displayDocument(value.url)
    }
  }

  destroy() {
    if (super.destroy) {
      super.destroy()
    }
  }
}
