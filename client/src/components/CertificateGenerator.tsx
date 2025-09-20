import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Award, CheckCircle, Loader2 } from 'lucide-react';

// Zod schema for certificate creation
const certificateSchema = z.object({
  studentId: z.string().min(1, "يرجى اختيار الطالب"),
  courseId: z.string().optional(),
  titleAr: z.string().min(1, "العنوان بالعربية مطلوب"),
  titleEn: z.string().optional(),
  descriptionAr: z.string().optional(),
  descriptionEn: z.string().optional(),
  grade: z.string().min(1, "يرجى تحديد التقدير"),
  teacherName: z.string().min(1, "اسم المعلم مطلوب"),
});

type CertificateFormData = z.infer<typeof certificateSchema>;

interface Student {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface Course {
  id: string;
  titleAr: string;
  titleEn?: string;
}

export default function CertificateGenerator() {
  const { toast } = useToast();
  const [generatedCertificate, setGeneratedCertificate] = useState<any>(null);

  const form = useForm<CertificateFormData>({
    resolver: zodResolver(certificateSchema),
    defaultValues: {
      titleAr: '',
      titleEn: '',
      descriptionAr: '',
      descriptionEn: '',
      grade: '',
      teacherName: '',
      studentId: '',
      courseId: '',
    },
  });

  // Fetch students
  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ['/api/students'],
  });

  // Fetch courses
  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ['/api/courses'],
  });

  // Create certificate mutation
  const createCertificateMutation = useMutation({
    mutationFn: (data: CertificateFormData) => 
      fetch('/api/certificates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }).then(res => {
        if (!res.ok) throw new Error('Failed to create certificate');
        return res.json();
      }),
    onSuccess: (certificate) => {
      toast({
        title: "تم إنشاء الشهادة بنجاح! 🎉",
        description: "تم إنشاء الشهادة وإرسالها للطالب",
      });
      setGeneratedCertificate(certificate);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/certificates'] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "خطأ في إنشاء الشهادة",
        description: error.message || "حدث خطأ غير متوقع",
      });
    },
  });

  const onSubmit = (data: CertificateFormData) => {
    createCertificateMutation.mutate(data);
  };

  const gradeOptions = [
    { value: "ممتاز", label: "ممتاز (Excellent)" },
    { value: "جيد جداً", label: "جيد جداً (Very Good)" },
    { value: "جيد", label: "جيد (Good)" },
    { value: "مقبول", label: "مقبول (Pass)" },
  ];

  if (generatedCertificate) {
    return (
      <div className="container mx-auto p-6" dir="rtl">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl text-green-600">تم إنشاء الشهادة بنجاح!</CardTitle>
            <CardDescription>تم إنشاء الشهادة وحفظها في النظام</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold mb-2">تفاصيل الشهادة:</h3>
              <p><strong>العنوان:</strong> {generatedCertificate.titleAr}</p>
              <p><strong>التقدير:</strong> {generatedCertificate.grade}</p>
              <p><strong>المعلم:</strong> {generatedCertificate.teacherName}</p>
              <p><strong>رمز التحقق:</strong> {generatedCertificate.code}</p>
            </div>
            
            {generatedCertificate.qrImageDataUrl && (
              <div className="text-center">
                <h4 className="font-semibold mb-2">رمز QR للتحقق:</h4>
                <img 
                  src={generatedCertificate.qrImageDataUrl} 
                  alt="QR Code" 
                  className="mx-auto border rounded"
                />
              </div>
            )}
            
            <Button 
              onClick={() => setGeneratedCertificate(null)}
              className="w-full mt-6"
              data-testid="button-create-another"
            >
              إنشاء شهادة جديدة
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6" dir="rtl">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" />
            <CardTitle>إنشاء شهادة جديدة</CardTitle>
          </div>
          <CardDescription>
            قم بملء البيانات التالية لإنشاء شهادة للطالب
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Student Selection */}
              <FormField
                control={form.control}
                name="studentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اختر الطالب *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} data-testid="select-student">
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الطالب..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {students.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.firstName && student.lastName 
                              ? `${student.firstName} ${student.lastName}`
                              : student.email || student.id
                            }
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Course Selection (Optional) */}
              <FormField
                control={form.control}
                name="courseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الدورة (اختياري)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} data-testid="select-course">
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الدورة (اختياري)..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {courses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.titleAr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Certificate Title in Arabic */}
              <FormField
                control={form.control}
                name="titleAr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>عنوان الشهادة بالعربية *</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="مثال: شهادة إتمام دورة تحفيظ القرآن الكريم"
                        data-testid="input-title-ar"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Certificate Title in English (Optional) */}
              <FormField
                control={form.control}
                name="titleEn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>عنوان الشهادة بالإنجليزية (اختياري)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Certificate of Completion - Quran Memorization Course"
                        data-testid="input-title-en"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Grade Selection */}
              <FormField
                control={form.control}
                name="grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>التقدير *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} data-testid="select-grade">
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر التقدير..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {gradeOptions.map((grade) => (
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

              {/* Teacher Name */}
              <FormField
                control={form.control}
                name="teacherName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم المعلم *</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="الشيخ محمد العلي"
                        data-testid="input-teacher-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description in Arabic */}
              <FormField
                control={form.control}
                name="descriptionAr"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>وصف الشهادة بالعربية</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field}
                        placeholder="تفاصيل إضافية عن الشهادة..."
                        className="min-h-[80px]"
                        data-testid="textarea-description-ar"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full"
                disabled={createCertificateMutation.isPending}
                data-testid="button-generate-certificate"
              >
                {createCertificateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري إنشاء الشهادة...
                  </>
                ) : (
                  <>
                    <Award className="mr-2 h-4 w-4" />
                    إنشاء الشهادة
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}