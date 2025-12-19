import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsService } from '@/services/products.service';
import type { Product, CreateProductRequest, UpdateProductRequest } from '@/services/api.types';
import { toast } from 'sonner';

/**
 * 获取产品列表 Hook
 */
export const useProducts = (params?: {
    skip?: number;
    limit?: number;
    category?: string;
    include_inactive?: boolean;
}) => {
    return useQuery<Product[]>({
        queryKey: ['products', params],
        queryFn: () => productsService.getProducts(params),
        staleTime: 2 * 60 * 1000, // 2 分钟
    });
};

/**
 * 获取单个产品 Hook
 */
export const useProduct = (id: string) => {
    return useQuery<Product>({
        queryKey: ['products', id],
        queryFn: () => productsService.getProduct(id),
        enabled: !!id,
        staleTime: 2 * 60 * 1000,
    });
};

/**
 * 创建产品 Hook
 */
export const useCreateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateProductRequest) => productsService.createProduct(data),
        onSuccess: () => {
            toast.success('產品創建成功');
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
        onError: (error: any) => {
            toast.error(error.message || '創建產品失敗');
        },
    });
};

/**
 * 更新产品 Hook
 */
export const useUpdateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateProductRequest }) =>
            productsService.updateProduct(id, data),
        onSuccess: (_, variables) => {
            toast.success('產品更新成功');
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['products', variables.id] });
        },
        onError: (error: any) => {
            toast.error(error.message || '更新產品失敗');
        },
    });
};

/**
 * 删除产品 Hook
 */
export const useDeleteProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => productsService.deleteProduct(id),
        onSuccess: () => {
            toast.success('產品刪除成功');
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
        onError: (error: any) => {
            toast.error(error.message || '刪除產品失敗');
        },
    });
};
