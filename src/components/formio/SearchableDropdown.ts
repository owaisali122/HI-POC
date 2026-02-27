/**
 * Custom Form.io Searchable Dropdown Component
 * 
 * Features:
 * - Dynamic data loading from API endpoint
 * - Real-time search/filter functionality with debouncing
 * - Loading states during API calls
 * - Error handling and display
 * - Keyboard navigation support
 * - All default select features (required, validation, etc.)
 * - Configurable API endpoint
 * - Minimum search length configuration
 * - Debounce delay configuration
 */

export class SearchableDropdownComponent {
  // Instance properties (set in constructor / setupSearchableDropdown; inherited from Form.io select at runtime)
  declare component: any
  declare options: any
  declare data: any
  declare element: HTMLElement
  declare dataValue: any
  declare value: any
  declare valueProperty: string
  declare labelProperty: string

  searchInput: HTMLInputElement | null = null
  dropdownContainer: HTMLDivElement | null = null
  optionsContainer: HTMLDivElement | null = null
  selectedTagsContainer: HTMLDivElement | null = null
  isLoading = false
  searchResults: any[] = []
  selectedValues: any[] = []
  selectedLabels: string[] = []
  debounceTimer: ReturnType<typeof setTimeout> | null = null
  currentHighlightIndex = -1
  multiple = false
  apiUrl = ''
  minSearchLength = 2
  debounceDelay = 300

  /** Get Form.io Select component prototype (avoids calling registry wrapper and causing recursion) */
  private static getSelectProto(): { init?: () => void; setValue?: (v: any) => void; destroy?: () => void } | null {
    const Formio = (typeof window !== 'undefined' && (window as any).Formio) || (typeof global !== 'undefined' && (global as any).Formio)
    return Formio?.Components?.components?.select?.prototype ?? null
  }

  static schema(overrides?: any) {
    return {
      type: 'searchableDropdown',
      label: 'Searchable Dropdown',
      key: 'searchableDropdown',
      input: true,
      placeholder: 'Type to search...',
      description: 'Search and select from dynamic options',
      dataSrc: 'url',
      data: {
        url: '/api/searchable-dropdown',
        method: 'GET',
      },
      minSearchLength: 2,
      debounceDelay: 300,
      multiple: false,
      ...overrides,
    }
  }

