import { getPayload } from 'payload'
import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/forms/draft
 * Save a draft submission
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const body = await request.json()

    const { formId, formSlug, data, currentTab } = body

    if ((!formId && !formSlug) || !data) {
      return NextResponse.json(
        { error: 'Missing formId/formSlug or data' },
        { status: 400 }
      )
    }

    // Get form by slug or ID
    let form
    let formIdNum: number

    if (formSlug) {
      // Find form by slug
      const forms = await payload.find({
        collection: 'forms',
        where: {
          slug: { equals: formSlug },
        },
        limit: 1,
      })

      if (!forms.docs || forms.docs.length === 0) {
        return NextResponse.json(
          { error: 'Form not found' },
          { status: 404 }
        )
      }

      form = forms.docs[0]
      formIdNum = form.id
    } else {
      // Use formId
      formIdNum = typeof formId === 'string' ? parseInt(formId, 10) : formId

      if (isNaN(formIdNum)) {
        return NextResponse.json(
          { error: 'Invalid form ID' },
          { status: 400 }
        )
      }

      // Verify the form exists
      form = await payload.findByID({
        collection: 'forms',
        id: formIdNum,
      })

      if (!form) {
        return NextResponse.json(
          { error: 'Form not found' },
          { status: 404 }
        )
      }
    }

    // Extract email from submission data if available
    let submitterEmail: string | undefined
    if (typeof data === 'object' && data !== null) {
      const emailFields = ['email', 'Email', 'EMAIL', 'e-mail', 'emailAddress']
      for (const field of emailFields) {
        if (data[field] && typeof data[field] === 'string') {
          submitterEmail = data[field]
          break
        }
      }
    }

    // Get metadata from request
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Clean submission data - remove form button states
    const cleanData = { ...data }
    delete cleanData.submit
    delete cleanData.cancel
    delete cleanData.saveAndExit
    delete cleanData.next
    delete cleanData.previous

    // Check if draft already exists (by formId and email if available)
    let existingDraft = null
    if (submitterEmail) {
      const drafts = await payload.find({
        collection: 'form-submissions',
        where: {
          and: [
            { form: { equals: formIdNum } },
            { status: { equals: 'draft' } },
            { submitterEmail: { equals: submitterEmail } },
          ],
        },
        limit: 1,
      })
      existingDraft = drafts.docs[0] || null
    }

    // Create or update draft
    // Use overrideAccess: true for API operations (we handle validation ourselves)
    let submission
    if (existingDraft) {
      submission = await payload.update({
        collection: 'form-submissions',
        id: existingDraft.id,
        data: {
          data: cleanData,
          currentTab: currentTab || null,
          submitterEmail,
          metadata: {
            ipAddress: ipAddress.split(',')[0].trim(),
            userAgent: userAgent.substring(0, 500),
          },
        },
        overrideAccess: true,
      })
    } else {
      submission = await payload.create({
        collection: 'form-submissions',
        data: {
          form: formIdNum,
          data: cleanData,
          status: 'draft',
          currentTab: currentTab || null,
          submitterEmail,
          metadata: {
            ipAddress: ipAddress.split(',')[0].trim(),
            userAgent: userAgent.substring(0, 500),
          },
        },
      })
    }

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      message: 'Draft saved successfully',
    })
  } catch (error) {
    console.error('Draft save error:', error)
    
    return NextResponse.json(
      { error: 'Failed to save draft' },
      { status: 500 }
    )
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
