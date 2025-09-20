import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { BookOpen, LogIn, UserPlus, Sparkles } from 'lucide-react';

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 flex items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-full flex items-center justify-center shadow-lg">
                <BookOpen className="text-white" size={40} />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-emerald-800 mb-2 font-amiri">
              {mode === 'login' ? 'تسجيل الدخول' : 'تسجيل جديد'}
            </CardTitle>
            <p className="text-emerald-600 mt-2 text-lg">
              {mode === 'login' 
                ? 'مرحباً بك في بستان الإيمان' 
                : 'انضم إلى بستان الإيمان لتعلم القرآن الكريم'}
            </p>
            <div className="flex justify-center my-4">
              <span className="text-amber-500 text-2xl">✦</span>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-emerald-700 mb-6 leading-relaxed">
                {mode === 'login' 
                  ? 'سجل دخولك للوصول إلى دوراتك وتتبع تقدمك في حفظ القرآن الكريم'
                  : 'ابدأ رحلتك التعليمية معنا واحصل على تجربة فريدة في تعلم القرآن الكريم'}
              </p>
              
              <Button 
                onClick={() => window.location.href = "/api/login"}
                className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-xl transition-all duration-300 transform hover:scale-105"
                data-testid="button-login-with-replit"
              >
                <div className="flex items-center justify-center gap-3">
                  <LogIn size={24} />
                  <span>{mode === 'login' ? 'تسجيل الدخول' : 'التسجيل'} مع Replit</span>
                </div>
              </Button>
              
              <p className="text-sm text-emerald-600 mt-4 leading-relaxed">
                نستخدم نظام Replit الآمن لحماية حسابك
              </p>
            </div>
            
            <div className="text-center">
              <button
                type="button"
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="text-emerald-600 hover:text-emerald-800 font-medium transition-all duration-300 text-lg hover:scale-105 transform"
                data-testid={mode === 'login' ? "button-switch-to-register" : "button-switch-to-login"}
              >
                <span className="ml-2">{mode === 'login' ? '🌱' : '🎓'}</span>
                {mode === 'login' 
                  ? 'لا تملك حساباً؟ سجل الآن' 
                  : 'لديك حساب بالفعل؟ سجل الدخول'}
              </button>
            </div>

            <div className="border-t border-emerald-200 pt-6">
              <div className="text-center">
                <button 
                  onClick={() => window.location.href = "/"}
                  className="text-emerald-500 hover:text-emerald-700 transition-colors"
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
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-reverse space-x-3">
                <BookOpen className="text-emerald-600 flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-semibold text-emerald-800">حفظ القرآن الكريم</h3>
                  <p className="text-sm text-emerald-600">تتبع تقدمك في الحفظ مع مصحف تفاعلي</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-reverse space-x-3">
                <Sparkles className="text-amber-500 flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-semibold text-emerald-800">الدورات التعليمية</h3>
                  <p className="text-sm text-emerald-600">التسجيل في الرحلات التعليمية الإسلامية</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="text-center mt-6 text-sm text-emerald-600">
          🌿 بستان الإيمان • منصة تعليمية إسلامية شاملة 🌿
        </div>
      </div>
    </div>
  );
}