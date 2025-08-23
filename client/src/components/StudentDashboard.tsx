import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useToast } from '../hooks/use-toast';

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
}

export function StudentDashboard({ student, onLogout, onQuranReader }: StudentDashboardProps) {
  const [progress, setProgress] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load progress from localStorage
    const savedProgress = localStorage.getItem(`progress_${student.id}`);
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress));
    }
  }, [student.id]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-4"
          >
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: 'Amiri, serif' }}>
                مرحباً، {student.studentName}
              </h1>
              <p className="text-blue-200">
                المستوى: {student.currentLevel === 'advanced' ? 'متقدم' : 'مبتدئ'}
              </p>
            </div>
          </motion.div>

          <div className="flex items-center space-x-4">
            <Button
              onClick={onQuranReader}
              className="bg-white/20 hover:bg-white/30 text-white border-0"
            >
              📖 قارئ القرآن
            </Button>
            <Button
              onClick={onLogout}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-md">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="progress">التقدم</TabsTrigger>
            <TabsTrigger value="schedule">الجدول</TabsTrigger>
            <TabsTrigger value="payments">الاشتراك</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Memorized Surahs */}
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-blue-700 flex items-center">
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
                <div className="grid gap-4 md:grid-cols-3">
                  <Button
                    onClick={onQuranReader}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-6"
                  >
                    📖 ابدأ القراءة
                  </Button>
                  <Button
                    onClick={handleRenewalRequest}
                    variant="outline"
                    className="border-blue-300 text-blue-700 py-6"
                  >
                    💰 طلب تجديد
                  </Button>
                  <Button
                    variant="outline"
                    className="border-green-300 text-green-700 py-6"
                    onClick={() => {
                      const zoomLink = student.schedules?.[0]?.zoomLink;
                      if (zoomLink) {
                        window.open(zoomLink, '_blank');
                      }
                    }}
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
                          onClick={() => window.open(schedule.zoomLink, '_blank')}
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