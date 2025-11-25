import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, Clock, Users, Video, Plus, Trash2, CheckCircle2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Student {
  id: string;
  studentName: string;
  phoneNumber: string;
  currentLevel: string;
}

interface Schedule {
  id: string;
  studentId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  student?: Student;
}

const DAYS = [
  'الأحد',
  'الاثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت'
];

export default function SheikhScheduleManager() {
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [dayOfWeek, setDayOfWeek] = useState<string>('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [scheduleToCancel, setScheduleToCancel] = useState<Schedule | null>(null);
  const { toast } = useToast();

  // Fetch all students
  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ['/api/sheikh/students'],
  });

  // Fetch all schedules
  const { data: schedules = [] } = useQuery<Schedule[]>({
    queryKey: ['schedules'],
    queryFn: async () => {
      const allSchedules: Schedule[] = [];
      for (const student of students) {
        try {
          const response = await fetch(`/api/students/${student.id}/schedules`);
          if (!response.ok) continue;
          const studentSchedules = await response.json();
          if (Array.isArray(studentSchedules)) {
            allSchedules.push(...studentSchedules);
          }
        } catch (error) {
          console.error(`Error fetching schedules for student ${student.id}:`, error);
        }
      }
      return allSchedules;
    },
    enabled: students.length > 0,
  });

  // Create schedule mutation
  const createSchedule = useMutation({
    mutationFn: async (data: any) => {
      const scheduleData = {
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
      };
      const response = await apiRequest(`/api/students/${data.studentId}/schedules`, 'POST', scheduleData);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast({
        title: '✅ تم الإنشاء',
        description: 'تم إنشاء الجدول بنجاح',
      });
    },
    onError: (error: any) => {
      console.error('Schedule creation error:', error);
      toast({
        variant: 'destructive',
        title: '❌ خطأ',
        description: error.message || 'فشل إنشاء الجدول',
      });
    },
  });

  // Delete schedule mutation
  const deleteSchedule = useMutation({
    mutationFn: async (scheduleId: string) => {
      return apiRequest(`/api/schedules/${scheduleId}/delete`, 'POST');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      toast({
        title: '✅ تم الحذف',
        description: 'تم حذف الحصة من الجدول',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: '❌ خطأ',
        description: error.message || 'فشل حذف الجدول',
      });
    },
  });

  // Enable session mutation
  const enableSession = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/sheikh/enable-session', 'POST', data);
    },
    onSuccess: () => {
      toast({
        title: '✅ تم تفعيل الحصة',
        description: 'تم إرسال إشعار للطالب',
      });
    },
  });

  const resetForm = () => {
    setSelectedStudents([]);
    setDayOfWeek('');
    setStartTime('');
    setEndTime('');
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleCreateSchedule = async () => {
    if (selectedStudents.length === 0 || !dayOfWeek || !startTime || !endTime) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'يرجى اختيار طالب واحد على الأقل وملء جميع الحقول',
      });
      return;
    }

    try {
      const promises = selectedStudents.map(studentId =>
        createSchedule.mutateAsync({
          studentId,
          dayOfWeek: parseInt(dayOfWeek),
          startTime,
          endTime,
        })
      );
      
      await Promise.all(promises);
      
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
      
      toast({
        title: '✅ تم إنشاء الجدول',
        description: `تم إضافة ${selectedStudents.length} حصة للجدول بنجاح`,
      });
      
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: '❌ خطأ',
        description: 'فشل إنشاء بعض الجداول',
      });
    }
  };

  const handleEnableToday = (schedule: Schedule) => {
    const today = new Date().toISOString().split('T')[0];
    enableSession.mutate({
      studentId: schedule.studentId,
      scheduleId: schedule.id,
      sessionDate: today,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
    });
  };

  // Group schedules by day
  const schedulesByDay = DAYS.map((day, index) => ({
    day,
    dayIndex: index,
    schedules: schedules.filter(s => s.dayOfWeek === index),
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-emerald-800 mb-2">📅 إدارة جدول الحصص</h1>
              <p className="text-gray-600">تنظيم وجدولة الحصص الأسبوعية للطلاب</p>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg"
                  data-testid="button-add-schedule"
                >
                  <Plus className="w-5 h-5 ml-2" />
                  إضافة حصة جديدة
                </Button>
              </DialogTrigger>
              <DialogContent className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg sm:max-w-[550px] bg-[#b7ebdb]" dir="rtl">
                <DialogHeader>
                  <DialogTitle className="text-2xl text-emerald-800">➕ إضافة حصة للجدول</DialogTitle>
                  <DialogDescription>
                    املأ التفاصيل لجدولة حصة أسبوعية
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-6 py-4">
                  <div className="space-y-2">
                    <Label>الطلاب ({selectedStudents.length} مختار)</Label>
                    <ScrollArea className="h-48 border rounded-md p-2">
                      <div className="space-y-2">
                        {students.map((student) => (
                          <div key={student.id} className="flex items-center space-x-2 space-x-reverse">
                            <Checkbox
                              id={`student-${student.id}`}
                              checked={selectedStudents.includes(student.id)}
                              onCheckedChange={() => toggleStudentSelection(student.id)}
                              data-testid={`checkbox-student-${student.id}`}
                            />
                            <label
                              htmlFor={`student-${student.id}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {student.studentName} - {student.phoneNumber}
                            </label>
                          </div>
                        ))}
                        {students.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            لا يوجد طلاب
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="day">يوم الأسبوع</Label>
                    <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                      <SelectTrigger id="day" data-testid="select-day">
                        <SelectValue placeholder="اختر اليوم" />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS.map((day, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startTime">وقت البداية</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        data-testid="input-start-time"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endTime">وقت النهاية</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        data-testid="input-end-time"
                      />
                    </div>
                  </div>

                </div>

                <DialogFooter>
                  <Button
                    onClick={handleCreateSchedule}
                    disabled={createSchedule.isPending}
                    className="bg-emerald-600 hover:bg-emerald-700"
                    data-testid="button-create-schedule"
                  >
                    {createSchedule.isPending ? 'جاري الإنشاء...' : 'إنشاء الجدول'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Weekly Schedule Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
          {schedulesByDay.map(({ day, dayIndex, schedules: daySchedules }) => (
            <Card 
              key={dayIndex} 
              className={`border-2 ${
                dayIndex === new Date().getDay() 
                  ? 'border-emerald-500 bg-emerald-50/50' 
                  : 'border-gray-200 bg-white'
              }`}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-center text-lg font-bold text-emerald-800">
                  <Calendar className="w-5 h-5 inline ml-2" />
                  {day}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {daySchedules.length === 0 ? (
                  <p className="text-center text-gray-400 text-sm py-4">لا توجد حصص</p>
                ) : (
                  daySchedules.map((schedule) => {
                    const student = students.find(s => s.id === schedule.studentId);
                    return (
                      <div
                        key={schedule.id}
                        className="bg-gradient-to-br from-white to-emerald-50 border border-emerald-200 rounded-lg p-3 shadow-sm"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="font-bold text-gray-800 text-sm">
                              <Users className="w-3 h-3 inline ml-1" />
                              {student?.studentName || 'غير معروف'}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              <Clock className="w-3 h-3 inline ml-1" />
                              {schedule.startTime} - {schedule.endTime}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteSchedule.mutate(schedule.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-6 w-6 p-0"
                            data-testid={`button-delete-schedule-${schedule.id}`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                        {dayIndex === new Date().getDay() && (
                          <Button
                            size="sm"
                            onClick={() => handleEnableToday(schedule)}
                            disabled={enableSession.isPending}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-1 h-7"
                            data-testid={`button-enable-session-${schedule.id}`}
                          >
                            <CheckCircle2 className="w-3 h-3 ml-1" />
                            تفعيل الحصة الآن
                          </Button>
                        )}
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Statistics */}
        <Card className="mt-8 bg-white border-emerald-200">
          <CardHeader>
            <CardTitle className="text-emerald-800">📊 إحصائيات الجدول</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-emerald-600">{schedules.length}</p>
                <p className="text-sm text-gray-600">إجمالي الحصص</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">
                  {new Set(schedules.map(s => s.studentId)).size}
                </p>
                <p className="text-sm text-gray-600">عدد الطلاب</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">
                  {schedules.filter(s => s.dayOfWeek === new Date().getDay()).length}
                </p>
                <p className="text-sm text-gray-600">حصص اليوم</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-600">
                  {DAYS.length}
                </p>
                <p className="text-sm text-gray-600">أيام الأسبوع</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
