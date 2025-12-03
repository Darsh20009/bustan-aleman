import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TeacherLayout } from './TeacherLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { BookOpen, Star, Plus, AlertTriangle } from 'lucide-react';

const evaluationSchema = z.object({
  studentId: z.string().min(1, 'اختر الطالب'),
  surah: z.string().min(1, 'اختر السورة'),
  fromAyah: z.string().min(1, 'أدخل رقم الآية'),
  toAyah: z.string().min(1, 'أدخل رقم الآية'),
  grade: z.string().min(1, 'اختر التقييم'),
  notes: z.string().optional(),
  errors: z.string().optional(),
});

type EvaluationFormData = z.infer<typeof evaluationSchema>;

const surahs = [
  'الفاتحة', 'البقرة', 'آل عمران', 'النساء', 'المائدة', 'الأنعام', 'الأعراف', 
  'الأنفال', 'التوبة', 'يونس', 'هود', 'يوسف', 'الرعد', 'إبراهيم', 'الحجر'
];

const grades = [
  { value: 'excellent', label: 'ممتاز', color: 'bg-green-500' },
  { value: 'very_good', label: 'جيد جداً', color: 'bg-blue-500' },
  { value: 'good', label: 'جيد', color: 'bg-yellow-500' },
  { value: 'pass', label: 'مقبول', color: 'bg-orange-500' },
  { value: 'fail', label: 'ضعيف', color: 'bg-red-500' },
];

export function TeacherMemorizationPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: students = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/teacher/students'],
  });

  const { data: evaluations = [] } = useQuery<any[]>({
    queryKey: ['/api/teacher/evaluations'],
  });

  const form = useForm<EvaluationFormData>({
    resolver: zodResolver(evaluationSchema),
    defaultValues: {
      studentId: '',
      surah: '',
      fromAyah: '',
      toAyah: '',
      grade: '',
      notes: '',
      errors: '',
    },
  });

  const submitEvaluationMutation = useMutation({
    mutationFn: async (data: EvaluationFormData) => {
      return apiRequest('/api/teacher/evaluations', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teacher/evaluations'] });
      form.reset();
      setIsDialogOpen(false);
      toast({
        title: 'تم حفظ التقييم',
        description: 'تم تسجيل تقييم الحفظ بنجاح',
      });
    },
    onError: () => {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء حفظ التقييم',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: EvaluationFormData) => {
    submitEvaluationMutation.mutate(data);
  };

  const getGradeInfo = (grade: string) => {
    return grades.find(g => g.value === grade) || { label: grade, color: 'bg-gray-500' };
  };

  return (
    <TeacherLayout>
      <PageHeader 
        title="تقييم الحفظ"
        description="تقييم مستوى حفظ الطلاب"
        actions={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-new-evaluation">
                <Plus className="ml-2 h-4 w-4" />
                تقييم جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>تقييم حفظ جديد</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="studentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الطالب</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-student">
                              <SelectValue placeholder="اختر الطالب" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {students.map((student: any) => (
                              <SelectItem key={student.id} value={student.id}>
                                {student.firstName} {student.lastName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="surah"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>السورة</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-surah">
                              <SelectValue placeholder="اختر السورة" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {surahs.map((surah) => (
                              <SelectItem key={surah} value={surah}>
                                {surah}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fromAyah"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>من آية</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="1" 
                              {...field}
                              data-testid="input-from-ayah"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="toAyah"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>إلى آية</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="10" 
                              {...field}
                              data-testid="input-to-ayah"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="grade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>التقييم</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-grade">
                              <SelectValue placeholder="اختر التقييم" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {grades.map((grade) => (
                              <SelectItem key={grade.value} value={grade.value}>
                                {grade.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="errors"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الأخطاء (اختياري)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="اكتب الأخطاء إن وجدت..."
                            {...field}
                            data-testid="textarea-errors"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ملاحظات (اختياري)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="ملاحظات إضافية..."
                            {...field}
                            data-testid="textarea-notes"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={submitEvaluationMutation.isPending}
                    data-testid="button-submit-evaluation"
                  >
                    {submitEvaluationMutation.isPending ? 'جاري الحفظ...' : 'حفظ التقييم'}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">التقييمات اليوم</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {evaluations.filter((e: any) => 
                new Date(e.createdAt).toDateString() === new Date().toDateString()
              ).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">متوسط التقييم</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">جيد جداً</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">الأخطاء المسجلة</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {evaluations.filter((e: any) => e.errors).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>التقييمات الأخيرة</CardTitle>
          <CardDescription>آخر تقييمات الحفظ للطلاب</CardDescription>
        </CardHeader>
        <CardContent>
          {evaluations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد تقييمات بعد
            </div>
          ) : (
            <div className="space-y-4">
              {evaluations.slice(0, 10).map((evaluation: any, index: number) => {
                const gradeInfo = getGradeInfo(evaluation.grade);
                return (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback>{evaluation.studentName?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{evaluation.studentName}</p>
                        <p className="text-sm text-muted-foreground">
                          {evaluation.surah} - الآيات {evaluation.fromAyah} إلى {evaluation.toAyah}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={gradeInfo.color}>{gradeInfo.label}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(evaluation.createdAt).toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </TeacherLayout>
  );
}