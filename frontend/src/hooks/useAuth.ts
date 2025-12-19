import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import type { LoginRequest, RegisterRequest, User } from '@/services/api.types';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

/**
 * 登录 Hook
 */
export const useLogin = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (credentials: LoginRequest) => authService.login(credentials),
        onSuccess: (data) => {
            toast.success('登入成功');
            // 使当前用户查询失效，强制重新获取
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });
            navigate('/');
        },
        onError: (error: any) => {
            toast.error(error.message || '登入失敗');
        },
    });
};

/**
 * 注册 Hook
 */
export const useRegister = () => {
    const navigate = useNavigate();

    return useMutation({
        mutationFn: (data: RegisterRequest) => authService.register(data),
        onSuccess: () => {
            toast.success('註冊成功，請登入');
            navigate('/login');
        },
        onError: (error: any) => {
            toast.error(error.message || '註冊失敗');
        },
    });
};

/**
 * 登出 Hook
 */
export const useLogout = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => authService.logout(),
        onSuccess: () => {
            toast.success('已登出');
            // 清除所有查询缓存
            queryClient.clear();
            navigate('/login');
        },
        onError: (error: any) => {
            toast.error(error.message || '登出失敗');
        },
    });
};

/**
 * 获取当前用户 Hook
 * 注意：需要后端实现 /auth/me 端点
 */
export const useCurrentUser = () => {
    return useQuery<User>({
        queryKey: ['currentUser'],
        queryFn: () => authService.getCurrentUser(),
        enabled: authService.isAuthenticated(),
        retry: false,
        staleTime: 5 * 60 * 1000, // 5 分钟
    });
};

/**
 * 检查是否已认证
 */
export const useIsAuthenticated = () => {
    return authService.isAuthenticated();
};
