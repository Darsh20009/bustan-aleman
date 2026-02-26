import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import {
  User,
  Phone,
  Mail,
  BookOpen,
  Shield,
  Star,
  Edit,
  Save,
  X,
  TrendingUp,
} from 'lucide-react';

const profileSchema = z.object({
  firstName: z.string().min(2, 'الاسم الأول يجب أن يكون على الأقل حرفين'),
  lastName: z.string().min(2, 'اسم العائلة يجب أن يكون على الأقل حرفين'),
  email: z.string().email('بريد إلكتروني غير صالح').or(z.literal('')).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const ROLE_LABELS: Record<string, string> = {
  student: 'طالب',
  teacher: 'معلم',
  supervisor: 'مشرف',
  admin: 'مدير',
  owner: 'مالك المنصة',
};

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'مبتدئ',
  intermediate: 'متوسط',
  advanced: 'متقدم',
};

const LEVEL_COLORS: Record<string, string> = {
  beginner: 'bg-blue-100 text-blue-700',
  intermediate: 'bg-amber-100 text-amber-700',
  advanced: 'bg-emerald-100 text-emerald-700',
};

export function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const { data: profile, isLoading } = useQuery<any>({
    queryKey: ['/api/profile'],
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      email: profile?.email || '',
    },
    values: {
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      email: profile?.email || '',
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
      return apiRequest('PATCH', '/api/profile', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      setIsEditing(false);
      toast({ title: 'تم الحفظ', description: 'تم تحديث ملفك الشخصي بنجاح' });
    },
    onError: () => {
      toast({ title: 'خطأ', description: 'تعذر تحديث الملف الشخصي', variant: 'destructive' });
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">يرجى تسجيل الدخول أولًا</p>
      </div>
    );
  }

  const initials = `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase() || user.firstName?.charAt(0)?.toUpperCase() || '؟';
  const student = profile?.student;
  const memorizedSurahs = student?.memorizedSurahs ? (() => {
    try {
      const p = typeof student.memorizedSurahs === 'string' ? JSON.parse(student.memorizedSurahs) : student.memorizedSurahs;
      return Array.isArray(p) ? p.length : 0;
    } catch { return 0; }
  })() : 0;
  const memorizedPercent = Math.min(Math.round((memorizedSurahs / 114) * 100), 100);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-8" dir="rtl">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-arabic">الملف الشخصي</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">إدارة معلوماتك الشخصية</p>
          </div>
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="font-arabic"
            data-testid="button-back"
          >
            رجوع
          </Button>
        </div>

        {/* Profile Card */}
        <Card className="shadow-sm border border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              {/* Avatar */}
              <Avatar className="h-20 w-20 border-4 border-emerald-100">
                <AvatarFallback className="bg-emerald-600 text-white text-2xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>

              {/* Basic Info */}
              <div className="flex-1 text-center sm:text-right">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white font-arabic">
                  {user.firstName} {user.lastName}
                </h2>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                  <Badge className="bg-emerald-100 text-emerald-700 font-arabic" data-testid="badge-role">
                    <Shield className="h-3.5 w-3.5 ml-1" />
                    {ROLE_LABELS[user.role] || user.role}
                  </Badge>
                  {student?.level && (
                    <Badge className={`font-arabic ${LEVEL_COLORS[student.level] || 'bg-gray-100 text-gray-700'}`} data-testid="badge-level">
                      <Star className="h-3.5 w-3.5 ml-1" />
                      {LEVEL_LABELS[student.level] || student.level}
                    </Badge>
                  )}
                  {student?.isPaid ? (
                    <Badge className="bg-emerald-100 text-emerald-700 font-arabic" data-testid="badge-subscription">
                      اشتراك نشط
                    </Badge>
                  ) : user.role === 'student' ? (
                    <Badge className="bg-red-100 text-red-700 font-arabic" data-testid="badge-no-subscription">
                      غير مشترك
                    </Badge>
                  ) : null}
                </div>

                {/* Contact Info */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                  {(profile?.phoneNumber || user.phoneNumber) && (
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-emerald-600" />
                      {profile?.phoneNumber || user.phoneNumber}
                    </span>
                  )}
                  {(profile?.email || user.email) && (
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-emerald-600" />
                      {profile?.email || user.email}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quran Progress (for students) */}
        {user.role === 'student' && (
          <Card className="shadow-sm border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base font-arabic">
                <BookOpen className="h-5 w-5 text-emerald-600" />
                تقدم حفظ القرآن
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">السور المحفوظة</span>
                  <span className="font-bold text-emerald-600">{memorizedSurahs} / 114</span>
                </div>
                <Progress value={memorizedPercent} className="h-3" />
                <p className="text-xs text-gray-400 mt-1.5">{memorizedPercent}% من القرآن الكريم</p>
              </div>

              {student?.level && (
                <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-100 dark:border-emerald-800">
                  <TrendingUp className="h-5 w-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300 font-arabic">
                      المستوى الحالي: {LEVEL_LABELS[student.level] || student.level}
                    </p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {student.level === 'advanced' ? 'ممتاز! أنت في أعلى المستويات' :
                        student.level === 'intermediate' ? 'جيد! استمر في التقدم' :
                          'تعلم المبادئ الأساسية وستتقدم بإذن الله'}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Edit Profile Form */}
        <Card className="shadow-sm border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base font-arabic">
                  <User className="h-5 w-5 text-emerald-600" />
                  المعلومات الشخصية
                </CardTitle>
                <CardDescription className="font-arabic mt-1">تعديل بياناتك الشخصية</CardDescription>
              </div>
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="font-arabic text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                  data-testid="button-edit-profile"
                >
                  <Edit className="h-4 w-4 ml-2" />
                  تعديل
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setIsEditing(false); form.reset(); }}
                  className="text-gray-500"
                  data-testid="button-cancel-edit"
                >
                  <X className="h-4 w-4 ml-1" />
                  إلغاء
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => updateMutation.mutate(data))} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-arabic">الاسم الأول</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-first-name" className="text-right" />
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
                          <FormLabel className="font-arabic">اسم العائلة</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-last-name" className="text-right" />
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
                        <FormLabel className="font-arabic">البريد الإلكتروني</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" data-testid="input-email" className="text-left" dir="ltr" placeholder="example@email.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Separator />
                  <Button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-arabic"
                    data-testid="button-save-profile"
                  >
                    {updateMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4" />
                        جاري الحفظ...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        حفظ التغييرات
                      </span>
                    )}
                  </Button>
                </form>
              </Form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 font-arabic mb-1">الاسم الأول</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white" data-testid="text-first-name">
                      {profile?.firstName || user.firstName || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-arabic mb-1">اسم العائلة</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white" data-testid="text-last-name">
                      {profile?.lastName || user.lastName || '—'}
                    </p>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-gray-400 font-arabic mb-1">رقم الهاتف</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white" dir="ltr" data-testid="text-phone">
                    {profile?.phoneNumber || user.phoneNumber || '—'}
                  </p>
                </div>
                {(profile?.email || user.email) && (
                  <div>
                    <p className="text-xs text-gray-400 font-arabic mb-1">البريد الإلكتروني</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white" dir="ltr" data-testid="text-email">
                      {profile?.email || user.email}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-400 font-arabic mb-1">الدور في المنصة</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white font-arabic" data-testid="text-role">
                    {ROLE_LABELS[user.role] || user.role}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
