import { useQuery } from '@tanstack/react-query';
import { StudentLayout } from './StudentLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { DataTable } from '@/components/shared/DataTable';
import { LoadingCards } from '@/components/shared/LoadingState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

export function StudentAttendancePage() {
  const { data: sessions = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/student-sessions'],
  });

  const { data: progress } = useQuery<any>({
    queryKey: ['/api/student/progress'],
  });

  const attendedSessions = sessions.filter((s: any) => s.attended);
  const missedSessions = sessions.filter((s: any) => !s.attended && new Date(s.sessionDate) < new Date());
  const upcomingSessions = sessions.filter((s: any) => new Date(s.sessionDate) > new Date());

  const attendanceRate = sessions.length > 0 
    ? Math.round((attendedSessions.length / (attendedSessions.length + missedSessions.length)) * 100) 
    : 0;

  const columns = [
    { 
      key: 'sessionDate', 
      header: 'التاريخ',
      render: (s: any) => new Date(s.sessionDate).toLocaleDateString('ar-SA')
    },
    { key: 'startTime', header: 'الوقت' },
    { key: 'sheikhName', header: 'المعلم' },
    { 
      key: 'attended', 
      header: 'الحضور',
      render: (s: any) => {
        if (new Date(s.sessionDate) > new Date()) {
          return <Badge variant="outline">قادمة</Badge>;
        }
        return s.attended ? (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 ml-1" />
            حاضر
          </Badge>
        ) : (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 ml-1" />
            غائب
          </Badge>
        );
      }
    },
    { 
      key: 'evaluationGrade', 
      header: 'التقييم',
      render: (s: any) => s.evaluationGrade || '-'
    }
  ];

  return (
    <StudentLayout>
      <PageHeader 
        title="سجل الحضور"
        description="متابعة حضورك في الحصص"
      />

      {isLoading ? (
        <LoadingCards count={4} />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <StatsCard
              title="نسبة الحضور"
              value={`${attendanceRate}%`}
              subtitle="هذا الشهر"
              icon={<Calendar className="h-4 w-4" />}
            />
            <StatsCard
              title="الحصص المحضورة"
              value={attendedSessions.length}
              subtitle="إجمالي الحصص"
              icon={<CheckCircle className="h-4 w-4" />}
            />
            <StatsCard
              title="الحصص الفائتة"
              value={missedSessions.length}
              subtitle="تم تفويتها"
              icon={<XCircle className="h-4 w-4" />}
            />
            <StatsCard
              title="الحصص القادمة"
              value={upcomingSessions.length}
              subtitle="مجدولة"
              icon={<Clock className="h-4 w-4" />}
            />
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>نسبة الحضور الشهرية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>نسبة الحضور</span>
                  <span className="font-medium">{attendanceRate}%</span>
                </div>
                <Progress value={attendanceRate} className="h-3" />
                <p className="text-xs text-muted-foreground mt-2">
                  {attendedSessions.length} حصة من أصل {attendedSessions.length + missedSessions.length} حصة منتهية
                </p>
              </div>
            </CardContent>
          </Card>

          <DataTable
            title="سجل الحصص"
            description="جميع الحصص المجدولة والمنتهية"
            columns={columns}
            data={sessions}
            isLoading={isLoading}
            emptyMessage="لا توجد حصص مسجلة"
          />
        </>
      )}
    </StudentLayout>
  );
}