import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { BookOpen, ArrowRight, Calendar, Users, Clock, Award, Zap, Target, Star, CheckCircle2, Lock, Globe } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface Course {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr?: string;
  instructor: string;
  startDate: string;
  endDate: string;
  level: string;
  category: string;
  maxStudents: number;
  currentStudents: number;
  price: number;
  isPaid?: boolean;
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
        border: 'border-emerald-300 hover:border-emerald-500',
        bg: 'bg-emerald-100',
        icon: 'text-emerald-600',
        title: 'text-emerald-700',
        text: 'text-gray-700',
        badge: 'bg-emerald-200 text-emerald-800',
        button: 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white',
        emoji: '📖',
        benefits: ['حفظ القرآن', 'تلاوة صحيحة', 'فهم معاني الآيات'],
        hours: '120'
      };
      case 'fiqh': return {
        border: 'border-blue-300 hover:border-blue-500',
        bg: 'bg-blue-100',
        icon: 'text-blue-600',
        title: 'text-blue-700',
        text: 'text-gray-700',
        badge: 'bg-blue-200 text-blue-800',
        button: 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white',
        emoji: '⚖️',
        benefits: ['أحكام شرعية', 'حل المشاكل الفقهية', 'معرفة الحلال والحرام'],
        hours: '80'
      };
      case 'hadith': return {
        border: 'border-amber-300 hover:border-amber-500',
        bg: 'bg-amber-100',
        icon: 'text-amber-600',
        title: 'text-amber-700',
        text: 'text-gray-700',
        badge: 'bg-amber-200 text-amber-800',
        button: 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white',
        emoji: '📜',
        benefits: ['دراسة الحديث', 'تقييم الأحاديث', 'الراوي والمتن'],
        hours: '100'
      };
      case 'seerah': return {
        border: 'border-purple-300 hover:border-purple-500',
        bg: 'bg-purple-100',
        icon: 'text-purple-600',
        title: 'text-purple-700',
        text: 'text-gray-700',
        badge: 'bg-purple-200 text-purple-800',
        button: 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white',
        emoji: '🌙',
        benefits: ['سيرة النبي', 'صحابة الرسول', 'دروس من السيرة'],
        hours: '90'
      };
      default: return {
        border: 'border-gray-300 hover:border-gray-500',
        bg: 'bg-gray-100',
        icon: 'text-gray-600',
        title: 'text-gray-800',
        text: 'text-gray-700',
        badge: 'bg-gray-300 text-gray-900',
        button: 'bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 text-white',
        emoji: '📚',
        benefits: ['محتوى متنوع', 'شامل ومتدرج', 'تطبيقات عملية'],
        hours: '60'
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
                  const progressPercent = Math.round((course.currentStudents / course.maxStudents) * 100);
                  
                  return (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -8 }}
                    >
                      <Card className={`border-2 ${colors.border} transition-all duration-300 h-full hover:shadow-2xl bg-gradient-to-br from-white to-gray-50 backdrop-blur-sm overflow-hidden`}>
                        {/* Top Banner with Category */}
                        <div className={`${colors.bg} h-24 flex items-center justify-center relative overflow-hidden`}>
                          <div className="absolute inset-0 opacity-10" style={{
                            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23000000" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
                          }}></div>
                          <div className="text-5xl">{colors.emoji}</div>
                        </div>

                        <CardHeader className="pb-3">
                          <CardTitle className={`${colors.title} text-right text-xl font-arabic-serif font-bold mb-2 line-clamp-2`}>
                            {course.titleAr || course.title}
                          </CardTitle>
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <span className={`${colors.badge} px-3 py-1 rounded-full text-xs font-arabic-sans font-semibold flex items-center gap-1`}>
                              <Star className="w-3 h-3" />
                              {getLevelText(course.level)}
                            </span>
                            <span className="text-xs text-gray-600 font-arabic-sans bg-gray-100 px-2 py-1 rounded-lg flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {colors.hours} ساعة
                            </span>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          {/* Description */}
                          <p className={`text-sm ${colors.text} text-right line-clamp-2 font-arabic-sans leading-relaxed`}>
                            {course.descriptionAr || course.description}
                          </p>

                          {/* Benefits */}
                          <div className="space-y-1">
                            <p className="text-xs font-semibold text-gray-700 text-right font-arabic-sans">ستتعلم:</p>
                            <div className="space-y-1">
                              {colors.benefits.map((benefit, i) => (
                                <div key={i} className="flex items-center justify-end gap-2 text-xs text-gray-700 font-arabic-sans">
                                  <span>{benefit}</span>
                                  <CheckCircle2 className={`w-3 h-3 ${colors.icon}`} />
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Schedule */}
                          {course.schedule && (
                            <div className="bg-gray-50 p-3 rounded-lg space-y-1.5">
                              {course.schedule.time && (
                                <div className="flex items-center justify-end gap-2 text-xs text-gray-700 font-arabic-sans">
                                  <span className="font-semibold">{course.schedule.time}</span>
                                  <Clock className={`w-3 h-3 ${colors.icon}`} />
                                </div>
                              )}
                              {course.schedule.days && (
                                <div className="flex items-center justify-end gap-2 text-xs text-gray-700 font-arabic-sans">
                                  <span className="font-semibold">{course.schedule.days.join('، ')}</span>
                                  <Calendar className={`w-3 h-3 ${colors.icon}`} />
                                </div>
                              )}
                            </div>
                          )}

                          {/* Enrollment Progress */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-600 font-arabic-sans">
                                {course.currentStudents}/{course.maxStudents} طالب
                              </span>
                              <span className={`font-semibold ${colors.title}`}>
                                {progressPercent}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <motion.div 
                                className={`h-2 rounded-full bg-gradient-to-r ${colors.button.split('from-')[1].split(' ')[0]} to-${colors.button.split('to-')[1].split(' ')[0]}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercent}%` }}
                                transition={{ delay: 0.3 }}
                              />
                            </div>
                          </div>

                          {/* Info Row */}
                          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                            <span className="text-xs text-gray-700 font-arabic-sans flex items-center gap-1">
                              {availableSpots > 0 ? (
                                <>
                                  <span>{availableSpots} مقاعد متاحة</span>
                                  <Zap className="w-3 h-3 text-green-600" />
                                </>
                              ) : (
                                <>
                                  <span>مكتملة</span>
                                  <Lock className="w-3 h-3 text-red-600" />
                                </>
                              )}
                            </span>
                            <span className={`text-sm font-bold ${colors.title} font-arabic-sans`}>
                              {course.price > 0 ? `${course.price} ريال` : '🎁 مجاني'}
                            </span>
                          </div>

                          {/* Enroll Button */}
                          <Button 
                            onClick={() => handleEnroll(course.id)}
                            disabled={availableSpots <= 0 || enrolling === course.id}
                            className={`w-full ${colors.button} font-arabic-sans font-bold py-3 text-base disabled:opacity-50 shadow-lg hover:shadow-xl transition-all duration-300 disabled:cursor-not-allowed`}
                            data-testid={`button-enroll-${course.id}`}
                          >
                            {enrolling === course.id ? (
                              <div className="flex items-center justify-center gap-2">
                                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                                جاري التسجيل...
                              </div>
                            ) : availableSpots <= 0 ? (
                              <span className="flex items-center justify-center gap-2">
                                <Lock className="w-4 h-4" />
                                الرحلة مكتملة
                              </span>
                            ) : (
                              <span className="flex items-center justify-center gap-2">
                                <Zap className="w-4 h-4" />
                                <span>ابدأ الآن</span>
                                <Target className="w-4 h-4" />
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

          {/* CTA Section - Only show for non-logged-in users */}
          {!isLoggedIn && (
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
          )}
        </div>
      </div>
    </div>
  );
}