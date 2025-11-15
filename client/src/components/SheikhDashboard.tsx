import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useToast } from '../hooks/use-toast';
import { Users, BookOpen, Calendar, Clock, Award, Video, AlertTriangle, Star, TrendingUp, Bell, CheckCircle2, XCircle, PlusCircle, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { SurahAyahSelector } from './SurahAyahSelector';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import LiveSessionRoom from '../pages/LiveSessionRoom';
import { useAuth } from '../hooks/useAuth';

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

interface SheikhDashboardProps {
  onActiveRoomChange?: (roomId: string | null) => void;
}

export function SheikhDashboard({ onActiveRoomChange }: SheikhDashboardProps = {}) {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddStudentDialog, setShowAddStudentDialog] = useState(false);
  const [showAddScheduleDialog, setShowAddScheduleDialog] = useState(false);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null);
  const [newStudent, setNewStudent] = useState({
    studentName: '',
    phoneNumber: '',
    password: '',
    currentLevel: 'beginner',
    monthlyPrice: '0'
  });
  const [newSchedule, setNewSchedule] = useState({
    studentId: '',
    dayOfWeek: 0,
    startTime: '',
    endTime: ''
  });
  const { toast} = useToast();
  const { user } = useAuth();

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
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Session enabled response:', data);

        if (!data.roomToken) {
          toast({
            title: "خطأ",
            description: "فشل في إنشاء رمز الغرفة",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "تم تفعيل الحصة ✅",
          description: "جاري فتح غرفة الحصة المباشرة...",
        });

        // فتح غرفة الحصة المباشرة للشيخ باستخدام roomToken الموحد
        setTimeout(() => {
          setActiveRoomId(data.roomToken);
          setActiveStudentId(studentId);
        }, 500);
      } else {
        const errorData = await response.json();
        toast({
          title: "خطأ",
          description: errorData.message || "فشل في تفعيل الحصة",
          variant: "destructive",
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

  const [memorizationRanges, setMemorizationRanges] = useState('');
  const [reviewRanges, setReviewRanges] = useState('');
  const [mistakes, setMistakes] = useState('');
  const [notes, setNotes] = useState('');

  const createAssignment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedStudent) return;

    try {
      const response = await fetch('/api/sheikh/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          assignmentDate: new Date().toISOString().split('T')[0],
          memorization: memorizationRanges || '[]',
          review: reviewRanges || '[]',
          mistakes: mistakes,
          notes: notes,
        }),
      });

      if (response.ok) {
        toast({
          title: "تم إنشاء التكليف ✅",
          description: "تم إرسال التكليف للطالب",
        });
        setMemorizationRanges('');
        setReviewRanges('');
        setMistakes('');
        setNotes('');
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

  const [newStudentData, setNewStudentData] = useState({
    studentName: '',
    phoneNumber: '',
    password: '',
    currentLevel: 'beginner',
    monthlyPrice: '0'
  });

  const createStudent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/sheikh/students/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudentData),
      });

      if (response.ok) {
        toast({
          title: "تم إضافة الطالب ✅",
          description: `تم تسجيل الطالب ${newStudentData.studentName} بنجاح`,
        });
        setNewStudentData({
          studentName: '',
          phoneNumber: '',
          password: '',
          currentLevel: 'beginner',
          monthlyPrice: '0'
        });
        setShowAddStudentDialog(false);
        fetchStudents();
      }
    } catch (error) {
      console.error('Error creating student:', error);
      toast({
        title: "خطأ",
        description: "فشل في إضافة الطالب",
        variant: "destructive",
      });
    }
  };

  const createSchedule = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/sheikh/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSchedule),
      });

      if (response.ok) {
        toast({
          title: "تم إضافة الجدول ✅",
          description: "تم إضافة جدول الحصة بنجاح",
        });
        setNewSchedule({
          studentId: '',
          dayOfWeek: 0,
          startTime: '',
          endTime: ''
        });
        setShowAddScheduleDialog(false);
        fetchStudents();
      }
    } catch (error) {
      console.error('Error creating schedule:', error);
      toast({
        title: "خطأ",
        description: "فشل في إضافة الجدول",
        variant: "destructive",
      });
    }
  };

  // useEffect يجب أن يكون دائماً في نفس الترتيب - قبل أي return مشروط
  useEffect(() => {
    if (activeRoomId && onActiveRoomChange) {
      onActiveRoomChange(activeRoomId);
    }
    return () => {
      if (onActiveRoomChange) {
        onActiveRoomChange(null);
      }
    };
  }, [activeRoomId, onActiveRoomChange]);

  // إذا كان هناك حصة نشطة، اعرض غرفة الحصة المباشرة فقط إذا كانت جميع البيانات جاهزة
  if (activeRoomId && activeStudentId && user?.id) {
    return (
      <LiveSessionRoom
        roomId={activeRoomId}
        studentId={activeStudentId}
        sheikhId={user.id}
        onLeave={() => {
          setActiveRoomId(null);
          setActiveStudentId(null);
          toast({
            title: "تم مغادرة الحصة",
            description: "عودة إلى لوحة التحكم",
          });
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-6" dir="rtl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-emerald-700 text-lg font-medium">جاري التحميل...</p>
        </motion.div>
      </div>
    );
  }

  const activeStudents = students.filter(s => s.sessions && s.sessions.length > 0).length;
  const totalErrors = students.reduce((sum, s) => sum + (s.errors?.filter(e => !e.isResolved).length || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50" dir="rtl">
      {/* Header Section with Gradient */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">لوحة تحكم الشيخ</h1>
                <p className="text-emerald-100 text-lg">إدارة شاملة للطلاب والحلقات</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 flex items-center gap-2">
                <Bell className="w-5 h-5" />
                <span className="font-medium">{totalErrors} إشعار</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <Users className="w-7 h-7" />
                  </div>
                  <TrendingUp className="w-6 h-6 text-blue-200" />
                </div>
                <h3 className="text-4xl font-bold mb-2">{students.length}</h3>
                <p className="text-blue-100">إجمالي الطلاب</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-xl bg-gradient-to-br from-green-500 to-emerald-700 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <Star className="w-6 h-6 text-green-200" />
                </div>
                <h3 className="text-4xl font-bold mb-2">{activeStudents}</h3>
                <p className="text-green-100">طلاب نشطون</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-0 shadow-xl bg-gradient-to-br from-red-500 to-rose-700 text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <AlertTriangle className="w-7 h-7" />
                  </div>
                  <XCircle className="w-6 h-6 text-red-200" />
                </div>
                <h3 className="text-4xl font-bold mb-2">{totalErrors}</h3>
                <p className="text-red-100">أخطاء تحتاج مراجعة</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="students" className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="inline-flex md:grid w-full md:grid-cols-5 bg-white shadow-md p-1 rounded-xl min-w-max md:min-w-0">
              <TabsTrigger value="students" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white whitespace-nowrap px-4">
                الطلاب
              </TabsTrigger>
              <TabsTrigger value="add-student" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white whitespace-nowrap px-4">
                إضافة طالب
              </TabsTrigger>
              <TabsTrigger value="payments" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white whitespace-nowrap px-4">
                المدفوعات
              </TabsTrigger>
              <TabsTrigger value="assignments" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white whitespace-nowrap px-4">
                التكليفات
              </TabsTrigger>
              <TabsTrigger value="sessions" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white whitespace-nowrap px-4">
                الحصص
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="students">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center gap-2 text-2xl text-gray-800">
                  <Users className="w-6 h-6 text-emerald-600" />
                  قائمة الطلاب
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {students.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-16"
                    >
                      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Users className="w-12 h-12 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">لا يوجد طلاب مسجلين</h3>
                      <p className="text-gray-500">سيظهر الطلاب هنا عند تسجيلهم في النظام</p>
                    </motion.div>
                  ) : (
                    students.map((student, index) => (
                      <motion.div
                        key={student.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-white to-emerald-50 overflow-hidden group cursor-pointer"
                          onClick={() => setSelectedStudent(student)}
                        >
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 flex-1">
                                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform">
                                  {student.studentName.charAt(0)}
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-bold text-lg text-gray-800 mb-1">
                                    {student.studentName}
                                  </h3>
                                  <p className="text-sm text-gray-600 mb-2">
                                    {student.phoneNumber}
                                  </p>
                                  <div className="flex gap-2 flex-wrap">
                                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                                      {student.currentLevel}
                                    </Badge>
                                    {student.memorizedSurahs && (
                                      <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                                        <Award className="w-3 h-3 ml-1" />
                                        {JSON.parse(student.memorizedSurahs || '[]').length} سورة
                                      </Badge>
                                    )}
                                    {student.errors && student.errors.length > 0 && (
                                      <Badge className="bg-red-100 text-red-700 border-red-200">
                                        <AlertTriangle className="w-3 h-3 ml-1" />
                                        {student.errors.filter(e => !e.isResolved).length} خطأ
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {student.schedules && student.schedules.length > 0 && (
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    enableSession(student.id, student.schedules![0]);
                                  }}
                                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg"
                                  data-testid={`button-enable-session-${student.id}`}
                                >
                                  <Video className="w-4 h-4 ml-2" />
                                  تفعيل الحصة
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="add-student">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-6 h-6" />
                  إضافة طالب جديد
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={createStudent} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-gray-700">اسم الطالب *</Label>
                      <Input
                        value={newStudentData.studentName}
                        onChange={(e) => setNewStudentData({...newStudentData, studentName: e.target.value})}
                        placeholder="أدخل اسم الطالب"
                        className="border-2 border-gray-200 focus:border-blue-500"
                        required
                        data-testid="input-student-name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-gray-700">رقم الهاتف *</Label>
                      <Input
                        value={newStudentData.phoneNumber}
                        onChange={(e) => setNewStudentData({...newStudentData, phoneNumber: e.target.value})}
                        placeholder="05XXXXXXXX"
                        className="border-2 border-gray-200 focus:border-blue-500"
                        required
                        data-testid="input-phone-number"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-gray-700">كلمة المرور *</Label>
                      <Input
                        type="password"
                        value={newStudentData.password}
                        onChange={(e) => setNewStudentData({...newStudentData, password: e.target.value})}
                        placeholder="كلمة مرور قوية"
                        className="border-2 border-gray-200 focus:border-blue-500"
                        required
                        data-testid="input-password"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-gray-700">المستوى</Label>
                      <Select 
                        value={newStudentData.currentLevel}
                        onValueChange={(val) => setNewStudentData({...newStudentData, currentLevel: val})}
                      >
                        <SelectTrigger className="border-2 border-gray-200" data-testid="select-level">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">مبتدئ</SelectItem>
                          <SelectItem value="intermediate">متوسط</SelectItem>
                          <SelectItem value="advanced">متقدم</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-gray-700">الرسوم الشهرية (ريال)</Label>
                      <Input
                        type="number"
                        value={newStudentData.monthlyPrice}
                        onChange={(e) => setNewStudentData({...newStudentData, monthlyPrice: e.target.value})}
                        placeholder="0"
                        min="0"
                        step="0.01"
                        className="border-2 border-gray-200 focus:border-blue-500"
                        data-testid="input-monthly-price"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white py-6 text-lg shadow-lg">
                    <UserPlus className="w-5 h-5 ml-2" />
                    إضافة الطالب
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            {selectedStudent ? (
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-6 h-6" />
                    إضافة دفعة جديدة - {selectedStudent.studentName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    try {
                      const response = await fetch('/api/sheikh/payments', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          studentId: selectedStudent.id,
                          amount: parseFloat(formData.get('amount') as string),
                          sessionsIncluded: parseInt(formData.get('sessions') as string),
                          expiryDate: formData.get('expiryDate'),
                          notes: formData.get('notes'),
                        }),
                      });
                      if (response.ok) {
                        toast({
                          title: "تم إضافة الدفعة ✅",
                          description: "تم تسجيل الدفعة بنجاح",
                        });
                        (e.target as HTMLFormElement).reset();
                      }
                    } catch (error) {
                      toast({
                        title: "خطأ",
                        description: "فشل في إضافة الدفعة",
                        variant: "destructive",
                      });
                    }
                  }} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>المبلغ (ريال سعودي)</Label>
                        <Input name="amount" type="number" step="0.01" required placeholder="300.00" data-testid="input-amount" />
                      </div>
                      <div className="space-y-2">
                        <Label>عدد الحصص</Label>
                        <Input name="sessions" type="number" required placeholder="8" data-testid="input-sessions" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>تاريخ الانتهاء</Label>
                        <Input name="expiryDate" type="date" data-testid="input-expiry" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>ملاحظات</Label>
                        <Textarea name="notes" placeholder="ملاحظات إضافية" rows={3} data-testid="input-notes" />
                      </div>
                    </div>
                    <Button type="submit" className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 py-6 text-lg">
                      <PlusCircle className="w-5 h-5 ml-2" />
                      إضافة الدفعة
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardContent className="p-16 text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Award className="w-12 h-12 text-amber-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">اختر طالباً</h3>
                  <p className="text-gray-500 text-lg">اختر طالباً من القائمة لإضافة دفعة له</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="assignments">
            {selectedStudent ? (
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-6 h-6" />
                    إنشاء تكليف جديد - {selectedStudent.studentName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={createAssignment} className="space-y-6">
                    <SurahAyahSelector
                      label="الحفظ الجديد"
                      value={memorizationRanges}
                      onChange={setMemorizationRanges}
                    />

                    <SurahAyahSelector
                      label="المراجعة"
                      value={reviewRanges}
                      onChange={setReviewRanges}
                    />

                    <div className="space-y-2">
                      <Label className="text-lg font-bold text-gray-800">الأخطاء</Label>
                      <Textarea
                        value={mistakes}
                        onChange={(e) => setMistakes(e.target.value)}
                        placeholder="أخطاء اليوم (اختياري)"
                        className="w-full border-2 border-gray-200 focus:border-emerald-500 rounded-lg"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-lg font-bold text-gray-800">ملاحظات</Label>
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="ملاحظات إضافية (اختياري)"
                        className="w-full border-2 border-gray-200 focus:border-emerald-500 rounded-lg"
                        rows={3}
                      />
                    </div>

                    <Button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-6 text-lg shadow-lg">
                      <CheckCircle2 className="w-5 h-5 ml-2" />
                      إنشاء التكليف وإرساله
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardContent className="p-16 text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="w-12 h-12 text-emerald-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">اختر طالباً</h3>
                  <p className="text-gray-500 text-lg">اختر طالباً من القائمة لإنشاء تكليف له</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="sessions">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-2xl text-gray-800">
                    <Calendar className="w-6 h-6 text-emerald-600" />
                    جدول الحصص
                  </div>
                  <Button
                    onClick={() => setShowAddScheduleDialog(true)}
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg"
                    data-testid="button-add-schedule"
                  >
                    <PlusCircle className="w-4 h-4 ml-2" />
                    إضافة جدول حصة
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {showAddScheduleDialog && (
                  <Card className="border-2 border-blue-200 bg-blue-50/50 mb-6">
                    <CardContent className="p-6">
                      <form onSubmit={createSchedule} className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">إضافة جدول حصة جديد</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2 md:col-span-2">
                            <Label className="text-sm font-bold">اختر الطالب</Label>
                            <Select 
                              value={newSchedule.studentId}
                              onValueChange={(val) => setNewSchedule({...newSchedule, studentId: val})}
                              required
                            >
                              <SelectTrigger data-testid="select-student-schedule">
                                <SelectValue placeholder="اختر الطالب" />
                              </SelectTrigger>
                              <SelectContent>
                                {students.map(student => (
                                  <SelectItem key={student.id} value={student.id}>
                                    {student.studentName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-bold">اليوم</Label>
                            <Select 
                              value={newSchedule.dayOfWeek.toString()}
                              onValueChange={(val) => setNewSchedule({...newSchedule, dayOfWeek: parseInt(val)})}
                            >
                              <SelectTrigger data-testid="select-day">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">الأحد</SelectItem>
                                <SelectItem value="1">الاثنين</SelectItem>
                                <SelectItem value="2">الثلاثاء</SelectItem>
                                <SelectItem value="3">الأربعاء</SelectItem>
                                <SelectItem value="4">الخميس</SelectItem>
                                <SelectItem value="5">الجمعة</SelectItem>
                                <SelectItem value="6">السبت</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-bold">وقت البداية</Label>
                            <Input
                              type="time"
                              value={newSchedule.startTime}
                              onChange={(e) => setNewSchedule({...newSchedule, startTime: e.target.value})}
                              required
                              data-testid="input-start-time"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-bold">وقت النهاية</Label>
                            <Input
                              type="time"
                              value={newSchedule.endTime}
                              onChange={(e) => setNewSchedule({...newSchedule, endTime: e.target.value})}
                              required
                              data-testid="input-end-time"
                            />
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white">
                            <CheckCircle2 className="w-4 h-4 ml-2" />
                            حفظ الجدول
                          </Button>
                          <Button 
                            type="button"
                            onClick={() => setShowAddScheduleDialog(false)}
                            variant="outline"
                            className="px-6"
                          >
                            إلغاء
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-4">
                  {students.filter(s => s.schedules && s.schedules.length > 0).length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-16"
                    >
                      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Calendar className="w-12 h-12 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">لا توجد حصص مجدولة</h3>
                      <p className="text-gray-500">انقر على "إضافة جدول حصة" لإضافة جدول جديد</p>
                    </motion.div>
                  ) : (
                    students.filter(s => s.schedules && s.schedules.length > 0).map((student) => (
                      student.schedules!.map((schedule: any, index: number) => (
                        <motion.div
                          key={`${student.id}-${schedule.id}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-white to-blue-50">
                            <CardContent className="p-6">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                                    {student.studentName.charAt(0)}
                                  </div>
                                  <div>
                                    <h3 className="font-bold text-lg text-gray-800">
                                      {student.studentName}
                                    </h3>
                                    <p className="text-gray-600 flex items-center gap-2">
                                      <Clock className="w-4 h-4" />
                                      {schedule.startTime} - {schedule.endTime}
                                    </p>
                                  </div>
                                </div>
                                <Button
                                  onClick={() => enableSession(student.id, schedule)}
                                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg"
                                >
                                  <Video className="w-4 h-4 ml-2" />
                                  تفعيل الحلقة
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}