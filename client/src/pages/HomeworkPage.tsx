import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import {
  BookOpen,
  Plus,
  Calendar,
  Clock,
  Users,
  FileText,
  Check,
  AlertCircle,
  Loader2,
  Edit,
  Trash2,
  Star,
} from 'lucide-react';

interface Homework {
  id: string;
  titleAr: string;
  titleEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  type: string;
  halaqaId?: string;
  courseId?: string;
  surahNumber?: number;
  startAyah?: number;
  endAyah?: number;
  dueDate: string;
  points: number;
  instructions?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

interface HomeworkSubmission {
  id: string;
  homeworkId: string;
  studentId: string;
  submissionText?: string;
  status: string;
  submittedAt?: string;
  grade?: number;
  teacherFeedbackAr?: string;
  gradedAt?: string;
}

export default function HomeworkPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('all');
  const [formData, setFormData] = useState({
    titleAr: '',
    type: 'memorization',
    descriptionAr: '',
    instructions: '',
    dueDate: '',
    dueTime: '',
    points: '100',
    surahNumber: '',
    startAyah: '',
    endAyah: '',
  });

  const isTeacher = user?.role === 'teacher' || user?.role === 'supervisor' || user?.role === 'admin' || user?.role === 'owner';

  const { data: homeworks = [], isLoading: homeworksLoading } = useQuery<Homework[]>({
    queryKey: ['/api/homeworks'],
  });

  const { data: myHomeworks = [] } = useQuery<Homework[]>({
    queryKey: ['/api/my-homeworks'],
    enabled: !isTeacher,
  });

  const { data: mySubmissions = [] } = useQuery<HomeworkSubmission[]>({
    queryKey: ['/api/my-submissions'],
    enabled: !isTeacher,
  });

