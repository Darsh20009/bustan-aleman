import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { useToast } from '../hooks/use-toast';

interface LoginData {
  email: string;
  password: string;
}

interface StudentLoginProps {
  onLoginSuccess: (student: any) => void;
  onRegisterClick: () => void;
}

export function StudentLogin({ onLoginSuccess, onRegisterClick }: StudentLoginProps) {
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<LoginData>>({});
  const { toast } = useToast();

  const handleInputChange = (field: keyof LoginData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginData> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }

    if (!formData.password) {
      newErrors.password = 'كلمة السر مطلوبة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/student-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "مرحباً بك! 🎉",
          description: `أهلاً وسهلاً ${result.student.studentName}`,
        });
        onLoginSuccess(result.student);
      } else {
        toast({
          title: "خطأ في تسجيل الدخول",
          description: result.message || "بيانات الدخول غير صحيحة",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "خطأ في الاتصال",
        description: "حدث خطأ أثناء تسجيل الدخول، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick login buttons for demo students
  const handleQuickLogin = async (email: string, password: string, name: string) => {
    setFormData({ email, password });
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/student-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "مرحباً بك! 🎉",
          description: `أهلاً وسهلاً ${name}`,
        });
        onLoginSuccess(result.student);
      }
    } catch (error) {
      console.error('Quick login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-100 to-amber-200 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-2 sm:mx-4"
      >
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-t-lg">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </motion.div>
            <CardTitle className="text-2xl font-bold" style={{ fontFamily: 'Amiri, serif' }}>
              تسجيل الدخول
            </CardTitle>
            <CardDescription className="text-amber-100">
              ادخل إلى حسابك في بستان الإيمان
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-right block">
                  البريد الإلكتروني
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={errors.email ? 'border-red-500' : ''}
                  dir="ltr"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm text-right">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-right block">
                  كلمة السر
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="أدخل كلمة السر"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={errors.password ? 'border-red-500' : ''}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm text-right">{errors.password}</p>
                )}
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold py-3 rounded-lg transition-all duration-300"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      جاري تسجيل الدخول...
                    </div>
                  ) : (
                    'دخول'
                  )}
                </Button>
              </motion.div>
            </form>

            {/* Demo Accounts */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-center text-sm text-gray-600 mb-4">حسابات تجريبية:</p>
              <div className="space-y-2">
                <Button
                  onClick={() => handleQuickLogin('yousef.darwish@example.com', '182009', 'يوسف درويش')}
                  disabled={isSubmitting}
                  variant="outline"
                  className="w-full text-amber-600 border-amber-300 hover:bg-amber-50"
                >
                  دخول كـ يوسف درويش (المستوى المتقدم)
                </Button>
                <Button
                  onClick={() => handleQuickLogin('mohamed.ahmed@example.com', '123789', 'محمد أحمد')}
                  disabled={isSubmitting}
                  variant="outline"
                  className="w-full text-orange-600 border-orange-300 hover:bg-orange-50"
                >
                  دخول كـ محمد أحمد (مبتدئ)
                </Button>
              </div>
            </div>

            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-gray-600">
                ليس لديك حساب؟{' '}
                <button
                  onClick={onRegisterClick}
                  className="text-amber-600 hover:text-amber-800 font-medium underline"
                >
                  سجل الآن
                </button>
              </p>
              <p className="text-xs text-gray-500">
                أو{' '}
                <button
                  onClick={() => window.history.back()}
                  className="text-amber-600 hover:text-amber-800 underline"
                >
                  العودة للصفحة الرئيسية
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}