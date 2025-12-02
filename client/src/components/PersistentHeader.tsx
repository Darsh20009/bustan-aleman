import React from 'react';
import { Button } from './ui/button';
import { useAuth } from '../hooks/useAuth';
import { MoreVertical, ShoppingCart, LogOut } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from './ui/dropdown-menu';
import { BookMarked, GraduationCap, Brain, Calendar, Award, MapPin, TrendingUp, Sparkles, Trophy, Bell, User, BookOpen } from 'lucide-react';
import { LanguageToggle } from './LanguageToggle';
import { useLanguage } from '../contexts/LanguageContext';

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
      description: 'استكشف الرحلات التعليمية المتاحة', 
      icon: MapPin,
      gradient: 'from-red-500 to-orange-500'
    },
    { 
      title: 'إحصائيات القراءة', 
      path: 'quran-stats', 
      description: 'احصائيات تقدمك في القراءة', 
      icon: TrendingUp,
      gradient: 'from-blue-600 to-blue-500'
    },
    { 
      title: 'متابعة الحفظ', 
      path: 'memorization', 
      description: 'متابعة تقدم الحفظ', 
      icon: Brain,
      gradient: 'from-purple-600 to-purple-500'
    },
    { 
      title: 'الشهادات', 
      path: '/certificates', 
      description: 'عرض الشهادات المكتسبة', 
      icon: Award,
      gradient: 'from-amber-500 to-orange-500'
    },
    { 
      title: 'اختبار القرآن', 
      path: 'quran-test', 
      description: 'اختبارات القرآن التفاعلية', 
      icon: Sparkles,
      gradient: 'from-indigo-500 to-purple-500'
    },
    { 
      title: 'الحديث الشريف', 
      path: 'hadith', 
      description: 'تصفح الأحاديث الشريفة', 
      icon: BookMarked,
      gradient: 'from-rose-500 to-pink-500'
    },
    { 
      title: 'اختبار ذاتي', 
      path: 'quran-self-test', 
      description: 'اختبر نفسك في القرآن الكريم', 
      icon: Trophy,
      gradient: 'from-cyan-500 to-blue-500'
    },
    { 
      title: 'المشتريات', 
      path: 'subscriptions', 
      description: 'إدارة اشتراكاتك', 
      icon: Bell,
      gradient: 'from-green-500 to-teal-500'
    },
    { 
      title: 'إخطاراتي', 
      path: 'notifications', 
      description: 'اطلع على الإخطارات', 
      icon: Bell,
      gradient: 'from-yellow-500 to-amber-500'
    },
  ],
  supervisor: [
    { 
      title: 'لوحة التحكم', 
      path: '/dashboard', 
      description: 'عرض لوحة التحكم', 
      icon: BookMarked,
      gradient: 'from-emerald-500 to-teal-500'
    },
    { 
      title: 'جدول الحصص', 
      path: 'sheikh-schedule', 
      description: 'إدارة جدول الحصص الدراسية', 
      icon: Calendar,
      gradient: 'from-blue-500 to-cyan-500'
    },
    { 
      title: 'تحرير القرآن', 
      path: 'sheikh-quran-editing', 
      description: 'تحرير وإدارة محتوى القرآن', 
      icon: BookOpen,
      gradient: 'from-purple-500 to-pink-500'
    },
    { 
      title: 'أخطاء الطلاب', 
      path: 'sheikh-errors', 
      description: 'متابعة أخطاء الطلاب', 
      icon: TrendingUp,
      gradient: 'from-red-500 to-orange-500'
    },
    { 
      title: 'إدارة البيانات', 
      path: 'data-management', 
      description: 'إدارة البيانات والمعلومات', 
      icon: Brain,
      gradient: 'from-amber-500 to-yellow-500'
    },
    { 
      title: 'إخطاراتي', 
      path: 'notifications', 
      description: 'اطلع على الإخطارات', 
      icon: Bell,
      gradient: 'from-yellow-500 to-amber-500'
    },
  ],
  admin: [
    { 
      title: 'لوحة التحكم', 
      path: '/dashboard', 
      description: 'عرض لوحة التحكم الإدارية', 
      icon: BookMarked,
      gradient: 'from-emerald-500 to-teal-500'
    },
    { 
      title: 'إنشاء دورة', 
      path: 'create-course', 
      description: 'إنشاء دورات جديدة', 
      icon: BookOpen,
      gradient: 'from-blue-500 to-cyan-500'
    },
    { 
      title: 'إدارة الدورات', 
      path: 'course-management', 
      description: 'إدارة الدورات الموجودة', 
      icon: GraduationCap,
      gradient: 'from-purple-500 to-pink-500'
    },
    { 
      title: 'الطلاب والدورات', 
      path: 'course-students', 
      description: 'إدارة تسجيل الطلاب في الدورات', 
      icon: User,
      gradient: 'from-green-500 to-emerald-500'
    },
    { 
      title: 'إدارة الدفعات', 
      path: 'payments', 
      description: 'إدارة الدفعات والفواتير', 
      icon: Award,
      gradient: 'from-amber-500 to-orange-500'
    },
    { 
      title: 'إدارة التسجيل', 
      path: 'enrollments', 
      description: 'إدارة التسجيل والالتحاق', 
      icon: BookMarked,
      gradient: 'from-red-500 to-pink-500'
    },
    { 
      title: 'إدارة البيانات', 
      path: 'data-management', 
      description: 'إدارة البيانات الشاملة', 
      icon: Brain,
      gradient: 'from-cyan-500 to-blue-500'
    },
    { 
      title: 'إخطاراتي', 
      path: 'notifications', 
      description: 'اطلع على الإخطارات', 
      icon: Bell,
      gradient: 'from-yellow-500 to-amber-500'
    },
  ],
};

