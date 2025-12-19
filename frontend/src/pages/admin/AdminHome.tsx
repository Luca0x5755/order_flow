import { StatCard } from "@/components/StatCard";
import { useDashboardStats } from "@/hooks/useDashboard";
import { useAllOrders } from "@/hooks/useOrders";
import { DollarSign, ShoppingCart, Users, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useMemo } from "react";
import { format, subDays } from "date-fns";

export default function AdminHome() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: allOrders = [], isLoading: ordersLoading } = useAllOrders();

  // Calculate daily data from orders
  const dailyData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i);
      return {
        date: format(date, 'MM/dd'),
        fullDate: format(date, 'yyyy-MM-dd'),
        orders: 0,
        revenue: 0,
      };
    });

    allOrders.forEach(order => {
      const orderDate = format(new Date(order.order_date), 'yyyy-MM-dd');
      const dayData = last7Days.find(d => d.fullDate === orderDate);
      if (dayData && order.status !== 'cancelled') {
        dayData.orders += 1;
        dayData.revenue += order.total_amount;
      }
    });

    return last7Days;
  }, [allOrders]);

  if (statsLoading || ordersLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">營收儀表板</h1>
        <p className="text-muted-foreground">全站營運數據概覽</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="本月營業額"
          value={`NT$ ${(stats?.this_month_amount || 0).toLocaleString()}`}
          icon={DollarSign}
          variant="success"
        />
        <StatCard
          title="總訂單數"
          value={stats?.total_orders || 0}
          icon={ShoppingCart}
          variant="default"
        />
        <StatCard
          title="總用戶數"
          value={stats?.total_users || 0}
          icon={Users}
          variant="default"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">每日訂單趨勢</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                    name="訂單數"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">每日營收</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="date"
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    formatter={(value: number) => [`NT$ ${value.toLocaleString()}`, '營收']}
                  />
                  <Bar
                    dataKey="revenue"
                    fill="hsl(var(--success))"
                    radius={[4, 4, 0, 0]}
                    name="營收"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
