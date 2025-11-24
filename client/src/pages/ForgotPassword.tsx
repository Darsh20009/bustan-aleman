import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { Mail, Phone, KeyRound, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useLocation } from 'wouter';

const verifySchema = z.object({
  email: z.string().email('بريد إلكتروني صالح مطلوب'),
  phoneNumber: z.string()
    .min(1, 'رقم الهاتف مطلوب')
    .max(10, 'رقم الهاتف لا يجب أن يزيد عن 10 أرقام')
    .regex(/^\d+$/, 'رقم الهاتف يجب أن يحتوي على أرقام فقط'),
});

const resetSchema = z.object({
  newPassword: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
  confirmPassword: z.string().min(1, 'تأكيد كلمة المرور مطلوب'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'كلمة المرور وتأكيدها غير متطابقين',
  path: ['confirmPassword'],
});

type VerifyForm = z.infer<typeof verifySchema>;
type ResetForm = z.infer<typeof resetSchema>;

interface ForgotPasswordProps {
  onBack?: () => void;
}

export default function ForgotPassword({ onBack }: ForgotPasswordProps) {
  const [step, setStep] = useState<'verify' | 'reset' | 'success'>('verify');
  const [userId, setUserId] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const verifyForm = useForm<VerifyForm>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      email: '',
      phoneNumber: '',
    },
  });

  const resetForm = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async (data: VerifyForm) => {
      const response = await fetch('/api/auth/verify-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'فشل التحقق من البيانات');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setUserId(data.userId);
      setCurrentPassword(data.currentPassword);
      setStep('reset');
      toast({
        title: 'تم التحقق بنجاح',
        description: 'الآن يمكنك تعيين كلمة مرور جديدة',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في التحقق',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const resetMutation = useMutation({
    mutationFn: async (data: ResetForm) => {
      if (!userId) throw new Error('معرف المستخدم غير موجود');

      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          newPassword: data.newPassword,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'فشل تغيير كلمة المرور');
      }

      return response.json();
    },
    onSuccess: () => {
      setStep('success');
      toast({
        title: 'نجح تغيير كلمة المرور',
        description: 'يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في تغيير كلمة المرور',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <KeyRound className="text-white" size={32} />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-emerald-800">
              استرجاع كلمة المرور
            </CardTitle>
            <p className="text-emerald-600 mt-2">
              {step === 'verify' && 'تحقق من هويتك'}
              {step === 'reset' && 'أدخل كلمة مرور جديدة'}
              {step === 'success' && 'تم بنجاح!'}
            </p>
          </CardHeader>

          <CardContent>
            {step === 'verify' && (
              <Form {...verifyForm}>
                <form onSubmit={verifyForm.handleSubmit((data) => verifyMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={verifyForm.control}
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
                            placeholder="أدخل البريد الإلكتروني"
                            {...field}
                            dir="ltr"
                            data-testid="input-forgot-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={verifyForm.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          رقم الجوال
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="أدخل رقم الجوال"
                            {...field}
                            dir="ltr"
                            data-testid="input-forgot-phone"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full py-3 text-lg font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                    disabled={verifyMutation.isPending}
                    data-testid="button-verify-account"
                  >
                    {verifyMutation.isPending ? 'جاري التحقق...' : 'التحقق من البيانات'}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => onBack?.()}
                    data-testid="button-back-to-login"
                  >
                    <ArrowRight className="ml-2" size={18} />
                    العودة لتسجيل الدخول
                  </Button>
                </form>
              </Form>
            )}

            {step === 'reset' && (
              <div className="space-y-4">
                {currentPassword && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                    <p className="text-sm text-blue-700 font-semibold mb-2">كلمة المرور الحالية:</p>
                    <div className="flex items-center justify-between bg-white p-2 rounded border border-blue-200">
                      <span className="font-mono text-sm" data-testid="text-current-password">
                        {showPassword ? currentPassword : '•'.repeat(currentPassword.length)}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPassword(!showPassword)}
                        data-testid="button-show-current-password"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </Button>
                    </div>
                  </div>
                )}

                <Form {...resetForm}>
                  <form onSubmit={resetForm.handleSubmit((data) => resetMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={resetForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>كلمة المرور الجديدة</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="أدخل كلمة مرور جديدة (8 أحرف على الأقل)"
                              {...field}
                              data-testid="input-new-password"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={resetForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>تأكيد كلمة المرور</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="أكد كلمة المرور"
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

                    <Button
                      type="submit"
                      className="w-full py-3 text-lg font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                      disabled={resetMutation.isPending}
                      data-testid="button-reset-password"
                    >
                      {resetMutation.isPending ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
                    </Button>
                  </form>
                </Form>
              </div>
            )}

            {step === 'success' && (
              <div className="text-center space-y-4 py-8">
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-4xl">✓</span>
                </div>
                <h3 className="text-xl font-bold text-emerald-800">تم تحديث كلمة المرور بنجاح!</h3>
                <p className="text-emerald-600">يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة</p>
                <Button
                  onClick={() => onBack?.()}
                  className="w-full py-3 text-lg font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                  data-testid="button-go-to-login"
                >
                  تسجيل الدخول
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
