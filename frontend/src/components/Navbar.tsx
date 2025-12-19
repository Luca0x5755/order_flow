import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Package, 
  PlusCircle, 
  User, 
  LogOut,
  Menu,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user, hasRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const canAccessAdmin = hasRole(['admin', 'manager', 'super_admin']);

  const navItems = [
    { path: "/", label: "首頁", icon: LayoutDashboard },
    { path: "/orders", label: "我的訂單", icon: Package },
    { path: "/new-order", label: "新增訂單", icon: PlusCircle },
    { path: "/profile", label: "個人資料", icon: User },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  const NavLinks = ({ mobile = false, onItemClick }: { mobile?: boolean; onItemClick?: () => void }) => (
    <>
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={onItemClick}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              mobile ? "w-full" : "",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
      {canAccessAdmin && (
        <Link
          to="/admin"
          onClick={onItemClick}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
            mobile ? "w-full" : "",
            location.pathname.startsWith('/admin')
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          )}
        >
          <Settings className="h-4 w-4" />
          後台管理
        </Link>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Package className="h-5 w-5" />
          </div>
          <span className="hidden font-semibold text-lg sm:inline-block">
            訂單管理系統
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLinks />
        </nav>

        {/* Desktop User & Logout */}
        <div className="hidden md:flex items-center gap-3">
          {user && (
            <span className="text-sm text-muted-foreground">
              {user.username}
              {user.role !== 'customer' && (
                <span className="ml-1 text-xs text-primary">({user.role})</span>
              )}
            </span>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground hover:text-foreground"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            登出
          </Button>
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">開啟選單</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Package className="h-4 w-4" />
                  </div>
                  <span className="font-semibold">訂單管理</span>
                </div>
              </div>

              {/* 用戶名稱 */}
              {user && (
                <div className="mb-4 px-4 py-2 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">登入帳號</p>
                  <p className="font-medium">{user.username}</p>
                  {user.role !== 'customer' && (
                    <p className="text-xs text-primary">{user.role}</p>
                  )}
                </div>
              )}
              
              <nav className="flex flex-col gap-2 flex-1">
                <NavLinks mobile onItemClick={() => setIsOpen(false)} />
              </nav>

              <div className="pt-4 border-t">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-muted-foreground hover:text-foreground"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  登出
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
