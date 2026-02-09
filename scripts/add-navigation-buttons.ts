import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'

/**
 * Script to add navigation buttons to each tab in form ID 11
 * Run with: pnpm tsx scripts/add-navigation-buttons.ts
 */

async function addNavigationButtons() {
  try {
    console.log('🚀 Starting navigation buttons addition...')

    const payload = await getPayload({ config })

    // Fetch form ID 11
    console.log('📋 Fetching form ID 11...')
    const form = await payload.findByID({
      collection: 'forms',
      id: 11,
    })

    if (!form) {
      console.error('❌ Form ID 11 not found!')
      process.exit(1)
    }

    console.log(`✅ Found form: "${form.title}" (slug: "${form.slug}")`)

    const formSlug = form.slug
    const schema = form.schema as any
    if (!schema || !schema.components) {
      console.error('❌ Form has no components!')
      process.exit(1)
    }

    // Find tabs component
    let tabsComponent = null
    let tabsIndex = -1

    for (let i = 0; i < schema.components.length; i++) {
      const component = schema.components[i]
      if (component.type === 'tabs' || component.type === 'panel') {
        tabsComponent = component
        tabsIndex = i
        console.log(`✅ Found tabs component at index ${i}`)
        break
      }
    }

    if (!tabsComponent || !tabsComponent.components) {
      console.error('❌ No tabs component found in form!')
      process.exit(1)
    }

    const tabs = tabsComponent.components
    console.log(`📊 Found ${tabs.length} tabs`)

    // Add navigation buttons to each tab
    for (let i = 0; i < tabs.length; i++) {
      const tab = tabs[i]
      const tabKey = tab.key || `tab${i}`
      const tabLabel = tab.label || `Tab ${i + 1}`

      console.log(`\n📝 Processing tab ${i + 1}: "${tabLabel}"`)

      // Initialize components array if it doesn't exist
      if (!tab.components) {
        tab.components = []
      }

      // Check if buttons already exist
      const hasButtons = tab.components.some((comp: any) => 
        comp.type === 'tabnavigationbuttons'
      )

      if (hasButtons) {
        console.log(`  ⏭️  Buttons already exist, skipping...`)
        continue
      }

      // Create button components
      const buttons: any[] = []

      // Previous button (not on first tab)
      if (i > 0) {
        buttons.push({
          type: 'tabnavigationbuttons',
          key: `${tabKey}_previous`,
          label: 'Previous',
          action: 'previous',
          formSlug: formSlug,
          input: false,
          tableView: false,
        })
      }

      // Save & Exit button (on all tabs)
      buttons.push({
        type: 'tabnavigationbuttons',
        key: `${tabKey}_saveExit`,
        label: 'Save & Exit',
        action: 'saveAndExit',
        formSlug: formSlug,
        input: false,
        tableView: false,
      })

      // Next button (not on last tab)
      if (i < tabs.length - 1) {
        buttons.push({
          type: 'tabnavigationbuttons',
          key: `${tabKey}_next`,
          label: 'Next',
          action: 'next',
          formSlug: formSlug,
          input: false,
          tableView: false,
        })
      } else {
        // Submit button (on last tab only)
        buttons.push({
          type: 'tabnavigationbuttons',
          key: `${tabKey}_submit`,
          label: 'Submit',
          action: 'submit',
          formSlug: formSlug,
          input: false,
          tableView: false,
        })
      }

      // Add buttons to tab
      tab.components = [...tab.components, ...buttons]
      console.log(`  ✅ Added ${buttons.length} button(s) to tab`)
    }

    // Update form
    console.log('\n💾 Updating form...')
    const updatedForm = await payload.update({
      collection: 'forms',
      id: 11,
      data: {
        schema: schema,
      },
    })

    console.log(`✅ Successfully updated form: "${updatedForm.title}"`)
    console.log('🎉 Navigation buttons have been added to all tabs!')
    console.log('💡 You can now view the form at: http://localhost:3000/admin/collections/forms/11')

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

// Run the script
addNavigationButtons()
  .then(() => {
    console.log('✨ Script completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })
