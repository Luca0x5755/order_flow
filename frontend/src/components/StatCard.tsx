import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant?: 'default' | 'warning' | 'success';
  className?: string;
  animationDelay?: string;
  trend?: { value: number; isPositive: boolean };
}

const variantStyles = {
  default: {
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    valueColor: 'text-foreground',
  },
  warning: {
    iconBg: 'bg-warning/10',
    iconColor: 'text-warning',
    valueColor: 'text-warning',
  },
  success: {
    iconBg: 'bg-success/10',
    iconColor: 'text-success',
    valueColor: 'text-success',
  },
};

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  variant = 'default',
  className,
  animationDelay = '0ms'
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md opacity-0 animate-fade-in",
        className
      )}
      style={{ animationDelay }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className={cn("text-3xl font-bold tracking-tight", styles.valueColor)}>
            {value}
          </p>
        </div>
        <div className={cn("rounded-lg p-3", styles.iconBg)}>
          <Icon className={cn("h-6 w-6", styles.iconColor)} />
        </div>
      </div>
      
      {/* Decorative gradient */}
      <div 
        className={cn(
          "absolute -bottom-8 -right-8 h-24 w-24 rounded-full opacity-20 blur-2xl",
          variant === 'warning' && "bg-warning",
          variant === 'success' && "bg-success",
          variant === 'default' && "bg-primary"
        )}
      />
    </div>
  );
}
