import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, queryClient } from '@tanstack/react-query';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { useToast } from '../hooks/use-toast';
import { ArrowRight, Plus, Trash2, Upload } from 'lucide-react';
import { apiRequest } from '../lib/queryClient';

const courseSchema = z.object({
  titleAr: z.string().min(3, 'العنوان يجب أن يكون 3 أحرف على الأقل'),
  titleEn: z.string().optional(),
  descriptionAr: z.string().min(10, 'الوصف يجب أن يكون 10 أحرف على الأقل'),
  descriptionEn: z.string().optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  category: z.enum(['quran', 'fiqh', 'hadith', 'seerah', 'other']),
  maxStudents: z.number().min(1).max(500).default(50),
  isPaid: z.boolean().default(false),
  price: z.number().min(0).default(0),
});

type CourseFormData = z.infer<typeof courseSchema>;

interface CreateCoursePageProps {
  onBack: () => void;
}

export function CreateCoursePage({ onBack }: CreateCoursePageProps) {
  const { toast } = useToast();
  const [modules, setModules] = useState<Array<{ title: string; description: string }>>([]);
  const [currentModule, setCurrentModule] = useState({ title: '', description: '' });

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      titleAr: '',
      titleEn: '',
      descriptionAr: '',
      descriptionEn: '',
      level: 'beginner',
      category: 'quran',
      maxStudents: 50,
      isPaid: false,
      price: 0,
    },
  });

  const createCourseMutation = useMutation({
    mutationFn: async (data: CourseFormData & { modules: typeof modules }) => {
      return await apiRequest('/api/supervisor/courses', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: 'تم إنشاء الدورة بنجاح',
        description: 'تم إضافة الدورة الجديدة',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/courses'] });
      onBack();
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في إنشاء الدورة',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: CourseFormData) => {
    createCourseMutation.mutate({ ...data, modules });
  };

  const addModule = () => {
    if (currentModule.title && currentModule.description) {
      setModules([...modules, currentModule]);
      setCurrentModule({ title: '', description: '' });
    }
  };

  const removeModule = (index: number) => {
    setModules(modules.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4"
            data-testid="button-back"
          >
            <ArrowRight className="ml-2 h-4 w-4" />
            العودة
          </Button>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">إنشاء دورة جديدة</h1>
          <p className="text-gray-600">أضف دورة تعليمية جديدة للطلاب</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>معلومات الدورة</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="titleAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>العنوان بالعربية *</FormLabel>
                        <FormControl>
                          <Input placeholder="مثال: دورة تجويد متقدمة" {...field} data-testid="input-title-ar" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="titleEn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>العنوان بالإنجليزية (اختياري)</FormLabel>
                        <FormControl>
                          <Input placeholder="Example: Advanced Tajweed Course" {...field} data-testid="input-title-en" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="descriptionAr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الوصف بالعربية *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="وصف تفصيلي للدورة..."
                          className="min-h-[120px]"
                          {...field}
                          data-testid="input-description-ar"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>المستوى *</FormLabel>
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

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>التصنيف *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-category">
                              <SelectValue placeholder="اختر التصنيف" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="quran">قرآن</SelectItem>
                            <SelectItem value="fiqh">فقه</SelectItem>
                            <SelectItem value="hadith">حديث</SelectItem>
                            <SelectItem value="seerah">سيرة</SelectItem>
                            <SelectItem value="other">أخرى</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            data-testid="input-max-students"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="isPaid"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={field.onChange}
                            className="w-4 h-4"
                            data-testid="checkbox-is-paid"
                          />
                        </FormControl>
                        <FormLabel className="!mt-0">دورة مدفوعة</FormLabel>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch('isPaid') && (
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>السعر (ريال)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                              data-testid="input-price"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {/* Modules Section */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">مراحل ووحدات الدورة</h3>

                  <div className="space-y-3 mb-4">
                    <Input
                      placeholder="عنوان الوحدة"
                      value={currentModule.title}
                      onChange={(e) => setCurrentModule({ ...currentModule, title: e.target.value })}
                      data-testid="input-module-title"
                    />
                    <Textarea
                      placeholder="وصف الوحدة"
                      value={currentModule.description}
                      onChange={(e) => setCurrentModule({ ...currentModule, description: e.target.value })}
                      data-testid="input-module-description"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addModule}
                      className="w-full"
                      data-testid="button-add-module"
                    >
                      <Plus className="ml-2 h-4 w-4" />
                      إضافة وحدة
                    </Button>
                  </div>

                  {modules.length > 0 && (
                    <div className="space-y-2">
                      {modules.map((module, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <h4 className="font-medium">{module.title}</h4>
                            <p className="text-sm text-gray-600">{module.description}</p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeModule(index)}
                            data-testid={`button-remove-module-${index}`}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={createCourseMutation.isPending}
                    className="flex-1"
                    data-testid="button-submit"
                  >
                    {createCourseMutation.isPending ? 'جاري الإنشاء...' : 'إنشاء الدورة'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onBack}
                    data-testid="button-cancel"
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
