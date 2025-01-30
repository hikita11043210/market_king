import axios from 'axios';
import Cookies from 'js-cookie';
import { API_ENDPOINT, API_TIMEOUT, API_HEADERS } from '../constants/api';

export const apiClient = axios.create({
    baseURL: API_ENDPOINT,
    timeout: API_TIMEOUT,
    headers: API_HEADERS,
});

// リクエストインターセプター
apiClient.interceptors.request.use(
    (config) => {
        try {
            const token = Cookies.get('auth');
            if (token) {
                config.headers.Authorization = `Token ${token}`;
            }
        } catch (error) {
            console.error('Error setting auth header:', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// レスポンスインターセプター
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // サーバーからのエラーレスポンス
            console.error('API Error:', error.response.data);
            // 認証エラーの場合
            // if (error.response.status === 401) {
            //     // ログインページにリダイレクト
            //     window.location.href = '/login';
            // }
        } else if (error.request) {
            // リクエストは送信されたがレスポンスがない
            console.error('Network Error:', error.request);
        } else {
            // リクエストの作成中にエラーが発生
            console.error('Error:', error.message);
        }
        return Promise.reject(error);
    }
); 