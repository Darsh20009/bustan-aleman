import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { BookOpen, ArrowRight, Calendar, Users, Clock, Award } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface Course {
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
  price: number;
  isActive: boolean;
  requirements: string[];
  schedule: {
    days: string[];
    time: string;
    duration: string;
  };
}

interface CoursesPageProps {
  onBack: () => void;
  onRegisterClick: () => void;
  isLoggedIn?: boolean;
  currentStudent?: any;
}

export function CoursesPage({ onBack, onRegisterClick, isLoggedIn = false, currentStudent }: CoursesPageProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    if (!isLoggedIn) {
      toast({
        title: "يجب تسجيل الدخول أولاً",
        description: "قم بتسجيل الدخول أو إنشاء حساب جديد للتسجيل في الدورات",
        variant: "destructive",
      });
      onRegisterClick();
      return;
    }

    setEnrolling(courseId);
    try {
      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "تم التسجيل بنجاح! 🎉",
          description: result.message,
        });
        fetchCourses(); // Refresh to update student count
      } else {
        toast({
          title: "خطأ في التسجيل",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في التسجيل",
        description: "حدث خطأ أثناء التسجيل، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    } finally {
      setEnrolling(null);
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

  const getLevelText = (level: string) => {
    switch (level) {
      case 'beginner': return 'مبتدئ';
      case 'intermediate': return 'متوسط';
      case 'advanced': return 'متقدم';
      default: return level;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-amber-800 font-amiri text-xl">جاري تحميل الدورات...</p>
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
                  دوراتنا التعليمية
                </h1>
                <p className="text-amber-200 text-sm md:text-lg">
                  اختر الدورة المناسبة لك وابدأ رحلة التعلم
                </p>
              </div>
            </motion.div>

            <Button
              onClick={onBack}
              className="bg-white/20 hover:bg-white/30 text-white border-0 px-4 py-2 text-sm md:px-6 md:text-base"
            >
              <ArrowRight className="ml-2 h-4 w-4" />
              العودة للرئيسية
            </Button>
          </div>
        </div>
      </div>

      {/* Courses Section */}
      <div className="py-8 md:py-16">
        <div className="max-w-7xl mx-auto px-2 md:px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-amber-900 mb-4 font-amiri">
              الدورات المتاحة
            </h2>
            <p className="text-xl text-amber-700 text-center mb-12">
              رحلة تعليمية حول العالم
            </p>

            {courses.length === 0 ? (
              <div className="text-center py-20">
                <BookOpen className="w-24 h-24 text-amber-300 mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-amber-900 mb-4 font-amiri">
                  لا توجد دورات متاحة حالياً
                </h2>
                <p className="text-xl text-amber-700 mb-8">
                  نعمل على إضافة دورات جديدة قريباً
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course, index) => {
                  const colorClass = getCategoryColor(course.category);
                  const availableSpots = course.maxStudents - course.currentStudents;
                  
                  return (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className={`border-2 border-${colorClass}-200 hover:border-${colorClass}-400 transition-colors h-full`}>
                        <CardHeader>
                          <div className={`w-16 h-16 mx-auto bg-${colorClass}-100 rounded-full flex items-center justify-center mb-4`}>
                            <BookOpen className={`w-8 h-8 text-${colorClass}-600`} />
                          </div>
                          <CardTitle className={`text-${colorClass}-800 text-right text-lg`}>
                            {course.title}
                          </CardTitle>
                          <CardDescription className="text-right flex items-center justify-end gap-2">
                            <Calendar className="w-4 h-4" />
                            {new Date(course.startDate).toLocaleDateString('ar-SA')}
                          </CardDescription>
                          <div className="flex items-center justify-between text-xs">
                            <span className={`bg-${colorClass}-100 text-${colorClass}-800 px-2 py-1 rounded-full`}>
                              {getLevelText(course.level)}
                            </span>
                            <span className="text-gray-600">
                              {course.instructor}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className={`text-sm text-${colorClass}-700 text-right mb-4 line-clamp-3`}>
                            {course.description}
                          </p>
                          
                          <div className="space-y-2 mb-4 text-xs text-gray-600">
                            <div className="flex items-center justify-end gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{course.schedule.time} - {course.schedule.duration}</span>
                            </div>
                            <div className="flex items-center justify-end gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{course.schedule.days.join(', ')}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mb-4">
                            <span className="text-xs text-gray-500 flex items-center">
                              <Users className="w-3 h-3 mr-1" />
                              {availableSpots > 0 ? `${availableSpots} مقعد متاح` : 'الدورة ممتلئة'}
                            </span>
                            <span className="text-xs text-green-600 font-semibold">
                              {course.price > 0 ? `${course.price} ريال` : 'مجاني'}
                            </span>
                          </div>

                          <Button 
                            onClick={() => handleEnroll(course.id)}
                            disabled={availableSpots <= 0 || enrolling === course.id}
                            className={`w-full bg-${colorClass}-600 hover:bg-${colorClass}-700 disabled:opacity-50`}
                          >
                            {enrolling === course.id ? (
                              <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                جاري التسجيل...
                              </div>
                            ) : availableSpots <= 0 ? (
                              'الدورة ممتلئة'
                            ) : (
                              'سجل الآن'
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-center bg-white rounded-xl p-8 shadow-lg"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-amber-900 mb-4 font-amiri">
              ابدأ رحلتك التعليمية معنا
            </h2>
            <p className="text-lg text-amber-800 mb-8 max-w-2xl mx-auto">
              انضم إلى آلاف الطلاب الذين يتعلمون القرآن والعلوم الشرعية معنا. رحلة مليئة بالعلم والإيمان تنتظرك.
            </p>
            <Button
              onClick={onRegisterClick}
              size="lg"
              className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-12 py-4 text-xl hover:from-amber-700 hover:to-orange-700"
            >
              سجل في دورة الآن
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}