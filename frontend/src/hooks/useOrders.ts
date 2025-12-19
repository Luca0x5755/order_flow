import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersService } from '@/services/orders.service';
import type { Order, CreateOrderRequest, UpdateOrderStatusRequest } from '@/services/api.types';
import { toast } from 'sonner';

/**
 * 获取当前用户订单 Hook
 */
export const useMyOrders = () => {
    return useQuery<Order[]>({
        queryKey: ['myOrders'],
        queryFn: () => ordersService.getMyOrders(),
        staleTime: 30 * 1000, // 30 秒
    });
};

/**
 * 获取所有订单 Hook (管理员)
 */
export const useAllOrders = (params?: {
    status?: string;
    user_id?: string;
    skip?: number;
    limit?: number;
}) => {
    return useQuery<Order[]>({
        queryKey: ['allOrders', params],
        queryFn: () => ordersService.getAllOrders(params),
        staleTime: 30 * 1000,
    });
};

/**
 * 创建订单 Hook
 */
export const useCreateOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateOrderRequest) => ordersService.createOrder(data),
        onSuccess: () => {
            toast.success('訂單創建成功');
            queryClient.invalidateQueries({ queryKey: ['myOrders'] });
            queryClient.invalidateQueries({ queryKey: ['allOrders'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
        },
        onError: (error: any) => {
            toast.error(error.message || '創建訂單失敗');
        },
    });
};

/**
 * 取消订单 Hook
 */
export const useCancelOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (orderId: string) => ordersService.cancelOrder(orderId),
        onSuccess: () => {
            toast.success('訂單已取消');
            queryClient.invalidateQueries({ queryKey: ['myOrders'] });
            queryClient.invalidateQueries({ queryKey: ['allOrders'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
        },
        onError: (error: any) => {
            toast.error(error.message || '取消訂單失敗');
        },
    });
};

/**
 * 更新订单状态 Hook (管理员)
 */
export const useUpdateOrderStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ orderId, data }: { orderId: string; data: UpdateOrderStatusRequest }) =>
            ordersService.updateOrderStatus(orderId, data),
        onSuccess: () => {
            toast.success('訂單狀態更新成功');
            queryClient.invalidateQueries({ queryKey: ['myOrders'] });
            queryClient.invalidateQueries({ queryKey: ['allOrders'] });
            queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
        },
        onError: (error: any) => {
            toast.error(error.message || '更新訂單狀態失敗');
        },
    });
};
