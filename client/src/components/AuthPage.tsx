import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { useAuth } from '../hooks/useAuth';
import { useLocation } from "wouter";
import { useToast } from '../hooks/use-toast';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BookOpen, LogIn, UserPlus, Sparkles, Eye, EyeOff, User, Mail, Phone, Users, MessageCircle } from 'lucide-react';
import { z } from "zod";
import { TelegramLoginForm } from './TelegramLoginForm';

const loginSchema = z.object({
  email: z.string().email("بريد إلكتروني صالح مطلوب"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

const registerSchema = z.object({
  firstName: z.string().min(2, "الاسم الأول مطلوب"),
  lastName: z.string().min(2, "اسم العائلة مطلوب"),
  email: z.string().email("بريد إلكتروني صالح مطلوب"),
  password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
  confirmPassword: z.string().min(1, "تأكيد كلمة المرور مطلوب"),
  phoneNumber: z.string().min(10, "رقم الهاتف مطلوب"),
  age: z.number().min(5).max(100).optional(),
  educationLevel: z.string().optional(),
  quranExperience: z.string().optional(),
  learningGoals: z.string().optional(),
  preferredTime: z.string().optional(),
  whatsappNumber: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "كلمة المرور وتأكيدها غير متطابقين",
  path: ["confirmPassword"],
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register' | 'replit' | 'telegram'>('register');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
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
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
      age: undefined,
      educationLevel: "",
      quranExperience: "",
      learningGoals: "",
      preferredTime: "",
      whatsappNumber: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'فشل في تسجيل الدخول');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "نجح تسجيل الدخول",
        description: data.message || "مرحباً بك في بستان الإيمان",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في تسجيل الدخول",
        description: error.message || "تحقق من بياناتك وحاول مرة أخرى",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterForm) => {
      const { confirmPassword, ...registrationData } = data;
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(registrationData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'فشل في التسجيل');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "نجح التسجيل",
        description: data.message || "تم إنشاء حسابك بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في التسجيل",
        description: error.message || "تحقق من بياناتك وحاول مرة أخرى",
        variant: "destructive",
      });
    },
  });

  const onLoginSubmit = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegisterForm) => {
    registerMutation.mutate(data);
  };

  const handleTelegramSuccess = (user: any) => {
    toast({
      title: "نجح تسجيل الدخول عبر التليجرام",
      description: `مرحباً ${user.firstName} ${user.lastName}`,
    });
    
    // Store user in local state temporarily
    localStorage.setItem('telegramUser', JSON.stringify(user));
    
    queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    setLocation("/");
  };

  // لا نحتاج لإظهار شاشة تحميل هنا - نعرض نموذج التسجيل مباشرة

  const renderModeSelector = () => (
    <div className="flex justify-center mb-6">
      <div className="flex bg-gray-100 rounded-lg p-1 flex-wrap">
        <button
          onClick={() => setMode('telegram')}
          className={`px-3 py-2 rounded-md transition-all text-sm ${mode === 'telegram' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'}`}
          data-testid="button-mode-telegram"
        >
          <MessageCircle className="w-4 h-4 inline ml-1" />
          تليجرام
        </button>
        <button
          onClick={() => setMode('replit')}
          className={`px-3 py-2 rounded-md transition-all text-sm ${mode === 'replit' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-600'}`}
          data-testid="button-mode-replit"
        >
          Replit Auth
        </button>
        <button
          onClick={() => setMode('login')}
          className={`px-3 py-2 rounded-md transition-all text-sm ${mode === 'login' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-600'}`}
          data-testid="button-mode-login"
        >
          تسجيل الدخول
        </button>
        <button
          onClick={() => setMode('register')}
          className={`px-3 py-2 rounded-md transition-all text-sm ${mode === 'register' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-600'}`}
          data-testid="button-mode-register"
        >
          تسجيل جديد
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-2xl">
        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
                <BookOpen className="text-white" size={40} />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-emerald-800 mb-2 font-amiri">
              {mode === 'login' ? 'تسجيل الدخول' : mode === 'register' ? 'تسجيل جديد' : mode === 'telegram' ? 'تسجيل الدخول عبر التليجرام' : 'مرحباً بك'}
            </CardTitle>
            <p className="text-emerald-600 mt-2 text-lg">
              {mode === 'login' 
                ? 'مرحباً بك في بستان الإيمان' 
                : mode === 'register'
                ? 'انضم إلى بستان الإيمان لتعلم القرآن الكريم'
                : mode === 'telegram'
                ? 'استخدم بوت التليجرام للحصول على كود تسجيل دخول آمن'
                : 'اختر طريقة تسجيل الدخول المفضلة لك'}
            </p>
            <div className="flex justify-center my-4">
              <span className="text-amber-500 text-2xl">✦</span>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {renderModeSelector()}
            
            {mode === 'telegram' && (
              <TelegramLoginForm 
                onSuccess={handleTelegramSuccess}
                onCancel={() => setMode('replit')}
              />
            )}

            {mode === 'replit' && (
              <div className="text-center">
                <p className="text-emerald-700 mb-6 leading-relaxed">
                  سجل دخولك للوصول إلى دوراتك وتتبع تقدمك في حفظ القرآن الكريم
                </p>
                
                <Button 
                  onClick={() => window.location.href = "/api/login"}
                  className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-xl transition-all duration-300 transform hover:scale-105"
                  data-testid="button-login-with-replit"
                >
                  <div className="flex items-center justify-center gap-3">
                    <LogIn size={24} />
                    <span>تسجيل الدخول مع Replit</span>
                  </div>
                </Button>
                
                <p className="text-sm text-emerald-600 mt-4 leading-relaxed">
                  نستخدم نظام Replit الآمن لحماية حسابك
                </p>
              </div>
            )}

            {mode === 'login' && (
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          البريد الإلكتروني
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="email"
                            placeholder="example@email.com"
                            {...field} 
                            data-testid="input-email"
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

                  <Button 
                    type="submit"
                    className="w-full py-3 text-lg font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                    disabled={loginMutation.isPending}
                    data-testid="button-login"
                  >
                    <LogIn className="ml-2" size={20} />
                    {loginMutation.isPending ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                  </Button>
                </form>
              </Form>
            )}

            {mode === 'register' && (
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={registerForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            الاسم الأول
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="محمد" {...field} data-testid="input-first-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>اسم العائلة</FormLabel>
                          <FormControl>
                            <Input placeholder="أحمد" {...field} data-testid="input-last-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          البريد الإلكتروني
                        </FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="example@email.com" {...field} data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          رقم الهاتف
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="+966501234567" {...field} data-testid="input-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={registerForm.control}
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
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>تأكيد كلمة المرور</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="••••••••"
                                {...field} 
                                data-testid="input-confirm-password"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute left-0 top-0 h-full px-3 hover:bg-transparent"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                data-testid="button-toggle-confirm-password"
                              >
                                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button 
                    type="submit"
                    className="w-full py-3 text-lg font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                    disabled={registerMutation.isPending}
                    data-testid="button-register"
                  >
                    <UserPlus className="ml-2" size={20} />
                    {registerMutation.isPending ? "جاري التسجيل..." : "إنشاء حساب"}
                  </Button>
                </form>
              </Form>
            )}

            <div className="border-t border-emerald-200 pt-6">
              <div className="text-center">
                <button 
                  onClick={() => window.location.href = "/"}
                  className="text-emerald-500 hover:text-emerald-700 transition-colors"
                  data-testid="link-back-home"
                >
                  العودة للصفحة الرئيسية
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Section */}
        <div className="mt-8 grid grid-cols-1 gap-4">
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-reverse space-x-3">
                <BookOpen className="text-emerald-600 flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-semibold text-emerald-800">حفظ القرآن الكريم</h3>
                  <p className="text-sm text-emerald-600">تتبع تقدمك في الحفظ مع مصحف تفاعلي</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-reverse space-x-3">
                <Sparkles className="text-amber-500 flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-semibold text-emerald-800">الدورات التعليمية</h3>
                  <p className="text-sm text-emerald-600">التسجيل في الرحلات التعليمية الإسلامية</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="text-center mt-6 text-sm text-emerald-600">
          🌿 بستان الإيمان • منصة تعليمية إسلامية شاملة 🌿
        </div>
      </div>
    </div>
  );
}