import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { Separator } from "@/components/ui/separator";
import {
  Package,
  MapPin,
  Phone,
  FileText,
  Calendar,
  X
} from "lucide-react";
import type { Order } from "@/services/api.types";
import { useCancelOrder } from "@/hooks/useOrders";
import { toast } from "@/hooks/use-toast";

interface OrderDetailModalProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetailModal({ order, open, onOpenChange }: OrderDetailModalProps) {
  if (!order) return null;

  const cancelOrder = useCancelOrder();

  const handleCancelOrder = () => {
    cancelOrder.mutate(order.id, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-TW', {
      style: 'currency',
      currency: 'TWD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              訂單詳情
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">訂單編號</p>
              <p className="text-lg font-semibold">{order.order_number}</p>
            </div>
            <StatusBadge status={order.status} className="self-start sm:self-center" />
          </div>

          {/* Order Info Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">訂單日期</p>
                <p className="font-medium">{new Date(order.order_date).toLocaleDateString('zh-TW')}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Phone className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">聯絡電話</p>
                <p className="font-medium">{order.phone || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 sm:col-span-2">
              <div className="rounded-lg bg-primary/10 p-2">
                <MapPin className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">配送地址</p>
                <p className="font-medium">{order.delivery_address}</p>
              </div>
            </div>

            {order.notes && (
              <div className="flex items-start gap-3 sm:col-span-2">
                <div className="rounded-lg bg-primary/10 p-2">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">備註</p>
                  <p className="font-medium">{order.notes}</p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Order Items */}
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Package className="h-4 w-4" />
              商品明細
            </h3>
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">商品</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">數量</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">單價</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">小計</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-sm">{item.product?.name || '未知商品'}</td>
                      <td className="px-4 py-3 text-sm text-center">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm text-right">{formatCurrency(item.unit_price)}</td>
                      <td className="px-4 py-3 text-sm text-right font-medium">{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-muted/30">
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-right font-semibold">總計</td>
                    <td className="px-4 py-3 text-right font-bold text-lg text-primary">
                      {formatCurrency(order.total_amount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Cancel Button */}
          {order.status === 'pending' && (
            <div className="flex justify-end pt-4">
              <Button
                variant="destructive"
                onClick={handleCancelOrder}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                取消訂單
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
