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
  emailOrPhone: z.string().min(5, "البريد الإلكتروني أو رقم الجوال مطلوب"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
  rememberMe: z.boolean().default(false),
}).refine((data) => {
  // Check if it's a valid email OR a valid phone (10 digits max)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\d{1,10}$/;
  return emailRegex.test(data.emailOrPhone) || phoneRegex.test(data.emailOrPhone);
}, {
  message: "يجب إدخال بريد إلكتروني صحيح أو رقم جوال (10 أرقام كحد أقصى)",
  path: ["emailOrPhone"],
});

const registerSchema = z.object({
  firstName: z.string().min(2, "الاسم الأول مطلوب"),
  lastName: z.string().min(2, "اسم العائلة مطلوب"),
  email: z.string().email("بريد إلكتروني صالح مطلوب").optional().or(z.literal("")),
  password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
  confirmPassword: z.string().min(1, "تأكيد كلمة المرور مطلوب"),
  phoneNumber: z.string()
    .min(1, "رقم الهاتف مطلوب")
    .max(10, "رقم الهاتف لا يجب أن يزيد عن 10 أرقام")
    .regex(/^\d+$/, "رقم الهاتف يجب أن يحتوي على أرقام فقط"),
  age: z.number().min(5, "العمر يجب أن يكون 5 سنوات على الأقل").max(100, "العمر غير صحيح"),
  educationLevel: z.string().min(1, "المستوى التعليمي مطلوب"),
  quranExperience: z.string().min(1, "الخبرة في القرآن مطلوبة"),
  memorization_level: z.string().min(1, "مستوى الحفظ مطلوب"),
  learningGoals: z.string().optional(),
  preferredTime: z.string().optional(),
  whatsappNumber: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "كلمة المرور وتأكيدها غير متطابقين",
  path: ["confirmPassword"],
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

interface AuthPageProps {
  onForgotPasswordClick?: () => void;
  onLoginSuccess?: () => void;
}

export function AuthPage({ onForgotPasswordClick, onLoginSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'replit' | 'telegram'>('login');
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
      emailOrPhone: "",
      password: "",
      rememberMe: false,
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
      memorization_level: "",
      learningGoals: "",
      preferredTime: "",
      whatsappNumber: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      // Convert emailOrPhone to either email or phoneNumber based on format
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
      // حفظ معلومات الجلسة إذا اختار المستخدم تذكره
      if (variables.rememberMe) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30); // 30 يوم
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('rememberMeExpiry', expiryDate.toISOString());
        localStorage.setItem('rememberMePhone', variables.emailOrPhone);
      }
      
      toast({
        title: "نجح تسجيل الدخول",
        description: data.message || "مرحباً بك في بستان الإيمان",
      });
      
      // Invalidate and immediately refetch to get fresh user data
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      await queryClient.refetchQueries({ queryKey: ["/api/auth/user"] });
      
      // Delay slightly to ensure state updates
      setTimeout(() => {
        // Call the onLoginSuccess callback if provided
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

  const renderModeSelector = () => null; // Hidden - only using pre-registered users with phone login

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-2xl">
        <Card className="border shadow-2xl bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-lg">
                <BookOpen className="text-primary-foreground" size={40} />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-foreground mb-2 font-amiri">
              {mode === 'login' ? 'تسجيل الدخول' : mode === 'register' ? 'تسجيل جديد' : mode === 'telegram' ? 'تسجيل الدخول عبر التليجرام' : 'مرحباً بك'}
            </CardTitle>
            <p className="text-muted-foreground mt-2 text-lg">
              {mode === 'login' 
                ? 'مرحباً بك في بستان الإيمان' 
                : mode === 'register'
                ? 'انضم إلى بستان الإيمان لتعلم القرآن الكريم'
                : mode === 'telegram'
                ? 'استخدم بوت التليجرام للحصول على كود تسجيل دخول آمن'
                : 'اختر طريقة تسجيل الدخول المفضلة لك'}
            </p>
            <div className="flex justify-center my-4">
              <Sparkles className="text-secondary w-6 h-6" />
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
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  سجل دخولك للوصول إلى دوراتك وتتبع تقدمك في حفظ القرآن الكريم
                </p>
                
                <Button 
                  onClick={() => window.location.href = "/api/login"}
                  className="w-full py-4 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl transition-all duration-300"
                  data-testid="button-login-with-replit"
                >
                  <div className="flex items-center justify-center gap-3">
                    <LogIn size={24} />
                    <span>تسجيل الدخول مع Replit</span>
                  </div>
                </Button>
                
                <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                  نستخدم نظام Replit الآمن لحماية حسابك
                </p>
              </div>
            )}

            {mode === 'login' && (
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
                          تذكرني لمدة 30 يوم (لا تطلب كلمة مرور في نفس المتصفح)
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
                    onClick={() => onForgotPasswordClick?.()}
                    data-testid="button-forgot-password"
                  >
                    هل نسيت كلمة المرور؟
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
                            <Input placeholder="أدخل الاسم الأول" {...field} data-testid="input-first-name" />
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
                            <Input placeholder="أدخل اسم العائلة" {...field} data-testid="input-last-name" />
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
                          <Input type="email" placeholder="أدخل البريد الإلكتروني" {...field} data-testid="input-email" />
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
                          رقم الهاتف * (10 أرقام كحد أقصى)
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="أدخل رقم الجوال (10 أرقام)" 
                            {...field} 
                            data-testid="input-phone" 
                            dir="ltr"
                            maxLength={10}
                            inputMode="numeric"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={registerForm.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>العمر *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="أدخل العمر"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              data-testid="input-age" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="educationLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>المستوى التعليمي *</FormLabel>
                          <FormControl>
                            <select {...field} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" data-testid="select-education-level">
                              <option value="">اختر المستوى</option>
                              <option value="ابتدائي">ابتدائي</option>
                              <option value="متوسط">متوسط</option>
                              <option value="ثانوي">ثانوي</option>
                              <option value="جامعي">جامعي</option>
                              <option value="دراسات عليا">دراسات عليا</option>
                              <option value="أخرى">أخرى</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={registerForm.control}
                    name="quranExperience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الخبرة في قراءة القرآن *</FormLabel>
                        <FormControl>
                          <select {...field} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" data-testid="select-quran-experience">
                            <option value="">اختر مستوى الخبرة</option>
                            <option value="مبتدئ - لا أعرف القراءة">مبتدئ - لا أعرف القراءة</option>
                            <option value="أعرف الحروف فقط">أعرف الحروف فقط</option>
                            <option value="أقرأ بصعوبة">أقرأ بصعوبة</option>
                            <option value="أقرأ بشكل جيد">أقرأ بشكل جيد</option>
                            <option value="أقرأ بطلاقة">أقرأ بطلاقة</option>
                            <option value="حافظ وأجيد التجويد">حافظ وأجيد التجويد</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="memorization_level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>مستوى الحفظ الحالي *</FormLabel>
                        <FormControl>
                          <select {...field} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" data-testid="select-memorization-level">
                            <option value="">اختر مستوى الحفظ</option>
                            <option value="لم أبدأ الحفظ بعد">لم أبدأ الحفظ بعد</option>
                            <option value="أقل من جزء">أقل من جزء</option>
                            <option value="جزء واحد">جزء واحد (جزء عم مثلاً)</option>
                            <option value="جزءان">جزءان</option>
                            <option value="ثلاثة أجزاء">ثلاثة أجزاء</option>
                            <option value="أكثر من 3 أجزاء">أكثر من 3 أجزاء</option>
                            <option value="نصف القرآن">نصف القرآن (15 جزء)</option>
                            <option value="أكثر من نصف القرآن">أكثر من نصف القرآن</option>
                            <option value="القرآن كاملاً">القرآن كاملاً بفضل الله</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="learningGoals"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>أهدافك في تعلم القرآن (اختياري)</FormLabel>
                        <FormControl>
                          <textarea 
                            {...field}
                            placeholder="أدخل أهدافك في تعلم القرآن الكريم"
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            data-testid="textarea-learning-goals"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="preferredTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الوقت المفضل للدروس (اختياري)</FormLabel>
                        <FormControl>
                          <select {...field} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" data-testid="select-preferred-time">
                            <option value="">اختر الوقت المناسب</option>
                            <option value="صباحاً (6-12)">صباحاً (6-12)</option>
                            <option value="ظهراً (12-3)">ظهراً (12-3)</option>
                            <option value="عصراً (3-6)">عصراً (3-6)</option>
                            <option value="مساءً (6-9)">مساءً (6-9)</option>
                            <option value="ليلاً (9-12)">ليلاً (9-12)</option>
                          </select>
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
                    className="w-full py-3 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={registerMutation.isPending}
                    data-testid="button-register"
                  >
                    <UserPlus className="ml-2" size={20} />
                    {registerMutation.isPending ? "جاري التسجيل..." : "إنشاء حساب"}
                  </Button>
                </form>
              </Form>
            )}

            <div className="border-t border-border pt-6">
              <div className="text-center space-y-3">
                {mode === 'login' ? (
                  <p className="text-muted-foreground">
                    ليس لديك حساب؟{' '}
                    <button
                      onClick={() => setMode('register')}
                      className="text-primary hover:text-primary/80 font-semibold underline"
                      data-testid="link-register"
                    >
                      إنشاء حساب جديد
                    </button>
                  </p>
                ) : mode === 'register' ? (
                  <p className="text-muted-foreground">
                    لديك حساب؟{' '}
                    <button
                      onClick={() => setMode('login')}
                      className="text-primary hover:text-primary/80 font-semibold underline"
                      data-testid="link-login"
                    >
                      تسجيل الدخول
                    </button>
                  </p>
                ) : null}
                <button 
                  onClick={() => window.location.href = "/"}
                  className="text-muted-foreground hover:text-foreground transition-colors block w-full"
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