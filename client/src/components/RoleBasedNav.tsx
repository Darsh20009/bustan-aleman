import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface NavItem {
  title: string;
  path: string;
  description: string;
}

const roleNavigation = {
  student: [
    { title: 'لوحة التحكم', path: '/dashboard', description: 'عرض التقدم والجلسات' },
    { title: 'قراءة القرآن', path: '/quran', description: 'قراءة القرآن مع الملاحظات' },
    { title: 'الدورات', path: '/courses', description: 'الدورات المتاحة والمسجلة' },
    { title: 'الرحلات التعليمية', path: '/trips', description: 'الرحلات الدينية والتعليمية' },
    { title: 'الشهادات', path: '/certificates', description: 'شهادات الإنجاز الخاصة بك' },
  ],
  supervisor: [
    { title: 'لوحة المشرف', path: '/supervisor', description: 'إدارة الطلاب والجلسات' },
    { title: 'الطلاب', path: '/supervisor/students', description: 'متابعة تقدم الطلاب' },
    { title: 'الجلسات', path: '/supervisor/sessions', description: 'جدولة وإدارة الجلسات' },
    { title: 'إصدار الشهادات', path: '/supervisor/certificates', description: 'إنشاء وإصدار الشهادات' },
    { title: 'التقارير', path: '/supervisor/reports', description: 'تقارير الأداء والتقدم' },
  ],
  admin: [
    { title: 'لوحة الإدارة', path: '/admin', description: 'إدارة شاملة للنظام' },
    { title: 'المستخدمون', path: '/admin/users', description: 'إدارة جميع المستخدمين' },
    { title: 'الدورات', path: '/admin/courses', description: 'إدارة الدورات التعليمية' },
    { title: 'الرحلات', path: '/admin/trips', description: 'إدارة الرحلات التعليمية' },
    { title: 'المشرفين', path: '/admin/supervisors', description: 'إدارة المشرفين والأذونات' },
    { title: 'النظام', path: '/admin/system', description: 'إعدادات النظام والأمان' },
  ]
};

export function RoleBasedNav() {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-green-800">
              بستان الإيمان
            </CardTitle>
            <p className="text-gray-600">منصة تعليم القرآن الكريم</p>
          </CardHeader>
          
          <CardContent className="text-center space-y-4">
            <p className="text-gray-700">يجب تسجيل الدخول للوصول إلى المحتوى</p>
            
            <div className="space-y-3">
              <Button 
                onClick={() => window.location.href = '/auth'} 
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                تسجيل الدخول
              </Button>
              
              <Button 
                onClick={() => window.location.href = '/auth'} 
                variant="outline"
                className="w-full border-green-600 text-green-600 hover:bg-green-50"
              >
                إنشاء حساب جديد
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const navigation = roleNavigation[user.role] || [];
  const roleTitle = {
    student: 'طالب',
    supervisor: 'مشرف',
    admin: 'مدير'
  }[user.role];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-green-800">بستان الإيمان</h1>
            </div>
            
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="text-right">
                <p className="text-sm text-gray-600">مرحباً</p>
                <p className="font-medium text-gray-900">
                  {user.firstName} {user.lastName} ({roleTitle})
                </p>
              </div>
              
              <Button
                onClick={logout}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            مرحباً {user.firstName}
          </h2>
          <p className="text-gray-600">
            اختر من القائمة أدناه للبدء في رحلتك التعليمية
          </p>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {navigation.map((item, index) => (
            <Card 
              key={index} 
              className="hover:shadow-lg transition-shadow duration-200 cursor-pointer group"
              onClick={() => window.location.href = item.path}
            >
              <CardHeader>
                <CardTitle className="text-xl text-green-800 group-hover:text-green-900">
                  {item.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-600">{item.description}</p>
                
                <Button 
                  className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = item.path;
                  }}
                >
                  الدخول
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Stats for Students */}
        {user.role === 'student' && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600">
                  {user.currentLevel || 'مبتدئ'}
                </p>
                <p className="text-sm text-gray-600">المستوى الحالي</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600">
                  {user.memorizedSurahs ? JSON.parse(user.memorizedSurahs).length : 0}
                </p>
                <p className="text-sm text-gray-600">السور المحفوظة</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600">
                  نشط
                </p>
                <p className="text-sm text-gray-600">حالة الحساب</p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}