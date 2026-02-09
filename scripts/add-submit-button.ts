import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'

/**
 * Script to add Submit button to the last tab
 * Run with: pnpm tsx scripts/add-submit-button.ts
 */

async function addSubmitButton() {
  try {
    console.log('🚀 Adding Submit button to last tab...')

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

    for (let i = 0; i < schema.components.length; i++) {
      const component = schema.components[i]
      if (component.type === 'tabs' || component.type === 'panel') {
        tabsComponent = component
        break
      }
    }

    if (!tabsComponent || !tabsComponent.components) {
      console.error('❌ No tabs component found in form!')
      process.exit(1)
    }

    const tabs = tabsComponent.components
    const lastTabIndex = tabs.length - 1
    const lastTab = tabs[lastTabIndex]
    const tabKey = lastTab.key || `tab${lastTabIndex}`
    const tabLabel = lastTab.label || `Tab ${lastTabIndex + 1}`

    console.log(`📊 Found ${tabs.length} tabs`)
    console.log(`📝 Processing last tab: "${tabLabel}"`)

    if (!lastTab.components) {
      lastTab.components = []
    }

    // Check if Submit button already exists
    const hasSubmitButton = lastTab.components.some(
      (comp: any) => comp.type === 'tabnavigationbuttons' && comp.action === 'submit'
    )

    if (hasSubmitButton) {
      console.log(`  ⏭️  Submit button already exists, skipping...`)
      process.exit(0)
    }

    // Remove Next button from last tab if it exists
    lastTab.components = lastTab.components.filter(
      (comp: any) => !(comp.type === 'tabnavigationbuttons' && comp.action === 'next')
    )

    // Add Submit button to last tab
    lastTab.components.push({
      type: 'tabnavigationbuttons',
      key: `${tabKey}_submit`,
      label: 'Submit',
      action: 'submit',
      formSlug: form.slug,
      input: false,
      tableView: false,
    })

    console.log(`  ✅ Added Submit button to last tab`)
    console.log(`  ✅ Removed Next button from last tab (if it existed)`)

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
    console.log('🎉 Submit button has been added to the last tab!')
    console.log('💡 You can now view the form at: http://localhost:3000/admin/collections/forms/11')

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

// Run the script
addSubmitButton()
  .then(() => {
    console.log('✨ Script completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })
