import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { StudentLayout } from './StudentLayout';
import { StatsCard } from '@/components/shared/StatsCard';
import { LoadingCards } from '@/components/shared/LoadingState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'wouter';
import QuranPageReader from '@/components/QuranPageReader';
import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  Calendar,
  Video,
  ArrowLeft,
  LayoutDashboard
} from 'lucide-react';

export function StudentDashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery<any[]>({
    queryKey: ['/api/student-sessions'],
  });

  const { data: homework = [], isLoading: homeworkLoading } = useQuery<any[]>({
    queryKey: ['/api/homework'],
  });

  const { data: progress, isLoading: progressLoading } = useQuery<any>({
    queryKey: ['/api/student/progress'],
  });

  const upcomingSessions = sessions.filter(s => new Date(s.sessionDate) > new Date()).slice(0, 3);
  const pendingHomework = homework.filter((h: any) => h.status === 'pending').slice(0, 3);

  const sessionColumns = [
    { key: 'sessionDate', header: 'التاريخ', render: (s: any) => new Date(s.sessionDate).toLocaleDateString('ar-SA') },
    { key: 'startTime', header: 'الوقت' },
    { key: 'sheikhName', header: 'المعلم' },
    { 
      key: 'status', 
      header: 'الحالة',
      render: (s: any) => (
        <Badge variant={s.status === 'upcoming' ? 'default' : 'secondary'}>
          {s.status === 'upcoming' ? 'قادمة' : 'منتهية'}
        </Badge>
      )
    }
  ];

  const isLoading = sessionsLoading || homeworkLoading || progressLoading;

  return (
    <StudentLayout>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">{`مرحباً، ${user?.firstName || 'طالب'}`}</h1>
            <p className="text-muted-foreground">مرحباً بك في لوحة التحكم الخاصة بك</p>
          </div>
          <TabsList className="grid w-full sm:w-auto grid-cols-2 gap-1">
            <TabsTrigger value="dashboard" className="flex items-center gap-2" data-testid="tab-dashboard">
              <LayoutDashboard className="h-4 w-4" />
              لوحة التحكم
            </TabsTrigger>
            <TabsTrigger value="quran" className="flex items-center gap-2" data-testid="tab-quran">
              <BookOpen className="h-4 w-4" />
              المصحف
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="quran" className="mt-0">
          <div className="h-[calc(100vh-12rem)] min-h-[500px]">
            <QuranPageReader studentId={user?.studentId} />
          </div>
        </TabsContent>

        <TabsContent value="dashboard" className="mt-0">

      {isLoading ? (
        <LoadingCards count={4} />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <StatsCard
              title="الحصص هذا الشهر"
              value={sessions.filter(s => {
                const d = new Date(s.sessionDate);
                const now = new Date();
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
              }).length}
              subtitle="حصة مكتملة"
              icon={<Calendar className="h-4 w-4" />}
            />
            <StatsCard
              title="الواجبات المعلقة"
              value={pendingHomework.length}
              subtitle="واجب يحتاج تسليم"
              icon={<Clock className="h-4 w-4" />}
            />
            <StatsCard
              title="نسبة الحضور"
              value={`${progress?.attendanceRate || 0}%`}
              subtitle="هذا الشهر"
              icon={<CheckCircle className="h-4 w-4" />}
            />
            <StatsCard
              title="مستوى الحفظ"
              value={progress?.memorizedParts || 0}
              subtitle="جزء محفوظ"
              icon={<BookOpen className="h-4 w-4" />}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <CardTitle className="text-lg">الحصص القادمة</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/student">
                    عرض الكل
                    <ArrowLeft className="mr-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {upcomingSessions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    لا توجد حصص قادمة
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingSessions.map((session, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Video className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{session.sheikhName || 'الشيخ'}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(session.sessionDate).toLocaleDateString('ar-SA')} - {session.startTime}
                            </p>
                          </div>
                        </div>
                        <Button size="sm" data-testid={`button-join-session-${index}`}>
                          انضمام
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <CardTitle className="text-lg">الواجبات المعلقة</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/student/homework">
                    عرض الكل
                    <ArrowLeft className="mr-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {pendingHomework.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    لا توجد واجبات معلقة
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingHomework.map((hw: any, index: number) => (
                      <div 
                        key={index}
                        className="p-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">{hw.title}</p>
                          <Badge variant="outline">
                            {new Date(hw.dueDate).toLocaleDateString('ar-SA')}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {hw.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {progress?.memorizedSurahs && progress.memorizedSurahs.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">تقدم الحفظ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">نسبة الإنجاز الكلية</span>
                    <span className="font-medium">{progress.overallProgress || 0}%</span>
                  </div>
                  <Progress value={progress.overallProgress || 0} className="h-2" />
                  <div className="flex flex-wrap gap-2 mt-4">
                    {progress.memorizedSurahs.slice(0, 10).map((surah: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {surah}
                      </Badge>
                    ))}
                    {progress.memorizedSurahs.length > 10 && (
                      <Badge variant="outline">
                        +{progress.memorizedSurahs.length - 10} أخرى
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
        </TabsContent>
      </Tabs>
    </StudentLayout>
  );
}