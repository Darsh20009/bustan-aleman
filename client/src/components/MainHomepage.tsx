
import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useLocation } from 'wouter';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { BookOpen, User, Calendar, Users, MessageCircle, Star, ChevronRight, Info, GraduationCap, Award, Heart, PlayCircle, Sparkles, ExternalLink, CheckCircle, TrendingUp, Shield, Clock, Globe } from 'lucide-react';
import logoImage from '@assets/bustan aleman logo_1763041603537.png';

interface MainHomepageProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onQuranReader: () => void;
  onAboutUs: () => void;
  onCourses: () => void;
}

export function MainHomepage({ onLoginClick, onRegisterClick, onQuranReader, onAboutUs, onCourses }: MainHomepageProps) {
  const [scrolled, setScrolled] = useState(false);
  const [, setLocation] = useLocation();
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 100], [0.95, 1]);
  const headerScale = useTransform(scrollY, [0, 100], [1, 0.98]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'من نحن', onClick: onAboutUs },
    { label: 'الدورات', onClick: onCourses },
    { label: 'المصحف الإلكتروني', onClick: onQuranReader }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-emerald-50 to-emerald-100 dark:from-slate-900 dark:via-emerald-950 dark:to-slate-900" dir="rtl">
      {/* Animated Floating Particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-emerald-500/20 dark:bg-emerald-400/20 rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        ))}
      </div>

      {/* Enhanced Header with Islamic Theme */}
      <motion.div 
        className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700 dark:from-emerald-900 dark:via-emerald-800 dark:to-emerald-900 text-white shadow-2xl sticky top-0 z-50 backdrop-blur-sm"
        style={{ opacity: headerOpacity, scale: headerScale }}
      >
        {/* Animated Gradient Overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/10 to-amber-500/0"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        <div className="max-w-7xl mx-auto px-4 py-4 relative z-10">
          <div className="flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4 space-x-reverse"
            >
              <motion.div 
                className="relative w-16 h-16"
                animate={{
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <motion.img 
                  src={logoImage} 
                  alt="بستان الإيمان" 
                  className="w-full h-full object-contain drop-shadow-2xl"
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.6 }}
                />
                {/* Glow Effect */}
                <motion.div
                  className="absolute inset-0 bg-orange-400/30 rounded-full blur-xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity
                  }}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.h1 
                  className="text-2xl md:text-3xl font-bold font-arabic-serif text-white"
                  animate={{
                    textShadow: [
                      '0 0 10px rgba(255,255,255,0.3)',
                      '0 0 20px rgba(255,255,255,0.5)',
                      '0 0 10px rgba(255,255,255,0.3)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  بستان الإيمان
                </motion.h1>
                <p className="text-white/90 text-sm md:text-base font-medium">
                  رحلة تعليمية متكاملة نحو القرآن والعلم
                </p>
              </motion.div>
            </motion.div>

            <motion.div 
              className="flex items-center space-x-3 space-x-reverse"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={onLoginClick}
                  className="bg-white/20 hover:bg-white/30 text-white border-0 px-3 sm:px-4 md:px-6 py-2 text-sm sm:text-base backdrop-blur-sm transition-all"
                  data-testid="button-login-header"
                >
                  <User className="w-4 h-4 ml-2" />
                  تسجيل الدخول
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(251,146,60,0.3)',
                    '0 0 30px rgba(251,146,60,0.5)',
                    '0 0 20px rgba(251,146,60,0.3)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="rounded-md"
              >
                <Button
                  onClick={onRegisterClick}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 border-0 text-white hover:from-orange-600 hover:to-orange-700 px-3 sm:px-4 md:px-6 py-2 text-sm sm:text-base font-bold transition-all shadow-lg"
                  data-testid="button-register-header"
                >
                  <Sparkles className="w-4 h-4 ml-2" />
                  ابدأ الآن
                </Button>
              </motion.div>
            </motion.div>
          </div>

          {/* Quick Navigation Links with Staggered Animation */}
          <div className="hidden md:flex justify-center mt-4 space-x-6 space-x-reverse border-t border-white/20 pt-4">
            {navLinks.map((link, index) => (
              <motion.button
                key={link.label}
                onClick={link.onClick}
                className="text-white/80 hover:text-white transition-colors text-sm font-medium relative group"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                data-testid={`link-nav-${index}`}
              >
                {link.label}
                {/* Animated Underline */}
                <motion.div
                  className="absolute bottom-0 right-0 h-0.5 bg-orange-400"
                  initial={{ width: 0 }}
                  whileHover={{ width: '100%' }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Hero Section with Enhanced Design */}
      <div className="relative py-16 md:py-24 overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-32 h-32 border-4 border-emerald-600 rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-20 w-24 h-24 border-2 border-orange-500 rotate-45 animate-spin" style={{ animationDuration: '20s' }}></div>
          <div className="absolute bottom-10 left-1/4 w-20 h-20 border-2 border-emerald-600 rounded-full animate-bounce"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-6xl font-bold text-emerald-600 mb-6 font-arabic-serif leading-tight">
              منصة تعليمية إسلامية شاملة
            </h2>
            <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-4xl mx-auto leading-relaxed">
              رحلة تعليمية متكاملة تجمع بين حفظ القرآن الكريم، الدورات الشرعية، والأنشطة التفاعلية
            </p>
          </motion.div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
            {[
              { icon: Users, count: '500+', label: 'طالب وطالبة' },
              { icon: BookOpen, count: '20+', label: 'دورة تعليمية' },
              { icon: Award, count: '300+', label: 'شهادة صادرة' },
              { icon: Globe, count: '24/7', label: 'متاح دائماً' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-2 border-emerald-100 bg-white hover:shadow-xl transition-all hover:scale-105">
                  <CardContent className="p-6 text-center">
                    <stat.icon className="w-12 h-12 mx-auto mb-3 text-emerald-600" />
                    <h3 className="text-3xl font-bold text-emerald-600 mb-1">{stat.count}</h3>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Main Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Button
              onClick={onRegisterClick}
              size="lg"
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 font-arabic-serif px-6 sm:px-10 py-4 sm:py-6 text-lg sm:text-xl shadow-2xl transform hover:scale-105 transition-all"
            >
              <Sparkles className="ml-2 h-5 w-5 sm:h-6 sm:w-6" />
              ابدأ رحلتك التعليمية مجاناً
            </Button>
            <Button
              onClick={onQuranReader}
              size="lg"
              variant="outline"
              className="border-2 border-emerald-500 text-emerald-700 hover:bg-emerald-50 px-6 sm:px-10 py-4 sm:py-6 text-lg sm:text-xl transform hover:scale-105 transition-all"
            >
              <BookOpen className="ml-2 h-5 w-5 sm:h-6 sm:w-6" />
              المصحف الإلكتروني
            </Button>
          </div>
        </div>
      </div>

      {/* Educational Journeys Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-center mb-12">
              <h3 className="text-4xl md:text-5xl font-bold text-emerald-600 mb-4 font-amiri">
                رحلات تعليمية ملهمة
              </h3>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                برامج تعليمية مصممة بعناية لتناسب جميع المستويات والأعمار
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: 'رحلة إتقان التجويد',
                  description: 'مسار تفاعلي يركز على الأحكام النظرية والتطبيق العملي مع متابعة دقيقة من المشرف',
                  icon: BookOpen,
                  gradient: 'from-emerald-500 to-emerald-600',
                  features: ['دروس مباشرة', 'تصحيح أخطاء التلاوة', 'شهادة معتمدة']
                },
                {
                  title: 'رحلة حفظ جزء عم',
                  description: 'برنامج مخصص للصغار والمبتدئين بأساليب تحفيزية ممتعة',
                  icon: Heart,
                  gradient: 'from-orange-500 to-orange-600',
                  features: ['أساليب تحفيزية', 'متابعة يومية', 'جوائز وشهادات']
                },
                {
                  title: 'رحلة المتون العلمية',
                  description: 'دورات متقدمة لحفظ ودراسة متون مثل تحفة الأطفال والجزرية',
                  icon: GraduationCap,
                  gradient: 'from-emerald-500 to-teal-600',
                  features: ['محتوى متقدم', 'إجازة علمية', 'مسار أكاديمي']
                }
              ].map((journey, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="group"
                >
                  <Card className="border-0 shadow-xl bg-white hover:shadow-2xl transition-all h-full overflow-hidden">
                    <div className={`h-2 bg-gradient-to-r ${journey.gradient}`}></div>
                    <CardContent className="p-6">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${journey.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <journey.icon className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="text-2xl font-bold text-emerald-600 mb-3">{journey.title}</h4>
                      <p className="text-gray-600 mb-4 leading-relaxed">{journey.description}</p>
                      <div className="space-y-2">
                        {journey.features.map((feature, i) => (
                          <div key={i} className="flex items-center text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 ml-2 text-emerald-500" />
                            {feature}
                          </div>
                        ))}
                      </div>
                      <Button className={`w-full mt-4 bg-gradient-to-r ${journey.gradient} text-white hover:opacity-90`}>
                        استكشف الرحلة
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Platform Features Section */}
      <div className="py-16 bg-gradient-to-br from-emerald-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-4xl md:text-5xl font-bold text-emerald-600 mb-4 font-amiri">
              مميزات المنصة الفريدة
            </h3>
            <p className="text-xl text-gray-600">تقنيات حديثة في خدمة التعليم الإسلامي</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: BookOpen, title: 'مصحف تفاعلي', desc: 'مصحف إلكتروني مع إمكانية إضافة الملاحظات والتفسير' },
              { icon: PlayCircle, title: 'بث مباشر', desc: 'حصص مباشرة مع المشرف وتسجيل الجلسات' },
              { icon: Users, title: 'نظام متكامل', desc: 'لوحة تحكم شاملة للطالب والمشرف' },
              { icon: Award, title: 'شهادات رقمية', desc: 'شهادات موثقة برمز QR وتصميم احترافي' },
              { icon: Shield, title: 'بيانات آمنة', desc: 'حماية كاملة لبيانات الطلاب' },
              { icon: Clock, title: 'متاح دائماً', desc: 'وصول للمحتوى في أي وقت ومن أي مكان' },
              { icon: TrendingUp, title: 'تتبع التقدم', desc: 'إحصائيات دقيقة لمتابعة مستوى الطالب' },
              { icon: MessageCircle, title: 'دعم فوري', desc: 'فريق دعم متاح للرد على استفساراتك' }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
              >
                <Card className="border-2 border-emerald-100 bg-white hover:shadow-xl transition-all h-full">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-lg font-bold text-emerald-600 mb-2">{feature.title}</h4>
                    <p className="text-sm text-gray-600">{feature.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Certificates Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-4xl md:text-5xl font-bold text-emerald-600 mb-4 font-amiri">
              شهادات معتمدة وموثقة
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              احصل على شهادة رقمية موثقة عند إتمام أي رحلة تعليمية
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Sparkles, title: 'تصميم احترافي', desc: 'بزخارف إسلامية أصيلة' },
              { icon: Star, title: 'توثيق رقمي', desc: 'رمز QR للتحقق الفوري' },
              { icon: User, title: 'تخصيص كامل', desc: 'بيانات الطالب والرحلة' },
              { icon: Heart, title: 'مشاركة سهلة', desc: 'تحميل PDF ومشاركة' }
            ].map((item, index) => (
              <Card key={index} className="border-2 border-orange-200 bg-white hover:shadow-xl transition-all">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto bg-orange-100 rounded-full flex items-center justify-center mb-4">
                    <item.icon className="w-8 h-8 text-orange-600" />
                  </div>
                  <h4 className="font-bold text-orange-600 mb-2">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Teacher Section */}
      <div className="py-16 bg-gradient-to-br from-emerald-50 to-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-4xl font-bold text-emerald-600 mb-4 font-amiri">
            المشرف العام
          </h3>
          <Card className="border-2 border-orange-200 bg-white shadow-xl">
            <CardContent className="p-8">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <User className="w-16 h-16 text-white" />
              </div>
              <h4 className="text-3xl font-bold text-emerald-600 mb-2">
                الشيخ أحمد عبدالعزيز
              </h4>
              <p className="text-lg text-orange-600 mb-4">
                مؤسس ومشرف المنصة
              </p>
              <p className="text-gray-700 leading-relaxed max-w-2xl mx-auto">
                يكرّس الشيخ أحمد جهوده لابتكار برامج تعليمية مخصّصة تجمع بين الأصالة والمعاصرة،
                مع متابعة شخصية لكل طالب لضمان تحقيق أفضل النتائج
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-4xl md:text-5xl font-bold mb-6 font-amiri">
            ابدأ رحلتك التعليمية اليوم
          </h3>
          <p className="text-xl mb-8 text-white/90 leading-relaxed">
            انضم إلى مئات الطلاب الذين يتعلمون القرآن الكريم والعلوم الشرعية معنا
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              onClick={onRegisterClick}
              size="lg"
              className="bg-white text-emerald-600 hover:bg-gray-100 px-8 sm:px-12 py-4 sm:py-6 text-lg sm:text-xl font-bold shadow-xl transform hover:scale-105 transition-all"
            >
              <Sparkles className="ml-2 h-5 w-5 sm:h-6 sm:w-6" />
              سجل الآن مجاناً
            </Button>
            <Button
              onClick={onAboutUs}
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white/10 px-8 sm:px-12 py-4 sm:py-6 text-lg sm:text-xl transform hover:scale-105 transition-all"
            >
              <Info className="ml-2 h-5 w-5 sm:h-6 sm:w-6" />
              اعرف المزيد
            </Button>
          </div>
        </div>
      </div>

      {/* Subscriptions Section */}
      <div className="py-20 px-4 bg-gradient-to-br from-white to-emerald-50 dark:from-slate-800 dark:to-slate-900">
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-16">
            <motion.h2 
              className="text-3xl md:text-5xl font-bold text-emerald-900 dark:text-white mb-4"
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              اختر خطة الاشتراك المناسبة
            </motion.h2>
            <motion.p 
              className="text-lg text-gray-600 dark:text-gray-300"
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              ابدأ رحلتك في تعلم القرآن الكريم اليوم
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { name: 'خطة مجانية', price: '0', features: ['1 حصة شهرية', 'المصحف التفاعلي'] },
              { name: 'خطة أساسية', price: '99.99', features: ['4 حصص شهرية', 'دعم عام', 'متابعة التقدم'] },
              { name: 'خطة احترافية', price: '199.99', features: ['8 حصص شهرية', 'دعم VIP', 'شهادات'], featured: true },
              { name: 'خطة سنوية', price: '1199.99', features: ['120 حصة سنوياً', 'توفير 40%', 'محتوى حصري'] }
            ].map((plan, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <Card className={`h-full relative overflow-hidden transition-all ${plan.featured ? 'ring-2 ring-orange-400 md:scale-105 shadow-2xl' : ''}`}>
                  {plan.featured && <div className="absolute top-0 left-0 right-0 bg-orange-400 text-white text-center py-1 text-sm font-bold">خطة مميزة</div>}
                  <CardContent className={`p-6 flex flex-col h-full ${plan.featured ? 'pt-12' : ''}`}>
                    <h3 className="text-xl font-bold text-emerald-700 mb-2">{plan.name}</h3>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-gray-600 mr-2">ريال</span>
                    </div>
                    <ul className="space-y-2 mb-6 flex-1">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button 
                      onClick={() => setLocation('/subscriptions')}
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                      data-testid="button-select-plan"
                    >
                      اختر الخطة
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div className="text-center">
            <Button
              onClick={() => setLocation('/subscriptions')}
              size="lg"
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-8 py-6"
              data-testid="button-view-all-plans"
            >
              <TrendingUp className="ml-2 h-5 w-5" />
              عرض جميع الخطط
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="relative w-12 h-12 mr-3">
                  <img src={logoImage} alt="بستان الإيمان" className="w-full h-full object-contain" />
                </div>
                <h4 className="text-2xl font-bold font-amiri">بستان الإيمان</h4>
              </div>
              <p className="text-white/80 leading-relaxed">
                منصة تعليمية إسلامية متكاملة لحفظ القرآن الكريم والعلوم الشرعية
              </p>
            </div>

            <div>
              <h5 className="text-xl font-bold mb-4">روابط سريعة</h5>
              <div className="space-y-2">
                <button onClick={onAboutUs} className="block text-white/80 hover:text-white transition-colors">من نحن</button>
                <button onClick={onCourses} className="block text-white/80 hover:text-white transition-colors">الدورات</button>
                <button onClick={onQuranReader} className="block text-white/80 hover:text-white transition-colors">المصحف الإلكتروني</button>
              </div>
            </div>

            <div>
              <h5 className="text-xl font-bold mb-4">تواصل معنا</h5>
              <div className="space-y-2 text-white/80">
                <p>📱 واتساب: 0532441566</p>
                <p>📞 هاتف: 0549947386</p>
                <p>✉️ البريد: bustan.aleman.2025@gmail.com</p>
              </div>
            </div>
          </div>

          <div className="border-t border-white/20 pt-6 text-center">
            <p className="text-white/70">
              جميع الحقوق محفوظة © {new Date().getFullYear()} بستان الإيمان
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
