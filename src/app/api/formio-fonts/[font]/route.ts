import { readFile } from 'fs/promises'
import { join } from 'path'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { font: string } }
) {
  try {
    // Extract font name (remove query string if present, e.g., "bootstrap-icons.woff2?hash")
    const fontName = params.font.split('?')[0]
    
    // Try @formio/js first, fallback to formiojs
    let fontPath = join(
      process.cwd(),
      'node_modules',
      '@formio',
      'js',
      'dist',
      'fonts',
      fontName
    )
    
    try {
      await readFile(fontPath)
    } catch {
      // Fallback to formiojs
      fontPath = join(
        process.cwd(),
        'node_modules',
        'formiojs',
        'dist',
        'fonts',
        fontName
      )
    }
    
    const fontContent = await readFile(fontPath)
    
    // Determine content type based on font file extension
    const contentType =
      fontName.endsWith('.woff2')
        ? 'font/woff2'
        : fontName.endsWith('.woff')
        ? 'font/woff'
        : fontName.endsWith('.ttf')
        ? 'font/ttf'
        : 'application/octet-stream'
    
    return new NextResponse(fontContent, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error) {
    console.error('Error reading Form.io font:', error)
    return new NextResponse('Font not found', { status: 404 })
  }
}
