import apiClient from '@/lib/api.config';
import type {
    Product,
    CreateProductRequest,
    UpdateProductRequest
} from './api.types';

export const productsService = {
    /**
     * 获取产品列表
     */
    async getProducts(params?: {
        skip?: number;
        limit?: number;
        category?: string;
        include_inactive?: boolean;
    }): Promise<Product[]> {
        const response = await apiClient.get('/products/', { params });
        return response.data;
    },

    /**
     * 获取单个产品
     */
    async getProduct(id: string): Promise<Product> {
        const response = await apiClient.get(`/products/${id}`);
        return response.data;
    },

    /**
     * 创建产品 (仅管理员)
     */
    async createProduct(data: CreateProductRequest): Promise<Product> {
        const response = await apiClient.post('/products/', data);
        return response.data;
    },

    /**
     * 更新产品 (仅管理员)
     */
    async updateProduct(id: string, data: UpdateProductRequest): Promise<Product> {
        const response = await apiClient.put(`/products/${id}`, data);
        return response.data;
    },

    /**
     * 删除产品 (软删除，仅管理员)
     */
    async deleteProduct(id: string): Promise<void> {
        await apiClient.delete(`/products/${id}`);
    },
};
