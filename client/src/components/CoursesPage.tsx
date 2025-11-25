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

  const getCategoryColors = (category: string) => {
    switch (category) {
      case 'quran': return {
        border: 'border-islamic-emerald/30 hover:border-islamic-emerald',
        bg: 'bg-islamic-emerald/10',
        icon: 'text-islamic-emerald',
        title: 'text-islamic-emerald',
        text: 'text-copper-bronze',
        badge: 'bg-desert-sand text-islamic-emerald',
        button: 'btn-islamic-gradient'
      };
      case 'ramadan': return {
        border: 'border-islamic-teal/30 hover:border-islamic-teal',
        bg: 'bg-islamic-teal/10',
        icon: 'text-islamic-teal',
        title: 'text-islamic-teal',
        text: 'text-copper-bronze',
        badge: 'bg-pearl-cream text-islamic-teal',
        button: 'bg-gradient-to-r from-islamic-teal to-persian-blue hover:from-islamic-teal/90 hover:to-persian-blue/90 text-white'
      };
      case 'fiqh': return {
        border: 'border-persian-blue/30 hover:border-persian-blue',
        bg: 'bg-persian-blue/10',
        icon: 'text-persian-blue',
        title: 'text-persian-blue',
        text: 'text-copper-bronze',
        badge: 'bg-warm-white text-persian-blue',
        button: 'bg-gradient-to-r from-persian-blue to-royal-gold hover:from-persian-blue/90 hover:to-royal-gold/90 text-white'
      };
      default: return {
        border: 'border-gray-300 hover:border-gray-400',
        bg: 'bg-gray-100',
        icon: 'text-gray-600',
        title: 'text-gray-800',
        text: 'text-gray-700',
        badge: 'bg-gray-200 text-gray-800',
        button: 'bg-gray-600 hover:bg-gray-700 text-white'
      };
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
      <div className="min-h-screen bg-gradient-to-br from-pearl-cream via-desert-sand to-warm-white" dir="rtl">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="islamic-spinner w-16 h-16 mx-auto mb-4"></div>
            <p className="text-islamic-emerald font-arabic-sans text-lg">جاري تحميل الدورات...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pearl-cream via-desert-sand to-warm-white" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-islamic-emerald via-islamic-teal to-persian-blue text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-2 md:px-4 py-6 bg-[#6d8f51] text-[#ffffff]">
          <div className="flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2 md:space-x-4 space-x-reverse"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-royal-gold to-copper-bronze rounded-full flex items-center justify-center ml-2 md:ml-4 shadow-xl">
                <BookOpen className="w-6 h-6 md:w-10 md:h-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-4xl font-bold font-arabic-serif bg-gradient-to-r from-white to-pearl-cream bg-clip-text text-transparent">
                  رحلاتنا التعليمية
                </h1>
                <p className="text-emerald-100 text-sm md:text-lg font-arabic-sans">
                  انضم إلى رحلة تعليمية مباركة في بستان الإيمان
                </p>
              </div>
            </motion.div>

            <Button
              onClick={onBack}
              className="btn-islamic-secondary border-0 px-4 py-2 text-sm md:px-6 md:text-base font-arabic-sans backdrop-blur-sm text-[#062909] bg-[#d4191900]"
              data-testid="button-back-to-home"
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
            <h2 className="text-3xl md:text-4xl font-bold text-islamic-emerald mb-4 font-arabic-serif">
              الرحلات التعليمية المتاحة
            </h2>
            <p className="text-xl text-copper-bronze text-center mb-12 font-arabic-sans">
              اختر رحلتك التعليمية وابدأ معنا في بستان الإيمان 🌿
            </p>

            {courses.length === 0 ? (
              <div className="text-center py-20">
                <BookOpen className="w-24 h-24 text-islamic-emerald/40 mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-islamic-emerald mb-4 font-arabic-serif">
                  لا توجد رحلات متاحة حالياً
                </h2>
                <p className="text-xl text-copper-bronze mb-8 font-arabic-sans">
                  🌱 نعمل على إضافة رحلات جديدة قريباً
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course, index) => {
                  const colors = getCategoryColors(course.category);
                  const availableSpots = course.maxStudents - course.currentStudents;
                  
                  return (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className={`border-2 ${colors.border} transition-all duration-300 h-full hover:shadow-xl bg-white/90 backdrop-blur-sm`}>
                        <CardHeader>
                          <div className={`w-16 h-16 mx-auto ${colors.bg} rounded-full flex items-center justify-center mb-4 shadow-lg`}>
                            <BookOpen className={`w-8 h-8 ${colors.icon}`} />
                          </div>
                          <CardTitle className={`${colors.title} text-right text-lg font-arabic-serif font-bold`}>
                            {course.title}
                          </CardTitle>
                          <CardDescription className="text-right flex items-center justify-end gap-2 font-arabic-sans">
                            <Calendar className="w-4 h-4" />
                            {new Date(course.startDate).toLocaleDateString('ar-SA')}
                          </CardDescription>
                          <div className="flex items-center justify-between text-xs">
                            <span className={`${colors.badge} px-3 py-1 rounded-full font-arabic-sans font-medium`}>
                              {getLevelText(course.level)}
                            </span>
                            <span className="text-copper-bronze font-arabic-sans">
                              {course.instructor}
                            </span>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className={`text-sm ${colors.text} text-right mb-4 line-clamp-3 font-arabic-sans leading-relaxed`}>
                            {course.description}
                          </p>
                          
                          {course.schedule && (
                            <div className="space-y-2 mb-4 text-xs text-copper-bronze font-arabic-sans">
                              {course.schedule.time && (
                                <div className="flex items-center justify-end gap-2">
                                  <span>{course.schedule.time} - {course.schedule.duration}</span>
                                  <Clock className="w-3 h-3" />
                                </div>
                              )}
                              {course.schedule.days && (
                                <div className="flex items-center justify-end gap-2">
                                  <span>{course.schedule.days.join('، ')}</span>
                                  <Calendar className="w-3 h-3" />
                                </div>
                              )}
                            </div>
                          )}

                          <div className="flex items-center justify-between mb-4">
                            <span className="text-xs text-copper-bronze flex items-center font-arabic-sans">
                              <span className="mr-1">{availableSpots > 0 ? `${availableSpots} مقعد متاح` : 'الرحلة مكتملة'}</span>
                              <Users className="w-3 h-3" />
                            </span>
                            <span className="text-xs text-islamic-emerald font-semibold font-arabic-sans">
                              {course.price > 0 ? `${course.price} ريال` : '🎁 مجاني'}
                            </span>
                          </div>

                          <Button 
                            onClick={() => handleEnroll(course.id)}
                            disabled={availableSpots <= 0 || enrolling === course.id}
                            className={`w-full ${colors.button} font-arabic-sans font-bold py-3 text-sm disabled:opacity-50 shadow-lg hover:shadow-xl transition-all duration-300`}
                            data-testid={`button-enroll-${course.id}`}
                          >
                            {enrolling === course.id ? (
                              <div className="flex items-center gap-2">
                                <div className="islamic-spinner w-4 h-4"></div>
                                جاري التسجيل...
                              </div>
                            ) : availableSpots <= 0 ? (
                              '🎓 الرحلة مكتملة'
                            ) : (
                              <span className="flex items-center gap-2">
                                <span>✨</span>
                                <span>انضم للرحلة</span>
                              </span>
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
            className="text-center bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-royal-gold/20"
          >
            <div className="islamic-divider mb-6">
              <span className="text-royal-gold text-2xl">❋</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-islamic-emerald mb-4 font-arabic-serif">
              🌿 ابدأ رحلتك التعليمية في بستان الإيمان
            </h2>
            <p className="text-lg text-copper-bronze mb-8 max-w-2xl mx-auto font-arabic-sans leading-relaxed">
              انضم إلى آلاف الطلاب الذين يتعلمون القرآن والعلوم الشرعية معنا. رحلة مليئة بالعلم والإيمان والبركة تنتظرك.
            </p>
            <Button
              onClick={onRegisterClick}
              size="lg"
              className="btn-islamic-gradient text-white px-12 py-4 text-xl font-arabic-sans font-bold shadow-xl hover:shadow-2xl transition-all duration-300"
              data-testid="button-register-from-courses"
            >
              <span className="flex items-center gap-3">
                <span>🎓</span>
                <span>سجل في رحلة الآن</span>
                <span>✨</span>
              </span>
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}