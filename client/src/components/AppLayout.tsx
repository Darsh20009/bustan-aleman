import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from './ui/button';
import { MoreVertical, ShoppingCart } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from './ui/dropdown-menu';
import { useLocation } from 'wouter';
import { Home, BookOpen, GraduationCap, Settings, LogOut } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
  onNavigate?: (path: string) => void;
}

export function AppLayout({ children, onNavigate }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleNavigation = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      setLocation(path.startsWith('/') ? path : `/${path}`);
    }
  };

  const handleLogout = () => {
    logout();
    setLocation('/');
  };

  // Show header only when authenticated
  if (!user) {
    return <>{children}</>;
  }

  const roleTitle = {
    student: 'طالب',
    supervisor: 'مشرف',
    admin: 'مدير'
  }[user.role];

  const navigationItems = [
    { title: 'الرئيسية', path: 'dashboard', icon: Home, gradient: 'from-blue-500 to-cyan-500' },
    { title: 'المصحف الإلكتروني', path: 'quran', icon: BookOpen, gradient: 'from-emerald-500 to-teal-500' },
    { title: 'الدورات', path: 'my-courses', icon: GraduationCap, gradient: 'from-orange-500 to-red-500' },
    { title: 'الإعدادات', path: 'profile', icon: Settings, gradient: 'from-purple-500 to-pink-500' },
  ];

  return (
    <div>
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm shadow-sm border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <img 
                src="/logo.png" 
                alt="بستان الإيمان" 
                className="h-12 w-auto object-contain"
              />
            </div>
            
            {/* Right Section */}
            <div className="flex items-center gap-2">
              {/* User Info */}
              <div className="text-right hidden sm:block">
                <p className="text-sm text-gray-600">مرحباً</p>
                <p className="font-medium text-gray-900">
                  {user.firstName} {user.lastName} ({roleTitle})
                </p>
              </div>
              
              {/* Shopping Cart for Students */}
              {user.role === 'student' && (
                <Button
                  onClick={() => handleNavigation('/subscriptions')}
                  variant="ghost"
                  size="icon"
                  className="relative text-emerald-600 hover:bg-emerald-50"
                  data-testid="button-shopping-cart"
                >
                  <ShoppingCart className="w-5 h-5" />
                </Button>
              )}
              
              {/* Navigation Menu */}
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
                <DropdownMenuContent align="end" className="w-72 max-h-96 overflow-y-auto">
                  <DropdownMenuLabel className="text-right font-bold">
                    القائمة الرئيسية
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuGroup>
                    {navigationItems.map((item, index) => {
                      const Icon = item.icon;
                      return (
                        <DropdownMenuItem
                          key={index}
                          onClick={() => handleNavigation(item.path)}
                          className="cursor-pointer"
                          data-testid={`dropdown-nav-${index}`}
                        >
                          <div className="flex items-center gap-3 w-full text-right">
                            <div className={`flex-shrink-0 w-8 h-8 bg-gradient-to-br ${item.gradient} rounded-lg flex items-center justify-center`}>
                              <Icon className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-medium">{item.title}</span>
                          </div>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Logout Button */}
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
                data-testid="button-logout"
              >
                <span className="hidden sm:inline">تسجيل الخروج</span>
                <span className="sm:hidden">خروج</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      {children}
    </div>
  );
}
