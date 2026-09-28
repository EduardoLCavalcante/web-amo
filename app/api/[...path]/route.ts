import { NextRequest, NextResponse } from 'next/server'
import { ApiError, handleApi, persistState } from '@/lib/amo/backend'

export const dynamic = 'force-dynamic'

async function dispatch(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path } = await params
    let body: unknown = {}
    if (request.method !== 'GET' && request.method !== 'DELETE') {
      try { body = await request.json() } catch { return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 }) }
    }
    const result = handleApi(request.method, path.join('/'), body, {
      session: request.cookies.get('amo-session')?.value,
      register: request.cookies.get('amo-register')?.value,
      recover: request.cookies.get('amo-recover')?.value,
    })
    if (request.method !== 'GET') persistState()
    const response = NextResponse.json({ data: result.data }, { status: result.status ?? 200 })
    response.headers.set('Cache-Control', 'no-store')
    if (result.cookie) response.cookies.set(result.cookie.name, result.cookie.value, {
      httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production',
      path: '/', maxAge: result.cookie.maxAge,
    })
    return response
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Erro interno.' }, { status: error instanceof ApiError ? error.status : 500 })
  }
}

export const GET = dispatch
export const POST = dispatch
export const PATCH = dispatch
export const PUT = dispatch
export const DELETE = dispatch
