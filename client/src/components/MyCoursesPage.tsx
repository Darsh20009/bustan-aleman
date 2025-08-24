import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { BookOpen, ArrowRight, Calendar, Clock, Award, CheckCircle, PlayCircle, Users } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface CourseEnrollment {
  id: string;
  courseId: string;
  enrollmentDate: string;
  status: 'enrolled' | 'active' | 'completed' | 'dropped';
  progress: number;
  currentWeek: number;
  completedLessons: string[];
  attendance: {
    date: string;
    attended: boolean;
    notes?: string;
  }[];
  grades: {
    assessment: string;
    score: number;
    date: string;
  }[];
  course: {
    id: string;
    title: string;
    description: string;
    instructor: string;
    startDate: string;
    endDate: string;
    level: string;
    category: string;
    maxStudents: number;
    currentStudents: number;
    schedule: {
      days: string[];
      time: string;
      duration: string;
    };
    curriculum: {
      week: number;
      topic: string;
      objectives: string[];
      surahs?: string[];
    }[];
  };
}

interface MyCoursesPageProps {
  onBack: () => void;
  student: any;
}

export function MyCoursesPage({ onBack, student }: MyCoursesPageProps) {
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      const response = await fetch('/api/my-courses');
      if (response.ok) {
        const data = await response.json();
        setEnrollments(data);
      } else {
        toast({
          title: "خطأ",
          description: "فشل في جلب دوراتك",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching my courses:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء جلب دوراتك",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'enrolled': return 'مسجل';
      case 'active': return 'نشط';
      case 'completed': return 'مكتمل';
      case 'dropped': return 'منسحب';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'enrolled': return 'blue';
      case 'active': return 'green';
      case 'completed': return 'purple';
      case 'dropped': return 'red';
      default: return 'gray';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'quran': return 'amber';
      case 'ramadan': return 'green';
      case 'fiqh': return 'blue';
      default: return 'gray';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-amber-800 font-amiri text-xl">جاري تحميل دوراتك...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-800 to-orange-700 text-white">
        <div className="max-w-7xl mx-auto px-2 md:px-4 py-6">
          <div className="flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2 md:space-x-4 space-x-reverse"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-full flex items-center justify-center ml-2 md:ml-4">
                <BookOpen className="w-6 h-6 md:w-10 md:h-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-4xl font-bold font-amiri">
                  دوراتي
                </h1>
                <p className="text-amber-200 text-sm md:text-lg">
                  تابع تقدمك في الدورات المسجل بها
                </p>
              </div>
            </motion.div>

            <Button
              onClick={onBack}
              className="bg-white/20 hover:bg-white/30 text-white border-0 px-4 py-2 text-sm md:px-6 md:text-base"
            >
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-8 md:py-16">
        <div className="max-w-7xl mx-auto px-2 md:px-4">
          {enrollments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <BookOpen className="w-24 h-24 text-amber-300 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-amber-900 mb-4 font-amiri">
                لم تسجل في أي دورة بعد
              </h2>
              <p className="text-xl text-amber-700 mb-8">
                اكتشف دوراتنا الرائعة وابدأ رحلة التعلم
              </p>
              <Button
                onClick={onBack}
                size="lg"
                className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-8 py-3"
              >
                تصفح الدورات
              </Button>
            </motion.div>
          ) : (
            <Tabs defaultValue="active" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3 bg-white shadow-md">
                <TabsTrigger value="active">الدورات النشطة</TabsTrigger>
                <TabsTrigger value="completed">المكتملة</TabsTrigger>
                <TabsTrigger value="all">جميع الدورات</TabsTrigger>
              </TabsList>

              <TabsContent value="active" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {enrollments
                    .filter(e => e.status === 'active' || e.status === 'enrolled')
                    .map((enrollment, index) => (
                      <CourseCard key={enrollment.id} enrollment={enrollment} index={index} />
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="completed" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {enrollments
                    .filter(e => e.status === 'completed')
                    .map((enrollment, index) => (
                      <CourseCard key={enrollment.id} enrollment={enrollment} index={index} />
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="all" className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {enrollments.map((enrollment, index) => (
                    <CourseCard key={enrollment.id} enrollment={enrollment} index={index} />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}

function CourseCard({ enrollment, index }: { enrollment: CourseEnrollment; index: number }) {
  const colorClass = getCategoryColor(enrollment.course.category);
  const statusColor = getStatusColor(enrollment.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="h-full border-2 border-gray-200 hover:border-amber-300 transition-colors">
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className={`bg-${statusColor}-100 text-${statusColor}-800 border-${statusColor}-300`}>
              {getStatusText(enrollment.status)}
            </Badge>
            <div className={`w-12 h-12 bg-${colorClass}-100 rounded-full flex items-center justify-center`}>
              <BookOpen className={`w-6 h-6 text-${colorClass}-600`} />
            </div>
          </div>
          <CardTitle className="text-right text-lg text-gray-800">
            {enrollment.course.title}
          </CardTitle>
          <CardDescription className="text-right text-gray-600">
            الأستاذ: {enrollment.course.instructor}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">{enrollment.progress}%</span>
                <span className="text-gray-800">التقدم</span>
              </div>
              <Progress value={enrollment.progress} className="h-2" />
            </div>

            {/* Schedule */}
            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex items-center justify-end gap-1">
                <span>{enrollment.course.schedule.time} - {enrollment.course.schedule.duration}</span>
                <Clock className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-end gap-1">
                <span>{enrollment.course.schedule.days.join(', ')}</span>
                <Calendar className="w-4 h-4" />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 text-center text-xs">
              <div>
                <div className="font-semibold text-amber-600">{enrollment.completedLessons.length}</div>
                <div className="text-gray-500">دروس مكتملة</div>
              </div>
              <div>
                <div className="font-semibold text-green-600">{enrollment.attendance.filter(a => a.attended).length}</div>
                <div className="text-gray-500">أيام حضور</div>
              </div>
              <div>
                <div className="font-semibold text-blue-600">{enrollment.currentWeek}</div>
                <div className="text-gray-500">الأسبوع الحالي</div>
              </div>
            </div>

            {/* Action Button */}
            <Button 
              className={`w-full bg-${colorClass}-600 hover:bg-${colorClass}-700 text-white`}
              disabled={enrollment.status === 'completed' || enrollment.status === 'dropped'}
            >
              {enrollment.status === 'completed' ? (
                <>
                  <CheckCircle className="ml-2 h-4 w-4" />
                  مكتمل
                </>
              ) : enrollment.status === 'dropped' ? (
                'منسحب'
              ) : (
                <>
                  <PlayCircle className="ml-2 h-4 w-4" />
                  متابعة التعلم
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function getCategoryColor(category: string) {
  switch (category) {
    case 'quran': return 'amber';
    case 'ramadan': return 'green';
    case 'fiqh': return 'blue';
    default: return 'gray';
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'enrolled': return 'blue';
    case 'active': return 'green';
    case 'completed': return 'purple';
    case 'dropped': return 'red';
    default: return 'gray';
  }
}

function getStatusText(status: string) {
  switch (status) {
    case 'enrolled': return 'مسجل';
    case 'active': return 'نشط';
    case 'completed': return 'مكتمل';
    case 'dropped': return 'منسحب';
    default: return status;
  }
}