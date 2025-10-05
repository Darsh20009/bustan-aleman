
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useToast } from '../hooks/use-toast';
import { Users, BookOpen, Calendar, Clock, Award, Video, AlertTriangle } from 'lucide-react';

interface Student {
  id: string;
  studentName: string;
  phoneNumber: string;
  currentLevel: string;
  memorizedSurahs: string;
  errors?: any[];
  sessions?: any[];
  schedules?: any[];
  progress?: any;
}

export function SheikhDashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // WebSocket connection
  useEffect(() => {
    const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      const userId = sessionStorage.getItem('userId');
      if (userId) {
        ws.send(JSON.stringify({
          type: 'auth',
          payload: { userId, role: 'supervisor' }
        }));
      }
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'new_student') {
        toast({
          title: "طالب جديد! 🎓",
          description: `تم تسجيل الطالب ${data.student.studentName}`,
        });
        fetchStudents();
      }
    };
    
    return () => ws.close();
  }, []);
  
  useEffect(() => {
    fetchStudents();
  }, []);
  
  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/sheikh/students');
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "خطأ",
        description: "فشل في جلب بيانات الطلاب",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const enableSession = async (studentId: string, schedule: any) => {
    try {
      const response = await fetch('/api/sheikh/enable-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          scheduleId: schedule.id,
          sessionDate: new Date().toISOString().split('T')[0],
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          zoomLink: schedule.zoomLink,
        }),
      });
      
      if (response.ok) {
        toast({
          title: "تم تفعيل الحصة ✅",
          description: "يمكن للطالب الدخول الآن",
        });
      }
    } catch (error) {
      console.error('Error enabling session:', error);
      toast({
        title: "خطأ",
        description: "فشل في تفعيل الحصة",
        variant: "destructive",
      });
    }
  };
  
  const createAssignment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedStudent) return;
    
    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await fetch('/api/sheikh/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          assignmentDate: new Date().toISOString().split('T')[0],
          memorization: formData.get('memorization'),
          review: formData.get('review'),
          mistakes: formData.get('mistakes'),
          notes: formData.get('notes'),
        }),
      });
      
      if (response.ok) {
        toast({
          title: "تم إنشاء التكليف ✅",
          description: "تم إرسال التكليف للطالب",
        });
        e.currentTarget.reset();
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast({
        title: "خطأ",
        description: "فشل في إنشاء التكليف",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-islamic p-6" dir="rtl">
        <div className="text-center">
          <div className="islamic-spinner w-16 h-16 mx-auto mb-4"></div>
          <p className="text-islamic-emerald font-arabic-sans">جاري التحميل...</p>
        </div>
      </div>
    );
  }

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
          <Card className="islamic-card">
            <CardContent className="p-6 text-center">
              <Users className="w-12 h-12 text-islamic-emerald mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-islamic-emerald">{students.length}</h3>
              <p className="text-gray-600 font-arabic-sans">إجمالي الطلاب</p>
            </CardContent>
          </Card>
          
          <Card className="islamic-card">
            <CardContent className="p-6 text-center">
              <Calendar className="w-12 h-12 text-warm-gold mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-warm-gold">
                {students.filter(s => s.sessions && s.sessions.length > 0).length}
              </h3>
              <p className="text-gray-600 font-arabic-sans">طلاب نشطون</p>
            </CardContent>
          </Card>
          
          <Card className="islamic-card">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-2" />
              <h3 className="text-2xl font-bold text-red-500">
                {students.reduce((sum, s) => sum + (s.errors?.filter(e => !e.isResolved).length || 0), 0)}
              </h3>
              <p className="text-gray-600 font-arabic-sans">أخطاء تحتاج مراجعة</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="students" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="students">الطلاب</TabsTrigger>
            <TabsTrigger value="assignments">التكليفات</TabsTrigger>
            <TabsTrigger value="sessions">الحصص</TabsTrigger>
          </TabsList>

          <TabsContent value="students">
            <Card className="islamic-card">
              <CardHeader>
                <CardTitle className="font-arabic-sans">قائمة الطلاب</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-4 bg-pearl-cream rounded-lg hover:bg-desert-sand/30 transition-colors cursor-pointer"
                      onClick={() => setSelectedStudent(student)}
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
                      {student.schedules && student.schedules.length > 0 && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            enableSession(student.id, student.schedules[0]);
                          }}
                          className="btn-islamic-gradient"
                        >
                          <Video className="w-4 h-4 ml-2" />
                          تفعيل الحصة
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignments">
            {selectedStudent ? (
              <Card className="islamic-card">
                <CardHeader>
                  <CardTitle className="font-arabic-sans">
                    إنشاء تكليف جديد - {selectedStudent.studentName}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={createAssignment} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 font-arabic-sans">
                        الحفظ الجديد
                      </label>
                      <Textarea
                        name="memorization"
                        placeholder="مثال: سورة البقرة من الآية 1 إلى 10"
                        className="w-full"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2 font-arabic-sans">
                        المراجعة
                      </label>
                      <Textarea
                        name="review"
                        placeholder="مثال: سورة الفاتحة كاملة"
                        className="w-full"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2 font-arabic-sans">
                        الأخطاء
                      </label>
                      <Textarea
                        name="mistakes"
                        placeholder="أخطاء اليوم (اختياري)"
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2 font-arabic-sans">
                        ملاحظات
                      </label>
                      <Textarea
                        name="notes"
                        placeholder="ملاحظات إضافية (اختياري)"
                        className="w-full"
                      />
                    </div>
                    
                    <Button type="submit" className="w-full btn-islamic-gradient">
                      إنشاء التكليف وإرساله
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Card className="islamic-card">
                <CardContent className="p-12 text-center">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-arabic-sans">
                    اختر طالباً من القائمة لإنشاء تكليف
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="sessions">
            <Card className="islamic-card">
              <CardHeader>
                <CardTitle className="font-arabic-sans">جدول الحصص</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {students.filter(s => s.schedules && s.schedules.length > 0).map((student) => (
                    student.schedules!.map((schedule: any) => (
                      <div
                        key={`${student.id}-${schedule.id}`}
                        className="flex items-center justify-between p-4 bg-pearl-cream rounded-lg"
                      >
                        <div>
                          <h3 className="font-bold text-islamic-emerald font-arabic-sans">
                            {student.studentName}
                          </h3>
                          <p className="text-sm text-copper-bronze font-arabic-sans">
                            <Clock className="w-4 h-4 inline ml-1" />
                            {schedule.startTime} - {schedule.endTime}
                          </p>
                        </div>
                        <Button
                          onClick={() => enableSession(student.id, schedule)}
                          className="btn-islamic-gradient"
                        >
                          <Video className="w-4 h-4 ml-2" />
                          تفعيل الحلقة
                        </Button>
                      </div>
                    ))
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
