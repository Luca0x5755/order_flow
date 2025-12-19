import apiClient from '@/lib/api.config';
import type {
    Order,
    CreateOrderRequest,
    UpdateOrderStatusRequest
} from './api.types';

export const ordersService = {
    /**
     * 获取当前用户的订单
     */
    async getMyOrders(): Promise<Order[]> {
        const response = await apiClient.get('/orders/my-orders');
        return response.data;
    },

    /**
     * 获取所有订单 (仅员工和管理员)
     */
    async getAllOrders(params?: {
        status?: string;
        user_id?: string;
        skip?: number;
        limit?: number;
    }): Promise<Order[]> {
        const response = await apiClient.get('/orders/', { params });
        return response.data;
    },

    /**
     * 创建新订单
     */
    async createOrder(data: CreateOrderRequest): Promise<Order> {
        const response = await apiClient.post('/orders/', data);
        return response.data;
    },

    /**
     * 取消订单
     */
    async cancelOrder(orderId: string): Promise<Order> {
        const response = await apiClient.post(`/orders/${orderId}/cancel`);
        return response.data;
    },

    /**
     * 更新订单状态 (仅管理员)
     */
    async updateOrderStatus(orderId: string, data: UpdateOrderStatusRequest): Promise<Order> {
        const response = await apiClient.put(`/orders/${orderId}/status`, data);
        return response.data;
    },
};
