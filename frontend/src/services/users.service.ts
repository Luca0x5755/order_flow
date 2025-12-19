import apiClient from '@/lib/api.config';
import type {
    User,
    UpdateUserProfileRequest
} from './api.types';

export const usersService = {
    /**
     * 獲取當前用戶資料
     */
    async getUserProfile(): Promise<User> {
        const response = await apiClient.get('/users/me');
        return response.data;
    },

    /**
     * 更新當前用戶資料
     */
    async updateUserProfile(data: UpdateUserProfileRequest): Promise<User> {
        const response = await apiClient.put('/users/me', data);
        return response.data;
    },
};
