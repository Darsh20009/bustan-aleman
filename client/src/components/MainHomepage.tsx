
import { useState, useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { Button } from './ui/button';
import { BookOpen, User, Users, Star, GraduationCap, Award, Heart, CheckCircle, Shield, Clock, Globe, Mic, BookMarked, Video, EyeOff, Search, ArrowLeft, Menu, X, ChevronLeft } from 'lucide-react';
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
  const [activeFeature, setActiveFeature] = useState(0);
  const featuresRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  if (showSplash) {
    return <BustanSplashScreen onComplete={handleSplashComplete} />;
  }

  const navLinks = [
    { label: 'من نحن', onClick: onAboutUs },
    { label: 'الدورات', onClick: onCourses },
    { label: 'المصحف', onClick: onQuranReader }
  ];

  const features = [
    {
      icon: BookOpen,
      title: 'مصحف إلكتروني تفاعلي',
      desc: 'تصفح المصحف الشريف بخط عثماني واضح مع إمكانية التلاوة المباشرة والتتبع الذكي',
      color: '#2D5A3D',
    },
    {
      icon: Mic,
      title: 'تسميع بالذكاء الاصطناعي',
      desc: 'اقرأ بصوتك ويتابعك النظام كلمة بكلمة مع تصحيح فوري وتقييم دقيق',
      color: '#8B6914',
    },
    {
      icon: EyeOff,
      title: 'وضع الحفظ والاختبار',
      desc: 'إخفاء الآيات لاختبار حفظك مع كشف تدريجي وتتبع مستوى التقدم',
      color: '#4A6FA5',
    },
    {
      icon: Video,
      title: 'حصص مباشرة مع المشايخ',
      desc: 'تواصل مباشر بالفيديو مع معلمين مؤهلين لتصحيح التلاوة والمتابعة الشخصية',
      color: '#7B4B94',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF7] dark:bg-[#111111]" dir="rtl">
      {/* Navbar */}
      <nav
        className={`fixed z-50 w-full transition-all duration-500 ${
          navScrolled
            ? 'bg-white/90 dark:bg-[#111111]/90 backdrop-blur-xl shadow-sm border-b border-gray-200/50 dark:border-white/5'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-5 md:px-8">
          <div className="flex justify-between items-center h-16 md:h-[72px]">
            <div className="flex items-center gap-3">
              <img
                src={logoImage}
                alt="بستان الإيمان"
                className="w-9 h-9 md:w-10 md:h-10 object-contain"
              />
              <div>
                <h1 className={`text-base md:text-lg font-bold leading-tight transition-colors ${navScrolled ? 'text-[#1a1a1a] dark:text-white' : 'text-[#1a1a1a] dark:text-white'}`}>
                  بستان الإيمان
                </h1>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link, index) => (
                <button
                  key={index}
                  onClick={link.onClick}
                  className={`transition-colors text-sm font-medium ${navScrolled ? 'text-gray-600 dark:text-gray-400 hover:text-[#1a1a1a] dark:hover:text-white' : 'text-gray-600 dark:text-gray-400 hover:text-[#1a1a1a] dark:hover:text-white'}`}
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
                className="text-gray-600 dark:text-gray-400 hover:text-[#1a1a1a] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 hidden sm:flex gap-1.5 text-sm"
                data-testid="button-login-header"
              >
                <User className="w-4 h-4" />
                دخول
              </Button>
              <Button
                onClick={onRegisterClick}
                size="sm"
                className="bg-[#2D5A3D] hover:bg-[#234A31] text-white border-0 gap-1.5 rounded-lg text-sm px-4"
                data-testid="button-register-header"
              >
                <span>سجّل الآن</span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-gray-600 dark:text-gray-400"
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
            <div id="mobile-nav-menu" role="navigation" aria-label="القائمة الرئيسية" className="md:hidden pb-4 border-t border-gray-200 dark:border-white/10 mt-1">
              <div className="flex flex-col gap-1 pt-3">
                {navLinks.map((link, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      link.onClick();
                      setMobileMenuOpen(false);
                    }}
                    className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 py-2.5 px-3 text-right rounded-lg transition-colors"
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
                  className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 py-2.5 px-3 text-right rounded-lg transition-colors sm:hidden"
                  data-testid="link-login-mobile"
                >
                  تسجيل الدخول
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 md:pt-40 pb-20 md:pb-28 px-5 md:px-8">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-[10%] w-[500px] h-[500px] rounded-full bg-[#2D5A3D]/[0.04] dark:bg-[#2D5A3D]/[0.08] blur-3xl" />
          <div className="absolute bottom-0 left-[5%] w-[400px] h-[400px] rounded-full bg-[#D4AF37]/[0.04] dark:bg-[#D4AF37]/[0.06] blur-3xl" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-[#2D5A3D]/[0.08] dark:bg-[#2D5A3D]/20 rounded-full px-4 py-1.5 mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-[#2D5A3D] dark:bg-emerald-400" />
              <span className="text-[#2D5A3D] dark:text-emerald-400 text-xs font-medium">منصة تعليمية إسلامية متكاملة</span>
            </div>

            <h2 className="text-[2.5rem] md:text-[3.5rem] lg:text-[4rem] font-bold text-[#1a1a1a] dark:text-white leading-[1.15] mb-6 tracking-tight">
              احفظ القرآن الكريم
              <br />
              <span className="text-[#2D5A3D] dark:text-emerald-400">بأسلوب تفاعلي حديث</span>
            </h2>

            <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 mb-10 max-w-xl leading-relaxed">
              تعلّم وراجع مع متابعة مباشرة من مشايخ مؤهلين، ومصحف إلكتروني ذكي يتتبع تلاوتك ويصحح أخطاءك.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-16">
              <Button
                onClick={onRegisterClick}
                size="lg"
                className="bg-[#2D5A3D] hover:bg-[#234A31] text-white border-0 px-8 h-12 text-base rounded-xl gap-2"
                data-testid="button-register-hero"
              >
                ابدأ مجاناً
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <Button
                onClick={onQuranReader}
                size="lg"
                variant="outline"
                className="border border-gray-300 dark:border-gray-700 text-[#1a1a1a] dark:text-white hover:bg-gray-100 dark:hover:bg-white/5 px-8 h-12 text-base rounded-xl gap-2"
                data-testid="button-quran-hero"
              >
                <BookOpen className="w-4 h-4" />
                تصفح المصحف
              </Button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap gap-8 md:gap-14">
            {[
              { value: '+٥٠٠', label: 'طالب وطالبة' },
              { value: '+٢٠', label: 'دورة تعليمية' },
              { value: '+٣٠٠', label: 'شهادة ممنوحة' },
            ].map((stat, i) => (
              <div key={i} className="flex items-baseline gap-2">
                <span className="text-2xl md:text-3xl font-bold text-[#1a1a1a] dark:text-white">{stat.value}</span>
                <span className="text-sm text-gray-400 dark:text-gray-500">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section ref={featuresRef} className="py-20 md:py-28 px-5 md:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-14">
            <p className="text-xs font-semibold text-[#2D5A3D] dark:text-emerald-400 uppercase tracking-widest mb-3">المميزات</p>
            <h3 className="text-2xl md:text-3xl font-bold text-[#1a1a1a] dark:text-white">
              كل ما تحتاجه في مكان واحد
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isActive = activeFeature === index;
              return (
                <button
                  key={index}
                  onClick={() => setActiveFeature(index)}
                  className={`text-right p-6 md:p-8 rounded-2xl border transition-all duration-500 ${
                    isActive
                      ? 'bg-white dark:bg-white/[0.04] border-gray-200 dark:border-white/10 shadow-lg dark:shadow-none'
                      : 'bg-transparent border-transparent hover:bg-white/50 dark:hover:bg-white/[0.02]'
                  }`}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                    style={{
                      backgroundColor: isActive ? `${feature.color}12` : 'transparent',
                    }}
                  >
                    <Icon
                      className="w-5 h-5 transition-colors"
                      style={{ color: isActive ? feature.color : '#999' }}
                    />
                  </div>
                  <h4 className={`text-base font-bold mb-2 transition-colors ${isActive ? 'text-[#1a1a1a] dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
                    {feature.title}
                  </h4>
                  <p className={`text-sm leading-relaxed transition-colors ${isActive ? 'text-gray-500 dark:text-gray-400' : 'text-gray-300 dark:text-gray-600'}`}>
                    {feature.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Programs */}
      <section id="programs" className="py-20 md:py-28 px-5 md:px-8 bg-white dark:bg-[#161616] scroll-mt-20">
        <div className="max-w-5xl mx-auto">
          <div className="mb-14">
            <p className="text-xs font-semibold text-[#2D5A3D] dark:text-emerald-400 uppercase tracking-widest mb-3">البرامج</p>
            <h3 className="text-2xl md:text-3xl font-bold text-[#1a1a1a] dark:text-white mb-3">
              برامج تعليمية متخصصة
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-lg text-sm">
              اختر المسار المناسب لمستواك وأهدافك
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                title: 'إتقان التجويد',
                description: 'تعلم أحكام التجويد مع تطبيق عملي على آيات القرآن الكريم',
                icon: BookOpen,
                accent: '#2D5A3D',
                features: ['دروس مباشرة أسبوعية', 'تصحيح التلاوة بالذكاء الاصطناعي', 'شهادة إتمام معتمدة']
              },
              {
                title: 'حفظ القرآن الكريم',
                description: 'برنامج حفظ متدرج مع خطة مخصصة ومتابعة يومية من المشرف',
                icon: Heart,
                accent: '#8B6914',
                features: ['خطة حفظ شخصية', 'تسميع يومي مع المشرف', 'مراجعة دورية وتثبيت']
              },
              {
                title: 'العلوم الشرعية',
                description: 'دورات في التفسير والعقيدة والفقه مع أساتذة متخصصين',
                icon: GraduationCap,
                accent: '#4A6FA5',
                features: ['محتوى أكاديمي متميز', 'اختبارات تقييمية', 'مسار تعليمي متكامل']
              }
            ].map((program, index) => {
              const Icon = program.icon;
              return (
                <div
                  key={index}
                  className="group bg-[#FAFAF7] dark:bg-[#111111] border border-gray-200/60 dark:border-white/5 rounded-2xl p-6 hover:border-gray-300 dark:hover:border-white/10 transition-all duration-300"
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-5"
                    style={{ backgroundColor: `${program.accent}10` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: program.accent }} />
                  </div>
                  <h4 className="text-lg font-bold text-[#1a1a1a] dark:text-white mb-2">{program.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">{program.description}</p>
                  <ul className="space-y-2.5 mb-6">
                    {program.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: program.accent }} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={onCourses}
                    variant="ghost"
                    className="w-full justify-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-[#1a1a1a] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl"
                    data-testid={`button-program-${index}`}
                  >
                    تفاصيل البرنامج
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Detailed Features Grid */}
      <section className="py-20 md:py-28 px-5 md:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-14">
            <p className="text-xs font-semibold text-[#2D5A3D] dark:text-emerald-400 uppercase tracking-widest mb-3">التفاصيل</p>
            <h3 className="text-2xl md:text-3xl font-bold text-[#1a1a1a] dark:text-white">
              لماذا بستان الإيمان؟
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
            {[
              { icon: Mic, title: 'تلاوة مباشرة', desc: 'يتابع صوتك كلمة بكلمة' },
              { icon: Search, title: 'بحث ذكي', desc: 'بالنص أو بالصوت' },
              { icon: EyeOff, title: 'وضع الحفظ', desc: 'إخفاء وكشف تدريجي' },
              { icon: Shield, title: 'تصحيح الأخطاء', desc: 'اكتشاف فوري ودقيق' },
              { icon: Video, title: 'حصص فيديو', desc: 'بث مباشر مع المشايخ' },
              { icon: BookMarked, title: 'خطة مخصصة', desc: 'حسب مستواك وأهدافك' },
              { icon: Users, title: 'متابعة شخصية', desc: 'من معلمين معتمدين' },
              { icon: Globe, title: 'متاح دائماً', desc: 'تعلم في أي وقت' },
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="group">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-3 group-hover:bg-[#2D5A3D]/10 dark:group-hover:bg-[#2D5A3D]/20 transition-colors">
                    <Icon className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-[#2D5A3D] dark:group-hover:text-emerald-400 transition-colors" />
                  </div>
                  <h5 className="font-semibold text-sm text-[#1a1a1a] dark:text-white mb-1">{item.title}</h5>
                  <p className="text-xs text-gray-400 dark:text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 md:py-28 px-5 md:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-[#2D5A3D] dark:bg-[#1E3D2B] rounded-3xl p-8 md:p-14 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-[0.06]"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
                backgroundSize: '24px 24px',
              }}
            />
            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                ابدأ رحلتك مع القرآن اليوم
              </h3>
              <p className="text-white/60 mb-8 text-sm md:text-base max-w-md mx-auto leading-relaxed">
                انضم إلى مئات الطلاب واحفظ القرآن الكريم مع متابعة شخصية
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Button
                  onClick={onRegisterClick}
                  size="lg"
                  className="bg-white text-[#2D5A3D] hover:bg-gray-100 border-0 px-8 h-12 text-base rounded-xl gap-2 font-semibold"
                  data-testid="button-register-cta"
                >
                  سجّل الآن مجاناً
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Button
                  onClick={onQuranReader}
                  size="lg"
                  variant="outline"
                  className="border border-white/20 text-white hover:bg-white/10 px-8 h-12 text-base rounded-xl gap-2"
                  data-testid="button-quran-cta"
                >
                  تصفح المصحف
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-5 md:px-8 border-t border-gray-200/50 dark:border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img src={logoImage} alt="بستان الإيمان" className="w-8 h-8 opacity-60" />
              <span className="text-sm text-gray-400 dark:text-gray-500">بستان الإيمان — منصة تحفيظ القرآن الكريم</span>
            </div>
            <div className="flex items-center gap-6">
              {navLinks.map((link, index) => (
                <button
                  key={index}
                  onClick={link.onClick}
                  className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  data-testid={`link-footer-${index}`}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-200/30 dark:border-white/5 text-center">
            <p className="text-xs text-gray-300 dark:text-gray-600">
              جميع الحقوق محفوظة &copy; {new Date().getFullYear()} بستان الإيمان
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
