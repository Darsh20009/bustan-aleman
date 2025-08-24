import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { BookOpen, User, Calendar, Users, MessageCircle, Star, ChevronRight, Info, GraduationCap } from 'lucide-react';

interface MainHomepageProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onQuranReader: () => void;
  onAboutUs: () => void;
  onCourses: () => void;
}

export function MainHomepage({ onLoginClick, onRegisterClick, onQuranReader, onAboutUs, onCourses }: MainHomepageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-800 to-orange-700 text-white">
        <div className="max-w-7xl mx-auto px-2 md:px-4 py-6">
          <div className="flex justify-between items-center flex-wrap">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2 md:space-x-4 space-x-reverse"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-full flex items-center justify-center ml-2 md:ml-4">
                <BookOpen className="w-6 h-6 md:w-10 md:h-10 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-4xl font-bold font-amiri">
                  بستان الإيمان
                </h1>
                <p className="text-amber-200 text-sm md:text-lg">
                  المنصة الإسلامية للتحفيظ والتعليم
                </p>
              </div>
            </motion.div>

            <div className="flex items-center space-x-2 space-x-reverse flex-wrap gap-2 mt-2 md:mt-0">
              <Button
                onClick={onLoginClick}
                className="bg-white/20 hover:bg-white/30 text-white border-0 px-3 md:px-6 py-2 text-sm md:text-base"
              >
                تسجيل الدخول
              </Button>
              <Button
                onClick={onRegisterClick}
                variant="outline"
                className="!bg-transparent border-white/30 text-white hover:bg-white/10 active:bg-white/20 focus:bg-white/10 px-3 md:px-6 py-2 text-sm md:text-base font-bold transition-colors"
              >
                إنشاء حساب
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-amber-100 to-orange-100 py-8 md:py-20">
        <div className="max-w-7xl mx-auto px-2 md:px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-6xl font-bold text-amber-900 mb-6 font-amiri">
              تعاليم الدين
            </h2>
            <p className="text-lg md:text-2xl text-amber-700 mb-8 max-w-4xl mx-auto leading-relaxed">
              مع القارئ الشيخ: أحمد عبدالعزيز (أبو مازن)
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mb-8 md:mb-12 max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative overflow-hidden rounded-lg shadow-lg bg-white h-48 md:h-64"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center">
                  <BookOpen className="w-12 md:w-20 h-12 md:h-20 text-amber-800" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-3 md:p-4">
                  <p className="font-semibold text-sm md:text-base">تحفيظ القرآن الكريم</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="relative overflow-hidden rounded-lg shadow-lg bg-white h-48 md:h-64"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-200 to-teal-300 flex items-center justify-center">
                  <Users className="w-12 md:w-20 h-12 md:h-20 text-green-800" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-3 md:p-4">
                  <p className="font-semibold text-sm md:text-base">الدورات التعليمية</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="relative overflow-hidden rounded-lg shadow-lg bg-white h-48 md:h-64"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-indigo-300 flex items-center justify-center">
                  <Star className="w-12 md:w-20 h-12 md:h-20 text-blue-800" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-3 md:p-4">
                  <p className="font-semibold text-sm md:text-base">الأنشطة الرمضانية</p>
                </div>
              </motion.div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4 sm:space-x-reverse">
              <Button
                onClick={onQuranReader}
                size="lg"
                className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-4 md:px-8 py-3 md:py-4 text-sm md:text-lg hover:from-amber-700 hover:to-orange-700 w-full sm:w-auto"
              >
                <BookOpen className="ml-1 md:ml-2 h-4 w-4 md:h-5 md:w-5" />
                اقرأ القرآن الكريم
              </Button>
              <Button
                onClick={onRegisterClick}
                size="lg"
                variant="outline"
                className="border-amber-400 text-amber-700 px-4 md:px-8 py-3 md:py-4 text-sm md:text-lg hover:bg-amber-50 w-full sm:w-auto"
              >
                سجل الآن
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="py-8 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-2 md:px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <h3 className="text-2xl md:text-4xl font-bold text-amber-900 text-center mb-8 font-amiri">
              استكشف المنصة
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className="border-2 border-amber-200 hover:border-amber-400 transition-colors cursor-pointer h-full"
                  onClick={onAboutUs}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-4">
                      <Info className="w-8 h-8 text-amber-600" />
                    </div>
                    <h4 className="text-xl font-bold text-amber-900 mb-2">تعرف علينا</h4>
                    <p className="text-amber-700 mb-4">
                      اكتشف رسالتنا ورؤيتنا وقيمنا في تعليم القرآن الكريم
                    </p>
                    <div className="flex items-center justify-center text-amber-600">
                      <span className="text-sm">اعرف المزيد</span>
                      <ChevronRight className="w-4 h-4 mr-1" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card 
                  className="border-2 border-green-200 hover:border-green-400 transition-colors cursor-pointer h-full"
                  onClick={onCourses}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <GraduationCap className="w-8 h-8 text-green-600" />
                    </div>
                    <h4 className="text-xl font-bold text-green-900 mb-2">الدورات</h4>
                    <p className="text-green-700 mb-4">
                      تصفح دوراتنا التعليمية والمسابقات الرمضانية المتاحة
                    </p>
                    <div className="flex items-center justify-center text-green-600">
                      <span className="text-sm">تصفح الدورات</span>
                      <ChevronRight className="w-4 h-4 mr-1" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* تعرّف على معلمنا */}
      <div className="py-8 md:py-16 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-2 md:px-4 text-center">
          <h3 className="text-2xl md:text-4xl font-bold text-amber-900 mb-4 font-amiri">
            تعرّف على معلمنا المميز
          </h3>
          <p className="text-lg md:text-xl text-amber-700 mb-8 md:mb-12">
            خبير متخصص متفان يقود نجاحنا
          </p>

          <Card className="max-w-2xl mx-auto border-2 border-amber-200 bg-white shadow-lg">
            <CardContent className="p-6 md:p-8 text-center">
              <div className="w-24 h-24 md:w-32 md:h-32 mx-auto bg-gradient-to-br from-amber-200 to-orange-300 rounded-full flex items-center justify-center mb-4 md:mb-6">
                <User className="w-12 h-12 md:w-16 md:h-16 text-amber-800" />
              </div>
              <h4 className="text-xl md:text-2xl font-bold text-amber-900 mb-2">
                الشيخ أحمد عبدالعزيز
              </h4>
              <p className="text-md md:text-lg text-amber-700 mb-4">
                مسؤول المنصة
              </p>
              <p className="text-sm md:text-base text-amber-800 leading-relaxed">
                يكرّس الشيخ أحمد جهوده لابتكار برامج تعليمية مخصّصة لكل طالب بما يتناسب مع تفضيلاته الفريدة.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-8 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-2 md:px-4 text-center">
          <h3 className="text-2xl md:text-4xl font-bold text-amber-900 mb-6 font-amiri">
            ابدأ رحلتك معنا اليوم
          </h3>
          <div className="max-w-4xl mx-auto">
            <p className="text-base md:text-lg text-amber-800 leading-relaxed mb-8">
              انضم إلينا في رحلة تعليمية مميزة نحو حفظ القرآن الكريم وتعلم العلوم الشرعية. 
              نحن هنا لنساعدك على تحقيق أهدافك الدينية والتعليمية بأفضل الطرق الحديثة.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4 sm:space-x-reverse">
              <Button
                onClick={onRegisterClick}
                size="lg"
                className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-8 md:px-12 py-3 md:py-4 text-lg md:text-xl hover:from-amber-700 hover:to-orange-700 w-full sm:w-auto"
              >
                انطلق معنا في الرحلة
              </Button>
              <Button
                onClick={onAboutUs}
                size="lg"
                variant="outline"
                className="border-amber-400 text-amber-700 px-8 md:px-12 py-3 md:py-4 text-lg md:text-xl hover:bg-amber-50 w-full sm:w-auto"
              >
                اعرف المزيد عنا
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-amber-900 text-white py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-2 md:px-4 text-center">
          <div className="flex justify-center items-center mb-4 md:mb-6">
            <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-amber-200 ml-3" />
            <h4 className="text-lg md:text-2xl font-bold font-amiri">
              بستان الإيمان
            </h4>
          </div>
          <p className="text-amber-300 text-sm md:text-base">
            المنصة الإسلامية للتحفيظ والتعليم • للتواصل: +966549947386
          </p>
        </div>
      </div>
    </div>
  );
}