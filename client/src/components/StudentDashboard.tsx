import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useToast } from '../hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { User, BookOpen, Calendar, Clock, Award, Home, LogOut, Video, CheckCircle, AlertTriangle, Phone, GraduationCap } from 'lucide-react';

interface Student {
  id: string;
  studentName: string;
  email: string;
  memorizedSurahs: string[];
  currentLevel: string;
  schedules: any[];
  errors: any[];
  sessions: any[];
  payments: any[];
}

interface StudentDashboardProps {
  student: Student;
  onLogout: () => void;
  onQuranReader: () => void;
  onProfile?: () => void;
  onMyCourses?: () => void;
  onMyNotes?: () => void;
  onJoinSession?: () => void;
}

export function StudentDashboard({ student, onLogout, onQuranReader, onProfile, onMyCourses, onMyNotes, onJoinSession }: StudentDashboardProps) {
  const [progress, setProgress] = useState<any>(null);
  const [isNewStudent, setIsNewStudent] = useState<boolean>(false);
  const [classAccess, setClassAccess] = useState<any>(null);
  const [checkingAccess, setCheckingAccess] = useState(false);
  const { toast } = useToast();

  const { data: certificates = [], isLoading: certificatesLoading, isError: certificatesError } = useQuery<any[]>({
    queryKey: ['/api/certificates'],
    enabled: !!student.id,
  });

  const { data: myCourses = [], isLoading: coursesLoading, isError: coursesError } = useQuery<any[]>({
    queryKey: ['/api/my-courses'],
    enabled: !!student.id,
  });

  // Check class access periodically
  useEffect(() => {
    checkClassAccess();
    const interval = setInterval(checkClassAccess, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const checkClassAccess = async () => {
    setCheckingAccess(true);
    try {
      const response = await fetch('/api/student/class-access');
      if (response.ok) {
        const data = await response.json();
        setClassAccess(data);
      }
    } catch (error) {
      console.error('Error checking class access:', error);
    } finally {
      setCheckingAccess(false);
    }
  };

  const joinClass = () => {
    if (classAccess?.canAccess) {
      if (onJoinSession) {
        onJoinSession();
        toast({
          title: '🎓 الانتقال للحصة',
          description: 'سيتم فتح صفحة الحصص المباشرة'
        });
      }
    } else {
      toast({
        title: 'خطأ',
        description: 'الحصة غير متاحة حالياً. انتظر حتى يفعل الشيخ الحصة',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    // Load progress from localStorage
    const savedProgress = localStorage.getItem(`progress_${student.id}`);
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress));
    }

    // Check if this is a new student (no progress saved and no sessions)
    const hasNoProgress = !savedProgress;
    const hasNoSessions = !student.sessions || student.sessions.length === 0;
    const isNew = hasNoProgress && hasNoSessions;

    if (isNew) {
      setIsNewStudent(true);
      // Show welcome message for new students
      setTimeout(() => {
        toast({
          title: "مرحباً بك في بستان الإيمان! 🌸",
          description: "نتطلع لرحلة تعلم ممتعة معك",
        });
      }, 1000);
    }
  }, [student.id, student.sessions, toast]);

  const saveProgress = (newProgress: any) => {
    setProgress(newProgress);
    localStorage.setItem(`progress_${student.id}`, JSON.stringify(newProgress));
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return days[dayOfWeek];
  };

  const handleRenewalRequest = async () => {
    try {
      const response = await fetch('/api/request-renewal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionsRequested: 8 }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "تم إرسال طلب التجديد 📱",
          description: "سيتم التواصل معك عبر الواتساب قريباً",
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: "خطأ في إرسال الطلب",
        description: "يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    }
  };

  const getActivePayment = () => {
    return student.payments?.find(p => p.status === 'active') || null;
  };

  const getCurrentSession = () => {
    return student.sessions?.[student.sessions.length - 1] || null;
  };

  const activePayment = getActivePayment();
  const currentSession = getCurrentSession();

  const handleLogout = async () => {
    console.log('handleLogout called');
    try {
      // Force logout immediately first
      onLogout();
      
      // Show success message
      toast({
        title: "تم تسجيل الخروج بنجاح",
        description: "شكراً لك على استخدام بستان الإيمان"
      });

      // Then try to logout from server
      const response = await fetch('/api/student-logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('Logout response:', response.status);
    } catch (error) {
      console.error('Logout error:', error);
      // Already logged out, so no need to do anything else
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-emerald-50 to-emerald-100 dark:from-slate-900 dark:via-emerald-950 dark:to-slate-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700 dark:from-emerald-900 dark:via-emerald-800 dark:to-emerald-900 text-white p-4 md:p-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center flex-wrap">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2 md:space-x-4"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <h1 className="text-lg md:text-2xl font-bold" style={{ fontFamily: 'Amiri, serif' }}>
                مرحباً، {student.studentName}
              </h1>
              <p className="text-emerald-100 text-sm md:text-base">
                المستوى: {student.currentLevel === 'advanced' ? 'متقدم' : 'مبتدئ'}
              </p>
            </div>
          </motion.div>

          {/* Class Access Status - Show in header */}
          {classAccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 md:mb-0"
            >
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                classAccess.canAccess 
                  ? 'bg-green-500/20 text-green-100 border border-green-400/30' 
                  : 'bg-orange-500/20 text-orange-100 border border-orange-400/30'
              }`}>
                {classAccess.canAccess ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Clock className="h-4 w-4" />
                )}
                <span>
                  {classAccess.canAccess ? 'يمكنك الدخول للحصة الآن!' : classAccess.reason}
                </span>
              </div>
            </motion.div>
          )}

          <div className="flex items-center gap-2 flex-wrap mt-2 md:mt-0">
            <Button
              onClick={onQuranReader}
              className="bg-white/20 hover:bg-white/30 text-white border-0 px-3 py-2 text-sm md:px-4 md:text-base"
            >
              <BookOpen className="mr-1 md:mr-2 h-4 w-4" />
              قارئ القرآن
            </Button>
            {/* Enhanced Join Class Button */}
            <Button
              onClick={joinClass}
              disabled={checkingAccess}
              className={`${
                classAccess?.canAccess
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-white/20 hover:bg-white/30 text-white'
              } border-0 px-3 py-2 text-sm md:px-4 md:text-base`}
            >
              <Video className="mr-1 md:mr-2 h-4 w-4" />
              {checkingAccess ? 'جاري التحقق...' : 'دخول الحصة'}
            </Button>
            {onMyCourses && (
              <Button
                onClick={onMyCourses}
                className="bg-white/20 hover:bg-white/30 text-white border-0 px-3 py-2 text-sm md:px-4 md:text-base"
              >
                <Award className="mr-1 md:mr-2 h-4 w-4" />
                دوراتي
              </Button>
            )}
            {onProfile && (
              <Button
                onClick={onProfile}
                className="bg-white/20 hover:bg-white/30 text-white border-0 px-3 py-2 text-sm md:px-4 md:text-base"
              >
                <User className="mr-1 md:mr-2 h-4 w-4" />
                الملف
              </Button>
            )}
            <Button
              onClick={() => {
                console.log('Logout button clicked');
                handleLogout();
              }}
              variant="outline"
              className="border-white/50 text-white hover:bg-white/20 hover:border-white/70 px-3 py-2 text-sm md:px-4 md:text-base transition-all duration-200 cursor-pointer"
            >
              <LogOut className="mr-1 md:mr-2 h-4 w-4" />
              خروج
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-3 md:p-6">
        {/* Welcome Section for New Students */}
        {isNewStudent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
              <CardHeader>
                <CardTitle className="text-center text-amber-800 text-xl md:text-2xl font-amiri flex items-center justify-center gap-2">
                  <Award className="w-6 h-6 md:w-8 md:h-8" />
                  أهلاً وسهلاً بك في بستان الإيمان
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-amber-700 text-base md:text-lg">
                  نرحب بك في رحلة تعلم القرآن الكريم والعلوم الشرعية. نحن هنا لمساعدتك على تحقيق أهدافك التعليمية.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={onQuranReader}
                    className="bg-amber-600 hover:bg-amber-700 px-6 py-2 text-sm md:text-base"
                  >
                    <BookOpen className="ml-2 h-4 w-4" />
                    ابدأ بقراءة القرآن
                  </Button>
                  <Button
                    onClick={() => setIsNewStudent(false)}
                    variant="outline"
                    className="border-amber-300 text-amber-700 hover:bg-amber-50 px-6 py-2 text-sm md:text-base"
                  >
                    استكشف لوحة التحكم
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <Tabs defaultValue="overview" className="space-y-4 md:space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-white shadow-md">
            <TabsTrigger value="overview" className="text-sm md:text-base">نظرة عامة</TabsTrigger>
            <TabsTrigger value="progress" className="text-sm md:text-base">التقدم</TabsTrigger>
            <TabsTrigger value="schedule" className="text-sm md:text-base">الجدول</TabsTrigger>
            <TabsTrigger value="payments" className="text-sm md:text-base">الاشتراك</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 md:space-y-6">
            <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Certificates Card */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-amber-50 backdrop-blur-sm hover:shadow-xl transition-shadow cursor-pointer" onClick={() => window.location.href = '/certificates'} data-testid="card-certificates">
                <CardHeader>
                  <CardTitle className="text-amber-700 flex items-center justify-between text-sm md:text-base">
                    <span className="flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      الشهادات
                    </span>
                    {!certificatesLoading && certificates.length > 0 && (
                      <Badge variant="secondary" className="bg-amber-600 text-white">
                        {certificates.length}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {certificatesLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto"></div>
                    </div>
                  ) : certificatesError ? (
                    <div className="text-center py-4">
                      <p className="text-red-600 text-sm">خطأ في تحميل الشهادات</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-3xl font-bold text-amber-600 mb-2">
                        {certificates.length}
                      </div>
                      <p className="text-gray-600 text-sm">
                        {certificates.length === 0 ? 'لا توجد شهادات بعد' : 'شهادة محصّلة'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Courses Card */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50 backdrop-blur-sm hover:shadow-xl transition-shadow cursor-pointer" onClick={onMyCourses} data-testid="card-courses">
                <CardHeader>
                  <CardTitle className="text-blue-700 flex items-center justify-between text-sm md:text-base">
                    <span className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5" />
                      دوراتي
                    </span>
                    {!coursesLoading && myCourses.length > 0 && (
                      <Badge variant="secondary" className="bg-blue-600 text-white">
                        {myCourses.length}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {coursesLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                  ) : coursesError ? (
                    <div className="text-center py-4">
                      <p className="text-red-600 text-sm">خطأ في تحميل الدورات</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {myCourses.filter((c: any) => c.status === 'active' || c.status === 'enrolled').length}
                      </div>
                      <p className="text-gray-600 text-sm">
                        {myCourses.length === 0 ? 'لا توجد دورات مسجلة' : 'دورة نشطة'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Memorized Surahs */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-amber-700 flex items-center text-sm md:text-base">
                    🌟 السور المحفوظة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {student.memorizedSurahs?.length > 0 ? (
                      student.memorizedSurahs.map((surah, index) => (
                        <Badge key={index} variant="outline" className="w-full justify-center py-2">
                          {surah}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center">لم يتم حفظ سور بعد</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Current Session */}
              {currentSession && (
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-blue-700 flex items-center">
                      📅 الحصة الحالية
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p><strong>الرقم:</strong> {currentSession.sessionNumber}</p>
                      <p><strong>التاريخ:</strong> {currentSession.sessionDate}</p>
                      <p><strong>التقييم:</strong> {currentSession.evaluationGrade}</p>
                      <p><strong>الحصة القادمة:</strong> {currentSession.nextSessionDate}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Errors Summary */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-blue-700 flex items-center">
                    ⚠️ الأخطاء
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-500">
                      {student.errors?.filter(e => !e.isResolved).length || 0}
                    </div>
                    <p className="text-gray-600">أخطاء تحتاج مراجعة</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-blue-700">إجراءات سريعة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                  <Button
                    onClick={onQuranReader}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-6"
                    data-testid="button-quran-reader"
                  >
                    📖 ابدأ القراءة
                  </Button>
                  <Button
                    onClick={onMyNotes}
                    variant="outline"
                    className="border-emerald-300 text-emerald-700 py-6"
                    data-testid="button-my-notes"
                  >
                    📝 ملاحظاتي
                  </Button>
                  <Button
                    onClick={handleRenewalRequest}
                    variant="outline"
                    className="border-blue-300 text-blue-700 py-6"
                    data-testid="button-renewal"
                  >
                    💰 طلب تجديد
                  </Button>
                  <Button
                    variant="outline"
                    className="border-green-300 text-green-700 py-6"
                    onClick={joinClass}
                    data-testid="button-join-class"
                  >
                    📹 دخول الحلقة
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-blue-700">تقدم الحفظ</CardTitle>
                <CardDescription>
                  متابعة تقدمك في حفظ القرآن الكريم
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {student.errors?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-red-600">الأخطاء التي تحتاج مراجعة:</h3>
                    <div className="space-y-3">
                      {student.errors.filter(e => !e.isResolved).map((error, index) => (
                        <div key={index} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-red-800">
                                سورة {error.surah} - آية {error.ayahNumber}
                              </p>
                              <p className="text-red-600 text-sm mt-1">
                                {error.errorDescription}
                              </p>
                            </div>
                            <Badge variant="destructive">غير محلول</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentSession?.newMaterial && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">المادة الجديدة:</h4>
                    <p className="text-blue-700">{currentSession.newMaterial}</p>
                  </div>
                )}

                {currentSession?.reviewMaterial && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">المراجعة:</h4>
                    <p className="text-green-700">{currentSession.reviewMaterial}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-blue-700">جدول الحلقات</CardTitle>
              </CardHeader>
              <CardContent>
                {student.schedules?.length > 0 ? (
                  <div className="grid gap-4">
                    {student.schedules.map((schedule, index) => (
                      <div key={index} className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                        <div>
                          <p className="font-semibold">{getDayName(schedule.dayOfWeek)}</p>
                          <p className="text-gray-600">
                            {schedule.startTime} - {schedule.endTime}
                          </p>
                        </div>
                        <Button
                          onClick={joinClass}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          دخول الحلقة
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500">لا توجد حلقات مجدولة</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-blue-700">معلومات الاشتراك</CardTitle>
              </CardHeader>
              <CardContent>
                {activePayment ? (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="font-semibold text-green-800">المبلغ الشهري</h4>
                        <p className="text-2xl font-bold text-green-600">
                          {activePayment.amount} {activePayment.currency}
                        </p>
                      </div>
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-semibold text-blue-800">الحصص المتبقية</h4>
                        <p className="text-2xl font-bold text-blue-600">
                          {activePayment.sessionsRemaining} من {activePayment.sessionsIncluded}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">تاريخ انتهاء الاشتراك</h4>
                      <p className="text-gray-700">{activePayment.expiryDate}</p>

                      <div className="mt-4">
                        <Progress 
                          value={(activePayment.sessionsRemaining / activePayment.sessionsIncluded) * 100} 
                          className="w-full"
                        />
                        <p className="text-sm text-gray-600 mt-2">
                          استخدمت {activePayment.sessionsIncluded - activePayment.sessionsRemaining} حصة
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={handleRenewalRequest}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3"
                    >
                      📱 طلب تجديد الاشتراك
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">لا توجد معلومات اشتراك</p>
                    <Button onClick={handleRenewalRequest}>
                      اشترك الآن
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}