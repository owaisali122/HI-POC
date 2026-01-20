import { readFile } from 'fs/promises'
import { join } from 'path'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Try @formio/js first (used by @formio/react), fallback to formiojs
    let formioPath = join(process.cwd(), 'node_modules', '@formio', 'js', 'dist', 'formio.full.min.css')
    let formioDir = join(process.cwd(), 'node_modules', '@formio', 'js', 'dist')
    
    try {
      await readFile(formioPath, 'utf-8')
    } catch {
      // Fallback to formiojs if @formio/js not found
      formioPath = join(process.cwd(), 'node_modules', 'formiojs', 'dist', 'formio.full.min.css')
      formioDir = join(process.cwd(), 'node_modules', 'formiojs', 'dist')
    }
    
    let cssContent = await readFile(formioPath, 'utf-8')
    
    // Fix font paths - replace relative paths with absolute paths via API route
    // Replace: fonts/bootstrap-icons.woff2?hash -> /api/formio-fonts/bootstrap-icons.woff2?hash
    // Handle both with and without query strings
    cssContent = cssContent.replace(
      /url\(fonts\/([^?)]+)(\?[^)]*)?\)/g,
      (match, fontFile, queryString) => {
        return `url(/api/formio-fonts/${fontFile}${queryString || ''})`
      }
    )
    
    return new NextResponse(cssContent, {
      headers: {
        'Content-Type': 'text/css',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Error reading Form.io CSS:', error)
    return new NextResponse('Form.io CSS not found', { status: 404 })
  }
}
