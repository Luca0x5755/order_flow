// ==================== 认证相关类型 ====================
export type UserRole = 'customer' | 'manager' | 'admin' | 'super_admin';

export interface User {
    id: string;
    username: string;
    email: string;
    role: UserRole;
    company_name?: string;
    is_active: boolean;
    created_at?: string;
    last_login?: string;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    company_name: string;
}

export interface UpdateUserProfileRequest {
    email?: string;
    company_name?: string;
}

// ==================== 订单相关类型 ====================
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';

export interface OrderItem {
    id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    product: Product; // Nested product information from backend
}

export interface Order {
    id: string;
    order_number: string;
    user_id: string;
    customer_name?: string;
    status: OrderStatus;
    total_amount: number;
    delivery_address: string;
    phone?: string;
    notes?: string;
    order_date: string;
    items: OrderItem[];
}

export interface CreateOrderRequest {
    items: {
        product_id: string;
        quantity: number;
    }[];
    delivery_address: string;
    notes?: string;
}

export interface UpdateOrderStatusRequest {
    status: OrderStatus;
}

// ==================== 产品相关类型 ====================
export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    category?: string;
    image_url?: string;
    is_active: boolean;
    created_at?: string;
}

export interface CreateProductRequest {
    name: string;
    description: string;
    price: number;
    stock: number;
    category?: string;
    image_url?: string;
    is_active?: boolean;
}

export interface UpdateProductRequest {
    name?: string;
    description?: string;
    price?: number;
    stock?: number;
    category?: string;
    image_url?: string;
    is_active?: boolean;
}

// ==================== 仪表板统计类型 ====================
export interface DashboardStats {
    total_orders: number;
    total_amount: number;
    this_month_orders: number;
    this_month_amount: number;
    total_users?: number;
    total_products?: number;
}

// ==================== API 响应类型 ====================
export interface ApiError {
    status?: number;
    message: string;
    data?: any;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    skip: number;
    limit: number;
}
