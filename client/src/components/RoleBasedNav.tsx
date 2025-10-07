import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { BookOpen, GraduationCap, Award, MapPin, Bell, BookMarked } from 'lucide-react';

interface NavItem {
  title: string;
  path: string;
  description: string;
  icon: React.ComponentType<any>;
  gradient: string;
}

const roleNavigation = {
  student: [
    { 
      title: 'لوحة التحكم', 
      path: '/dashboard', 
      description: 'عرض التقدم والجلسات', 
      icon: BookMarked,
      gradient: 'from-emerald-500 to-teal-500'
    },
    { 
      title: 'المصحف التفاعلي', 
      path: '/quran', 
      description: 'قراءة القرآن مع الملاحظات والتفسير', 
      icon: BookOpen,
      gradient: 'from-blue-500 to-cyan-500'
    },
    { 
      title: 'استكشف الدورات', 
      path: '/courses', 
      description: 'تصفح واستكشف الدورات المتاحة', 
      icon: GraduationCap,
      gradient: 'from-purple-500 to-pink-500'
    },
    { 
      title: 'الرحلات التعليمية', 
      path: '/trips', 
      description: 'رحلات دينية وتعليمية ملهمة', 
      icon: MapPin,
      gradient: 'from-amber-500 to-orange-500'
    },
    { 
      title: 'شهاداتي', 
      path: '/certificates', 
      description: 'شهادات الإنجاز والتقدير', 
      icon: Award,
      gradient: 'from-rose-500 to-red-500'
    },
    { 
      title: 'الإعلانات والأخبار', 
      path: '/announcements', 
      description: 'آخر الأخبار والإعلانات من المشرف', 
      icon: Bell,
      gradient: 'from-indigo-500 to-violet-500'
    },
  ],
  supervisor: [
    { 
      title: 'لوحة المشرف', 
      path: '/supervisor', 
      description: 'إدارة الطلاب والجلسات', 
      icon: BookMarked,
      gradient: 'from-emerald-500 to-teal-500'
    },
    { 
      title: 'الطلاب', 
      path: '/supervisor/students', 
      description: 'متابعة تقدم الطلاب', 
      icon: GraduationCap,
      gradient: 'from-blue-500 to-cyan-500'
    },
    { 
      title: 'الجلسات', 
      path: '/supervisor/sessions', 
      description: 'جدولة وإدارة الجلسات', 
      icon: BookOpen,
      gradient: 'from-purple-500 to-pink-500'
    },
    { 
      title: 'إصدار الشهادات', 
      path: '/supervisor/certificates', 
      description: 'إنشاء وإصدار الشهادات', 
      icon: Award,
      gradient: 'from-amber-500 to-orange-500'
    },
    { 
      title: 'التقارير', 
      path: '/supervisor/reports', 
      description: 'تقارير الأداء والتقدم', 
      icon: BookMarked,
      gradient: 'from-rose-500 to-red-500'
    },
  ],
  admin: [
    { 
      title: 'لوحة الإدارة', 
      path: '/admin', 
      description: 'إدارة شاملة للنظام', 
      icon: BookMarked,
      gradient: 'from-emerald-500 to-teal-500'
    },
    { 
      title: 'المستخدمون', 
      path: '/admin/users', 
      description: 'إدارة جميع المستخدمين', 
      icon: GraduationCap,
      gradient: 'from-blue-500 to-cyan-500'
    },
    { 
      title: 'الدورات', 
      path: '/admin/courses', 
      description: 'إدارة الدورات التعليمية', 
      icon: BookOpen,
      gradient: 'from-purple-500 to-pink-500'
    },
    { 
      title: 'الرحلات', 
      path: '/admin/trips', 
      description: 'إدارة الرحلات التعليمية', 
      icon: MapPin,
      gradient: 'from-amber-500 to-orange-500'
    },
    { 
      title: 'المشرفين', 
      path: '/admin/supervisors', 
      description: 'إدارة المشرفين والأذونات', 
      icon: Award,
      gradient: 'from-rose-500 to-red-500'
    },
    { 
      title: 'النظام', 
      path: '/admin/system', 
      description: 'إعدادات النظام والأمان', 
      icon: Bell,
      gradient: 'from-indigo-500 to-violet-500'
    },
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mr-3">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">بستان الإيمان</h1>
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
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-3">
            مرحباً {user.firstName} 🌟
          </h2>
          <p className="text-gray-600 text-lg">
            ابدأ رحلتك التعليمية المباركة من هنا
          </p>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {navigation.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card 
                key={index} 
                className="group relative overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer border-0 bg-white/80 backdrop-blur-sm hover:scale-105"
                onClick={() => window.location.href = item.path}
                data-testid={`nav-card-${index}`}
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${item.gradient} opacity-10 group-hover:opacity-20 transition-opacity rounded-full -mr-16 -mt-16`}></div>
                
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl text-gray-800 group-hover:text-gray-900 mb-2">
                        {item.title}
                      </CardTitle>
                    </div>
                    <div className={`w-12 h-12 bg-gradient-to-br ${item.gradient} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-gray-600 mb-4">{item.description}</p>
                  
                  <Button 
                    className={`w-full bg-gradient-to-r ${item.gradient} hover:opacity-90 text-white shadow-md`}
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = item.path;
                    }}
                    data-testid={`button-nav-${index}`}
                  >
                    انطلق الآن
                  </Button>
                </CardContent>
              </Card>
            );
          })}
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