import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { TeacherLayout } from './TeacherLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Video, Calendar, Clock, Users, Plus, Play, CheckCircle, Loader2 } from 'lucide-react';

interface Student {
  id: string;
  studentName: string;
  phoneNumber: string;
  currentLevel: string;
}

interface Session {
  id: string;
  studentId: string;
  studentName?: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  isEnabled: boolean;
  roomToken?: string;
  status?: string;
}

export function TeacherSessionsPage() {
  const { toast } = useToast();
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [sessionDate, setSessionDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [enablingSession, setEnablingSession] = useState<string | null>(null);

  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ['/api/sheikh/students'],
  });

  const { data: sessions = [], isLoading } = useQuery<Session[]>({
    queryKey: ['/api/sheikh/sessions'],
  });

  const enableSessionMutation = useMutation({
    mutationFn: async (data: { studentId: string; scheduleId?: string; sessionDate: string; startTime: string }) => {
      return apiRequest('POST', '/api/sheikh/enable-session', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sheikh/sessions'] });
      toast({
        title: 'تم تفعيل الحصة',
        description: 'تم إرسال إشعار للطالب',
      });
      setEnablingSession(null);
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في تفعيل الحصة',
        variant: 'destructive',
      });
      setEnablingSession(null);
    },
  });

  const createSessionMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', `/api/students/${data.studentId}/schedules`, {
        dayOfWeek: new Date(data.sessionDate).getDay(),
        startTime: data.startTime,
        endTime: data.endTime,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sheikh/sessions'] });
      setDialogOpen(false);
      resetForm();
      toast({
        title: 'تم إنشاء الحصة',
        description: 'تم إضافة الحصة بنجاح',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في إنشاء الحصة',
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setSelectedStudent('');
    setSessionDate('');
    setStartTime('');
    setEndTime('');
  };

  const handleCreateSession = () => {
    if (!selectedStudent || !sessionDate || !startTime || !endTime) {
      toast({
        title: 'خطأ',
        description: 'يرجى ملء جميع الحقول',
        variant: 'destructive',
      });
      return;
    }
    createSessionMutation.mutate({
      studentId: selectedStudent,
      sessionDate,
      startTime,
      endTime,
    });
  };

  const handleEnableSession = (session: Session) => {
    setEnablingSession(session.id);
    enableSessionMutation.mutate({
      studentId: session.studentId,
      scheduleId: session.id,
      sessionDate: session.sessionDate,
      startTime: session.startTime,
    });
  };

  const joinSession = (roomToken: string) => {
    window.open(`/session/${roomToken}`, '_blank', 'noopener,noreferrer');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ar-SA');
  };

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student?.studentName || 'غير معروف';
  };

  return (
    <TeacherLayout>
      <PageHeader 
        title="إدارة الحصص"
        description="إنشاء وتفعيل الحصص المباشرة للطلاب"
        actions={
          <Button onClick={() => setDialogOpen(true)} data-testid="button-add-session">
            <Plus className="ml-2 h-4 w-4" />
            إضافة حصة
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="mr-2">جاري التحميل...</span>
        </div>
      ) : sessions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Video className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">لا توجد حصص</h3>
            <p className="text-muted-foreground mb-4">ابدأ بإضافة حصص جديدة للطلاب</p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="ml-2 h-4 w-4" />
              إضافة حصة جديدة
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => (
            <Card key={session.id} className="hover-elevate overflow-hidden">
              <CardHeader className="bg-primary/5 pb-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <CardTitle className="text-base">
                      {session.studentName || getStudentName(session.studentId)}
                    </CardTitle>
                  </div>
                  <Badge variant={session.isEnabled ? 'default' : 'secondary'}>
                    {session.isEnabled ? 'مفعلة' : 'غير مفعلة'}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">التاريخ</p>
                    <p className="font-medium">{formatDate(session.sessionDate)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">الوقت</p>
                    <p className="font-medium">{session.startTime} - {session.endTime}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {!session.isEnabled ? (
                    <Button
                      onClick={() => handleEnableSession(session)}
                      disabled={enablingSession === session.id}
                      className="flex-1"
                      data-testid={`button-enable-session-${session.id}`}
                    >
                      {enablingSession === session.id ? (
                        <>
                          <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                          جاري التفعيل...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 ml-2" />
                          تفعيل الحصة
                        </>
                      )}
                    </Button>
                  ) : session.roomToken ? (
                    <Button
                      onClick={() => joinSession(session.roomToken!)}
                      className="flex-1"
                      data-testid={`button-join-session-${session.id}`}
                    >
                      <Video className="w-4 h-4 ml-2" />
                      دخول الحصة
                    </Button>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-sm text-green-600">
                      <CheckCircle className="w-4 h-4 ml-2" />
                      الحصة مفعلة
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>إضافة حصة جديدة</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>اختر الطالب</Label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger data-testid="select-student">
                  <SelectValue placeholder="اختر الطالب" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.studentName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>تاريخ الحصة</Label>
              <Input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                data-testid="input-session-date"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>وقت البداية</Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  data-testid="input-start-time"
                />
              </div>
              <div className="space-y-2">
                <Label>وقت النهاية</Label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  data-testid="input-end-time"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              إلغاء
            </Button>
            <Button 
              onClick={handleCreateSession}
              disabled={createSessionMutation.isPending}
              data-testid="button-confirm-create-session"
            >
              {createSessionMutation.isPending ? 'جاري الإنشاء...' : 'إنشاء الحصة'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TeacherLayout>
  );
}
