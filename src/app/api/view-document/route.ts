import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * API endpoint for viewing documents
 * 
 * Query parameters:
 * - id: Document ID (from Media collection)
 * - url: Direct document URL
 * 
 * Returns document information including URL for viewing
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get('id')
    const documentUrl = searchParams.get('url')

    if (!documentId && !documentUrl) {
      return NextResponse.json(
        { error: 'Document ID or URL is required' },
        { status: 400 }
      )
    }

    const payload = await getPayload({ config })

    // If document ID is provided, fetch from Media collection
    if (documentId) {
      try {
        const document = await payload.findByID({
          collection: 'media',
          id: documentId,
          depth: 0,
        })

        if (!document) {
          return NextResponse.json(
            { error: 'Document not found' },
            { status: 404 }
          )
        }

        // Return document information
        return NextResponse.json({
          success: true,
          document: {
            id: document.id,
            name: document.filename || document.url?.split('/').pop() || 'document',
            url: document.url || document.s3Url || document.filename,
            fileUrl: document.url || document.s3Url || document.filename,
            path: document.url || document.s3Url || document.filename,
            filename: document.filename,
            mimeType: document.mimeType,
            filesize: document.filesize,
            type: document.mimeType,
            size: document.filesize,
          },
        })
      } catch (error: any) {
        if (error.status === 404) {
          return NextResponse.json(
            { error: 'Document not found' },
            { status: 404 }
          )
        }
        throw error
      }
    }

    // If document URL is provided, return it directly
    if (documentUrl) {
      return NextResponse.json({
        success: true,
        document: {
          url: documentUrl,
          fileUrl: documentUrl,
          path: documentUrl,
        },
        url: documentUrl,
      })
    }

    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Error viewing document:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to view document' },
      { status: 500 }
    )
  }
}
