import { ReactNode } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { 
  BarChart3, 
  Users, 
  BookOpen, 
  CreditCard, 
  MessageSquare,
  UserCog,
  Settings,
  Landmark
} from 'lucide-react';
import { Redirect } from 'wouter';
import { useAuth } from '@/hooks/useAuth';

const adminNavItems = [
  {
    title: 'الإحصائيات',
    href: '/admin',
    icon: <BarChart3 className="h-4 w-4" />
  },
  {
    title: 'إدارة المستخدمين',
    href: '/admin/users',
    icon: <UserCog className="h-4 w-4" />
  },
  {
    title: 'إدارة المعلمين',
    href: '/admin/teachers',
    icon: <Users className="h-4 w-4" />
  },
  {
    title: 'إنشاء حلقات',
    href: '/admin/halaqas',
    icon: <BookOpen className="h-4 w-4" />
  },
  {
    title: 'الاشتراكات',
    href: '/admin/subscriptions',
    icon: <CreditCard className="h-4 w-4" />
  },
  {
    title: 'التحويلات البنكية',
    href: '/admin/bank-transfers',
    icon: <Landmark className="h-4 w-4" />
  },
  {
    title: 'الرسائل',
    href: '/admin/messages',
    icon: <MessageSquare className="h-4 w-4" />
  },
  {
    title: 'إعدادات النظام',
    href: '/admin/settings',
    icon: <Settings className="h-4 w-4" />
  }
];

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isLoading } = useAuth();

  if (!isLoading && !['admin', 'owner', 'director'].includes(user?.role || '')) {
    return <Redirect to="/" />;
  }

  return (
    <DashboardLayout 
      navItems={adminNavItems} 
      title="لوحة المدير"
      userRole={user?.role as any}
    >
      {children}
    </DashboardLayout>
  );
}