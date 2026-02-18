/**
 * Form.io Custom Component Registry
 * 
 * Registers custom Form.io components for use in both Builder and Renderer
 */

export async function registerCustomComponents() {
  try {
    // Dynamically import Form.io to avoid SSR issues
    const FormioModule = await import('formiojs')
    const Formio = (FormioModule as any).default || FormioModule

    // Make Form.io available globally for component registration
    if (typeof window !== 'undefined') {
      ;(window as any).Formio = Formio
    }
    if (typeof global !== 'undefined') {
      ;(global as any).Formio = Formio
    }

    // Register custom components
    if (Formio.Components && Formio.Components.setComponent) {
      const FileComponent = Formio.Components.components.file
      const BaseComponent = Formio.Components.components.component
      const SelectComponent = Formio.Components.components.select

      // Register Document Upload component
      const { DocumentUploadComponent } = await import('../components/formio/DocumentUpload')
      
      const DocumentUpload = class extends FileComponent {
        static schema(overrides?: any) {
          return DocumentUploadComponent.schema(overrides)
        }

        static get builderInfo() {
          return DocumentUploadComponent.builderInfo
        }

        static editForm() {
          return DocumentUploadComponent.editForm()
        }

        constructor(component: any, options: any, data: any) {
          // Set storage to url and configure upload endpoint
          if (!component.storage) {
            component.storage = 'url'
          }
          if (!component.url && component.uploadEndpoint) {
            component.url = component.uploadEndpoint
          }
          
          super(component, options, data)
        }

        init() {
          super.init()
        }

        render() {
          return super.render()
        }

        attach(element: HTMLElement) {
          return super.attach(element)
        }
      }

      Formio.Components.setComponent('documentUpload', DocumentUpload)
      console.log('✅ Document Upload component registered successfully')

      // Register Document Viewer component
      const { DocumentViewerComponent } = await import('../components/formio/DocumentViewer')
      
      const DocumentViewer = class extends BaseComponent {
        static schema(overrides?: any) {
          return DocumentViewerComponent.schema(overrides)
        }

        static get builderInfo() {
          return DocumentViewerComponent.builderInfo
        }

        static editForm() {
          return DocumentViewerComponent.editForm()
        }

        constructor(component: any, options: any, data: any) {
          super(component, options, data)
          
          // Initialize document viewer properties
          this.documentUrl = null
          this.errorMessage = null
        }

        init() {
          super.init()
          if (this.element) {
            this.setupDocumentViewer()
          }
        }

        setupDocumentViewer() {
          const proto = DocumentViewerComponent.prototype as any
          if (proto.setupDocumentViewer) {
            proto.setupDocumentViewer.call(this)
          }
        }

        loadDocument() {
          const proto = DocumentViewerComponent.prototype as any
          if (proto.loadDocument) {
            return proto.loadDocument.call(this)
          }
        }

        displayDocument(url: string) {
          const proto = DocumentViewerComponent.prototype as any
          if (proto.displayDocument) {
            proto.displayDocument.call(this, url)
          }
        }

        showError(message: string) {
          const proto = DocumentViewerComponent.prototype as any
          if (proto.showError) {
            proto.showError.call(this, message)
          }
        }

        setCustomError(message: string) {
          const proto = DocumentViewerComponent.prototype as any
          if (proto.setCustomError) {
            proto.setCustomError.call(this, message)
          }
        }

        interpolate(template: string, data: any) {
          const proto = DocumentViewerComponent.prototype as any
          if (proto.interpolate) {
            return proto.interpolate.call(this, template, data)
          }
          return template
        }

        getValue() {
          const proto = DocumentViewerComponent.prototype as any
          if (proto.getValue) {
            return proto.getValue.call(this)
          }
          return super.getValue()
        }

        setValue(value: any) {
          const proto = DocumentViewerComponent.prototype as any
          if (proto.setValue) {
            proto.setValue.call(this, value)
          } else {
            super.setValue(value)
          }
        }

        destroy() {
          super.destroy()
        }
      }

      Formio.Components.setComponent('documentViewer', DocumentViewer)
      console.log('✅ Document Viewer component registered successfully')

      // Register Searchable Dropdown component
      const { SearchableDropdownComponent } = await import('../components/formio/SearchableDropdown')
      
      const SearchableDropdown = class extends SelectComponent {
        static schema(overrides?: any) {
          return SearchableDropdownComponent.schema(overrides)
        }

        static get builderInfo() {
          return SearchableDropdownComponent.builderInfo
        }

        static editForm() {
          return SearchableDropdownComponent.editForm()
        }

        constructor(component: any, options: any, data: any) {
          super(component, options, data)
          
          // Initialize searchable dropdown properties
          this.searchInput = null
          this.dropdownContainer = null
          this.optionsContainer = null
          this.selectedTagsContainer = null
          this.isLoading = false
          this.searchResults = []
          this.selectedValues = []
          this.selectedLabels = []
          this.debounceTimer = null
          this.isDropdownOpen = false
          this.currentHighlightIndex = -1
          this.multiple = component.multiple || false
        }

        init() {
          super.init()
          if (this.element) {
            this.setupSearchableDropdown()
          }
        }

        setupSearchableDropdown() {
          const proto = SearchableDropdownComponent.prototype as any
          if (proto.setupSearchableDropdown) {
            proto.setupSearchableDropdown.call(this)
          }
        }

        handleSearch(query: string) {
          const proto = SearchableDropdownComponent.prototype as any
          if (proto.handleSearch) {
            proto.handleSearch.call(this, query)
          }
        }

        performSearch(query: string) {
          const proto = SearchableDropdownComponent.prototype as any
          if (proto.performSearch) {
            return proto.performSearch.call(this, query)
          }
        }

        renderOptions() {
          const proto = SearchableDropdownComponent.prototype as any
          if (proto.renderOptions) {
            proto.renderOptions.call(this)
          }
        }

        selectOption(value: any, label: string) {
          const proto = SearchableDropdownComponent.prototype as any
          if (proto.selectOption) {
            proto.selectOption.call(this, value, label)
          }
        }

        toggleOption(value: any, label: string) {
          const proto = SearchableDropdownComponent.prototype as any
          if (proto.toggleOption) {
            proto.toggleOption.call(this, value, label)
          }
        }

        renderSelectedTags() {
          const proto = SearchableDropdownComponent.prototype as any
          if (proto.renderSelectedTags) {
            proto.renderSelectedTags.call(this)
          }
        }

        handleKeyDown(e: KeyboardEvent) {
          const proto = SearchableDropdownComponent.prototype as any
          if (proto.handleKeyDown) {
            proto.handleKeyDown.call(this, e)
          }
        }

        openDropdown() {
          const proto = SearchableDropdownComponent.prototype as any
          if (proto.openDropdown) {
            proto.openDropdown.call(this)
          }
        }

        closeDropdown() {
          const proto = SearchableDropdownComponent.prototype as any
          if (proto.closeDropdown) {
            proto.closeDropdown.call(this)
          }
        }

        showLoading() {
          const proto = SearchableDropdownComponent.prototype as any
          if (proto.showLoading) {
            proto.showLoading.call(this)
          }
        }

        hideLoading() {
          const proto = SearchableDropdownComponent.prototype as any
          if (proto.hideLoading) {
            proto.hideLoading.call(this)
          }
        }

        showError(message: string) {
          const proto = SearchableDropdownComponent.prototype as any
          if (proto.showError) {
            proto.showError.call(this, message)
          }
        }

        getLabelForValue(value: any) {
          const proto = SearchableDropdownComponent.prototype as any
          if (proto.getLabelForValue) {
            return proto.getLabelForValue.call(this, value)
          }
          return null
        }

        getValue() {
          const proto = SearchableDropdownComponent.prototype as any
          if (proto.getValue) {
            return proto.getValue.call(this)
          }
          return super.getValue()
        }

        setValue(value: any) {
          const proto = SearchableDropdownComponent.prototype as any
          if (proto.setValue) {
            proto.setValue.call(this, value)
          } else {
            super.setValue(value)
          }
        }

        destroy() {
          const proto = SearchableDropdownComponent.prototype as any
          if (proto.destroy) {
            proto.destroy.call(this)
          } else {
            super.destroy()
          }
        }
      }

      Formio.Components.setComponent('searchableDropdown', SearchableDropdown)
      console.log('✅ Searchable Dropdown component registered successfully')

      // Register SSN component
      const { SSNComponent } = await import('../components/formio/SSN')
      const TextFieldComponent = Formio.Components.components.textfield
      
      // Helper function to format SSN
      const formatSSN = (value: string): string => {
        const digits = value.replace(/\D/g, '')
        if (digits.length <= 3) {
          return digits
        } else if (digits.length <= 5) {
          return `${digits.slice(0, 3)}-${digits.slice(3)}`
        } else {
          return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 9)}`
        }
      }

      // Helper function to validate SSN
      const validateSSN = (value: string, options: { validateFormat?: boolean; validateRealSSN?: boolean; allowITIN?: boolean } = {}): { valid: boolean; message?: string } => {
        const { validateFormat = true, validateRealSSN = true, allowITIN = false } = options
        
        if (!value) return { valid: true }
        
        const digits = value.replace(/\D/g, '')
        
        if (digits.length !== 9) {
          return { valid: false, message: 'SSN must be exactly 9 digits' }
        }
        
        if (validateRealSSN) {
          const area = digits.slice(0, 3)
          const group = digits.slice(3, 5)
          const serial = digits.slice(5, 9)
          
          if (area === '000') return { valid: false, message: 'SSN area number cannot be 000' }
          if (area === '666') return { valid: false, message: 'SSN area number cannot be 666' }
          if (area.startsWith('9') && !allowITIN) return { valid: false, message: 'SSN area number cannot start with 9' }
          if (group === '00') return { valid: false, message: 'SSN group number cannot be 00' }
          if (serial === '0000') return { valid: false, message: 'SSN serial number cannot be 0000' }
        }
        
        return { valid: true }
      }

      // Define SSN schema separately to avoid self-reference issues
      const ssnSchema = {
        type: 'ssn',
        label: 'Social Security Number',
        key: 'ssn',
        inputType: 'text',
        inputMask: '999-99-9999',
        placeholder: '___-__-____',
        description: 'Enter your 9-digit Social Security Number',
        masked: true,
        allowToggleMask: true,
        validateFormat: true,
        validateRealSSN: true,
        allowITIN: false,
        preventCopy: true,
        autocomplete: 'off',
        spellcheck: false,
      }
      
      class SSNField extends TextFieldComponent {
        static schema(...extend: any[]) {
          return TextFieldComponent.schema(ssnSchema, ...extend)
        }

        static get builderInfo() {
          return {
            title: 'SSN',
            group: 'basic',
            icon: 'id-card',
            weight: 26,
            documentation: 'Social Security Number input with masking and validation',
            schema: SSNField.schema(),
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
                weight: 10,
              },
              {
                type: 'textfield',
                key: 'key',
                label: 'Property Name',
                input: true,
                weight: 20,
              },
              {
                type: 'textfield',
                key: 'placeholder',
                label: 'Placeholder',
                input: true,
                weight: 30,
              },
              {
                type: 'textarea',
                key: 'description',
                label: 'Description',
                input: true,
                weight: 40,
              },
              {
                type: 'checkbox',
                key: 'validate.required',
                label: 'Required',
                input: true,
                weight: 50,
              },
              {
                type: 'checkbox',
                key: 'masked',
                label: 'Mask SSN by Default',
                input: true,
                defaultValue: true,
                description: 'Display SSN as password field when not editing',
                weight: 60,
              },
              {
                type: 'checkbox',
                key: 'allowToggleMask',
                label: 'Allow Toggle Mask Visibility',
                input: true,
                defaultValue: true,
                description: 'Show eye icon to toggle SSN visibility',
                weight: 70,
              },
              {
                type: 'checkbox',
                key: 'preventCopy',
                label: 'Prevent Copy',
                input: true,
                defaultValue: true,
                description: 'Prevent users from copying the SSN value',
                weight: 80,
              },
              {
                type: 'checkbox',
                key: 'validateFormat',
                label: 'Validate SSN Format',
                input: true,
                defaultValue: true,
                description: 'Ensure SSN matches XXX-XX-XXXX format',
                weight: 90,
              },
              {
                type: 'checkbox',
                key: 'validateRealSSN',
                label: 'Validate Real SSN Rules',
                input: true,
                defaultValue: true,
                description: 'Check for invalid SSN patterns (000, 666, 9XX area numbers, etc.)',
                weight: 100,
              },
              {
                type: 'checkbox',
                key: 'allowITIN',
                label: 'Allow ITIN',
                input: true,
                defaultValue: false,
                description: 'Allow Individual Taxpayer Identification Numbers (9XX-XX-XXXX)',
                weight: 110,
              },
            ],
          }
        }

        ssnInput: HTMLInputElement | null = null
        toggleButton: HTMLButtonElement | null = null
        isMasked: boolean = true
        rawValue: string = ''

        constructor(component: any, options: any, data: any) {
          super(component, options, data)
          this.isMasked = component.masked !== false
          this.rawValue = ''
        }

        get defaultSchema() {
          return SSNField.schema()
        }

        init() {
          super.init()
        }

        render() {
          return super.render()
        }

        attach(element: HTMLElement) {
          const attached = super.attach(element)
          
          Promise.resolve(attached).then(() => {
            this.setupSSNInput()
          })
          
          return attached
        }

        setupSSNInput() {
          if (!this.element) return
          
          const inputContainer = this.element.querySelector('.form-control') as HTMLInputElement
          if (inputContainer && inputContainer.tagName === 'INPUT') {
            this.ssnInput = inputContainer
            
            inputContainer.setAttribute('autocomplete', 'off')
            inputContainer.setAttribute('autocorrect', 'off')
            inputContainer.setAttribute('autocapitalize', 'off')
            inputContainer.setAttribute('spellcheck', 'false')
            inputContainer.setAttribute('maxlength', '11')
            inputContainer.setAttribute('inputmode', 'numeric')
            inputContainer.setAttribute('aria-label', this.component.label || 'Social Security Number')
            inputContainer.setAttribute('placeholder', this.component.placeholder || '___-__-____')
            
            if (this.component.preventCopy) {
              inputContainer.addEventListener('copy', (e: ClipboardEvent) => {
                e.preventDefault()
                return false
              })
              inputContainer.addEventListener('cut', (e: ClipboardEvent) => {
                e.preventDefault()
                return false
              })
            }
            
            inputContainer.addEventListener('input', (e: Event) => {
              const target = e.target as HTMLInputElement
              const cursorPos = target.selectionStart || 0
              const oldValue = target.value
              const formatted = formatSSN(target.value)
              
              target.value = formatted
              this.rawValue = formatted.replace(/\D/g, '')
              
              const addedChars = formatted.length - oldValue.length
              const newCursorPos = Math.max(0, cursorPos + addedChars)
              target.setSelectionRange(newCursorPos, newCursorPos)
              
              this.updateValue()
            })
            
            inputContainer.addEventListener('paste', (e: ClipboardEvent) => {
              e.preventDefault()
              const pastedText = e.clipboardData?.getData('text') || ''
              const digits = pastedText.replace(/\D/g, '').slice(0, 9)
              const formatted = formatSSN(digits)
              inputContainer.value = formatted
              this.rawValue = digits
              this.updateValue()
            })
            
            inputContainer.addEventListener('keydown', (e: KeyboardEvent) => {
              const key = e.key
              const target = e.target as HTMLInputElement
              
              if (['Backspace', 'Delete', 'Tab', 'Escape', 'Enter'].includes(key)) return
              if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(key.toLowerCase())) return
              if (['Home', 'End', 'ArrowLeft', 'ArrowRight'].includes(key)) return
              
              if (!/^\d$/.test(key)) {
                e.preventDefault()
                return
              }
              
              const currentDigits = target.value.replace(/\D/g, '')
              if (currentDigits.length >= 9 && target.selectionStart === target.selectionEnd) {
                e.preventDefault()
              }
            })
            
            if (this.component.allowToggleMask && this.component.masked) {
              this.setupMaskToggle()
            }
            
            if (this.dataValue) {
              inputContainer.value = formatSSN(String(this.dataValue))
              this.rawValue = String(this.dataValue).replace(/\D/g, '')
            }
          }
        }

        setupMaskToggle() {
          if (!this.ssnInput) return
          
          if (!document.querySelector('#ssn-component-styles')) {
            const style = document.createElement('style')
            style.id = 'ssn-component-styles'
            style.textContent = `
              .ssn-input-wrapper {
                position: relative;
                display: flex;
                align-items: center;
              }
              .ssn-input-wrapper input {
                padding-right: 40px !important;
              }
              .ssn-mask-toggle {
                position: absolute;
                right: 8px;
                top: 50%;
                transform: translateY(-50%);
                background: transparent;
                border: none;
                cursor: pointer;
                padding: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #666;
                z-index: 10;
              }
              .ssn-mask-toggle:hover {
                color: #333;
              }
            `
            document.head.appendChild(style)
          }
          
          const toggleBtn = document.createElement('button')
          toggleBtn.type = 'button'
          toggleBtn.className = 'ssn-mask-toggle'
          toggleBtn.setAttribute('aria-label', 'Toggle SSN visibility')
          toggleBtn.innerHTML = `
            <svg class="eye-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <svg class="eye-off-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:none;">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          `
          
          this.toggleButton = toggleBtn
          
          const wrapper = document.createElement('div')
          wrapper.className = 'ssn-input-wrapper'
          
          if (this.ssnInput.parentNode) {
            this.ssnInput.parentNode.insertBefore(wrapper, this.ssnInput)
            wrapper.appendChild(this.ssnInput)
            wrapper.appendChild(toggleBtn)
          }
          
          toggleBtn.addEventListener('click', () => {
            this.isMasked = !this.isMasked
            this.updateMaskDisplay()
          })
          
          this.updateMaskDisplay()
        }

        updateMaskDisplay() {
          if (!this.toggleButton || !this.ssnInput) return
          
          const eyeIcon = this.toggleButton.querySelector('.eye-icon') as HTMLElement
          const eyeOffIcon = this.toggleButton.querySelector('.eye-off-icon') as HTMLElement
          
          if (this.isMasked) {
            this.ssnInput.setAttribute('type', 'password')
            if (eyeIcon) eyeIcon.style.display = 'block'
            if (eyeOffIcon) eyeOffIcon.style.display = 'none'
            this.toggleButton.setAttribute('aria-label', 'Show SSN')
          } else {
            this.ssnInput.setAttribute('type', 'text')
            if (eyeIcon) eyeIcon.style.display = 'none'
            if (eyeOffIcon) eyeOffIcon.style.display = 'block'
            this.toggleButton.setAttribute('aria-label', 'Hide SSN')
          }
        }

        getValue() {
          return this.rawValue ? formatSSN(this.rawValue) : ''
        }

        setValue(value: any, flags?: any) {
          if (!value) {
            this.rawValue = ''
            if (this.ssnInput) {
              this.ssnInput.value = ''
            }
            return super.setValue('', flags)
          }
          
          const strValue = String(value)
          const digits = strValue.replace(/\D/g, '')
          this.rawValue = digits
          const formatted = formatSSN(digits)
          
          if (this.ssnInput) {
            this.ssnInput.value = formatted
          }
          
          return super.setValue(formatted, flags)
        }

        checkValidity(data: any, dirty: boolean, rowData: any) {
          const valid = super.checkValidity(data, dirty, rowData)
          
          if (!valid) return false
          
          const value = this.getValue()
          
          if (!value && !this.component.validate?.required) return true
          
          if (!value && this.component.validate?.required) {
            this.setCustomValidity('SSN is required', dirty)
            return false
          }
          
          const validation = validateSSN(value, {
            validateFormat: this.component.validateFormat,
            validateRealSSN: this.component.validateRealSSN,
            allowITIN: this.component.allowITIN,
          })
          
          if (!validation.valid) {
            this.setCustomValidity(validation.message || 'Invalid SSN', dirty)
            return false
          }
          
          return true
        }

        destroy() {
          super.destroy()
        }
      }

      Formio.Components.setComponent('ssn', SSNField)
      console.log('✅ SSN component registered successfully')

      // Register Tab Navigation Buttons component
      const { TabNavigationButtonsComponent } = await import('../components/formio/TabNavigationButtons')
      
      const TabNavigationButtons = class extends BaseComponent {
        static schema(overrides?: any) {
          return TabNavigationButtonsComponent.schema(overrides)
        }

        static get builderInfo() {
          return {
            title: 'Tab Navigation Buttons',
            group: 'basic', // Show in Basic section
            icon: 'bars',
            weight: 30, // Position in the list
            documentation: 'https://formio.github.io/formio.js/app/examples/customcomponents.html',
            schema: TabNavigationButtonsComponent.schema(),
          }
        }

        static editForm() {
          return TabNavigationButtonsComponent.editForm()
        }

        constructor(component: any, options: any, data: any) {
          super(component, options, data)
        }

        init() {
          super.init()
        }

        render() {
          return super.render('tabnavigationbuttons')
        }

        attach(element: HTMLElement) {
          const instance = new TabNavigationButtonsComponent(this.component, this.options, this.data)
          instance.root = this.root
          return instance.attach(element)
        }
      }

      Formio.Components.setComponent('tabnavigationbuttons', TabNavigationButtons)
      console.log('✅ Tab Navigation Buttons component registered successfully')

      // Register Tab Progress Bar component
      const { TabProgressComponent } = await import('../components/formio/TabProgressComponent')
      
      const TabProgress = class extends BaseComponent {
        static schema(overrides?: any) {
          return TabProgressComponent.schema(overrides)
        }

        static get builderInfo() {
          return TabProgressComponent.builderInfo
        }

        static editForm() {
          return TabProgressComponent.editForm()
        }

        constructor(component: any, options: any, data: any) {
          super(component, options, data)
        }

        init() {
          super.init()
        }

        render() {
          return super.render('tabprogress')
        }

        attach(element: HTMLElement) {
          const instance = new TabProgressComponent(this.component, this.options, this.data)
          instance.root = this.root
          return instance.attach(element)
        }
      }

      Formio.Components.setComponent('tabprogress', TabProgress)
      console.log('✅ Tab Progress Bar component registered successfully')
    } else {
      console.warn('Form.io Components API not available')
    }

    return Formio
  } catch (error) {
    console.error('Error registering custom Form.io components:', error)
    throw error
  }
}

/**
 * Get builder configuration with custom components
 * Note: Advanced tab is hidden (premium features)
 */
export function getBuilderConfig() {
  return {
    // Use bootstrap template so Wizard builder shows page tabs and "+ PAGE" button
    template: 'bootstrap',
    builder: {
      basic: {
        default: true,
        components: {
          textfield: true,
          textarea: true,
          number: true,
          password: true,
          checkbox: true,
          selectboxes: true,
          email: true,
          hidden: true,
          select: true,
          radio: true,
          button: true,
          currency: true,
          datetime: true,
          documentViewer: true, // Custom Document Viewer component in Basic tab
          documentUpload: true, // Custom Document Upload component in Basic tab
          searchableDropdown: true, // Custom Searchable Dropdown component in Basic tab
          ssn: true, // Custom SSN component in Basic tab
          tabnavigationbuttons: true, // Custom Tab Navigation Buttons component in Basic tab
          tabprogress: true, // Custom Tab Progress Bar component in Basic tab
        },
      },
      advanced: false,
      layout: {
        default: true,
        components: {
          htmlelement: true,
          content: true,
          columns: true,
          fieldset: true,
          panel: true,
          well: true,
        },
      },
      data: {
        default: false,
      },
      premium: false,
    },
  }
}
