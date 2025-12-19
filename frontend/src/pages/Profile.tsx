import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Mail, Phone, MapPin, Save, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";

const profileSchema = z.object({
  name: z.string().min(2, "姓名至少需要2個字"),
  email: z.string().email("請輸入有效的電子郵件"),
  phone: z.string().regex(/^0\d{2,3}-?\d{3}-?\d{3,4}$/, "請輸入有效的電話號碼"),
  address: z.string().min(5, "請輸入完整地址"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

// Mock user data
const mockUser = {
  name: "王小明",
  email: "xiaoming@example.com",
  phone: "0912-345-678",
  address: "台北市信義區信義路五段7號",
};

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: mockUser,
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      title: "儲存成功",
      description: "您的個人資料已更新",
    });

    setIsSaving(false);
    setIsEditing(false);
  };

  const handleCancel = () => {
    form.reset(mockUser);
    setIsEditing(false);
  };

  return (
    <div className="container py-8 max-w-2xl">
      {/* Page Header */}
      <div className="space-y-2 mb-8 opacity-0 animate-fade-in">
        <h1 className="text-3xl font-bold tracking-tight">個人資料</h1>
        <p className="text-muted-foreground">
          管理您的帳戶資訊和配送設定
        </p>
      </div>

      {/* Profile Card */}
      <Card className="opacity-0 animate-fade-in" style={{ animationDelay: "100ms" }}>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {mockUser.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-2xl">{mockUser.name}</CardTitle>
              <CardDescription className="flex items-center gap-1 mt-1">
                <Mail className="h-4 w-4" />
                {mockUser.email}
              </CardDescription>
            </div>
            {!isEditing && (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4 mr-2" />
                編輯
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        姓名
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          disabled={!isEditing}
                          className="disabled:opacity-100 disabled:cursor-default"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        電子郵件
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          {...field} 
                          disabled={!isEditing}
                          className="disabled:opacity-100 disabled:cursor-default"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        聯絡電話
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          disabled={!isEditing}
                          className="disabled:opacity-100 disabled:cursor-default"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        預設地址
                      </FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          disabled={!isEditing}
                          className="disabled:opacity-100 disabled:cursor-default"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {isEditing && (
                <div className="flex gap-3 justify-end pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    取消
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <span className="animate-pulse-soft">儲存中...</span>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        儲存變更
                      </>
                    )}
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Account Stats */}
      <div 
        className="grid gap-4 sm:grid-cols-3 mt-6 opacity-0 animate-fade-in"
        style={{ animationDelay: "200ms" }}
      >
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-primary">12</p>
            <p className="text-sm text-muted-foreground">總訂單數</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-success">10</p>
            <p className="text-sm text-muted-foreground">已完成訂單</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold">$45,890</p>
            <p className="text-sm text-muted-foreground">累計消費</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
