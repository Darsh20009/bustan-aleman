import { useState, useEffect } from 'react';
import { StudentLayout } from './StudentLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Video, Calendar, Clock, CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react';

interface SessionAccess {
  id: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  isEnabled: boolean;
  enabledAt?: string;
  roomToken?: string;
  roomId?: string;
  sheikhName?: string;
}

export function StudentSessionsPage() {
  const [sessions, setSessions] = useState<SessionAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningSession, setJoiningSession] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    fetchSessions();

    const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`);

    ws.onopen = () => {
      const userId = sessionStorage.getItem('userId') || user.id;
      if (userId && user.role) {
        ws.send(JSON.stringify({
          type: 'auth',
          payload: { userId, role: user.role }
        }));
      }
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'session_enabled') {
        if (data.data.roomToken && data.data.id) {
          setSessions(prevSessions => {
            const updatedSessions = prevSessions.map(session => {
              if (session.id === data.data.id) {
                return {
                  ...session,
                  isEnabled: true,
                  roomToken: data.data.roomToken,
                  roomId: data.data.roomId,
                };
              }
              return session;
            });
            const sessionExists = prevSessions.some(s => s.id === data.data.id);
            if (!sessionExists) {
              return [...prevSessions, data.data];
            }
            return updatedSessions;
          });
        }

        toast({
          title: "تم تفعيل الحصة!",
          description: "يمكنك الآن الدخول للحصة المباشرة",
        });
        fetchSessions();
      }
    };

    return () => ws.close();
  }, [user]);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/student/sessions');
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast({
        title: "خطأ",
        description: "فشل في جلب الحصص",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const joinSession = async (session: SessionAccess) => {
    if (!session.isEnabled) {
      toast({
        title: "الحصة غير مفعلة",
        description: "انتظر حتى يفعل الشيخ الحصة",
        variant: "destructive",
      });
      return;
    }

    if (!session.roomToken) {
      toast({
        title: "خطأ",
        description: "لم يتم إنشاء غرفة الحصة بعد، الرجاء المحاولة مرة أخرى",
        variant: "destructive",
      });
      return;
    }

    setJoiningSession(session.id);
    setTimeout(() => {
      window.open(`/session/${session.roomToken}`, '_blank', 'noopener,noreferrer');
      setJoiningSession(null);
      toast({
        title: "تم فتح الحصة",
        description: "تم فتح الحصة المباشرة في نافذة جديدة",
      });
    }, 500);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ar-SA');
  };

  const getStatusBadge = (session: SessionAccess) => {
    if (!session.isEnabled) {
      return <Badge variant="secondary">غير مفعلة</Badge>;
    }
    return <Badge className="bg-green-600">مفعلة</Badge>;
  };

  return (
    <StudentLayout>
      <PageHeader 
        title="حصتي"
        description="عرض وإدارة الحصص المباشرة مع الشيخ"
      />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="mr-2">جاري التحميل...</span>
        </div>
      ) : sessions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">لا توجد حصص متاحة</h3>
            <p className="text-muted-foreground">سيتم إضافة حصص جديدة قريباً</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => (
            <Card key={session.id} className="hover-elevate overflow-hidden">
              <CardHeader className="bg-primary/5 pb-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-primary" />
                    <CardTitle className="text-base">{session.sheikhName || 'الشيخ'}</CardTitle>
                  </div>
                  {getStatusBadge(session)}
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

                {!session.isEnabled && (
                  <div className="bg-muted rounded-lg p-3 text-sm text-muted-foreground">
                    الحصة غير مفعلة، انتظر تفعيل الشيخ
                  </div>
                )}

                {session.isEnabled && session.roomToken && (
                  <Button
                    onClick={() => joinSession(session)}
                    disabled={joiningSession === session.id}
                    className="w-full"
                    data-testid={`button-join-session-${session.id}`}
                  >
                    {joiningSession === session.id ? (
                      <>
                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                        جاري الانضمام...
                      </>
                    ) : (
                      <>
                        <Video className="w-4 h-4 ml-2" />
                        دخول الحصة
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </StudentLayout>
  );
}
