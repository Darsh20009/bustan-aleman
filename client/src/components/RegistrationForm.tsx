import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { useToast } from '../hooks/use-toast';

interface RegistrationData {
  studentName: string;
  email: string;
  password: string;
  phone: string;
  dateOfBirth: string;
  age: number;
}

interface RegistrationFormProps {
  onRegistrationSuccess: (data: RegistrationData) => void;
}

export function RegistrationForm({ onRegistrationSuccess }: RegistrationFormProps) {
  const [formData, setFormData] = useState<RegistrationData>({
    studentName: '',
    email: '',
    password: '',
    phone: '',
    dateOfBirth: '',
    age: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<RegistrationData>>({});
  const { toast } = useToast();

  const handleInputChange = (field: keyof RegistrationData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<RegistrationData> = {};

    if (!formData.studentName.trim()) {
      newErrors.studentName = 'الاسم مطلوب';
    } else if (formData.studentName.length < 2) {
      newErrors.studentName = 'الاسم يجب أن يكون على الأقل حرفين';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صحيح';
    }

    if (!formData.password) {
      newErrors.password = 'كلمة السر مطلوبة';
    } else if (formData.password.length < 6) {
      newErrors.password = 'كلمة السر يجب أن تكون على الأقل 6 أحرف';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'رقم الهاتف مطلوب';
    } else if (!/^(\+966|0)?[5-9][0-9]{8}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'رقم الهاتف غير صحيح (يجب أن يبدأ بـ 05 أو +966)';
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'تاريخ الميلاد مطلوب';
    } else {
      const age = calculateAge(formData.dateOfBirth);
      if (age < 5 || age > 100) {
        newErrors.dateOfBirth = 'العمر يجب أن يكون بين 5 و 100 سنة';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى تصحيح الأخطاء والمحاولة مرة أخرى",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const age = calculateAge(formData.dateOfBirth);
      const registrationData = { ...formData, age };

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "تم التسجيل بنجاح! 🎉",
          description: result.message || "سيتم التواصل معك قريباً عبر الواتساب",
        });
        
        // Open WhatsApp if link is provided
        if (result.whatsappLink && result.shouldRedirectToWhatsApp) {
          setTimeout(() => {
            window.open(result.whatsappLink, '_blank');
          }, 1500);
        }
        
        onRegistrationSuccess(registrationData);
      } else {
        throw new Error(result.message || 'فشل في التسجيل');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "خطأ في التسجيل",
        description: "حدث خطأ أثناء التسجيل، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </motion.div>
            <CardTitle className="text-2xl font-bold" style={{ fontFamily: 'Amiri, serif' }}>
              انضم إلى بستان الإيمان
            </CardTitle>
            <CardDescription className="text-blue-100">
              سجل الآن وابدأ رحلتك في حفظ القرآن الكريم
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="studentName" className="text-right block">
                  الاسم الكامل *
                </Label>
                <Input
                  id="studentName"
                  type="text"
                  placeholder="أدخل اسمك الكامل"
                  value={formData.studentName}
                  onChange={(e) => handleInputChange('studentName', e.target.value)}
                  className={`text-right ${errors.studentName ? 'border-red-500' : ''}`}
                  dir="rtl"
                />
                {errors.studentName && (
                  <p className="text-red-500 text-sm text-right">{errors.studentName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-right block">
                  البريد الإلكتروني *
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
                  كلمة السر *
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="أدخل كلمة سر قوية"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={errors.password ? 'border-red-500' : ''}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm text-right">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-right block">
                  رقم الهاتف *
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="05xxxxxxxx أو +966xxxxxxxxx"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={errors.phone ? 'border-red-500' : ''}
                  dir="ltr"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm text-right">{errors.phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="text-right block">
                  تاريخ الميلاد *
                </Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => {
                    handleInputChange('dateOfBirth', e.target.value);
                    if (e.target.value) {
                      const age = calculateAge(e.target.value);
                      handleInputChange('age', age);
                    }
                  }}
                  className={errors.dateOfBirth ? 'border-red-500' : ''}
                />
                {formData.dateOfBirth && (
                  <p className="text-blue-600 text-sm text-right">
                    العمر: {calculateAge(formData.dateOfBirth)} سنة
                  </p>
                )}
                {errors.dateOfBirth && (
                  <p className="text-red-500 text-sm text-right">{errors.dateOfBirth}</p>
                )}
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <AlertDescription className="text-right text-blue-700">
                  📱 سيتم إرسال تفاصيل التسجيل إلى الواتساب: +966 54 994 7386
                </AlertDescription>
              </Alert>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 rounded-lg transition-all duration-300"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      جاري التسجيل...
                    </div>
                  ) : (
                    'سجل الآن'
                  )}
                </Button>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}