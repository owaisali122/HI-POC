import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Example: Users Search Endpoint for Searchable Dropdown
 * 
 * This is an example endpoint showing how to integrate with Payload CMS
 * to search users based on the query parameter.
 * 
 * Usage in Form Builder:
 * - API Endpoint: /api/search-users-example
 * - Search Query Parameter: query (default)
 * - Value Property: value
 * - Label Property: label
 * 
 * The component will automatically call:
 * /api/search-users-example?query={userInput}
 */

interface UserSearchResult {
  value: string
  label: string
  email?: string
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    // Get the current search value from the query parameter
    // This is automatically sent by the Searchable Dropdown component
    const query = searchParams.get('query') || ''
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)

    // Validate query length
    if (query.length < 2) {
      return NextResponse.json({
        results: [],
        count: 0,
        message: 'Query must be at least 2 characters',
      })
    }

    // Sanitize query
    const sanitizedQuery = query.trim().substring(0, 100)

    const payload = await getPayload({ config })

    // Search users collection using the query value
    const { docs } = await payload.find({
      collection: 'users',
      where: {
        or: [
          {
            email: {
              contains: sanitizedQuery,
            },
          },
          {
            firstName: {
              contains: sanitizedQuery,
            },
          },
          {
            lastName: {
              contains: sanitizedQuery,
            },
          },
        ],
      },
      limit,
      overrideAccess: false, // Set to true if you want admin access
    })

    // Transform to dropdown format
    // The component expects: { value: string, label: string }
    const results: UserSearchResult[] = docs.map((user) => ({
      value: user.id,
      label: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Unknown',
      email: user.email,
    }))

    return NextResponse.json({
      results,
      count: results.length,
    })
  } catch (error) {
    console.error('User search error:', error)
    return NextResponse.json(
      {
        error: 'Failed to search users',
        results: [],
        count: 0,
      },
      { status: 500 }
    )
  }
}
