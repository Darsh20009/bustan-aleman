import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { BookOpen, UserPlus, Phone, GraduationCap } from "lucide-react";
import { z } from "zod";

const registrationSchema = z.object({
  phoneNumber: z.string().min(10, "رقم الهاتف يجب أن يكون على الأقل 10 أرقام"),
  age: z.number().min(1, "العمر مطلوب"),
  educationLevel: z.string().min(1, "المستوى التعليمي مطلوب"),
  quranExperience: z.string().min(1, "خبرة القرآن مطلوبة"),
  learningGoals: z.string().min(10, "أهداف التعلم يجب أن تكون على الأقل 10 أحرف"),
  preferredTime: z.string().min(1, "الوقت المفضل مطلوب"),
  whatsappNumber: z.string().min(10, "رقم الواتساب مطلوب"),
});

type RegistrationForm = z.infer<typeof registrationSchema>;

export default function Register() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(1);

  const form = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      phoneNumber: "",
      age: 0,
      educationLevel: "",
      quranExperience: "",
      learningGoals: "",
      preferredTime: "",
      whatsappNumber: "",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: RegistrationForm) => {
      return apiRequest("PATCH", "/api/user/profile", {
        ...data,
        registrationCompleted: true,
      });
    },
    onSuccess: () => {
      toast({
        title: "تم التسجيل بنجاح",
        description: "سيتم التواصل معك عبر الواتساب قريباً للتفعيل",
      });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في التسجيل",
        description: error.message || "حدث خطأ أثناء التسجيل",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RegistrationForm) => {
    updateProfileMutation.mutate(data);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <BookOpen className="text-6xl text-islamic-green mb-4 mx-auto" size={96} />
            <h2 className="text-2xl font-bold font-arabic-serif text-islamic-green mb-4">
              يجب تسجيل الدخول أولاً
            </h2>
            <p className="text-gray-600 mb-6">
              للتسجيل في المنصة، يجب تسجيل الدخول أولاً
            </p>
            <Button 
              onClick={() => window.location.href = "/api/login"}
              className="btn-islamic-primary w-full mb-4"
              data-testid="button-login-first"
            >
              تسجيل الدخول
            </Button>
            <Button 
              variant="outline"
              onClick={() => setLocation("/")}
              data-testid="button-back-home"
            >
              العودة للرئيسية
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-white p-4">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-islamic-green rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold font-arabic-serif text-islamic-green mb-2">
            استكمال التسجيل
          </h1>
          <p className="text-gray-600">
            أهلاً {(user as any)?.firstName}، يرجى استكمال بياناتك للتسجيل في المنصة
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-reverse space-x-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 1 ? 'bg-islamic-green text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              1
            </div>
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-islamic-green' : 'bg-gray-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 2 ? 'bg-islamic-green text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              2
            </div>
            <div className={`w-16 h-1 ${step >= 3 ? 'bg-islamic-green' : 'bg-gray-200'}`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step >= 3 ? 'bg-islamic-green text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              3
            </div>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>البيانات الأساسية</span>
            <span>الخبرة التعليمية</span>
            <span>التفضيلات</span>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card className="islamic-card">
              <CardContent className="p-6">
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="text-center mb-6">
                      <Phone className="text-3xl text-islamic-green mb-2 mx-auto" size={48} />
                      <h2 className="text-xl font-bold font-arabic-serif">البيانات الأساسية</h2>
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>رقم الهاتف *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="05xxxxxxxx" 
                              {...field} 
                              data-testid="input-phone-number"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>العمر *</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="25" 
                              {...field} 
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              data-testid="input-age"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="whatsappNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>رقم الواتساب *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="0532441566" 
                              {...field} 
                              data-testid="input-whatsapp"
                            />
                          </FormControl>
                          <FormMessage />
                          <p className="text-sm text-gray-600">
                            سيتم التواصل معك عبر هذا الرقم للتفعيل
                          </p>
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <div className="text-center mb-6">
                      <GraduationCap className="text-3xl text-warm-gold mb-2 mx-auto" size={48} />
                      <h2 className="text-xl font-bold font-arabic-serif">الخبرة التعليمية</h2>
                    </div>

                    <FormField
                      control={form.control}
                      name="educationLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>المستوى التعليمي *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-education-level">
                                <SelectValue placeholder="اختر المستوى التعليمي" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="elementary">ابتدائي</SelectItem>
                              <SelectItem value="middle">متوسط</SelectItem>
                              <SelectItem value="high">ثانوي</SelectItem>
                              <SelectItem value="bachelor">جامعي</SelectItem>
                              <SelectItem value="master">ماجستير</SelectItem>
                              <SelectItem value="phd">دكتوراه</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="quranExperience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>خبرة حفظ القرآن *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-quran-experience">
                                <SelectValue placeholder="اختر مستوى خبرتك" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">لا توجد خبرة</SelectItem>
                              <SelectItem value="beginner">مبتدئ (أقل من 5 سور)</SelectItem>
                              <SelectItem value="intermediate">متوسط (5-15 سورة)</SelectItem>
                              <SelectItem value="advanced">متقدم (أكثر من 15 سورة)</SelectItem>
                              <SelectItem value="hafez">حافظ كامل</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="learningGoals"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>أهداف التعلم *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="اذكر أهدافك من التسجيل في المنصة وما تود تحقيقه..."
                              className="min-h-[120px]"
                              {...field} 
                              data-testid="textarea-learning-goals"
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
                    <div className="text-center mb-6">
                      <BookOpen className="text-3xl text-earth-brown mb-2 mx-auto" size={48} />
                      <h2 className="text-xl font-bold font-arabic-serif">التفضيلات</h2>
                    </div>

                    <FormField
                      control={form.control}
                      name="preferredTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الوقت المفضل للدراسة *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-preferred-time">
                                <SelectValue placeholder="اختر الوقت المناسب" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="morning">الصباح (6-12 ظهراً)</SelectItem>
                              <SelectItem value="afternoon">بعد الظهر (12-6 مساءً)</SelectItem>
                              <SelectItem value="evening">المساء (6-10 ليلاً)</SelectItem>
                              <SelectItem value="night">الليل (10-12 منتصف الليل)</SelectItem>
                              <SelectItem value="flexible">مرن - حسب الظروف</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="bg-light-beige p-4 rounded-lg">
                      <h3 className="font-bold mb-2">معلومات التفعيل</h3>
                      <p className="text-sm text-gray-700 arabic-text">
                        بعد إكمال التسجيل، سيتم التواصل معك عبر الواتساب على الرقم 
                        <span className="font-bold text-islamic-green"> 0532441566 </span>
                        لتفعيل حسابك والبدء في الدورات.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-between">
              {step > 1 && (
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  data-testid="button-previous-step"
                >
                  السابق
                </Button>
              )}
              
              <div className="mr-auto">
                {step < 3 ? (
                  <Button 
                    type="button"
                    onClick={() => setStep(step + 1)}
                    className="btn-islamic-primary"
                    data-testid="button-next-step"
                  >
                    التالي
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    className="btn-islamic-primary"
                    disabled={updateProfileMutation.isPending}
                    data-testid="button-complete-registration"
                  >
                    {updateProfileMutation.isPending ? "جاري الإرسال..." : "إكمال التسجيل"}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>

        <div className="text-center mt-6">
          <Button 
            variant="ghost"
            onClick={() => setLocation("/")}
            data-testid="button-cancel-registration"
          >
            إلغاء والعودة للرئيسية
          </Button>
        </div>
      </div>
    </div>
  );
}
