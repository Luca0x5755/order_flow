import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { User, Mail, Building2, Save, Edit2, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { usersService } from "@/services/users.service";
import type { UpdateUserProfileRequest } from "@/services/api.types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const profileSchema = z.object({
  username: z.string().min(2, "用戶名至少需要2個字"),
  email: z.string().email("請輸入有效的電子郵件"),
  company_name: z.string().min(2, "公司名稱至少需要2個字"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  // Fetch user profile
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['userProfile'],
    queryFn: usersService.getUserProfile,
  });

  // Update user profile mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateUserProfileRequest) =>
      usersService.updateUserProfile(data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['userProfile'], updatedUser);
      toast({
        title: "儲存成功",
        description: "您的個人資料已更新",
      });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({
        title: "儲存失敗",
        description: error.response?.data?.detail || "更新個人資料時發生錯誤",
        variant: "destructive",
      });
    },
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: user ? {
      username: user.username,
      email: user.email,
      company_name: user.company_name || "",
    } : undefined,
  });

  const onSubmit = async (data: ProfileFormData) => {
    // Only send fields that can be updated (not username)
    const updateData: UpdateUserProfileRequest = {
      email: data.email !== user?.email ? data.email : undefined,
      company_name: data.company_name !== user?.company_name ? data.company_name : undefined,
    };

    // Only submit if there are actual changes
    if (updateData.email || updateData.company_name) {
      updateMutation.mutate(updateData);
    } else {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      form.reset({
        username: user.username,
        email: user.email,
        company_name: user.company_name || "",
      });
    }
    setIsEditing(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="container py-8 max-w-2xl">
        <div className="space-y-2 mb-8">
          <h1 className="text-3xl font-bold tracking-tight">個人資料</h1>
          <p className="text-muted-foreground">
            管理您的帳戶資訊和配送設定
          </p>
        </div>
        <Card>
          <CardContent className="pt-6 flex items-center justify-center min-h-[300px]">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">載入中...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container py-8 max-w-2xl">
        <div className="space-y-2 mb-8">
          <h1 className="text-3xl font-bold tracking-tight">個人資料</h1>
          <p className="text-muted-foreground">
            管理您的帳戶資訊和配送設定
          </p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            載入個人資料時發生錯誤，請稍後再試。
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // No user data
  if (!user) {
    return null;
  }

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
                {user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-2xl">{user.username}</CardTitle>
              <CardDescription className="flex items-center gap-1 mt-1">
                <Mail className="h-4 w-4" />
                {user.email}
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
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        用戶名
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={true}
                          className="disabled:opacity-100 disabled:cursor-not-allowed"
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
                  name="company_name"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        公司名稱
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
                    disabled={updateMutation.isPending}
                  >
                    取消
                  </Button>
                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        儲存中...
                      </>
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

      {/* Account Info */}
      <div
        className="grid gap-4 sm:grid-cols-2 mt-6 opacity-0 animate-fade-in"
        style={{ animationDelay: "200ms" }}
      >
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">角色</p>
            <p className="text-lg font-semibold capitalize">{user.role}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">帳號狀態</p>
            <p className="text-lg font-semibold">
              {user.is_active ? (
                <span className="text-success">啟用中</span>
              ) : (
                <span className="text-destructive">已停用</span>
              )}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

