import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { BookOpen, MapPin, Users, Clock, Award, ArrowRight, Library, ScrollText, Lightbulb } from 'lucide-react';

interface Trip {
  id: string;
  title: string;
  description: string;
  category: string;
  content: string;
  duration: string;
  difficulty: string;
  participants: number;
  icon: React.ComponentType<any>;
  gradient: string;
}

interface EducationalTripsPageProps {
  onBack: () => void;
  onRegisterClick?: () => void;
}

export function EducationalTripsPage({ onBack, onRegisterClick }: EducationalTripsPageProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedTrip, setExpandedTrip] = useState<string | null>(null);

  const trips: Trip[] = [
    // الفقه - Fiqh
    {
      id: 'fiqh-basics',
      title: 'أساسيات الفقه الإسلامي',
      description: 'رحلة شاملة في أساسيات الفقه وقواعده',
      category: 'fiqh',
      content: 'تعلم أساسيات الفقه الإسلامي من خلال دراسة النصوص الشرعية والقواعس الفقهية الأساسية. يشمل الدرس مقدمة عن الفقه وأصوله ومدارسه الفقهية الأربع.',
      duration: '8 أسابيع',
      difficulty: 'مبتدئ',
      participants: 450,
      icon: ScrollText,
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'fiqh-worship',
      title: 'فقه العبادات',
      description: 'دراسة تفصيلية لأحكام الصلاة والزكاة والحج والصوم',
      category: 'fiqh',
      content: 'رحلة معمقة في أحكام العبادات الخمس. تشمل الدراسة شروط الصلاة وأركانها وواجباتها وسننها، وأحكام الزكاة وأنواعها ومقاديرها، وأحكام الصوم والحج والعمرة.',
      duration: '12 أسبوع',
      difficulty: 'متوسط',
      participants: 380,
      icon: Library,
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      id: 'fiqh-transactions',
      title: 'فقه المعاملات',
      description: 'أحكام البيع والشراء والعقود والمعاملات المالية',
      category: 'fiqh',
      content: 'دراسة الأحكام الشرعية للمعاملات المالية منها البيع والشراء والإجارة والقرض والرهن والضمان والمضاربة والشركة. مع أمثلة عملية معاصرة.',
      duration: '10 أسابيع',
      difficulty: 'متوسط',
      participants: 320,
      icon: ScrollText,
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      id: 'fiqh-family',
      title: 'فقه الأسرة',
      description: 'أحكام الزواج والطلاق والنفقة والوصية',
      category: 'fiqh',
      content: 'رحلة في أحكام الزواج والمهر والعقد والشروط، والطلاق وأنواعه والعدة والحضانة والنفقة. دراسة شرعية معمقة بأدلة من القرآن والسنة.',
      duration: '9 أسابيع',
      difficulty: 'متوسط',
      participants: 410,
      icon: Award,
      gradient: 'from-rose-500 to-red-500'
    },
    // الحديث - Hadith
    {
      id: 'hadith-sahih-bukhari',
      title: 'شرح صحيح البخاري',
      description: 'دراسة الأحاديث الصحيحة من أصح كتاب بعد القرآن',
      category: 'hadith',
      content: 'رحلة معمقة في أحاديث صحيح البخاري. يتم شرح الأحاديث بطريقة سهلة وممتعة مع إيضاح الفوائد والدروس المستفادة من كل حديث.',
      duration: '16 أسبوع',
      difficulty: 'متوسط',
      participants: 520,
      icon: BookOpen,
      gradient: 'from-amber-500 to-orange-500'
    },
    {
      id: 'hadith-muslim',
      title: 'شرح صحيح مسلم',
      description: 'دراسة أحاديث صحيح مسلم الموثوقة والصحيحة',
      category: 'hadith',
      content: 'دراسة شاملة لأحاديث صحيح مسلم مع شرح لكل حديث وتوضيح معانيه والفوائد المستخلصة منه. يركز على الأحاديث ذات الصلة بالعقيدة والأحكام.',
      duration: '16 أسبوع',
      difficulty: 'متوسط',
      participants: 480,
      icon: ScrollText,
      gradient: 'from-indigo-500 to-purple-500'
    },
    {
      id: 'hadith-sunan',
      title: 'دراسة السنن الأربع',
      description: 'سنن الترمذي والنسائي وأبو داود وابن ماجه',
      category: 'hadith',
      content: 'رحلة شاملة في السنن الأربع مع دراسة الأحاديث المهمة والعمل بها. يتناول الدرس أحاديث الحج والعمرة والسفر والجهاد والعلم والأخلاق والآداب.',
      duration: '14 أسبوع',
      difficulty: 'متقدم',
      participants: 290,
      icon: Library,
      gradient: 'from-teal-500 to-cyan-500'
    },
    {
      id: 'hadith-methodology',
      title: 'علم مصطلح الحديث',
      description: 'فهم قواعد تصحيح وتضعيف الأحاديث',
      category: 'hadith',
      content: 'دراسة علم الحديث ومصطلحاته مثل الإسناد والمتن والضعيف والصحيح والحسن والموضوع. كيفية التمييز بين الحديث الصحيح والضعيف والموضوع.',
      duration: '8 أسابيع',
      difficulty: 'متقدم',
      participants: 210,
      icon: Lightbulb,
      gradient: 'from-yellow-500 to-amber-500'
    },
    // الكتب الإسلامية
    {
      id: 'books-ihya',
      title: 'شرح إحياء علوم الدين',
      description: 'دراسة أعظم كتب التراث الإسلامي للإمام الغزالي',
      category: 'books',
      content: 'رحلة في أعظم كتب التراث الإسلامي. يتناول الكتاب العبادات والمعاملات والعادات والمنهيات مع التركيز على الناحية الروحية والأخلاقية.',
      duration: '20 أسبوع',
      difficulty: 'متقدم',
      participants: 150,
      icon: BookOpen,
      gradient: 'from-rose-500 to-pink-500'
    },
    {
      id: 'books-mukaddimah',
      title: 'شرح مقدمة ابن خلدون',
      description: 'دراسة المقدمة العظيمة في التاريخ والعمران',
      category: 'books',
      content: 'دراسة مقدمة ابن خلدون الشهيرة في التاريخ والعمران والحضارة. فهم مراحل تطور الحضارات وقوانين العمران والسياسة والاقتصاد.',
      duration: '12 أسبوع',
      difficulty: 'متقدم',
      participants: 120,
      icon: Library,
      gradient: 'from-blue-500 to-indigo-500'
    },
    {
      id: 'books-risalah',
      title: 'رسائل ذات معنى',
      description: 'مختارات من الرسائل الإسلامية المهمة',
      category: 'books',
      content: 'دراسة رسائل إسلامية مختارة تتناول موضوعات متنوعة من العقيدة والفقه والأخلاق والتربية. كل رسالة تقدم معنى عميق وفائدة تطبيقية.',
      duration: '10 أسابيع',
      difficulty: 'متوسط',
      participants: 180,
      icon: ScrollText,
      gradient: 'from-green-500 to-teal-500'
    },
    // العلوم الإسلامية
    {
      id: 'aqeedah-basics',
      title: 'أساسيات العقيدة الإسلامية',
      description: 'دراسة أركان الإيمان والعقائد الأساسية',
      category: 'studies',
      content: 'رحلة تأسيسية في العقيدة الإسلامية. تشمل التوحيد وأقسامه والشرك وأنواعه والإيمان والإسلام والدين. دراسة العقائد من خلال نصوص القرآن والسنة.',
      duration: '8 أسابيع',
      difficulty: 'مبتدئ',
      participants: 650,
      icon: Award,
      gradient: 'from-emerald-500 to-green-500'
    },
    {
      id: 'tawheed-advanced',
      title: 'التوحيد المتقدم',
      description: 'دراسة معمقة لأنواع التوحيد الثلاثة',
      category: 'studies',
      content: 'دراسة متقدمة لتوحيد الربوبية وتوحيد الألوهية وتوحيد الأسماء والصفات. شرح الفروق بينها والأدلة من القرآن والسنة والإجماع.',
      duration: '10 أسابيع',
      difficulty: 'متقدم',
      participants: 280,
      icon: Lightbulb,
      gradient: 'from-purple-500 to-violet-500'
    },
    {
      id: 'quran-sciences',
      title: 'علوم القرآن الكريم',
      description: 'دراسة علوم القرآن والتفسير والقراءات',
      category: 'studies',
      content: 'رحلة شاملة في علوم القرآن تشمل الوحي والنسخ والإعجاز والمكي والمدني والناسخ والمنسوخ والقراءات القرآنية والتفسير.',
      duration: '12 أسبوع',
      difficulty: 'متقدم',
      participants: 340,
      icon: BookOpen,
      gradient: 'from-cyan-500 to-blue-500'
    },
    {
      id: 'tafseer-juz',
      title: 'تفسير أجزاء من القرآن',
      description: 'شرح تفصيلي لأجزاء مختلفة من القرآن الكريم',
      category: 'studies',
      content: 'دراسة تفسيرية معمقة لأجزاء محددة من القرآن الكريم. يتم التركيز على المعاني والدروس والأحكام المستفادة من كل آية.',
      duration: '14 أسبوع',
      difficulty: 'متوسط',
      participants: 400,
      icon: ScrollText,
      gradient: 'from-orange-500 to-amber-500'
    },
  ];

  const categories = [
    { id: 'all', label: 'جميع الرحلات', icon: MapPin },
    { id: 'fiqh', label: 'الفقه الإسلامي', icon: Library },
    { id: 'hadith', label: 'علم الحديث', icon: BookOpen },
    { id: 'books', label: 'الكتب الإسلامية', icon: ScrollText },
    { id: 'studies', label: 'العلوم الإسلامية', icon: Lightbulb },
  ];

  const filteredTrips = selectedCategory === 'all' 
    ? trips 
    : trips.filter(trip => trip.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={onBack}
            className="mb-6 flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            data-testid="button-back-trips"
          >
            <ArrowRight className="w-5 h-5" />
            العودة للخلف
          </button>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-arabic-serif">الرحلات التعليمية</h1>
          <p className="text-lg text-white/90 max-w-2xl">استكشف رحلات تعليمية شاملة في الفقه والحديث والعلوم الإسلامية</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Category Filter */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 font-arabic-serif">اختر المجال الذي تهتم به</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <motion.button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center justify-center gap-2 p-4 rounded-lg font-arabic-sans font-bold transition-all duration-300 ${
                    selectedCategory === cat.id
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                      : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-amber-300'
                  }`}
                  data-testid={`filter-category-${cat.id}`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{cat.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Trips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip, index) => {
            const Icon = trip.icon;
            const isExpanded = expandedTrip === trip.id;
            
            return (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                data-testid={`trip-card-${trip.id}`}
              >
                <Card className={`h-full hover:shadow-xl transition-all duration-300 cursor-pointer border-2 ${
                  isExpanded ? 'border-amber-400' : 'border-gray-200'
                }`}>
                  <CardHeader>
                    <div className={`inline-flex w-12 h-12 bg-gradient-to-br ${trip.gradient} rounded-lg items-center justify-center mb-3`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl font-arabic-sans">{trip.title}</CardTitle>
                    <CardDescription className="text-gray-600 font-arabic-sans">{trip.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span>{trip.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Users className="w-4 h-4 text-amber-600" />
                        <span>{trip.participants} طالب</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                          trip.difficulty === 'مبتدئ' ? 'bg-green-100 text-green-800' :
                          trip.difficulty === 'متوسط' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {trip.difficulty}
                        </span>
                      </div>
                    </div>

                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-amber-50 p-4 rounded-lg mb-4 text-sm text-gray-700 border border-amber-200"
                      >
                        {trip.content}
                      </motion.div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        onClick={() => setExpandedTrip(isExpanded ? null : trip.id)}
                        variant="outline"
                        size="sm"
                        className="flex-1 font-arabic-sans"
                        data-testid={`button-expand-${trip.id}`}
                      >
                        {isExpanded ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
                      </Button>
                      <Button
                        onClick={onRegisterClick}
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-arabic-sans hover:shadow-lg"
                        data-testid={`button-enroll-${trip.id}`}
                      >
                        الالتحاق الآن
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-16 bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl p-8 border-2 border-amber-200"
        >
          <h2 className="text-3xl font-bold text-amber-900 mb-8 text-center font-arabic-serif">إحصائيات منصتنا التعليمية</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-amber-600 mb-2">{trips.length}+</p>
              <p className="text-lg text-amber-900 font-arabic-sans">رحلة تعليمية</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-amber-600 mb-2">{trips.reduce((sum, t) => sum + t.participants, 0).toLocaleString()}</p>
              <p className="text-lg text-amber-900 font-arabic-sans">طالب مسجل</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-amber-600 mb-2">100%</p>
              <p className="text-lg text-amber-900 font-arabic-sans">معتمدة شرعياً</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
