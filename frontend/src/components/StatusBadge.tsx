import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/services/api.types";

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  pending: {
    label: '待處理',
    className: 'bg-warning/15 text-warning border-warning/30',
  },
  processing: {
    label: '處理中',
    className: 'bg-info/15 text-info border-info/30',
  },
  shipped: {
    label: '已出貨',
    className: 'bg-primary/15 text-primary border-primary/30',
  },
  completed: {
    label: '已完成',
    className: 'bg-success/15 text-success border-success/30',
  },
  cancelled: {
    label: '已取消',
    className: 'bg-muted text-muted-foreground border-muted-foreground/20',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
