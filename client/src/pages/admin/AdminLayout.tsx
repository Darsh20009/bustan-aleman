import { ReactNode } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { 
  BarChart3, 
  Users, 
  BookOpen, 
  CreditCard, 
  MessageSquare 
} from 'lucide-react';

const adminNavItems = [
  {
    title: 'الإحصائيات',
    href: '/admin',
    icon: <BarChart3 className="h-4 w-4" />
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
    title: 'الرسائل',
    href: '/admin/messages',
    icon: <MessageSquare className="h-4 w-4" />
  }
];

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <DashboardLayout 
      navItems={adminNavItems} 
      title="لوحة المدير"
      userRole="admin"
    >
      {children}
    </DashboardLayout>
  );
}