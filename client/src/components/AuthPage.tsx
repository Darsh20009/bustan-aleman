import { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { useAuth } from '../hooks/useAuth';
import { useLocation, Link } from "wouter";
import { useToast } from '../hooks/use-toast';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BookOpen, LogIn, Sparkles, Eye, EyeOff, Mail, Phone } from 'lucide-react';
import { z } from "zod";

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
    <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        <Card className="border shadow-2xl bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-lg">
                <BookOpen className="text-primary-foreground" size={40} />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-foreground mb-2 font-amiri">
              تسجيل الدخول
            </CardTitle>
            <p className="text-muted-foreground mt-2 text-lg">
              مرحباً بك في بستان الإيمان
            </p>
            <div className="flex justify-center my-4">
              <Sparkles className="text-secondary w-6 h-6" />
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="emailOrPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Mail className="w-4 h-4 ml-1" />
                        <Phone className="w-4 h-4" />
                        البريد الإلكتروني أو رقم الجوال
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="أدخل البريد الإلكتروني أو رقم الجوال"
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
                      <FormLabel>كلمة المرور</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            {...field} 
                            data-testid="input-password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute left-0 top-0 h-full px-3 hover:bg-transparent"
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
                    <FormItem className="flex items-center space-x-reverse space-x-2 pt-2">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                          className="w-4 h-4 cursor-pointer"
                          data-testid="checkbox-remember-me"
                        />
                      </FormControl>
                      <FormLabel className="font-arabic-sans mb-0 cursor-pointer">
                        تذكرني لمدة 30 يوم
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit"
                  className="w-full py-3 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={loginMutation.isPending}
                  data-testid="button-login"
                >
                  <LogIn className="ml-2" size={20} />
                  {loginMutation.isPending ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-primary hover:bg-accent/10"
                  onClick={() => onForgotPasswordClick ? onForgotPasswordClick() : setLocation('/forgot-password')}
                  data-testid="button-forgot-password"
                >
                  هل نسيت كلمة المرور؟
                </Button>
              </form>
            </Form>

            <div className="border-t border-border pt-6">
              <div className="text-center space-y-3">
                <p className="text-muted-foreground">
                  ليس لديك حساب؟{' '}
                  <Link href="/register" className="text-primary hover:text-primary/80 font-semibold underline" data-testid="link-register">
                    إنشاء حساب جديد
                  </Link>
                </p>
                <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors block w-full" data-testid="link-back-home">
                  العودة للصفحة الرئيسية
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 grid grid-cols-1 gap-4">
          <Card className="border shadow-xl bg-card/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-reverse space-x-3">
                <BookOpen className="text-primary flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-semibold text-foreground">حفظ القرآن الكريم</h3>
                  <p className="text-sm text-muted-foreground">تتبع تقدمك في الحفظ مع مصحف تفاعلي</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border shadow-xl bg-card/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-reverse space-x-3">
                <Sparkles className="text-secondary flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-semibold text-foreground">الدورات التعليمية</h3>
                  <p className="text-sm text-muted-foreground">التسجيل في الرحلات التعليمية الإسلامية</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="text-center mt-6 text-sm text-muted-foreground">
          بستان الإيمان - منصة تعليمية إسلامية شاملة
        </div>
      </div>
    </div>
  );
}
