import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard.service';
import type { DashboardStats } from '@/services/api.types';

/**
 * 获取仪表板统计数据 Hook
 */
export const useDashboardStats = () => {
    return useQuery<DashboardStats>({
        queryKey: ['dashboardStats'],
        queryFn: () => dashboardService.getStats(),
        staleTime: 60 * 1000, // 1 分钟
        refetchInterval: 5 * 60 * 1000, // 每 5 分钟自动刷新
    });
};
