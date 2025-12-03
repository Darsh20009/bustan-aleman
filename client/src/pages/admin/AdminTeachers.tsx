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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Users, UserPlus, UserCheck, Search, Edit, Trash2 } from 'lucide-react';

const teacherSchema = z.object({
  firstName: z.string().min(2, 'الاسم الأول مطلوب'),
  lastName: z.string().min(2, 'اسم العائلة مطلوب'),
  email: z.string().email('البريد الإلكتروني غير صالح'),
  phoneNumber: z.string().min(10, 'رقم الهاتف مطلوب'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
});

type TeacherFormData = z.infer<typeof teacherSchema>;

export function AdminTeachersPage() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: teachers = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/admin/teachers'],
  });

  const form = useForm<TeacherFormData>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      password: '',
    },
  });

  const createTeacherMutation = useMutation({
    mutationFn: async (data: TeacherFormData) => {
      return apiRequest('/api/admin/teachers', {
        method: 'POST',
        body: JSON.stringify({ ...data, role: 'supervisor' }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/teachers'] });
      form.reset();
      setIsDialogOpen(false);
      toast({
        title: 'تم إضافة المعلم',
        description: 'تم إضافة المعلم بنجاح',
      });
    },
    onError: () => {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء إضافة المعلم',
        variant: 'destructive',
      });
    },
  });

  const deleteTeacherMutation = useMutation({
    mutationFn: async (teacherId: string) => {
      return apiRequest(`/api/admin/teachers/${teacherId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/teachers'] });
      toast({
        title: 'تم حذف المعلم',
        description: 'تم حذف المعلم بنجاح',
      });
    },
    onError: () => {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء حذف المعلم',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: TeacherFormData) => {
    createTeacherMutation.mutate(data);
  };

  const filteredTeachers = teachers.filter((t: any) => 
    t.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeTeachers = teachers.filter((t: any) => t.status === 'active');

  const columns = [
    {
      key: 'name',
      header: 'الاسم',
      render: (t: any) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{t.firstName?.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{t.firstName} {t.lastName}</span>
        </div>
      )
    },
    { key: 'email', header: 'البريد الإلكتروني' },
    { key: 'phoneNumber', header: 'رقم الهاتف' },
    { 
      key: 'studentsCount', 
      header: 'عدد الطلاب',
      render: (t: any) => t.studentsCount || 0
    },
    { 
      key: 'status', 
      header: 'الحالة',
      render: (t: any) => (
        <Badge variant={t.status === 'active' ? 'default' : 'secondary'}>
          {t.status === 'active' ? 'نشط' : 'غير نشط'}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'إجراءات',
      render: (t: any) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" data-testid={`button-edit-teacher-${t.id}`}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="ghost"
            onClick={() => deleteTeacherMutation.mutate(t.id)}
            data-testid={`button-delete-teacher-${t.id}`}
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
        title="إدارة المعلمين"
        description="إضافة وإدارة المعلمين"
        actions={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-teacher">
                <UserPlus className="ml-2 h-4 w-4" />
                إضافة معلم
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة معلم جديد</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>الاسم الأول</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-first-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>اسم العائلة</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-last-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>البريد الإلكتروني</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رقم الهاتف</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>كلمة المرور</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} data-testid="input-password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={createTeacherMutation.isPending}
                    data-testid="button-submit-teacher"
                  >
                    {createTeacherMutation.isPending ? 'جاري الإضافة...' : 'إضافة المعلم'}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <StatsCard
          title="إجمالي المعلمين"
          value={teachers.length}
          subtitle="معلم مسجل"
          icon={<Users className="h-4 w-4" />}
        />
        <StatsCard
          title="المعلمين النشطين"
          value={activeTeachers.length}
          subtitle="معلم نشط"
          icon={<UserCheck className="h-4 w-4" />}
        />
        <StatsCard
          title="إجمالي الطلاب"
          value={teachers.reduce((sum: number, t: any) => sum + (t.studentsCount || 0), 0)}
          subtitle="طالب موزع"
          icon={<Users className="h-4 w-4" />}
        />
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ابحث بالاسم أو البريد..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
              data-testid="input-search-teachers"
            />
          </div>
        </CardContent>
      </Card>

      <DataTable
        columns={columns}
        data={filteredTeachers}
        isLoading={isLoading}
        emptyMessage="لا يوجد معلمين"
      />
    </AdminLayout>
  );
}