import { ReactNode, useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Menu, 
  Home, 
  BarChart3, 
  Settings,
  X
} from 'lucide-react';
import { useLocation } from 'wouter';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';

interface WorkspaceLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
  rightPanel?: ReactNode;
}

export function WorkspaceLayout({ children, sidebar, rightPanel }: WorkspaceLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const { user } = useAuth();

  const mainNavItems = [
    { icon: Home, label: 'الرئيسية', path: '/' },
    { icon: BookOpen, label: 'القرآن', path: '/quran' },
    { icon: BarChart3, label: 'التقدم', path: '/progress' },
    { icon: Settings, label: 'الإعدادات', path: '/settings' },
  ];

  return (
    <div className="h-screen flex flex-col bg-background dark:bg-gray-950">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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

          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setLocation('/')}
          >
            <div className="w-10 h-10 bg-islamic-green dark:bg-green-600 rounded-full flex items-center justify-center">
              <BookOpen className="text-white" size={20} />
            </div>
            <span className="hidden sm:block text-xl font-bold text-islamic-green dark:text-green-400 font-arabic-serif">
              بستان الإيمان
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex flex-1 items-center gap-2 mx-6">
            {mainNavItems.map((item) => (
              <Button
                key={item.path}
                variant={location === item.path ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setLocation(item.path)}
                className="gap-2"
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
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-muted dark:bg-gray-800">
                <div className="w-8 h-8 bg-islamic-green dark:bg-green-600 rounded-full flex items-center justify-center">
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
                <SheetContent side="left" className="w-80">
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
          <aside className="hidden md:block w-64 border-l overflow-y-auto bg-muted/30 dark:bg-gray-900/50">
            {sidebar}
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
