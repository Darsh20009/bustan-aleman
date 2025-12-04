import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BookOpen, UserPlus, Phone, Mail, Lock, User, Eye, EyeOff, Building2 } from "lucide-react";
import { z } from "zod";

const academies = [
  { id: "quran-online", name: "أكاديمية قرآن عن بعد", description: "تحفيظ القرآن الكريم عن بعد" },
  { id: "quran-local", name: "حلقات القرآن الحضورية", description: "حلقات تحفيظ حضورية" },
  { id: "quran-remote", name: "حلقات القرآن عن بعد", description: "حلقات تحفيظ عن بعد" },
];

const registrationSchema = z.object({
  firstName: z.string().min(2, "الاسم الأول مطلوب"),
  lastName: z.string().min(2, "اسم العائلة مطلوب"),
  email: z.string().email("بريد إلكتروني صالح مطلوب"),
  password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
  confirmPassword: z.string(),
  phoneNumber: z.string().min(10, "رقم الهاتف يجب أن يكون على الأقل 10 أرقام"),
  academy: z.string().min(1, "الرجاء اختيار الأكاديمية"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "كلمة المرور غير متطابقة",
  path: ["confirmPassword"],
});

type RegistrationForm = z.infer<typeof registrationSchema>;

export default function Register() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  const form = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
      academy: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegistrationForm) => {
      const { confirmPassword, ...submitData } = data;
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'فشل في التسجيل');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "تم إنشاء الحساب بنجاح",
        description: data.message || "مرحباً بك في بستان الإيمان! يمكنك الآن تسجيل الدخول",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في التسجيل",
        description: error.message || "حدث خطأ أثناء إنشاء الحساب",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegistrationForm) => {
    registerMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                <UserPlus className="text-primary-foreground" size={32} />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-primary">
              إنشاء حساب جديد
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              انضم إلى بستان الإيمان لتعلم القرآن الكريم والعلوم الشرعية
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الاسم الأول</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User size={16} className="absolute right-3 top-3 text-muted-foreground" />
                            <Input 
                              placeholder="محمد"
                              className="pr-10"
                              {...field} 
                              data-testid="input-first-name"
                            />
                          </div>
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
                          <div className="relative">
                            <User size={16} className="absolute right-3 top-3 text-muted-foreground" />
                            <Input 
                              placeholder="أحمد"
                              className="pr-10"
                              {...field} 
                              data-testid="input-last-name"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="academy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الأكاديمية</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full" data-testid="select-academy">
                            <div className="flex items-center gap-2">
                              <Building2 size={16} className="text-muted-foreground" />
                              <SelectValue placeholder="اختر الأكاديمية التي تريد الانضمام إليها" />
                            </div>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {academies.map((academy) => (
                            <SelectItem key={academy.id} value={academy.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{academy.name}</span>
                                <span className="text-xs text-muted-foreground">{academy.description}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>البريد الإلكتروني</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail size={16} className="absolute right-3 top-3 text-muted-foreground" />
                          <Input 
                            type="email"
                            placeholder="example@email.com"
                            className="pr-10"
                            {...field} 
                            data-testid="input-email"
                          />
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
                          <Phone size={16} className="absolute right-3 top-3 text-muted-foreground" />
                          <Input 
                            placeholder="05xxxxxxxx"
                            className="pr-10"
                            {...field} 
                            data-testid="input-phone"
                          />
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
                        <div className="relative">
                          <Lock size={16} className="absolute right-3 top-3 text-muted-foreground" />
                          <Input 
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pr-10 pl-10"
                            {...field} 
                            data-testid="input-password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute left-0 top-0 h-full px-3"
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
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تأكيد كلمة المرور</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock size={16} className="absolute right-3 top-3 text-muted-foreground" />
                          <Input 
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="pr-10 pl-10"
                            {...field} 
                            data-testid="input-confirm-password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute left-0 top-0 h-full px-3"
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

                <Button 
                  type="submit"
                  className="w-full py-3 text-lg font-semibold"
                  disabled={registerMutation.isPending}
                  data-testid="button-register"
                >
                  <UserPlus className="ml-2" size={20} />
                  {registerMutation.isPending ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
                </Button>
              </form>
            </Form>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                لديك حساب بالفعل؟{" "}
                <button 
                  onClick={() => setLocation("/login")}
                  className="text-primary hover:underline font-semibold"
                  data-testid="link-login"
                >
                  سجل دخولك من هنا
                </button>
              </p>
            </div>

            <div className="border-t pt-6">
              <div className="text-center">
                <button 
                  onClick={() => setLocation("/")}
                  className="text-muted-foreground hover:text-primary transition-colors"
                  data-testid="link-back-home"
                >
                  العودة للصفحة الرئيسية
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 grid grid-cols-1 gap-4">
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-reverse space-x-3">
                <BookOpen className="text-primary" size={24} />
                <div>
                  <h3 className="font-semibold">حفظ القرآن الكريم</h3>
                  <p className="text-sm text-muted-foreground">ابدأ رحلتك في حفظ القرآن</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-secondary/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-reverse space-x-3">
                <UserPlus className="text-secondary" size={24} />
                <div>
                  <h3 className="font-semibold">الدورات التعليمية</h3>
                  <p className="text-sm text-muted-foreground">انضم للدورات الإسلامية المتميزة</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
