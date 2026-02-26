import { useQuery } from '@tanstack/react-query';
import { TeacherLayout } from './TeacherLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import {
  Users,
  BookOpen,
  Calendar,
  Clock,
  CheckSquare,
  ArrowLeft,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

export function TeacherDashboardPage() {
  const { user } = useAuth();

  const { data: dashboard, isLoading } = useQuery<any>({
    queryKey: ['/api/teacher/dashboard'],
  });

  const { data: students = [] } = useQuery<any[]>({
    queryKey: ['/api/teacher/students'],
  });

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'صباح الخير';
    if (hour < 17) return 'مساء الخير';
    return 'مساء النور';
  };

  const getSessionTypeBadge = (type: string) => {
    const types: Record<string, string> = {
      quran: 'قرآن',
      tajweed: 'تجويد',
      arabic: 'عربي',
      islamic: 'إسلامية',
    };
    return types[type] || type;
  };

  return (
    <TeacherLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <PageHeader
            title={`${greeting()}، ${user?.firstName || 'المعلم'} 👋`}
            description="إليك ملخص نشاطك اليوم"
          />
        </div>

        {/* Islamic Quote */}
        <Card className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white border-none shadow-md">
          <CardContent className="p-4">
            <p className="text-center text-base font-arabic leading-relaxed">
              ﴿ وَالَّذِينَ يُمَسِّكُونَ بِالْكِتَابِ وَأَقَامُوا الصَّلَاةَ إِنَّا لَا نُضِيعُ أَجْرَ الْمُصْلِحِينَ ﴾
            </p>
            <p className="text-center text-sm text-emerald-100 mt-1">الأعراف: 170</p>
          </CardContent>
        </Card>

        {/* Stats */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="h-24" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="إجمالي الطلاب"
              value={dashboard?.stats?.totalStudents ?? students.length}
              subtitle="طالب مسجل"
              icon={<Users className="h-4 w-4" />}
              data-testid="stat-total-students"
            />
            <StatsCard
              title="جلسات هذا الأسبوع"
              value={dashboard?.stats?.weekSessions ?? 0}
              subtitle="جلسة مجدولة"
              icon={<Calendar className="h-4 w-4" />}
              data-testid="stat-week-sessions"
            />
            <StatsCard
              title="واجبات معلقة"
              value={dashboard?.stats?.pendingHomework ?? 0}
              subtitle="تحتاج مراجعة"
              icon={<CheckSquare className="h-4 w-4" />}
              data-testid="stat-pending-homework"
            />
            <StatsCard
              title="معدل الحضور"
              value={`${dashboard?.stats?.attendanceRate ?? 0}%`}
              subtitle="متوسط الطلاب"
              icon={<TrendingUp className="h-4 w-4" />}
              data-testid="stat-attendance-rate"
            />
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Upcoming Sessions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-arabic">الجلسات القادمة</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/teacher/sessions">
                  <span className="text-xs font-arabic">عرض الكل</span>
                  <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-14 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : !dashboard?.upcomingSessions?.length ? (
                <div className="text-center py-8 text-gray-400">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-arabic">لا توجد جلسات قادمة</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dashboard.upcomingSessions.slice(0, 4).map((session: any) => (
                    <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/40 rounded-lg" data-testid={`session-item-${session.id}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                          <BookOpen className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold font-arabic">{session.title || 'جلسة قرآنية'}</p>
                          <p className="text-xs text-gray-500 font-arabic">{session.studentName || 'طالب'}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <Badge variant="outline" className="text-xs font-arabic">{getSessionTypeBadge(session.type)}</Badge>
                        <p className="text-xs text-gray-400 mt-1" dir="ltr">
                          {session.scheduledAt ? new Date(session.scheduledAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : '—'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Students */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-arabic">آخر الطلاب</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/teacher">
                  <span className="text-xs font-arabic">إدارة الطلاب</span>
                  <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {students.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-arabic">لا يوجد طلاب بعد</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {students.slice(0, 5).map((student: any) => (
                    <div key={student.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors" data-testid={`student-item-${student.id}`}>
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-bold">
                          {student.firstName?.charAt(0) || '؟'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium font-arabic truncate">{student.firstName} {student.lastName}</p>
                        <p className="text-xs text-gray-500 font-arabic">
                          {student.currentLevel === 'beginner' ? 'مبتدئ' : student.currentLevel === 'intermediate' ? 'متوسط' : 'متقدم'}
                        </p>
                      </div>
                      <Badge className={student.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}>
                        <span className="text-xs font-arabic">{student.status === 'active' ? 'نشط' : 'غير نشط'}</span>
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-arabic">الإجراءات السريعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { href: '/teacher/sessions', icon: <Calendar className="h-5 w-5" />, label: 'إدارة الجلسات', color: 'text-blue-600 bg-blue-50' },
                { href: '/teacher/homework', icon: <CheckSquare className="h-5 w-5" />, label: 'الواجبات', color: 'text-orange-600 bg-orange-50' },
                { href: '/teacher/attendance', icon: <Users className="h-5 w-5" />, label: 'الحضور والغياب', color: 'text-purple-600 bg-purple-50' },
                { href: '/teacher/quran-tracking', icon: <BookOpen className="h-5 w-5" />, label: 'تتبع الحفظ', color: 'text-emerald-600 bg-emerald-50' },
              ].map(action => (
                <Link key={action.href} href={action.href}>
                  <div className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer group" data-testid={`quick-action-${action.href.replace(/\//g, '-')}`}>
                    <div className={`w-10 h-10 rounded-full ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      {action.icon}
                    </div>
                    <span className="text-xs font-arabic text-center text-gray-700 dark:text-gray-300">{action.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </TeacherLayout>
  );
}
