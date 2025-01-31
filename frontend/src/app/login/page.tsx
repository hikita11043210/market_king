'use client';

import { GoogleOAuthProvider } from '@react-oauth/google';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode'
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { apiClient } from '@/lib/api/client';

const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function LoginPage() {
    const router = useRouter();

    const handleGoogleLogin = async (response: any) => {
        try {
            const decoded: any = jwtDecode(response.credential);

            const body = {
                "email": decoded.email,
                "name": decoded.name,
                "family_name": decoded.family_name,
                "given_name": decoded.given_name,
                "picture": decoded.picture
            };

            const res = await apiClient.post('/users/', body);

            // トークンとユーザー情報を保存
            Cookies.set('auth', res.data.token, {
                expires: 7,
                path: '/',
                sameSite: 'Lax'
            });

            // ユーザー情報を保存
            Cookies.set('user', JSON.stringify({
                picture: decoded.picture,
                username: decoded.name,
                email: decoded.email
            }), {
                expires: 7,
                path: '/',
                sameSite: 'Lax'
            });

            const savedToken = Cookies.get('auth');

            if (savedToken) {
                // トークンが正しく保存されたことを確認してからリダイレクト
                router.push('/dashboard');
            } else {
                console.error('Failed to save token');
            }
        } catch (err: any) {
            console.error('=== Login Error ===');
            console.error('Error details:', {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status
            });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-bold text-gray-900">
                        アカウントにログイン
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        サービスを利用するにはログインが必要です
                    </p>
                </div>
                <div className="mt-8 space-y-6">
                    <GoogleOAuthProvider clientId={googleClientId || ""}>
                        <GoogleLogin
                            onSuccess={(response) => handleGoogleLogin(response)}
                            onError={() => {
                                console.log('Login Failed');
                            }}
                        />
                    </GoogleOAuthProvider>
                </div>
            </div>
        </div>
    );
}
