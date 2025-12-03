import { ReactNode } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { 
  BookOpen, 
  ClipboardList, 
  TrendingUp, 
  Calendar, 
  CreditCard, 
  MessageCircle 
} from 'lucide-react';

const studentNavItems = [
  {
    title: 'دروسي',
    href: '/student',
    icon: <BookOpen className="h-4 w-4" />
  },
  {
    title: 'واجباتي',
    href: '/student/homework',
    icon: <ClipboardList className="h-4 w-4" />
  },
  {
    title: 'مستوى الحفظ',
    href: '/student/memorization',
    icon: <TrendingUp className="h-4 w-4" />
  },
  {
    title: 'الحضور',
    href: '/student/attendance',
    icon: <Calendar className="h-4 w-4" />
  },
  {
    title: 'الاشتراك والدفع',
    href: '/student/subscription',
    icon: <CreditCard className="h-4 w-4" />
  },
  {
    title: 'تواصل مع المعلم',
    href: '/student/contact',
    icon: <MessageCircle className="h-4 w-4" />
  }
];

interface StudentLayoutProps {
  children: ReactNode;
}

export function StudentLayout({ children }: StudentLayoutProps) {
  return (
    <DashboardLayout 
      navItems={studentNavItems} 
      title="لوحة الطالب"
      userRole="student"
    >
      {children}
    </DashboardLayout>
  );
}