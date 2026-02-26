import { ReactNode } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { 
  Users, 
  Calendar, 
  BookOpen, 
  ClipboardList, 
  FileText,
  Video,
  CreditCard,
  MessageCircle,
  BookMarked,
  LayoutDashboard
} from 'lucide-react';

const teacherNavItems = [
  {
    title: 'لوحة التحكم',
    href: '/teacher/dashboard',
    icon: <LayoutDashboard className="h-4 w-4" />
  },
  {
    title: 'إدارة الطلاب',
    href: '/teacher',
    icon: <Users className="h-4 w-4" />
  },
  {
    title: 'إدارة الحصص',
    href: '/teacher/sessions',
    icon: <Video className="h-4 w-4" />
  },
  {
    title: 'جدول الحصص',
    href: '/teacher/schedule',
    icon: <Calendar className="h-4 w-4" />
  },
  {
    title: 'تسجيل الحضور',
    href: '/teacher/attendance',
    icon: <Calendar className="h-4 w-4" />
  },
  {
    title: 'تقييم الحفظ',
    href: '/teacher/memorization',
    icon: <BookOpen className="h-4 w-4" />
  },
  {
    title: 'متابعة القرآن',
    href: '/teacher/quran-tracking',
    icon: <BookMarked className="h-4 w-4" />
  },
  {
    title: 'إرسال واجبات',
    href: '/teacher/homework',
    icon: <ClipboardList className="h-4 w-4" />
  },
  {
    title: 'إدارة الاشتراكات',
    href: '/teacher/subscriptions',
    icon: <CreditCard className="h-4 w-4" />
  },
  {
    title: 'الرسائل',
    href: '/teacher/messages',
    icon: <MessageCircle className="h-4 w-4" />
  },
  {
    title: 'تقارير الطلاب',
    href: '/teacher/reports',
    icon: <FileText className="h-4 w-4" />
  }
];

interface TeacherLayoutProps {
  children: ReactNode;
}

export function TeacherLayout({ children }: TeacherLayoutProps) {
  return (
    <DashboardLayout 
      navItems={teacherNavItems} 
      title="لوحة المعلم"
      userRole="supervisor"
    >
      {children}
    </DashboardLayout>
  );
}