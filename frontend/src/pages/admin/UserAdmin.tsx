import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { authService, type User, type UserRole } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { UserX, UserCheck, Loader2, Search, Users, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const roleLabels: Record<UserRole, string> = {
  super_admin: '超級管理員',
  admin: '管理員',
  manager: '經理',
  customer: '一般用戶',
};

const roleColors: Record<UserRole, string> = {
  super_admin: 'bg-gradient-to-r from-red-500 to-rose-600 text-white',
  admin: 'bg-gradient-to-r from-violet-500 to-purple-600 text-white',
  manager: 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white',
  customer: 'bg-muted text-muted-foreground',
};

const statusColors = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  inactive: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

export default function UserAdmin() {
  const { isSuperAdmin, user: currentUser } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    const allUsers = await authService.getAllUsers();
    setUsers(allUsers);
    setIsLoading(false);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && user.is_active) ||
      (statusFilter === 'inactive' && !user.is_active);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    const result = await authService.updateUserRole(userId, newRole);
    if (result.success) {
      setUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, role: newRole } : u
      ));
      toast({
        title: "角色已更新",
        description: "用戶角色已成功變更",
      });
    }
  };

  const handleDeactivate = async (userId: string) => {
    const result = await authService.toggleUserActive(userId, false);
    if (result.success) {
      setUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, is_active: false } : u
      ));
      toast({
        title: "帳號已停用",
        description: "該用戶已無法登入系統",
        variant: "destructive",
      });
    }
  };

  const handleActivate = async (userId: string) => {
    const result = await authService.toggleUserActive(userId, true);
    if (result.success) {
      setUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, is_active: true } : u
      ));
      toast({
        title: "帳號已啟用",
        description: "該用戶可以登入系統",
      });
    }
  };

  // Only super_admin can access this page
  if (!isSuperAdmin) {
    return <Navigate to="/admin" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6" />
          用戶管理
        </h1>
        <p className="text-muted-foreground">管理系統用戶及權限設定</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜尋用戶名或 Email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as UserRole | 'all')}>
          <SelectTrigger className="w-40">
            <Shield className="h-4 w-4 mr-2" />
            <SelectValue placeholder="篩選角色" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部角色</SelectItem>
            <SelectItem value="super_admin">超級管理員</SelectItem>
            <SelectItem value="admin">管理員</SelectItem>
            <SelectItem value="manager">經理</SelectItem>
            <SelectItem value="customer">一般用戶</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="篩選狀態" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部狀態</SelectItem>
            <SelectItem value="active">已啟用</SelectItem>
            <SelectItem value="inactive">已停用</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>用戶</TableHead>
              <TableHead>角色</TableHead>
              <TableHead>狀態</TableHead>
              <TableHead>修改角色</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  沒有找到符合條件的用戶
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="font-medium">{user.username}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${roleColors[user.role]} font-medium`}>
                      {roleLabels[user.role]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={user.is_active ? statusColors.active : statusColors.inactive}>
                      {user.is_active ? "已啟用" : "已停用"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(v) => handleRoleChange(user.id, v as UserRole)}
                      disabled={user.id === currentUser?.id || user.role === 'super_admin'}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="customer">一般用戶</SelectItem>
                        <SelectItem value="manager">經理</SelectItem>
                        <SelectItem value="admin">管理員</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    {user.id !== currentUser?.id && user.role !== 'super_admin' && (
                      user.is_active ? (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <UserX className="h-4 w-4 mr-1" />
                              停用
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>確認停用帳號</AlertDialogTitle>
                              <AlertDialogDescription>
                                確定要停用 {user.username} 的帳號嗎？停用後該用戶將無法登入系統。
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>取消</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeactivate(user.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                確認停用
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleActivate(user.id)}
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          啟用
                        </Button>
                      )
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}