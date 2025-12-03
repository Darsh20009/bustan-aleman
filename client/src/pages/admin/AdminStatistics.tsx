import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from './AdminLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { LoadingCards } from '@/components/shared/LoadingState';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  UserCheck, 
  BookOpen, 
  CreditCard, 
  TrendingUp,
  Calendar,
  DollarSign,
  Activity
} from 'lucide-react';

export function AdminStatisticsPage() {
  const { data: stats, isLoading } = useQuery<any>({
    queryKey: ['/api/admin/statistics'],
  });

  const { data: recentActivities = [] } = useQuery<any[]>({
    queryKey: ['/api/admin/recent-activities'],
  });

  return (
    <AdminLayout>
      <PageHeader 
        title="لوحة الإحصائيات"
        description="نظرة عامة على أداء المنصة"
      />

      {isLoading ? (
        <LoadingCards count={8} />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <StatsCard
              title="إجمالي الطلاب"
              value={stats?.totalStudents || 0}
              subtitle="طالب مسجل"
              icon={<Users className="h-4 w-4" />}
              trend={stats?.studentsGrowth && {
                value: stats.studentsGrowth,
                label: 'من الشهر الماضي',
                isPositive: stats.studentsGrowth > 0
              }}
            />
            <StatsCard
              title="الطلاب النشطين"
              value={stats?.activeStudents || 0}
              subtitle="طالب نشط حالياً"
              icon={<UserCheck className="h-4 w-4" />}
            />
            <StatsCard
              title="المعلمين"
              value={stats?.totalTeachers || 0}
              subtitle="معلم مسجل"
              icon={<BookOpen className="h-4 w-4" />}
            />
            <StatsCard
              title="الحلقات"
              value={stats?.totalHalaqas || 0}
              subtitle="حلقة نشطة"
              icon={<Calendar className="h-4 w-4" />}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <StatsCard
              title="الاشتراكات النشطة"
              value={stats?.activeSubscriptions || 0}
              subtitle="اشتراك فعال"
              icon={<CreditCard className="h-4 w-4" />}
            />
            <StatsCard
              title="إيرادات الشهر"
              value={`${stats?.monthlyRevenue || 0} ر.س`}
              subtitle="هذا الشهر"
              icon={<DollarSign className="h-4 w-4" />}
              trend={stats?.revenueGrowth && {
                value: stats.revenueGrowth,
                label: 'من الشهر الماضي',
                isPositive: stats.revenueGrowth > 0
              }}
            />
            <StatsCard
              title="نسبة الحضور"
              value={`${stats?.attendanceRate || 0}%`}
              subtitle="متوسط الحضور"
              icon={<Activity className="h-4 w-4" />}
            />
            <StatsCard
              title="الحصص هذا الشهر"
              value={stats?.monthlySessionsCount || 0}
              subtitle="حصة مكتملة"
              icon={<TrendingUp className="h-4 w-4" />}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>توزيع الطلاب حسب المستوى</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">مبتدئ</span>
                    <span className="text-sm font-medium">{stats?.beginnerStudents || 0}</span>
                  </div>
                  <Progress 
                    value={stats?.totalStudents ? (stats.beginnerStudents / stats.totalStudents) * 100 : 0} 
                    className="h-2" 
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">متوسط</span>
                    <span className="text-sm font-medium">{stats?.intermediateStudents || 0}</span>
                  </div>
                  <Progress 
                    value={stats?.totalStudents ? (stats.intermediateStudents / stats.totalStudents) * 100 : 0} 
                    className="h-2" 
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">متقدم</span>
                    <span className="text-sm font-medium">{stats?.advancedStudents || 0}</span>
                  </div>
                  <Progress 
                    value={stats?.totalStudents ? (stats.advancedStudents / stats.totalStudents) * 100 : 0} 
                    className="h-2" 
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>آخر النشاطات</CardTitle>
                <CardDescription>أحدث الأنشطة على المنصة</CardDescription>
              </CardHeader>
              <CardContent>
                {recentActivities.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    لا توجد نشاطات حديثة
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivities.slice(0, 5).map((activity: any, index: number) => (
                      <div 
                        key={index}
                        className="flex items-start gap-3 pb-4 border-b last:border-0"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Activity className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.createdAt).toLocaleDateString('ar-SA')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>حالة الاشتراكات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">نشطة</span>
                  <span className="font-medium text-green-600">{stats?.activeSubscriptions || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">منتهية</span>
                  <span className="font-medium text-red-600">{stats?.expiredSubscriptions || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">قيد المراجعة</span>
                  <span className="font-medium text-yellow-600">{stats?.pendingSubscriptions || 0}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ملخص المدفوعات</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">هذا الشهر</span>
                  <span className="font-medium">{stats?.monthlyRevenue || 0} ر.س</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">الشهر الماضي</span>
                  <span className="font-medium">{stats?.lastMonthRevenue || 0} ر.س</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">إجمالي السنة</span>
                  <span className="font-medium">{stats?.yearlyRevenue || 0} ر.س</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>الحصص اليوم</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">مكتملة</span>
                  <span className="font-medium text-green-600">{stats?.todayCompletedSessions || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">قادمة</span>
                  <span className="font-medium text-blue-600">{stats?.todayUpcomingSessions || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">ملغاة</span>
                  <span className="font-medium text-red-600">{stats?.todayCancelledSessions || 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </AdminLayout>
  );
}