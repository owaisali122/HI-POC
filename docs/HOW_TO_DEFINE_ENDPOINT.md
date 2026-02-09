# How to Define Endpoint in Searchable Dropdown

This guide shows you exactly how to fill in the **API Endpoint** field when configuring the Searchable Dropdown component in the Form Builder.

## Step-by-Step Instructions

### 1. Open Component Settings

1. Drag the **Searchable Dropdown** component onto your form
2. Click on the component to select it
3. In the right panel, find the **API Endpoint** field

### 2. Enter Your Endpoint URL

In the **API Endpoint** field, enter your endpoint URL. You can use `${query}` placeholders that will be automatically replaced with the search value.

## Endpoint Format Examples

### ✅ Using ${query} Placeholder (Recommended)

Use `${query}` in your URL to replace with the search value:

```
https://restcountries.com/v3.1/name/${query}
```

**What happens:**
- User types "pakistan"
- Component calls: `https://restcountries.com/v3.1/name/pakistan`

### ✅ Multiple Placeholders

You can use multiple `${query}` placeholders:

```
https://api.example.com/search/${query}/filter/${query1}
```

**What happens:**
- User types "test"
- Component calls: `https://api.example.com/search/test/filter/test`
- All `${query}`, `${query1}`, `${query2}`, etc. are replaced with the same search value

### ✅ Relative URL (Auto Query Param)

If you don't use `${query}` placeholder, the component automatically adds `?query=`:

```
/api/searchable-dropdown
```

**What happens:**
- User types "apple"
- Component calls: `http://localhost:3000/api/searchable-dropdown?query=apple`

### ✅ Custom Endpoint with Placeholder

```
/api/users/${query}
```

**What happens:**
- User types "john"
- Component calls: `http://localhost:3000/api/users/john`

## Important Notes

### ✅ How It Works

**With `${query}` placeholder:**
1. You enter: `https://restcountries.com/v3.1/name/${query}`
2. User types "pakistan"
3. Component replaces `${query}` with "pakistan"
4. Final URL: `https://restcountries.com/v3.1/name/pakistan`

**Without `${query}` placeholder:**
1. You enter: `/api/searchable-dropdown`
2. User types "apple"
3. Component automatically adds: `?query=apple`
4. Final URL: `/api/searchable-dropdown?query=apple`

### ✅ Multiple Placeholders

All `${query}`, `${query1}`, `${query2}`, etc. are replaced with the same search value:

```
https://api.example.com/${query}/search/${query1}
```

When user types "test", becomes:
```
https://api.example.com/test/search/test
```

## Complete Configuration Example

When configuring your Searchable Dropdown component:

### Field: API Endpoint
```
https://restcountries.com/v3.1/name/${query}
```

**That's it!** The component automatically:
- Replaces `${query}` with the search value
- Expects response with `value` and `label` properties
- Handles all the rest automatically

## Real-World Examples

### Example 1: Search Users

**API Endpoint field:**
```
/api/search-users
```

**Your endpoint code:**
```typescript
// src/app/api/search-users/route.ts
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('query') || ''
  // ... search logic
}
```

**Result:** Component calls `/api/search-users?query={userInput}`

### Example 2: Search Products

**API Endpoint field:**
```
/api/products/search
```

**Your endpoint code:**
```typescript
// src/app/api/products/search/route.ts
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('query') || ''
  // ... search logic
}
```

**Result:** Component calls `/api/products/search?query={userInput}`

### Example 3: External API

**API Endpoint field:**
```
https://api.external-service.com/v1/search
```

**Result:** Component calls `https://api.external-service.com/v1/search?query={userInput}`

## Visual Guide

```
┌─────────────────────────────────────────┐
│  Searchable Dropdown Component Settings │
├─────────────────────────────────────────┤
│                                         │
│  Label: [Search Users        ]         │
│                                         │
│  API Endpoint:                         │
│  ┌─────────────────────────────────┐   │
│  │ /api/search-users              │   │ ← Enter your endpoint here
│  └─────────────────────────────────┘   │
│                                         │
│  Search Query Parameter:                │
│  ┌─────────────────────────────────┐   │
│  │ query                           │   │ ← Default: "query"
│  └─────────────────────────────────┘   │
│                                         │
│  Value Property:                       │
│  ┌─────────────────────────────────┐   │
│  │ value                            │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Label Property:                       │
│  ┌─────────────────────────────────┐   │
│  │ label                            │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

## Quick Reference

| What You Enter | User Types | What Component Calls |
|----------------|------------|---------------------|
| `https://restcountries.com/v3.1/name/${query}` | "pakistan" | `https://restcountries.com/v3.1/name/pakistan` |
| `/api/users/${query}` | "john" | `/api/users/john` |
| `/api/searchable-dropdown` | "apple" | `/api/searchable-dropdown?query=apple` |
| `https://api.example.com/search/${query}` | "test" | `https://api.example.com/search/test` |

## Troubleshooting

### Problem: Endpoint not being called

**Check:**
- ✅ Is your endpoint URL correct?
- ✅ If using `${query}`, is it spelled correctly?
- ✅ Is your endpoint route file in the correct location?
- ✅ Does your endpoint handle GET requests?

### Problem: Query parameter not received

**If using `${query}` placeholder:**
- ✅ The placeholder is replaced in the URL path, not as a query parameter
- ✅ Your endpoint should read the value from the URL path

**If NOT using `${query}` placeholder:**
- ✅ Component automatically adds `?query=...`
- ✅ Your endpoint should read `request.nextUrl.searchParams.get('query')`

### Problem: CORS errors with external API

**Solution:** You may need to configure CORS headers in your external API or use a proxy endpoint.

## Summary

**Just enter the endpoint URL in the "API Endpoint" field:**
- ✅ Use `${query}` placeholder: `https://restcountries.com/v3.1/name/${query}`
- ✅ Or simple path: `/api/searchable-dropdown` (auto-adds `?query=...`)
- ✅ Supports multiple placeholders: `${query}`, `${query1}`, etc.
- ✅ Component automatically handles URL replacement
- ✅ Expects response with `value` and `label` properties

That's it! The component handles everything automatically.
