import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { TeacherLayout } from './TeacherLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Calendar, CheckCircle, Clock, Users, Save } from 'lucide-react';

export function TeacherAttendancePage() {
  const { toast } = useToast();
  const [attendanceData, setAttendanceData] = useState<Record<string, boolean>>({});

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery<any[]>({
    queryKey: ['/api/teacher/sessions/today'],
  });

  const { data: students = [], isLoading: studentsLoading } = useQuery<any[]>({
    queryKey: ['/api/teacher/students'],
  });

  const saveAttendanceMutation = useMutation({
    mutationFn: async (data: { sessionId: string; attendance: Record<string, boolean> }) => {
      return apiRequest('/api/teacher/attendance', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teacher/sessions/today'] });
      toast({
        title: 'تم حفظ الحضور',
        description: 'تم تسجيل حضور الطلاب بنجاح',
      });
    },
    onError: () => {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء حفظ الحضور',
        variant: 'destructive',
      });
    },
  });

  const toggleAttendance = (studentId: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const markAllPresent = () => {
    const allPresent: Record<string, boolean> = {};
    students.forEach((s: any) => {
      allPresent[s.id] = true;
    });
    setAttendanceData(allPresent);
  };

  const markAllAbsent = () => {
    setAttendanceData({});
  };

  const saveAttendance = (sessionId: string) => {
    saveAttendanceMutation.mutate({
      sessionId,
      attendance: attendanceData
    });
  };

  const isLoading = sessionsLoading || studentsLoading;

  const today = new Date().toLocaleDateString('ar-SA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const presentCount = Object.values(attendanceData).filter(Boolean).length;
  const absentCount = students.length - presentCount;

  return (
    <TeacherLayout>
      <PageHeader 
        title="تسجيل الحضور"
        description={today}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={markAllPresent} data-testid="button-mark-all-present">
              تحديد الكل حاضر
            </Button>
            <Button variant="outline" onClick={markAllAbsent} data-testid="button-mark-all-absent">
              تحديد الكل غائب
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <div className="text-center py-12">جاري التحميل...</div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium">إجمالي الطلاب</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{students.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium">الحاضرون</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{presentCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium">الغائبون</CardTitle>
                <Clock className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{absentCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
                <CardTitle className="text-sm font-medium">نسبة الحضور</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0}%
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>قائمة الطلاب</CardTitle>
                <CardDescription>حدد الطلاب الحاضرين</CardDescription>
              </div>
              <Button 
                onClick={() => saveAttendance(sessions[0]?.id || 'default')}
                disabled={saveAttendanceMutation.isPending}
                data-testid="button-save-attendance"
              >
                <Save className="ml-2 h-4 w-4" />
                {saveAttendanceMutation.isPending ? 'جاري الحفظ...' : 'حفظ الحضور'}
              </Button>
            </CardHeader>
            <CardContent>
              {students.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  لا يوجد طلاب
                </div>
              ) : (
                <div className="space-y-2">
                  {students.map((student: any) => (
                    <div 
                      key={student.id}
                      className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                        attendanceData[student.id] 
                          ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-900' 
                          : 'bg-background'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id={`attendance-${student.id}`}
                          checked={attendanceData[student.id] || false}
                          onCheckedChange={() => toggleAttendance(student.id)}
                          data-testid={`checkbox-attendance-${student.id}`}
                        />
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{student.firstName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{student.firstName} {student.lastName}</p>
                          <p className="text-sm text-muted-foreground">{student.phoneNumber}</p>
                        </div>
                      </div>
                      <Badge variant={attendanceData[student.id] ? 'default' : 'secondary'}>
                        {attendanceData[student.id] ? 'حاضر' : 'غائب'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </TeacherLayout>
  );
}