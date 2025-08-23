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
                  تعرف علينا
                </h1>
                <p className="text-amber-200 text-sm md:text-lg">
                  تعرف على بستان الإيمان ورسالتنا
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
          {/* من نحن */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-amber-900 text-center mb-8 font-amiri">
              من نحن
            </h2>
            
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
          </motion.div>

          {/* قيمنا */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-amber-900 text-center mb-8 font-amiri">
              ما هي قيمنا؟
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="text-center border-amber-200 hover:border-amber-400 transition-colors">
                <CardHeader>
                  <div className="w-16 h-16 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-4">
                    <BookOpen className="w-8 h-8 text-amber-600" />
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
                    <BookOpen className="w-8 h-8 text-blue-600" />
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
                    <BookOpen className="w-8 h-8 text-purple-600" />
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
          </motion.div>

          {/* التزامنا */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center bg-white rounded-xl p-8 shadow-lg"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-amber-900 mb-8 font-amiri">
              تعرف على التزامنا
            </h2>
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-amber-800 leading-relaxed mb-8">
                نحن في بستان الإيمان ملتزمون بأن نكون شريكك الدائم في رحلتك نحو رضا الله. هدفنا هو تقديم تجربة تعليمية فريدة تشعل شغفك بالدين، وتمنحك الأدوات اللازمة لنقل هذا الشغف إلى من حولك.
              </p>
              <p className="text-xl text-amber-900 font-bold mb-8">
                انضم إلينا اليوم وازرع في قلبك بذرة الإيمان، لتنمو وتُثمر نورًا وهداية!
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}