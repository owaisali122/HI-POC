import { NextRequest, NextResponse } from 'next/server'

/**
 * Address Search API Route
 * 
 * This is a sample API endpoint for address search.
 * You can configure the Address Search component to use this endpoint
 * or point it to your own address search service (e.g., Google Places API, HERE API, etc.)
 * 
 * Example usage in Form.io component:
 * API Endpoint: /api/address-search?q={query}
 */

interface AddressResult {
  formatted_address: string
  street?: string
  address_line_1?: string
  city?: string
  state?: string
  state_code?: string
  zip?: string
  postal_code?: string
  zip_code?: string
  country?: string
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''

    if (!query || query.length < 3) {
      return NextResponse.json(
        { error: 'Query must be at least 3 characters' },
        { status: 400 }
      )
    }

    // Sample address data - Replace this with your actual address search logic
    // This could integrate with:
    // - Google Places API
    // - HERE Geocoding API
    // - Mapbox Geocoding API
    // - Your own address database
    const sampleAddresses: AddressResult[] = [
      {
        formatted_address: '123 Main Street, Honolulu, HI 96813',
        street: '123 Main Street',
        address_line_1: '123 Main Street',
        city: 'Honolulu',
        state: 'Hawaii',
        state_code: 'HI',
        zip: '96813',
        postal_code: '96813',
        zip_code: '96813',
        country: 'United States',
      },
      {
        formatted_address: '456 King Street, Honolulu, HI 96813',
        street: '456 King Street',
        address_line_1: '456 King Street',
        city: 'Honolulu',
        state: 'Hawaii',
        state_code: 'HI',
        zip: '96813',
        postal_code: '96813',
        zip_code: '96813',
        country: 'United States',
      },
      {
        formatted_address: '789 Kalakaua Avenue, Honolulu, HI 96815',
        street: '789 Kalakaua Avenue',
        address_line_1: '789 Kalakaua Avenue',
        city: 'Honolulu',
        state: 'Hawaii',
        state_code: 'HI',
        zip: '96815',
        postal_code: '96815',
        zip_code: '96815',
        country: 'United States',
      },
    ]

    // Filter addresses based on query (case-insensitive)
    const filteredAddresses = sampleAddresses.filter((address) =>
      address.formatted_address.toLowerCase().includes(query.toLowerCase()) ||
      address.street?.toLowerCase().includes(query.toLowerCase()) ||
      address.city?.toLowerCase().includes(query.toLowerCase())
    )

    // Return results in a format the component expects
    return NextResponse.json({
      results: filteredAddresses,
      count: filteredAddresses.length,
    })
  } catch (error) {
    console.error('Address search error:', error)
    return NextResponse.json(
      { error: 'Failed to search addresses' },
      { status: 500 }
    )
  }
}
