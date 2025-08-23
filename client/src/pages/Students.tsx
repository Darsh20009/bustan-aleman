import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, DollarSign, BookOpen, AlertTriangle, CheckCircle, Video, Users, Star, Target } from "lucide-react";
import { useState } from "react";

export default function Students() {
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  const { data: students, isLoading } = useQuery({
    queryKey: ["/api/students"],
  });

  const { data: studentSessions } = useQuery({
    queryKey: ["/api/students", selectedStudent, "sessions"],
    enabled: !!selectedStudent,
  });

  const { data: studentErrors } = useQuery({
    queryKey: ["/api/students", selectedStudent, "errors"],
    enabled: !!selectedStudent,
  });

  const { data: studentPayments } = useQuery({
    queryKey: ["/api/students", selectedStudent, "payments"],
    enabled: !!selectedStudent,
  });

  const { data: studentSchedules } = useQuery({
    queryKey: ["/api/students", selectedStudent, "schedules"],
    enabled: !!selectedStudent,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-white">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-islamic-green mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري تحميل بيانات الطلاب...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const selectedStudentData = Array.isArray(students) ? students.find((s: any) => s.id === selectedStudent) : null;

  const getDayName = (dayOfWeek: number) => {
    const days = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
    return days[dayOfWeek];
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="min-h-screen bg-warm-white">
      <Navigation />
      
      {/* Header */}
      <section className="hero-section">
        <div className="islamic-pattern-overlay"></div>
        <div className="hero-content container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold font-arabic-serif mb-6" data-testid="page-title">
            إدارة الطلاب
          </h1>
          <p className="text-xl mb-8 opacity-90">
            متابعة تقدم الطلاب في حفظ القرآن الكريم وإدارة حصصهم ومدفوعاتهم
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Students List Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users size={20} />
                  قائمة الطلاب
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.isArray(students) && students.map((student: any) => (
                    <div
                      key={student.id}
                      className={`p-4 rounded-lg cursor-pointer transition-all border ${
                        selectedStudent === student.id
                          ? 'bg-islamic-green text-white border-islamic-green'
                          : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                      }`}
                      onClick={() => setSelectedStudent(student.id)}
                      data-testid={`student-${student.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold">{student.studentName}</h3>
                          <p className={`text-sm ${selectedStudent === student.id ? 'text-white/80' : 'text-gray-600'}`}>
                            {student.currentLevel === 'advanced' ? 'متقدم' : 'مبتدئ'}
                          </p>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${student.isActive ? 'bg-green-400' : 'bg-red-400'}`}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>إحصائيات سريعة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>إجمالي الطلاب</span>
                    <Badge>{Array.isArray(students) ? students.length : 0}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>الطلاب النشطين</span>
                    <Badge variant="secondary">
                      {Array.isArray(students) ? students.filter((s: any) => s.isActive).length : 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>الطلاب المدفوعين</span>
                    <Badge className="bg-green-100 text-green-800">
                      {Array.isArray(students) ? students.filter((s: any) => s.isPaid).length : 0}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Student Details */}
          <div className="lg:col-span-3">
            {selectedStudentData ? (
              <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="grid grid-cols-5 w-full" data-testid="student-tabs">
                  <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
                  <TabsTrigger value="sessions">الحصص</TabsTrigger>
                  <TabsTrigger value="errors">الأخطاء</TabsTrigger>
                  <TabsTrigger value="payments">المدفوعات</TabsTrigger>
                  <TabsTrigger value="schedule">الجدول</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  
                  {/* Student Header */}
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-islamic-green text-white rounded-full flex items-center justify-center text-2xl font-bold">
                            {selectedStudentData.studentName.charAt(0)}
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-islamic-green">{selectedStudentData.studentName}</h2>
                            <p className="text-gray-600">{selectedStudentData.grade}</p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant={selectedStudentData.currentLevel === 'advanced' ? 'default' : 'secondary'}>
                                {selectedStudentData.currentLevel === 'advanced' ? 'متقدم' : 'مبتدئ'}
                              </Badge>
                              <Badge variant={selectedStudentData.isActive ? 'default' : 'destructive'}>
                                {selectedStudentData.isActive ? 'نشط' : 'غير نشط'}
                              </Badge>
                              <Badge variant={selectedStudentData.isPaid ? 'default' : 'destructive'}>
                                {selectedStudentData.isPaid ? 'مدفوع' : 'غير مدفوع'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="text-sm text-gray-600">تاريخ الميلاد</p>
                          <p className="font-bold">{selectedStudentData.dateOfBirth}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                      <CardContent className="p-6 text-center">
                        <Calendar className="text-3xl text-islamic-green mb-4 mx-auto" size={48} />
                        <h3 className="text-2xl font-bold text-islamic-green mb-2">
                          {selectedStudentData.monthlySessionsCount}
                        </h3>
                        <p className="text-gray-600">حصص شهرية</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6 text-center">
                        <DollarSign className="text-3xl text-warm-gold mb-4 mx-auto" size={48} />
                        <h3 className="text-2xl font-bold text-warm-gold mb-2">
                          {selectedStudentData.monthlyPrice} ر.س
                        </h3>
                        <p className="text-gray-600">الاشتراك الشهري</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="p-6 text-center">
                        <BookOpen className="text-3xl text-earth-brown mb-4 mx-auto" size={48} />
                        <h3 className="text-2xl font-bold text-earth-brown mb-2">
                          {JSON.parse(selectedStudentData.memorizedSurahs || '[]').length}
                        </h3>
                        <p className="text-gray-600">السور المحفوظة</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6 text-center">
                        <Target className="text-3xl text-purple-600 mb-4 mx-auto" size={48} />
                        <h3 className="text-2xl font-bold text-purple-600 mb-2">
                          {Array.isArray(studentErrors) ? studentErrors.filter((e: any) => !e.isResolved).length : 0}
                        </h3>
                        <p className="text-gray-600">أخطاء تحتاج مراجعة</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Memorized Surahs */}
                  <Card>
                    <CardHeader>
                      <CardTitle>السور المحفوظة</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {JSON.parse(selectedStudentData.memorizedSurahs || '[]').map((surah: string, index: number) => (
                          <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {surah}
                          </Badge>
                        ))}
                      </div>
                      {JSON.parse(selectedStudentData.memorizedSurahs || '[]').length === 0 && (
                        <p className="text-gray-500 italic">لم يحفظ أي سورة بعد</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Notes */}
                  <Card>
                    <CardHeader>
                      <CardTitle>ملاحظات</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 leading-relaxed">{selectedStudentData.notes}</p>
                    </CardContent>
                  </Card>

                  {/* Contact Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle>معلومات التواصل</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <span className="text-green-600 text-sm">📱</span>
                          </div>
                          <div>
                            <p className="font-medium">واتساب</p>
                            <p className="text-gray-600">{selectedStudentData.whatsappContact}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Video className="text-blue-600" size={20} />
                          <div>
                            <p className="font-medium">رابط الزوم</p>
                            <a href={selectedStudentData.zoomLink} target="_blank" rel="noopener noreferrer" 
                               className="text-blue-600 hover:underline text-sm break-all">
                              {selectedStudentData.zoomLink}
                            </a>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Sessions Tab */}
                <TabsContent value="sessions">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock size={20} />
                        سجل الحصص
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {Array.isArray(studentSessions) && studentSessions.length > 0 ? (
                        <div className="space-y-4">
                          {studentSessions.map((session: any) => (
                            <div key={session.id} className="border rounded-lg p-4">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h3 className="font-bold">الحصة رقم {session.sessionNumber}</h3>
                                  <p className="text-gray-600">{session.sessionDate} - {session.sessionTime}</p>
                                </div>
                                <div className="flex gap-2">
                                  <Badge variant={session.attended ? 'default' : 'destructive'}>
                                    {session.attended ? 'حضر' : 'غاب'}
                                  </Badge>
                                  <Badge variant="outline">{session.evaluationGrade}</Badge>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                  <h4 className="font-medium text-green-700 mb-2">المادة الجديدة</h4>
                                  <p className="text-sm text-gray-700 bg-green-50 p-3 rounded">
                                    {session.newMaterial}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="font-medium text-blue-700 mb-2">المراجعة</h4>
                                  <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded">
                                    {session.reviewMaterial}
                                  </p>
                                </div>
                              </div>
                              
                              {session.notes && (
                                <div className="mt-4">
                                  <h4 className="font-medium mb-2">ملاحظات</h4>
                                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                                    {session.notes}
                                  </p>
                                </div>
                              )}
                              
                              {session.nextSessionDate && (
                                <div className="mt-4 text-sm text-gray-600">
                                  <strong>الحصة القادمة:</strong> {session.nextSessionDate}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Clock className="text-6xl text-gray-400 mb-4 mx-auto" size={96} />
                          <p className="text-gray-500">لا توجد حصص مسجلة للطالب</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Errors Tab */}
                <TabsContent value="errors">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle size={20} />
                        سجل الأخطاء
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {Array.isArray(studentErrors) && studentErrors.length > 0 ? (
                        <div className="space-y-4">
                          {studentErrors.map((error: any) => (
                            <div key={error.id} className="border rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-bold text-red-700">{error.surah} - الآية {error.ayahNumber}</h3>
                                  <p className="text-gray-600 mt-1">{error.errorDescription}</p>
                                  <p className="text-sm text-gray-500 mt-2">نوع الخطأ: {error.errorType}</p>
                                </div>
                                <Badge variant={error.isResolved ? 'default' : 'destructive'}>
                                  {error.isResolved ? 'تم الحل' : 'يحتاج مراجعة'}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <CheckCircle className="text-6xl text-green-400 mb-4 mx-auto" size={96} />
                          <p className="text-gray-500">لا توجد أخطاء مسجلة - أداء ممتاز!</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Payments Tab */}
                <TabsContent value="payments">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign size={20} />
                        سجل المدفوعات
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {Array.isArray(studentPayments) && studentPayments.length > 0 ? (
                        <div className="space-y-4">
                          {studentPayments.map((payment: any) => (
                            <div key={payment.id} className="border rounded-lg p-4">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h3 className="font-bold">{payment.amount} {payment.currency}</h3>
                                  <p className="text-gray-600">تاريخ الدفع: {payment.paymentDate}</p>
                                  <p className="text-sm text-gray-500">طريقة الدفع: {payment.paymentMethod}</p>
                                </div>
                                <Badge variant={payment.status === 'active' ? 'default' : 'secondary'}>
                                  {payment.status === 'active' ? 'نشط' : payment.status}
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                <div>
                                  <p className="text-sm text-gray-600">فترة الاشتراك</p>
                                  <p className="font-medium">{payment.subscriptionPeriod}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">الحصص المشمولة</p>
                                  <p className="font-medium">{payment.sessionsIncluded}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">الحصص المتبقية</p>
                                  <p className="font-medium text-green-600">{payment.sessionsRemaining}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">تاريخ الانتهاء</p>
                                  <p className="font-medium">{payment.expiryDate}</p>
                                </div>
                              </div>
                              
                              {payment.notes && (
                                <div className="mt-4">
                                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                                    {payment.notes}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <DollarSign className="text-6xl text-gray-400 mb-4 mx-auto" size={96} />
                          <p className="text-gray-500">لا توجد مدفوعات مسجلة</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Schedule Tab */}
                <TabsContent value="schedule">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar size={20} />
                        جدول الحصص الأسبوعي
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {Array.isArray(studentSchedules) && studentSchedules.length > 0 ? (
                        <div className="space-y-4">
                          {studentSchedules.map((schedule: any) => (
                            <div key={schedule.id} className="border rounded-lg p-4 flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-islamic-green text-white rounded-full flex items-center justify-center font-bold">
                                  {schedule.dayOfWeek}
                                </div>
                                <div>
                                  <h3 className="font-bold">{getDayName(schedule.dayOfWeek)}</h3>
                                  <p className="text-gray-600">
                                    من {formatTime(schedule.startTime)} إلى {formatTime(schedule.endTime)}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(schedule.zoomLink, '_blank')}
                                >
                                  <Video size={16} className="mr-1" />
                                  انضم للحصة
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Calendar className="text-6xl text-gray-400 mb-4 mx-auto" size={96} />
                          <p className="text-gray-500">لا يوجد جدول محدد للطالب</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="text-6xl text-gray-400 mb-4 mx-auto" size={96} />
                  <h3 className="text-xl font-bold text-gray-600 mb-2">اختر طالباً لعرض تفاصيله</h3>
                  <p className="text-gray-500">من القائمة الجانبية، اختر أحد الطلاب لعرض معلوماته الكاملة</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}