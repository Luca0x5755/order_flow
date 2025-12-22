// ==================== CRM 客戶相關類型 ====================

export type CustomerStatus = 'potential' | 'new' | 'active' | 'loyal' | 'churned';
export type CustomerGrade = 'A' | 'B' | 'C';
export type InteractionType = 'phone' | 'email' | 'meeting' | 'visit' | 'other';

export interface Customer {
  id: string;
  company_name: string;
  contact_person: string;
  phone: string;
  email: string;
  address?: string;
  industry: string;
  source: string;
  status?: CustomerStatus;
  grade: CustomerGrade;
  notes?: string;
  created_at: string;
  updated_at?: string;
  last_order_date?: string;
  last_interaction_date?: string;
  total_orders: number;
  total_amount: number;
}

export interface CustomerInteraction {
  id: string;
  customer_id: string;
  interaction_type: InteractionType;
  content: string;
  next_action?: string;
  action_completed?: boolean;
  recorded_by?: string;
  created_at: string;
}

export interface CustomerReminder {
  id: string;
  customer_id: string;
  customer_name: string;
  message: string;
  type: 'follow_up' | 'no_order' | 'birthday' | 'renewal';
  priority: 'high' | 'medium' | 'low';
  due_date: string;
  is_read: boolean;
}

export interface CustomerOrderSummary {
  month: string;
  amount: number;
  count: number;
}

export interface CreateInteractionRequest {
  interaction_type: InteractionType;
  content: string;
  next_action?: string;
}

export interface UpdateCustomerRequest {
  company_name?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  industry?: string;
  source?: string;
}
