/**
 * Custom Form.io Address Search Component
 * 
 * Allows users to search and select addresses using a configurable API endpoint.
 * Works in both Form Builder (Designer) and Form Renderer (Runtime).
 */

export class AddressSearchComponent {
  static schema(overrides?: any) {
    return {
      type: 'addressSearch',
      label: 'Address Search',
      key: 'addressSearch',
      input: true,
      placeholder: 'Start typing an address...',
      description: 'Search and select an address from the configured API',
      // Custom properties
      apiEndpoint: '',
      minSearchLength: 3,
      debounceTime: 300,
      maxResults: 10,
      showFullAddress: true,
      showSearchIcon: true,
      showLoadingIndicator: true,
      enableKeyboardNavigation: true,
      cacheResults: true,
      dropdownHeight: '300px',
      // Selection options
      multiple: false, // Support for single or multiple selection (default: single)
      // Output format options
      outputFormat: 'object', // 'object' | 'string' | 'formatted'
      ...overrides,
    }
  }

  static get builderInfo() {
    return {
      title: 'Address Search',
      group: 'basic',
      icon: 'map-marker',
      weight: 30,
      documentation: 'https://formio.github.io/formio.js/app/examples/customcomponents.html',
      schema: AddressSearchComponent.schema(),
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
          defaultValue: 'Address Search',
        },
        {
          type: 'textfield',
          key: 'key',
          label: 'Property Name',
          input: true,
          defaultValue: 'addressSearch',
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
          defaultValue: 'Start typing an address...',
        },
        {
          type: 'textarea',
          key: 'description',
          label: 'Description',
          input: true,
          defaultValue: 'Search and select an address from the configured API',
        },
        {
          type: 'textfield',
          key: 'apiEndpoint',
          label: 'API Endpoint',
          input: true,
          placeholder: '/api/address-search?q={query}',
          description: 'API endpoint URL for address search. Use {query} placeholder for search term.',
          tooltip: 'Example: /api/address-search?q={query} or https://api.example.com/addresses/search?q={query}',
        },
        {
          type: 'checkbox',
          key: 'multiple',
          label: 'Allow Multiple Selection',
          input: true,
          defaultValue: false,
          description: 'Enable users to select multiple addresses (default: single selection)',
        },
        {
          type: 'number',
          key: 'minSearchLength',
          label: 'Minimum Search Length',
          input: true,
          defaultValue: 3,
          description: 'Minimum number of characters before triggering search (default: 3)',
        },
        {
          type: 'number',
          key: 'debounceTime',
          label: 'Debounce Time (ms)',
          input: true,
          defaultValue: 300,
          description: 'Delay before triggering search after user stops typing (default: 300ms)',
        },
        {
          type: 'number',
          key: 'maxResults',
          label: 'Maximum Results',
          input: true,
          defaultValue: 10,
          description: 'Maximum number of search results to display (default: 10)',
        },
        {
          type: 'checkbox',
          key: 'showFullAddress',
          label: 'Show Full Address',
          input: true,
          defaultValue: true,
          description: 'Display the full formatted address in the input field (default: true)',
        },
        {
          type: 'checkbox',
          key: 'showSearchIcon',
          label: 'Show Search Icon',
          input: true,
          defaultValue: true,
          description: 'Display search icon in the input field (default: true)',
        },
        {
          type: 'checkbox',
          key: 'showLoadingIndicator',
          label: 'Show Loading Indicator',
          input: true,
          defaultValue: true,
          description: 'Display loading indicator during search (default: true)',
        },
        {
          type: 'select',
          key: 'outputFormat',
          label: 'Output Format',
          input: true,
          defaultValue: 'object',
          data: {
            values: [
              { label: 'Object (Full Address Data)', value: 'object' },
              { label: 'String (Formatted Address)', value: 'string' },
              { label: 'Formatted (Single Line)', value: 'formatted' },
            ],
          },
          description: 'How the selected address should be stored (default: object)',
        },
        {
          type: 'textfield',
          key: 'dropdownHeight',
          label: 'Dropdown Height',
          input: true,
          defaultValue: '300px',
          description: 'Maximum height of the dropdown results (default: 300px)',
        },
        {
          type: 'checkbox',
          key: 'enableKeyboardNavigation',
          label: 'Enable Keyboard Navigation',
          input: true,
          defaultValue: true,
          description: 'Allow arrow keys and Enter to navigate and select (default: true)',
        },
        {
          type: 'checkbox',
          key: 'cacheResults',
          label: 'Cache Search Results',
          input: true,
          defaultValue: true,
          description: 'Cache search results to improve performance (default: true)',
        },
      ],
    }
  }

  constructor(component: any, options: any, data: any) {
    // Get Form.io from global scope (loaded by FormBuilderField)
    const Formio = (window as any).Formio || (global as any).Formio
    if (!Formio || !Formio.Components) {
      console.error('Form.io Components not available')
      return
    }

    // Extend from textfield component
    const TextFieldComponent = Formio.Components.components.textfield
    const instance = new TextFieldComponent(component, options, data)

    // Copy all properties and methods
    Object.setPrototypeOf(this, Object.getPrototypeOf(instance))
    Object.assign(this, instance)

    // Store component config
    this.component = component
    this.options = options
    this.data = data
    this.searchTimeout = null
    this.searchResults = []
    this.selectedAddress = null
    this.selectedAddresses = [] // For multiple selection
    this.isSearching = false
    this.dropdownElement = null
    this.currentHighlightedIndex = -1
    this.loadingIndicator = null
    this.originalValue = null
    this.searchCache = new Map<string, any[]>()
    this.memoizedSearch = null
    this.selectedTagsContainer = null
  }

  init() {
    // Call parent init if it exists
    if (super.init && typeof super.init === 'function') {
      super.init.call(this)
    }
    this.setupAddressSearch()
  }

  setupAddressSearch() {
    if (!this.element) return

    const input = this.element.querySelector('input')
    if (!input) return

    // Check if multiple selection is enabled
    const isMultiple = this.component.multiple === true

    // Check if we have an existing value (edit mode)
    // Form.io stores values in multiple places, check all of them
    const existingValue = 
      this.dataValue || 
      this.value || 
      (this.data && this.data[this.component.key]) ||
      (this.data && this.data[this.component.name]) ||
      input.value

    const isEditMode = !!existingValue && existingValue !== '' && existingValue !== null && 
                       (isMultiple ? (Array.isArray(existingValue) && existingValue.length > 0) : true)

    // If in edit mode, just display the value without search functionality
    if (isEditMode) {
      if (isMultiple && Array.isArray(existingValue)) {
        // Multiple selection mode - show selected addresses as tags
        this.selectedAddresses = existingValue
        // Set up tags container first
        this.setupSearchFunctionality(input, isMultiple)
        this.renderSelectedTags()
        input.value = ''
      } else {
        // Single selection mode
        let displayValue = ''
        if (typeof existingValue === 'object' && existingValue !== null) {
          displayValue = this.formatAddressForDisplay(existingValue)
        } else if (typeof existingValue === 'string') {
          displayValue = existingValue
        }
        
        // Set the input value
        if (displayValue) {
          input.value = displayValue
        }
        
        // Store original value for comparison
        this.originalValue = input.value
        this.selectedAddress = typeof existingValue === 'object' ? existingValue : null
      }
      
      // Prevent dropdown from showing on focus when value exists (single mode only)
      if (!isMultiple) {
        input.addEventListener('focus', (e) => {
          e.stopPropagation()
          // Don't show dropdown for existing values
          this.hideDropdown()
        }, true)
        
        // Allow editing but don't trigger search on initial load
        // Only trigger search if user changes the value significantly
        const handleEditModeInput = (e: Event) => {
          const newValue = (e.target as HTMLInputElement).value.trim()
          // Only search if value changed significantly from original
          if (newValue !== this.originalValue && newValue.length >= (this.component.minSearchLength || 3)) {
            // Clear original value flag to enable search mode
            this.originalValue = null
            // Remove this listener and set up full search functionality
            input.removeEventListener('input', handleEditModeInput)
            this.setupSearchFunctionality(input, isMultiple)
            // Trigger search for the new value
            if (this.memoizedSearch) {
              this.memoizedSearch(newValue)
            }
          } else if (newValue === this.originalValue || newValue.length < (this.component.minSearchLength || 3)) {
            // Hide dropdown if user reverts to original value or clears input
            this.hideDropdown()
          }
        }
        
        input.addEventListener('input', handleEditModeInput)
      } else {
        // For multiple mode, set up search functionality immediately
        this.setupSearchFunctionality(input, isMultiple)
      }
      
      return // Exit early, don't set up search UI for edit mode initially (single mode)
    }

    // Normal search mode - set up full search functionality
    this.setupSearchFunctionality(input, isMultiple)
  }

  setupSearchFunctionality(input: HTMLInputElement, isMultiple: boolean = false) {
    // Create selected tags container for multiple selection
    if (isMultiple && !this.selectedTagsContainer) {
      this.selectedTagsContainer = document.createElement('div')
      this.selectedTagsContainer.className = 'address-search-selected-tags'
      this.selectedTagsContainer.style.cssText = `
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
        margin-bottom: 8px;
        min-height: 30px;
      `
      input.parentNode?.insertBefore(this.selectedTagsContainer, input)
      this.renderSelectedTags()
    }

    // Create dropdown container if it doesn't exist
    if (!this.dropdownElement) {
      this.dropdownElement = document.createElement('div')
      this.dropdownElement.className = 'address-search-dropdown'
      const dropdownHeight = this.component.dropdownHeight || '300px'
      this.dropdownElement.style.cssText = `
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border: 1px solid #ddd;
        border-top: none;
        border-radius: 0 0 4px 4px;
        max-height: ${dropdownHeight};
        overflow-y: auto;
        z-index: 1000;
        display: none;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      `

      // Wrap input in relative container if not already wrapped
      const wrapper = document.createElement('div')
      wrapper.style.position = 'relative'
      wrapper.style.width = '100%'
      input.parentNode?.insertBefore(wrapper, input)
      wrapper.appendChild(input)
      wrapper.appendChild(this.dropdownElement)

      // Add search icon (if enabled)
      if (this.component.showSearchIcon !== false) {
        const searchIcon = document.createElement('span')
        searchIcon.className = 'address-search-icon'
        searchIcon.innerHTML = '🔍'
        searchIcon.style.cssText = `
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: #999;
        `
        wrapper.appendChild(searchIcon)
      }

      // Add loading indicator (if enabled)
      if (this.component.showLoadingIndicator !== false) {
        const loadingIndicator = document.createElement('div')
        loadingIndicator.className = 'address-search-loading'
        loadingIndicator.style.cssText = `
          position: absolute;
          right: ${this.component.showSearchIcon !== false ? '35px' : '10px'};
          top: 50%;
          transform: translateY(-50%);
          display: none;
          color: #007bff;
        `
        loadingIndicator.innerHTML = '⏳'
        wrapper.appendChild(loadingIndicator)
        this.loadingIndicator = loadingIndicator
      }
    }

    // Memoized search function with caching (if enabled)
    if (!this.memoizedSearch) {
      if (this.component.cacheResults !== false) {
        this.searchCache = new Map<string, any[]>()
      }
      this.memoizedSearch = this.createMemoizedSearch()
    }

    // Debounced search handler
    const handleInput = (e: Event) => {
      const query = (e.target as HTMLInputElement).value.trim()

      // Clear timeout if exists
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout)
      }

      // Hide dropdown if query is too short
      if (query.length < (this.component.minSearchLength || 3)) {
        this.hideDropdown()
        return
      }

      // Show loading
      this.isSearching = true
      if (this.loadingIndicator) {
        this.loadingIndicator.style.display = 'block'
      }

      // Debounce search
      this.searchTimeout = setTimeout(() => {
        this.memoizedSearch(query)
      }, this.component.debounceTime || 300)
    }

    // Remove existing listener if any and add new one
    input.removeEventListener('input', handleInput as EventListener)
    input.addEventListener('input', handleInput as EventListener)

    // Handle input focus - only show dropdown if actively searching (not edit mode)
    input.addEventListener('focus', () => {
      // Don't show dropdown if we have an existing value (edit mode)
      if (this.originalValue && input.value === this.originalValue) {
        return
      }
      // Only show if we have search results and user is actively searching
      if (this.searchResults.length > 0 && !this.originalValue) {
        this.showDropdown()
      }
    })

    // Handle click outside
    document.addEventListener('click', (e) => {
      if (!wrapper.contains(e.target as Node)) {
        this.hideDropdown()
      }
    })

    // Handle keyboard navigation (if enabled)
    if (this.component.enableKeyboardNavigation !== false) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          this.navigateDropdown(1)
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          this.navigateDropdown(-1)
        } else if (e.key === 'Enter') {
          e.preventDefault()
          this.selectFirstResult()
        } else if (e.key === 'Escape') {
          this.hideDropdown()
        }
      })
    }
  }

  createMemoizedSearch() {
    // Create a memoized version of performSearch with caching
    return async (query: string) => {
      // Check cache first (if caching is enabled)
      if (this.component.cacheResults !== false && this.searchCache) {
        const cacheKey = query.toLowerCase().trim()
        if (this.searchCache.has(cacheKey)) {
          const cachedResults = this.searchCache.get(cacheKey)
          if (cachedResults) {
            this.searchResults = cachedResults
            this.renderDropdown()
            this.isSearching = false
            if (this.loadingIndicator) {
              this.loadingIndicator.style.display = 'none'
            }
            return
          }
        }
      }

      // Perform actual search
      await this.performSearch(query)
      
      // Cache the results (if caching is enabled, limit cache size to prevent memory issues)
      if (this.component.cacheResults !== false && this.searchCache && 
          this.searchResults.length > 0 && this.searchCache.size < 50) {
        const cacheKey = query.toLowerCase().trim()
        this.searchCache.set(cacheKey, this.searchResults)
      }
    }
  }

  async performSearch(query: string) {
    if (!this.component.apiEndpoint) {
      console.warn('Address Search: API endpoint not configured')
      this.hideDropdown()
      this.isSearching = false
      if (this.loadingIndicator) {
        this.loadingIndicator.style.display = 'none'
      }
      return
    }

    try {
      // Replace {query} placeholder with actual query
      let url = this.component.apiEndpoint.replace('{query}', encodeURIComponent(query))

      // If relative URL, make it absolute
      if (url.startsWith('/')) {
        url = window.location.origin + url
      }

      const response = await fetch(url, {
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
      let addresses = []
      if (Array.isArray(data)) {
        addresses = data
      } else if (data.results && Array.isArray(data.results)) {
        addresses = data.results
      } else if (data.addresses && Array.isArray(data.addresses)) {
        addresses = data.addresses
      } else if (data.data && Array.isArray(data.data)) {
        addresses = data.data
      }

      // Limit results based on maxResults setting
      const maxResults = this.component.maxResults || 10
      this.searchResults = addresses.slice(0, maxResults)
      this.renderDropdown()
      this.isSearching = false
      if (this.loadingIndicator) {
        this.loadingIndicator.style.display = 'none'
      }
    } catch (error) {
      console.error('Address Search Error:', error)
      this.hideDropdown()
      this.isSearching = false
      if (this.loadingIndicator) {
        this.loadingIndicator.style.display = 'none'
      }

      // Show error message
      if (this.dropdownElement) {
        const errorMsg = document.createElement('div')
        errorMsg.className = 'address-search-error'
        errorMsg.style.cssText = `
          padding: 10px;
          color: #dc3545;
          font-size: 12px;
        `
        errorMsg.textContent = 'Failed to search addresses. Please try again.'
        this.dropdownElement.innerHTML = ''
        this.dropdownElement.appendChild(errorMsg)
        this.showDropdown()
      }
    }
  }

  renderDropdown() {
    if (!this.dropdownElement) return

    if (this.searchResults.length === 0) {
      const noResults = document.createElement('div')
      noResults.style.cssText = 'padding: 10px; color: #999; text-align: center;'
      noResults.textContent = 'No addresses found'
      this.dropdownElement.innerHTML = ''
      this.dropdownElement.appendChild(noResults)
      this.showDropdown()
      return
    }

    this.dropdownElement.innerHTML = ''
    this.currentHighlightedIndex = -1

      const isMultiple = this.component.multiple === true

      this.searchResults.forEach((address, index) => {
      const item = document.createElement('div')
      item.className = 'address-search-item'
      item.dataset.index = index.toString()
      item.style.cssText = `
        padding: 10px;
        cursor: pointer;
        border-bottom: 1px solid #eee;
        transition: background-color 0.2s;
        display: flex;
        align-items: center;
        justify-content: space-between;
      `

      // Format address display
      const displayText = this.formatAddressForDisplay(address)
      const textSpan = document.createElement('span')
      textSpan.textContent = displayText
      item.appendChild(textSpan)

      // Add checkbox for multiple selection
      if (isMultiple) {
        const checkbox = document.createElement('input')
        checkbox.type = 'checkbox'
        checkbox.style.cssText = 'margin-left: 10px; cursor: pointer;'
        
        // Check if already selected
        const isSelected = this.isAddressSelected(address)
        checkbox.checked = isSelected
        
        item.appendChild(checkbox)
      }

      // Hover effect
      item.addEventListener('mouseenter', () => {
        item.style.backgroundColor = '#f5f5f5'
        this.currentHighlightedIndex = index
      })

      item.addEventListener('mouseleave', () => {
        item.style.backgroundColor = ''
      })

      // Click handler
      item.addEventListener('click', (e) => {
        // Don't trigger selection if clicking on checkbox
        if (isMultiple && (e.target as HTMLElement).tagName === 'INPUT') {
          return
        }
        this.selectAddress(address)
      })

      // Checkbox change handler for multiple selection
      if (isMultiple) {
        const checkbox = item.querySelector('input[type="checkbox"]') as HTMLInputElement
        checkbox?.addEventListener('change', (e) => {
          e.stopPropagation()
          if (checkbox.checked) {
            this.addAddress(address)
          } else {
            this.removeAddress(address)
          }
        })
      }

      this.dropdownElement.appendChild(item)
    })

    this.showDropdown()
  }

  formatAddressForDisplay(address: any): string {
    if (typeof address === 'string') {
      return address
    }

    if (address.formatted_address) {
      return address.formatted_address
    }

    if (address.formattedAddress) {
      return address.formattedAddress
    }

    // Build from components
    const parts = []
    if (address.street || address.address_line_1) {
      parts.push(address.street || address.address_line_1)
    }
    if (address.city) parts.push(address.city)
    if (address.state || address.state_code) {
      parts.push(address.state || address.state_code)
    }
    if (address.zip || address.postal_code || address.zip_code) {
      parts.push(address.zip || address.postal_code || address.zip_code)
    }

    return parts.join(', ') || JSON.stringify(address)
  }

  selectAddress(address: any) {
    const isMultiple = this.component.multiple === true
    const input = this.element?.querySelector('input') as HTMLInputElement

    if (!input) return

    if (isMultiple) {
      // Multiple selection mode
      this.addAddress(address)
    } else {
      // Single selection mode
      this.selectedAddress = address

      // Set input value based on output format
      if (this.component.showFullAddress !== false) {
        input.value = this.formatAddressForDisplay(address)
      } else {
        input.value = address.street || address.address_line_1 || ''
      }

      // Set the actual value based on output format
      let valueToStore: any
      switch (this.component.outputFormat) {
        case 'string':
          valueToStore = this.formatAddressForDisplay(address)
          break
        case 'formatted':
          valueToStore = this.formatAddressForDisplay(address)
          break
        case 'object':
        default:
          valueToStore = address
          break
      }

      this.setValue(valueToStore)
      this.hideDropdown()
    }

    // Trigger change event
    if (this.triggerChange && typeof this.triggerChange === 'function') {
      this.triggerChange()
    }
  }

  addAddress(address: any) {
    if (!this.selectedAddresses) {
      this.selectedAddresses = []
    }

    // Check if address is already selected
    if (this.isAddressSelected(address)) {
      return
    }

    this.selectedAddresses.push(address)
    this.renderSelectedTags()
    this.updateValue()
    
    // Clear input
    const input = this.element?.querySelector('input') as HTMLInputElement
    if (input) {
      input.value = ''
      input.focus()
    }

    // Update dropdown checkboxes
    this.renderDropdown()
  }

  removeAddress(address: any) {
    if (!this.selectedAddresses) return

    const index = this.selectedAddresses.findIndex(addr => 
      this.addressesEqual(addr, address)
    )

    if (index > -1) {
      this.selectedAddresses.splice(index, 1)
      this.renderSelectedTags()
      this.updateValue()
      
      // Update dropdown checkboxes
      this.renderDropdown()
    }
  }

  isAddressSelected(address: any): boolean {
    if (!this.selectedAddresses || this.selectedAddresses.length === 0) {
      return false
    }

    return this.selectedAddresses.some(addr => this.addressesEqual(addr, address))
  }

  addressesEqual(addr1: any, addr2: any): boolean {
    // Compare addresses by key fields
    const key1 = addr1.id || addr1.place_id || JSON.stringify(addr1)
    const key2 = addr2.id || addr2.place_id || JSON.stringify(addr2)
    return key1 === key2
  }

  renderSelectedTags() {
    if (!this.selectedTagsContainer || !this.component.multiple) return

    this.selectedTagsContainer.innerHTML = ''

    if (!this.selectedAddresses || this.selectedAddresses.length === 0) {
      return
    }

    this.selectedAddresses.forEach((address, index) => {
      const tag = document.createElement('div')
      tag.className = 'address-search-tag'
      tag.style.cssText = `
        display: inline-flex;
        align-items: center;
        padding: 4px 8px;
        background-color: #e3f2fd;
        border: 1px solid #2196f3;
        border-radius: 4px;
        font-size: 12px;
        color: #1976d2;
        gap: 6px;
      `

      const text = document.createElement('span')
      text.textContent = this.formatAddressForDisplay(address)
      tag.appendChild(text)

      const removeBtn = document.createElement('button')
      removeBtn.innerHTML = '×'
      removeBtn.style.cssText = `
        background: none;
        border: none;
        color: #1976d2;
        cursor: pointer;
        font-size: 18px;
        line-height: 1;
        padding: 0;
        margin-left: 4px;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      `
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        this.removeAddress(address)
      })

      tag.appendChild(removeBtn)
      this.selectedTagsContainer.appendChild(tag)
    })
  }

  updateValue() {
    if (!this.component.multiple) return

    let valuesToStore: any[]
    switch (this.component.outputFormat) {
      case 'string':
        valuesToStore = this.selectedAddresses.map(addr => this.formatAddressForDisplay(addr))
        break
      case 'formatted':
        valuesToStore = this.selectedAddresses.map(addr => this.formatAddressForDisplay(addr))
        break
      case 'object':
      default:
        valuesToStore = this.selectedAddresses
        break
    }

    this.setValue(valuesToStore)
  }

  navigateDropdown(direction: number) {
    if (!this.dropdownElement || this.searchResults.length === 0) return

    const items = this.dropdownElement.querySelectorAll('.address-search-item')
    if (items.length === 0) return

    // Update highlighted index
    this.currentHighlightedIndex = Math.max(
      0,
      Math.min(items.length - 1, (this.currentHighlightedIndex || -1) + direction)
    )

    // Update visual highlight
    items.forEach((item, index) => {
      if (index === this.currentHighlightedIndex) {
        ;(item as HTMLElement).style.backgroundColor = '#e3f2fd'
        item.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      } else {
        ;(item as HTMLElement).style.backgroundColor = ''
      }
    })
  }

  selectFirstResult() {
    if (this.searchResults.length > 0 && this.currentHighlightedIndex >= 0) {
      this.selectAddress(this.searchResults[this.currentHighlightedIndex])
    } else if (this.searchResults.length > 0) {
      this.selectAddress(this.searchResults[0])
    }
  }

  showDropdown() {
    if (this.dropdownElement) {
      this.dropdownElement.style.display = 'block'
    }
  }

  hideDropdown() {
    if (this.dropdownElement) {
      this.dropdownElement.style.display = 'none'
    }
    this.currentHighlightedIndex = -1
  }

  destroy() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout)
    }
    if (this.dropdownElement) {
      this.dropdownElement.remove()
    }
    // Clear cache
    if (this.searchCache) {
      this.searchCache.clear()
    }
    if (super.destroy && typeof super.destroy === 'function') {
      super.destroy.call(this)
    }
  }
}
