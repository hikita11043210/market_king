import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// 認証が必要なパス
const protectedPaths = ['/settings', '/product-register', '/dashboard']
// 認証済みユーザーをリダイレクトするパス（ログインページなど）
const authPaths = ['/login']

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl
    const auth = request.cookies.get('auth')
    
    // 静的ファイルやAPI呼び出しはスキップ
    if (
        pathname.includes('/_next') ||
        pathname.includes('/api/') ||
        pathname.includes('/static/') ||
        pathname.includes('.') ||
        pathname.includes('google') ||
        pathname.includes('auth')
    ) {
        return NextResponse.next();
    }

    // 保護されたパスへのアクセスで未認証の場合
    if (protectedPaths.some(path => pathname.startsWith(path)) && !auth) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 認証済みユーザーがログインページにアクセスした場合
    if (pathname === '/login' && auth) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

// マッチャーを更新
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}; 