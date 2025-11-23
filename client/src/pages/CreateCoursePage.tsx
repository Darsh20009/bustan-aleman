import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';
import { useToast } from '../hooks/use-toast';
import { 
  ArrowRight, 
  Plus, 
  Trash2, 
  Upload, 
  Video, 
  Image, 
  FileText, 
  HelpCircle,
  Link as LinkIcon,
  Check,
  X
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

interface Module {
  title: string;
  description: string;
}

interface QuizQuestion {
  questionAr: string;
  questionEn?: string;
  optionsAr: string[];
  optionsEn?: string[];
  correctAnswer: number;
  points: number;
}

interface Upload {
  fileType: 'video' | 'image' | 'pdf' | 'document';
  fileName: string;
  fileUrl: string;
  titleAr: string;
  titleEn?: string;
  descriptionAr?: string;
}

interface ZoomSession {
  titleAr: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  zoomLink: string;
  description?: string;
}

export function CreateCoursePage({ onBack }: CreateCoursePageProps) {
  const { toast } = useToast();
  const [modules, setModules] = useState<Module[]>([]);
  const [currentModule, setCurrentModule] = useState<Module>({ title: '', description: '' });
  
  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion>({
    questionAr: '',
    questionEn: '',
    optionsAr: ['', '', '', ''],
    optionsEn: ['', '', '', ''],
    correctAnswer: 0,
    points: 1,
  });

  // Upload state
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [currentUpload, setCurrentUpload] = useState<Upload>({
    fileType: 'video',
    fileName: '',
    fileUrl: '',
    titleAr: '',
    titleEn: '',
    descriptionAr: '',
  });

  // Zoom sessions state
  const [zoomSessions, setZoomSessions] = useState<ZoomSession[]>([]);
  const [currentZoomSession, setCurrentZoomSession] = useState<ZoomSession>({
    titleAr: '',
    sessionDate: '',
    startTime: '',
    endTime: '',
    zoomLink: '',
    description: '',
  });

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
      modules: Module[];
      quizQuestions: QuizQuestion[];
      uploads: Upload[];
      zoomSessions: ZoomSession[];
    }) => {
      const response = await apiRequest('/api/supervisor/courses', 'POST', data);
      return response;
    },
    onSuccess: () => {
      toast({
        title: 'تم إنشاء الدورة بنجاح',
        description: 'تم إضافة الدورة الجديدة مع جميع المحتويات',
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
    createCourseMutation.mutate({ 
      ...data, 
      modules, 
      quizQuestions,
      uploads,
      zoomSessions,
    });
  };

  // Module handlers
  const addModule = () => {
    if (currentModule.title && currentModule.description) {
      setModules([...modules, currentModule]);
      setCurrentModule({ title: '', description: '' });
      toast({
        title: 'تمت الإضافة',
        description: 'تم إضافة الوحدة بنجاح',
      });
    }
  };

  const removeModule = (index: number) => {
    setModules(modules.filter((_, i) => i !== index));
  };

  // Quiz handlers
  const addQuizQuestion = () => {
    if (currentQuestion.questionAr && currentQuestion.optionsAr.every(opt => opt.trim())) {
      setQuizQuestions([...quizQuestions, currentQuestion]);
      setCurrentQuestion({
        questionAr: '',
        questionEn: '',
        optionsAr: ['', '', '', ''],
        optionsEn: ['', '', '', ''],
        correctAnswer: 0,
        points: 1,
      });
      toast({
        title: 'تمت الإضافة',
        description: 'تم إضافة السؤال بنجاح',
      });
    } else {
      toast({
        title: 'خطأ',
        description: 'يرجى ملء جميع الحقول المطلوبة',
        variant: 'destructive',
      });
    }
  };

  const removeQuizQuestion = (index: number) => {
    setQuizQuestions(quizQuestions.filter((_, i) => i !== index));
  };

  // Upload handlers
  const addUpload = () => {
    if (currentUpload.fileName && currentUpload.fileUrl && currentUpload.titleAr) {
      setUploads([...uploads, currentUpload]);
      setCurrentUpload({
        fileType: 'video',
        fileName: '',
        fileUrl: '',
        titleAr: '',
        titleEn: '',
        descriptionAr: '',
      });
      toast({
        title: 'تمت الإضافة',
        description: 'تم إضافة الملف بنجاح',
      });
    } else {
      toast({
        title: 'خطأ',
        description: 'يرجى ملء جميع الحقول المطلوبة',
        variant: 'destructive',
      });
    }
  };

  const removeUpload = (index: number) => {
    setUploads(uploads.filter((_, i) => i !== index));
  };

  // Zoom session handlers
  const addZoomSession = () => {
    if (currentZoomSession.titleAr && currentZoomSession.sessionDate && 
        currentZoomSession.startTime && currentZoomSession.endTime && 
        currentZoomSession.zoomLink) {
      setZoomSessions([...zoomSessions, currentZoomSession]);
      setCurrentZoomSession({
        titleAr: '',
        sessionDate: '',
        startTime: '',
        endTime: '',
        zoomLink: '',
        description: '',
      });
      toast({
        title: 'تمت الإضافة',
        description: 'تم إضافة حصة Zoom بنجاح',
      });
    } else {
      toast({
        title: 'خطأ',
        description: 'يرجى ملء جميع الحقول المطلوبة',
        variant: 'destructive',
      });
    }
  };

  const removeZoomSession = (index: number) => {
    setZoomSessions(zoomSessions.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4">
      <div className="max-w-6xl mx-auto">
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
          <p className="text-gray-600">أضف دورة تعليمية جديدة مع جميع المحتويات والمرفقات</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="basic" data-testid="tab-basic">معلومات أساسية</TabsTrigger>
                <TabsTrigger value="modules" data-testid="tab-modules">الوحدات</TabsTrigger>
                <TabsTrigger value="content" data-testid="tab-content">المحتوى</TabsTrigger>
                <TabsTrigger value="quiz" data-testid="tab-quiz">الاختبارات</TabsTrigger>
                <TabsTrigger value="zoom" data-testid="tab-zoom">حصص Zoom</TabsTrigger>
              </TabsList>

              {/* Basic Info Tab */}
              <TabsContent value="basic">
                <Card>
                  <CardHeader>
                    <CardTitle>المعلومات الأساسية</CardTitle>
                    <CardDescription>أدخل معلومات الدورة الأساسية</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
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
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Modules Tab */}
              <TabsContent value="modules">
                <Card>
                  <CardHeader>
                    <CardTitle>الوحدات الدراسية</CardTitle>
                    <CardDescription>أضف وحدات الدورة التعليمية</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-3">
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
                        <div className="space-y-2 mt-6">
                          <h4 className="font-semibold text-sm text-gray-700">الوحدات المضافة ({modules.length})</h4>
                          {modules.map((module, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-white rounded-md border"
                              data-testid={`module-item-${index}`}
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
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Content Tab */}
              <TabsContent value="content">
                <Card>
                  <CardHeader>
                    <CardTitle>المحتوى التعليمي</CardTitle>
                    <CardDescription>أضف الفيديوهات، الصور، والملفات</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <FormLabel>نوع الملف</FormLabel>
                          <Select
                            value={currentUpload.fileType}
                            onValueChange={(value: 'video' | 'image' | 'pdf' | 'document') => 
                              setCurrentUpload({ ...currentUpload, fileType: value })
                            }
                          >
                            <SelectTrigger data-testid="select-file-type">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="video">
                                <div className="flex items-center gap-2">
                                  <Video className="h-4 w-4" />
                                  فيديو
                                </div>
                              </SelectItem>
                              <SelectItem value="image">
                                <div className="flex items-center gap-2">
                                  <Image className="h-4 w-4" />
                                  صورة
                                </div>
                              </SelectItem>
                              <SelectItem value="pdf">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4" />
                                  PDF
                                </div>
                              </SelectItem>
                              <SelectItem value="document">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4" />
                                  مستند
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <FormLabel>اسم الملف</FormLabel>
                          <Input
                            placeholder="مثال: lecture-01.mp4"
                            value={currentUpload.fileName}
                            onChange={(e) => setCurrentUpload({ ...currentUpload, fileName: e.target.value })}
                            data-testid="input-file-name"
                          />
                        </div>
                      </div>

                      <div>
                        <FormLabel>رابط الملف (URL)</FormLabel>
                        <Input
                          placeholder="https://example.com/file.mp4"
                          value={currentUpload.fileUrl}
                          onChange={(e) => setCurrentUpload({ ...currentUpload, fileUrl: e.target.value })}
                          data-testid="input-file-url"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          يمكنك رفع الملف على Google Drive أو YouTube ثم إضافة الرابط هنا
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <FormLabel>العنوان بالعربية *</FormLabel>
                          <Input
                            placeholder="عنوان المحتوى"
                            value={currentUpload.titleAr}
                            onChange={(e) => setCurrentUpload({ ...currentUpload, titleAr: e.target.value })}
                            data-testid="input-upload-title-ar"
                          />
                        </div>

                        <div>
                          <FormLabel>العنوان بالإنجليزية</FormLabel>
                          <Input
                            placeholder="Content Title"
                            value={currentUpload.titleEn}
                            onChange={(e) => setCurrentUpload({ ...currentUpload, titleEn: e.target.value })}
                            data-testid="input-upload-title-en"
                          />
                        </div>
                      </div>

                      <div>
                        <FormLabel>الوصف</FormLabel>
                        <Textarea
                          placeholder="وصف المحتوى..."
                          value={currentUpload.descriptionAr}
                          onChange={(e) => setCurrentUpload({ ...currentUpload, descriptionAr: e.target.value })}
                          data-testid="input-upload-description"
                        />
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={addUpload}
                        className="w-full"
                        data-testid="button-add-upload"
                      >
                        <Upload className="ml-2 h-4 w-4" />
                        إضافة ملف
                      </Button>

                      {uploads.length > 0 && (
                        <div className="space-y-2 mt-6">
                          <h4 className="font-semibold text-sm text-gray-700">الملفات المضافة ({uploads.length})</h4>
                          {uploads.map((upload, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-white rounded-md border"
                              data-testid={`upload-item-${index}`}
                            >
                              <div className="flex items-center gap-3">
                                {upload.fileType === 'video' && <Video className="h-5 w-5 text-blue-500" />}
                                {upload.fileType === 'image' && <Image className="h-5 w-5 text-green-500" />}
                                {(upload.fileType === 'pdf' || upload.fileType === 'document') && (
                                  <FileText className="h-5 w-5 text-red-500" />
                                )}
                                <div>
                                  <h4 className="font-medium">{upload.titleAr}</h4>
                                  <p className="text-xs text-gray-500">{upload.fileName}</p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeUpload(index)}
                                data-testid={`button-remove-upload-${index}`}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Quiz Tab */}
              <TabsContent value="quiz">
                <Card>
                  <CardHeader>
                    <CardTitle>الاختبارات</CardTitle>
                    <CardDescription>أضف أسئلة الاختبار للدورة</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <FormLabel>السؤال بالعربية *</FormLabel>
                        <Textarea
                          placeholder="اكتب السؤال هنا..."
                          value={currentQuestion.questionAr}
                          onChange={(e) => setCurrentQuestion({ ...currentQuestion, questionAr: e.target.value })}
                          data-testid="input-question-ar"
                        />
                      </div>

                      <div>
                        <FormLabel>السؤال بالإنجليزية</FormLabel>
                        <Textarea
                          placeholder="Write question here..."
                          value={currentQuestion.questionEn}
                          onChange={(e) => setCurrentQuestion({ ...currentQuestion, questionEn: e.target.value })}
                          data-testid="input-question-en"
                        />
                      </div>

                      <div className="space-y-3">
                        <FormLabel>الخيارات (اختر الإجابة الصحيحة)</FormLabel>
                        {[0, 1, 2, 3].map((optIndex) => (
                          <div key={optIndex} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="correctAnswer"
                              checked={currentQuestion.correctAnswer === optIndex}
                              onChange={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: optIndex })}
                              className="w-4 h-4"
                              data-testid={`radio-correct-${optIndex}`}
                            />
                            <Input
                              placeholder={`الخيار ${optIndex + 1}`}
                              value={currentQuestion.optionsAr[optIndex]}
                              onChange={(e) => {
                                const newOptions = [...currentQuestion.optionsAr];
                                newOptions[optIndex] = e.target.value;
                                setCurrentQuestion({ ...currentQuestion, optionsAr: newOptions });
                              }}
                              data-testid={`input-option-${optIndex}`}
                            />
                            {currentQuestion.correctAnswer === optIndex && (
                              <Check className="h-5 w-5 text-green-500" />
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <FormLabel>النقاط</FormLabel>
                          <Input
                            type="number"
                            min="1"
                            value={currentQuestion.points}
                            onChange={(e) => setCurrentQuestion({ ...currentQuestion, points: parseInt(e.target.value) })}
                            data-testid="input-question-points"
                          />
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={addQuizQuestion}
                        className="w-full"
                        data-testid="button-add-question"
                      >
                        <HelpCircle className="ml-2 h-4 w-4" />
                        إضافة سؤال
                      </Button>

                      {quizQuestions.length > 0 && (
                        <div className="space-y-2 mt-6">
                          <h4 className="font-semibold text-sm text-gray-700">الأسئلة المضافة ({quizQuestions.length})</h4>
                          {quizQuestions.map((question, index) => (
                            <div
                              key={index}
                              className="p-3 bg-white rounded-md border"
                              data-testid={`question-item-${index}`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium mb-2">سؤال {index + 1}: {question.questionAr}</h4>
                                  <div className="text-sm space-y-1">
                                    {question.optionsAr.map((opt, optIdx) => (
                                      <div key={optIdx} className="flex items-center gap-2">
                                        {question.correctAnswer === optIdx ? (
                                          <Check className="h-4 w-4 text-green-500" />
                                        ) : (
                                          <X className="h-4 w-4 text-gray-300" />
                                        )}
                                        <span className={question.correctAnswer === optIdx ? 'text-green-700 font-medium' : 'text-gray-600'}>
                                          {opt}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                  <p className="text-xs text-gray-500 mt-2">النقاط: {question.points}</p>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeQuizQuestion(index)}
                                  data-testid={`button-remove-question-${index}`}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Zoom Sessions Tab */}
              <TabsContent value="zoom">
                <Card>
                  <CardHeader>
                    <CardTitle>حصص Zoom المباشرة</CardTitle>
                    <CardDescription>أضف الحصص المباشرة عبر Zoom</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <FormLabel>عنوان الحصة *</FormLabel>
                        <Input
                          placeholder="مثال: الحصة الأولى - مقدمة التجويد"
                          value={currentZoomSession.titleAr}
                          onChange={(e) => setCurrentZoomSession({ ...currentZoomSession, titleAr: e.target.value })}
                          data-testid="input-zoom-title"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <FormLabel>تاريخ الحصة *</FormLabel>
                          <Input
                            type="date"
                            value={currentZoomSession.sessionDate}
                            onChange={(e) => setCurrentZoomSession({ ...currentZoomSession, sessionDate: e.target.value })}
                            data-testid="input-zoom-date"
                          />
                        </div>

                        <div>
                          <FormLabel>وقت البداية *</FormLabel>
                          <Input
                            type="time"
                            value={currentZoomSession.startTime}
                            onChange={(e) => setCurrentZoomSession({ ...currentZoomSession, startTime: e.target.value })}
                            data-testid="input-zoom-start"
                          />
                        </div>

                        <div>
                          <FormLabel>وقت النهاية *</FormLabel>
                          <Input
                            type="time"
                            value={currentZoomSession.endTime}
                            onChange={(e) => setCurrentZoomSession({ ...currentZoomSession, endTime: e.target.value })}
                            data-testid="input-zoom-end"
                          />
                        </div>
                      </div>

                      <div>
                        <FormLabel>رابط Zoom *</FormLabel>
                        <Input
                          placeholder="https://zoom.us/j/123456789"
                          value={currentZoomSession.zoomLink}
                          onChange={(e) => setCurrentZoomSession({ ...currentZoomSession, zoomLink: e.target.value })}
                          data-testid="input-zoom-link"
                        />
                      </div>

                      <div>
                        <FormLabel>وصف الحصة</FormLabel>
                        <Textarea
                          placeholder="وصف محتوى الحصة..."
                          value={currentZoomSession.description}
                          onChange={(e) => setCurrentZoomSession({ ...currentZoomSession, description: e.target.value })}
                          data-testid="input-zoom-description"
                        />
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={addZoomSession}
                        className="w-full"
                        data-testid="button-add-zoom"
                      >
                        <LinkIcon className="ml-2 h-4 w-4" />
                        إضافة حصة Zoom
                      </Button>

                      {zoomSessions.length > 0 && (
                        <div className="space-y-2 mt-6">
                          <h4 className="font-semibold text-sm text-gray-700">حصص Zoom المضافة ({zoomSessions.length})</h4>
                          {zoomSessions.map((session, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-white rounded-md border"
                              data-testid={`zoom-item-${index}`}
                            >
                              <div>
                                <h4 className="font-medium">{session.titleAr}</h4>
                                <p className="text-sm text-gray-600">
                                  {session.sessionDate} | {session.startTime} - {session.endTime}
                                </p>
                                <a 
                                  href={session.zoomLink} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-500 hover:underline"
                                >
                                  {session.zoomLink}
                                </a>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeZoomSession(index)}
                                data-testid={`button-remove-zoom-${index}`}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Submit Buttons */}
            <Card>
              <CardContent className="pt-6">
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

                {/* Summary */}
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <h4 className="font-semibold text-sm mb-2">ملخص الدورة:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span>{modules.length} وحدة</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Upload className="h-4 w-4 text-gray-500" />
                      <span>{uploads.length} ملف</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-gray-500" />
                      <span>{quizQuestions.length} سؤال</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <LinkIcon className="h-4 w-4 text-gray-500" />
                      <span>{zoomSessions.length} حصة Zoom</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>
      </div>
    </div>
  );
}
