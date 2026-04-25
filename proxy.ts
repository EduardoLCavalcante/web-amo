import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Proxy de proteção de rotas (anteriormente middleware)
 * 
 * Este proxy está preparado para implementar autenticação futura.
 * Atualmente apenas passa todas as requisições, mas a estrutura está
 * pronta para verificar tokens/sessões quando o backend for integrado.
 * 
 * @example Implementação futura com autenticação:
 * ```typescript
 * const token = request.cookies.get('auth-token')?.value
 * 
 * if (!token && isProtectedRoute(request.nextUrl.pathname)) {
 *   return NextResponse.redirect(new URL('/', request.url))
 * }
 * ```
 */
export function proxy(request: NextRequest) {
  // Rotas públicas que não requerem autenticação
  const publicRoutes = ['/', '/cadastro', '/cadastro-professor']
  
  // Rotas protegidas que requerem autenticação (futuro)
  const protectedRoutes = ['/dashboard', '/perfil', '/configuracoes']
  
  const { pathname } = request.nextUrl

  // Verifica se é uma rota protegida
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  // TODO: Implementar verificação de autenticação quando o backend estiver pronto
  // const token = request.cookies.get('auth-token')?.value
  // 
  // if (isProtectedRoute && !token) {
  //   const loginUrl = new URL('/', request.url)
  //   loginUrl.searchParams.set('redirect', pathname)
  //   return NextResponse.redirect(loginUrl)
  // }
  //
  // // Redirecionar usuário autenticado para dashboard se tentar acessar login
  // if (token && pathname === '/') {
  //   return NextResponse.redirect(new URL('/dashboard', request.url))
  // }

  return NextResponse.next()
}

/**
 * Configuração do matcher para definir quais rotas o proxy processa
 * 
 * Exclui:
 * - Arquivos estáticos (_next/static)
 * - Assets de imagem (_next/image)
 * - Favicon e outros arquivos públicos
 * - API routes (podem ter sua própria autenticação)
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (svg, png, jpg, etc)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
