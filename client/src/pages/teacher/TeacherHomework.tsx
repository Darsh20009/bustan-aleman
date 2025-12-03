import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TeacherLayout } from './TeacherLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { ClipboardList, Plus, Clock, CheckCircle, Users } from 'lucide-react';

const homeworkSchema = z.object({
  title: z.string().min(5, 'العنوان يجب أن يكون 5 أحرف على الأقل'),
  description: z.string().min(10, 'الوصف يجب أن يكون 10 أحرف على الأقل'),
  dueDate: z.string().min(1, 'اختر تاريخ التسليم'),
  studentIds: z.string().min(1, 'اختر الطلاب'),
});

type HomeworkFormData = z.infer<typeof homeworkSchema>;

export function TeacherHomeworkPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: homework = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/teacher/homework'],
  });

  const { data: students = [] } = useQuery<any[]>({
    queryKey: ['/api/teacher/students'],
  });

  const form = useForm<HomeworkFormData>({
    resolver: zodResolver(homeworkSchema),
    defaultValues: {
      title: '',
      description: '',
      dueDate: '',
      studentIds: '',
    },
  });

  const createHomeworkMutation = useMutation({
    mutationFn: async (data: HomeworkFormData) => {
      return apiRequest('/api/teacher/homework', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teacher/homework'] });
      form.reset();
      setIsDialogOpen(false);
      toast({
        title: 'تم إنشاء الواجب',
        description: 'تم إرسال الواجب للطلاب بنجاح',
      });
    },
    onError: () => {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء إنشاء الواجب',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: HomeworkFormData) => {
    createHomeworkMutation.mutate(data);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">نشط</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">مكتمل</Badge>;
      case 'expired':
        return <Badge variant="destructive">منتهي</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const columns = [
    { key: 'title', header: 'العنوان' },
    { 
      key: 'dueDate', 
      header: 'تاريخ التسليم',
      render: (h: any) => new Date(h.dueDate).toLocaleDateString('ar-SA')
    },
    { 
      key: 'studentsCount', 
      header: 'عدد الطلاب',
      render: (h: any) => `${h.studentsCount || 0} طالب`
    },
    { 
      key: 'submissionsCount', 
      header: 'التسليمات',
      render: (h: any) => `${h.submissionsCount || 0}/${h.studentsCount || 0}`
    },
    { 
      key: 'status', 
      header: 'الحالة',
      render: (h: any) => getStatusBadge(h.status)
    }
  ];

  const pendingHomework = homework.filter((h: any) => h.status === 'active');
  const completedHomework = homework.filter((h: any) => h.status === 'completed');

  return (
    <TeacherLayout>
      <PageHeader 
        title="إرسال واجبات"
        description="إنشاء ومتابعة الواجبات المرسلة للطلاب"
        actions={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-new-homework">
                <Plus className="ml-2 h-4 w-4" />
                واجب جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>إنشاء واجب جديد</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>عنوان الواجب</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="مثال: حفظ سورة الفاتحة" 
                            {...field}
                            data-testid="input-homework-title"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>وصف الواجب</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="تفاصيل الواجب المطلوب..."
                            {...field}
                            data-testid="textarea-homework-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>تاريخ التسليم</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...field}
                            data-testid="input-homework-duedate"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="studentIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الطلاب</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-students">
                              <SelectValue placeholder="اختر الطلاب" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="all">جميع الطلاب</SelectItem>
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

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={createHomeworkMutation.isPending}
                    data-testid="button-submit-homework"
                  >
                    {createHomeworkMutation.isPending ? 'جاري الإنشاء...' : 'إرسال الواجب'}
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
            <CardTitle className="text-sm font-medium">الواجبات النشطة</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingHomework.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">الواجبات المكتملة</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedHomework.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الطلاب</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students.length}</div>
          </CardContent>
        </Card>
      </div>

      <DataTable
        title="الواجبات"
        description="جميع الواجبات المرسلة"
        columns={columns}
        data={homework}
        isLoading={isLoading}
        emptyMessage="لا توجد واجبات"
      />
    </TeacherLayout>
  );
}