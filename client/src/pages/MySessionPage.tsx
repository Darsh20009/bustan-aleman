import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Video, Clock, Calendar, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useAuth } from '../hooks/useAuth';

interface SessionAccess {
  id: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  isEnabled: boolean;
  enabledAt?: string;
  roomToken?: string;
  roomId?: string;
}

interface Assignment {
  id: string;
  assignmentDate: string;
  memorization: string;
  review: string;
  mistakes?: string;
  notes?: string;
}

interface MySessionPageProps {
  onBack?: () => void;
}

export default function MySessionPage({ onBack }: MySessionPageProps = {}) {
  const [sessions, setSessions] = useState<SessionAccess[]>([]);
  const [todayAssignment, setTodayAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [joiningSession, setJoiningSession] = useState<string | null>(null);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    fetchSessions();
    if (user.role === 'student') {
      fetchTodayAssignment();
    }

    const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`);

    ws.onopen = () => {
      const userId = sessionStorage.getItem('userId');
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
        console.log('📢 Session enabled notification received:', data.data);

        // تحديث الحصة المفعّلة مباشرة في state
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

            // إذا لم توجد الحصة، أضفها
            const sessionExists = prevSessions.some(s => s.id === data.data.id);
            if (!sessionExists) {
              return [...prevSessions, data.data];
            }

            return updatedSessions;
          });
        }

        toast({
          title: "🎉 تم تفعيل الحصة!",
          description: "يمكنك الآن الدخول للحصة المباشرة",
        });

        // أيضاً جلب البيانات من السيرفر لضمان التزامن
        fetchSessions();
      } else if (data.type === 'new_assignment') {
        toast({
          title: "📚 تكليف جديد!",
          description: "تم إضافة تكليف جديد لك",
        });
        fetchTodayAssignment();
      }
    };

    return () => ws.close();
  }, [user]);

  const fetchSessions = async () => {
    try {
      const endpoint = user?.role === 'supervisor' || user?.role === 'admin'
        ? '/api/sheikh/sessions?range=upcoming'
        : '/api/student/sessions';
      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayAssignment = async () => {
    try {
      const response = await fetch('/api/student/assignment/today');
      if (response.ok) {
        const data = await response.json();
        setTodayAssignment(data);
      }
    } catch (error) {
      console.error('Error fetching assignment:', error);
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
        title: "🎉 تم فتح الحصة",
        description: "تم فتح الحصة المباشرة في نافذة جديدة",
      });
    }, 500);
  };

  const parseAssignmentRanges = (jsonString: string) => {
    try {
      const ranges = JSON.parse(jsonString);
      if (Array.isArray(ranges)) {
        return ranges.map(r => `${r.surahName}: من آية ${r.fromAyah} إلى ${r.toAyah}`).join(' • ');
      }
      return jsonString;
    } catch {
      return jsonString;
    }
  };

  const isSheikhRole = user?.role === 'supervisor' || user?.role === 'admin';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-900 to-emerald-950 flex items-center justify-center p-6" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-white">جاري التحميل...</p>
        </motion.div>
      </div>
    );
  }

  const todaysSessions = sessions.filter(s => s.sessionDate === new Date().toISOString().split('T')[0]);
  const hasEnabledSession = todaysSessions.some(s => s.isEnabled);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-900 to-emerald-950" dir="rtl">
      {/* Header with Back Button */}
      <div className="bg-gradient-to-r from-green-900 to-emerald-950 text-white p-4 sticky top-0 z-50 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center gap-4">
          <h1 className="text-xl md:text-2xl font-bold text-white">حصتي 📚</h1>
          {onBack && (
            <Button
              onClick={onBack}
              variant="ghost"
              className="bg-white/20 hover:bg-white/30 text-white"
              data-testid="button-back-my-session"
            >
              ← العودة
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-6 p-6">

        {/* Today's Assignment */}
        {todayAssignment && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-0 shadow-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="text-2xl flex items-center gap-3 text-white">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    📖
                  </div>
                  تكليف اليوم
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 space-y-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 space-y-3">
                  <div>
                    <h4 className="font-bold text-lg mb-2 text-white">الحفظ الجديد:</h4>
                    <p className="text-amber-50 text-lg">{parseAssignmentRanges(todayAssignment.memorization)}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2 text-white">المراجعة:</h4>
                    <p className="text-amber-50 text-lg">{parseAssignmentRanges(todayAssignment.review)}</p>
                  </div>
                  {todayAssignment.mistakes && (
                    <div>
                      <h4 className="font-bold text-lg mb-2 text-white">الأخطاء:</h4>
                      <p className="text-amber-50">{todayAssignment.mistakes}</p>
                    </div>
                  )}
                  {todayAssignment.notes && (
                    <div>
                      <h4 className="font-bold text-lg mb-2 text-white">ملاحظات:</h4>
                      <p className="text-amber-50">{todayAssignment.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Today's Sessions */}
        <div className="space-y-4">
          <h2 className={`text-3xl font-bold mb-4 text-white`}>حصص اليوم</h2>

          {todaysSessions.length === 0 ? (
            <Card className="border-0 shadow-xl bg-white/10 backdrop-blur-md">
              <CardContent className="p-16 text-center">
                <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 bg-white/20">
                  <Calendar className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-white">لا توجد حصص مجدولة اليوم</h3>
                <p className="text-lg text-white/90">ستظهر حصصك هنا عندما يتم جدولتها</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              <AnimatePresence>
                {todaysSessions.map((session, index) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={`border-0 shadow-xl overflow-hidden ${
                      session.isEnabled
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                        : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                    }`}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                <Video className="w-7 h-7 text-white" />
                              </div>
                              <div>
                                <h3 className="text-2xl font-bold text-white">الحصة المباشرة</h3>
                                <div className="flex items-center gap-2 text-sm opacity-90 mt-1 text-white">
                                  <Clock className="w-4 h-4" />
                                  <span>{session.startTime} - {session.endTime}</span>
                                </div>
                              </div>
                            </div>

                            {session.isEnabled ? (
                              <Badge className="bg-white/30 text-white border-white/50 text-sm px-3 py-1">
                                <CheckCircle2 className="w-4 h-4 ml-1" />
                                الحصة مفعلة - يمكنك الدخول الآن
                              </Badge>
                            ) : (
                              <Badge className="bg-white/20 text-white border-white/40 text-sm px-3 py-1">
                                <XCircle className="w-4 h-4 ml-1" />
                                في انتظار التفعيل
                              </Badge>
                            )}
                          </div>

                          <Button
                            onClick={() => joinSession(session)}
                            disabled={!session.isEnabled || joiningSession === session.id}
                            className={`${
                              session.isEnabled
                                ? 'bg-white text-emerald-700 hover:bg-emerald-50'
                                : 'bg-white/20 text-white cursor-not-allowed'
                            } shadow-lg px-8 py-6 text-lg font-bold`}
                            data-testid={`button-join-session-${session.id}`}
                          >
                            {joiningSession === session.id ? (
                              <>
                                <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                                جاري الانضمام...
                              </>
                            ) : (
                              <>
                                <Video className="w-5 h-5 ml-2" />
                                انضم للحصة
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* All Sessions */}
        {sessions.filter(s => s.sessionDate !== new Date().toISOString().split('T')[0]).length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4 text-white">الحصص القادمة</h2>

            <div className="grid gap-3">
              {sessions
                .filter(s => s.sessionDate !== new Date().toISOString().split('T')[0])
                .map((session, index) => (
                  <Card key={session.id} className="border-0 shadow-lg bg-white/10 backdrop-blur-md">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-10 h-10 text-white" />
                          <div>
                            <h4 className="font-bold text-white">
                              {format(new Date(session.sessionDate), 'EEEE، d MMMM yyyy', { locale: ar })}
                            </h4>
                            <p className="text-sm text-white/90">
                              {session.startTime} - {session.endTime}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-white/30 text-white border-white/50">
                          قادمة
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}