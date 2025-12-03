import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AdminLayout } from './AdminLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { DataTable } from '@/components/shared/DataTable';
import { Card, CardContent } from '@/components/ui/card';
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
import { BookOpen, Plus, Users, Calendar, Edit, Trash2, Search } from 'lucide-react';

const halaqaSchema = z.object({
  name: z.string().min(3, 'اسم الحلقة مطلوب'),
  description: z.string().optional(),
  teacherId: z.string().min(1, 'اختر المعلم'),
  maxStudents: z.string().min(1, 'أدخل الحد الأقصى'),
  schedule: z.string().min(1, 'أدخل الجدول'),
  level: z.string().min(1, 'اختر المستوى'),
});

type HalaqaFormData = z.infer<typeof halaqaSchema>;

export function AdminHalaqasPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: halaqas = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/admin/halaqas'],
  });

  const { data: teachers = [] } = useQuery<any[]>({
    queryKey: ['/api/admin/teachers'],
  });

  const form = useForm<HalaqaFormData>({
    resolver: zodResolver(halaqaSchema),
    defaultValues: {
      name: '',
      description: '',
      teacherId: '',
      maxStudents: '15',
      schedule: '',
      level: '',
    },
  });

  const createHalaqaMutation = useMutation({
    mutationFn: async (data: HalaqaFormData) => {
      return apiRequest('/api/admin/halaqas', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/halaqas'] });
      form.reset();
      setIsDialogOpen(false);
      toast({
        title: 'تم إنشاء الحلقة',
        description: 'تم إنشاء الحلقة بنجاح',
      });
    },
    onError: () => {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء إنشاء الحلقة',
        variant: 'destructive',
      });
    },
  });

  const deleteHalaqaMutation = useMutation({
    mutationFn: async (halaqaId: string) => {
      return apiRequest(`/api/admin/halaqas/${halaqaId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/halaqas'] });
      toast({
        title: 'تم حذف الحلقة',
        description: 'تم حذف الحلقة بنجاح',
      });
    },
  });

  const onSubmit = (data: HalaqaFormData) => {
    createHalaqaMutation.mutate(data);
  };

  const filteredHalaqas = halaqas.filter((h: any) => 
    h.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeHalaqas = halaqas.filter((h: any) => h.status === 'active');
  const totalStudents = halaqas.reduce((sum: number, h: any) => sum + (h.studentsCount || 0), 0);

  const columns = [
    { key: 'name', header: 'اسم الحلقة' },
    { key: 'teacherName', header: 'المعلم' },
    { 
      key: 'level', 
      header: 'المستوى',
      render: (h: any) => (
        <Badge variant="secondary">
          {h.level === 'beginner' ? 'مبتدئ' : h.level === 'intermediate' ? 'متوسط' : 'متقدم'}
        </Badge>
      )
    },
    { 
      key: 'students', 
      header: 'الطلاب',
      render: (h: any) => `${h.studentsCount || 0}/${h.maxStudents}`
    },
    { key: 'schedule', header: 'الجدول' },
    { 
      key: 'status', 
      header: 'الحالة',
      render: (h: any) => (
        <Badge variant={h.status === 'active' ? 'default' : 'secondary'}>
          {h.status === 'active' ? 'نشطة' : 'غير نشطة'}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'إجراءات',
      render: (h: any) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" data-testid={`button-edit-halaqa-${h.id}`}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="ghost"
            onClick={() => deleteHalaqaMutation.mutate(h.id)}
            data-testid={`button-delete-halaqa-${h.id}`}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <AdminLayout>
      <PageHeader 
        title="إنشاء حلقات"
        description="إدارة الحلقات التعليمية"
        actions={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-halaqa">
                <Plus className="ml-2 h-4 w-4" />
                إنشاء حلقة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>إنشاء حلقة جديدة</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم الحلقة</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="مثال: حلقة الفجر" 
                            {...field}
                            data-testid="input-halaqa-name"
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
                        <FormLabel>الوصف (اختياري)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="وصف الحلقة..."
                            {...field}
                            data-testid="textarea-halaqa-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="teacherId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>المعلم</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-teacher">
                                <SelectValue placeholder="اختر المعلم" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {teachers.map((teacher: any) => (
                                <SelectItem key={teacher.id} value={teacher.id}>
                                  {teacher.firstName} {teacher.lastName}
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
                      name="level"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>المستوى</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-level">
                                <SelectValue placeholder="اختر المستوى" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="beginner">مبتدئ</SelectItem>
                              <SelectItem value="intermediate">متوسط</SelectItem>
                              <SelectItem value="advanced">متقدم</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="maxStudents"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الحد الأقصى للطلاب</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field}
                              data-testid="input-max-students"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="schedule"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الجدول</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="مثال: السبت والأحد 5 مساءً"
                              {...field}
                              data-testid="input-schedule"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={createHalaqaMutation.isPending}
                    data-testid="button-submit-halaqa"
                  >
                    {createHalaqaMutation.isPending ? 'جاري الإنشاء...' : 'إنشاء الحلقة'}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <StatsCard
          title="إجمالي الحلقات"
          value={halaqas.length}
          subtitle="حلقة"
          icon={<BookOpen className="h-4 w-4" />}
        />
        <StatsCard
          title="الحلقات النشطة"
          value={activeHalaqas.length}
          subtitle="حلقة نشطة"
          icon={<Calendar className="h-4 w-4" />}
        />
        <StatsCard
          title="إجمالي الطلاب"
          value={totalStudents}
          subtitle="طالب مسجل"
          icon={<Users className="h-4 w-4" />}
        />
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ابحث عن حلقة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
              data-testid="input-search-halaqas"
            />
          </div>
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        data={filteredHalaqas}
        isLoading={isLoading}
        emptyMessage="لا توجد حلقات"
      />
    </AdminLayout>
  );
}