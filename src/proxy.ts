import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createSupabaseMiddlewareClient } from '@/lib/supabase/middleware'

const AUTH_REQUIRED = process.env.AUTH_REQUIRED === 'true'
const AUTH_MODE = process.env.AUTH_MODE || process.env.NEXT_PUBLIC_AUTH_MODE || 'mock'

function isSupabaseMode() {
  return AUTH_MODE === 'supabase'
}

function isPublicPath(pathname: string) {
  return (
    pathname.startsWith('/api') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/auth/callback')
  )
}

function applyCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie)
  })
}

export default async function proxy(request: NextRequest) {
  const response = NextResponse.next()

  if (!isSupabaseMode()) {
    return response
  }

  const supabase = createSupabaseMiddlewareClient(request, response)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!AUTH_REQUIRED || isPublicPath(request.nextUrl.pathname)) {
    return response
  }

  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    const redirect = NextResponse.redirect(url)
    applyCookies(response, redirect)
    return redirect
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
