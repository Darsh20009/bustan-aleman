import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { BookOpen, Calendar, Trophy, Users, Video, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

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

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<SessionAccess[]>([]);
  const [todayAssignment, setTodayAssignment] = useState<Assignment | null>(null);
  const [joiningSession, setJoiningSession] = useState<string | null>(null);

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ["/api/courses"],
  });

  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ["/api/user/enrollments"],
  });

  useEffect(() => {
    if (!user || user.role !== 'student') return;

    fetchSessions();
    fetchTodayAssignment();

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

        toast({
          title: "🎉 تم تفعيل الحصة!",
          description: "يمكنك الآن الدخول للحصة المباشرة",
        });

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
      const response = await fetch('/api/student/sessions');
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
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
        description: "لم يتم إنشاء غرفة الحصة بعد",
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
        return ranges.map((r: any) => `${r.surahName}: من آية ${r.fromAyah} إلى ${r.toAyah}`).join(' • ');
      }
      return jsonString;
    } catch {
      return jsonString;
    }
  };

  const todaysSessions = sessions.filter(s => s.sessionDate === new Date().toISOString().split('T')[0]);
  const isStudent = user?.role === 'student';

  return (
    <div className="min-h-screen bg-warm-white dark:bg-gray-950 transition-colors">
      <Navigation />
      
      {/* Welcome Section */}
      <section className="hero-section dark:bg-gradient-to-b dark:from-gray-900 dark:to-gray-800">
        <div className="islamic-pattern-overlay dark:opacity-30"></div>
        <div className="hero-content container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-arabic-serif mb-4 sm:mb-6 text-white dark:text-white"
            data-testid="welcome-title"
          >
            أهلاً وسهلاً {(user as any)?.firstName || 'بك'}
          </h1>
          <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 opacity-90 text-white dark:text-gray-200">
            في بستان الإيمان - رحلتك نحو التعلم والإيمان تبدأ من هنا
          </p>
          <div className="flex flex-wrap gap-3 sm:gap-4 justify-center">
            <Button 
              onClick={() => setLocation("/courses")}
              className="btn-islamic-secondary px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base"
              data-testid="button-browse-courses"
            >
              استكشف الدورات
            </Button>
            <Button 
              onClick={() => setLocation("/quran")}
              className="btn-islamic-primary px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base"
              data-testid="button-quran-section"
            >
              قسم القرآن الكريم
            </Button>
          </div>
        </div>
      </section>

      {/* Dashboard Stats */}
      <section className="py-8 sm:py-12 bg-light-beige dark:bg-gray-900 transition-colors">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <Card className="islamic-card text-center dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-3 sm:p-6">
                <BookOpen className="text-islamic-green dark:text-green-400 mb-2 sm:mb-4 mx-auto" size={32} />
                <h3 className="text-xl sm:text-2xl font-bold text-islamic-green dark:text-green-400 mb-1 sm:mb-2">
                  {Array.isArray(enrollments) ? enrollments.length : 0}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">الدورات المسجلة</p>
              </CardContent>
            </Card>
            
            <Card className="islamic-card text-center dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-3 sm:p-6">
                <Calendar className="text-warm-gold dark:text-yellow-400 mb-2 sm:mb-4 mx-auto" size={32} />
                <h3 className="text-xl sm:text-2xl font-bold text-warm-gold dark:text-yellow-400 mb-1 sm:mb-2">
                  {Array.isArray(courses) ? courses.filter((c: any) => new Date(c.startDate) > new Date()).length : 0}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">الدورات القادمة</p>
              </CardContent>
            </Card>
            
            <Card className="islamic-card text-center dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-3 sm:p-6">
                <Trophy className="text-earth-brown dark:text-orange-400 mb-2 sm:mb-4 mx-auto" size={32} />
                <h3 className="text-xl sm:text-2xl font-bold text-earth-brown dark:text-orange-400 mb-1 sm:mb-2">0</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">الإنجازات</p>
              </CardContent>
            </Card>
            
            <Card className="islamic-card text-center dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-3 sm:p-6">
                <Users className="text-islamic-green dark:text-green-400 mb-2 sm:mb-4 mx-auto" size={32} />
                <h3 className="text-xl sm:text-2xl font-bold text-islamic-green dark:text-green-400 mb-1 sm:mb-2">50+</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">زملاء الدراسة</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* My Sessions & Assignment - للطلاب فقط */}
      {isStudent && (
        <section className="py-8 sm:py-12 bg-white dark:bg-gray-950 transition-colors">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-arabic-serif text-islamic-green dark:text-green-400 mb-6 sm:mb-8">
              حصتي 📚
            </h2>

            <div className="space-y-6">
              {/* Today's Assignment */}
              {todayAssignment && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full"
                >
                  <Card className="border-2 border-amber-500/20 shadow-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 overflow-hidden">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xl sm:text-2xl flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 text-amber-900 dark:text-amber-200">
                        <span className="text-2xl sm:text-3xl">📖</span>
                        <span>تكليف اليوم</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4">
                      <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3">
                        <div>
                          <h4 className="font-bold text-base sm:text-lg mb-1 sm:mb-2 text-amber-900 dark:text-amber-200">الحفظ الجديد:</h4>
                          <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">{parseAssignmentRanges(todayAssignment.memorization)}</p>
                        </div>
                        <div>
                          <h4 className="font-bold text-base sm:text-lg mb-1 sm:mb-2 text-amber-900 dark:text-amber-200">المراجعة:</h4>
                          <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">{parseAssignmentRanges(todayAssignment.review)}</p>
                        </div>
                        {todayAssignment.notes && (
                          <div>
                            <h4 className="font-bold text-base sm:text-lg mb-1 sm:mb-2 text-amber-900 dark:text-amber-200">ملاحظات:</h4>
                            <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">{todayAssignment.notes}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Today's Sessions */}
              {todaysSessions.length > 0 && (
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200">حصص اليوم</h3>

                  <div className="grid gap-3 sm:gap-4">
                    <AnimatePresence>
                      {todaysSessions.map((session, index) => (
                        <motion.div
                          key={session.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className={`border-2 shadow-lg overflow-hidden ${
                            session.isEnabled
                              ? 'border-green-500/50 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
                              : 'border-gray-300/50 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50'
                          }`}>
                            <CardContent className="p-4 sm:p-6">
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex-1 w-full sm:w-auto">
                                  <div className="flex items-center gap-3 mb-3">
                                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center ${
                                      session.isEnabled ? 'bg-green-500/20' : 'bg-gray-400/20'
                                    }`}>
                                      <Video className={`w-6 h-6 sm:w-7 sm:h-7 ${
                                        session.isEnabled ? 'text-green-600 dark:text-green-400' : 'text-gray-500'
                                      }`} />
                                    </div>
                                    <div className="flex-1">
                                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200">الحصة المباشرة</h3>
                                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                                        <span>{session.startTime} - {session.endTime}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {session.isEnabled ? (
                                    <Badge className="bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30 text-xs sm:text-sm">
                                      <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                                      مفعلة - يمكنك الدخول الآن
                                    </Badge>
                                  ) : (
                                    <Badge className="bg-gray-400/20 text-gray-600 dark:text-gray-400 border-gray-400/30 text-xs sm:text-sm">
                                      <XCircle className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                                      في انتظار التفعيل
                                    </Badge>
                                  )}
                                </div>

                                <Button
                                  onClick={() => joinSession(session)}
                                  disabled={!session.isEnabled || joiningSession === session.id}
                                  className={`w-full sm:w-auto ${
                                    session.isEnabled
                                      ? 'bg-green-600 hover:bg-green-700 text-white'
                                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  } px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base font-bold`}
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
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* My Enrollments */}
      <section className="py-10 sm:py-16 bg-light-beige dark:bg-gray-900 transition-colors">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-between items-center mb-6 sm:mb-8 gap-3">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-arabic-serif text-islamic-green dark:text-green-400">
              دوراتي المسجلة
            </h2>
            <Button 
              onClick={() => setLocation("/courses")}
              variant="outline"
              size="sm"
              className="text-sm"
              data-testid="button-view-all-courses"
            >
              عرض جميع الدورات
            </Button>
          </div>
          
          {enrollmentsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="animate-pulse" data-testid={`enrollment-skeleton-${i}`}>
                  <CardContent className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-2 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : enrollments && Array.isArray(enrollments) && enrollments.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="enrollments-grid">
              {enrollments.map((enrollment: any) => (
                <Card key={enrollment.id} className="islamic-card">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2">دورة مسجلة</h3>
                    <p className="text-gray-600 mb-4">
                      تاريخ التسجيل: {new Date(enrollment.enrollmentDate).toLocaleDateString('ar')}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-islamic-green h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${enrollment.progress || 0}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      التقدم: {enrollment.progress || 0}%
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12" data-testid="no-enrollments">
              <CardContent>
                <BookOpen className="text-6xl text-gray-300 mb-4 mx-auto" size={96} />
                <h3 className="text-xl font-semibold mb-2">لم تسجل في أي دورة بعد</h3>
                <p className="text-gray-600 mb-6">ابدأ رحلتك التعليمية بالتسجيل في إحدى دوراتنا</p>
                <Button 
                  onClick={() => setLocation("/courses")}
                  className="btn-islamic-primary"
                  data-testid="button-browse-courses-empty"
                >
                  استكشف الدورات المتاحة
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-10 sm:py-16 bg-light-beige">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold font-arabic-serif text-islamic-green text-center mb-8 sm:mb-12">
            إجراءات سريعة
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <Card className="islamic-card cursor-pointer hover-elevate" onClick={() => setLocation("/quran")}>
              <CardContent className="p-4 sm:p-6 text-center">
                <BookOpen className="text-islamic-green mb-3 sm:mb-4 mx-auto" size={48} />
                <h3 className="text-lg sm:text-xl font-bold mb-2">قسم القرآن الكريم</h3>
                <p className="text-sm sm:text-base text-gray-600">ابدأ رحلة حفظ القرآن الكريم</p>
              </CardContent>
            </Card>
            
            <Card className="islamic-card cursor-pointer hover-elevate" onClick={() => setLocation("/courses")}>
              <CardContent className="p-4 sm:p-6 text-center">
                <Calendar className="text-warm-gold mb-3 sm:mb-4 mx-auto" size={48} />
                <h3 className="text-lg sm:text-xl font-bold mb-2">الدورات المتاحة</h3>
                <p className="text-sm sm:text-base text-gray-600">تصفح جميع الدورات التعليمية</p>
              </CardContent>
            </Card>
            
            <Card className="islamic-card cursor-pointer hover-elevate" onClick={() => setLocation("/about")}>
              <CardContent className="p-4 sm:p-6 text-center">
                <Users className="text-earth-brown mb-3 sm:mb-4 mx-auto" size={48} />
                <h3 className="text-lg sm:text-xl font-bold mb-2">من نحن</h3>
                <p className="text-sm sm:text-base text-gray-600">تعرف على رسالتنا ورؤيتنا</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
