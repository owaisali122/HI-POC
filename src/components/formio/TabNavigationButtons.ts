/**
 * FormIO Custom Component: Tab Navigation Buttons
 * 
 * Provides Save & Exit, Next, Previous, and Submit buttons for multi-tab forms
 * 
 * Usage in FormIO schema:
 * {
 *   type: 'tabnavigationbuttons',
 *   key: 'navButtons',
 *   label: 'Navigation',
 *   action: 'saveAndExit' | 'next' | 'previous' | 'submit',
 *   formSlug: 'tabs',
 *   input: false
 * }
 */

export class TabNavigationButtonsComponent {
  static schema(overrides?: any) {
    return {
      type: 'tabnavigationbuttons',
      label: 'Navigation Buttons',
      key: 'tabNavigationButtons',
      input: false,
      tableView: false,
      ...overrides,
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
        },
        {
          type: 'textfield',
          key: 'key',
          label: 'Key',
          input: true,
          required: true,
        },
        {
          type: 'select',
          key: 'action',
          label: 'Button Action',
          input: true,
          data: {
            values: [
              { label: 'Save & Exit', value: 'saveAndExit' },
              { label: 'Next', value: 'next' },
              { label: 'Previous', value: 'previous' },
              { label: 'Submit', value: 'submit' },
            ],
          },
        },
        {
          type: 'textfield',
          key: 'formSlug',
          label: 'Form Slug',
          input: true,
          required: true,
          placeholder: 'e.g., tabs, personal-information',
          description: 'The slug of the form (not the ID)',
        },
      ],
    }
  }

  component: any
  options: any
  data: any
  root: any

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
    return super.render('tabnavigationbuttons')
  }

    attach(element: HTMLElement) {
      const Formio = (window as any).Formio || (global as any).Formio
      if (!Formio) return

      // Get form instance from various possible locations
      let form = this.options?.formio || this.root?.formio
      if (!form && this.root) {
        // Try to get form from root
        form = this.root
      }
      if (!form && (this as any).formio) {
        form = (this as any).formio
      }
      if (!form) {
        console.warn('TabNavigationButtons: Form instance not found')
        return
      }

    const action = this.component.action || 'next'
    const formSlug = this.component.formSlug

    // Helper function to get form ID from slug
    const getFormIdFromSlug = async (slug: string): Promise<number | null> => {
      try {
        const response = await fetch(`/api/forms/by-slug?slug=${encodeURIComponent(slug)}`)
        const result = await response.json()
        if (result.success && result.form) {
          return result.form.id
        }
        return null
      } catch (error) {
        console.error('Error fetching form by slug:', error)
        return null
      }
    }

    // Create button container
    const buttonContainer = document.createElement('div')
    buttonContainer.className = 'tab-navigation-buttons'
    buttonContainer.style.cssText = `
      display: flex;
      gap: 10px;
      margin-top: 20px;
      padding: 15px;
      border-top: 1px solid #e0e0e0;
      justify-content: space-between;
    `

    // Get current tab index
    const getCurrentTabIndex = () => {
      const tabsComponent = form.components?.find((comp: any) => 
        comp.type === 'tabs' || comp.type === 'panel'
      )
      if (!tabsComponent) return 0
      
      // Find active tab
      const activeTab = tabsComponent.tabs?.find((tab: any, index: number) => {
        const tabElement = document.querySelector(`[data-tab-index="${index}"]`)
        return tabElement?.classList.contains('active') || tabElement?.getAttribute('aria-selected') === 'true'
      })
      
      return activeTab ? tabsComponent.tabs.indexOf(activeTab) : 0
    }

    const getTotalTabs = () => {
      const tabsComponent = form.components?.find((comp: any) => 
        comp.type === 'tabs' || comp.type === 'panel'
      )
      return tabsComponent?.tabs?.length || 1
    }

    // Create button based on action
    if (action === 'saveAndExit') {
      const saveExitBtn = document.createElement('button')
      saveExitBtn.type = 'button'
      saveExitBtn.className = 'btn btn-secondary'
      saveExitBtn.textContent = 'Save & Exit'
      saveExitBtn.style.cssText = `
        padding: 10px 20px;
        background-color: #6c757d;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      `
      
      saveExitBtn.addEventListener('click', async () => {
        try {
          if (!formSlug) {
            alert('Form slug is required')
            return
          }

          // Get form ID from slug
          const formId = await getFormIdFromSlug(formSlug)
          if (!formId) {
            alert('Form not found. Please check the form slug.')
            return
          }

          // Validate current tab
          const errors = await form.checkValidity(form.data, true)
          if (errors && errors.length > 0) {
            form.showErrors(errors)
            return
          }

          // Save draft
          const response = await fetch('/api/forms/draft', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              formSlug,
              formId,
              data: form.data,
              currentTab: getCurrentTabIndex(),
            }),
          })

          const result = await response.json()
          
          if (result.success) {
            // Redirect to previous page or home
            if (window.history.length > 1) {
              window.history.back()
            } else {
              window.location.href = '/'
            }
          } else {
            alert('Failed to save draft: ' + (result.error || 'Unknown error'))
          }
        } catch (error) {
          console.error('Save & Exit error:', error)
          alert('Failed to save draft. Please try again.')
        }
      })

      buttonContainer.appendChild(saveExitBtn)
    } else if (action === 'next') {
      const nextBtn = document.createElement('button')
      nextBtn.type = 'button'
      nextBtn.className = 'btn btn-primary'
      nextBtn.textContent = 'Next'
      nextBtn.style.cssText = `
        padding: 10px 20px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        margin-left: auto;
      `

      const updateNextButtonState = async () => {
        const currentTabIndex = getCurrentTabIndex()
        const totalTabs = getTotalTabs()
        
        // Check if on last tab
        if (currentTabIndex >= totalTabs - 1) {
          nextBtn.disabled = true
          nextBtn.style.opacity = '0.5'
          nextBtn.style.cursor = 'not-allowed'
          return
        }

        // Check required fields in current tab
        const tabsComponent = form.components?.find((comp: any) => 
          comp.type === 'tabs' || comp.type === 'panel'
        )
        
        if (tabsComponent && tabsComponent.tabs) {
          const currentTab = tabsComponent.tabs[currentTabIndex]
          if (currentTab && currentTab.components) {
            const requiredFields = currentTab.components.filter((comp: any) => 
              comp.validate?.required && comp.key
            )
            
            let allRequiredFilled = true
            for (const field of requiredFields) {
              const value = form.data[field.key]
              if (!value || (typeof value === 'string' && value.trim() === '')) {
                allRequiredFilled = false
                break
              }
            }

            nextBtn.disabled = !allRequiredFilled
            nextBtn.style.opacity = allRequiredFilled ? '1' : '0.5'
            nextBtn.style.cursor = allRequiredFilled ? 'pointer' : 'not-allowed'
          }
        }
      }

      // Update button state on form changes
      form.on('change', updateNextButtonState)
      form.on('render', updateNextButtonState)
      
      // Initial state
      setTimeout(updateNextButtonState, 100)

      nextBtn.addEventListener('click', async () => {
        try {
          const currentTabIndex = getCurrentTabIndex()
          const totalTabs = getTotalTabs()

          if (currentTabIndex >= totalTabs - 1) {
            return
          }

          // Validate current tab
          const errors = await form.checkValidity(form.data, true)
          if (errors && errors.length > 0) {
            form.showErrors(errors)
            return
          }

          if (!formSlug) {
            alert('Form slug is required')
            return
          }

          // Get form ID from slug
          const formId = await getFormIdFromSlug(formSlug)
          if (!formId) {
            alert('Form not found. Please check the form slug.')
            return
          }

          // Save draft before navigating
          await fetch('/api/forms/draft', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              formSlug,
              formId,
              data: form.data,
              currentTab: currentTabIndex + 1,
            }),
          })

          // Navigate to next tab
          const tabsComponent = form.components?.find((comp: any) => 
            comp.type === 'tabs' || comp.type === 'panel'
          )
          
          if (tabsComponent && tabsComponent.setActiveTab) {
            tabsComponent.setActiveTab(currentTabIndex + 1)
          } else {
            // Fallback: trigger tab click
            const nextTabElement = document.querySelector(`[data-tab-index="${currentTabIndex + 1}"]`)
            if (nextTabElement) {
              (nextTabElement as HTMLElement).click()
            }
          }
        } catch (error) {
          console.error('Next button error:', error)
          alert('Failed to save progress. Please try again.')
        }
      })

      buttonContainer.appendChild(nextBtn)
    } else if (action === 'previous') {
      const prevBtn = document.createElement('button')
      prevBtn.type = 'button'
      prevBtn.className = 'btn btn-secondary'
      prevBtn.textContent = 'Previous'
      prevBtn.style.cssText = `
        padding: 10px 20px;
        background-color: #6c757d;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      `

      const updatePreviousButtonState = () => {
        const currentTabIndex = getCurrentTabIndex()
        prevBtn.disabled = currentTabIndex === 0
        prevBtn.style.opacity = currentTabIndex === 0 ? '0.5' : '1'
        prevBtn.style.cursor = currentTabIndex === 0 ? 'not-allowed' : 'pointer'
      }

      // Update button state on form changes
      form.on('change', updatePreviousButtonState)
      form.on('render', updatePreviousButtonState)
      
      // Initial state
      setTimeout(updatePreviousButtonState, 100)

      prevBtn.addEventListener('click', () => {
        const currentTabIndex = getCurrentTabIndex()
        
        if (currentTabIndex === 0) {
          return
        }

        // Navigate to previous tab
        const tabsComponent = form.components?.find((comp: any) => 
          comp.type === 'tabs' || comp.type === 'panel'
        )
        
        if (tabsComponent && tabsComponent.setActiveTab) {
          tabsComponent.setActiveTab(currentTabIndex - 1)
        } else {
          // Fallback: trigger tab click
          const prevTabElement = document.querySelector(`[data-tab-index="${currentTabIndex - 1}"]`)
          if (prevTabElement) {
            (prevTabElement as HTMLElement).click()
          }
        }
      })

      buttonContainer.appendChild(prevBtn)
    } else if (action === 'submit') {
      const submitBtn = document.createElement('button')
      submitBtn.type = 'button'
      submitBtn.className = 'btn btn-success'
      submitBtn.textContent = 'Submit'
      submitBtn.style.cssText = `
        padding: 10px 20px;
        background-color: #28a745;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
        margin-left: auto;
      `

      const updateSubmitButtonState = async () => {
        const currentTabIndex = getCurrentTabIndex()
        const totalTabs = getTotalTabs()
        
        // Check if on last tab
        if (currentTabIndex < totalTabs - 1) {
          submitBtn.disabled = true
          submitBtn.style.opacity = '0.5'
          submitBtn.style.cursor = 'not-allowed'
          return
        }

        // Check all required fields in all tabs
        const tabsComponent = form.components?.find((comp: any) => 
          comp.type === 'tabs' || comp.type === 'panel'
        )
        
        if (tabsComponent && tabsComponent.tabs) {
          let allRequiredFilled = true
          
          // Check all tabs
          for (const tab of tabsComponent.tabs) {
            if (tab.components) {
              const requiredFields = tab.components.filter((comp: any) => 
                comp.validate?.required && comp.key
              )
              
              for (const field of requiredFields) {
                const value = form.data[field.key]
                if (!value || (typeof value === 'string' && value.trim() === '')) {
                  allRequiredFilled = false
                  break
                }
              }
              
              if (!allRequiredFilled) break
            }
          }

          submitBtn.disabled = !allRequiredFilled
          submitBtn.style.opacity = allRequiredFilled ? '1' : '0.5'
          submitBtn.style.cursor = allRequiredFilled ? 'pointer' : 'not-allowed'
        }
      }

      // Update button state on form changes
      form.on('change', updateSubmitButtonState)
      form.on('render', updateSubmitButtonState)
      
      // Initial state
      setTimeout(updateSubmitButtonState, 100)

      submitBtn.addEventListener('click', async () => {
        try {
          if (!formSlug) {
            alert('Form slug is required')
            return
          }

          const currentTabIndex = getCurrentTabIndex()
          const totalTabs = getTotalTabs()

          if (currentTabIndex < totalTabs - 1) {
            alert('Please complete all tabs before submitting')
            return
          }

          // Validate entire form (all tabs)
          const errors = await form.checkValidity(form.data, true)
          if (errors && errors.length > 0) {
            form.showErrors(errors)
            alert('Please fix all errors before submitting')
            return
          }

          // Get form ID from slug
          const formId = await getFormIdFromSlug(formSlug)
          if (!formId) {
            alert('Form not found. Please check the form slug.')
            return
          }

          // Disable button during submission
          submitBtn.disabled = true
          submitBtn.textContent = 'Submitting...'

          // Submit the form
          const response = await fetch('/api/forms/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              formId,
              formSlug,
              data: form.data,
            }),
          })

          const result = await response.json()
          
          if (result.success) {
            // Show success message
            alert('Form submitted successfully!')
            
            // Redirect to success page or home
            if (window.history.length > 1) {
              window.history.back()
            } else {
              window.location.href = '/'
            }
          } else {
            alert('Failed to submit form: ' + (result.error || 'Unknown error'))
            submitBtn.disabled = false
            submitBtn.textContent = 'Submit'
          }
        } catch (error) {
          console.error('Submit error:', error)
          alert('Failed to submit form. Please try again.')
          submitBtn.disabled = false
          submitBtn.textContent = 'Submit'
        }
      })

      buttonContainer.appendChild(submitBtn)
    }

    // Append to element
    if (element) {
      element.appendChild(buttonContainer)
    }

    return buttonContainer
  }

  detach() {
    if (super.detach) {
      super.detach()
    }
  }

  destroy() {
    if (super.destroy) {
      super.destroy()
    }
  }
}
