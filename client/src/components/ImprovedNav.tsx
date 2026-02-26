import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/button';
import { BookOpen, LogOut, Menu, X, ChevronDown, Bell, User } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { useQuery } from '@tanstack/react-query';
import bustanLogo from "@assets/bustan aleman logo_1762998406195.png";

interface ImprovedNavProps {
  onNavigate: (path: string) => void;
}

const studentMenuItems = [
  { label: 'حصتي', path: 'my-session', icon: '📚' },
  { label: 'المصحف التفاعلي', path: 'quran', icon: '📖' },
  { label: 'ملاحظاتي', path: 'my-notes', icon: '📝' },
  { label: 'الدورات', path: 'courses', icon: '🎓' },
  { label: 'التذكيرات', path: '/reminders', icon: '🔔' },
  { label: 'الرحلات', path: 'trips', icon: '✈️' },
  { label: 'شهاداتي', path: 'certificates', icon: '🏆' },
  { label: 'الإعلانات', path: 'announcements', icon: '📢' },
];

const supervisorMenuItems = [
  { label: 'لوحة المشرف', path: '/supervisor', icon: '📊' },
  { label: 'الطلاب', path: '/supervisor/students', icon: '👨‍🎓' },
  { label: 'جدول الحصص', path: '/sheikh-schedule', icon: '📅' },
  { label: 'إنشاء دورة', path: '/supervisor/create-course', icon: '➕' },
  { label: 'إدارة الدورات', path: '/supervisor/courses', icon: '📚' },
  { label: 'التحويلات البنكية', path: '/admin/bank-transfers', icon: '🏦' },
  { label: 'إصدار الشهادات', path: '/supervisor/certificates', icon: '🎖️' },
  { label: 'التقارير', path: '/supervisor/reports', icon: '📈' },
];

const adminMenuItems = [
  { label: 'لوحة الإدارة', path: '/admin', icon: '⚙️' },
  { label: 'المستخدمون', path: '/admin/users', icon: '👥' },
  { label: 'الدورات', path: '/admin/courses', icon: '📚' },
  { label: 'الرحلات', path: '/admin/trips', icon: '✈️' },
  { label: 'التحويلات البنكية', path: '/admin/bank-transfers', icon: '🏦' },
  { label: 'المشرفين', path: '/admin/supervisors', icon: '👨‍💼' },
  { label: 'النظام', path: '/admin/system', icon: '🔧' },
];

export function ImprovedNav({ onNavigate }: ImprovedNavProps) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: notifications = [] } = useQuery({
    queryKey: ['/api/notifications'],
    enabled: !!user,
  });

  const unreadCount = Array.isArray(notifications) 
    ? notifications.filter((n: any) => !n.isRead).length 
    : 0;

  if (!user) return null;

  const menuItems = user.role === 'student' 
    ? studentMenuItems 
    : user.role === 'supervisor' 
    ? supervisorMenuItems 
    : adminMenuItems;

  const roleTitle = ({
    student: 'طالب',
    supervisor: 'مشرف',
    admin: 'مدير',
    owner: 'مالك',
    teacher: 'معلم'
  } as Record<string, string>)[user.role];

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            data-testid="button-logo"
          >
            <img 
              src={bustanLogo} 
              alt="بستان الإيمان" 
              className="h-12 w-auto object-contain"
            />
          </button>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            {/* Quick Dashboard Button */}
            <Button
              variant="ghost"
              onClick={() => onNavigate('dashboard')}
              data-testid="button-dashboard"
            >
              الرئيسية
            </Button>

            {/* Menu Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2" data-testid="button-menu">
                  <Menu className="w-4 h-4" />
                  القائمة
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {menuItems.map((item, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={() => {
                      const path = item.path.startsWith('/') ? item.path.substring(1) : item.path;
                      onNavigate(path);
                    }}
                    className="cursor-pointer"
                    data-testid={`menu-item-${index}`}
                  >
                    <span className="ml-2">{item.icon}</span>
                    {item.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => onNavigate('notifications')}
              data-testid="button-notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500">
                  {unreadCount}
                </Badge>
              )}
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2" data-testid="button-user-menu">
                  <User className="w-4 h-4" />
                  <span className="hidden lg:inline">
                    {user.firstName} ({roleTitle})
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onNavigate('profile')} data-testid="menu-item-profile">
                  الملف الشخصي
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600" data-testid="menu-item-logout">
                  <LogOut className="w-4 h-4 ml-2" />
                  تسجيل الخروج
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {/* Mobile Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => onNavigate('notifications')}
              data-testid="button-notifications-mobile"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </Button>

            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col h-full">
                  {/* User Info */}
                  <div className="mb-6 pb-4 border-b">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-bold">{user.firstName} {user.lastName}</p>
                        <p className="text-sm text-gray-500">{roleTitle}</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="flex-1 overflow-y-auto">
                    <div className="space-y-2">
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => {
                          onNavigate('dashboard');
                          setMobileMenuOpen(false);
                        }}
                        data-testid="mobile-menu-dashboard"
                      >
                        🏠 الرئيسية
                      </Button>

                      {menuItems.map((item, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => {
                            const path = item.path.startsWith('/') ? item.path.substring(1) : item.path;
                            onNavigate(path);
                            setMobileMenuOpen(false);
                          }}
                          data-testid={`mobile-menu-item-${index}`}
                        >
                          <span className="ml-2">{item.icon}</span>
                          {item.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Logout Button */}
                  <div className="pt-4 border-t">
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      data-testid="mobile-menu-logout"
                    >
                      <LogOut className="w-4 h-4 ml-2" />
                      تسجيل الخروج
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
