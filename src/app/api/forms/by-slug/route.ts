import { getPayload } from 'payload'
import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/forms/by-slug?slug=tabs
 * Get form by slug and return its ID
 */
export async function GET(request: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    if (!slug) {
      return NextResponse.json(
        { error: 'Missing slug parameter' },
        { status: 400 }
      )
    }

    // Find form by slug
    const forms = await payload.find({
      collection: 'forms',
      where: {
        slug: { equals: slug },
      },
      limit: 1,
    })

    if (!forms.docs || forms.docs.length === 0) {
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      )
    }

    const form = forms.docs[0]

    return NextResponse.json({
      success: true,
      form: {
        id: form.id,
        slug: form.slug,
        title: form.title,
        status: form.status,
      },
    })
  } catch (error) {
    console.error('Get form by slug error:', error)
    
    return NextResponse.json(
      { error: 'Failed to get form' },
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
