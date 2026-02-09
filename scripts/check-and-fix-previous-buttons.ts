import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'

/**
 * Script to check and optionally remove Previous buttons from first tab
 * Run with: pnpm tsx scripts/check-and-fix-previous-buttons.ts
 */

async function checkAndFixPreviousButtons() {
  try {
    console.log('🚀 Checking Previous button placement...')

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
    console.log(`📊 Found ${tabs.length} tabs\n`)

    let foundIssues = false
    let removedCount = 0

    // Check each tab
    for (let i = 0; i < tabs.length; i++) {
      const tab = tabs[i]
      const tabLabel = tab.label || `Tab ${i + 1}`
      const isFirstTab = i === 0

      console.log(`📝 Checking tab ${i + 1}: "${tabLabel}"`)

      if (!tab.components) {
        console.log(`  ⚠️  No components found\n`)
        continue
      }

      // Find Previous buttons
      const previousButtons = tab.components.filter(
        (comp: any) => comp.type === 'tabnavigationbuttons' && comp.action === 'previous'
      )

      if (previousButtons.length === 0) {
        console.log(`  ✅ No Previous button found (correct)\n`)
      } else if (isFirstTab) {
        // Previous button on first tab - this is wrong!
        console.log(`  ❌ ISSUE: Found ${previousButtons.length} Previous button(s) on FIRST tab!`)
        console.log(`     Previous button should NOT be on the first tab.`)
        
        // Remove Previous buttons from first tab
        tab.components = tab.components.filter(
          (comp: any) => !(comp.type === 'tabnavigationbuttons' && comp.action === 'previous')
        )
        removedCount += previousButtons.length
        foundIssues = true
        console.log(`  ✅ Removed ${previousButtons.length} Previous button(s) from first tab\n`)
      } else {
        // Previous button on other tabs - this is correct
        console.log(`  ✅ Found ${previousButtons.length} Previous button(s) (correct for tab ${i + 1})\n`)
      }
    }

    if (foundIssues && removedCount > 0) {
      // Update form
      console.log(`💾 Updating form to remove ${removedCount} Previous button(s) from first tab...`)
      const updatedForm = await payload.update({
        collection: 'forms',
        id: 11,
        data: {
          schema: schema,
        },
      })

      console.log(`✅ Successfully updated form: "${updatedForm.title}"`)
      console.log(`🎉 Removed ${removedCount} Previous button(s) from first tab!`)
    } else if (!foundIssues) {
      console.log(`✅ All Previous buttons are correctly placed!`)
      console.log(`   - First tab: No Previous button ✓`)
      console.log(`   - Other tabs: Previous button present ✓`)
    }

    console.log('\n💡 You can now view the form at: http://localhost:3000/admin/collections/forms/11')

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

// Run the script
checkAndFixPreviousButtons()
  .then(() => {
    console.log('✨ Script completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })
