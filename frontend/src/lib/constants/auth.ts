export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export const AUTH_COOKIE_NAME = 'auth_token';
export const AUTH_COOKIE_OPTIONS = {
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
}; 