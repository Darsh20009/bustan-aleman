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
      ? { email: formData.email, password: formData.password }
      : {
          ...formData,
          age: formData.age ? parseInt(formData.age) : undefined,
        };

    await onSubmit(submitData);
  };

  const isLogin = mode === 'login';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-green-800">
            {isLogin ? 'تسجيل الدخول' : 'تسجيل جديد'}
          </CardTitle>
          <p className="text-gray-600 mt-2">
            {isLogin 
              ? 'مرحباً بك في بستان الإيمان' 
              : 'انضم إلى بستان الإيمان لتعلم القرآن الكريم'}
          </p>
        </CardHeader>
        
        <CardContent>
          {error && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">الاسم الأول *</Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      required={!isLogin}
                      className="text-right"
                      dir="rtl"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="lastName">اسم العائلة *</Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                      required={!isLogin}
                      className="text-right"
                      dir="rtl"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="role">نوع الحساب *</Label>
                  <Select value={formData.role} onValueChange={(value) => handleChange('role', value)}>
                    <SelectTrigger className="text-right" dir="rtl">
                      <SelectValue placeholder="اختر نوع الحساب" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">طالب</SelectItem>
                      <SelectItem value="supervisor">مشرف</SelectItem>
                      <SelectItem value="admin">مدير</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div>
              <Label htmlFor="email">البريد الإلكتروني *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                className="text-right"
                dir="rtl"
                placeholder="example@email.com"
              />
            </div>

            <div>
              <Label htmlFor="password">كلمة المرور *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                required
                className="text-right"
                dir="rtl"
                minLength={isLogin ? 1 : 8}
                placeholder={isLogin ? "" : "8 أحرف على الأقل"}
              />
            </div>

            {!isLogin && (
              <>
                <div>
                  <Label htmlFor="phoneNumber">رقم الهاتف *</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleChange('phoneNumber', e.target.value)}
                    required={!isLogin}
                    className="text-right"
                    dir="rtl"
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
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              disabled={loading}
            >
              {loading 
                ? 'جاري المعالجة...' 
                : isLogin ? 'تسجيل الدخول' : 'إنشاء حساب'
              }
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isLogin ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}
              <button
                onClick={onToggleMode}
                className="mr-2 text-green-600 hover:text-green-700 font-medium"
              >
                {isLogin ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}