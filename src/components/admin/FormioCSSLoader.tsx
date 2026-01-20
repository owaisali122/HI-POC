'use client'

import { useEffect } from 'react'

/**
 * FormioCSSLoader - Ensures Form.io CSS is loaded immediately on mount
 * This component loads CSS via link tag to ensure font paths resolve correctly
 */
export const FormioCSSLoader: React.FC = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const formioLinkId = 'formio-css-global-link'
    const formioStyleId = 'formio-css-global'
    
    // Check if CSS is already loaded
    if (document.getElementById(formioLinkId) || document.getElementById(formioStyleId)) {
      return
    }

    // Use link tag instead of style tag to ensure font paths resolve correctly
    const link = document.createElement('link')
    link.id = formioLinkId
    link.rel = 'stylesheet'
    link.href = '/api/formio-css'
    link.onerror = () => {
      console.error('Failed to load Form.io CSS via link tag, trying inline fallback')
      // Fallback to inline style if link fails
      fetch('/api/formio-css')
        .then(response => {
          if (!response.ok) throw new Error('Failed to load Form.io CSS')
          return response.text()
        })
        .then(cssText => {
          const style = document.createElement('style')
          style.id = formioStyleId
          style.textContent = cssText
          document.head.appendChild(style)
        })
        .catch(err => {
          console.error('Error loading Form.io CSS:', err)
        })
    }
    document.head.appendChild(link)
  }, [])

  return null
}

export default FormioCSSLoader