  static get builderInfo() {
    return {
      title: 'Searchable Dropdown',
      group: 'basic',
      icon: 'search',
      weight: 30,
      documentation: 'Dropdown with search functionality that loads data from an API endpoint',
      schema: SearchableDropdownComponent.schema(),
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
          defaultValue: 'Searchable Dropdown',
        },
        {
          type: 'textfield',
          key: 'key',
          label: 'Property Name',
          input: true,
          defaultValue: 'searchableDropdown',
          tooltip: 'The property name in the data object',
        },
        {
          type: 'checkbox',
          key: 'validate.required',
          label: 'Required',
          input: true,
          defaultValue: false,
        },
        {
          type: 'textfield',
          key: 'placeholder',
          label: 'Placeholder',
          input: true,
          defaultValue: 'Type to search...',
        },
        {
          type: 'textfield',
          key: 'description',
          label: 'Description',
          input: true,
          defaultValue: 'Search and select from dynamic options',
        },
        {
          type: 'checkbox',
          key: 'clearOnHide', // Form.io ki internal property
          label: 'Clear Value When Hidden/New Row',
          input: true,
          defaultValue: true, // By default ise true rakhein
          tooltip: 'Clear Value When Hidden/New Row',
          weight: 160 // Isay list mein niche dikhane ke liye
        },
        {
          type: 'checkbox',
          key: 'clearOnRefresh',
          label: 'Clear Value on Refresh',
          input: true,
          defaultValue: true,
          tooltip: 'Clear Value on Refresh',
          weight: 170
        },
        {
          type: 'checkbox',
          key: 'hideLabel',
          label: 'Hide Label',
          input: true,
          defaultValue: false,
          tooltip: 'Hide the label of this component',
          weight: 10, // Position it near the top
        },
        {
          type: 'checkbox',
          key: 'tableView',
          label: 'Table View',
          input: true,
          defaultValue: true,
          tooltip: 'Show this field in table/grid view',
          weight: 150,
        },
        {
          type: 'textfield',
          key: 'data.url',
          label: 'API Endpoint',
          input: true,
          defaultValue: '/api/searchable-dropdown',
          tooltip: 'API endpoint URL. Use ${query} placeholder(s) for search term. Example: https://restcountries.com/v3.1/name/${query}',
          description: 'Use ${query} in URL to replace with search value. Multiple ${query}, ${query1}, etc. are supported.',
        },
        {
          type: 'checkbox',
          key: 'multiple',
          label: 'Multiple Selection',
          input: true,
          defaultValue: false,
          tooltip: 'Allow users to select multiple options with checkboxes',
        },
        {
          type: 'number',
          key: 'minSearchLength',
          label: 'Minimum Search Length',
          input: true,
          defaultValue: 2,
          tooltip: 'Minimum number of characters before triggering search',
        },
        {
          type: 'number',
          key: 'debounceDelay',
          label: 'Debounce Delay (ms)',
          input: true,
          defaultValue: 300,
          tooltip: 'Delay in milliseconds before triggering search after user stops typing',
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

    // Extend from select component
    const SelectComponent = Formio.Components.components.select
    const instance = new SelectComponent(component, options, data)

    // Copy all properties and methods
    Object.setPrototypeOf(this, Object.getPrototypeOf(instance))
    Object.assign(this, instance)

    // Store component config
    this.component = component
    this.options = options
    this.data = data

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
    
    // Read configuration from component (handle nested data.url from editForm)
    const dataUrl = component.data?.url || (component.data && typeof component.data === 'object' && component.data.url) || null
    this.apiUrl = dataUrl || '/api/searchable-dropdown'
    this.minSearchLength = component.minSearchLength || 2
    this.debounceDelay = component.debounceDelay || 300
  }

  init() {
    // Call Form.io Select init directly (not wrapper's init to avoid recursion when used via registry)
    const selectProto = SearchableDropdownComponent.getSelectProto()
    if (selectProto?.init && typeof selectProto.init === 'function') {
      selectProto.init.call(this)
    }
    this.setupSearchableDropdown()
  }

  setupSearchableDropdown() {
    if (!this.element) return

    // Show required asterisk (*) on label in preview UI (deferred so label exists in DOM)
    const addRequiredAsterisk = () => {
      const isRequired = this.component?.required === true || this.component?.validate?.required === true
      if (!isRequired) return
      const labelEl =
        this.element.querySelector('label') ||
        this.element.querySelector('.control-label') ||
        this.element.querySelector('[ref="label"]')
      if (labelEl && !labelEl.querySelector('.searchable-dropdown-required-asterisk')) {
        const asterisk = document.createElement('span')
        asterisk.className = 'searchable-dropdown-required-asterisk'
        asterisk.setAttribute('aria-hidden', 'true')
        asterisk.textContent = ' *'
        asterisk.style.color = '#dc3545'
        asterisk.style.marginLeft = '2px'
        labelEl.appendChild(asterisk)
      }
    }
    setTimeout(addRequiredAsterisk, 0)

    // Find the select element
    const selectElement = this.element.querySelector('select')
    if (!selectElement) return

    // Hide the original select
    selectElement.style.display = 'none'

    // Create wrapper for searchable dropdown
    const wrapper = document.createElement('div')
    wrapper.className = 'searchable-dropdown-wrapper'
    wrapper.style.position = 'relative'
    wrapper.style.width = '100%'

    // Create search input
    this.searchInput = document.createElement('input')
    this.searchInput.type = 'text'
    this.searchInput.className = 'form-control searchable-dropdown-input'
    this.searchInput.placeholder = this.component.placeholder || 'Type to search...'
    this.searchInput.autocomplete = 'off'
    this.searchInput.setAttribute('role', 'combobox')
    this.searchInput.setAttribute('aria-expanded', 'false')
    this.searchInput.setAttribute('aria-haspopup', 'listbox')
    this.searchInput.setAttribute('aria-autocomplete', 'list')

    // Style the input
    this.searchInput.style.cssText = `
      width: 100%;
      padding: 8px 30px 8px 12px;
      border: 1px solid #ced4da;
      border-radius: 4px;
      font-size: 14px;
      line-height: 1.5;
    `

    // Create loading indicator container
    const loadingContainer = document.createElement('div')
    loadingContainer.className = 'searchable-dropdown-loading'
    loadingContainer.style.cssText = `
      position: absolute;
      right: 30px;
      top: 50%;
      transform: translateY(-50%);
      pointer-events: none;
      display: none;
    `

    // Create dropdown icon
    const dropdownIcon = document.createElement('span')
    dropdownIcon.className = 'searchable-dropdown-icon'
    dropdownIcon.innerHTML = '▼'
    dropdownIcon.style.cssText = `
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      pointer-events: none;
      color: #6c757d;
      font-size: 12px;
    `

    // Create options container
    this.optionsContainer = document.createElement('div')
    this.optionsContainer.className = 'searchable-dropdown-options'
    this.optionsContainer.setAttribute('role', 'listbox')
    this.optionsContainer.style.cssText = `
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 1px solid #ced4da;
      border-top: none;
      border-radius: 0 0 4px 4px;
      max-height: 300px;
      overflow-y: auto;
      z-index: 1000;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      display: none;
    `

    // Create selected tags container for multi-selection
    if (this.multiple) {
      this.selectedTagsContainer = document.createElement('div')
      this.selectedTagsContainer.className = 'searchable-dropdown-selected-tags'
      this.selectedTagsContainer.style.cssText = `
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 8px;
        min-height: 32px;
      `
    }

    // Create dropdown container
    this.dropdownContainer = document.createElement('div')
    this.dropdownContainer.className = 'searchable-dropdown-container'
    this.dropdownContainer.style.position = 'relative'
    this.dropdownContainer.style.width = '100%'

    // Assemble the structure
    wrapper.appendChild(this.dropdownContainer)
    if (this.multiple && this.selectedTagsContainer) {
      this.dropdownContainer.appendChild(this.selectedTagsContainer)
    }
    this.dropdownContainer.appendChild(this.searchInput)
    this.dropdownContainer.appendChild(loadingContainer)
    this.dropdownContainer.appendChild(dropdownIcon)
    this.dropdownContainer.appendChild(this.optionsContainer)

    // Insert wrapper after select element
    selectElement.parentNode?.insertBefore(wrapper, selectElement.nextSibling)

    // Set initial value if exists
    const currentValue = this.dataValue || this.value
    if (currentValue) {
      if (this.multiple) {
        // Handle array of values for multi-selection
        this.selectedValues = Array.isArray(currentValue) ? currentValue : [currentValue]
        this.selectedLabels = this.selectedValues.map(val => this.getLabelForValue(val) || val)
        this.renderSelectedTags()
        this.searchInput.placeholder = this.component.placeholder || 'Type to search...'
      } else {
        // Single selection
        this.selectedValues = [currentValue]
        this.selectedLabels = [this.getLabelForValue(currentValue) || currentValue]
        this.searchInput.value = this.selectedLabels[0]
      }
    } else {
      this.selectedValues = []
      this.selectedLabels = []
    }

    // Handle input changes with debouncing
    this.searchInput?.addEventListener('input', (e) => {
      const query = (e.target as HTMLInputElement).value.trim()
      this.handleSearch(query)
    })

    // Handle input focus
    this.searchInput?.addEventListener('focus', () => {
      this.openDropdown()
      const query = this.searchInput?.value.trim() ?? ''
      if (query.length >= this.minSearchLength) {
        this.handleSearch(query)
      }
    })

    // Handle input blur (with delay to allow option clicks)
    this.searchInput?.addEventListener('blur', () => {
      setTimeout(() => {
        this.closeDropdown()
      }, 200)
    })

    // Handle keyboard navigation
    this.searchInput?.addEventListener('keydown', (e) => {
      this.handleKeyDown(e)
    })

    // Handle click outside to close dropdown
    document.addEventListener('click', (e) => {
      if (this.dropdownContainer && !this.dropdownContainer.contains(e.target as Node)) {
        this.closeDropdown()
      }
    })
  }

  handleSearch(query: string) {
    // Clear existing debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }

    // If query is too short, clear results
    if (query.length < this.minSearchLength) {
      this.searchResults = []
      this.renderOptions()
      return
    }

    // Show loading indicator
    this.showLoading()

    // Debounce the API call
    this.debounceTimer = setTimeout(() => {
      this.performSearch(query)
    }, this.debounceDelay)
  }

  async performSearch(query: string) {
    try {
      this.isLoading = true

      // Replace ${query} placeholders in URL with actual search value
      // Supports multiple placeholders: ${query}, ${query1}, ${query2}, etc.
      // All are replaced with the same search value
      let urlString = this.apiUrl
      
      // Check if URL contains ${query} placeholder
      const hasPlaceholder = urlString.includes('${query')
      
      if (hasPlaceholder) {
        // Replace all ${query}, ${query1}, ${query2}, etc. with the search value
        urlString = urlString.replace(/\$\{query\d*\}/g, encodeURIComponent(query))
        
        // For relative URLs with placeholders, resolve against origin
        if (!urlString.startsWith('http://') && !urlString.startsWith('https://')) {
          urlString = new URL(urlString, window.location.origin).toString()
        }
      } else {
        // If URL doesn't have ${query} placeholder, treat as relative URL and add query param
        const url = new URL(urlString, window.location.origin)
        url.searchParams.set('query', query)
        urlString = url.toString()
      }

      // Fetch results
      const response = await fetch(urlString, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`)
      }

      const data = await response.json()

      // Handle different response formats
      if (Array.isArray(data)) {
        this.searchResults = data
      } else if (data.results && Array.isArray(data.results)) {
        this.searchResults = data.results
      } else if (data.data && Array.isArray(data.data)) {
        this.searchResults = data.data
      } else {
        this.searchResults = []
      }

      this.renderOptions()
    } catch (error) {
      console.error('Search error:', error)
      this.showError('Failed to load options. Please try again.')
      this.searchResults = []
      this.renderOptions()
    } finally {
      this.isLoading = false
      this.hideLoading()
    }
  }

  renderOptions() {
    if (!this.optionsContainer) return

    // Clear existing options
    this.optionsContainer.innerHTML = ''

    // Show "No results" message if no results
    if (this.searchResults.length === 0 && !this.isLoading) {
      const noResults = document.createElement('div')
      noResults.className = 'searchable-dropdown-no-results'
      noResults.textContent = 'No results found'
      noResults.style.cssText = `
        padding: 12px;
        text-align: center;
        color: #6c757d;
        font-size: 14px;
      `
      this.optionsContainer.appendChild(noResults)
      return
    }

    // Render options
    this.searchResults.forEach((result: any, index: number) => {
      const option = document.createElement('div')
      option.className = 'searchable-dropdown-option'
      option.setAttribute('role', 'option')
      option.setAttribute('data-index', index.toString())
      
      // Use default property names: 'value' and 'label'
      const value = result.value || result.id || result.code || result
      const label = result.label || result.name || result.title || result
      const isSelected = this.selectedValues.includes(value)

      // Create option content
      if (this.multiple) {
        // Multi-selection mode: show checkbox
        option.style.cssText = `
          padding: 10px 12px;
          cursor: pointer;
          border-bottom: 1px solid #eee;
          transition: background-color 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        `

        // Create checkbox
        const checkbox = document.createElement('input')
        checkbox.type = 'checkbox'
        checkbox.checked = isSelected
        checkbox.style.cssText = `
          width: 16px;
          height: 16px;
          cursor: pointer;
          margin: 0;
        `

        // Create label
        const labelElement = document.createElement('span')
        labelElement.textContent = label
        labelElement.style.cssText = `
          flex: 1;
          user-select: none;
        `

        option.appendChild(checkbox)
        option.appendChild(labelElement)

        // Highlight if selected
        if (isSelected) {
          option.style.backgroundColor = '#e7f3ff'
          option.style.fontWeight = '500'
        }

        // Handle checkbox change
        checkbox.addEventListener('change', (e) => {
          e.stopPropagation()
          this.toggleOption(value, label)
        })

        // Handle option click (toggle checkbox)
        option.addEventListener('click', (e) => {
          if (e.target !== checkbox) {
            checkbox.checked = !checkbox.checked
            this.toggleOption(value, label)
          }
        })
      } else {
        // Single selection mode: no checkbox
        option.textContent = label
        option.style.cssText = `
          padding: 10px 12px;
          cursor: pointer;
          border-bottom: 1px solid #eee;
          transition: background-color 0.2s;
        `

        // Highlight if selected
        if (isSelected) {
          option.style.backgroundColor = '#e7f3ff'
          option.style.fontWeight = '500'
        }

        // Handle option click
        option.addEventListener('click', () => {
          this.selectOption(value, label)
        })
      }

      // Hover effect
      option.addEventListener('mouseenter', () => {
        if (!isSelected || !this.multiple) {
          option.style.backgroundColor = '#f5f5f5'
        }
        this.currentHighlightIndex = index
      })

      option.addEventListener('mouseleave', () => {
        if (!isSelected || !this.multiple) {
          option.style.backgroundColor = ''
        } else {
          option.style.backgroundColor = '#e7f3ff'
        }
      })

      this.optionsContainer?.appendChild(option)
    })
  }

  selectOption(value: any, label: string) {
    if (this.multiple) {
      // Multi-selection: toggle the option
      this.toggleOption(value, label)
    } else {
      // Single selection
      this.selectedValues = [value]
      this.selectedLabels = [label]
      if (this.searchInput) this.searchInput.value = label
      this.closeDropdown()

      // Update the hidden select element
      const selectElement = this.element.querySelector('select')
      if (selectElement) {
        selectElement.value = value
        // Trigger change event
        const event = new Event('change', { bubbles: true })
        selectElement.dispatchEvent(event)
      }

      // Update component value
      this.setValue(value)

      // Trigger Form.io change event
      if (this.options && this.options.change) {
        this.options.change(this, value, value)
      }
    }
  }

  toggleOption(value: any, label: string) {
    if (!this.multiple) return

    const index = this.selectedValues.indexOf(value)
    
    if (index > -1) {
      // Remove from selection
      this.selectedValues.splice(index, 1)
      this.selectedLabels.splice(index, 1)
    } else {
      // Add to selection
      this.selectedValues.push(value)
      this.selectedLabels.push(label)
    }

    // Update UI
    this.renderSelectedTags()
    this.renderOptions() // Re-render to update checkboxes

    // Clear search input
    if (this.searchInput) this.searchInput.value = ''

    // Update the hidden select element (for multi-select, set multiple values)
    const selectElement = this.element.querySelector('select')
    if (selectElement) {
      // Clear all options first
      Array.from(selectElement.options).forEach(opt => {
        opt.selected = false
      })
      // Select the selected values
      this.selectedValues.forEach(val => {
        const option = Array.from(selectElement.options).find(opt => opt.value === String(val))
        if (option) {
          option.selected = true
        }
      })
      // Trigger change event
      const event = new Event('change', { bubbles: true })
      selectElement.dispatchEvent(event)
    }

    // Update component value
    this.setValue(this.selectedValues.length === 1 ? this.selectedValues[0] : this.selectedValues)

    // Trigger Form.io change event
    if (this.options && this.options.change) {
      this.options.change(this, this.selectedValues, this.selectedValues)
    }
  }

  renderSelectedTags() {
    if (!this.multiple || !this.selectedTagsContainer) return

    // Clear existing tags
    this.selectedTagsContainer.innerHTML = ''

    // Render each selected tag
    this.selectedValues.forEach((value, index) => {
      const label = this.selectedLabels[index] || value
      
      const tag = document.createElement('div')
      tag.className = 'searchable-dropdown-tag'
      tag.style.cssText = `
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 8px;
        background-color: #e7f3ff;
        border: 1px solid #b3d9ff;
        border-radius: 4px;
        font-size: 13px;
        color: #0056b3;
      `

      const tagLabel = document.createElement('span')
      tagLabel.textContent = label
      tagLabel.style.cssText = `
        user-select: none;
      `

      const removeButton = document.createElement('button')
      removeButton.type = 'button'
      removeButton.innerHTML = '×'
      removeButton.setAttribute('aria-label', `Remove ${label}`)
      removeButton.style.cssText = `
        background: none;
        border: none;
        color: #0056b3;
        cursor: pointer;
        font-size: 18px;
        line-height: 1;
        padding: 0;
        margin: 0;
        width: 18px;
        height: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 2px;
        transition: background-color 0.2s;
      `

      removeButton.addEventListener('mouseenter', () => {
        removeButton.style.backgroundColor = '#b3d9ff'
      })

      removeButton.addEventListener('mouseleave', () => {
        removeButton.style.backgroundColor = 'transparent'
      })

      removeButton.addEventListener('click', (e) => {
        e.stopPropagation()
        this.toggleOption(value, label)
      })

      tag.appendChild(tagLabel)
      tag.appendChild(removeButton)
      this.selectedTagsContainer?.appendChild(tag)
    })
  }

  handleKeyDown(e: KeyboardEvent) {
    if (!this.optionsContainer) return
    const options = this.optionsContainer.querySelectorAll('.searchable-dropdown-option')
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        this.currentHighlightIndex = Math.min(
          this.currentHighlightIndex + 1,
          options.length - 1
        )
        this.highlightOption(options)
        break

      case 'ArrowUp':
        e.preventDefault()
        this.currentHighlightIndex = Math.max(this.currentHighlightIndex - 1, -1)
        this.highlightOption(options)
        break

      case 'Enter':
        e.preventDefault()
        if (this.currentHighlightIndex >= 0 && options[this.currentHighlightIndex]) {
          const option = options[this.currentHighlightIndex] as HTMLElement
          const index = parseInt(option.getAttribute('data-index') || '0')
          const result = this.searchResults[index]
          if (result) {
            const value = result[this.valueProperty] || result.value || result
            const label = result[this.labelProperty] || result.label || result
            if (this.multiple) {
              // Toggle checkbox in multi-selection mode
              const checkbox = option.querySelector('input[type="checkbox"]') as HTMLInputElement
              if (checkbox) {
                checkbox.checked = !checkbox.checked
                this.toggleOption(value, label)
              }
            } else {
              this.selectOption(value, label)
            }
          }
        }
        break

      case 'Escape':
        e.preventDefault()
        this.closeDropdown()
        break
    }
  }

  highlightOption(options: NodeListOf<Element>) {
    options.forEach((option, index) => {
      const optionElement = option as HTMLElement
      const result = this.searchResults[index]
      const value = result?.[this.valueProperty] || result?.value || result
      const isSelected = this.selectedValues.includes(value)
      
      if (index === this.currentHighlightIndex) {
        optionElement.style.backgroundColor = '#e7f3ff'
        optionElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      } else {
        if (this.multiple && isSelected) {
          optionElement.style.backgroundColor = '#e7f3ff'
        } else {
          optionElement.style.backgroundColor = ''
        }
      }
    })
  }

  openDropdown() {
    if (!this.optionsContainer) return
    this.optionsContainer.style.display = 'block'
    this.searchInput?.setAttribute('aria-expanded', 'true')
  }

  closeDropdown() {
    if (!this.optionsContainer) return
    this.optionsContainer.style.display = 'none'
    this.searchInput?.setAttribute('aria-expanded', 'false')
    this.currentHighlightIndex = -1
  }

  showLoading() {
    const loadingContainer = this.dropdownContainer?.querySelector('.searchable-dropdown-loading')
    if (loadingContainer) {
      loadingContainer.innerHTML = `
        <div style="
          width: 16px;
          height: 16px;
          border: 2px solid #f3f3f3;
          border-top: 2px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        "></div>
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      `
      ;(loadingContainer as HTMLElement).style.display = 'block'
    }
  }

  hideLoading() {
    const loadingContainer = this.dropdownContainer?.querySelector('.searchable-dropdown-loading')
    if (loadingContainer) {
      ;(loadingContainer as HTMLElement).style.display = 'none'
    }
  }

  showError(message: string) {
    if (!this.optionsContainer) return
    this.optionsContainer.innerHTML = `
      <div class="searchable-dropdown-error" style="
        padding: 12px;
        color: #dc3545;
        font-size: 14px;
        text-align: center;
      ">${message}</div>
    `
  }

  getLabelForValue(value: any): string | null {
    // Try to find label in search results
    const result = this.searchResults.find(
      (r: any) => (r.value || r.id || r.code || r) === value
    )
    if (result) {
      return result.label || result.name || result.title || result
    }
    return null
  }

  getValue() {
    if (this.multiple) {
      return this.selectedValues.length > 0 ? this.selectedValues : (this.dataValue || this.value || [])
    }
    return this.selectedValues.length > 0 ? this.selectedValues[0] : (this.dataValue || this.value || '')
  }

  setValue(value: any) {
    if (this.multiple) {
      // Handle array of values for multi-selection
      this.selectedValues = Array.isArray(value) ? value : (value ? [value] : [])
      this.selectedLabels = this.selectedValues.map(val => this.getLabelForValue(val) || val)
      this.renderSelectedTags()
      
      if (this.searchInput) {
        this.searchInput.value = ''
        this.searchInput.placeholder = this.component.placeholder || 'Type to search...'
      }
    } else {
      // Single selection
      this.selectedValues = value ? [value] : []
      this.selectedLabels = value ? [this.getLabelForValue(value) || value] : []
      
      if (this.searchInput) {
        const label = this.getLabelForValue(value)
        if (label) {
          this.searchInput.value = label
        } else {
          this.searchInput.value = value || ''
        }
      }
    }

    this.dataValue = value
    this.value = value

    // Update hidden select
    const selectElement = this.element?.querySelector('select')
    if (selectElement) {
      if (this.multiple) {
        // Clear all options first
        Array.from(selectElement.options).forEach(opt => {
          opt.selected = false
        })
        // Select the selected values
        this.selectedValues.forEach(val => {
          const option = Array.from(selectElement.options).find(opt => opt.value === String(val))
          if (option) {
            option.selected = true
          }
        })
      } else {
        selectElement.value = value || ''
      }
    }

    // Re-render options to update checkboxes
    if (this.multiple && this.searchResults.length > 0) {
      this.renderOptions()
    }

    // Call Form.io Select setValue directly (not wrapper's to avoid recursion when used via registry)
    const selectProto = SearchableDropdownComponent.getSelectProto()
    if (selectProto?.setValue && typeof selectProto.setValue === 'function') {
      selectProto.setValue.call(this, value)
    }
  }

  destroy() {
    // Clear debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }

    // Remove event listeners
    if (this.searchInput) {
      this.searchInput.remove()
    }

    if (this.dropdownContainer) {
      this.dropdownContainer.remove()
    }

    // Call Form.io Select destroy directly (not wrapper's to avoid recursion when used via registry)
    const selectProto = SearchableDropdownComponent.getSelectProto()
    if (selectProto?.destroy && typeof selectProto.destroy === 'function') {
      selectProto.destroy.call(this)
    }
  }
}
