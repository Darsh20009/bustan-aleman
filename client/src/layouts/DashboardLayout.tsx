import { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, Home } from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: ReactNode;
}

interface DashboardLayoutProps {
  children: ReactNode;
  navItems: NavItem[];
  title: string;
  userRole?: 'student' | 'supervisor' | 'admin' | 'owner';
}

export function DashboardLayout({ children, navItems, title, userRole }: DashboardLayoutProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getRoleLabel = () => {
    switch (userRole) {
      case 'student': return 'طالب';
      case 'supervisor': return 'معلم';
      case 'admin': return 'مدير';
      case 'owner': return 'صاحب المنصة';
      default: return '';
    }
  };

  const getRoleColor = () => {
    switch (userRole) {
      case 'student': return 'bg-emerald-600';
      case 'supervisor': return 'bg-blue-600';
      case 'admin': return 'bg-purple-600';
      case 'owner': return 'bg-amber-600';
      default: return 'bg-primary';
    }
  };

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3.5rem",
  };

  return (
    <SidebarProvider defaultOpen={false} style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <Sidebar collapsible="offcanvas">
          <SidebarHeader className="p-4 border-b border-sidebar-border">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-10 h-10 rounded-full ${getRoleColor()} flex items-center justify-center text-white font-bold shrink-0`}>
                  {user?.firstName?.charAt(0) || 'م'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sidebar-foreground truncate">
                    {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'مستخدم'}
                  </p>
                  <p className="text-xs text-sidebar-foreground/70">
                    {getRoleLabel()}
                  </p>
                </div>
              </div>
              <SidebarTrigger data-testid="button-sidebar-close" />
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>{title}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={location === item.href}
                        data-testid={`nav-${item.href.replace(/\//g, '-')}`}
                      >
                        <Link href={item.href}>
                          {item.icon}
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-4 border-t border-sidebar-border">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/">
                    <Home className="h-4 w-4" />
                    <span>الرئيسية</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} data-testid="button-logout">
                  <LogOut className="h-4 w-4" />
                  <span>تسجيل الخروج</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between gap-4 p-3 border-b bg-background">
            <div className="flex items-center gap-2">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <h1 className="text-lg font-semibold">{title}</h1>
            </div>
            <ThemeToggle />
          </header>
          
          <main className="flex-1 overflow-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}