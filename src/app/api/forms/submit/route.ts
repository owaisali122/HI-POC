import { getPayload } from 'payload'
import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const body = await request.json()

    const { formId, data } = body

    if (!formId || !data) {
      return NextResponse.json(
        { error: 'Missing formId or data' },
        { status: 400 }
      )
    }

    // Convert formId to number if it's a string
    const formIdNum = typeof formId === 'string' ? parseInt(formId, 10) : formId

    if (isNaN(formIdNum)) {
      return NextResponse.json(
        { error: 'Invalid form ID' },
        { status: 400 }
      )
    }

    // Verify the form exists and is published
    const form = await payload.findByID({
      collection: 'forms',
      id: formIdNum,
    })

    if (!form) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      )
    }

    if (form.status !== 'published') {
      return NextResponse.json(
        { error: 'Form is not available for submissions' },
        { status: 400 }
      )
    }

    // Extract email from submission data if available
    let submitterEmail: string | undefined
    if (typeof data === 'object' && data !== null) {
      // Look for common email field names
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

    // Create the submission
    const submission = await payload.create({
      collection: 'form-submissions',
      data: {
        form: formIdNum,
        data: cleanData,
        submitterEmail,
        metadata: {
          ipAddress: ipAddress.split(',')[0].trim(),
          userAgent: userAgent.substring(0, 500), // Limit length
        },
      },
    })

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      message: 'Form submitted successfully',
    })
  } catch (error) {
    console.error('Form submission error:', error)
    
    return NextResponse.json(
      { error: 'Failed to submit form' },
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
