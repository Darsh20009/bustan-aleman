import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { BookOpen, ArrowRight, Calendar, Users } from 'lucide-react';

interface CoursesPageProps {
  onBack: () => void;
  onRegisterClick: () => void;
}

export function CoursesPage({ onBack, onRegisterClick }: CoursesPageProps) {
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
                  الدورات
                </h1>
                <p className="text-amber-200 text-sm md:text-lg">
                  دوراتنا التعليمية والتحفيظية
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

      {/* Content */}
      <div className="py-8 md:py-16">
        <div className="max-w-7xl mx-auto px-2 md:px-4">
          {/* الدورات الحالية */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-amber-900 text-center mb-4 font-amiri">
              الدورات القادمة
            </h2>
            <p className="text-xl text-amber-700 text-center mb-12">
              رحلة تعليمية حول العالم
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="border-2 border-amber-200 hover:border-amber-400 transition-colors h-full">
                  <CardHeader>
                    <div className="w-16 h-16 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-4">
                      <BookOpen className="w-8 h-8 text-amber-600" />
                    </div>
                    <CardTitle className="text-amber-800 text-right text-lg">
                      دورة تحفيظ القرآن الكريم
                    </CardTitle>
                    <CardDescription className="text-right flex items-center justify-end">
                      <Calendar className="w-4 h-4 ml-2" />
                      15.02.2025
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-amber-700 text-right mb-4">
                      دورة شاملة لحفظ القرآن الكريم مع أحدث الأساليب التعليمية والمتابعة الشخصية لكل طالب
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-gray-500 flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        20 مقعد متاح
                      </span>
                      <span className="text-xs text-green-600 font-semibold">
                        مجاني
                      </span>
                    </div>
                    <Button 
                      onClick={onRegisterClick}
                      className="w-full bg-amber-600 hover:bg-amber-700"
                    >
                      سجل الآن
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-2 border-green-200 hover:border-green-400 transition-colors h-full">
                  <CardHeader>
                    <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <BookOpen className="w-8 h-8 text-green-600" />
                    </div>
                    <CardTitle className="text-green-800 text-right text-lg">
                      دورة المسابقة الرمضانية - المستوى الأول
                    </CardTitle>
                    <CardDescription className="text-right flex items-center justify-end">
                      <Calendar className="w-4 h-4 ml-2" />
                      01.03.2025
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-green-700 text-right mb-4">
                      مسابقة رمضانية مخصصة للمبتدئين في حفظ القرآن مع جوائز قيمة ومتابعة يومية
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-gray-500 flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        15 مقعد متاح
                      </span>
                      <span className="text-xs text-green-600 font-semibold">
                        مجاني
                      </span>
                    </div>
                    <Button 
                      onClick={onRegisterClick}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      سجل الآن
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors h-full">
                  <CardHeader>
                    <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <BookOpen className="w-8 h-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-blue-800 text-right text-lg">
                      دورة المسابقة الرمضانية - المستوى الثاني
                    </CardTitle>
                    <CardDescription className="text-right flex items-center justify-end">
                      <Calendar className="w-4 h-4 ml-2" />
                      01.03.2025
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-blue-700 text-right mb-4">
                      مسابقة متقدمة للطلاب الذين أتموا المستوى الأول مع تحديات أكثر وجوائز أكبر
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-gray-500 flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        12 مقعد متاح
                      </span>
                      <span className="text-xs text-green-600 font-semibold">
                        مجاني
                      </span>
                    </div>
                    <Button 
                      onClick={onRegisterClick}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      سجل الآن
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="border-2 border-purple-200 hover:border-purple-400 transition-colors h-full">
                  <CardHeader>
                    <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-4">
                      <BookOpen className="w-8 h-8 text-purple-600" />
                    </div>
                    <CardTitle className="text-purple-800 text-right text-lg">
                      دورة المسابقة الرمضانية - المستوى الثالث
                    </CardTitle>
                    <CardDescription className="text-right flex items-center justify-end">
                      <Calendar className="w-4 h-4 ml-2" />
                      01.03.2025
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-purple-700 text-right mb-4">
                      المستوى المتقدم للحفظة المتميزين مع مراجعة شاملة وتطبيق الأحكام
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-gray-500 flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        8 مقاعد متاحة
                      </span>
                      <span className="text-xs text-green-600 font-semibold">
                        مجاني
                      </span>
                    </div>
                    <Button 
                      onClick={onRegisterClick}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      سجل الآن
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="border-2 border-orange-200 hover:border-orange-400 transition-colors h-full">
                  <CardHeader>
                    <div className="w-16 h-16 mx-auto bg-orange-100 rounded-full flex items-center justify-center mb-4">
                      <BookOpen className="w-8 h-8 text-orange-600" />
                    </div>
                    <CardTitle className="text-orange-800 text-right text-lg">
                      دورة التجويد والقراءات
                    </CardTitle>
                    <CardDescription className="text-right flex items-center justify-end">
                      <Calendar className="w-4 h-4 ml-2" />
                      15.03.2025
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-orange-700 text-right mb-4">
                      تعلم أحكام التجويد والقراءات الصحيحة للقرآن الكريم مع أساتذة متخصصين
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-gray-500 flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        25 مقعد متاح
                      </span>
                      <span className="text-xs text-green-600 font-semibold">
                        مجاني
                      </span>
                    </div>
                    <Button 
                      onClick={onRegisterClick}
                      className="w-full bg-orange-600 hover:bg-orange-700"
                    >
                      سجل الآن
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card className="border-2 border-teal-200 hover:border-teal-400 transition-colors h-full">
                  <CardHeader>
                    <div className="w-16 h-16 mx-auto bg-teal-100 rounded-full flex items-center justify-center mb-4">
                      <BookOpen className="w-8 h-8 text-teal-600" />
                    </div>
                    <CardTitle className="text-teal-800 text-right text-lg">
                      دورة الفقه للأطفال
                    </CardTitle>
                    <CardDescription className="text-right flex items-center justify-end">
                      <Calendar className="w-4 h-4 ml-2" />
                      20.03.2025
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-teal-700 text-right mb-4">
                      دورة تفاعلية لتعليم الأطفال أساسيات الفقه والعبادات بطريقة ممتعة ومبسطة
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-gray-500 flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        30 مقعد متاح
                      </span>
                      <span className="text-xs text-green-600 font-semibold">
                        مجاني
                      </span>
                    </div>
                    <Button 
                      onClick={onRegisterClick}
                      className="w-full bg-teal-600 hover:bg-teal-700"
                    >
                      سجل الآن
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
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