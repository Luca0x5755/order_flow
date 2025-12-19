import { useState, useMemo } from "react";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { CalendarIcon, Search, Filter, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { StatusBadge } from "@/components/StatusBadge";
import { OrderDetailModal } from "@/components/OrderDetailModal";
import { useMyOrders } from "@/hooks/useOrders";
import type { Order, OrderStatus } from "@/services/api.types";
import { cn } from "@/lib/utils";

export default function OrderList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch orders using React Query
  const { data: orders = [], isLoading } = useMyOrders();

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Search filter
      if (searchQuery && !order.order_number.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Status filter
      if (statusFilter !== "all" && order.status !== statusFilter) {
        return false;
      }

      // Date range filter
      const orderDate = new Date(order.order_date);
      if (dateRange.from && orderDate < dateRange.from) {
        return false;
      }
      if (dateRange.to) {
        const endOfDay = new Date(dateRange.to);
        endOfDay.setHours(23, 59, 59, 999);
        if (orderDate > endOfDay) {
          return false;
        }
      }

      return true;
    });
  }, [orders, searchQuery, statusFilter, dateRange]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("zh-TW", {
      style: "currency",
      currency: "TWD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setDateRange({ from: undefined, to: undefined });
  };

  const hasActiveFilters = searchQuery || statusFilter !== "all" || dateRange.from || dateRange.to;

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 space-y-6">
      {/* Page Header */}
      <div className="space-y-2 opacity-0 animate-fade-in">
        <h1 className="text-3xl font-bold tracking-tight">訂單列表</h1>
        <p className="text-muted-foreground">
          查看和管理您的所有訂單
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 opacity-0 animate-fade-in" style={{ animationDelay: "100ms" }}>
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜尋訂單編號..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="狀態" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部狀態</SelectItem>
              <SelectItem value="pending">待處理</SelectItem>
              <SelectItem value="processing">處理中</SelectItem>
              <SelectItem value="completed">已完成</SelectItem>
              <SelectItem value="cancelled">已取消</SelectItem>
            </SelectContent>
          </Select>

          {/* Date Range */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full sm:w-auto justify-start text-left font-normal",
                  !dateRange.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "MM/dd", { locale: zhTW })} -{" "}
                      {format(dateRange.to, "MM/dd", { locale: zhTW })}
                    </>
                  ) : (
                    format(dateRange.from, "yyyy/MM/dd", { locale: zhTW })
                  )
                ) : (
                  "選擇日期範圍"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={dateRange}
                onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                numberOfMonths={1}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button variant="ghost" size="icon" onClick={clearFilters} className="shrink-0">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground">
          共 {filteredOrders.length} 筆訂單
        </p>
      </div>

      {/* Orders Table */}
      <div
        className="rounded-xl border bg-card shadow-sm overflow-hidden opacity-0 animate-fade-in"
        style={{ animationDelay: "200ms" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">訂單編號</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">日期</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground hidden sm:table-cell">商品</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground hidden md:table-cell">數量</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">金額</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">狀態</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    沒有找到符合條件的訂單
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
                  const productNames = order.items.map((item) => item.product?.name || '未知商品').join(", ");

                  return (
                    <tr
                      key={order.id}
                      onClick={() => handleOrderClick(order)}
                      className="cursor-pointer transition-colors hover:bg-muted/50"
                    >
                      <td className="px-4 py-4">
                        <span className="font-medium text-primary">{order.order_number}</span>
                      </td>
                      <td className="px-4 py-4 text-sm text-muted-foreground">
                        {format(new Date(order.order_date), 'yyyy-MM-dd')}
                      </td>
                      <td className="px-4 py-4 text-sm hidden sm:table-cell">
                        <span className="line-clamp-1 max-w-xs">{productNames}</span>
                      </td>
                      <td className="px-4 py-4 text-sm text-center hidden md:table-cell">
                        {totalQuantity}
                      </td>
                      <td className="px-4 py-4 text-right font-medium">
                        {formatCurrency(order.total_amount)}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <StatusBadge status={order.status} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
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
