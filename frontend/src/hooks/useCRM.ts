import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { crmService } from '@/services/crm.service';
import type {
  CustomerStatus,
  CreateInteractionRequest,
  UpdateCustomerRequest,
} from '@/services/crm.types';
import { useToast } from '@/hooks/use-toast';

export function useCustomers(params?: {
  status?: CustomerStatus;
  search?: string;
  sortBy?: 'last_order_asc' | 'last_interaction_desc';
}) {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: () => crmService.getCustomers(params),
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: () => crmService.getCustomer(id),
    enabled: !!id,
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomerRequest }) =>
      crmService.updateCustomer(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['customer', id] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({ title: '客戶資料已更新' });
    },
    onError: () => {
      toast({ title: '更新失敗', variant: 'destructive' });
    },
  });
}

export function useInteractions(customerId: string) {
  return useQuery({
    queryKey: ['interactions', customerId],
    queryFn: () => crmService.getInteractions(customerId),
    enabled: !!customerId,
  });
}

export function useCreateInteraction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ customerId, data }: { customerId: string; data: CreateInteractionRequest }) =>
      crmService.createInteraction(customerId, data),
    onSuccess: (_, { customerId }) => {
      queryClient.invalidateQueries({ queryKey: ['interactions', customerId] });
      queryClient.invalidateQueries({ queryKey: ['customer', customerId] });
      toast({ title: '互動記錄已新增' });
    },
    onError: () => {
      toast({ title: '新增失敗', variant: 'destructive' });
    },
  });
}

export function useOrderSummary(customerId: string) {
  return useQuery({
    queryKey: ['orderSummary', customerId],
    queryFn: () => crmService.getOrderSummary(customerId),
    enabled: !!customerId,
  });
}

export function useReminders() {
  return useQuery({
    queryKey: ['reminders'],
    queryFn: () => crmService.getReminders(),
    refetchInterval: 60000, // Refetch every minute
  });
}

export function useMarkReminderAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => crmService.markReminderAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });
}

export function useUnreadReminderCount() {
  return useQuery({
    queryKey: ['unreadReminderCount'],
    queryFn: () => crmService.getUnreadReminderCount(),
    refetchInterval: 30000,
  });
}

export function useRecalculateGrades() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => crmService.recalculateGrades(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer'] });
      toast({
        title: '已完成等級重新計算',
        description: data.message,
      });
    },
    onError: () => {
      toast({
        title: '計算失敗',
        description: '無法重新計算客戶等級，請稍後再試',
        variant: 'destructive',
      });
    },
  });
}
