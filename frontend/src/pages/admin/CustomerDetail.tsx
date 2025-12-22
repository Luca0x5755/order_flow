import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCustomer, useUpdateCustomer, useInteractions, useCreateInteraction, useOrderSummary } from '@/hooks/useCRM';
import type { InteractionType, CustomerStatus } from '@/services/crm.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  ArrowLeft,
  Pencil,
  Phone,
  Mail,
  MapPin,
  Building2,
  Calendar,
  ShoppingCart,
  TrendingUp,
  MessageSquare,
  Plus,
  Loader2,
  Users,
  FileText,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

const gradeStyles: Record<string, { bg: string; border: string; text: string }> = {
  A: { bg: 'bg-gradient-to-br from-amber-50 to-yellow-100', border: 'border-amber-400', text: 'text-amber-700' },
  B: { bg: 'bg-gradient-to-br from-slate-50 to-gray-100', border: 'border-slate-400', text: 'text-slate-700' },
  C: { bg: 'bg-gradient-to-br from-gray-50 to-gray-100', border: 'border-gray-300', text: 'text-gray-600' },
};

const statusLabels: Record<CustomerStatus, string> = {
  potential: '潛在客戶',
  new: '新客戶',
  active: '活躍客戶',
  loyal: '忠誠客戶',
  churned: '流失客戶',
};

const interactionIcons: Record<InteractionType, typeof Phone> = {
  phone: Phone,
  email: Mail,
  meeting: Users,
  visit: Building2,
  other: FileText,
};

const interactionLabels: Record<InteractionType, string> = {
  phone: '電話',
  email: 'Email',
  meeting: '會議',
  visit: '拜訪',
  other: '其他',
};

const editSchema = z.object({
  company_name: z.string().min(1, '請輸入公司名稱'),
  contact_person: z.string().min(1, '請輸入聯絡人'),
  email: z.string().email('請輸入有效 Email'),
  phone: z.string().min(1, '請輸入聯絡電話'),
  address: z.string().optional(),
});

