import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Package, Loader2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const registerSchema = z.object({
  username: z
    .string()
    .min(4, '帳號至少需要 4 個字元')
    .max(20, '帳號最多 20 個字元')
    .regex(/^[a-zA-Z0-9]+$/, '帳號僅限英文與數字'),
  company_name: z
    .string()
    .min(2, '公司名稱至少需要 2 個字元')
    .max(100, '公司名稱最多 100 個字元'),
  email: z.string().email('請輸入有效的 Email 格式'),
  password: z
    .string()
    .min(8, '密碼至少需要 8 個字元')
    .regex(/[a-zA-Z]/, '密碼需包含英文字母')
    .regex(/[0-9]/, '密碼需包含數字'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: '確認密碼與密碼不一致',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
  const navigate = useNavigate();
  const { register: authRegister } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange', // 即時驗證
  });

  const password = watch('password', '');

  // 密碼強度檢查
  const passwordChecks = [
    { label: '至少 8 個字元', valid: password.length >= 8 },
    { label: '包含英文字母', valid: /[a-zA-Z]/.test(password) },
    { label: '包含數字', valid: /[0-9]/.test(password) },
  ];

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setErrorMessage('');

    const result = await authRegister(data.username, data.email, data.password, data.company_name);

    if (result.success) {
      navigate('/login');
    } else {
      setErrorMessage(result.message);
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Package className="h-6 w-6" />
            </div>
            <span className="font-semibold text-2xl">訂單管理系統</span>
          </div>
        </div>

        <Card className="border-border/50 shadow-lg">
          <CardHeader className="text-center space-y-1">
            <CardTitle className="text-2xl">建立帳號</CardTitle>
            <CardDescription>填寫以下資料註冊新帳號</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* 帳號 */}
              <div className="space-y-2">
                <Label htmlFor="username">帳號</Label>
                <Input
                  id="username"
                  placeholder="4-20字元，僅限英文數字"
                  {...register('username')}
                  className={errors.username ? 'border-destructive' : ''}
                />
                {errors.username && (
                  <p className="text-sm text-destructive">{errors.username.message}</p>
                )}
              </div>

              {/* 公司名稱 */}
              <div className="space-y-2">
                <Label htmlFor="company_name">公司名稱</Label>
                <Input
                  id="company_name"
                  placeholder="請輸入公司名稱"
                  {...register('company_name')}
                  className={errors.company_name ? 'border-destructive' : ''}
                />
                {errors.company_name && (
                  <p className="text-sm text-destructive">{errors.company_name.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  {...register('email')}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              {/* 密碼 */}
              <div className="space-y-2">
                <Label htmlFor="password">密碼</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="至少 8 字元，包含英文與數字"
                    {...register('password')}
                    className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* 密碼強度提示 */}
                {password && (
                  <div className="space-y-1 mt-2">
                    {passwordChecks.map((check, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        {check.valid ? (
                          <Check className="h-3 w-3 text-success" />
                        ) : (
                          <X className="h-3 w-3 text-muted-foreground" />
                        )}
                        <span className={cn(
                          check.valid ? 'text-success' : 'text-muted-foreground'
                        )}>
                          {check.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 確認密碼 */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">確認密碼</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="再次輸入密碼"
                    {...register('confirmPassword')}
                    className={errors.confirmPassword ? 'border-destructive pr-10' : 'pr-10'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* 錯誤訊息 */}
              {errorMessage && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">{errorMessage}</p>
                </div>
              )}

              {/* 註冊按鈕 */}
              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    註冊中...
                  </>
                ) : (
                  '註冊'
                )}
              </Button>
            </form>

            {/* 登入連結 */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                已有帳號？{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  返回登入
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
