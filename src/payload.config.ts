import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig, APIError, headersWithCors } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import type { Endpoint } from 'payload'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Forms } from './collections/Forms'
import { FormSubmissions } from './collections/FormSubmissions'
import { countryCityData } from './data/country-city-data'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Country-City static data endpoint with path parameter
const countryCitySearchEndpoint: Endpoint = {
  path: '/country-city/:query',
  method: 'get',
  handler: async (req) => {
    try {
      const query = req.routeParams?.query as string | undefined
      
      const headers = new Headers()
      headers.set('Access-Control-Allow-Origin', '*')
      headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
      headers.set('Access-Control-Allow-Headers', 'Content-Type')
      
      if (!query || query.trim().length === 0) {
        return Response.json(
          { results: countryCityData },
          {
            headers: headersWithCors({
              headers,
              req,
            }),
          }
        )
      }

      // Filter data based on query (case-insensitive search)
      const searchTerm = query.toLowerCase()
      const filteredResults = countryCityData.filter(
        (item) =>
          item.value.toLowerCase().includes(searchTerm) ||
          item.country.toLowerCase().includes(searchTerm) ||
          item.city.toLowerCase().includes(searchTerm)
      )
      
      return Response.json(
        { results: filteredResults },
        {
          headers: headersWithCors({
            headers,
            req,
          }),
        }
      )
    } catch (error) {
      req.payload.logger.error(`Error searching country-city data: ${error}`)
      throw new APIError('Failed to search country-city data', 500)
    }
  },
}

// Country-City static data endpoint with query parameter
const countryCityQueryEndpoint: Endpoint = {
  path: '/country-city',
  method: 'get',
  handler: async (req) => {
    try {
      const headers = new Headers()
      headers.set('Access-Control-Allow-Origin', '*')
      headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
      headers.set('Access-Control-Allow-Headers', 'Content-Type')
      
      if (!req.url) {
        return Response.json(
          { results: countryCityData },
          {
            headers: headersWithCors({
              headers,
              req,
            }),
          }
        )
      }
      
      const url = new URL(req.url)
      const query = url.searchParams.get('query') || ''

      if (!query || query.trim().length === 0) {
        return Response.json(
          { results: countryCityData },
          {
            headers: headersWithCors({
              headers,
              req,
            }),
          }
        )
      }

      // Filter data based on query (case-insensitive search)
      const searchTerm = query.toLowerCase()
      const filteredResults = countryCityData.filter(
        (item) =>
          item.value.toLowerCase().includes(searchTerm) ||
          item.country.toLowerCase().includes(searchTerm) ||
          item.city.toLowerCase().includes(searchTerm)
      )

      return Response.json(
        { results: filteredResults },
        {
          headers: headersWithCors({
            headers,
            req,
          }),
        }
      )
    } catch (error) {
      req.payload.logger.error(`Error searching country-city data: ${error}`)
      throw new APIError('Failed to search country-city data', 500)
    }
  },
}

// OPTIONS handler for preflight requests - path parameter endpoint
const countryCitySearchOptionsEndpoint: Endpoint = {
  path: '/country-city/:query',
  method: 'options',
  handler: async (req) => {
    const headers = new Headers()
    headers.set('Access-Control-Allow-Origin', '*')
    headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
    headers.set('Access-Control-Allow-Headers', 'Content-Type')
    
    return new Response(null, {
      status: 200,
      headers: headersWithCors({
        headers,
        req,
      }),
    })
  },
}

// OPTIONS handler for preflight requests - query parameter endpoint
const countryCityQueryOptionsEndpoint: Endpoint = {
  path: '/country-city',
  method: 'options',
  handler: async (req) => {
    const headers = new Headers()
    headers.set('Access-Control-Allow-Origin', '*')
    headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
    headers.set('Access-Control-Allow-Headers', 'Content-Type')
    
    return new Response(null, {
      status: 200,
      headers: headersWithCors({
        headers,
        req,
      }),
    })
  },
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Forms, FormSubmissions],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [],
  endpoints: [
    countryCitySearchEndpoint,
    countryCityQueryEndpoint,
    countryCitySearchOptionsEndpoint,
    countryCityQueryOptionsEndpoint,
  ],
})
