import { NextRequest, NextResponse } from 'next/server'

/**
 * Searchable Dropdown API Route
 * 
 * This API endpoint provides search functionality for the Searchable Dropdown component.
 * The component automatically appends the search query to this endpoint.
 * 
 * How it works:
 * 1. User types "apple" in the search box
 * 2. Component calls: /api/searchable-dropdown?query=apple
 * 3. This endpoint receives the 'query' parameter and returns filtered results
 * 
 * Configuration in Form Builder:
 * - API Endpoint: /api/searchable-dropdown
 * - Search Query Parameter: query (default)
 * 
 * Response format:
 * {
 *   results: [
 *     { value: "1", label: "Option 1" },
 *     { value: "2", label: "Option 2" }
 *   ],
 *   count: 2
 * }
 */

interface DropdownOption {
  value: string | number
  label: string
  [key: string]: any
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    // Get the search query value - this is automatically sent by the component
    // Example: /api/searchable-dropdown?query=apple
    const query = searchParams.get('query') || ''

    // Minimum query length check
    if (query.length < 2) {
      return NextResponse.json(
        { 
          error: 'Query must be at least 2 characters',
          results: [],
          count: 0
        },
        { status: 400 }
      )
    }

    // Sample data - Replace this with your actual data source
    // This could integrate with:
    // - Database queries (Payload collections)
    // - External APIs
    // - Static data files
    // - Cached data
    const sampleData: DropdownOption[] = [
      { value: '1', label: 'Apple', category: 'Fruit' },
      { value: '2', label: 'Banana', category: 'Fruit' },
      { value: '3', label: 'Cherry', category: 'Fruit' },
      { value: '4', label: 'Date', category: 'Fruit' },
      { value: '5', label: 'Elderberry', category: 'Fruit' },
      { value: '6', label: 'Fig', category: 'Fruit' },
      { value: '7', label: 'Grape', category: 'Fruit' },
      { value: '8', label: 'Honeydew', category: 'Fruit' },
      { value: '9', label: 'Kiwi', category: 'Fruit' },
      { value: '10', label: 'Lemon', category: 'Fruit' },
      { value: '11', label: 'Mango', category: 'Fruit' },
      { value: '12', label: 'Orange', category: 'Fruit' },
      { value: '13', label: 'Papaya', category: 'Fruit' },
      { value: '14', label: 'Quince', category: 'Fruit' },
      { value: '15', label: 'Raspberry', category: 'Fruit' },
      { value: '16', label: 'Strawberry', category: 'Fruit' },
      { value: '17', label: 'Tomato', category: 'Vegetable' },
      { value: '18', label: 'Ugli Fruit', category: 'Fruit' },
      { value: '19', label: 'Vanilla Bean', category: 'Spice' },
      { value: '20', label: 'Watermelon', category: 'Fruit' },
    ]

    // Filter options based on query (case-insensitive)
    const filteredOptions = sampleData.filter((option) =>
      option.label.toLowerCase().includes(query.toLowerCase()) ||
      (option.category && option.category.toLowerCase().includes(query.toLowerCase()))
    )

    // Limit results (optional, for performance)
    const limit = parseInt(searchParams.get('limit') || '50')
    const limitedResults = filteredOptions.slice(0, limit)

    // Return results in a format the component expects
    return NextResponse.json({
      results: limitedResults,
      count: limitedResults.length,
      total: filteredOptions.length,
    })
  } catch (error) {
    console.error('Searchable dropdown API error:', error)
    return NextResponse.json(
      { error: 'Failed to search options' },
      { status: 500 }
    )
  }
}
