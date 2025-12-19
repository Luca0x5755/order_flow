import { useState } from "react";
import { Package, Clock, DollarSign, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { OrderDetailModal } from "@/components/OrderDetailModal";
import { Button } from "@/components/ui/button";
import { useDashboardStats } from "@/hooks/useDashboard";
import { useMyOrders } from "@/hooks/useOrders";
import type { Order } from "@/services/api.types";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: allOrders = [], isLoading: ordersLoading } = useMyOrders();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  //  Get recent 5 orders
  const recentOrders = [...allOrders]
    .sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime())
    .slice(0, 5);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  if (statsLoading || ordersLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  const pendingOrders = allOrders.filter(o => o.status === 'pending').length;

  return (
    <div className="container py-8 space-y-8">
      {/* Page Header */}
      <div className="space-y-2 opacity-0 animate-fade-in">
        <h1 className="text-3xl font-bold tracking-tight">儀表板</h1>
        <p className="text-muted-foreground">
          歡迎回來！這裡是您的訂單概覽。
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="本月訂單數"
          value={stats?.this_month_orders || 0}
          icon={Package}
          variant="default"
          animationDelay="100ms"
        />
        <StatCard
          title="待處理訂單"
          value={pendingOrders}
          icon={Clock}
          variant="warning"
          animationDelay="200ms"
        />
        <StatCard
          title="本月總金額"
          value={formatCurrency(stats?.this_month_amount || 0)}
          icon={DollarSign}
          variant="success"
          animationDelay="300ms"
        />
      </div>

      {/* Recent Orders */}
      <div className="space-y-4 opacity-0 animate-fade-in" style={{ animationDelay: '400ms' }}>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">最近訂單</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/orders" className="gap-1">
              查看全部
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">訂單編號</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">日期</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">金額</th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">狀態</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentOrders.map((order, index) => (
                  <tr
                    key={order.id}
                    onClick={() => handleOrderClick(order)}
                    className="cursor-pointer transition-colors hover:bg-muted/50"
                    style={{
                      animationDelay: `${500 + index * 50}ms`,
                    }}
                  >
                    <td className="px-4 py-4">
                      <span className="font-medium text-primary">{order.order_number}</span>
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      {format(new Date(order.order_date), 'yyyy-MM-dd')}
                    </td>
                    <td className="px-4 py-4 text-right font-medium">
                      {formatCurrency(order.total_amount)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  );
}
