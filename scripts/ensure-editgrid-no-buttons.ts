import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload.config'

/**
 * Script to ensure Edit Grid components have saveRow: false to hide save/cancel buttons
 * Run with: pnpm tsx scripts/ensure-editgrid-no-buttons.ts
 */

async function ensureEditGridNoButtons() {
  try {
    console.log('🚀 Checking Edit Grid configurations...')

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

    let updated = false

    // Recursive function to find and update all Edit Grid components
    const updateEditGrids = (components: any[]): void => {
      for (const component of components) {
        if (component.type === 'editgrid') {
          console.log(`\n📝 Found Edit Grid: "${component.key || component.label}"`)
          
          const needsUpdate = 
            component.saveRow !== false ||
            component.modalEdit !== false ||
            component.inlineEdit !== true

          if (needsUpdate) {
            console.log('  ⚠️  Missing required properties, updating...')
            component.saveRow = false
            component.modalEdit = false
            component.inlineEdit = true
            updated = true
            console.log('  ✅ Updated: saveRow=false, modalEdit=false, inlineEdit=true')
          } else {
            console.log('  ✅ Already configured correctly')
          }
        }

        // Recursively check nested components
        if (component.components && Array.isArray(component.components)) {
          updateEditGrids(component.components)
        }

        // Check tabs/panels
        if (component.type === 'tabs' || component.type === 'panel') {
          if (component.components && Array.isArray(component.components)) {
            updateEditGrids(component.components)
          }
        }
      }
    }

    updateEditGrids(schema.components)

    if (updated) {
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
      console.log('🎉 All Edit Grid components now have saveRow=false, modalEdit=false, inlineEdit=true')
    } else {
      console.log('\n✅ All Edit Grid components are already configured correctly!')
    }

    console.log('\n💡 Configuration ensures:')
    console.log('   - No save button per row')
    console.log('   - No cancel button per row')
    console.log('   - No modal editing')
    console.log('   - Inline editing enabled')
    console.log('   - Form\'s main Submit button handles everything')

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

// Run the script
ensureEditGridNoButtons()
  .then(() => {
    console.log('✨ Script completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })
