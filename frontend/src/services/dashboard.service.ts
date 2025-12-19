import apiClient from '@/lib/api.config';
import type { DashboardStats } from './api.types';

export const dashboardService = {
    /**
     * 获取仪表板统计数据
     */
    async getStats(): Promise<DashboardStats> {
        const response = await apiClient.get('/dashboard/stats');
        return response.data;
    },
};