const interactionSchema = z.object({
  interaction_type: z.enum(['phone', 'email', 'meeting', 'visit', 'other']),
  content: z.string().min(1, '請輸入互動內容'),
  next_action: z.string().optional(),
});

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: customer, isLoading } = useCustomer(id!);
  const updateCustomer = useUpdateCustomer();
  const { data: interactions = [] } = useInteractions(id!);
  const createInteraction = useCreateInteraction();
  const { data: orderSummary = [] } = useOrderSummary(id!);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddInteractionOpen, setIsAddInteractionOpen] = useState(false);

  const editForm = useForm({
    resolver: zodResolver(editSchema),
    defaultValues: {
      company_name: '',
      contact_person: '',
      email: '',
      phone: '',
      address: '',
    },
  });

  const interactionForm = useForm({
    resolver: zodResolver(interactionSchema),
    defaultValues: {
      interaction_type: 'phone' as InteractionType,
      content: '',
      next_action: '',
    },
  });

  const handleEditClick = () => {
    if (customer) {
      editForm.reset({
        company_name: customer.company_name,
        contact_person: customer.contact_person,
        email: customer.email,
        phone: customer.phone,
        address: customer.address || '',
      });
    }
    setIsEditOpen(true);
  };

  const onEditSubmit = (data: z.infer<typeof editSchema>) => {
    updateCustomer.mutate(
      { id: id!, data },
      { onSuccess: () => setIsEditOpen(false) }
    );
  };

  const onInteractionSubmit = (data: z.infer<typeof interactionSchema>) => {
    createInteraction.mutate(
      {
        customerId: id!,
        data: {
          interaction_type: data.interaction_type,
          content: data.content,
          next_action: data.next_action,
        },
      },
      {
        onSuccess: () => {
          setIsAddInteractionOpen(false);
          interactionForm.reset();
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">找不到該客戶</p>
        <Button asChild className="mt-4">
          <Link to="/admin/crm">返回客戶列表</Link>
        </Button>
      </div>
    );
  }

  const gradeStyle = gradeStyles[customer.grade];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/admin/crm">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{customer.company_name}</h1>
            <p className="text-muted-foreground">{customer.contact_person}</p>
          </div>
        </div>
      </div>

      {/* 4-Section Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Section 1: Basic Info Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">基本資料</CardTitle>
            <Button variant="outline" size="sm" onClick={handleEditClick}>
              <Pencil className="h-4 w-4 mr-1" />
              編輯
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{customer.phone}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{customer.email}</span>
            </div>
            {customer.address && (
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                <span>{customer.address}</span>
              </div>
            )}
            {customer.notes && (
              <div className="p-3 rounded-lg bg-muted/50 text-sm">
                <span className="font-medium">備註：</span> {customer.notes}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section 2: Customer Tags */}
        <Card className={`${gradeStyle.bg} border-2 ${gradeStyle.border}`}>
          <CardHeader>
            <CardTitle className={`text-lg ${gradeStyle.text}`}>客戶等級與標籤</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className={`text-5xl font-black ${gradeStyle.text}`}>
                {customer.grade}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">等級</p>
                <p className={`font-semibold ${gradeStyle.text}`}>
                  {customer.grade === 'A' ? '金牌客戶' : customer.grade === 'B' ? '銀牌客戶' : '一般客戶'}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-sm">
                <Building2 className="h-3 w-3 mr-1" />
                {customer.industry}
              </Badge>
              <Badge variant="outline" className="text-sm">
                來源：{customer.source}
              </Badge>
              <Badge className={`
                ${customer.status === 'loyal' ? 'bg-amber-500' : ''}
                ${customer.status === 'active' ? 'bg-emerald-500' : ''}
                ${customer.status === 'new' ? 'bg-green-500' : ''}
                ${customer.status === 'potential' ? 'bg-blue-500' : ''}
                ${customer.status === 'churned' ? 'bg-red-500' : ''}
              `}>
                {statusLabels[customer.status]}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Statistics Dashboard */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">統計儀表板</CardTitle>
            <CardDescription>最近 6 個月訂單趨勢</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <ShoppingCart className="h-5 w-5 mx-auto mb-1 text-primary" />
                <div className="text-2xl font-bold">{customer.total_orders}</div>
                <div className="text-xs text-muted-foreground">累計訂單</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <TrendingUp className="h-5 w-5 mx-auto mb-1 text-primary" />
                <div className="text-lg font-bold">NT$ {(customer.total_amount / 1000).toFixed(0)}K</div>
                <div className="text-xs text-muted-foreground">累計金額</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/50">
                <Calendar className="h-5 w-5 mx-auto mb-1 text-primary" />
                <div className="text-sm font-bold">{customer.last_order_date || '-'}</div>
                <div className="text-xs text-muted-foreground">最近訂單</div>
              </div>
            </div>

            {/* Chart */}
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={orderSummary}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="month"
                    tickFormatter={(v) => v.split('-')[1] + '月'}
                    className="text-xs"
                  />
                  <YAxis
                    tickFormatter={(v) => `${v / 1000}K`}
                    className="text-xs"
                  />
                  <Tooltip
                    formatter={(value: number) => [`NT$ ${value.toLocaleString()}`, '金額']}
                    labelFormatter={(label) => label + ' 月'}
                  />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Section 4: Orders & Interactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">訂單與互動記錄</CardTitle>
              <CardDescription>歷史記錄與時間軸</CardDescription>
            </div>
            <Button size="sm" onClick={() => setIsAddInteractionOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              新增互動
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Order History Accordion */}
            <Accordion type="single" collapsible>
              <AccordionItem value="orders">
                <AccordionTrigger className="text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4" />
                    訂單歷史 ({customer.total_orders} 筆)
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 text-sm">
                    {customer.total_orders === 0 ? (
                      <p className="text-muted-foreground py-2">尚無訂單記錄</p>
                    ) : (
                      <div className="space-y-2">
                        {[...Array(Math.min(5, customer.total_orders))].map((_, i) => (
                          <div key={i} className="flex justify-between p-2 rounded bg-muted/30">
                            <span>訂單 #{String(1000 + i).padStart(4, '0')}</span>
                            <span className="text-muted-foreground">
                              NT$ {Math.floor(Math.random() * 50000 + 10000).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Interaction Timeline */}
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                互動時間軸
              </h4>
              <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                {interactions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">尚無互動記錄</p>
                ) : (
                  interactions.map((interaction) => {
                    const Icon = interactionIcons[interaction.interaction_type];
                    return (
                      <div key={interaction.id} className="relative pl-6 pb-4 border-l-2 border-muted last:pb-0">
                        <div className="absolute -left-2.5 top-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Icon className="h-3 w-3 text-primary-foreground" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Badge variant="outline" className="text-xs">
                              {interactionLabels[interaction.interaction_type]}
                            </Badge>
                            <span className="text-muted-foreground">
                              {format(new Date(interaction.created_at), 'yyyy/MM/dd HH:mm')}
                            </span>
                          </div>
                          <p className="text-sm">{interaction.content}</p>
                          {interaction.next_action && (
                            <p className="text-xs text-primary bg-primary/10 p-2 rounded">
                              📌 下一步：{interaction.next_action}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>編輯客戶資料</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>公司名稱</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="contact_person"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>聯絡人</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>電話</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={editForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>地址</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                  取消
                </Button>
                <Button type="submit" disabled={updateCustomer.isPending}>
                  {updateCustomer.isPending ? '儲存中...' : '儲存'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Add Interaction Dialog */}
      <Dialog open={isAddInteractionOpen} onOpenChange={setIsAddInteractionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新增互動記錄</DialogTitle>
          </DialogHeader>
          <Form {...interactionForm}>
            <form onSubmit={interactionForm.handleSubmit(onInteractionSubmit)} className="space-y-4">
              <FormField
                control={interactionForm.control}
                name="interaction_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>互動類型</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="phone">電話</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="meeting">會議</SelectItem>
                        <SelectItem value="visit">拜訪</SelectItem>
                        <SelectItem value="other">其他</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={interactionForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>互動內容</FormLabel>
                    <FormControl>
                      <Textarea placeholder="描述這次互動的內容..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={interactionForm.control}
                name="next_action"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>下一步行動 (選填)</FormLabel>
                    <FormControl>
                      <Input placeholder="例如：一週後再跟進" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddInteractionOpen(false)}>
                  取消
                </Button>
                <Button type="submit" disabled={createInteraction.isPending}>
                  {createInteraction.isPending ? '新增中...' : '新增'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
