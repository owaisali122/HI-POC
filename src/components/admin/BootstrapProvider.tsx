'use client'

import React, { useEffect, useRef } from 'react'

interface BootstrapProviderProps {
  children: React.ReactNode
}

/**
 * BootstrapProvider - Loads and scopes Bootstrap CSS only for children components
 * 
 * Usage:
 * <BootstrapProvider>
 *   <YourComponentThatNeedsBootstrap />
 * </BootstrapProvider>
 */
export const BootstrapProvider: React.FC<BootstrapProviderProps> = ({ children }) => {
  const bootstrapStyleRef = useRef<HTMLStyleElement | null>(null)

  useEffect(() => {
    const bootstrapStyleId = 'form-builder-bootstrap-scoped'
    
    if (typeof window !== 'undefined') {
      // Use global counter to track instances
      if (!(window as any).__formBuilderBootstrapCount) {
        ;(window as any).__formBuilderBootstrapCount = 0
      }
      ;(window as any).__formBuilderBootstrapCount++

      // Check if Bootstrap is already loaded
      let existingStyle = document.getElementById(bootstrapStyleId) as HTMLStyleElement

      if (!existingStyle) {
        // Fetch Bootstrap CSS from local package via API route
        const bootstrapUrl = '/api/bootstrap-css'
        const formioCssUrl = '/api/formio-css'
        
        // Load Bootstrap CSS first, then Form.io CSS
        fetch(bootstrapUrl)
          .then(response => {
            if (!response.ok) throw new Error('Failed to load Bootstrap CSS')
            return response.text()
          })
          .then(cssText => {
            // Scope all Bootstrap selectors to .bootstrap-scope and Form.io modals
            // Use a more robust parsing approach to handle complex selectors
            const scopedCSS = cssText
              .replace(/([^{}]+)\{/g, (match: string, selector: string) => {
                const trimmedSelector = selector.trim()
                
                // Skip @media, @keyframes, @import, @supports, etc.
                if (trimmedSelector.startsWith('@')) {
                  return match
                }
                
                // Skip if already scoped or empty
                if (!trimmedSelector || 
                    trimmedSelector.includes('.bootstrap-scope') || 
                    trimmedSelector.includes('.formio-modal') ||
                    trimmedSelector.includes('.formio-builder')) {
                  return match
                }
                
                // Handle nested @ rules (like @media inside other rules)
                if (trimmedSelector.includes('@')) {
                  return match
                }
                
                // Scope selectors - handle multiple selectors separated by commas
                const selectors = trimmedSelector.split(',').map((s: string) => {
                  const trimmed = s.trim()
                  
                  // Skip empty selectors or special selectors
                  if (!trimmed || trimmed.startsWith('@') || trimmed.startsWith(':')) {
                    return trimmed
                  }
                  
                  // Exclude generic .nav class from scoping - it conflicts with Payload CMS nav
                  // and causes issues in Form.io properties. Only scope specific nav classes.
                  if (trimmed === '.nav' || trimmed === 'nav') {
                    // Skip scoping generic .nav - don't apply Bootstrap's .nav to Form.io
                    return match // Return unchanged (no scoping)
                  }
                  
                  // For each selector, add scoping to all the necessary containers
                  // This ensures nav-tabs, card-header-tabs, nav-item, active, etc. all work
                  return `.bootstrap-scope ${trimmed}, .formio-modal ${trimmed}, .formio-dialog ${trimmed}, .formio-edit-form ${trimmed}, .formio-builder-dialog ${trimmed}, .formio-builder ${trimmed}, .formbuilder ${trimmed}`
                })
                
                return selectors.join(', ') + ' {'
              })
            
            // Create scoped style tag
            const style = document.createElement('style')
            style.id = bootstrapStyleId
            style.textContent = scopedCSS + `
              /* Additional scoped styles */
              .bootstrap-scope {
                /* Removed isolation to allow Form.io styles to work properly */
              }
              
              .formio-modal,
              .formio-dialog,
              .formio-edit-form,
              .formio-builder-dialog {
                /* Removed isolation to allow list styles to render */
              }
            `
            document.head.appendChild(style)
            bootstrapStyleRef.current = style

            // After Bootstrap CSS is loaded, load Form.io CSS from local package
            return fetch(formioCssUrl)
          })
          .then(response => {
            if (!response.ok) throw new Error('Failed to load Form.io CSS')
            return response.text()
          })
          .then(formioCssText => {
            // Check if global Form.io CSS is already loaded (from FormioCSSLoader)
            const globalFormioStyle = document.getElementById('formio-css-global')
            const formioStyleId = 'form-builder-formio-css'
            const existingFormioStyle = document.getElementById(formioStyleId)
            
            // Only add if global CSS isn't loaded and this instance hasn't loaded it
            // IMPORTANT: Form.io CSS should NOT be scoped - it's designed to work globally
            if (!globalFormioStyle && !existingFormioStyle) {
              const formioStyle = document.createElement('style')
              formioStyle.id = formioStyleId
              // Form.io CSS should be loaded as-is without scoping
              formioStyle.textContent = formioCssText
              document.head.appendChild(formioStyle)
            }
          })
          .catch((err: Error) => {
            console.error('Error loading Bootstrap or Form.io CSS:', err)
          })
      } else {
        bootstrapStyleRef.current = existingStyle
      }
    }

    // Cleanup: Remove Bootstrap and Form.io CSS when all instances unmount
    return () => {
      if (typeof window !== 'undefined') {
        ;(window as any).__formBuilderBootstrapCount--
        
        if ((window as any).__formBuilderBootstrapCount <= 0) {
          const styleToRemove = document.getElementById(bootstrapStyleId)
          const formioStyleToRemove = document.getElementById('form-builder-formio-css')
          
          if (styleToRemove) {
            styleToRemove.remove()
          }
          
          if (formioStyleToRemove) {
            formioStyleToRemove.remove()
          }
          
          ;(window as any).__formBuilderBootstrapCount = 0
        }
      }
    }
  }, [])

  return (
    <div className="bootstrap-scope">
      {children}
    </div>
  )
}

export default BootstrapProvider
