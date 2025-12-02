import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { BookOpen, GraduationCap, Award, MapPin, Bell, BookMarked, User, Calendar, Star, TrendingUp, Trophy, Sparkles, MoreVertical, ShoppingCart, Brain, ClipboardList } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { SheikhDashboard } from './SheikhDashboard';
import { SupervisorDashboard } from './SupervisorDashboard';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from './ui/dropdown-menu';

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
              استمر في رحلتك المباركة في تعلم القرآن الكريم
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
              onClick={() => onNavigate('my-notes')}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              variant="outline"
              data-testid="button-quick-my-notes"
            >
              <BookMarked className="w-4 h-4 ml-2" />
              ملاحظاتي
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
      title: 'حصتي', 
      path: 'my-session', 
      description: 'الحصص المباشرة والتكاليف اليومية', 
      icon: BookOpen,
      gradient: 'from-green-500 to-emerald-500'
    },
    { 
      title: 'المصحف التفاعلي', 
      path: '/quran', 
      description: 'قراءة القرآن مع الملاحظات والتفسير', 
      icon: BookOpen,
      gradient: 'from-blue-500 to-cyan-500'
    },
    { 
      title: 'ملاحظاتي', 
      path: 'my-notes', 
      description: 'إدارة ملاحظاتك على آيات القرآن', 
      icon: BookMarked,
      gradient: 'from-teal-500 to-cyan-500'
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
    { 
      title: 'اختبر نفسك في القرآن', 
      path: '/quran-self-test', 
      description: 'اختبر حفظك من خلال الآيات مع الصور', 
      icon: Brain,
      gradient: 'from-cyan-500 to-blue-500'
    },
    { 
      title: 'واجباتي', 
      path: 'homework', 
      description: 'عرض ومتابعة الواجبات والتكاليف', 
      icon: ClipboardList,
      gradient: 'from-violet-500 to-purple-500'
    },
    { 
      title: 'خطط الاشتراك', 
      path: '/subscriptions', 
      description: 'اختر خطتك واشترك في المنصة', 
      icon: ShoppingCart,
      gradient: 'from-orange-500 to-red-500'
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
      title: 'إنشاء دورة جديدة', 
      path: '/create-course', 
      description: 'إضافة دورة تعليمية جديدة للطلاب', 
      icon: BookOpen,
      gradient: 'from-green-500 to-emerald-500'
    },
    { 
      title: 'إدارة جدول الحصص', 
      path: '/sheikh-schedule', 
      description: 'إدارة المواعيد الأسبوعية للحصص المباشرة', 
      icon: Calendar,
      gradient: 'from-indigo-500 to-purple-600'
    },
    { 
      title: 'تتبع أخطاء التلاوة', 
      path: '/sheikh-quran-editing', 
      description: 'تسجيل أخطاء التلاوة والتجويد للطلاب', 
      icon: BookOpen,
      gradient: 'from-purple-500 to-pink-500'
    },
    { 
      title: 'إدارة الواجبات', 
      path: 'homework', 
      description: 'إنشاء وتتبع واجبات الطلاب', 
      icon: ClipboardList,
      gradient: 'from-violet-500 to-purple-500'
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
  const [activeRoomId, setActiveRoomId] = React.useState<string | null>(null);
  
  // Default navigation handler - normalizes paths before navigation
  const handleNavigation = (path: string) => {
    // Ensure path has leading slash for URL navigation
    const fullPath = path.startsWith('/') ? path : `/${path}`;
    
    if (onNavigate) {
      onNavigate(fullPath);
    } else {
      window.location.href = fullPath;
    }
  };

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

  // إذا كانت هناك حصة نشطة، لا نعرض القائمة
  if (activeRoomId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Student Profile Section - Only for students */}
        {user.role === 'student' && (
          <StudentProfileHeader user={user} onNavigate={handleNavigation} />
        )}

        {/* Supervisor/Sheikh Dashboard */}
        {user.role === 'supervisor' && (
          <div className="mb-8">
            <SheikhDashboard />
          </div>
        )}

        {user.role === 'admin' && (
          <div className="mb-8">
            <SupervisorDashboard />
          </div>
        )}

        {/* Responsive Navigation - Mobile: Horizontal Grid, Desktop: Sidebar */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block lg:w-80 lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)] bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
            {/* Sidebar Header */}
            <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <BookMarked className="w-6 h-6 text-white" />
                </div>
                القائمة الرئيسية
              </h2>
              <p className="text-white/80 mt-2 text-sm">اختر القسم المطلوب</p>
            </div>

            {/* Sidebar Navigation */}
            <nav className="p-4 overflow-y-auto h-[calc(100%-120px)]">
              <div className="space-y-2">
                {navigation.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        handleNavigation(item.path);
                      }}
                      className="group relative w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-white hover:from-white hover:to-emerald-50 border border-gray-200 hover:border-emerald-400 transition-all duration-300 hover:shadow-md"
                      data-testid={`nav-item-${index}`}
                    >
                      {/* Icon */}
                      <div className={`relative flex-shrink-0 w-11 h-11 bg-gradient-to-br ${item.gradient} rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 text-right">
                        <h3 className="text-sm font-bold text-gray-800 group-hover:text-emerald-700 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors line-clamp-1">
                          {item.description}
                        </p>
                      </div>

                      {/* Arrow */}
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 group-hover:bg-emerald-500 flex items-center justify-center transition-all duration-300">
                        <svg 
                          className="w-3 h-3 text-emerald-600 group-hover:text-white transition-colors" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </div>

                      {/* Hover Effect */}
                      <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300`}></div>
                    </button>
                  );
                })}
              </div>
            </nav>
          </aside>

          

          {/* Main Content Area (for desktop) */}
          <div className="hidden lg:block flex-1 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8">
            <div className="text-center py-12">
              <img 
                src="/logo.png" 
                alt="بستان الإيمان" 
                className="h-32 w-auto object-contain mx-auto mb-4"
              />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">مرحباً بك في بستان الإيمان</h3>
              <p className="text-gray-600 mb-6">اختر من القائمة الجانبية للبدء</p>
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 max-w-md mx-auto">
                <p className="text-sm text-gray-700 flex items-center justify-center gap-2">
                  <BookMarked className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold">نصيحة:</span>
                  <span>استخدم القائمة الجانبية للوصول السريع إلى جميع أقسام المنصة</span>
                </p>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}