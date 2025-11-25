import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { BookOpen, ArrowRight, Calendar, Users, Clock, Award, Zap, Target, Star, CheckCircle2, Lock, Globe, ShoppingCart } from 'lucide-react';
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
  progress?: number;
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
  onCartClick?: () => void;
}

export function CoursesPage({ onBack, onRegisterClick, isLoggedIn = false, currentStudent, onCartClick }: CoursesPageProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [activeTab, setActiveTab] = useState<'available' | 'enrolled'>('available');
  const { toast } = useToast();

  // Fetch cart when logged in
  useEffect(() => {
    if (isLoggedIn) {
      fetchCart();
    }
  }, [isLoggedIn]);

  const fetchCart = async () => {
    try {
      const response = await fetch('/api/cart');
      if (response.ok) {
        const cartItems = await response.json();
        setCartCount(cartItems.length);
        // Calculate total price
        const total = cartItems.reduce((sum: number, item: any) => {
          const course = courses.find(c => c.id === item.courseId);
          return sum + (course?.price || 0);
        }, 0);
        setCartTotal(total);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
        // Fetch cart after courses are loaded
        if (isLoggedIn) {
          fetchCart();
          fetchEnrolledCourses();
        }
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrolledCourses = async () => {
    try {
      const response = await fetch('/api/my-courses');
      if (response.ok) {
        const data = await response.json();
        setEnrolledCourses(data);
      }
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
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
      // Find the course to check if it's paid
      const course = courses.find(c => c.id === courseId);
      if (!course) {
        throw new Error("الدورة غير موجودة");
      }

      let endpoint = '';
      let method = 'POST';
      let body = { courseId };

      if (course.price > 0 || course.isPaid) {
        // For paid courses, add to cart
        endpoint = '/api/cart';
      } else {
        // For free courses, directly enroll
        endpoint = '/api/enrollments';
      }

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (response.ok) {
        if (course.price > 0 || course.isPaid) {
          toast({
            title: "تم إضافة الدورة للعربة! 🛒",
            description: "انتقل للعربة لإكمال الدفع",
          });
          // Update cart count and total
          fetchCart();
        } else {
          toast({
            title: "تم التسجيل بنجاح! 🎉",
            description: "تم إضافتك للدورة مباشرة",
          });
          fetchCourses(); // Refresh to update student count
          fetchEnrolledCourses(); // Refresh enrolled courses
        }
      } else {
        toast({
          title: "خطأ",
          description: result.message || "فشل في إضافة الدورة",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء العملية",
        variant: "destructive",
      });
    } finally {
      setEnrolling(null);
    }
  };

  const getLevelText = (level: string) => {
    const levels: { [key: string]: string } = {
      'beginner': 'مبتدئ',
      'intermediate': 'متوسط',
      'advanced': 'متقدم',
    };
    return levels[level] || level;
  };

  const getCategoryColors = (category: string) => {
    switch (category) {
      case 'quran': return {
        bg: 'bg-gradient-to-br from-emerald-100 to-green-200',
        border: 'border-emerald-300',
        title: 'text-emerald-700',
        text: 'text-emerald-600',
        badge: 'bg-emerald-100 text-emerald-700',
        icon: 'text-emerald-600',
        button: 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white',
        emoji: '📖',
        hours: 120,
        benefits: ['حفظ القرآن', 'تلاوة صحيحة', 'فهم معاني الآيات'],
      };
      case 'fiqh': return {
        bg: 'bg-gradient-to-br from-blue-100 to-cyan-200',
        border: 'border-blue-300',
        title: 'text-blue-700',
        text: 'text-blue-600',
        badge: 'bg-blue-100 text-blue-700',
        icon: 'text-blue-600',
        button: 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white',
        emoji: '⚖️',
        hours: 80,
        benefits: ['فهم الأحكام الشرعية', 'استنباط الفتاوى', 'تطبيق الفقه'],
      };
      case 'hadith': return {
        bg: 'bg-gradient-to-br from-amber-100 to-yellow-200',
        border: 'border-amber-300',
        title: 'text-amber-700',
        text: 'text-amber-600',
        badge: 'bg-amber-100 text-amber-700',
        icon: 'text-amber-600',
        button: 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white',
        emoji: '📜',
        hours: 100,
        benefits: ['دراسة الأحاديث', 'شرح المتون', 'تخريج الأحاديث'],
      };
      case 'seerah': return {
        bg: 'bg-gradient-to-br from-purple-100 to-pink-200',
        border: 'border-purple-300',
        title: 'text-purple-700',
        text: 'text-purple-600',
        badge: 'bg-purple-100 text-purple-700',
        icon: 'text-purple-600',
        button: 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white',
        emoji: '🌙',
        hours: 90,
        benefits: ['سيرة النبي', 'دروس من السيرة', 'شمائل الرسول'],
      };
      default: return {
        bg: 'bg-gradient-to-br from-gray-100 to-slate-200',
        border: 'border-gray-300',
        title: 'text-gray-700',
        text: 'text-gray-600',
        badge: 'bg-gray-100 text-gray-700',
        icon: 'text-gray-600',
        button: 'bg-gradient-to-r from-gray-500 to-slate-600 hover:from-gray-600 hover:to-slate-700 text-white',
        emoji: '📚',
        hours: 100,
        benefits: ['تعلم جديد', 'مهارات عملية', 'ثقافة إسلامية'],
      };
    }
  };

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

            <div className="flex items-center gap-2 md:gap-4">
              {isLoggedIn && cartCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-lg"
                >
                  <ShoppingCart className="w-5 h-5 text-white" />
                  <div className="text-right">
                    <div className="text-sm font-semibold text-white">{cartCount} دورة</div>
                    {cartTotal > 0 && (
                      <div className="text-xs text-emerald-100">{cartTotal} ريال</div>
                    )}
                  </div>
                </motion.div>
              )}
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
            <h2 className="text-3xl md:text-4xl font-bold text-islamic-emerald mb-6 font-arabic-serif">
              رحلاتك التعليمية
            </h2>

            {isLoggedIn ? (
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'available' | 'enrolled')} className="w-full">
                <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
                  <TabsTrigger value="available">الدورات المتاحة</TabsTrigger>
                  <TabsTrigger value="enrolled">دوراتي ({enrolledCourses.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="available" className="mt-8">
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
                                <p className={`text-sm ${colors.text} text-right line-clamp-2 font-arabic-sans leading-relaxed`}>
                                  {course.descriptionAr || course.description}
                                </p>

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
                                      className={`h-2 rounded-full ${colors.button.split(' ')[0]}`}
                                      initial={{ width: 0 }}
                                      animate={{ width: `${progressPercent}%` }}
                                      transition={{ delay: 0.3 }}
                                    />
                                  </div>
                                </div>

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
                                    {course.price > 0 ? `${course.price} ريال` : 'مجاني'}
                                  </span>
                                </div>

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
                </TabsContent>

                <TabsContent value="enrolled" className="mt-8">
                  {enrolledCourses.length === 0 ? (
                    <div className="text-center py-20">
                      <BookOpen className="w-24 h-24 text-islamic-emerald/40 mx-auto mb-6" />
                      <h2 className="text-3xl font-bold text-islamic-emerald mb-4 font-arabic-serif">
                        لم تسجل في أي دورات بعد
                      </h2>
                      <p className="text-xl text-copper-bronze mb-8 font-arabic-sans">
                        🌱 ابدأ رحلتك التعليمية الآن
                      </p>
                      <Button
                        onClick={() => setActiveTab('available')}
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-arabic-sans font-bold py-3 text-base"
                      >
                        استكشف الدورات المتاحة
                      </Button>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {enrolledCourses.map((course, index) => {
                        const colors = getCategoryColors(course.category);
                        return (
                          <motion.div
                            key={course.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -8 }}
                          >
                            <Card className={`border-2 ${colors.border} transition-all duration-300 h-full hover:shadow-2xl bg-gradient-to-br from-white to-gray-50 backdrop-blur-sm overflow-hidden relative`}>
                              <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                ✓ مسجل
                              </div>

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
                                <p className={`text-sm ${colors.text} text-right line-clamp-2 font-arabic-sans leading-relaxed`}>
                                  {course.descriptionAr || course.description}
                                </p>

                                <div className="bg-emerald-50 p-3 rounded-lg">
                                  <div className="text-sm font-semibold text-emerald-700 text-right mb-2 font-arabic-sans">مستوى التقدم</div>
                                  {course.progress !== undefined && (
                                    <div className="space-y-1">
                                      <div className="w-full bg-gray-200 rounded-full h-2">
                                        <motion.div 
                                          className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600"
                                          initial={{ width: 0 }}
                                          animate={{ width: `${course.progress || 0}%` }}
                                          transition={{ delay: 0.3 }}
                                        />
                                      </div>
                                      <div className="text-xs text-emerald-700 font-arabic-sans text-right">
                                        {course.progress || 0}% مكتملة
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <Button 
                                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-arabic-sans font-bold py-3 text-base"
                                >
                                  <span className="flex items-center justify-center gap-2">
                                    <BookOpen className="w-4 h-4" />
                                    <span>استمر في الدراسة</span>
                                  </span>
                                </Button>
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            ) : (
              <>
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
                              <p className={`text-sm ${colors.text} text-right line-clamp-2 font-arabic-sans leading-relaxed`}>
                                {course.descriptionAr || course.description}
                              </p>

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
                                    className={`h-2 rounded-full ${colors.button.split(' ')[0]}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progressPercent}%` }}
                                    transition={{ delay: 0.3 }}
                                  />
                                </div>
                              </div>

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
                                  {course.price > 0 ? `${course.price} ريال` : 'مجاني'}
                                </span>
                              </div>

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
              </>
            )}
          </motion.div>

          {/* CTA Section - Only show for non-logged-in users */}
          {!isLoggedIn && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-center bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-royal-gold/20 mt-16"
            >
              <div className="islamic-divider mb-6">
                <span className="text-royal-gold text-2xl">❋</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-islamic-emerald mb-4 font-arabic-serif">
                ابدأ رحلتك التعليمية في بستان الإيمان
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
                </span>
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
