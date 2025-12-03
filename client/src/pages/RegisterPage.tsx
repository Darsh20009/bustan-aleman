import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { ThemeToggle } from '@/components/ThemeToggle';
import { 
  User, 
  Phone, 
  Mail, 
  BookOpen, 
  Clock, 
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Menu,
  Home,
  Info,
  GraduationCap,
  LogIn
} from 'lucide-react';
import logoImage from "@assets/bustan aleman logo_1762998406195.png";

const registrationSchema = z.object({
  firstName: z.string().min(2, 'الاسم الأول مطلوب'),
  lastName: z.string().min(2, 'اسم العائلة مطلوب'),
  email: z.string().email('البريد الإلكتروني غير صالح'),
  phoneNumber: z.string().min(10, 'رقم الهاتف مطلوب'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  confirmPassword: z.string(),
  age: z.string().min(1, 'العمر مطلوب'),
  gender: z.string().min(1, 'الجنس مطلوب'),
  currentLevel: z.string().min(1, 'المستوى مطلوب'),
  memorizedParts: z.string().optional(),
  preferredTime: z.string().min(1, 'الوقت المفضل مطلوب'),
  goals: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'كلمات المرور غير متطابقة',
  path: ['confirmPassword'],
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

export function RegisterPage() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      age: '',
      gender: '',
      currentLevel: '',
      memorizedParts: '',
      preferredTime: '',
      goals: '',
      notes: '',
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegistrationFormData) => {
      // Send JSON data without files (files not required for registration)
      return apiRequest('POST', '/api/register', data);
    },
    onSuccess: () => {
      setIsSuccess(true);
      toast({
        title: 'تم التسجيل بنجاح',
        description: 'سيتم التواصل معك قريباً',
      });
    },
    onError: () => {
      toast({
        title: 'خطأ في التسجيل',
        description: 'حدث خطأ أثناء التسجيل، يرجى المحاولة مرة أخرى',
        variant: 'destructive',
      });
    },
  });


  const nextStep = async () => {
    let fieldsToValidate: (keyof RegistrationFormData)[] = [];
    
    if (step === 1) {
      fieldsToValidate = ['firstName', 'lastName', 'email', 'phoneNumber', 'password', 'confirmPassword'];
    } else if (step === 2) {
      fieldsToValidate = ['age', 'gender', 'currentLevel', 'preferredTime'];
    }
    
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const onSubmit = (data: RegistrationFormData) => {
    registerMutation.mutate(data);
  };

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navLinks = [
    { href: '/', label: 'الرئيسية', icon: Home },
    { href: '/courses', label: 'الدورات', icon: GraduationCap },
    { href: '/about', label: 'من نحن', icon: Info },
  ];

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white dark:from-slate-900 dark:to-slate-800" dir="rtl">
        <header className="bg-emerald-700 dark:bg-emerald-900 text-white sticky top-0 z-50 shadow-lg">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <div className="flex justify-between items-center gap-4">
              <Link href="/">
                <div className="flex items-center gap-3 cursor-pointer">
                  <img src={logoImage} alt="بستان الإيمان" className="w-12 h-12 object-contain" />
                  <div>
                    <h1 className="text-xl md:text-2xl font-bold">بستان الإيمان</h1>
                    <p className="text-emerald-100 text-xs hidden sm:block">منصة تحفيظ القرآن الكريم</p>
                  </div>
                </div>
              </Link>
              <ThemeToggle />
            </div>
          </div>
        </header>
        
        <div className="flex items-center justify-center min-h-[80vh] p-4">
          <Card className="w-full max-w-md text-center border-emerald-200 dark:border-emerald-800">
            <CardContent className="pt-6 space-y-6">
              <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mx-auto">
                <CheckCircle className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2 text-emerald-800 dark:text-emerald-100">تم التسجيل بنجاح</h2>
                <p className="text-muted-foreground">
                  شكراً لتسجيلك في بستان الإيمان. سيتم مراجعة طلبك والتواصل معك قريباً.
                </p>
              </div>
              <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
                <Link href="/">العودة للرئيسية</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white dark:from-slate-900 dark:to-slate-800" dir="rtl">
      <header className="bg-emerald-700 dark:bg-emerald-900 text-white sticky top-0 z-50 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center gap-4">
            <Link href="/">
              <div className="flex items-center gap-3 cursor-pointer">
                <img src={logoImage} alt="بستان الإيمان" className="w-12 h-12 object-contain" />
                <div>
                  <h1 className="text-xl md:text-2xl font-bold">بستان الإيمان</h1>
                  <p className="text-emerald-100 text-xs hidden sm:block">منصة تحفيظ القرآن الكريم</p>
                </div>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <button className="text-white/90 hover:text-white transition-colors text-sm flex items-center gap-1" data-testid={`nav-link-${link.href.slice(1) || "home"}`}>
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </button>
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 hidden sm:flex" data-testid="button-login-header">
                  <LogIn className="w-4 h-4 ml-1" />
                  دخول
                </Button>
              </Link>
              <ThemeToggle />
              
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" data-testid="button-mobile-menu">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72 bg-emerald-800 text-white border-emerald-700">
                  <div className="flex flex-col gap-4 mt-8">
                    {navLinks.map((link) => (
                      <Link key={link.href} href={link.href}>
                        <button 
                          onClick={() => setMobileMenuOpen(false)}
                          className="w-full text-right py-3 px-4 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-3"
                          data-testid={`mobile-nav-${link.href.slice(1) || "home"}`}
                        >
                          <link.icon className="w-5 h-5" />
                          {link.label}
                        </button>
                      </Link>
                    ))}
                    <Link href="/login">
                      <button 
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full text-right py-3 px-4 rounded-lg bg-orange-500 hover:bg-orange-600 transition-colors flex items-center gap-3"
                        data-testid="mobile-nav-login"
                      >
                        <LogIn className="w-5 h-5" />
                        تسجيل الدخول
                      </button>
                    </Link>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      <div className="container max-w-2xl mx-auto py-8 px-4">
        <Card className="border-emerald-200 dark:border-emerald-800 shadow-lg">
          <CardHeader className="text-center bg-gradient-to-r from-emerald-50 to-orange-50 dark:from-emerald-950 dark:to-orange-950 rounded-t-lg">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <CardTitle className="text-2xl text-emerald-800 dark:text-emerald-100">التسجيل في بستان الإيمان</CardTitle>
            <CardDescription className="text-emerald-600 dark:text-emerald-300">
              استمارة الالتحاق ببرنامج تحفيظ القرآن الكريم
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-8">
              <div className="flex justify-between gap-4 text-sm text-muted-foreground mb-2">
                <span>الخطوة {step} من {totalSteps}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2 bg-emerald-100 dark:bg-emerald-900 [&>div]:bg-emerald-600" />
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {step === 1 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <User className="h-5 w-5" />
                      المعلومات الشخصية
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>الاسم الأول</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-first-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>اسم العائلة</FormLabel>
                            <FormControl>
                              <Input {...field} data-testid="input-last-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>البريد الإلكتروني</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input {...field} type="email" className="pr-10" data-testid="input-email" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>رقم الهاتف</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input {...field} className="pr-10" data-testid="input-phone" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>كلمة المرور</FormLabel>
                          <FormControl>
                            <Input {...field} type="password" data-testid="input-password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>تأكيد كلمة المرور</FormLabel>
                          <FormControl>
                            <Input {...field} type="password" data-testid="input-confirm-password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      المعلومات التعليمية
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>العمر</FormLabel>
                            <FormControl>
                              <Input {...field} type="number" data-testid="input-age" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>الجنس</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-gender">
                                  <SelectValue placeholder="اختر" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="male">ذكر</SelectItem>
                                <SelectItem value="female">أنثى</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="currentLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>المستوى الحالي</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-level">
                                <SelectValue placeholder="اختر مستواك" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="beginner">مبتدئ - لم أبدأ الحفظ بعد</SelectItem>
                              <SelectItem value="intermediate">متوسط - أحفظ بعض الأجزاء</SelectItem>
                              <SelectItem value="advanced">متقدم - أحفظ أكثر من 10 أجزاء</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="memorizedParts"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>عدد الأجزاء المحفوظة (اختياري)</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" placeholder="0" data-testid="input-memorized-parts" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="preferredTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الوقت المفضل للحصص</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-time">
                                <SelectValue placeholder="اختر الوقت المناسب" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="morning">صباحاً (8 ص - 12 م)</SelectItem>
                              <SelectItem value="afternoon">بعد الظهر (12 م - 4 م)</SelectItem>
                              <SelectItem value="evening">مساءً (4 م - 8 م)</SelectItem>
                              <SelectItem value="night">ليلاً (8 م - 11 م)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="goals"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>أهدافك (اختياري)</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="ما هي أهدافك من الالتحاق بالبرنامج؟"
                              data-testid="textarea-goals"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                      مراجعة ومعلومات إضافية
                    </h3>

                    <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800">
                      <p className="text-sm text-emerald-800 dark:text-emerald-200">
                        أنت على وشك إكمال التسجيل. يرجى مراجعة بياناتك وإضافة أي ملاحظات إضافية.
                      </p>
                    </div>

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ملاحظات إضافية (اختياري)</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              placeholder="أي معلومات إضافية تود مشاركتها..."
                              data-testid="textarea-notes"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <div className="flex justify-between gap-4 pt-4">
                  {step > 1 && (
                    <Button type="button" variant="outline" onClick={prevStep}>
                      <ArrowRight className="ml-2 h-4 w-4" />
                      السابق
                    </Button>
                  )}
                  {step < totalSteps ? (
                    <Button type="button" onClick={nextStep} className="mr-auto">
                      التالي
                      <ArrowLeft className="mr-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button 
                      type="submit" 
                      className="mr-auto"
                      disabled={registerMutation.isPending}
                      data-testid="button-submit-registration"
                    >
                      {registerMutation.isPending ? 'جاري التسجيل...' : 'إرسال الطلب'}
                    </Button>
                  )}
                </div>
              </form>
            </Form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">لديك حساب بالفعل؟ </span>
              <Link href="/login" className="text-primary hover:underline">
                تسجيل الدخول
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}