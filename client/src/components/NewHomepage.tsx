import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { BookOpen, User, Calendar, Users, MessageCircle, Star, ChevronRight } from 'lucide-react';

interface NewHomepageProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onQuranReader: () => void;
}

export function NewHomepage({ onLoginClick, onRegisterClick, onQuranReader }: NewHomepageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50" dir="rtl">
      <style>{`
        @media (max-width: 768px) {
          .grid { grid-template-columns: 1fr !important; }
          .text-5xl { font-size: 2.5rem !important; }
          .text-4xl { font-size: 2rem !important; }
          .px-8 { padding-left: 1rem !important; padding-right: 1rem !important; }
          .py-16 { padding-top: 3rem !important; padding-bottom: 3rem !important; }
        }
      `}</style>
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-800 to-orange-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4 space-x-reverse"
            >
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center ml-4">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold font-amiri">
                  بستان الإيمان
                </h1>
                <p className="text-amber-200 text-lg">
                  المنصة الإسلامية للتحفيظ والتعليم
                </p>
              </div>
            </motion.div>

            <div className="flex items-center space-x-4 space-x-reverse">
              <Button
                onClick={onLoginClick}
                className="bg-white/20 hover:bg-white/30 text-white border-0 px-6 py-2"
              >
                تسجيل الدخول
              </Button>
              <Button
                onClick={onRegisterClick}
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 px-6 py-2"
              >
                إنشاء حساب
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-amber-100 to-orange-100 py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-6xl font-bold text-amber-900 mb-6 font-amiri">
              تعاليم الدين
            </h2>
            <p className="text-xl md:text-2xl text-amber-700 mb-8 max-w-4xl mx-auto leading-relaxed">
              مع القارئ الشيخ: أحمد عبدالعزيز (أبو مازن)
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12 max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative overflow-hidden rounded-lg shadow-lg bg-white h-64"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center">
                  <BookOpen className="w-20 h-20 text-amber-800" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-4">
                  <p className="font-semibold">تحفيظ القرآن الكريم</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="relative overflow-hidden rounded-lg shadow-lg bg-white h-64"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-200 to-teal-300 flex items-center justify-center">
                  <Users className="w-20 h-20 text-green-800" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-4">
                  <p className="font-semibold">الدورات التعليمية</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="relative overflow-hidden rounded-lg shadow-lg bg-white h-64"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-indigo-300 flex items-center justify-center">
                  <Star className="w-20 h-20 text-blue-800" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-4">
                  <p className="font-semibold">الأنشطة الرمضانية</p>
                </div>
              </motion.div>
            </div>

            <div className="flex justify-center space-x-4 space-x-reverse">
              <Button
                onClick={onQuranReader}
                size="lg"
                className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-8 py-4 text-lg hover:from-amber-700 hover:to-orange-700"
              >
                <BookOpen className="ml-2 h-5 w-5" />
                اقرأ القرآن الكريم
              </Button>
              <Button
                onClick={onRegisterClick}
                size="lg"
                variant="outline"
                className="border-amber-400 text-amber-700 px-8 py-4 text-lg hover:bg-amber-50"
              >
                سجل الآن
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* الدورات القادمة */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <h3 className="text-4xl font-bold text-amber-900 text-center mb-4 font-amiri">
              الدورات القادمة
            </h3>
            <p className="text-xl text-amber-700 text-center mb-12">
              رحلة تعليمية حول العالم
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-2 border-amber-200 hover:border-amber-400 transition-colors">
                <CardHeader>
                  <CardTitle className="text-amber-800 text-right">
                    دورة تحفيظ القرآن الكريم
                  </CardTitle>
                  <CardDescription className="text-right">
                    15.02.2025
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 text-right mb-4">
                    مؤسسة التعليم الإسلامي
                  </p>
                  <Button size="sm" className="w-full bg-amber-600 hover:bg-amber-700">
                    التفاصيل
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-200 hover:border-green-400 transition-colors">
                <CardHeader>
                  <CardTitle className="text-green-800 text-right">
                    دورة المسبقة الرمضانية المستوى الأول
                  </CardTitle>
                  <CardDescription className="text-right">
                    01.03.2025
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 text-right mb-4">
                    المسبقات الإسلامية في المنصة
                  </p>
                  <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                    التفاصيل
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors">
                <CardHeader>
                  <CardTitle className="text-blue-800 text-right">
                    دورة المسبقة الرمضانية المستوى الثاني
                  </CardTitle>
                  <CardDescription className="text-right">
                    01.03.2025
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 text-right mb-4">
                    المسبقات الإسلامية في المنصة
                  </p>
                  <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                    التفاصيل
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-200 hover:border-purple-400 transition-colors">
                <CardHeader>
                  <CardTitle className="text-purple-800 text-right">
                    دورة المسبقة الرمضانية المستوى الثالث
                  </CardTitle>
                  <CardDescription className="text-right">
                    01.03.2025
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 text-right mb-4">
                    المسبقات الإسلامية في المنصة
                  </p>
                  <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700">
                    التفاصيل
                  </Button>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ما يمكننا فعله */}
      <div className="py-16 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="text-4xl font-bold text-amber-900 mb-8 font-amiri">
            ما يمكننا فعله من أجلك
          </h3>
          <div className="max-w-4xl mx-auto">
            <p className="text-lg text-amber-800 leading-relaxed mb-8">
              نحن هنا لنساعدك على تحقيق أهدافك الدينية والتعليمية. سواء كنت تسعى لحفظ القرآن الكريم، تعلم الفقه، أو تحسين علاقتك مع الله، فريقنا هنا لدعمك بكل ما تحتاجه. في كل خطوة على الطريق، نحن معك لتحقيق التميز والارتقاء الروحي. فهل أنت مستعد للانطلاق في رحلة العلم والإيمان؟ نحن هنا من أجلك!
            </p>
            <Button
              onClick={onRegisterClick}
              size="lg"
              className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-12 py-4 text-xl hover:from-amber-700 hover:to-orange-700"
            >
              انطلق معنا في الرحلة
            </Button>
          </div>
        </div>
      </div>

      {/* تعرّف على معلمينا */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="text-4xl font-bold text-amber-900 mb-4 font-amiri">
            تعرّف على معلمينا المميزين
          </h3>
          <p className="text-xl text-amber-700 mb-12">
            خبراء متخصصون متفانون يقودون نجاحنا
          </p>

          <Card className="max-w-2xl mx-auto border-2 border-amber-200">
            <CardHeader className="text-center">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-amber-200 to-orange-300 rounded-full flex items-center justify-center mb-4">
                <User className="w-16 h-16 text-amber-800" />
              </div>
              <CardTitle className="text-2xl text-amber-900">
                الشيخ أحمد عبدالعزيز
              </CardTitle>
              <CardDescription className="text-lg text-amber-700">
                مسؤول المنصة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-amber-800 leading-relaxed">
                يكرّس الشيخ أحمد جهوده لابتكار برامج تعليمية مخصّصة لكل طالب بما يتناسب مع تفضيلاته الفريدة.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* من نحن */}
      <div className="py-16 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-4xl font-bold text-amber-900 text-center mb-12 font-amiri">
            من نحن
          </h3>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-lg text-amber-800 leading-relaxed mb-8">
                مرحبًا بكم في بستان الإيمان، المنصة التي تُلهم القلوب وتنير العقول برحلة مميزة نحو العلم والإيمان. هنا تجدون مزيجًا متكاملاً بين تحفيظ القرآن الكريم، تعلم الفقه بأسلوب مبسط، والاستمتاع بألعاب رمضانية تعليمية مصممة خصيصًا للأطفال لتغرس فيهم القيم الدينية منذ الصغر.
              </p>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-amber-200">
                  <CardHeader>
                    <CardTitle className="text-amber-800 text-right">
                      رسالتنا
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-amber-700 text-right">
                      في بستان الإيمان، نؤمن بأن الإيمان يبدأ من القلب ويكبر بالعلم والعمل. رسالتنا هي أن نوفر لكل فرد فرصة لتعزيز علاقته بالله.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-orange-200">
                  <CardHeader>
                    <CardTitle className="text-orange-800 text-right">
                      رؤيتنا
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-orange-700 text-right">
                      أن نكون الوجهة الأولى لكل من يبحث عن تعليم ديني متكامل، يجمع بين الأصالة الإسلامية والأساليب التعليمية الحديثة.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-200 to-orange-300 rounded-xl p-8 flex items-center justify-center">
              <BookOpen className="w-48 h-48 text-amber-800" />
            </div>
          </div>
        </div>
      </div>

      {/* قيمنا */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-4xl font-bold text-amber-900 text-center mb-12 font-amiri">
            ما هي قيمنا؟
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center border-amber-200 hover:border-amber-400 transition-colors">
              <CardHeader>
                <div className="w-16 h-16 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  <Star className="w-8 h-8 text-amber-600" />
                </div>
                <CardTitle className="text-amber-800">الإخلاص</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-amber-700">
                  كل ما نقدمه يهدف إلى رضا الله
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-green-200 hover:border-green-400 transition-colors">
              <CardHeader>
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-green-800">الجودة</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-700">
                  نحرص على تقديم محتوى تعليمي وترفيهي بمستوى عالٍ من الاحترافية
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-blue-200 hover:border-blue-400 transition-colors">
              <CardHeader>
                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-blue-800">الشمولية</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-700">
                  نهتم بتلبية احتياجات جميع الفئات العمرية
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-purple-200 hover:border-purple-400 transition-colors">
              <CardHeader>
                <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Star className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-purple-800">الإبداع</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-purple-700">
                  نبتكر طرقًا جديدة تجمع بين التعليم والمتعة لتعزيز الإيمان
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* التزامنا */}
      <div className="py-16 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="text-4xl font-bold text-amber-900 mb-8 font-amiri">
            تعرف على التزامنا
          </h3>
          <div className="max-w-4xl mx-auto">
            <p className="text-lg text-amber-800 leading-relaxed mb-8">
              نحن في بستان الإيمان ملتزمون بأن نكون شريكك الدائم في رحلتك نحو رضا الله. هدفنا هو تقديم تجربة تعليمية فريدة تشعل شغفك بالدين، وتمنحك الأدوات اللازمة لنقل هذا الشغف إلى من حولك.
            </p>
            <p className="text-xl text-amber-900 font-bold mb-8">
              انضم إلينا اليوم وازرع في قلبك بذرة الإيمان، لتنمو وتُثمر نورًا وهداية!
            </p>
            <Button
              onClick={onRegisterClick}
              size="lg"
              className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-12 py-4 text-xl hover:from-amber-700 hover:to-orange-700"
            >
              ابدأ رحلتك معنا
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-amber-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center items-center mb-6">
            <BookOpen className="w-8 h-8 text-amber-200 ml-3" />
            <h4 className="text-2xl font-bold font-amiri">
              بستان الإيمان
            </h4>
          </div>
          <p className="text-amber-200 mb-4 text-lg">
            "وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ"
          </p>
          <p className="text-amber-300">
            المنصة الإسلامية للتحفيظ والتعليم • للتواصل: +966 54 994 7386
          </p>
        </div>
      </div>
    </div>
  );
}