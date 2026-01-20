import { readFile } from 'fs/promises'
import { join } from 'path'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Read Bootstrap CSS from node_modules
    const bootstrapPath = join(process.cwd(), 'node_modules', 'bootstrap', 'dist', 'css', 'bootstrap.min.css')
    const cssContent = await readFile(bootstrapPath, 'utf-8')
    
    return new NextResponse(cssContent, {
      headers: {
        'Content-Type': 'text/css',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Error reading Bootstrap CSS:', error)
    return new NextResponse('Bootstrap CSS not found', { status: 404 })
  }
}
