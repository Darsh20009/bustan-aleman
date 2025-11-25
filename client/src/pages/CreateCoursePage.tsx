import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
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
import { 
  ArrowRight, 
  Plus, 
  Trash2, 
  Upload, 
  Video, 
  Image, 
  FileText,
  Check,
  ChevronRight,
  BookOpen,
  ClipboardList,
  Award
} from 'lucide-react';
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

interface Upload {
  fileType: 'video' | 'image' | 'pdf' | 'document';
  fileName: string;
  fileUrl: string;
  titleAr: string;
  titleEn?: string;
  descriptionAr?: string;
}

interface QuizQuestion {
  questionAr: string;
  questionEn?: string;
  optionsAr: string[];
  optionsEn?: string[];
  correctAnswer: number;
  points: number;
}

export function CreateCoursePage({ onBack }: CreateCoursePageProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [addQuiz, setAddQuiz] = useState(false);
  const [addCertificate, setAddCertificate] = useState(false);
  const [certificateName, setCertificateName] = useState('');

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
    mutationFn: async (data: CourseFormData & { 
      uploads: Upload[];
      quizQuestions: QuizQuestion[];
      addQuiz: boolean;
      addCertificate: boolean;
      certificateName: string;
    }) => {
      console.log('📤 Creating course with data:', data);
      const response = await apiRequest('POST', '/api/courses', data);
      const json = await response.json();
      console.log('✅ Course created:', json);
      return json;
    },
    onSuccess: (data: any) => {
      toast({
        title: 'تم إنشاء الدورة بنجاح',
        description: `تم إضافة "${data.titleAr}" بنجاح`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/courses'] });
      setTimeout(onBack, 1500);
    },
    onError: (error: any) => {
      console.error('❌ Error creating course:', error);
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في إنشاء الدورة',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: CourseFormData) => {
    console.log('📋 Form submitted with data:', data);
    console.log('📋 Form errors:', form.formState.errors);
    
    // Force free courses for supervisors
    const courseData = { 
      ...data,
      isPaid: false,
      price: 0,
      uploads,
      quizQuestions,
      addQuiz,
      addCertificate,
      certificateName,
    };
    
    if (addQuiz && quizQuestions.length === 0) {
      toast({
        title: 'خطأ',
        description: 'يجب إضافة سؤال واحد على الأقل للاختبار',
        variant: 'destructive',
      });
      return;
    }

    console.log('📤 Sending course creation request...');
    createCourseMutation.mutate(courseData);
  };

  // Upload handlers
  const [currentUpload, setCurrentUpload] = useState<Upload>({
    fileType: 'video',
    fileName: '',
    fileUrl: '',
    titleAr: '',
  });

  const addUpload = () => {
    if (!currentUpload.fileName || !currentUpload.fileUrl || !currentUpload.titleAr) {
      toast({
        title: 'خطأ',
        description: 'يرجى ملء جميع الحقول المطلوبة',
        variant: 'destructive',
      });
      return;
    }
    setUploads([...uploads, currentUpload]);
    setCurrentUpload({
      fileType: 'video',
      fileName: '',
      fileUrl: '',
      titleAr: '',
    });
    toast({
      title: 'تمت الإضافة',
      description: 'تم إضافة الملف بنجاح',
    });
  };

  // Quiz handlers
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion>({
    questionAr: '',
    optionsAr: ['', '', '', ''],
    correctAnswer: 0,
    points: 1,
  });

  const addQuizQuestion = () => {
    if (!currentQuestion.questionAr || !currentQuestion.optionsAr.every(opt => opt.trim())) {
      toast({
        title: 'خطأ',
        description: 'يرجى ملء السؤال وجميع الخيارات',
        variant: 'destructive',
      });
      return;
    }
    setQuizQuestions([...quizQuestions, currentQuestion]);
    setCurrentQuestion({
      questionAr: '',
      optionsAr: ['', '', '', ''],
      correctAnswer: 0,
      points: 1,
    });
    toast({
      title: 'تمت الإضافة',
      description: 'تم إضافة السؤال بنجاح',
    });
  };

  const levelAr = {
    beginner: 'مبتدئ',
    intermediate: 'متوسط',
    advanced: 'متقدم',
  };

  const categoryAr = {
    quran: 'قرآن',
    fiqh: 'فقه',
    hadith: 'حديث',
    seerah: 'سيرة',
    other: 'أخرى',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4"
            data-testid="button-back"
          >
            <ArrowRight className="ml-2 h-4 w-4" />
            العودة
          </Button>
          <h1 className="text-4xl font-bold text-emerald-900 mb-2">إنشاء دورة جديدة</h1>
          <p className="text-emerald-700">أضف دورة تعليمية جديدة خطوة بخطوة</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between mb-8 max-w-2xl">
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  currentStep >= step
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {step === 1 && <BookOpen className="w-5 h-5" />}
                {step === 2 && <Upload className="w-5 h-5" />}
                {step === 3 && <ClipboardList className="w-5 h-5" />}
                {step === 4 && <Award className="w-5 h-5" />}
                {step === 5 && <Check className="w-5 h-5" />}
              </div>
              <p className="text-xs text-gray-600 mt-1 text-center">
                {step === 1 && 'التفاصيل'}
                {step === 2 && 'الملفات'}
                {step === 3 && 'الاختبار'}
                {step === 4 && 'الشهادة'}
                {step === 5 && 'الإنهاء'}
              </p>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-3 gap-6">
              {/* Left Side - Form */}
              <div className="col-span-2">
                {/* Step 1: Course Details */}
                {currentStep === 1 && (
                  <Card className="border-emerald-200">
                    <CardHeader>
                      <CardTitle className="text-emerald-700">معلومات الدورة</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="titleAr"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>اسم الدورة *</FormLabel>
                            <FormControl>
                              <Input placeholder="مثال: دورة تجويد متقدمة" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="descriptionAr"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>وصف الدورة *</FormLabel>
                            <FormControl>
                              <Textarea placeholder="وصف تفصيلي للدورة..." className="min-h-24" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="level"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>المستوى *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
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
                                  <SelectTrigger>
                                    <SelectValue />
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
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="maxStudents"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>الحد الأقصى للطلاب</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="isPaid"
                          render={({ field }) => (
                            <FormItem className="flex items-end">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={field.value}
                                  onChange={field.onChange}
                                  className="w-4 h-4 rounded"
                                />
                                <span className="text-sm font-medium">دورة مدفوعة</span>
                              </label>
                            </FormItem>
                          )}
                        />
                      </div>

                      {form.watch('isPaid') && (
                        <>
                          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800 font-arabic-sans">
                            ⚠️ ملاحظة: فقط المديرين يمكنهم إنشاء دورات مدفوعة. سيتم رفع هذه الدورة كدورة مجانية.
                          </div>
                          <FormField
                            control={form.control}
                            name="price"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>السعر (ريال)</FormLabel>
                                <FormControl>
                                  <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} disabled />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Step 2: Upload Files */}
                {currentStep === 2 && (
                  <Card className="border-emerald-200">
                    <CardHeader>
                      <CardTitle className="text-emerald-700">الملفات والفيديوهات والصور</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div>
                          <FormLabel>نوع الملف</FormLabel>
                          <Select
                            value={currentUpload.fileType}
                            onValueChange={(value: 'video' | 'image' | 'pdf' | 'document') =>
                              setCurrentUpload({ ...currentUpload, fileType: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="video">فيديو</SelectItem>
                              <SelectItem value="image">صورة</SelectItem>
                              <SelectItem value="pdf">PDF</SelectItem>
                              <SelectItem value="document">مستند</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <Input
                          placeholder="اسم الملف"
                          value={currentUpload.fileName}
                          onChange={(e) => setCurrentUpload({ ...currentUpload, fileName: e.target.value })}
                        />

                        <Input
                          placeholder="عنوان الملف"
                          value={currentUpload.titleAr}
                          onChange={(e) => setCurrentUpload({ ...currentUpload, titleAr: e.target.value })}
                        />

                        <Input
                          placeholder="رابط الملف (أو رفعه من Google Drive)"
                          value={currentUpload.fileUrl}
                          onChange={(e) => setCurrentUpload({ ...currentUpload, fileUrl: e.target.value })}
                        />

                        <Textarea
                          placeholder="وصف الملف (اختياري)"
                          value={currentUpload.descriptionAr || ''}
                          onChange={(e) => setCurrentUpload({ ...currentUpload, descriptionAr: e.target.value })}
                          className="min-h-20"
                        />

                        <Button onClick={addUpload} type="button" className="w-full bg-emerald-500 hover:bg-emerald-600">
                          <Plus className="ml-2 h-4 w-4" />
                          إضافة ملف
                        </Button>
                      </div>

                      {uploads.length > 0 && (
                        <div className="mt-6 space-y-2">
                          <h4 className="font-semibold text-sm text-gray-700">الملفات المضافة ({uploads.length})</h4>
                          {uploads.map((upload, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                              <div className="flex items-center gap-2">
                                {upload.fileType === 'video' && <Video className="h-4 w-4 text-blue-500" />}
                                {upload.fileType === 'image' && <Image className="h-4 w-4 text-green-500" />}
                                {(upload.fileType === 'pdf' || upload.fileType === 'document') && <FileText className="h-4 w-4 text-red-500" />}
                                <div>
                                  <p className="font-medium text-sm">{upload.titleAr}</p>
                                  <p className="text-xs text-gray-600">{upload.fileName}</p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setUploads(uploads.filter((_, i) => i !== index))}
                                type="button"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Step 3: Quiz */}
                {currentStep === 3 && (
                  <Card className="border-emerald-200">
                    <CardHeader>
                      <CardTitle className="text-emerald-700">اختبار اجتياز الدورة</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <label className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={addQuiz}
                          onChange={(e) => setAddQuiz(e.target.checked)}
                          className="w-4 h-4 rounded"
                        />
                        <span className="font-medium">إضافة اختبار اجتياز للدورة</span>
                      </label>

                      {addQuiz && (
                        <div className="space-y-3 mt-4">
                          <Textarea
                            placeholder="السؤال..."
                            value={currentQuestion.questionAr}
                            onChange={(e) => setCurrentQuestion({ ...currentQuestion, questionAr: e.target.value })}
                            className="min-h-20"
                          />

                          <div className="space-y-2">
                            <FormLabel>الخيارات (اختر الإجابة الصحيحة)</FormLabel>
                            {[0, 1, 2, 3].map((optIndex) => (
                              <div key={optIndex} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name="correctAnswer"
                                  checked={currentQuestion.correctAnswer === optIndex}
                                  onChange={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: optIndex })}
                                  className="w-4 h-4"
                                />
                                <Input
                                  placeholder={`الخيار ${optIndex + 1}`}
                                  value={currentQuestion.optionsAr[optIndex]}
                                  onChange={(e) => {
                                    const newOptions = [...currentQuestion.optionsAr];
                                    newOptions[optIndex] = e.target.value;
                                    setCurrentQuestion({ ...currentQuestion, optionsAr: newOptions });
                                  }}
                                />
                              </div>
                            ))}
                          </div>

                          <Button onClick={addQuizQuestion} type="button" className="w-full bg-emerald-500 hover:bg-emerald-600">
                            <Plus className="ml-2 h-4 w-4" />
                            إضافة سؤال
                          </Button>

                          {quizQuestions.length > 0 && (
                            <div className="mt-4 space-y-2">
                              <h4 className="font-semibold text-sm">الأسئلة المضافة ({quizQuestions.length})</h4>
                              {quizQuestions.map((q, index) => (
                                <div key={index} className="p-2 bg-emerald-50 rounded border border-emerald-200 text-sm">
                                  <p>{q.questionAr}</p>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setQuizQuestions(quizQuestions.filter((_, i) => i !== index))}
                                    type="button"
                                    className="mt-1"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Step 4: Certificate */}
                {currentStep === 4 && (
                  <Card className="border-emerald-200">
                    <CardHeader>
                      <CardTitle className="text-emerald-700">شهادة الإنجاز</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <label className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={addCertificate}
                          onChange={(e) => setAddCertificate(e.target.checked)}
                          className="w-4 h-4 rounded"
                        />
                        <span className="font-medium">إضافة شهادة عند إنهاء الدورة</span>
                      </label>

                      {addCertificate && (
                        <div className="space-y-3 mt-4">
                          <Input
                            placeholder="اسم الشهادة"
                            value={certificateName}
                            onChange={(e) => setCertificateName(e.target.value)}
                          />
                          <div className="relative overflow-hidden rounded-xl border-4 border-emerald-500/30 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-8 shadow-2xl">
                            {/* Islamic Corner Decorations */}
                            <div className="absolute top-0 left-0 w-24 h-24 border-t-4 border-l-4 border-emerald-400/40 rounded-tl-lg"></div>
                            <div className="absolute top-0 right-0 w-24 h-24 border-t-4 border-r-4 border-emerald-400/40 rounded-tr-lg"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 border-b-4 border-l-4 border-emerald-400/40 rounded-bl-lg"></div>
                            <div className="absolute bottom-0 right-0 w-24 h-24 border-b-4 border-r-4 border-emerald-400/40 rounded-br-lg"></div>
                            
                            {/* Decorative Stars */}
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-amber-400 text-2xl">✦</div>
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-amber-400 text-2xl">✦</div>
                            
                            {/* Content */}
                            <div className="relative z-10 text-center space-y-4">
                              {/* Header */}
                              <div className="space-y-2">
                                <Award className="h-16 w-16 mx-auto text-emerald-600 drop-shadow-lg" />
                                <div className="h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>
                              </div>
                              
                              {/* Title */}
                              <div className="space-y-1">
                                <h3 className="text-2xl font-bold text-emerald-900 tracking-wide">
                                  {certificateName || 'شهادة الإنجاز'}
                                </h3>
                                <p className="text-sm text-emerald-600 font-arabic">Certificate of Achievement</p>
                              </div>
                              
                              {/* Divider */}
                              <div className="flex items-center justify-center gap-2">
                                <div className="h-px w-16 bg-gradient-to-r from-transparent to-emerald-300"></div>
                                <div className="text-emerald-400 text-lg">❈</div>
                                <div className="h-px w-16 bg-gradient-to-l from-transparent to-emerald-300"></div>
                              </div>
                              
                              {/* Body Text */}
                              <div className="space-y-3 text-sm text-gray-700">
                                <p className="leading-relaxed">
                                  تُمنح هذه الشهادة للطالب المتميز
                                </p>
                                <div className="text-2xl font-bold text-emerald-800 py-2 border-b-2 border-t-2 border-emerald-200">
                                  [اسم الطالب]
                                </div>
                                <p className="leading-relaxed">
                                  وذلك لإتمامه بنجاح دورة
                                  <br />
                                  <span className="font-bold text-emerald-700">{form.getValues('titleAr') || 'اسم الدورة'}</span>
                                </p>
                              </div>
                              
                              {/* Signature Area */}
                              <div className="grid grid-cols-2 gap-8 pt-6 text-xs">
                                <div className="space-y-1">
                                  <div className="h-px bg-emerald-300 w-24 mx-auto"></div>
                                  <p className="text-gray-600">التوقيع</p>
                                </div>
                                <div className="space-y-1">
                                  <div className="h-px bg-emerald-300 w-24 mx-auto"></div>
                                  <p className="text-gray-600">التاريخ</p>
                                </div>
                              </div>
                            </div>
                            
                            {/* Background Pattern */}
                            <div className="absolute inset-0 opacity-5 pointer-events-none">
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl text-emerald-600">✦</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Step 5: Review */}
                {currentStep === 5 && (
                  <Card className="border-emerald-200">
                    <CardHeader>
                      <CardTitle className="text-emerald-700">تأكيد الدورة</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between pb-2 border-b">
                          <span className="text-gray-600">اسم الدورة:</span>
                          <span className="font-semibold">{form.getValues('titleAr')}</span>
                        </div>
                        <div className="flex justify-between pb-2 border-b">
                          <span className="text-gray-600">المستوى:</span>
                          <span className="font-semibold">{levelAr[form.getValues('level')]}</span>
                        </div>
                        <div className="flex justify-between pb-2 border-b">
                          <span className="text-gray-600">التصنيف:</span>
                          <span className="font-semibold">{categoryAr[form.getValues('category')]}</span>
                        </div>
                        <div className="flex justify-between pb-2 border-b">
                          <span className="text-gray-600">عدد الملفات:</span>
                          <span className="font-semibold">{uploads.length}</span>
                        </div>
                        {form.getValues('isPaid') && (
                          <div className="flex justify-between pb-2 border-b">
                            <span className="text-gray-600">السعر:</span>
                            <span className="font-semibold">{form.getValues('price')} ريال</span>
                          </div>
                        )}
                        <div className="flex justify-between pb-2 border-b">
                          <span className="text-gray-600">اختبار:</span>
                          <span className="font-semibold">{addQuiz ? 'نعم' : 'لا'}</span>
                        </div>
                        <div className="flex justify-between pb-2 border-b">
                          <span className="text-gray-600">شهادة:</span>
                          <span className="font-semibold">{addCertificate ? 'نعم' : 'لا'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-3 mt-6">
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(currentStep - 1)}
                      className="flex-1"
                    >
                      السابق
                    </Button>
                  )}
                  {currentStep < 5 ? (
                    <Button
                      type="button"
                      onClick={() => setCurrentStep(currentStep + 1)}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                    >
                      التالي
                      <ChevronRight className="mr-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={createCourseMutation.isPending}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                      data-testid="button-create-course"
                      onClick={() => {
                        if (!form.formState.isValid) {
                          const errors = form.formState.errors;
                          const firstError = Object.values(errors)[0];
                          if (firstError && 'message' in firstError) {
                            toast({
                              title: 'خطأ في التحقق من البيانات',
                              description: firstError.message as string,
                              variant: 'destructive',
                            });
                          }
                        }
                      }}
                    >
                      {createCourseMutation.isPending ? 'جاري الإنشاء...' : 'إنشاء الدورة'}
                    </Button>
                  )}
                </div>
              </div>

              {/* Right Side - Preview */}
              <div>
                <Card className="sticky top-6 border-emerald-200 bg-white">
                  <CardHeader>
                    <CardTitle className="text-emerald-700 text-lg">معاينة الدورة</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-gradient-to-br from-emerald-100 to-green-100 rounded-lg">
                      <h3 className="font-bold text-emerald-900 text-lg">{form.getValues('titleAr') || 'اسم الدورة'}</h3>
                      <p className="text-xs text-emerald-700 mt-1">{categoryAr[form.getValues('category')]}</p>
                      <div className="flex gap-2 mt-3 flex-wrap">
                        <span className="text-xs bg-emerald-500 text-white px-2 py-1 rounded">
                          {levelAr[form.getValues('level')]}
                        </span>
                        {form.getValues('isPaid') && (
                          <span className="text-xs bg-amber-500 text-white px-2 py-1 rounded">
                            {form.getValues('price')} ريال
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        <strong>الوصف:</strong> {form.getValues('descriptionAr') || 'سيظهر الوصف هنا'}
                      </p>
                    </div>

                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">الطلاب المقبولين:</span>
                        <span className="font-semibold">{form.getValues('maxStudents')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">الملفات:</span>
                        <span className="font-semibold text-emerald-600">{uploads.length}</span>
                      </div>
                      {addQuiz && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">أسئلة الاختبار:</span>
                          <span className="font-semibold text-emerald-600">{quizQuestions.length}</span>
                        </div>
                      )}
                      {addCertificate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">الشهادة:</span>
                          <span className="font-semibold text-emerald-600">✓</span>
                        </div>
                      )}
                    </div>

                    <div className="text-center text-xs text-gray-500 mt-4">
                      الخطوة {currentStep} من 5
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
