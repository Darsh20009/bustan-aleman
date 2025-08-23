import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

interface HomepageProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onQuranReader: () => void;
}

export function Homepage({ onLoginClick, onRegisterClick, onQuranReader }: HomepageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-4"
          >
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <svg viewBox="0 0 200 200" className="w-8 h-8 text-white">
                <polygon
                  points="100,20 120,70 170,70 130,110 150,160 100,130 50,160 70,110 30,70 80,70"
                  fill="currentColor"
                />
                <circle cx="100" cy="100" r="15" fill="white" opacity="0.9" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ fontFamily: 'Amiri, serif' }}>
                بستان الإيمان
              </h1>
              <p className="text-blue-200">
                منصة تحفيظ القرآن الكريم الإبداعية
              </p>
            </div>
          </motion.div>

          <div className="flex items-center space-x-4">
            <Button
              onClick={onLoginClick}
              className="bg-white/20 hover:bg-white/30 text-white border-0"
            >
              تسجيل الدخول
            </Button>
            <Button
              onClick={onRegisterClick}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              إنشاء حساب
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center py-16"
        >
          <h2 className="text-5xl font-bold text-blue-800 mb-6" style={{ fontFamily: 'Amiri, serif' }}>
            أهلاً وسهلاً بك في بستان الإيمان
          </h2>
          <p className="text-xl text-blue-600 mb-8 max-w-3xl mx-auto">
            منصة تعليمية متطورة لحفظ القرآن الكريم مع نظام متابعة شخصي لكل طالب
            وقارئ قرآن تفاعلي مع إمكانيات حفظ التقدم محلياً
          </p>
          
          <div className="flex justify-center space-x-4">
            <Button
              onClick={onQuranReader}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 text-lg"
            >
              📖 اقرأ القرآن الكريم
            </Button>
            <Button
              onClick={onRegisterClick}
              size="lg"
              variant="outline"
              className="border-blue-300 text-blue-700 px-8 py-4 text-lg hover:bg-blue-50"
            >
              🌟 ابدأ رحلة الحفظ
            </Button>
          </div>
        </motion.div>

        {/* Features Section */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm h-full">
              <CardHeader>
                <CardTitle className="text-blue-700 flex items-center text-xl">
                  🎯 متابعة شخصية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  نظام متابعة فردي لكل طالب مع تسجيل الأخطاء والتقدم والمراجعات
                  وإحصائيات مفصلة عن مستوى الحفظ
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm h-full">
              <CardHeader>
                <CardTitle className="text-blue-700 flex items-center text-xl">
                  📱 تواصل عبر الواتساب
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  نظام تواصل مباشر عبر الواتساب لإرسال التحديثات وطلبات التجديد
                  والتواصل مع الإدارة
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm h-full">
              <CardHeader>
                <CardTitle className="text-blue-700 flex items-center text-xl">
                  💾 حفظ محلي للبيانات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  حفظ تقدم الطالب وأخطاءه ومراجعاته محلياً في جهازه الشخصي
                  لضمان الخصوصية والأمان
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Demo Accounts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white/70 backdrop-blur-sm rounded-xl p-8 shadow-lg"
        >
          <h3 className="text-2xl font-bold text-blue-800 mb-6 text-center" style={{ fontFamily: 'Amiri, serif' }}>
            جرب النظام بحسابات تجريبية
          </h3>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-700">👑 يوسف درويش - مستوى متقدم</CardTitle>
                <CardDescription>
                  طالب في الثاني الثانوي، حافظ سورة البقرة وآل عمران
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p><strong>الإيميل:</strong> yousef.darwish@example.com</p>
                  <p><strong>كلمة السر:</strong> 182009</p>
                  <p><strong>المميزات:</strong> 16 حصة شهرياً، جدول مكثف، متابعة الأخطاء</p>
                </div>
                <Button
                  onClick={onLoginClick}
                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                >
                  تسجيل الدخول كيوسف
                </Button>
              </CardContent>
            </Card>

            <Card className="border border-green-200">
              <CardHeader>
                <CardTitle className="text-green-700">🌱 محمد أحمد - مبتدئ</CardTitle>
                <CardDescription>
                  طالب مبتدئ، سيبدأ من سورة الناس والفلق والإخلاص
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p><strong>الإيميل:</strong> mohamed.ahmed@example.com</p>
                  <p><strong>كلمة السر:</strong> 123789</p>
                  <p><strong>المميزات:</strong> 8 حصص شهرياً، جدول مخفف، بداية التعلم</p>
                </div>
                <Button
                  onClick={onLoginClick}
                  className="w-full mt-4 bg-green-600 hover:bg-green-700"
                >
                  تسجيل الدخول كمحمد
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="text-center py-16"
        >
          <h3 className="text-3xl font-bold text-blue-800 mb-4" style={{ fontFamily: 'Amiri, serif' }}>
            ابدأ رحلتك في حفظ القرآن الكريم اليوم
          </h3>
          <p className="text-lg text-blue-600 mb-8">
            انضم إلى آلاف الطلاب الذين يحفظون القرآن الكريم معنا
          </p>
          <Button
            onClick={onRegisterClick}
            size="lg"
            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-12 py-4 text-xl"
          >
            🚀 سجل الآن مجاناً
          </Button>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="bg-blue-800 text-white p-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex justify-center items-center mb-4">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center mr-3">
              <svg viewBox="0 0 200 200" className="w-5 h-5 text-white">
                <polygon
                  points="100,20 120,70 170,70 130,110 150,160 100,130 50,160 70,110 30,70 80,70"
                  fill="currentColor"
                />
              </svg>
            </div>
            <h4 className="text-xl font-bold" style={{ fontFamily: 'Amiri, serif' }}>
              بستان الإيمان
            </h4>
          </div>
          <p className="text-blue-200 mb-4">
            "وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ"
          </p>
          <p className="text-blue-300 text-sm">
            منصة تحفيظ القرآن الكريم • للتواصل: +966 54 994 7386
          </p>
        </div>
      </div>
    </div>
  );
}