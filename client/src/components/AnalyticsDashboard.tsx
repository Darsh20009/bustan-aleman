import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  BookOpen, 
  Award, 
  Calendar,
  BarChart3,
  Target,
  Flame,
  Clock
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';

interface AnalyticsStats {
  totalAyahsRead: number;
  totalPagesRead: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
  averageDaily: number;
  memorizedAyahs: number;
  reviewedAyahs: number;
  completedSurahs: number;
  totalRecitationAttempts: number;
  averageAccuracy: number;
}

export function AnalyticsDashboard() {
  const { data: stats, isLoading } = useQuery<AnalyticsStats>({
    queryKey: ['/api/quran/analytics'],
  });

  const { data: recentActivity } = useQuery<any[]>({
    queryKey: ['/api/quran/recent-activity'],
  });

  const { data: weeklyProgress } = useQuery<any[]>({
    queryKey: ['/api/quran/weekly-progress'],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  const goals = [
    { label: 'الحفظ', current: stats?.memorizedAyahs || 0, target: 100, unit: 'آية' },
    { label: 'القراءة اليومية', current: stats?.averageDaily || 0, target: 50, unit: 'آية' },
    { label: 'الدقة', current: stats?.averageAccuracy || 0, target: 100, unit: '%' },
  ];

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 border-emerald-200 dark:border-emerald-800" data-testid="card-total-ayahs">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">الآيات المقروءة</p>
                <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300" data-testid="text-total-ayahs">
                  {stats?.totalAyahsRead || 0}
                </p>
              </div>
              <BookOpen className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-blue-200 dark:border-blue-800" data-testid="card-total-minutes">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">وقت التلاوة</p>
                <p className="text-3xl font-bold text-blue-700 dark:text-blue-300" data-testid="text-total-minutes">
                  {Math.floor((stats?.totalMinutes || 0) / 60)}
                  <span className="text-lg mr-1">س</span>
                </p>
              </div>
              <Clock className="h-10 w-10 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border-amber-200 dark:border-amber-800" data-testid="card-current-streak">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">السلسلة الحالية</p>
                <p className="text-3xl font-bold text-amber-700 dark:text-amber-300" data-testid="text-current-streak">
                  {stats?.currentStreak || 0}
                  <span className="text-lg mr-1">يوم</span>
                </p>
              </div>
              <Flame className="h-10 w-10 text-amber-600 dark:text-amber-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-purple-200 dark:border-purple-800" data-testid="card-memorized-ayahs">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">الآيات المحفوظة</p>
                <p className="text-3xl font-bold text-purple-700 dark:text-purple-300" data-testid="text-memorized-ayahs">
                  {stats?.memorizedAyahs || 0}
                </p>
              </div>
              <Award className="h-10 w-10 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="progress" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="progress" data-testid="tab-progress">التقدم</TabsTrigger>
          <TabsTrigger value="goals" data-testid="tab-goals">الأهداف</TabsTrigger>
          <TabsTrigger value="activity" data-testid="tab-activity">النشاط</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-4">
          {/* Weekly Progress Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                التقدم الأسبوعي
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weeklyProgress?.map((day, index) => (
                  <div key={index} className="space-y-2" data-testid={`progress-day-${index}`}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{day.day}</span>
                      <span className="text-muted-foreground" data-testid={`text-day-stats-${index}`}>
                        {day.ayahs} آية • {day.minutes} دقيقة
                      </span>
                    </div>
                    <Progress 
                      value={(day.ayahs / 50) * 100} 
                      className="h-2"
                      data-testid={`progress-bar-day-${index}`}
                    />
                  </div>
                )) || (
                  <div className="text-center py-8 text-muted-foreground">
                    لا توجد بيانات للأسبوع الحالي
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Memorization Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                تقدم الحفظ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">قيد الحفظ</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {stats?.memorizedAyahs || 0}
                  </p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">قيد المراجعة</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {stats?.reviewedAyahs || 0}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>السور المكتملة</span>
                  <Badge variant="secondary">
                    {stats?.completedSurahs || 0} سورة
                  </Badge>
                </div>
                <Progress 
                  value={((stats?.completedSurahs || 0) / 114) * 100} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                أهدافك
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {goals.map((goal, index) => {
                const percentage = Math.min((goal.current / goal.target) * 100, 100);
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{goal.label}</span>
                      <span className="text-sm text-muted-foreground">
                        {goal.current} / {goal.target} {goal.unit}
                      </span>
                    </div>
                    <Progress value={percentage} className="h-3" />
                    <p className="text-xs text-muted-foreground">
                      {Math.round(percentage)}% مكتمل
                    </p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                الإنجازات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900 dark:to-amber-900 p-4 rounded-lg text-center">
                  <Award className="h-8 w-8 mx-auto mb-2 text-yellow-600 dark:text-yellow-400" />
                  <p className="text-sm font-medium">أول جزء</p>
                </div>
                <div className="bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 p-4 rounded-lg text-center">
                  <Flame className="h-8 w-8 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                  <p className="text-sm font-medium">7 أيام متتالية</p>
                </div>
                <div className="bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900 dark:to-emerald-900 p-4 rounded-lg text-center">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 text-green-600 dark:text-green-400" />
                  <p className="text-sm font-medium">100 آية</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                النشاط الأخير
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity?.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    data-testid={`activity-item-${index}`}
                  >
                    <div className="bg-emerald-100 dark:bg-emerald-900 p-2 rounded-full">
                      <BookOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm" data-testid={`text-activity-title-${index}`}>{activity.title}</p>
                      <p className="text-xs text-muted-foreground" data-testid={`text-activity-desc-${index}`}>{activity.description}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap" data-testid={`text-activity-time-${index}`}>
                      {activity.time}
                    </span>
                  </div>
                )) || (
                  <div className="text-center py-8 text-muted-foreground">
                    لا يوجد نشاط حديث
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
