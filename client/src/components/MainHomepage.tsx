
import { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from './ui/button';
import { BookOpen, User, Users, Star, GraduationCap, Award, Heart, Sparkles, CheckCircle, TrendingUp, Shield, Clock, Globe, MessageCircle, PlayCircle, Menu, X, ChevronDown, Mic, BookMarked, Video } from 'lucide-react';
import logoImage from '@assets/bustan aleman logo_1763041603537.png';
import { ThemeToggle } from '@/components/ThemeToggle';
import { BustanSplashScreen } from './BustanSplashScreen';

interface MainHomepageProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onQuranReader: () => void;
  onAboutUs: () => void;
  onCourses: () => void;
}

export function MainHomepage({ onLoginClick, onRegisterClick, onQuranReader, onAboutUs, onCourses }: MainHomepageProps) {
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const [showSplash, setShowSplash] = useState(() => {
    const seen = sessionStorage.getItem('splash-seen');
    return !seen;
  });

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
    sessionStorage.setItem('splash-seen', 'true');
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setNavScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (showSplash) {
    return <BustanSplashScreen onComplete={handleSplashComplete} />;
  }

  const navLinks = [
    { label: 'من نحن', onClick: onAboutUs },
    { label: 'الدورات', onClick: onCourses },
    { label: 'المصحف الإلكتروني', onClick: onQuranReader }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950" dir="rtl">
      <nav
        className={`fixed z-50 w-full transition-all duration-300 ${
          navScrolled
            ? 'bg-black/80 backdrop-blur-md shadow-lg'
            : 'bg-black/30 backdrop-blur-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex justify-between items-center h-[60px] md:h-[68px]">
            <div className="flex items-center gap-3">
              <img
                src={logoImage}
                alt="بستان الإيمان"
                className="w-10 h-10 md:w-11 md:h-11 object-contain drop-shadow-lg"
              />
              <div>
                <h1 className="text-lg md:text-xl font-bold text-white leading-tight">بستان الإيمان</h1>
                <p className="text-white/75 text-[11px] md:text-xs hidden sm:block">منصة تحفيظ القرآن الكريم</p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link, index) => (
                <button
                  key={index}
                  onClick={link.onClick}
                  className="text-white/80 hover:text-white transition-colors text-sm font-medium"
                  data-testid={`link-nav-${index}`}
                >
                  {link.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                onClick={onLoginClick}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/15 hidden sm:flex gap-1.5"
                data-testid="button-login-header"
              >
                <User className="w-4 h-4" />
                دخول
              </Button>
              <Button
                onClick={onRegisterClick}
                size="sm"
                className="bg-emerald-500 hover:bg-emerald-400 text-white border-0 gap-1.5 shadow-lg shadow-emerald-500/25"
                data-testid="button-register-header"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">سجل الآن</span>
                <span className="sm:hidden">سجل</span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-white hover:bg-white/15"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                data-testid="button-mobile-menu"
                aria-label={mobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-nav-menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div id="mobile-nav-menu" role="navigation" aria-label="القائمة الرئيسية" className="md:hidden pb-4 border-t border-white/10 mt-1 animate-in slide-in-from-top-2 duration-200">
              <div className="flex flex-col gap-1 pt-3">
                {navLinks.map((link, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      link.onClick();
                      setMobileMenuOpen(false);
                    }}
                    className="text-white/80 hover:text-white hover:bg-white/10 py-2.5 px-3 text-right rounded-lg transition-colors"
                    data-testid={`link-nav-mobile-${index}`}
                  >
                    {link.label}
                  </button>
                ))}
                <button
                  onClick={() => {
                    onLoginClick();
                    setMobileMenuOpen(false);
                  }}
                  className="text-white/80 hover:text-white hover:bg-white/10 py-2.5 px-3 text-right rounded-lg transition-colors sm:hidden"
                  data-testid="link-login-mobile"
                >
                  تسجيل الدخول
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <section className="relative min-h-[85vh] md:min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a2e1a] via-[#0d3d22] to-[#051a0e]" />
        <div className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

        <div className="absolute top-[15%] right-[10%] w-32 h-32 md:w-48 md:h-48 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-[20%] left-[5%] w-40 h-40 md:w-56 md:h-56 rounded-full bg-emerald-400/8 blur-3xl" />

        <div className="relative z-10 max-w-4xl mx-auto text-center px-4 pt-20">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-white/10">
            <Star className="w-4 h-4 text-amber-400" />
            <span className="text-white/80 text-sm">منصة تعليمية إسلامية شاملة</span>
          </div>

          <h2
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.3]"
            style={{ fontFamily: 'Amiri, serif' }}
          >
            رحلتك مع القرآن
            <br />
            <span className="text-emerald-400">تبدأ من هنا</span>
          </h2>

          <p className="text-lg md:text-xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
            حفظ القرآن الكريم والدورات الشرعية مع متابعة مباشرة من المشايخ والمشرفين المعتمدين
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Button
              onClick={onRegisterClick}
              size="lg"
              className="bg-emerald-500 hover:bg-emerald-400 text-white border-0 px-8 py-6 text-lg rounded-xl shadow-xl shadow-emerald-500/20 gap-2"
              data-testid="button-register-hero"
            >
              <Sparkles className="h-5 w-5" />
              ابدأ رحلتك مجاناً
            </Button>
            <Button
              onClick={onQuranReader}
              size="lg"
              variant="outline"
              className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg rounded-xl backdrop-blur-sm gap-2"
              data-testid="button-quran-hero"
            >
              <BookOpen className="h-5 w-5" />
              المصحف الإلكتروني
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-3xl mx-auto">
            {[
              { count: '500+', label: 'طالب', icon: Users },
              { count: '20+', label: 'دورة', icon: BookMarked },
              { count: '300+', label: 'شهادة', icon: Award },
              { count: '24/7', label: 'متاح', icon: Globe }
            ].map((stat, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 text-center">
                <stat.icon className="w-6 h-6 mx-auto mb-2 text-emerald-400" />
                <p className="text-2xl md:text-3xl font-bold text-white">{stat.count}</p>
                <p className="text-sm text-white/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => {
            document.getElementById('programs')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 hover:text-white/70 transition-colors animate-bounce"
          aria-label="انتقل للأسفل"
        >
          <ChevronDown className="w-8 h-8" />
        </button>
      </section>

      <section id="programs" className="py-16 md:py-24 px-4 bg-white dark:bg-gray-950 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-sm font-medium px-4 py-1.5 rounded-full mb-4">
              برامجنا التعليمية
            </span>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4" style={{ fontFamily: 'Amiri, serif' }}>
              رحلات تعليمية متنوعة
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              اختر البرنامج المناسب لمستواك وابدأ رحلتك مع القرآن الكريم
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'إتقان التجويد',
                description: 'تعلم أحكام التجويد مع تطبيق عملي ومتابعة من المشرف',
                icon: BookOpen,
                gradient: 'from-emerald-500 to-emerald-600',
                bgLight: 'bg-emerald-50 dark:bg-emerald-900/20',
                iconColor: 'text-emerald-600 dark:text-emerald-400',
                features: ['دروس مباشرة', 'تصحيح التلاوة', 'شهادة معتمدة']
              },
              {
                title: 'حفظ القرآن',
                description: 'برنامج متكامل لحفظ القرآن الكريم بأساليب تفاعلية',
                icon: Heart,
                gradient: 'from-amber-500 to-orange-500',
                bgLight: 'bg-amber-50 dark:bg-amber-900/20',
                iconColor: 'text-amber-600 dark:text-amber-400',
                features: ['أساليب تحفيزية', 'متابعة يومية', 'جوائز وشهادات']
              },
              {
                title: 'المتون العلمية',
                description: 'دورات متقدمة لحفظ ودراسة المتون الشرعية',
                icon: GraduationCap,
                gradient: 'from-blue-500 to-indigo-500',
                bgLight: 'bg-blue-50 dark:bg-blue-900/20',
                iconColor: 'text-blue-600 dark:text-blue-400',
                features: ['محتوى متقدم', 'إجازة علمية', 'مسار أكاديمي']
              }
            ].map((program, index) => (
              <div
                key={index}
                className="group relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`h-1.5 bg-gradient-to-l ${program.gradient}`} />
                <div className="p-6">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-5 ${program.bgLight}`}>
                    <program.icon className={`w-7 h-7 ${program.iconColor}`} />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{program.title}</h4>
                  <p className="text-gray-500 dark:text-gray-400 mb-5 text-sm leading-relaxed">{program.description}</p>
                  <ul className="space-y-2.5 mb-6">
                    {program.features.map((feature, i) => (
                      <li key={i} className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <CheckCircle className="w-4 h-4 ml-2 text-emerald-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={onCourses}
                    className="w-full bg-gray-900 dark:bg-white dark:text-gray-900 text-white hover:bg-gray-800 dark:hover:bg-gray-100 rounded-xl"
                    data-testid={`button-program-${index}`}
                  >
                    تفاصيل البرنامج
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-sm font-medium px-4 py-1.5 rounded-full mb-4">
              لماذا بستان الإيمان؟
            </span>
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4" style={{ fontFamily: 'Amiri, serif' }}>
              مميزات المنصة
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { icon: BookOpen, title: 'مصحف تفاعلي', desc: 'قراءة وحفظ مع تلوين التجويد' },
              { icon: Video, title: 'حصص مباشرة', desc: 'بث مباشر مع المشايخ' },
              { icon: Mic, title: 'تسميع بالذكاء الاصطناعي', desc: 'تقييم فوري للتلاوة' },
              { icon: Award, title: 'شهادات معتمدة', desc: 'إثبات إتمام المسار' },
              { icon: Shield, title: 'بيانات آمنة', desc: 'حماية كاملة لبياناتك' },
              { icon: Clock, title: 'متاح دائماً', desc: 'تعلم في أي وقت' },
              { icon: TrendingUp, title: 'تتبع التقدم', desc: 'إحصائيات مفصلة' },
              { icon: MessageCircle, title: 'دعم فوري', desc: 'مساعدة على مدار الساعة' }
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-5 text-center hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="w-12 h-12 mx-auto bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center mb-3">
                  <feature.icon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{feature.title}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-20 md:py-28 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a2e1a] via-[#0d3d22] to-[#051a0e]" />
        <div className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-emerald-400/8 blur-3xl" />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h3
            className="text-3xl md:text-4xl font-bold text-white mb-5"
            style={{ fontFamily: 'Amiri, serif' }}
          >
            ابدأ رحلتك التعليمية اليوم
          </h3>
          <p className="text-white/70 mb-10 text-lg leading-relaxed max-w-xl mx-auto">
            انضم إلى مئات الطلاب الذين يحفظون القرآن الكريم ويتعلمون العلوم الشرعية معنا
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              onClick={onRegisterClick}
              size="lg"
              className="bg-emerald-500 hover:bg-emerald-400 text-white border-0 px-10 py-6 text-lg rounded-xl shadow-xl shadow-emerald-500/20 gap-2"
              data-testid="button-register-cta"
            >
              <Sparkles className="h-5 w-5" />
              سجل الآن مجاناً
            </Button>
            <Button
              onClick={onAboutUs}
              size="lg"
              variant="outline"
              className="border-2 border-white/30 text-white hover:bg-white/10 px-10 py-6 text-lg rounded-xl gap-2"
              data-testid="button-about-cta"
            >
              اعرف المزيد
            </Button>
          </div>
        </div>
      </section>

      <footer className="py-10 bg-white dark:bg-gray-950 px-4 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img src={logoImage} alt="بستان الإيمان" className="w-10 h-10" />
              <div>
                <span className="font-bold text-gray-900 dark:text-white text-lg">بستان الإيمان</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">منصة تحفيظ القرآن الكريم</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              {navLinks.map((link, index) => (
                <button
                  key={index}
                  onClick={link.onClick}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  data-testid={`link-footer-${index}`}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
            <p className="text-sm text-gray-400 dark:text-gray-500">
              جميع الحقوق محفوظة &copy; {new Date().getFullYear()} بستان الإيمان
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
