import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { BookOpen, User, Calendar, Users, MessageCircle, Star, ChevronRight, Info, GraduationCap, Award, Heart, PlayCircle, Sparkles } from 'lucide-react';

interface MainHomepageProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onQuranReader: () => void;
  onAboutUs: () => void;
  onCourses: () => void;
}

export function MainHomepage({ onLoginClick, onRegisterClick, onQuranReader, onAboutUs, onCourses }: MainHomepageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-2 md:px-4 py-6">
          <div className="flex justify-between items-center flex-wrap">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2 md:space-x-4 space-x-reverse"
            >
              <div className="relative w-12 h-12 md:w-16 md:h-16 ml-2 md:ml-4">
                {/* Islamic Pattern Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-amber-300 rounded-full shadow-lg"></div>
                <div className="absolute inset-1 bg-white/90 rounded-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6 md:w-10 md:h-10 text-emerald-700" />
                </div>
              </div>
              <div>
                <h1 className="text-xl md:text-4xl font-bold font-amiri bg-gradient-to-r from-white to-emerald-100 bg-clip-text text-transparent">
                  بستان الإيمان
                </h1>
                <p className="text-emerald-200 text-sm md:text-lg font-medium">
                  منصة تعليمية إسلامية متطورة مع خدمات مجانية ومدفوعة
                </p>
              </div>
            </motion.div>

            <div className="flex items-center space-x-2 space-x-reverse flex-wrap gap-2 mt-2 md:mt-0">
              <Button
                onClick={onLoginClick}
                className="bg-white/20 hover:bg-white/30 text-white border-0 px-3 md:px-6 py-2 text-sm md:text-base backdrop-blur-sm"
              >
                <User className="w-4 h-4 ml-1" />
                تسجيل الدخول
              </Button>
              <Button
                onClick={onRegisterClick}
                variant="outline"
                className="!bg-gradient-to-r from-yellow-400 to-amber-300 border-0 text-emerald-800 hover:from-yellow-300 hover:to-amber-200 px-3 md:px-6 py-2 text-sm md:text-base font-bold transition-all shadow-lg"
              >
                <Sparkles className="w-4 h-4 ml-1" />
                ابدأ رحلتك
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-emerald-100 via-teal-100 to-green-100 py-12 md:py-24 overflow-hidden">
        {/* Islamic Pattern Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border-4 border-emerald-300 rounded-full"></div>
          <div className="absolute top-20 right-20 w-24 h-24 border-2 border-teal-300 rotate-45"></div>
          <div className="absolute bottom-10 left-1/4 w-20 h-20 border-2 border-green-300 rounded-full"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-2 md:px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-8">
              <h2 className="text-4xl md:text-7xl font-bold text-emerald-900 mb-4 font-amiri leading-tight">
                رحلات تعليمية ملهمة
              </h2>
              <p className="text-lg md:text-2xl text-emerald-700 mb-8 max-w-4xl mx-auto leading-relaxed">
                نؤمن أن تعلم القرآن ليس مجرد حفظ، بل هو رحلة روحانية متكاملة
              </p>
            </div>
            
            {/* Educational Journeys Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12 max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="group relative overflow-hidden rounded-2xl shadow-2xl bg-white h-64 md:h-72 transform hover:scale-105 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                  <div className="text-center text-white">
                    <BookOpen className="w-16 md:w-20 h-16 md:h-20 mx-auto mb-4 drop-shadow-lg" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white p-4 md:p-6">
                  <h3 className="font-bold text-lg md:text-xl mb-2">رحلة إتقان التجويد</h3>
                  <p className="text-sm md:text-base opacity-90">مسار تفاعلي يركز على الأحكام النظرية والتطبيق العملي</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="group relative overflow-hidden rounded-2xl shadow-2xl bg-white h-64 md:h-72 transform hover:scale-105 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Heart className="w-16 md:w-20 h-16 md:h-20 mx-auto mb-4 drop-shadow-lg" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white p-4 md:p-6">
                  <h3 className="font-bold text-lg md:text-xl mb-2">رحلة حفظ جزء عم</h3>
                  <p className="text-sm md:text-base opacity-90">مصممة خصيصاً للصغار والمبتدئين بأساليب تحفيزية</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="group relative overflow-hidden rounded-2xl shadow-2xl bg-white h-64 md:h-72 transform hover:scale-105 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                  <div className="text-center text-white">
                    <GraduationCap className="w-16 md:w-20 h-16 md:h-20 mx-auto mb-4 drop-shadow-lg" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white p-4 md:p-6">
                  <h3 className="font-bold text-lg md:text-xl mb-2">رحلة المتون العلمية</h3>
                  <p className="text-sm md:text-base opacity-90">دورات متقدمة لحفظ ودراسة متون مثل تحفة الأطفال</p>
                </div>
              </motion.div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4 sm:space-x-reverse">
              <Button
                onClick={onQuranReader}
                size="lg"
                className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 md:px-10 py-4 md:py-5 text-lg md:text-xl hover:from-emerald-700 hover:to-teal-700 w-full sm:w-auto shadow-xl transform hover:scale-105 transition-all"
                data-testid="button-quran-reader"
              >
                <BookOpen className="ml-2 h-5 w-5 md:h-6 md:w-6" />
                المصحف التفاعلي
              </Button>
              <Button
                onClick={onCourses}
                size="lg"
                className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 md:px-10 py-4 md:py-5 text-lg md:text-xl hover:from-amber-700 hover:to-orange-700 w-full sm:w-auto shadow-xl transform hover:scale-105 transition-all"
                data-testid="button-courses"
              >
                <GraduationCap className="ml-2 h-5 w-5 md:h-6 md:w-6" />
                تصفح الدورات
              </Button>
              <Button
                onClick={onRegisterClick}
                size="lg"
                className="bg-gradient-to-r from-yellow-400 to-amber-400 text-emerald-800 px-6 md:px-10 py-4 md:py-5 text-lg md:text-xl hover:from-yellow-300 hover:to-amber-300 w-full sm:w-auto shadow-xl transform hover:scale-105 transition-all font-bold"
                data-testid="button-register"
              >
                <Sparkles className="ml-2 h-5 w-5 md:h-6 md:w-6" />
                انطلق في رحلتك
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Platform Features */}
      <div className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-2 md:px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <div className="text-center mb-16">
              <h3 className="text-3xl md:text-5xl font-bold text-emerald-900 mb-6 font-amiri">
                كنوز المعرفة بين يديك
              </h3>
              <p className="text-lg md:text-xl text-emerald-700 max-w-4xl mx-auto">
                يستطيع المعلم إثراء كل درس بمجموعة من الموارد التي يحول بها الدرس إلى تجربة غامرة
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="group"
              >
                <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-50 to-teal-50 hover:shadow-2xl transition-all duration-300 h-full">
                  <CardContent className="p-6 text-center">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                      <BookOpen className="w-10 h-10 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-emerald-900 mb-3">مصحف تفاعلي</h4>
                    <p className="text-emerald-700 text-sm leading-relaxed">
                      مصحف تفاعلي لكل طالب مع إمكانية وضع ملاحظات من المشرف مباشرة على الآيات
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="group"
              >
                <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-indigo-50 hover:shadow-2xl transition-all duration-300 h-full">
                  <CardContent className="p-6 text-center">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                      <PlayCircle className="w-10 h-10 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-purple-900 mb-3">بث مباشر داخلي</h4>
                    <p className="text-purple-700 text-sm leading-relaxed">
                      بث مباشر داخلي بديل عن Zoom مع تسجيل الحصص والموارد التعليمية المتنوعة
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="group"
              >
                <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50 hover:shadow-2xl transition-all duration-300 h-full">
                  <CardContent className="p-6 text-center">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                      <Users className="w-10 h-10 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-amber-900 mb-3">نظام طالب ومشرف</h4>
                    <p className="text-amber-700 text-sm leading-relaxed">
                      نظامان متكاملان: نظام طالب ونظام مشرف/معلم مع لوحة إدارة شاملة
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className="group"
              >
                <Card className="border-0 shadow-xl bg-gradient-to-br from-rose-50 to-pink-50 hover:shadow-2xl transition-all duration-300 h-full">
                  <CardContent className="p-6 text-center">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                      <Award className="w-10 h-10 text-white" />
                    </div>
                    <h4 className="text-xl font-bold text-rose-900 mb-3">امتحانات وشهادات</h4>
                    <p className="text-rose-700 text-sm leading-relaxed">
                      نظام امتحانات متطور مع إصدار شهادات PDF بتصميم إسلامي أصيل ورمز QR
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Certificates Section */}
      <div className="py-16 md:py-24 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-2 md:px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="text-center"
          >
            <h3 className="text-3xl md:text-5xl font-bold text-amber-900 mb-6 font-amiri">
              شهادات الإتقان: وسام شرف يكلل إنجازك
            </h3>
            <p className="text-lg md:text-xl text-amber-700 mb-12 max-w-4xl mx-auto">
              عندما يكمل الطالب رحلته التعليمية ويتجاوز اختباراتها بنجاح، يتوج إنجازه بتحفة فنية رقمية تليق بجهده
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <Card className="border-2 border-amber-200 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-amber-600" />
                  </div>
                  <h4 className="font-bold text-amber-900 mb-2">تصميم فريد</h4>
                  <p className="text-amber-700 text-sm">بزخارف إسلامية أصيلة وخطوط عربية رائعة</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-emerald-200 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                    <Star className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h4 className="font-bold text-emerald-900 mb-2">توثيق رقمي</h4>
                  <p className="text-emerald-700 text-sm">تحمل الشهادة رمز QR فريد للتحقق من صحتها فوراً</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-200 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    <User className="w-8 h-8 text-purple-600" />
                  </div>
                  <h4 className="font-bold text-purple-900 mb-2">تخصيص كامل</h4>
                  <p className="text-purple-700 text-sm">تحمل اسم الطالب واسم الرحلة وتوقيع رقمي</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-blue-200 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Heart className="w-8 h-8 text-blue-600" />
                  </div>
                  <h4 className="font-bold text-blue-900 mb-2">مشاركة بفخر</h4>
                  <p className="text-blue-700 text-sm">تحميلها بصيغة PDF أو مشاركتها على منصات التواصل</p>
                </CardContent>
              </Card>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-amber-200">
              <p className="text-xl md:text-2xl text-amber-800 font-semibold italic">
                "إنها أكثر من شهادة، إنها وسام شرف رقمي، وذكرى خالدة لرحلة مباركة مع القرآن الكريم"
              </p>
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
      <div className="bg-emerald-900 text-white py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-2 md:px-4 text-center">
          <div className="flex justify-center items-center mb-4 md:mb-6">
            <div className="relative w-8 h-8 md:w-10 md:h-10 ml-3">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-amber-300 rounded-full"></div>
              <div className="absolute inset-1 bg-white/90 rounded-full flex items-center justify-center">
                <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-emerald-700" />
              </div>
            </div>
            <h4 className="text-lg md:text-2xl font-bold font-amiri">
              بستان الإيمان
            </h4>
          </div>
          <p className="text-emerald-300 text-sm md:text-base mb-2">
            منصة تعليمية إسلامية متطورة لحفظ القرآن الكريم والعلوم الشرعية
          </p>
          <p className="text-emerald-400 text-xs md:text-sm">
            للتواصل: +966549947386 • خدمات مجانية ومدفوعة متاحة
          </p>
        </div>
      </div>
    </div>
  );
}