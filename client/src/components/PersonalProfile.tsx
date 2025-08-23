import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { BookOpen, User, Calendar, CheckCircle, XCircle, Award, Clock, ArrowRight } from 'lucide-react';

interface Student {
  id: string;
  studentName: string;
  email: string;
  memorizedSurahs: string[];
  currentLevel: string;
  schedules: any[];
  errors: any[];
  sessions: any[];
  payments: any[];
}

interface PersonalProfileProps {
  student: Student;
  onBack: () => void;
  onQuranReader: () => void;
}

export function PersonalProfile({ student, onBack, onQuranReader }: PersonalProfileProps) {
  // Sample data for demonstration - in real app this would come from the student object
  const todaysClasses = [
    {
      id: 1,
      title: "حفظ سورة البقرة - الآيات 1-20",
      time: "09:00 ص",
      status: "مجدولة",
      type: "memorization"
    },
    {
      id: 2,
      title: "مراجعة سورة الفاتحة",
      time: "11:00 ص",
      status: "مكتملة",
      type: "review"
    },
    {
      id: 3,
      title: "تجويد وتلاوة",
      time: "02:00 م",
      status: "مجدولة",
      type: "tajweed"
    }
  ];

  const registeredCourses = [
    {
      id: 1,
      name: "دورة تحفيظ القرآن الكريم",
      progress: 65,
      nextClass: "غداً 09:00 ص"
    },
    {
      id: 2,
      name: "دورة التجويد والقراءات",
      progress: 30,
      nextClass: "الأحد 10:00 ص"
    }
  ];

  const recentErrors = [
    { surah: "البقرة", ayah: 15, error: "خطأ في التشكيل", date: "2025-01-15" },
    { surah: "الفاتحة", ayah: 7, error: "خطأ في النطق", date: "2025-01-14" },
    { surah: "البقرة", ayah: 8, error: "خطأ في الوقف", date: "2025-01-13" }
  ];

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
                <User className="w-6 h-6 md:w-10 md:h-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-4xl font-bold font-amiri">
                  الملف الشخصي
                </h1>
                <p className="text-amber-200 text-sm md:text-lg">
                  مرحباً {student.studentName}
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
          {/* Student Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 mb-8">
            <Card className="border-amber-200">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-2">
                  <BookOpen className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-bold text-amber-900">السور المحفوظة</h3>
                <p className="text-2xl font-bold text-amber-700">{student.memorizedSurahs.length}</p>
              </CardContent>
            </Card>

            <Card className="border-green-200">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-2">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-bold text-green-900">المستوى</h3>
                <p className="text-lg font-bold text-green-700">{student.currentLevel}</p>
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-2">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-bold text-blue-900">الجلسات</h3>
                <p className="text-2xl font-bold text-blue-700">{student.sessions.length}</p>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-2">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="font-bold text-red-900">الأخطاء</h3>
                <p className="text-2xl font-bold text-red-700">{student.errors.length}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Today's Classes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-amber-900 text-right flex items-center">
                    <Calendar className="ml-2 h-5 w-5" />
                    حصص اليوم
                  </CardTitle>
                  <CardDescription className="text-right">
                    جدولك لهذا اليوم
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {todaysClasses.map((classItem) => (
                      <div key={classItem.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                        <div className="text-right flex-1">
                          <h4 className="font-semibold text-amber-900 text-sm">{classItem.title}</h4>
                          <p className="text-xs text-amber-700">{classItem.time}</p>
                        </div>
                        <div className="flex items-center">
                          {classItem.status === "مكتملة" ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <Clock className="w-5 h-5 text-amber-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button 
                    onClick={onQuranReader}
                    className="w-full mt-4 bg-amber-600 hover:bg-amber-700"
                  >
                    <BookOpen className="ml-2 h-4 w-4" />
                    افتح المصحف
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Registered Courses */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-900 text-right flex items-center">
                    <BookOpen className="ml-2 h-5 w-5" />
                    دوراتي
                  </CardTitle>
                  <CardDescription className="text-right">
                    الدورات المسجل فيها
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {registeredCourses.map((course) => (
                      <div key={course.id} className="p-4 border border-green-200 rounded-lg">
                        <h4 className="font-semibold text-green-900 mb-2 text-right">{course.name}</h4>
                        <div className="mb-2">
                          <div className="flex justify-between text-sm text-green-700 mb-1">
                            <span>التقدم</span>
                            <span>{course.progress}%</span>
                          </div>
                          <div className="w-full bg-green-100 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${course.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        <p className="text-xs text-green-600 text-right">الحصة القادمة: {course.nextClass}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Errors */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-900 text-right flex items-center">
                    <XCircle className="ml-2 h-5 w-5" />
                    الأخطاء الأخيرة
                  </CardTitle>
                  <CardDescription className="text-right">
                    تتبع أخطائك لتحسين الأداء
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentErrors.map((error, index) => (
                      <div key={index} className="p-3 bg-red-50 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="text-right">
                            <h4 className="font-semibold text-red-900 text-sm">سورة {error.surah}</h4>
                            <p className="text-xs text-red-700">الآية {error.ayah}</p>
                            <p className="text-xs text-red-600 mt-1">{error.error}</p>
                          </div>
                          <span className="text-xs text-gray-500">{error.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Memorized Surahs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-amber-900 text-right flex items-center">
                    <CheckCircle className="ml-2 h-5 w-5" />
                    السور المحفوظة
                  </CardTitle>
                  <CardDescription className="text-right">
                    السور التي أتممت حفظها
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {student.memorizedSurahs.length > 0 ? (
                      student.memorizedSurahs.map((surah, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm"
                        >
                          {surah}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">لم تحفظ أي سور بعد</p>
                    )}
                  </div>
                  {student.memorizedSurahs.length === 0 && (
                    <Button 
                      onClick={onQuranReader}
                      className="w-full mt-4 bg-amber-600 hover:bg-amber-700"
                    >
                      ابدأ الحفظ الآن
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}