interface PersistentHeaderProps {
  onNavigate?: (path: string) => void;
}

export function PersistentHeader({ onNavigate }: PersistentHeaderProps) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
  };

  const navigation = roleNavigation[user.role] || [];
  const roleTitle = {
    student: 'طالب',
    supervisor: 'مشرف',
    admin: 'مدير'
  }[user.role];

  // Fetch cart items to show count
  const { data: cartItems = [] } = useQuery<any[]>({
    queryKey: ['/api/cart/full'],
    enabled: user.role === 'student'
  });

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm shadow-sm border-b border-emerald-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-[#083530]">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <img 
              src="/logo.png" 
              alt="بستان الإيمان" 
              className="h-12 w-auto object-contain"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <p className="text-sm text-gray-600">مرحباً</p>
              <p className="font-medium text-gray-900">
                {user.firstName} {user.lastName} ({roleTitle})
              </p>
            </div>
            
            {/* Shopping Cart for Students */}
            {user.role === 'student' && (
              <Button
                onClick={() => onNavigate?.('cart')}
                variant="ghost"
                size="icon"
                className="relative text-emerald-600 hover:bg-emerald-50"
                data-testid="button-shopping-cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {cartItems.length}
                  </span>
                )}
              </Button>
            )}
            
            {/* Dropdown Menu for Navigation */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                  data-testid="button-main-menu"
                >
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 max-h-96 overflow-y-auto text-[#23252f] bg-[#18ad7e]">
                <DropdownMenuLabel className="text-right text-emerald-700 font-bold">
                  القائمة الرئيسية
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Navigation Items */}
                <DropdownMenuGroup>
                  {navigation
                    .map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <DropdownMenuItem
                          key={index}
                          onClick={() => {
                            onNavigate?.(item.path);
                          }}
                          className="cursor-pointer hover:bg-emerald-50 focus:bg-emerald-50"
                          data-testid={`dropdown-nav-${index}`}
                        >
                          <div className="flex items-center gap-3 w-full text-right">
                            <div className={`flex-shrink-0 w-8 h-8 bg-gradient-to-br ${item.gradient} rounded-lg flex items-center justify-center`}>
                              <Icon className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-800">{item.title}</div>
                              <div className="text-xs text-gray-500">{item.description}</div>
                            </div>
                          </div>
                        </DropdownMenuItem>
                      );
                    })}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <LanguageToggle />
            
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
              data-testid="button-logout"
            >
              <span className="hidden sm:inline">{t('common.logout')}</span>
              <span className="sm:hidden">{t('common.logout')}</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
