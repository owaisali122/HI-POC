import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'

/**
 * Script to update existing navigation buttons from formId to formSlug
 * Run with: pnpm tsx scripts/update-buttons-to-slug.ts
 */

async function updateButtonsToSlug() {
  try {
    console.log('🚀 Starting button update...')

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

    let updatedCount = 0

    // Update buttons in each tab
    for (let i = 0; i < tabs.length; i++) {
      const tab = tabs[i]
      const tabLabel = tab.label || `Tab ${i + 1}`

      console.log(`\n📝 Processing tab ${i + 1}: "${tabLabel}"`)

      if (!tab.components) {
        continue
      }

      // Find and update button components
      for (let j = 0; j < tab.components.length; j++) {
        const component = tab.components[j]
        
        if (component.type === 'tabnavigationbuttons') {
          // Update from formId to formSlug
          if (component.formId && !component.formSlug) {
            component.formSlug = form.slug
            delete component.formId
            updatedCount++
            console.log(`  ✅ Updated button: ${component.key || 'unnamed'}`)
          } else if (component.formSlug) {
            console.log(`  ⏭️  Button already uses slug: ${component.key || 'unnamed'}`)
          }
        }
      }
    }

    if (updatedCount > 0) {
      // Update form
      console.log(`\n💾 Updating form with ${updatedCount} button(s)...`)
      const updatedForm = await payload.update({
        collection: 'forms',
        id: 11,
        data: {
          schema: schema,
        },
      })

      console.log(`✅ Successfully updated form: "${updatedForm.title}"`)
      console.log(`🎉 Updated ${updatedCount} button(s) to use form slug!`)
    } else {
      console.log('\n✅ All buttons already use form slug!')
    }

    console.log('💡 You can now view the form at: http://localhost:3000/admin/collections/forms/11')

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

// Run the script
updateButtonsToSlug()
  .then(() => {
    console.log('✨ Script completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })
