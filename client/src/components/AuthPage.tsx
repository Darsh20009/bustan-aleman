import { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { useAuth } from '../hooks/useAuth';
import { useLocation, Link } from "wouter";
import { useToast } from '../hooks/use-toast';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LogIn, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { z } from "zod";
import logoImage from '@assets/bustan aleman logo_1763041603537.png';

const loginSchema = z.object({
  emailOrPhone: z.string().min(5, "البريد الإلكتروني أو رقم الجوال مطلوب"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
  rememberMe: z.boolean().default(false),
}).refine((data) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\d{1,10}$/;
  return emailRegex.test(data.emailOrPhone) || phoneRegex.test(data.emailOrPhone);
}, {
  message: "يجب إدخال بريد إلكتروني صحيح أو رقم جوال (10 أرقام كحد أقصى)",
  path: ["emailOrPhone"],
});

type LoginForm = z.infer<typeof loginSchema>;

interface AuthPageProps {
  onForgotPasswordClick?: () => void;
  onLoginSuccess?: () => void;
}

export function AuthPage({ onForgotPasswordClick, onLoginSuccess }: AuthPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      emailOrPhone: "",
      password: "",
      rememberMe: false,
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      const isEmail = data.emailOrPhone.includes('@');
      const loginData = {
        ...(isEmail ? { email: data.emailOrPhone } : { phoneNumber: data.emailOrPhone }),
        password: data.password,
      };
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(loginData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'فشل في تسجيل الدخول');
      }

      return response.json();
    },
    onSuccess: async (data, variables) => {
      if (variables.rememberMe) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('rememberMeExpiry', expiryDate.toISOString());
        localStorage.setItem('rememberMePhone', variables.emailOrPhone);
      }
      
      toast({
        title: "نجح تسجيل الدخول",
        description: data.message || "مرحباً بك في بستان الإيمان",
      });
      
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
      
      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          setLocation("/");
        }
      }, 100);
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في تسجيل الدخول",
        description: error.message || "تحقق من بياناتك وحاول مرة أخرى",
        variant: "destructive",
      });
    },
  });

  const onLoginSubmit = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] dark:bg-[#111111] flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src={logoImage} alt="بستان الإيمان" className="w-12 h-12 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-1">تسجيل الدخول</h1>
          <p className="text-sm text-gray-400 dark:text-gray-500">أدخل بياناتك للمتابعة</p>
        </div>

        <div className="bg-white dark:bg-[#161616] rounded-2xl border border-gray-200/60 dark:border-white/5 p-6 md:p-8">
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-5">
              <FormField
                control={loginForm.control}
                name="emailOrPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-gray-600 dark:text-gray-400">
                      رقم الجوال أو البريد الإلكتروني
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="05XXXXXXXX"
                        className="h-11 bg-[#FAFAF7] dark:bg-[#111111] border-gray-200 dark:border-white/10 rounded-xl text-sm"
                        {...field} 
                        data-testid="input-email-or-phone"
                        dir="ltr"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-gray-600 dark:text-gray-400">كلمة المرور</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="h-11 bg-[#FAFAF7] dark:bg-[#111111] border-gray-200 dark:border-white/10 rounded-xl text-sm"
                          {...field} 
                          data-testid="input-password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute left-0 top-0 h-full px-3 hover:bg-transparent text-gray-400"
                          onClick={() => setShowPassword(!showPassword)}
                          data-testid="button-toggle-password"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={loginForm.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                        className="w-4 h-4 cursor-pointer rounded accent-[#2D5A3D]"
                        data-testid="checkbox-remember-me"
                      />
                    </FormControl>
                    <FormLabel className="mb-0 cursor-pointer text-sm text-gray-500 dark:text-gray-400">
                      تذكرني لمدة 30 يوم
                    </FormLabel>
                  </FormItem>
                )}
              />

              <Button 
                type="submit"
                className="w-full h-11 text-sm font-semibold bg-[#2D5A3D] hover:bg-[#234A31] text-white rounded-xl"
                disabled={loginMutation.isPending}
                data-testid="button-login"
              >
                {loginMutation.isPending ? (
                  "جاري تسجيل الدخول..."
                ) : (
                  <>
                    تسجيل الدخول
                    <ArrowLeft className="w-4 h-4 mr-2" />
                  </>
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-4 text-center">
            <button
              onClick={() => onForgotPasswordClick ? onForgotPasswordClick() : setLocation('/forgot-password')}
              className="text-xs text-gray-400 dark:text-gray-500 hover:text-[#2D5A3D] dark:hover:text-emerald-400 transition-colors"
              data-testid="button-forgot-password"
            >
              نسيت كلمة المرور؟
            </button>
          </div>
        </div>

        <div className="mt-6 text-center space-y-3">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            ليس لديك حساب؟{' '}
            <Link href="/register" className="text-[#2D5A3D] dark:text-emerald-400 font-medium hover:underline" data-testid="link-register">
              إنشاء حساب
            </Link>
          </p>
          <Link href="/" className="text-xs text-gray-300 dark:text-gray-600 hover:text-gray-500 transition-colors block" data-testid="link-back-home">
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
