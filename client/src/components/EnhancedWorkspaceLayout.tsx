import { ReactNode, useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Menu, 
  Home, 
  BarChart3, 
  Settings,
  X,
  ChevronLeft,
  ChevronRight,
  BookMarked,
  Trophy,
  Calendar
} from 'lucide-react';
import { useLocation } from 'wouter';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface EnhancedWorkspaceLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
  rightPanel?: ReactNode;
  showSidebarToggle?: boolean;
}

export function EnhancedWorkspaceLayout({ 
  children, 
  sidebar, 
  rightPanel,
  showSidebarToggle = true
}: EnhancedWorkspaceLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('leftSidebarCollapsed');
    return saved === 'true';
  });
  const [location, setLocation] = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    localStorage.setItem('leftSidebarCollapsed', leftSidebarCollapsed.toString());
  }, [leftSidebarCollapsed]);

  const mainNavItems = [
    { icon: Home, label: 'الرئيسية', path: '/' },
    { icon: BookOpen, label: 'القرآن', path: '/quran' },
    { icon: BookMarked, label: 'الحفظ', path: '/memorization' },
    { icon: Trophy, label: 'التقدم', path: '/progress' },
    { icon: Calendar, label: 'الجدول', path: '/schedule' },
    { icon: Settings, label: 'الإعدادات', path: '/settings' },
  ];

  return (
    <div className="h-screen flex flex-col bg-background dark:bg-gray-950 overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
        <div className="flex h-16 items-center px-4 gap-4">
          {/* Mobile Menu Toggle */}
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                data-testid="button-mobile-menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-0">
              {sidebar || (
                <div className="p-6">
                  <h3 className="font-bold text-lg mb-4">القائمة</h3>
                  <div className="space-y-2">
                    {mainNavItems.map((item) => (
                      <Button
                        key={item.path}
                        variant={location === item.path ? 'default' : 'ghost'}
                        className="w-full justify-start"
                        onClick={() => {
                          setLocation(item.path);
                          setSidebarOpen(false);
                        }}
                      >
                        <item.icon className="ml-2 h-4 w-4" />
                        {item.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </SheetContent>
          </Sheet>

          {/* Desktop Sidebar Toggle */}
          {showSidebarToggle && sidebar && (
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex"
              onClick={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
              data-testid="button-toggle-sidebar"
            >
              {leftSidebarCollapsed ? (
                <ChevronLeft className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </Button>
          )}

          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer flex-shrink-0"
            onClick={() => setLocation('/')}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 dark:from-emerald-500 dark:to-teal-500 rounded-full flex items-center justify-center shadow-lg">
              <BookOpen className="text-white" size={20} />
            </div>
            <span className="hidden sm:block text-xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent font-arabic-serif">
              بستان الإيمان
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex flex-1 items-center gap-1 mx-6">
            {mainNavItems.slice(0, 4).map((item) => (
              <Button
                key={item.path}
                variant={location === item.path ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setLocation(item.path)}
                className={cn(
                  "gap-2 transition-all",
                  location === item.path && "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                )}
                data-testid={`nav-${item.path.slice(1) || 'home'}`}
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden lg:inline">{item.label}</span>
              </Button>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            
            {user && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 border border-emerald-200 dark:border-emerald-800">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-teal-600 dark:from-emerald-500 dark:to-teal-500 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white text-sm font-bold">
                    {((user as any)?.firstName || 'م')[0]}
                  </span>
                </div>
                <span className="text-sm font-medium">
                  {(user as any)?.firstName || 'مستخدم'}
                </span>
              </div>
            )}

            {rightPanel && (
              <Sheet open={rightPanelOpen} onOpenChange={setRightPanelOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    data-testid="button-right-panel"
                  >
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 md:w-96">
                  {rightPanel}
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        {sidebar && (
          <AnimatePresence initial={false}>
            {!leftSidebarCollapsed && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 256, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="hidden md:block border-l overflow-y-auto bg-muted/30 dark:bg-gray-900/50 shadow-inner"
              >
                <div className="w-64">
                  {sidebar}
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
