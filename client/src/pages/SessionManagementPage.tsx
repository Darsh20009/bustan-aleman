import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { useToast } from '../hooks/use-toast';
import { Calendar, Clock, Plus, Edit, Trash2, Video, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '../components/ui/badge';

interface Student {
  id: string;
  studentName: string;
  phoneNumber: string;
}

interface Schedule {
  id: string;
  studentId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  zoomLink: string | null;
  isActive: boolean;
}

const DAYS_AR = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

export default function SessionManagementPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [newSchedule, setNewSchedule] = useState({
    studentId: '',
    dayOfWeek: 0,
    startTime: '',
    endTime: '',
    zoomLink: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      fetchSchedules(selectedStudent);
    }
  }, [selectedStudent]);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/sheikh/students');
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
        if (data.length > 0) {
          setSelectedStudent(data[0].id);
        }
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

  const fetchSchedules = async (studentId: string) => {
    try {
      const response = await fetch(`/api/sheikh/students/${studentId}/schedules`);
      if (response.ok) {
        const data = await response.json();
        setSchedules(data);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  const handleAddSchedule = async () => {
    try {
      const response = await fetch('/api/sheikh/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newSchedule,
          studentId: selectedStudent
        }),
      });

      if (response.ok) {
        toast({
          title: "تم إضافة الحصة ✅",
          description: "تم إضافة الحصة إلى جدول الطالب بنجاح",
        });
        setShowAddDialog(false);
        fetchSchedules(selectedStudent);
        setNewSchedule({
          studentId: '',
          dayOfWeek: 0,
          startTime: '',
          endTime: '',
          zoomLink: ''
        });
      } else {
        throw new Error('Failed to add schedule');
      }
    } catch (error) {
      console.error('Error adding schedule:', error);
      toast({
        title: "خطأ",
        description: "فشل في إضافة الحصة",
        variant: "destructive",
      });
    }
  };

  const handleEditSchedule = async () => {
    if (!editingSchedule) return;

    try {
      const response = await fetch(`/api/sheikh/schedules/${editingSchedule.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingSchedule),
      });

      if (response.ok) {
        toast({
          title: "تم تحديث الحصة ✅",
          description: "تم تحديث بيانات الحصة بنجاح",
        });
        setShowEditDialog(false);
        fetchSchedules(selectedStudent);
        setEditingSchedule(null);
      } else {
        throw new Error('Failed to update schedule');
      }
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث الحصة",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الحصة؟')) return;

    try {
      const response = await fetch(`/api/sheikh/schedules/${scheduleId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "تم الحذف ✅",
          description: "تم حذف الحصة بنجاح",
        });
        fetchSchedules(selectedStudent);
      } else {
        throw new Error('Failed to delete schedule');
      }
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف الحصة",
        variant: "destructive",
      });
    }
  };

  const handleEnableSession = async (schedule: Schedule) => {
    try {
      const response = await fetch('/api/sheikh/enable-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: schedule.studentId,
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
      } else {
        throw new Error('Failed to enable session');
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

  const selectedStudentData = students.find(s => s.id === selectedStudent);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <Calendar className="h-8 w-8" />
              إدارة جدول الحصص
            </CardTitle>
            <CardDescription>
              أضف، عدّل، أو احذف حصص الطلاب وفعّل الروابط
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end mb-6">
              <div className="flex-1">
                <Label htmlFor="student-select">اختر الطالب</Label>
                <Select
                  value={selectedStudent}
                  onValueChange={setSelectedStudent}
                >
                  <SelectTrigger id="student-select" data-testid="select-student">
                    <SelectValue placeholder="اختر طالبًا" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.studentName} - {student.phoneNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-emerald-600 hover:bg-emerald-700" data-testid="button-add-schedule">
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة حصة جديدة
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]" dir="rtl">
                  <DialogHeader>
                    <DialogTitle>إضافة حصة جديدة</DialogTitle>
                    <DialogDescription>
                      أضف حصة جديدة لـ {selectedStudentData?.studentName}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="day">اليوم</Label>
                      <Select
                        value={newSchedule.dayOfWeek.toString()}
                        onValueChange={(value) => setNewSchedule({ ...newSchedule, dayOfWeek: parseInt(value) })}
                      >
                        <SelectTrigger id="day" data-testid="select-day">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DAYS_AR.map((day, index) => (
                            <SelectItem key={index} value={index.toString()}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="start-time">وقت البداية</Label>
                      <Input
                        id="start-time"
                        type="time"
                        value={newSchedule.startTime}
                        onChange={(e) => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
                        data-testid="input-start-time"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="end-time">وقت النهاية</Label>
                      <Input
                        id="end-time"
                        type="time"
                        value={newSchedule.endTime}
                        onChange={(e) => setNewSchedule({ ...newSchedule, endTime: e.target.value })}
                        data-testid="input-end-time"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="zoom-link">رابط Zoom</Label>
                      <Input
                        id="zoom-link"
                        type="url"
                        value={newSchedule.zoomLink}
                        onChange={(e) => setNewSchedule({ ...newSchedule, zoomLink: e.target.value })}
                        placeholder="https://zoom.us/j/..."
                        data-testid="input-zoom-link"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddDialog(false)} data-testid="button-cancel-add">
                      إلغاء
                    </Button>
                    <Button onClick={handleAddSchedule} className="bg-emerald-600 hover:bg-emerald-700" data-testid="button-confirm-add">
                      إضافة
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {selectedStudent && (
              <div className="rounded-lg border bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">اليوم</TableHead>
                      <TableHead className="text-right">الوقت</TableHead>
                      <TableHead className="text-right">رابط Zoom</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schedules.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          لا توجد حصص مجدولة لهذا الطالب
                        </TableCell>
                      </TableRow>
                    ) : (
                      schedules.map((schedule) => (
                        <TableRow key={schedule.id}>
                          <TableCell className="font-medium">
                            {DAYS_AR[schedule.dayOfWeek]}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-500" />
                              {schedule.startTime} - {schedule.endTime}
                            </div>
                          </TableCell>
                          <TableCell>
                            {schedule.zoomLink ? (
                              <a
                                href={schedule.zoomLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-blue-600 hover:underline"
                                data-testid={`link-zoom-${schedule.id}`}
                              >
                                <Video className="h-4 w-4" />
                                رابط الحصة
                              </a>
                            ) : (
                              <span className="text-gray-400">لا يوجد</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={schedule.isActive ? "default" : "secondary"}>
                              {schedule.isActive ? "نشط" : "معطل"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEnableSession(schedule)}
                                data-testid={`button-enable-${schedule.id}`}
                              >
                                <CheckCircle className="h-4 w-4 ml-1" />
                                تفعيل
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingSchedule(schedule);
                                  setShowEditDialog(true);
                                }}
                                data-testid={`button-edit-${schedule.id}`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteSchedule(schedule.id)}
                                data-testid={`button-delete-${schedule.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>تعديل الحصة</DialogTitle>
            <DialogDescription>
              عدّل بيانات الحصة
            </DialogDescription>
          </DialogHeader>
          {editingSchedule && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-day">اليوم</Label>
                <Select
                  value={editingSchedule.dayOfWeek.toString()}
                  onValueChange={(value) => setEditingSchedule({ ...editingSchedule, dayOfWeek: parseInt(value) })}
                >
                  <SelectTrigger id="edit-day">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_AR.map((day, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-start-time">وقت البداية</Label>
                <Input
                  id="edit-start-time"
                  type="time"
                  value={editingSchedule.startTime}
                  onChange={(e) => setEditingSchedule({ ...editingSchedule, startTime: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-end-time">وقت النهاية</Label>
                <Input
                  id="edit-end-time"
                  type="time"
                  value={editingSchedule.endTime}
                  onChange={(e) => setEditingSchedule({ ...editingSchedule, endTime: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-zoom-link">رابط Zoom</Label>
                <Input
                  id="edit-zoom-link"
                  type="url"
                  value={editingSchedule.zoomLink || ''}
                  onChange={(e) => setEditingSchedule({ ...editingSchedule, zoomLink: e.target.value })}
                  placeholder="https://zoom.us/j/..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowEditDialog(false);
              setEditingSchedule(null);
            }}>
              إلغاء
            </Button>
            <Button onClick={handleEditSchedule} className="bg-emerald-600 hover:bg-emerald-700">
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
