import axios from 'axios';

// API 基础 URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// 创建 Axios 实例
export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // 允许发送 cookies
});

// 请求拦截器 - 添加认证 token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 响应拦截器 - 统一错误处理
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // 处理认证错误
        if (error.response?.status === 401) {
            // Token 过期或无效，清除本地存储
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');

            // 如果不是在登录或注册页面，重定向到登录页
            if (!window.location.pathname.includes('/login') &&
                !window.location.pathname.includes('/register')) {
                window.location.href = '/login';
            }
        }

        // 提取错误消息
        const message = error.response?.data?.detail ||
            error.response?.data?.message ||
            error.message ||
            '未知错误';

        // 返回统一的错误格式
        return Promise.reject({
            status: error.response?.status,
            message,
            data: error.response?.data,
        });
    }
);

export default apiClient;
