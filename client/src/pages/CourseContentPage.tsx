import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ArrowRight, 
  BookOpen, 
  FileText, 
  Download, 
  CheckCircle, 
  Clock,
  Award,
  GraduationCap
} from 'lucide-react';

interface CourseModule {
  id: string;
  courseId: string;
  titleAr: string;
  titleEn?: string;
  descriptionAr?: string;
  contentAr?: string;
  orderIndex: number;
  videoUrl?: string;
  documentUrl?: string;
  duration?: number;
  isActive: boolean;
}

interface Course {
  id: string;
  titleAr: string;
  titleEn?: string;
  descriptionAr?: string;
  category: string;
  level: string;
  instructorId?: string;
  startDate: string;
  endDate?: string;
  primaryColor?: string;
  secondaryColor?: string;
  isActive?: boolean;
}

interface CourseContentPageProps {
  courseId?: string;
  onBack: () => void;
}

export default function CourseContentPage({ courseId: propCourseId, onBack }: CourseContentPageProps) {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(propCourseId || null);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());

  const { data: courses = [], isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ['/api/courses'],
    enabled: !selectedCourseId,
  });

  const { data: course, isLoading: courseLoading } = useQuery<Course>({
    queryKey: ['/api/courses', selectedCourseId],
    enabled: !!selectedCourseId,
  });

  const { data: modules = [], isLoading: modulesLoading } = useQuery<CourseModule[]>({
    queryKey: ['/api/courses', selectedCourseId, 'modules'],
    enabled: !!selectedCourseId,
  });

  useEffect(() => {
    if (modules.length > 0 && !selectedModule) {
      setSelectedModule(modules[0].id);
    }
  }, [modules, selectedModule]);

  const currentModule = modules.find(m => m.id === selectedModule);
  const progressPercent = modules.length > 0 
    ? Math.round((completedModules.size / modules.length) * 100) 
    : 0;

  const markAsCompleted = (moduleId: string) => {
    setCompletedModules(prev => new Set([...prev, moduleId]));
  };

  const handleBackFromCourse = () => {
    setSelectedCourseId(null);
    setSelectedModule(null);
    setCompletedModules(new Set());
  };

  if (!selectedCourseId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50" dir="rtl">
        <header className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onBack}
                className="text-white hover:bg-white/20"
                data-testid="button-back"
              >
                <ArrowRight className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                  <GraduationCap className="h-6 w-6" />
                  الدورات التعليمية
                </h1>
                <p className="text-emerald-100 text-sm">اختر الدورة للبدء في التعلم</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          {coursesLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-emerald-700">جاري تحميل الدورات...</p>
            </div>
          ) : courses.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h2 className="text-xl font-semibold text-gray-700 mb-2">لا توجد دورات متاحة</h2>
                <p className="text-gray-500">سيتم إضافة دورات جديدة قريباً</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.filter(c => c.isActive !== false).map((course) => (
                <Card 
                  key={course.id} 
                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedCourseId(course.id)}
                  data-testid={`card-course-${course.id}`}
                >
                  <div className="h-32 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{course.category}</Badge>
                      <Badge variant="secondary">{course.level}</Badge>
                    </div>
                    <CardTitle className="text-lg">{course.titleAr}</CardTitle>
                    {course.descriptionAr && (
                      <CardDescription className="line-clamp-2">
                        {course.descriptionAr}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                      <BookOpen className="h-4 w-4 ml-2" />
                      بدء الدورة
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

  if (courseLoading || modulesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-emerald-700 font-medium">جاري تحميل محتوى الدورة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50" dir="rtl">
      <header className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleBackFromCourse}
                className="text-white hover:bg-white/20"
                data-testid="button-back"
              >
                <ArrowRight className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">{course?.titleAr || 'الدورة'}</h1>
                <div className="flex items-center gap-2 text-emerald-100 text-sm">
                  <BookOpen className="h-4 w-4" />
                  <span>{modules.length} درس</span>
                  <span className="mx-2">|</span>
                  <Clock className="h-4 w-4" />
                  <span>{modules.reduce((acc, m) => acc + (m.duration || 0), 0)} دقيقة</span>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="text-left">
                <div className="text-sm text-emerald-100">التقدم في الدورة</div>
                <div className="text-xl font-bold">{progressPercent}%</div>
              </div>
              <div className="w-32">
                <Progress value={progressPercent} className="h-2 bg-white/20" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-emerald-600" />
                  محتوى الدورة
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-300px)]">
                  <div className="p-4 space-y-2">
                    {modules.map((module, index) => {
                      const isCompleted = completedModules.has(module.id);
                      const isActive = module.id === selectedModule;
                      
                      return (
                        <button
                          key={module.id}
                          onClick={() => setSelectedModule(module.id)}
                          className={`w-full text-right p-3 rounded-lg transition-all ${
                            isActive 
                              ? 'bg-emerald-100 border-2 border-emerald-500' 
                              : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                          }`}
                          data-testid={`button-module-${module.id}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                              isCompleted 
                                ? 'bg-emerald-500 text-white' 
                                : isActive 
                                  ? 'bg-emerald-200 text-emerald-700'
                                  : 'bg-gray-200 text-gray-600'
                            }`}>
                              {isCompleted ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <span className="text-sm font-medium">{index + 1}</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`font-medium text-sm truncate ${
                                isActive ? 'text-emerald-800' : 'text-gray-700'
                              }`}>
                                {module.titleAr}
                              </p>
                              {module.duration && (
                                <p className="text-xs text-gray-500 mt-1">
                                  <Clock className="h-3 w-3 inline ml-1" />
                                  {module.duration} دقيقة
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </aside>

          <main className="lg:col-span-3 space-y-6">
            {currentModule ? (
              <>
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <Badge variant="outline" className="mb-2">
                          الدرس {modules.findIndex(m => m.id === currentModule.id) + 1}
                        </Badge>
                        <CardTitle className="text-2xl">{currentModule.titleAr}</CardTitle>
                        {currentModule.descriptionAr && (
                          <p className="text-muted-foreground mt-2">{currentModule.descriptionAr}</p>
                        )}
                      </div>
                      {currentModule.duration && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {currentModule.duration} دقيقة
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {currentModule.videoUrl && (
                      <div className="mb-6">
                        <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                          <iframe
                            src={currentModule.videoUrl}
                            className="w-full h-full"
                            allowFullScreen
                            title={currentModule.titleAr}
                          />
                        </div>
                      </div>
                    )}

                    {currentModule.contentAr && (
                      <div className="prose prose-lg max-w-none text-right" dir="rtl">
                        <div dangerouslySetInnerHTML={{ __html: currentModule.contentAr }} />
                      </div>
                    )}

                    {!currentModule.videoUrl && !currentModule.contentAr && (
                      <div className="text-center py-12 text-muted-foreground">
                        <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>سيتم إضافة محتوى هذا الدرس قريباً</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {currentModule.documentUrl && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        ملفات الدرس
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start gap-2"
                        onClick={() => window.open(currentModule.documentUrl, '_blank')}
                        data-testid="button-download-document"
                      >
                        <Download className="h-4 w-4" />
                        تحميل ملف الدرس
                      </Button>
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    disabled={modules.findIndex(m => m.id === currentModule.id) === 0}
                    onClick={() => {
                      const currentIndex = modules.findIndex(m => m.id === currentModule.id);
                      if (currentIndex > 0) {
                        setSelectedModule(modules[currentIndex - 1].id);
                      }
                    }}
                    data-testid="button-previous-lesson"
                  >
                    <ArrowRight className="h-4 w-4 ml-2" />
                    الدرس السابق
                  </Button>
                  
                  <Button
                    onClick={() => {
                      markAsCompleted(currentModule.id);
                      const currentIndex = modules.findIndex(m => m.id === currentModule.id);
                      if (currentIndex < modules.length - 1) {
                        setSelectedModule(modules[currentIndex + 1].id);
                      }
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700"
                    data-testid="button-complete-lesson"
                  >
                    {modules.findIndex(m => m.id === currentModule.id) < modules.length - 1 ? (
                      <>
                        إكمال والانتقال للتالي
                        <CheckCircle className="h-4 w-4 mr-2" />
                      </>
                    ) : (
                      <>
                        إكمال الدورة
                        <Award className="h-4 w-4 mr-2" />
                      </>
                    )}
                  </Button>
                </div>
              </>
            ) : modules.length === 0 ? (
              <Card className="text-center py-16">
                <CardContent>
                  <BookOpen className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h2 className="text-xl font-semibold text-gray-700 mb-2">
                    لا يوجد محتوى متاح حالياً
                  </h2>
                  <p className="text-gray-500">
                    سيتم إضافة محتوى هذه الدورة قريباً
                  </p>
                </CardContent>
              </Card>
            ) : null}
          </main>
        </div>
      </div>
    </div>
  );
}
