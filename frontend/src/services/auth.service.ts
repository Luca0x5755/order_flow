import apiClient from '@/lib/api.config';
import type {
  User,
  UserRole,
  AuthResponse,
  LoginRequest,
  RegisterRequest
} from './api.types';

export type { User, UserRole } from './api.types';

export const authService = {
  /**
   * 用户登录
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/login', credentials);

    // 保存 token 到 localStorage
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
    }

    return response.data;
  },

  /**
   * 用户注册
   */
  async register(data: RegisterRequest): Promise<User> {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  /**
   * 用户登出
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      // 无论API调用是否成功，都清除本地存储
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    }
  },

  /**
   * 获取当前用户信息
   * 注意：后端需要实现 /auth/me 端点
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  /**
   * 检查用户是否已登录
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  },

  /**
   * 获取存储的 token
   */
  getToken(): string | null {
    return localStorage.getItem('access_token');
  },

  /**
   * 获取所有用户 (仅 super_admin)
   */
  async getAllUsers(): Promise<User[]> {
    const response = await apiClient.get('/users');
    return response.data;
  },

  /**
   * 更新用户角色 (仅 super_admin)
   */
  async updateUserRole(userId: string, role: UserRole): Promise<{ success: boolean }> {
    await apiClient.put(`/users/${userId}/role`, { role });
    return { success: true };
  },

  /**
   * 切换用户激活状态 (仅 super_admin)
   */
  async toggleUserActive(userId: string, isActive: boolean): Promise<{ success: boolean }> {
    await apiClient.put(`/users/${userId}/status`, { is_active: isActive });
    return { success: true };
  },
};
