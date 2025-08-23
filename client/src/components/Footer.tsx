import { Link } from "wouter";
import { BookOpen, Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-islamic-green text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-reverse space-x-4 mb-6">
              <div className="w-12 h-12 bg-warm-gold rounded-full flex items-center justify-center">
                <BookOpen className="text-dark-charcoal" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold font-arabic-serif">بستان الإيمان</h3>
                <p className="text-sm opacity-80">منصة التعليم الإسلامي</p>
              </div>
            </div>
            <p className="text-white/90 leading-relaxed arabic-text mb-6">
              المنصة الإسلامية للتحفيظ والتعليم التي تُلهم القلوب وتنير العقول برحلة مميزة نحو العلم والإيمان. نجمع بين تحفيظ القرآن الكريم وتعلم الفقه بأسلوب مبسط وحديث.
            </p>
            <div className="flex space-x-reverse space-x-4">
              <div className="w-10 h-10 bg-warm-gold rounded-full flex items-center justify-center cursor-pointer hover:bg-yellow-600 transition-colors">
                <span className="text-dark-charcoal font-bold">📖</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold font-arabic-serif mb-6">روابط سريعة</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/">
                  <span 
                    className="text-white/80 hover:text-white transition-colors cursor-pointer"
                    data-testid="footer-link-home"
                  >
                    الرئيسية
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/about">
                  <span 
                    className="text-white/80 hover:text-white transition-colors cursor-pointer"
                    data-testid="footer-link-about"
                  >
                    من نحن
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/courses">
                  <span 
                    className="text-white/80 hover:text-white transition-colors cursor-pointer"
                    data-testid="footer-link-courses"
                  >
                    الدورات التعليمية
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/quran">
                  <span 
                    className="text-white/80 hover:text-white transition-colors cursor-pointer"
                    data-testid="footer-link-quran"
                  >
                    حفظ القرآن الكريم
                  </span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold font-arabic-serif mb-6">تواصل معنا</h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-reverse space-x-3">
                <Phone className="text-warm-gold" size={20} />
                <div>
                  <p className="text-white/80">+966 54-994-7386</p>
                </div>
              </div>
              <div className="flex items-center space-x-reverse space-x-3">
                <Mail className="text-warm-gold" size={20} />
                <div>
                  <p className="text-white/80">bustan.aleman.2025@gmail.com</p>
                </div>
              </div>
              <div className="flex items-center space-x-reverse space-x-3">
                <Phone className="text-warm-gold" size={20} />
                <div>
                  <p className="text-white/80">واتساب: 0532441566</p>
                  <p className="text-xs text-white/60">للتفعيل والاستفسارات</p>
                </div>
              </div>
            </div>

            {/* Special Note */}
            <div className="mt-6 p-4 bg-white/10 rounded-lg">
              <h5 className="font-bold text-warm-gold mb-2">نصائح لحفظ القرآن الكريم</h5>
              <p className="text-sm text-white/90">صنع الشيخ (أحمد النفيس)</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/80 text-sm mb-4 md:mb-0">
              حقوق النشر محفوظة لمنصة بستان الإيمان &copy; {new Date().getFullYear()}
            </p>
            <div className="flex space-x-reverse space-x-6 text-sm">
              <button className="text-white/80 hover:text-white transition-colors">
                سياسة الخصوصية
              </button>
              <button className="text-white/80 hover:text-white transition-colors">
                شروط الاستخدام
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
