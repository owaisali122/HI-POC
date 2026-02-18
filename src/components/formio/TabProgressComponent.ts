/**
 * FormIO Custom Component: Tab Progress Bar
 * 
 * Displays progress bar for Form.io tab layouts
 * Can be placed outside tabs and configured to track a specific tab component
 * 
 * Usage in FormIO schema:
 * {
 *   type: 'tabprogress',
 *   key: 'progressBar',
 *   tabsComponentKey: 'applicationTabs',
 *   input: false
 * }
 */

export class TabProgressComponent {
  static schema(overrides?: any) {
    return {
      type: 'tabprogress',
      label: 'Tab Progress Bar',
      key: 'tabProgress',
      input: false,
      tableView: false,
      // Configuration options
      tabsComponentKey: '', // Key of the tabs component to track
      showStepLabel: true,
      validateOnChange: false,
      ...overrides,
    }
  }

  static get builderInfo() {
    return {
      title: 'Tab Progress Bar',
      group: 'basic',
      icon: 'tasks',
      weight: 35,
      documentation: 'Displays progress bar for tab-based forms',
      schema: TabProgressComponent.schema(),
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
          defaultValue: 'Tab Progress Bar',
        },
        {
          type: 'textfield',
          key: 'key',
          label: 'Property Name',
          input: true,
          required: true,
          defaultValue: 'tabProgress',
        },
        {
          type: 'textfield',
          key: 'tabsComponentKey',
          label: 'Tabs Component Key',
          input: true,
          required: true,
          placeholder: 'e.g., applicationTabs',
          description: 'The key of the tabs component to track progress for',
          tooltip: 'Enter the key property of your tabs component (e.g., "applicationTabs")',
        },
        {
          type: 'checkbox',
          key: 'showStepLabel',
          label: 'Show Step Label',
          input: true,
          defaultValue: true,
          description: 'Display "Step X of Y – Tab Name" label',
        },
        {
          type: 'checkbox',
          key: 'validateOnChange',
          label: 'Validate on Change',
          input: true,
          defaultValue: false,
          description: 'Only count valid/complete tabs in progress calculation',
        },
        {
          type: 'content',
          html: '<div style="padding: 10px; background: #f8f9fa; border-radius: 4px; margin-top: 10px;"><strong>Note:</strong> This component should be placed outside the tabs component. It will automatically track the specified tabs component.</div>',
        },
      ],
    }
  }

  component: any
  options: any
  data: any
  root: any
  form: any
  progressContainer: HTMLElement | null = null
  progressBarFill: HTMLElement | null = null
  progressPercentage: HTMLElement | null = null
  progressLabel: HTMLElement | null = null
  tabsComponent: any = null
  currentTabIndex: number = 0
  totalTabs: number = 0
  validationTimeout: NodeJS.Timeout | null = null

  constructor(component: any, options: any, data: any) {
    const Formio = (window as any).Formio || (global as any).Formio
    if (!Formio || !Formio.Components) {
      console.error('Form.io Components not available')
      return
    }

    const BaseComponent = Formio.Components.components.component
    const instance = new BaseComponent(component, options, data)

    Object.setPrototypeOf(this, Object.getPrototypeOf(instance))
    Object.assign(this, instance)

    this.component = component
    this.options = options
    this.data = data
    this.root = options?.root || options?.formio?.root
  }

  init() {
    if (super.init) {
      super.init()
    }
  }

  render() {
    return super.render('tabprogress')
  }

  attach(element: HTMLElement) {
    const Formio = (window as any).Formio || (global as any).Formio
    if (!Formio) return

    // Get form instance
    let form = this.options?.formio || this.root?.formio
    if (!form && this.root) {
      form = this.root
    }
    if (!form && (this as any).formio) {
      form = (this as any).formio
    }
    if (!form) {
      console.warn('TabProgress: Form instance not found')
      return
    }

    this.form = form

    // Find tabs component by key
    const tabsKey = this.component.tabsComponentKey
    if (!tabsKey) {
      console.warn('TabProgress: tabsComponentKey not configured')
      return
    }

    // Create progress bar container
    const progressContainer = document.createElement('div')
    progressContainer.className = 'tab-progress-container'
    progressContainer.style.cssText = `
      margin-bottom: 24px;
      padding: 16px 20px;
      background-color: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    `

    // Header
    const header = document.createElement('div')
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      flex-wrap: wrap;
      gap: 8px;
    `

    const info = document.createElement('div')
    info.style.cssText = `
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    `

    const percentage = document.createElement('span')
    percentage.className = 'tab-progress-percentage'
    percentage.style.cssText = `
      font-size: 18px;
      font-weight: 600;
      color: #212529;
      min-width: 50px;
    `
    percentage.textContent = '0%'

    const label = document.createElement('span')
    label.className = 'tab-progress-label'
    label.style.cssText = `
      font-size: 14px;
      color: #6c757d;
      font-weight: 500;
    `

    info.appendChild(percentage)
    if (this.component.showStepLabel !== false) {
      info.appendChild(label)
    }
    header.appendChild(info)

    // Progress bar
    const progressBarWrapper = document.createElement('div')
    progressBarWrapper.className = 'tab-progress-bar'
    progressBarWrapper.style.cssText = `
      width: 100%;
      height: 10px;
      background-color: #e9ecef;
      border-radius: 5px;
      overflow: hidden;
      position: relative;
    `

    const progressBarFill = document.createElement('div')
    progressBarFill.className = 'tab-progress-fill'
    progressBarFill.style.cssText = `
      height: 100%;
      background: linear-gradient(90deg, #dc3545 0%, #fd7e14 100%);
      border-radius: 5px;
      transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      width: 0%;
    `
    progressBarFill.setAttribute('role', 'progressbar')
    progressBarFill.setAttribute('aria-valuenow', '0')
    progressBarFill.setAttribute('aria-valuemin', '0')
    progressBarFill.setAttribute('aria-valuemax', '100')

    progressBarWrapper.appendChild(progressBarFill)
    progressContainer.appendChild(header)
    progressContainer.appendChild(progressBarWrapper)

    // Store references
    this.progressContainer = progressContainer
    this.progressBarFill = progressBarFill
    this.progressPercentage = percentage
    this.progressLabel = label

    // Find tabs component
    this.findTabsComponent(tabsKey)

    // Initial update
    this.updateProgress()

    // Setup event listeners
    this.setupEventListeners()

    // Append to element
    if (element) {
      element.appendChild(progressContainer)
    }

    return progressContainer
  }

  findTabsComponent(tabsKey: string) {
    if (!this.form) return

    const findComponent = (components: any[]): any => {
      for (const comp of components) {
        if (comp.key === tabsKey && (comp.type === 'tabs' || comp.type === 'panel')) {
          return comp
        }
        if (comp.components && Array.isArray(comp.components)) {
          const found = findComponent(comp.components)
          if (found) return found
        }
        if (comp.tabs && Array.isArray(comp.tabs)) {
          if (comp.key === tabsKey) return comp
        }
      }
      return null
    }

    const components = this.form.components || []
    this.tabsComponent = findComponent(components)
  }

  getCurrentTabIndex(): number {
    if (!this.tabsComponent) return 0

    // Try to get from component
    if (this.tabsComponent.activeTab !== undefined) {
      return this.tabsComponent.activeTab
    }

    // Try to get from DOM
    if (typeof document !== 'undefined') {
      const activeTab = document.querySelector(
        `.formio-tabs-nav .nav-item.active, .formio-tabs-nav .nav-link.active, [role="tab"][aria-selected="true"]`
      )
      if (activeTab) {
        const tabIndex = activeTab.getAttribute('data-tab-index')
        if (tabIndex !== null) {
          return parseInt(tabIndex, 10)
        }
      }
    }

    return 0
  }

  getTotalTabs(): number {
    if (!this.tabsComponent) return 0
    const tabList = this.tabsComponent.tabs || this.tabsComponent.components || []
    return tabList.length
  }

  getCurrentTabLabel(): string {
    if (!this.tabsComponent) return ''
    const tabList = this.tabsComponent.tabs || this.tabsComponent.components || []
    const currentIndex = this.getCurrentTabIndex()
    const tab = tabList[currentIndex]
    return tab?.label || tab?.title || `Tab ${currentIndex + 1}`
  }

  async validateTab(tabIndex: number): Promise<boolean> {
    if (!this.tabsComponent || !this.form) return true

    const tabList = this.tabsComponent.tabs || this.tabsComponent.components || []
    const tab = tabList[tabIndex]
    if (!tab) return true

    try {
      const errors = await this.form.checkValidity(this.form.data, true)
      if (!errors || errors.length === 0) return true

      const tabComponents = tab.components || []
      const tabKeys = new Set(tabComponents.map((c: any) => c.key).filter(Boolean))
      const tabErrors = errors.filter((error: any) => {
        const errorPath = error.component?.key || error.path
        return tabKeys.has(errorPath)
      })

      return tabErrors.length === 0
    } catch (error) {
      console.warn('Error validating tab:', error)
      return true
    }
  }

  isTabComplete(tabIndex: number): boolean {
    if (!this.tabsComponent || !this.form) return false

    const tabList = this.tabsComponent.tabs || this.tabsComponent.components || []
    const tab = tabList[tabIndex]
    if (!tab) return false

    const tabComponents = tab.components || []
    const data = this.form.data || {}

    for (const comp of tabComponents) {
      if (comp.validate?.required && comp.key) {
        const value = data[comp.key]
        if (value === undefined || value === null || value === '') {
          return false
        }
        if (typeof value === 'string' && value.trim() === '') {
          return false
        }
      }
    }

    return true
  }

  async calculateProgress(): Promise<number> {
    const totalTabs = this.getTotalTabs()
    if (totalTabs === 0) return 0

    const currentIndex = this.getCurrentTabIndex()

    if (!this.component.validateOnChange) {
      // Simple progress
      return Math.round(((currentIndex + 1) / totalTabs) * 100)
    }

    // Validation-based progress
    let validTabs = 0
    for (let i = 0; i <= currentIndex; i++) {
      const isValid = await this.validateTab(i)
      const isComplete = this.isTabComplete(i)
      if (isValid && isComplete) {
        validTabs++
      }
    }

    return Math.round((validTabs / totalTabs) * 100)
  }

  updateProgressColor(progress: number) {
    if (!this.progressBarFill) return

    let className = 'tab-progress-fill'
    if (progress === 100) {
      className += ' progress-success'
    } else if (progress >= 50) {
      className += ' progress-warning'
    }

    this.progressBarFill.className = className

    // Update background
    if (progress === 100) {
      this.progressBarFill.style.background = 'linear-gradient(90deg, #28a745 0%, #20c997 100%)'
    } else if (progress >= 50) {
      this.progressBarFill.style.background = 'linear-gradient(90deg, #ffc107 0%, #fd7e14 100%)'
    } else {
      this.progressBarFill.style.background = 'linear-gradient(90deg, #dc3545 0%, #fd7e14 100%)'
    }
  }

  async updateProgress() {
    if (!this.tabsComponent) {
      // Try to find tabs component again
      this.findTabsComponent(this.component.tabsComponentKey)
      if (!this.tabsComponent) return
    }

    const totalTabs = this.getTotalTabs()
    const currentIndex = this.getCurrentTabIndex()
    const currentLabel = this.getCurrentTabLabel()

    this.totalTabs = totalTabs
    this.currentTabIndex = currentIndex

    if (this.progressLabel && this.component.showStepLabel !== false) {
      this.progressLabel.textContent = `Step ${currentIndex + 1} of ${totalTabs} – ${currentLabel}`
    }

    const progress = await this.calculateProgress()

    if (this.progressPercentage) {
      this.progressPercentage.textContent = `${progress}%`
    }

    if (this.progressBarFill) {
      this.progressBarFill.style.width = `${progress}%`
      this.progressBarFill.setAttribute('aria-valuenow', progress.toString())
      this.progressBarFill.setAttribute('aria-label', `Progress: ${progress}%`)
      this.updateProgressColor(progress)
    }
  }

  setupEventListeners() {
    if (!this.form) return

    const handleChange = () => {
      if (this.validationTimeout) {
        clearTimeout(this.validationTimeout)
      }

      this.validationTimeout = setTimeout(() => {
        this.updateProgress()
      }, 100)
    }

    // Form.io events
    this.form.on('change', handleChange)
    this.form.on('render', handleChange)
    this.form.on('submit', handleChange)

    // DOM events
    if (typeof document !== 'undefined') {
      const handleTabClick = (e: Event) => {
        const target = e.target as HTMLElement
        if (
          target.closest('.formio-tabs-nav') ||
          target.closest('[role="tablist"]') ||
          target.hasAttribute('data-tab-index')
        ) {
          handleChange()
        }
      }

      document.addEventListener('click', handleTabClick)
      document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          handleChange()
        }
      })

      // MutationObserver for tab changes
      const observer = new MutationObserver(() => {
        handleChange()
      })

      const tabsContainer = document.querySelector('.formio-tabs-nav, [role="tablist"]')
      if (tabsContainer) {
        observer.observe(tabsContainer, {
          attributes: true,
          attributeFilter: ['class', 'aria-selected'],
          childList: true,
          subtree: true,
        })
      }
    }
  }

  detach() {
    if (this.validationTimeout) {
      clearTimeout(this.validationTimeout)
    }
    if (super.detach) {
      super.detach()
    }
  }

  destroy() {
    if (this.validationTimeout) {
      clearTimeout(this.validationTimeout)
    }
    if (super.destroy) {
      super.destroy()
    }
  }
}
