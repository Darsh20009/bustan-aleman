import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BookOpen, LogIn, Eye, EyeOff } from "lucide-react";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("بريد إلكتروني صالح مطلوب"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
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

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-islamic-green mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // If already authenticated, redirect immediately
  if (isAuthenticated && user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-warm-white flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md">
        <Card className="islamic-card">
          <CardHeader className="text-center p-4 sm:p-6">
            <div className="flex justify-center mb-3 sm:mb-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-islamic-green rounded-full flex items-center justify-center">
                <BookOpen className="text-white" size={28} />
              </div>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold font-arabic-serif text-islamic-green">
              تسجيل الدخول
            </CardTitle>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">
              مرحبًا بك في بستان الإيمان
            </p>
          </CardHeader>
          
          <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            <div className="text-center mb-4 sm:mb-6">
              <p className="text-gray-700 mb-4 sm:mb-6 arabic-text text-sm sm:text-base">
                سجل دخولك للوصول إلى دوراتك وتتبع تقدمك في حفظ القرآن الكريم
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>البريد الإلكتروني</FormLabel>
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
                  control={form.control}
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
                  className="btn-islamic-primary w-full py-2.5 sm:py-3 text-base sm:text-lg font-semibold"
                  disabled={loginMutation.isPending}
                  data-testid="button-login"
                >
                  <LogIn className="ml-2" size={18} />
                  {loginMutation.isPending ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                </Button>
              </form>
            </Form>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">
                ليس لديك حساب؟{" "}
                <button 
                  onClick={() => setLocation("/register")}
                  className="text-islamic-green hover:underline font-semibold"
                  data-testid="link-register"
                >
                  أنشئ حسابًا جديدًا
                </button>
              </p>
            </div>

            <div className="border-t pt-6">
              <div className="text-center">
                <button 
                  onClick={() => setLocation("/")}
                  className="text-gray-500 hover:text-islamic-green transition-colors"
                  data-testid="link-back-home"
                >
                  العودة للصفحة الرئيسية
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Section */}
        <div className="mt-6 sm:mt-8 grid grid-cols-1 gap-3 sm:gap-4">
          <Card className="islamic-card">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center space-x-reverse space-x-3">
                <BookOpen className="text-islamic-green flex-shrink-0" size={20} />
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm sm:text-base">حفظ القرآن الكريم</h3>
                  <p className="text-xs sm:text-sm text-gray-600">تتبع تقدمك في الحفظ</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="islamic-card">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center space-x-reverse space-x-3">
                <LogIn className="text-warm-gold flex-shrink-0" size={20} />
                <div>
                  <h3 className="font-semibold">الدورات التعليمية</h3>
                  <p className="text-sm text-gray-600">التسجيل في الدورات الإسلامية</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
