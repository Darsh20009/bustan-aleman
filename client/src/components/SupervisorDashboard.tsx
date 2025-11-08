import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Users, BookOpen, Calendar, AlertCircle, CheckCircle } from 'lucide-react';

interface Student {
  id: string;
  studentName: string;
  phoneNumber: string;
  currentLevel: string;
  memorizedSurahs: string;
  errors?: any[];
  sessions?: any[];
  isActive: boolean;
}

export function SupervisorDashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const wsUrl = window.location.protocol === 'https:' 
      ? `wss://${window.location.host}/ws`
      : `ws://${window.location.host}/ws`;
    
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      const userId = sessionStorage.getItem('userId');
      if (userId) {
        ws.current?.send(JSON.stringify({
          type: 'auth',
          payload: { userId, role: 'supervisor' }
        }));
      }
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'student_notification') {
        console.log('Received student notification:', data.payload);
      }
    };

    return () => {
      ws.current?.close();
    };
  }, []);

  const enableSessionAccess = (studentId: string) => {
    const sessionData = {
      sessionDate: new Date().toISOString().split('T')[0],
      sessionTime: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      isEnabled: true,
    };

    ws.current?.send(JSON.stringify({
      type: 'session_control',
      payload: {
        studentId,
        action: 'enable',
        data: sessionData
      }
    }));

    alert(`تم تفعيل رابط الحلقة للطالب`);
  };

  return (
    <div className="min-h-screen gradient-islamic p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-islamic-emerald mb-2 font-arabic-serif">
            لوحة تحكم الشيخ
          </h1>
          <p className="text-midnight-navy font-arabic-sans">
            إدارة الطلاب والحلقات والمراجعات
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/90 border-royal-gold/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-islamic-emerald font-arabic-sans">
                <Users className="w-5 h-5" />
                عدد الطلاب
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-midnight-navy">
                {students.length}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 border-royal-gold/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-islamic-emerald font-arabic-sans">
                <BookOpen className="w-5 h-5" />
                الحلقات اليوم
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-midnight-navy">5</p>
            </CardContent>
          </Card>

          <Card className="bg-white/90 border-royal-gold/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-islamic-emerald font-arabic-sans">
                <AlertCircle className="w-5 h-5" />
                الأخطاء المتكررة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-midnight-navy">12</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/90 border-royal-gold/30">
          <CardHeader>
            <CardTitle className="text-islamic-emerald font-arabic-sans">
              قائمة الطلاب
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {students.length === 0 ? (
                <div className="text-center py-8 text-copper-bronze font-arabic-sans">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>لا يوجد طلاب مسجلين حالياً</p>
                  <p className="text-sm mt-2">سيظهر الطلاب هنا عند تسجيلهم</p>
                </div>
              ) : (
                students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 bg-pearl-cream rounded-lg hover:bg-desert-sand/30 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-bold text-islamic-emerald mb-1 font-arabic-sans">
                        {student.studentName}
                      </h3>
                      <p className="text-sm text-copper-bronze font-arabic-sans">
                        {student.phoneNumber}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge className="bg-islamic-emerald/20 text-islamic-emerald">
                          {student.currentLevel}
                        </Badge>
                        {student.memorizedSurahs && (
                          <Badge className="bg-royal-gold/20 text-royal-gold">
                            {JSON.parse(student.memorizedSurahs || '[]').length} سورة محفوظة
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => enableSessionAccess(student.id)}
                        className="bg-islamic-emerald hover:bg-islamic-emerald/90 text-white font-arabic-sans"
                        data-testid={`button-enable-session-${student.id}`}
                      >
                        <Calendar className="w-4 h-4 ml-2" />
                        تفعيل الحلقة
                      </Button>
                      <Button
                        onClick={() => setSelectedStudent(student)}
                        variant="outline"
                        className="border-islamic-emerald text-islamic-emerald hover:bg-islamic-emerald/10 font-arabic-sans"
                        data-testid={`button-view-student-${student.id}`}
                      >
                        عرض التفاصيل
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {selectedStudent && (
          <Card className="mt-6 bg-white/90 border-royal-gold/30">
            <CardHeader>
              <CardTitle className="text-islamic-emerald font-arabic-sans">
                تفاصيل الطالب: {selectedStudent.studentName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-midnight-navy mb-3 font-arabic-sans">السور المحفوظة</h4>
                  <div className="space-y-2">
                    {JSON.parse(selectedStudent.memorizedSurahs || '[]').length === 0 ? (
                      <p className="text-copper-bronze font-arabic-sans">لا توجد سور محفوظة بعد</p>
                    ) : (
                      JSON.parse(selectedStudent.memorizedSurahs || '[]').map((surah: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-islamic-emerald" />
                          <span className="font-arabic-sans">{surah}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-midnight-navy mb-3 font-arabic-sans">الأخطاء الأخيرة</h4>
                  <div className="space-y-2">
                    {!selectedStudent.errors || selectedStudent.errors.length === 0 ? (
                      <p className="text-copper-bronze font-arabic-sans">لا توجد أخطاء مسجلة</p>
                    ) : (
                      selectedStudent.errors.slice(0, 5).map((error: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          <span className="text-sm font-arabic-sans">{error.errorDescription}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