  const createHomeworkMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/homeworks', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/homeworks'] });
      toast({ title: 'تم إنشاء الواجب بنجاح' });
      setCreateDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في إنشاء الواجب',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteHomeworkMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/homeworks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/homeworks'] });
      toast({ title: 'تم حذف الواجب' });
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في حذف الواجب',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      titleAr: '',
      type: 'memorization',
      descriptionAr: '',
      instructions: '',
      dueDate: '',
      dueTime: '',
      points: '100',
      surahNumber: '',
      startAyah: '',
      endAyah: '',
    });
  };

  const handleCreateHomework = () => {
    const dueDateTime = `${formData.dueDate}T${formData.dueTime || '23:59'}:00`;
    
    createHomeworkMutation.mutate({
      titleAr: formData.titleAr,
      type: formData.type,
      descriptionAr: formData.descriptionAr || undefined,
      instructions: formData.instructions || undefined,
      dueDate: dueDateTime,
      points: parseInt(formData.points) || 100,
      surahNumber: formData.surahNumber ? parseInt(formData.surahNumber) : undefined,
      startAyah: formData.startAyah ? parseInt(formData.startAyah) : undefined,
      endAyah: formData.endAyah ? parseInt(formData.endAyah) : undefined,
    });
  };

  const getHomeworkTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      memorization: 'حفظ',
      review: 'مراجعة',
      recitation: 'تلاوة',
      written: 'كتابي',
      quiz: 'اختبار قصير',
    };
    return types[type] || type;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">لم يُسلم</Badge>;
      case 'submitted':
        return <Badge className="bg-blue-500 text-white">تم التسليم</Badge>;
      case 'graded':
        return <Badge className="bg-emerald-500 text-white">تم التقييم</Badge>;
      case 'late':
        return <Badge variant="destructive">متأخر</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const getSubmissionForHomework = (homeworkId: string) => {
    return mySubmissions.find(s => s.homeworkId === homeworkId);
  };

  const displayHomeworks = isTeacher ? homeworks : myHomeworks;

  const filteredHomeworks = displayHomeworks.filter(hw => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'active') return !isOverdue(hw.dueDate) && hw.isActive;
    if (selectedTab === 'overdue') return isOverdue(hw.dueDate);
    return true;
  });

  if (homeworksLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground" data-testid="text-homework-title">
              {isTeacher ? 'إدارة الواجبات' : 'واجباتي'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isTeacher ? 'إنشاء وإدارة الواجبات للطلاب' : 'عرض ومتابعة واجباتك الدراسية'}
            </p>
          </div>

          {isTeacher && (
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-create-homework">
                  <Plus className="w-4 h-4 ml-2" />
                  إضافة واجب جديد
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
                <DialogHeader>
                  <DialogTitle>إنشاء واجب جديد</DialogTitle>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="titleAr">عنوان الواجب *</Label>
                    <Input
                      id="titleAr"
                      value={formData.titleAr}
                      onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                      placeholder="مثال: حفظ سورة الفاتحة"
                      data-testid="input-homework-title"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="type">نوع الواجب</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger data-testid="select-homework-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="memorization">حفظ</SelectItem>
                        <SelectItem value="review">مراجعة</SelectItem>
                        <SelectItem value="recitation">تلاوة</SelectItem>
                        <SelectItem value="written">كتابي</SelectItem>
                        <SelectItem value="quiz">اختبار قصير</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(formData.type === 'memorization' || formData.type === 'review' || formData.type === 'recitation') && (
                    <div className="grid grid-cols-3 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="surahNumber">رقم السورة</Label>
                        <Input
                          id="surahNumber"
                          type="number"
                          min="1"
                          max="114"
                          value={formData.surahNumber}
                          onChange={(e) => setFormData({ ...formData, surahNumber: e.target.value })}
                          placeholder="1"
                          data-testid="input-surah-number"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="startAyah">من آية</Label>
                        <Input
                          id="startAyah"
                          type="number"
                          min="1"
                          value={formData.startAyah}
                          onChange={(e) => setFormData({ ...formData, startAyah: e.target.value })}
                          placeholder="1"
                          data-testid="input-start-ayah"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="endAyah">إلى آية</Label>
                        <Input
                          id="endAyah"
                          type="number"
                          min="1"
                          value={formData.endAyah}
                          onChange={(e) => setFormData({ ...formData, endAyah: e.target.value })}
                          placeholder="7"
                          data-testid="input-end-ayah"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid gap-2">
                    <Label htmlFor="descriptionAr">الوصف</Label>
                    <Textarea
                      id="descriptionAr"
                      value={formData.descriptionAr}
                      onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                      placeholder="وصف مختصر للواجب..."
                      data-testid="input-homework-description"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="instructions">تعليمات الواجب</Label>
                    <Textarea
                      id="instructions"
                      value={formData.instructions}
                      onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                      placeholder="تعليمات تفصيلية للطالب..."
                      data-testid="input-homework-instructions"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="dueDate">تاريخ التسليم *</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                        data-testid="input-due-date"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="dueTime">وقت التسليم</Label>
                      <Input
                        id="dueTime"
                        type="time"
                        value={formData.dueTime}
                        onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                        data-testid="input-due-time"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="points">الدرجة الكاملة</Label>
                    <Input
                      id="points"
                      type="number"
                      min="1"
                      max="100"
                      value={formData.points}
                      onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                      data-testid="input-points"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setCreateDialogOpen(false)}
                    data-testid="button-cancel-homework"
                  >
                    إلغاء
                  </Button>
                  <Button
                    onClick={handleCreateHomework}
                    disabled={!formData.titleAr || !formData.dueDate || createHomeworkMutation.isPending}
                    data-testid="button-submit-homework"
                  >
                    {createHomeworkMutation.isPending && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
                    إنشاء الواجب
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="all" data-testid="tab-all-homework">الكل</TabsTrigger>
            <TabsTrigger value="active" data-testid="tab-active-homework">نشط</TabsTrigger>
            <TabsTrigger value="overdue" data-testid="tab-overdue-homework">منتهي</TabsTrigger>
          </TabsList>
        </Tabs>

        {filteredHomeworks.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">لا توجد واجبات</h3>
              <p className="text-muted-foreground">
                {isTeacher ? 'أضف واجباً جديداً للطلاب' : 'لا توجد واجبات مطلوبة حالياً'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredHomeworks.map((homework) => {
              const submission = getSubmissionForHomework(homework.id);
              const overdue = isOverdue(homework.dueDate);

              return (
                <Card
                  key={homework.id}
                  className={`${overdue ? 'border-destructive/50' : ''}`}
                  data-testid={`card-homework-${homework.id}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-1">{homework.titleAr}</CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {getHomeworkTypeLabel(homework.type)}
                          </Badge>
                          {!isTeacher && submission && getStatusBadge(submission.status)}
                        </CardDescription>
                      </div>
                      {isTeacher && (
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteHomeworkMutation.mutate(homework.id)}
                            data-testid={`button-delete-homework-${homework.id}`}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {homework.descriptionAr && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {homework.descriptionAr}
                      </p>
                    )}

                    {homework.surahNumber && (
                      <div className="flex items-center gap-2 text-sm">
                        <BookOpen className="w-4 h-4 text-emerald-600" />
                        <span>
                          سورة {homework.surahNumber}
                          {homework.startAyah && homework.endAyah && (
                            <span className="text-muted-foreground">
                              {' '}(الآيات {homework.startAyah} - {homework.endAyah})
                            </span>
                          )}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className={overdue ? 'text-destructive' : ''}>
                        {new Date(homework.dueDate).toLocaleDateString('ar-SA', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Star className="w-4 h-4 text-amber-500" />
                      <span>{homework.points} درجة</span>
                    </div>

                    {!isTeacher && submission?.grade !== undefined && (
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="font-medium text-emerald-600">
                          الدرجة: {submission.grade} / {homework.points}
                        </span>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter>
                    {!isTeacher && !submission && !overdue && (
                      <Button className="w-full" data-testid={`button-submit-${homework.id}`}>
                        <FileText className="w-4 h-4 ml-2" />
                        تسليم الواجب
                      </Button>
                    )}
                    {!isTeacher && overdue && !submission && (
                      <Button variant="outline" disabled className="w-full">
                        <AlertCircle className="w-4 h-4 ml-2" />
                        انتهى وقت التسليم
                      </Button>
                    )}
                    {isTeacher && (
                      <Button variant="outline" className="w-full" data-testid={`button-view-submissions-${homework.id}`}>
                        <Users className="w-4 h-4 ml-2" />
                        عرض التسليمات
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
