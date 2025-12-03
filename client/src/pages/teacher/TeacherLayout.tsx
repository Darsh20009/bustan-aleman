import { ReactNode } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { 
  Users, 
  Calendar, 
  BookOpen, 
  ClipboardList, 
  FileText 
} from 'lucide-react';

const teacherNavItems = [
  {
    title: 'عرض الطلاب',
    href: '/teacher',
    icon: <Users className="h-4 w-4" />
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
    title: 'إرسال واجبات',
    href: '/teacher/homework',
    icon: <ClipboardList className="h-4 w-4" />
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