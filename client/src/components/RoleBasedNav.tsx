import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { BookOpen, GraduationCap, Award, MapPin, Bell, BookMarked, User, Calendar, Star, TrendingUp, Trophy, Sparkles } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { SheikhDashboard } from './SheikhDashboard';
import { SupervisorDashboard } from './SupervisorDashboard';

interface NavItem {
  title: string;
  path: string;
  description: string;
  icon: React.ComponentType<any>;
  gradient: string;
}

// Helper function to safely parse memorized surahs
function getSafeMemorizedSurahs(memorizedSurahs: string | null | undefined): number {
  if (!memorizedSurahs) return 0;
  try {
    const parsed = JSON.parse(memorizedSurahs);
    return Array.isArray(parsed) ? parsed.length : 0;
  } catch {
    return 0;
  }
}

// Student Profile Header Component
function StudentProfileHeader({ user, onNavigate }: { user: any; onNavigate: (path: string) => void }) {
  const { data: announcements = [] } = useQuery({
    queryKey: ['/api/announcements', { limit: 3, role: 'student' }],
  });

  const { data: myCourses = [] } = useQuery({
    queryKey: ['/api/my-courses'],
  });

  const calculateAge = () => {
    if (!user.age) return 'غير محدد';
    return `${user.age} سنة`;
  };

  const memorizedSurahsCount = React.useMemo(() => getSafeMemorizedSurahs(user.memorizedSurahs), [user.memorizedSurahs]);
  
  const activeCourses = Array.isArray(myCourses) ? myCourses.filter((c: any) => c.status === 'active' || c.status === 'enrolled') : [];
  const completedCourses = Array.isArray(myCourses) ? myCourses.filter((c: any) => c.status === 'completed') : [];

  return (
    <div className="mb-8 space-y-6">
      {/* Welcome Banner with Profile */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
        
        <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Profile Avatar */}
          <div className="relative">
            <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-xl">
              <User className="w-12 h-12 text-emerald-600" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-yellow-400 rounded-full p-2 shadow-lg">
              <Star className="w-5 h-5 text-white fill-current" />
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-white">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl md:text-4xl font-bold">
                {user.firstName} {user.lastName}
              </h2>
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                <Sparkles className="w-3 h-3 ml-1" />
                طالب نشط
              </Badge>
            </div>
            
            <div className="flex flex-wrap gap-4 text-white/90 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>العمر: {calculateAge()}</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>المستوى: {user.currentLevel || 'مبتدئ'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                <span>السور المحفوظة: {memorizedSurahsCount}</span>
              </div>
            </div>

            <p className="text-white/80 text-lg">
              استمر في رحلتك المباركة في تعلم القرآن الكريم 🌟
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col gap-2">
            <Button 
              onClick={() => onNavigate('quran')}
              className="bg-white text-emerald-600 hover:bg-white/90"
              data-testid="button-quick-quran"
            >
              <BookOpen className="w-4 h-4 ml-2" />
              المصحف
            </Button>
            <Button 
              onClick={() => onNavigate('certificates')}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              variant="outline"
              data-testid="button-quick-certificates"
            >
              <Award className="w-4 h-4 ml-2" />
              شهاداتي
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <p className="text-3xl font-bold text-blue-700 mb-1">
              {activeCourses.length}
            </p>
            <p className="text-sm text-blue-600">دورات نشطة</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <p className="text-3xl font-bold text-green-700 mb-1">
              {completedCourses.length}
            </p>
            <p className="text-sm text-green-600">دورات مكتملة</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Star className="w-6 h-6 text-white" />
            </div>
            <p className="text-3xl font-bold text-purple-700 mb-1">
              {memorizedSurahsCount}
            </p>
            <p className="text-sm text-purple-600">سورة محفوظة</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Award className="w-6 h-6 text-white" />
            </div>
            <p className="text-3xl font-bold text-amber-700 mb-1">
              {user.currentLevel || 'مبتدئ'}
            </p>
            <p className="text-sm text-amber-600">المستوى الحالي</p>
          </CardContent>
        </Card>
      </div>

      {/* Latest Announcements */}
      {Array.isArray(announcements) && announcements.length > 0 && (
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4">
            <div className="flex items-center gap-2 text-white">
              <Bell className="w-5 h-5" />
              <h3 className="text-lg font-bold">آخر الأخبار والإعلانات</h3>
            </div>
          </div>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-200">
              {announcements.slice(0, 3).map((announcement: any, index: number) => (
                <div 
                  key={index} 
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => onNavigate('announcements')}
                  data-testid={`announcement-${index}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {announcement.titleAr || announcement.title || 'إعلان جديد'}
                      </h4>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {announcement.contentAr || announcement.content || ''}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {announcement.createdAt ? new Date(announcement.createdAt).toLocaleDateString('ar-SA') : ''}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-gray-50 text-center">
              <Button 
                onClick={() => onNavigate('announcements')}
                variant="link"
                className="text-indigo-600"
                data-testid="button-view-all-announcements"
              >
                عرض جميع الإعلانات ←
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
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

export function RoleBasedNav({ onNavigate }: { onNavigate?: (path: string) => void } = {}) {
  const { user, logout, isLoading } = useAuth();
  
  // Default navigation handler using window.location if none provided
  const handleNavigation = onNavigate || ((path: string) => {
    // Ensure path has leading slash for URL navigation
    const fullPath = path.startsWith('/') ? path : `/${path}`;
    window.location.href = fullPath;
  });

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
        {/* Student Profile Section - Only for students */}
        {user.role === 'student' && (
          <StudentProfileHeader user={user} onNavigate={handleNavigation} />
        )}

        {/* Supervisor/Sheikh Dashboard */}
        {(user.role === 'supervisor' || user.role === 'teacher') && (
          <div className="mb-8">
            <SheikhDashboard />
          </div>
        )}

        {user.role === 'admin' && (
          <div className="mb-8">
            <SupervisorDashboard />
          </div>
        )}

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {navigation.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card 
                key={index} 
                className="group relative overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer border-0 bg-white/80 backdrop-blur-sm hover:scale-105"
                onClick={() => {
                  const path = item.path.startsWith('/') ? item.path.substring(1) : item.path;
                  handleNavigation(path);
                }}
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
                      const path = item.path.startsWith('/') ? item.path.substring(1) : item.path;
                      handleNavigation(path);
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

      </main>
    </div>
  );
}