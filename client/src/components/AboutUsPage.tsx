import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { BookOpen, ArrowRight } from 'lucide-react';

interface AboutUsPageProps {
  onBack: () => void;
}

export function AboutUsPage({ onBack }: AboutUsPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-emerald-50/30 to-orange-50/30" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-2 md:px-4 py-6">
          <div className="flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2 md:space-x-4 space-x-reverse"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-full flex items-center justify-center ml-2 md:ml-4 shadow-lg">
                <BookOpen className="w-6 h-6 md:w-10 md:h-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-4xl font-bold font-arabic-serif">
                  تعرف علينا
                </h1>
                <p className="text-white/90 text-sm md:text-lg font-arabic-sans">
                  تعرف على بستان الإيمان ورسالتنا
                </p>
              </div>
            </motion.div>

            <Button
              onClick={onBack}
              className="bg-white/20 hover:bg-white/30 text-white border-0 px-4 py-2 text-sm md:px-6 md:text-base font-arabic-sans"
              data-testid="button-back-to-home"
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
          {/* من نحن */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-emerald-600 text-center mb-8 font-arabic-serif">
              من نحن
            </h2>
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-lg text-gray-700 leading-relaxed mb-8 font-arabic-sans">
                  مرحبًا بكم في بستان الإيمان، المنصة التي تُلهم القلوب وتنير العقول برحلة مميزة نحو العلم والإيمان. هنا تجدون مزيجًا متكاملاً بين تحفيظ القرآن الكريم، تعلم الفقه بأسلوب مبسط، والاستمتاع بألعاب رمضانية تعليمية مصممة خصيصًا للأطفال لتغرس فيهم القيم الدينية منذ الصغر.
                </p>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="border-2 border-emerald-100 hover:shadow-xl transition-all">
                    <CardHeader>
                      <CardTitle className="text-emerald-600 text-right font-arabic-serif">
                        رسالتنا
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 text-right font-arabic-sans leading-relaxed">
                        في بستان الإيمان، نؤمن بأن الإيمان يبدأ من القلب ويكبر بالعلم والعمل. رسالتنا هي أن نوفر لكل فرد فرصة لتعزيز علاقته بالله.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-orange-100 hover:shadow-xl transition-all">
                    <CardHeader>
                      <CardTitle className="text-orange-600 text-right font-arabic-serif">
                        رؤيتنا
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 text-right font-arabic-sans leading-relaxed">
                        أن نكون الوجهة الأولى لكل من يبحث عن تعليم ديني متكامل، يجمع بين الأصالة الإسلامية والأساليب التعليمية الحديثة.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-8 flex items-center justify-center shadow-xl">
                <BookOpen className="w-48 h-48 text-white" />
              </div>
            </div>
          </motion.div>

          {/* قيمنا */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-emerald-600 text-center mb-8 font-arabic-serif">
              ما هي قيمنا؟
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="text-center border-2 border-emerald-100 hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-emerald-600 font-arabic-serif">الإخلاص</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 font-arabic-sans">
                    كل ما نقدمه يهدف إلى رضا الله
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center border-2 border-emerald-100 hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-emerald-600 font-arabic-serif">الجودة</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 font-arabic-sans">
                    نحرص على تقديم محتوى تعليمي وترفيهي بمستوى عالٍ من الاحترافية
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center border-2 border-emerald-100 hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-emerald-600 font-arabic-serif">الشمولية</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 font-arabic-sans">
                    نهتم بتلبية احتياجات جميع الفئات العمرية
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center border-2 border-orange-100 hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-orange-600 font-arabic-serif">الإبداع</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 font-arabic-sans">
                    نبتكر طرقًا جديدة تجمع بين التعليم والمتعة لتعزيز الإيمان
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* التزامنا */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center bg-white rounded-xl p-8 shadow-xl border-2 border-emerald-100"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-emerald-600 mb-8 font-arabic-serif">
              تعرف على التزامنا
            </h2>
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-gray-700 leading-relaxed mb-8 font-arabic-sans">
                نحن في بستان الإيمان ملتزمون بأن نكون شريكك الدائم في رحلتك نحو رضا الله. هدفنا هو تقديم تجربة تعليمية فريدة تشعل شغفك بالدين، وتمنحك الأدوات اللازمة لنقل هذا الشغف إلى من حولك.
              </p>
              <p className="text-xl text-emerald-600 font-bold mb-8 font-arabic-serif">
                انضم إلينا اليوم وازرع في قلبك بذرة الإيمان، لتنمو وتُثمر نورًا وهداية!
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}