import { getPayload } from 'payload'
import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/forms/draft/[submissionId]
 * Get a draft submission by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { submissionId: string } }
) {
  try {
    const payload = await getPayload({ config })
    const submissionId = parseInt(params.submissionId, 10)

    if (isNaN(submissionId)) {
      return NextResponse.json(
        { error: 'Invalid submission ID' },
        { status: 400 }
      )
    }

    const submission = await payload.findByID({
      collection: 'form-submissions',
      id: submissionId,
    })

    if (!submission) {
      return NextResponse.json(
        { error: 'Draft not found' },
        { status: 404 }
      )
    }

    if (submission.status !== 'draft') {
      return NextResponse.json(
        { error: 'Submission is not a draft' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      submission: {
        id: submission.id,
        form: submission.form,
        data: submission.data,
        currentTab: submission.currentTab,
        submitterEmail: submission.submitterEmail,
        createdAt: submission.createdAt,
        updatedAt: submission.updatedAt,
      },
    })
  } catch (error) {
    console.error('Get draft error:', error)
    
    return NextResponse.json(
      { error: 'Failed to get draft' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/forms/draft/[submissionId]
 * Update a draft submission
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { submissionId: string } }
) {
  try {
    const payload = await getPayload({ config })
    const submissionId = parseInt(params.submissionId, 10)
    const body = await request.json()

    if (isNaN(submissionId)) {
      return NextResponse.json(
        { error: 'Invalid submission ID' },
        { status: 400 }
      )
    }

    const { data, currentTab } = body

    if (!data) {
      return NextResponse.json(
        { error: 'Missing data' },
        { status: 400 }
      )
    }

    // Verify draft exists
    const existing = await payload.findByID({
      collection: 'form-submissions',
      id: submissionId,
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Draft not found' },
        { status: 404 }
      )
    }

    if (existing.status !== 'draft') {
      return NextResponse.json(
        { error: 'Submission is not a draft' },
        { status: 400 }
      )
    }

    // Clean submission data
    const cleanData = { ...data }
    delete cleanData.submit
    delete cleanData.cancel
    delete cleanData.saveAndExit
    delete cleanData.next
    delete cleanData.previous

    // Update draft
    // Use overrideAccess: true for API operations (we handle validation ourselves)
    const submission = await payload.update({
      collection: 'form-submissions',
      id: submissionId,
      data: {
        data: cleanData,
        currentTab: currentTab !== undefined ? currentTab : existing.currentTab,
      },
      overrideAccess: true,
    })

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      message: 'Draft updated successfully',
    })
  } catch (error) {
    console.error('Update draft error:', error)
    
    return NextResponse.json(
      { error: 'Failed to update draft' },
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
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
