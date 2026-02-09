import { getPayload } from 'payload'
import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/forms/draft/resume?formId=11&email=user@example.com
 * Get the latest draft for a form (by formId and optionally email)
 */
export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { searchParams } = new URL(request.url)
    const formId = searchParams.get('formId')
    const formSlug = searchParams.get('formSlug')
    const email = searchParams.get('email')

    if (!formId && !formSlug) {
      return NextResponse.json(
        { error: 'Missing formId or formSlug parameter' },
        { status: 400 }
      )
    }

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

      formIdNum = forms.docs[0].id
    } else {
      formIdNum = parseInt(formId!, 10)
      if (isNaN(formIdNum)) {
        return NextResponse.json(
          { error: 'Invalid form ID' },
          { status: 400 }
        )
      }
    }

    // Build query
    const where: any = {
      and: [
        { form: { equals: formIdNum } },
        { status: { equals: 'draft' } },
      ],
    }

    // If email provided, filter by email
    if (email) {
      where.and.push({ submitterEmail: { equals: email } })
    }

    // Get latest draft
    const drafts = await payload.find({
      collection: 'form-submissions',
      where,
      limit: 1,
      sort: '-updatedAt',
    })

    if (!drafts.docs || drafts.docs.length === 0) {
      return NextResponse.json({
        success: true,
        hasDraft: false,
        submission: null,
      })
    }

    const draft = drafts.docs[0]

    return NextResponse.json({
      success: true,
      hasDraft: true,
      submission: {
        id: draft.id,
        form: draft.form,
        data: draft.data,
        currentTab: draft.currentTab,
        submitterEmail: draft.submitterEmail,
        createdAt: draft.createdAt,
        updatedAt: draft.updatedAt,
      },
    })
  } catch (error) {
    console.error('Resume draft error:', error)
    
    return NextResponse.json(
      { error: 'Failed to get draft' },
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
