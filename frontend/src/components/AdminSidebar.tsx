import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users,
  ChevronLeft,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import ReminderPopover from "@/components/ReminderPopover";

interface AdminSidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function AdminSidebar({ collapsed = false, onToggle }: AdminSidebarProps) {
  const location = useLocation();
  const { isSuperAdmin } = useAuth();

  const navItems = [
    { path: "/admin", label: "儀表板", icon: LayoutDashboard },
    { path: "/admin/orders", label: "訂單管理", icon: ShoppingCart },
    { path: "/admin/products", label: "商品管理", icon: Package },
    { path: "/admin/crm", label: "客戶管理", icon: Building2 },
    ...(isSuperAdmin ? [{ path: "/admin/users", label: "用戶管理", icon: Users }] : []),
  ];

  return (
    <aside 
      className={cn(
        "h-[calc(100vh-4rem)] border-r bg-card transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <h2 className="font-semibold text-lg">後台管理</h2>
        )}
        <div className={cn("flex items-center gap-1", collapsed && "mx-auto")}>
          <ReminderPopover />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggle}
          >
          <ChevronLeft className={cn(
            "h-4 w-4 transition-transform",
            collapsed && "rotate-180"
          )} />
        </Button>
        </div>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <Link
          to="/"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors",
            collapsed && "justify-center px-2"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
          {!collapsed && <span>返回前台</span>}
        </Link>
      </div>
    </aside>
  );
}
