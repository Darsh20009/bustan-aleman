
import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { BookOpen, User, Users, Star, GraduationCap, Award, Heart, Sparkles, CheckCircle, TrendingUp, Shield, Clock, Globe, MessageCircle, PlayCircle, Menu, X } from 'lucide-react';
import logoImage from '@assets/bustan aleman logo_1763041603537.png';
import { ThemeToggle } from '@/components/ThemeToggle';

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

  const navLinks = [
    { label: 'من نحن', onClick: onAboutUs },
    { label: 'الدورات', onClick: onCourses },
    { label: 'المصحف الإلكتروني', onClick: onQuranReader }
  ];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      {/* Header */}
      <header className="bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-foreground))] sticky top-0 z-50 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img 
                src={logoImage} 
                alt="بستان الإيمان" 
                className="w-12 h-12 object-contain"
              />
              <div>
                <h1 className="text-xl md:text-2xl font-bold">بستان الإيمان</h1>
                <p className="text-[hsl(var(--sidebar-foreground))]/70 text-xs md:text-sm hidden sm:block">منصة تحفيظ القرآن الكريم</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link, index) => (
                <button
                  key={index}
                  onClick={link.onClick}
                  className="text-[hsl(var(--sidebar-foreground))]/90 hover:text-[hsl(var(--sidebar-foreground))] transition-colors text-sm"
                  data-testid={`link-nav-${index}`}
                >
                  {link.label}
                </button>
              ))}
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                onClick={onLoginClick}
                variant="ghost"
                size="sm"
                className="text-[hsl(var(--sidebar-foreground))] hover:bg-white/20 hidden sm:flex"
                data-testid="button-login-header"
              >
                <User className="w-4 h-4 ml-1" />
                دخول
              </Button>
              <Button
                onClick={onRegisterClick}
                size="sm"
                className="bg-btn text-btn-foreground hover:opacity-90"
                data-testid="button-register-header"
              >
                <Sparkles className="w-4 h-4 ml-1" />
                <span className="hidden sm:inline">سجل الآن</span>
                <span className="sm:hidden">سجل</span>
              </Button>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-[hsl(var(--sidebar-foreground))] hover:bg-white/20"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                data-testid="button-mobile-menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden pt-4 pb-2 border-t border-[hsl(var(--sidebar-foreground))]/20 mt-3">
              <div className="flex flex-col gap-2">
                {navLinks.map((link, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      link.onClick();
                      setMobileMenuOpen(false);
                    }}
                    className="text-[hsl(var(--sidebar-foreground))]/90 hover:text-[hsl(var(--sidebar-foreground))] py-2 text-right"
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
                  className="text-[hsl(var(--sidebar-foreground))]/90 hover:text-[hsl(var(--sidebar-foreground))] py-2 text-right sm:hidden"
                  data-testid="link-login-mobile"
                >
                  تسجيل الدخول
                </button>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-primary mb-4 leading-tight">
            منصة تعليمية إسلامية متكاملة
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
            حفظ القرآن الكريم والدورات الشرعية مع متابعة مباشرة من المشرفين
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 mb-12">
            <Button
              onClick={onRegisterClick}
              size="lg"
              className="bg-btn text-btn-foreground hover:opacity-90 px-8 py-6 text-lg"
              data-testid="button-register-hero"
            >
              <Sparkles className="ml-2 h-5 w-5" />
              ابدأ رحلتك مجاناً
            </Button>
            <Button
              onClick={onQuranReader}
              size="lg"
              variant="outline"
              className="border-2 border-primary text-primary hover:bg-primary/10 px-8 py-6 text-lg"
              data-testid="button-quran-hero"
            >
              <BookOpen className="ml-2 h-5 w-5" />
              المصحف الإلكتروني
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Users, count: '500+', label: 'طالب' },
              { icon: BookOpen, count: '20+', label: 'دورة' },
              { icon: Award, count: '300+', label: 'شهادة' },
              { icon: Globe, count: '24/7', label: 'متاح' }
            ].map((stat, index) => (
              <Card key={index} className="border border-border">
                <CardContent className="p-4 text-center">
                  <stat.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold text-primary">{stat.count}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Educational Programs */}
      <section className="py-12 bg-card px-4">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-bold text-primary text-center mb-8">
            رحلات تعليمية متنوعة
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'إتقان التجويد',
                description: 'تعلم أحكام التجويد مع تطبيق عملي ومتابعة من المشرف',
                icon: BookOpen,
                color: 'primary',
                features: ['دروس مباشرة', 'تصحيح التلاوة', 'شهادة معتمدة']
              },
              {
                title: 'حفظ جزء عم',
                description: 'برنامج مخصص للأطفال والمبتدئين بأساليب ممتعة',
                icon: Heart,
                color: 'secondary',
                features: ['أساليب تحفيزية', 'متابعة يومية', 'جوائز وشهادات']
              },
              {
                title: 'المتون العلمية',
                description: 'دورات متقدمة لحفظ ودراسة المتون الشرعية',
                icon: GraduationCap,
                color: 'accent',
                features: ['محتوى متقدم', 'إجازة علمية', 'مسار أكاديمي']
              }
            ].map((program, index) => (
              <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <div className={`h-1 ${program.color === 'primary' ? 'bg-primary' : program.color === 'secondary' ? 'bg-secondary' : 'bg-accent'}`} />
                <CardContent className="p-6">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
                    program.color === 'primary' ? 'bg-primary/10' : 
                    program.color === 'secondary' ? 'bg-secondary/10' : 
                    'bg-accent/10'
                  }`}>
                    <program.icon className={`w-7 h-7 ${
                      program.color === 'primary' ? 'text-primary' : 
                      program.color === 'secondary' ? 'text-secondary' : 
                      'text-accent'
                    }`} />
                  </div>
                  <h4 className="text-xl font-bold text-foreground mb-2">{program.title}</h4>
                  <p className="text-muted-foreground mb-4 text-sm">{program.description}</p>
                  <ul className="space-y-2">
                    {program.features.map((feature, i) => (
                      <li key={i} className="flex items-center text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 ml-2 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    onClick={onCourses}
                    className="w-full mt-4 bg-btn text-btn-foreground hover:opacity-90"
                    data-testid={`button-program-${index}`}
                  >
                    تفاصيل البرنامج
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-muted px-4">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-bold text-primary text-center mb-8">
            مميزات المنصة
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: BookOpen, title: 'مصحف تفاعلي', desc: 'قراءة وحفظ' },
              { icon: PlayCircle, title: 'بث مباشر', desc: 'حصص حية' },
              { icon: Users, title: 'نظام متكامل', desc: 'إدارة سهلة' },
              { icon: Award, title: 'شهادات', desc: 'معتمدة' },
              { icon: Shield, title: 'بيانات آمنة', desc: 'حماية كاملة' },
              { icon: Clock, title: 'متاح دائماً', desc: '24/7' },
              { icon: TrendingUp, title: 'تتبع التقدم', desc: 'إحصائيات' },
              { icon: MessageCircle, title: 'دعم فوري', desc: 'مساعدة' }
            ].map((feature, index) => (
              <Card key={index} className="border border-border bg-card">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 mx-auto bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="font-bold text-foreground text-sm mb-1">{feature.title}</h4>
                  <p className="text-xs text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 quran-section px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            ابدأ رحلتك التعليمية اليوم
          </h3>
          <p className="opacity-90 mb-6">
            انضم إلى مئات الطلاب الذين يتعلمون القرآن الكريم معنا
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button
              onClick={onRegisterClick}
              size="lg"
              className="bg-btn text-btn-foreground hover:opacity-90 px-8"
              data-testid="button-register-cta"
            >
              <Sparkles className="ml-2 h-5 w-5" />
              سجل الآن مجاناً
            </Button>
            <Button
              onClick={onAboutUs}
              size="lg"
              variant="outline"
              className="border-2 border-quran-foreground text-quran-foreground hover:bg-white/10 px-8"
              data-testid="button-about-cta"
            >
              اعرف المزيد
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-card px-4 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src={logoImage} alt="بستان الإيمان" className="w-8 h-8" />
            <span className="font-bold text-primary">بستان الإيمان</span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            منصة تحفيظ القرآن الكريم والعلوم الشرعية
          </p>
          <p className="text-xs text-muted-foreground">
            جميع الحقوق محفوظة © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
