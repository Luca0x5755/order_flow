import { useState } from "react";
import { useAllOrders, useUpdateOrderStatus } from "@/hooks/useOrders";
import type { Order, OrderStatus } from "@/services/api.types";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Settings, Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function OrderAdmin() {
  const { isAdmin } = useAuth();
  const { data: orders = [], isLoading } = useAllOrders();
  const updateOrderStatus = useUpdateOrderStatus();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>("pending");

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user?.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleManageClick = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
  };

  const handleStatusUpdate = () => {
    if (!selectedOrder) return;

    updateOrderStatus.mutate(
      { orderId: selectedOrder.id, data: { status: newStatus } },
      {
        onSuccess: () => {
          setSelectedOrder(null);
        },
      }
    );
  };

  const getStatusLabel = (status: OrderStatus) => {
    const labels: Record<OrderStatus, string> = {
      pending: '待處理',
      processing: '處理中',
      shipped: '已出貨',
      completed: '已完成',
      cancelled: '已取消',
    };
    return labels[status];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">訂單管理</h1>
        <p className="text-muted-foreground">
          管理所有用戶的訂單
          {!isAdmin && <span className="text-warning ml-2">(僅可查看)</span>}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜尋訂單編號或客戶名稱..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="狀態篩選" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部狀態</SelectItem>
            <SelectItem value="pending">待處理</SelectItem>
            <SelectItem value="processing">處理中</SelectItem>
            <SelectItem value="shipped">已出貨</SelectItem>
            <SelectItem value="completed">已完成</SelectItem>
            <SelectItem value="cancelled">已取消</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>訂單編號</TableHead>
              <TableHead>客戶</TableHead>
              <TableHead>日期</TableHead>
              <TableHead className="text-right">金額</TableHead>
              <TableHead>狀態</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.order_number}</TableCell>
                <TableCell>{order.user?.company_name || order.customer_name || 'N/A'}</TableCell>
                <TableCell>{format(new Date(order.order_date), 'yyyy-MM-dd')}</TableCell>
                <TableCell className="text-right">
                  NT$ {order.total_amount.toLocaleString()}
                </TableCell>
                <TableCell>
                  <StatusBadge status={order.status} />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleManageClick(order)}
                    disabled={!isAdmin}
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    管理
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Status Update Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>修改訂單狀態</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">訂單編號：</span>
                  <span className="font-medium ml-1">{selectedOrder.order_number}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">客戶：</span>
                  <span className="font-medium ml-1">{selectedOrder.user?.company_name || selectedOrder.customer_name || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">金額：</span>
                  <span className="font-medium ml-1">NT$ {selectedOrder.total_amount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">目前狀態：</span>
                  <StatusBadge status={selectedOrder.status} className="ml-1" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">新狀態</label>
                <Select value={newStatus} onValueChange={(v) => setNewStatus(v as OrderStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">待處理</SelectItem>
                    <SelectItem value="processing">處理中</SelectItem>
                    <SelectItem value="shipped">已出貨</SelectItem>
                    <SelectItem value="completed">已完成</SelectItem>
                    <SelectItem value="cancelled">已取消</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedOrder(null)}>
              取消
            </Button>
            <Button onClick={handleStatusUpdate} disabled={updateOrderStatus.isPending}>
              {updateOrderStatus.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  更新中...
                </>
              ) : (
                '確認更新'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
