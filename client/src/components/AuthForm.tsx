import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface AuthFormProps {
  mode: 'login' | 'register';
  onSubmit: (data: any) => Promise<void>;
  onToggleMode: () => void;
  loading?: boolean;
  error?: string;
}

export function AuthForm({ mode, onSubmit, onToggleMode, loading, error }: AuthFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    role: 'student' as 'student' | 'supervisor' | 'admin',
    age: '',
    educationLevel: '',
    quranExperience: '',
    learningGoals: '',
    preferredTime: '',
    whatsappNumber: '',
  });

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = mode === 'login' 
      ? { 
          identifier: formData.phoneNumber || formData.email, // Support phone OR email
          password: formData.password 
        }
      : {
          ...formData,
          age: formData.age ? parseInt(formData.age) : undefined,
        };

    await onSubmit(submitData);
  };

  const isLogin = mode === 'login';

  return (
    <div className="min-h-screen flex items-center justify-center gradient-islamic px-4 relative">
      <div className="islamic-pattern-overlay"></div>
      <Card className="w-full max-w-2xl bg-marble-white shadow-2xl border-0 relative z-10 ornamental-border">
        <CardHeader className="text-center">
          <div className="mx-auto w-20 h-20 bg-royal-gold rounded-full flex items-center justify-center mb-4 shadow-lg">
            <svg className="w-10 h-10 text-midnight-navy" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
          </div>
          <CardTitle className="text-3xl font-bold text-islamic-emerald mb-2 font-arabic-serif">
            {isLogin ? 'تسجيل الدخول' : 'تسجيل جديد'}
          </CardTitle>
          <p className="text-midnight-navy mt-2 font-arabic-sans text-lg">
            {isLogin 
              ? 'مرحباً بك في بستان الإيمان' 
              : 'انضم إلى بستان الإيمان لتعلم القرآن الكريم والعلوم الشرعية'}
          </p>
          <div className="islamic-divider">
            <span className="text-royal-gold text-2xl">✦</span>
          </div>
        </CardHeader>
        
        <CardContent>
          {error && (
            <Alert className="mb-6 border-red-300 bg-red-50 shadow-md">
              <AlertDescription className="text-red-800 font-arabic-sans text-right" dir="rtl">
                ❌ {error}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-islamic-emerald font-medium font-arabic-sans">الاسم الأول *</Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      required={!isLogin}
                      className="text-right border-royal-gold/30 focus:border-islamic-emerald bg-pearl-cream"
                      dir="rtl"
                      data-testid="input-firstName"
                      placeholder="أدخل اسمك الأول"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="lastName" className="text-islamic-emerald font-medium font-arabic-sans">اسم العائلة *</Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                      required={!isLogin}
                      className="text-right border-royal-gold/30 focus:border-islamic-emerald bg-pearl-cream"
                      dir="rtl"
                      data-testid="input-lastName"
                      placeholder="أدخل اسم العائلة"
                    />
                  </div>
                </div>

                {/* Role selection removed for security - all public registrations are students */}
                <div className="bg-desert-sand/30 border border-royal-gold/20 rounded-lg p-4 text-center">
                  <p className="text-islamic-emerald font-arabic-sans font-medium">
                    🎓 سيتم تسجيلك كطالب
                  </p>
                  <p className="text-sm text-copper-bronze mt-1 font-arabic-sans">
                    للحصول على صلاحيات مشرف أو مدير، يرجى التواصل مع الإدارة
                  </p>
                </div>
              </>
            )}

            {isLogin ? (
              <div>
                <Label htmlFor="phoneNumber" className="text-islamic-emerald font-medium font-arabic-sans">رقم الجوال *</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleChange('phoneNumber', e.target.value)}
                  required
                  className="text-right border-royal-gold/30 focus:border-islamic-emerald bg-pearl-cream"
                  dir="rtl"
                  data-testid="input-phoneNumber"
                  placeholder="0532441566"
                />
              </div>
            ) : (
              <div>
                <Label htmlFor="email" className="text-islamic-emerald font-medium font-arabic-sans">البريد الإلكتروني *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                  className="text-right border-royal-gold/30 focus:border-islamic-emerald bg-pearl-cream"
                  dir="rtl"
                  data-testid="input-email"
                  placeholder="example@email.com"
                />
              </div>
            )}

            <div>
              <Label htmlFor="password" className="text-islamic-emerald font-medium font-arabic-sans">كلمة المرور *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                required
                className="text-right border-royal-gold/30 focus:border-islamic-emerald bg-pearl-cream"
                dir="rtl"
                data-testid="input-password"
                minLength={isLogin ? 1 : 8}
                placeholder={isLogin ? "أدخل كلمة المرور" : "8 أحرف على الأقل"}
              />
              {!isLogin && (
                <p className="text-sm text-copper-bronze mt-1 text-right font-arabic-sans">
                  يجب أن تحتوي على 8 أحرف على الأقل
                </p>
              )}
            </div>

            {!isLogin && (
              <>
                <div>
                  <Label htmlFor="phoneNumber" className="text-islamic-emerald font-medium font-arabic-sans">رقم الهاتف *</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleChange('phoneNumber', e.target.value)}
                    required={!isLogin}
                    className="text-right border-royal-gold/30 focus:border-islamic-emerald bg-pearl-cream"
                    dir="rtl"
                    data-testid="input-phoneNumber"
                    placeholder="+966xxxxxxxxx"
                  />
                </div>

                {formData.role === 'student' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="age">العمر</Label>
                        <Input
                          id="age"
                          type="number"
                          value={formData.age}
                          onChange={(e) => handleChange('age', e.target.value)}
                          className="text-right"
                          dir="rtl"
                          min="5"
                          max="100"
                        />
                      </div>

                      <div>
                        <Label htmlFor="educationLevel">المستوى التعليمي</Label>
                        <Input
                          id="educationLevel"
                          type="text"
                          value={formData.educationLevel}
                          onChange={(e) => handleChange('educationLevel', e.target.value)}
                          className="text-right"
                          dir="rtl"
                          placeholder="ابتدائي، متوسط، ثانوي، جامعي"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="quranExperience">خبرتك في تلاوة القرآن</Label>
                      <Input
                        id="quranExperience"
                        type="text"
                        value={formData.quranExperience}
                        onChange={(e) => handleChange('quranExperience', e.target.value)}
                        className="text-right"
                        dir="rtl"
                        placeholder="مبتدئ، متوسط، متقدم"
                      />
                    </div>

                    <div>
                      <Label htmlFor="learningGoals">أهدافك التعليمية</Label>
                      <Input
                        id="learningGoals"
                        type="text"
                        value={formData.learningGoals}
                        onChange={(e) => handleChange('learningGoals', e.target.value)}
                        className="text-right"
                        dir="rtl"
                        placeholder="تحفيظ، تجويد، فهم المعاني"
                      />
                    </div>

                    <div>
                      <Label htmlFor="preferredTime">الوقت المفضل للدروس</Label>
                      <Input
                        id="preferredTime"
                        type="text"
                        value={formData.preferredTime}
                        onChange={(e) => handleChange('preferredTime', e.target.value)}
                        className="text-right"
                        dir="rtl"
                        placeholder="صباحاً، مساءً، عطلة نهاية الأسبوع"
                      />
                    </div>

                    <div>
                      <Label htmlFor="whatsappNumber">رقم الواتساب (اختياري)</Label>
                      <Input
                        id="whatsappNumber"
                        type="tel"
                        value={formData.whatsappNumber}
                        onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                        className="text-right"
                        dir="rtl"
                        placeholder="+966xxxxxxxxx"
                      />
                    </div>
                  </>
                )}
              </>
            )}

            <Button
              type="submit"
              className="w-full btn-islamic-gradient text-white py-4 text-lg font-bold font-arabic-sans shadow-xl hover:shadow-2xl transition-all duration-300"
              disabled={loading}
              data-testid={isLogin ? "button-login" : "button-register"}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="islamic-pulse">{isLogin ? 'جاري تسجيل الدخول...' : 'جاري التسجيل...'}</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-3">
                  <span className="text-2xl">{isLogin ? '🔐' : '✨'}</span>
                  <span>{isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}</span>
                </span>
              )}
            </Button>
          </form>

          <div className="islamic-divider">
            <span className="text-royal-gold text-xl">✧</span>
          </div>
          
          <div className="text-center">
            <button
              type="button"
              onClick={onToggleMode}
              className="text-islamic-emerald hover:text-islamic-teal font-medium transition-all duration-300 font-arabic-sans text-lg hover:scale-105 transform"
              data-testid={isLogin ? "button-switch-to-register" : "button-switch-to-login"}
            >
              <span className="ml-2">{isLogin ? '🌱' : '🎓'}</span>
              {isLogin 
                ? 'لا تملك حساباً؟ سجل الآن' 
                : 'لديك حساب بالفعل؟ سجل الدخول'}
            </button>
          </div>
          
          <div className="text-center mt-6 text-sm text-copper-bronze font-arabic-sans">
            🌿 بستان الإيمان • منصة تعليمية إسلامية شاملة 🌿
          </div>
        </CardContent>
      </Card>
    </div>
  );
}