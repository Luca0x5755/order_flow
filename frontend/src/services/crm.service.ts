import apiClient from '@/lib/api.config';
import type {
  Customer,
  CustomerInteraction,
  CustomerReminder,
  CustomerOrderSummary,
  CreateInteractionRequest,
  UpdateCustomerRequest,
  CustomerStatus,
} from './crm.types';

export const crmService = {
  /**
   * 獲取客戶列表
   */
  async getCustomers(params?: {
    status?: CustomerStatus;
    search?: string;
    sortBy?: 'last_order_asc' | 'last_interaction_desc';
  }): Promise<Customer[]> {
    const queryParams = new URLSearchParams();

    // Map frontend sort options to backend parameters
    if (params?.sortBy === 'last_order_asc') {
      queryParams.append('sort_by', 'last_order_date');
    }

    // Note: Backend uses 'grade' and 'industry' filters, not 'status' and 'search'
    // We'll apply client-side filtering for now to maintain compatibility
    const response = await apiClient.get<Customer[]>('/crm/customers', {
      params: queryParams,
    });

    let result = response.data;

    // Client-side filtering
    if (params?.status) {
      result = result.filter(c => c.status === params.status);
    }

    if (params?.search) {
      const query = params.search.toLowerCase();
      result = result.filter(c =>
        c.company_name.toLowerCase().includes(query) ||
        (c.contact_person && c.contact_person.toLowerCase().includes(query))
      );
    }

    // Client-side sorting for last_interaction_desc
    if (params?.sortBy === 'last_interaction_desc') {
      result.sort((a, b) => {
        if (!a.last_interaction_date) return 1;
        if (!b.last_interaction_date) return -1;
        return new Date(b.last_interaction_date).getTime() - new Date(a.last_interaction_date).getTime();
      });
    }

    return result;
  },

  /**
   * 獲取單個客戶詳情
   */
  async getCustomer(id: string): Promise<Customer | null> {
    try {
      const response = await apiClient.get<Customer>(`/crm/customers/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * 更新客戶資料
   */
  async updateCustomer(id: string, data: UpdateCustomerRequest): Promise<Customer> {
    const response = await apiClient.put<Customer>(`/crm/customers/${id}`, data);
    return response.data;
  },

  /**
   * 獲取客戶互動記錄
   */
  async getInteractions(customerId: string): Promise<CustomerInteraction[]> {
    const response = await apiClient.get<CustomerInteraction[]>(
      `/crm/customers/${customerId}/interactions`
    );
    return response.data;
  },

  /**
   * 新增互動記錄
   */
  async createInteraction(
    customerId: string,
    data: CreateInteractionRequest
  ): Promise<CustomerInteraction> {
    const response = await apiClient.post<CustomerInteraction>(
      `/crm/customers/${customerId}/interactions`,
      data
    );
    return response.data;
  },

  /**
   * 獲取客戶訂單統計 (最近6個月)
   * Note: This is a placeholder as the backend doesn't have this endpoint yet
   */
  async getOrderSummary(customerId: string): Promise<CustomerOrderSummary[]> {
    // TODO: Implement when backend provides this endpoint
    // For now, generate mock data client-side
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        amount: Math.floor(Math.random() * 200000) + 50000,
        count: Math.floor(Math.random() * 5) + 1,
      });
    }
    return months;
  },

  /**
   * 獲取待辦提醒
   */
  async getReminders(): Promise<CustomerReminder[]> {
    const response = await apiClient.get<any[]>('/crm/reminders');

    // Map backend reminder format to frontend format
    return response.data.map((reminder, index) => ({
      id: `rem-${index}`,
      customer_id: reminder.customer_id,
      customer_name: reminder.company_name,
      message: reminder.reason,
      type: reminder.reminder_type === 'no_order' ? 'no_order' : 'follow_up',
      priority: 'medium' as const,
      due_date: new Date().toISOString().split('T')[0],
      is_read: false,
    }));
  },

  /**
   * 標記提醒為已讀
   * Note: Backend doesn't support this yet, implementing client-side
   */
  async markReminderAsRead(id: string): Promise<void> {
    // TODO: Implement when backend provides this endpoint
    return Promise.resolve();
  },

  /**
   * 獲取未讀提醒數量
   */
  async getUnreadReminderCount(): Promise<number> {
    const reminders = await this.getReminders();
    return reminders.filter(r => !r.is_read).length;
  },

  /**
   * 觸發客戶等級重新計算 (Admin Only)
   */
  async recalculateGrades(): Promise<{ updated_count: number; message: string }> {
    const response = await apiClient.post<{ updated_count: number; message: string }>(
      '/crm/recalculate-grades'
    );
    return response.data;
  },
};
