import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCustomers, useRecalculateGrades } from '@/hooks/useCRM';
import type { CustomerStatus } from '@/services/crm.types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, ArrowUpDown, Eye, Loader2, Building2, RefreshCcw } from 'lucide-react';

const statusLabels: Record<CustomerStatus, string> = {
  potential: '潛在客戶',
  new: '新客戶',
  active: '活躍客戶',
  loyal: '忠誠客戶',
  churned: '流失客戶',
};

const statusColors: Record<CustomerStatus, string> = {
  potential: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  new: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300',
  loyal: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
  churned: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

const gradeColors: Record<string, string> = {
  A: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white',
  B: 'bg-gradient-to-r from-slate-300 to-gray-400 text-gray-800',
  C: 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
};

export default function CustomerList() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CustomerStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'last_order_asc' | 'last_interaction_desc' | 'none'>('none');

  const { data: customers = [], isLoading } = useCustomers({
    status: statusFilter === 'all' ? undefined : statusFilter,
    search: search || undefined,
    sortBy: sortBy === 'none' ? undefined : sortBy,
  });

  const { mutate: recalculateGrades, isPending: isRecalculating } = useRecalculateGrades();

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            客戶管理
          </h1>
          <p className="text-muted-foreground">管理及追蹤客戶資訊與互動狀態</p>
        </div>
        <Button
          variant="outline"
          onClick={() => recalculateGrades()}
          disabled={isRecalculating}
        >
          <RefreshCcw className={`mr-2 h-4 w-4 ${isRecalculating ? 'animate-spin' : ''}`} />
          重新計算等級
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜尋公司名稱或聯絡人..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as CustomerStatus | 'all')}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="篩選狀態" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部狀態</SelectItem>
            <SelectItem value="potential">潛在客戶</SelectItem>
            <SelectItem value="new">新客戶</SelectItem>
            <SelectItem value="active">活躍客戶</SelectItem>
            <SelectItem value="loyal">忠誠客戶</SelectItem>
            <SelectItem value="churned">流失客戶</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-48">
            <ArrowUpDown className="h-4 w-4 mr-2" />
            <SelectValue placeholder="排序方式" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">預設排序</SelectItem>
            <SelectItem value="last_order_asc">越久沒下單優先</SelectItem>
            <SelectItem value="last_interaction_desc">最近有互動優先</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Customer Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>公司名稱</TableHead>
              <TableHead>聯絡人</TableHead>
              <TableHead>等級</TableHead>
              <TableHead>狀態</TableHead>
              <TableHead className="text-right">累計金額</TableHead>
              <TableHead>最近訂單</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  沒有找到符合條件的客戶
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="font-medium">{customer.company_name}</div>
                    <div className="text-sm text-muted-foreground">{customer.industry}</div>
                  </TableCell>
                  <TableCell>
                    <div>{customer.contact_person}</div>
                    <div className="text-sm text-muted-foreground">{customer.email}</div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${gradeColors[customer.grade]} font-bold px-3`}>
                      {customer.grade} 級
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[customer.status]}>
                      {statusLabels[customer.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    NT$ {customer.total_amount.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {customer.last_order_date || '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/admin/crm/${customer.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        查看
                      </Link>
                    </Button>
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
