
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { BookOpen, ArrowRight, Calendar, Users, Clock, Award, Search, Filter, MapPin, Target, BookMarked, GraduationCap, Landmark, Scroll } from 'lucide-react';
import { Input } from '../components/ui/input';

interface EducationalTrip {
  id: string;
  titleAr: string;
  descriptionAr: string;
  category: 'fiqh' | 'hadith' | 'quran' | 'books' | 'history';
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  targetAudience: string;
  image: string;
  topics: string[];
  instructor: string;
  price: number;
  maxParticipants: number;
  currentParticipants: number;
}

interface EducationalTripsPageProps {
  onBack: () => void;
  onRegisterClick?: () => void;
}

const educationalTrips: EducationalTrip[] = [
  // Fiqh Trips
  {
    id: 'fiqh-tahara',
    titleAr: 'رحلة الطهارة والوضوء',
    descriptionAr: 'رحلة تعليمية شاملة في أحكام الطهارة والوضوء والغسل والتيمم، مع التطبيق العملي والأدلة الشرعية',
    category: 'fiqh',
    duration: '3 أسابيع',
    difficulty: 'beginner',
    targetAudience: 'المبتدئين والراغبين في تعلم أحكام الطهارة',
    image: '💧',
    topics: ['الوضوء', 'الغسل', 'التيمم', 'النجاسات', 'أحكام الحيض'],
    instructor: 'الشيخ أحمد الفقيه',
    price: 0,
    maxParticipants: 50,
    currentParticipants: 32
  },
  {
    id: 'fiqh-salah',
    titleAr: 'رحلة الصلاة والخشوع',
    descriptionAr: 'دراسة متعمقة في أحكام الصلاة وشروطها وأركانها وسننها، مع التركيز على الخشوع والطمأنينة',
    category: 'fiqh',
    duration: '4 أسابيع',
    difficulty: 'intermediate',
    targetAudience: 'من أتقن أحكام الطهارة ويريد إتقان الصلاة',
    image: '🕌',
    topics: ['شروط الصلاة', 'أركان الصلاة', 'واجبات الصلاة', 'سنن الصلاة', 'الخشوع'],
    instructor: 'الشيخ محمد العابد',
    price: 150,
    maxParticipants: 40,
    currentParticipants: 28
  },
  {
    id: 'fiqh-zakat',
    titleAr: 'رحلة الزكاة والصدقات',
    descriptionAr: 'تعلم أحكام الزكاة في المال والذهب والفضة والتجارة والزروع، مع الحسابات العملية',
    category: 'fiqh',
    duration: '2 أسابيع',
    difficulty: 'intermediate',
    targetAudience: 'أصحاب الأموال والتجار والمزارعين',
    image: '💰',
    topics: ['زكاة المال', 'زكاة الذهب والفضة', 'زكاة التجارة', 'زكاة الزروع', 'مصارف الزكاة'],
    instructor: 'الشيخ عبدالله المحتسب',
    price: 100,
    maxParticipants: 35,
    currentParticipants: 20
  },
  {
    id: 'fiqh-hajj',
    titleAr: 'رحلة الحج والعمرة',
    descriptionAr: 'دليل شامل لأداء فريضة الحج والعمرة بطريقة صحيحة، مع المناسك والأدعية والآداب',
    category: 'fiqh',
    duration: '5 أسابيع',
    difficulty: 'advanced',
    targetAudience: 'المقبلين على الحج والعمرة',
    image: '🕋',
    topics: ['أنواع النسك', 'الإحرام', 'الطواف', 'السعي', 'الوقوف بعرفة', 'المبيت بمزدلفة'],
    instructor: 'الشيخ حسن الحاج',
    price: 200,
    maxParticipants: 30,
    currentParticipants: 18
  },
  {
    id: 'fiqh-wills',
    titleAr: 'رحلة المواريث والوصايا',
    descriptionAr: 'علم الفرائض وأحكام المواريث والوصايا والأوقاف، مع الحالات العملية والحسابات',
    category: 'fiqh',
    duration: '6 أسابيع',
    difficulty: 'advanced',
    targetAudience: 'طلاب العلم والمتخصصين',
    image: '📜',
    topics: ['علم الفرائض', 'أصحاب الفروض', 'العصبات', 'الحجب', 'المسائل العملية'],
    instructor: 'الشيخ يوسف الفرضي',
    price: 250,
    maxParticipants: 25,
    currentParticipants: 15
  },

  // Hadith Trips
  {
    id: 'hadith-bukhari',
    titleAr: 'رحلة صحيح البخاري',
    descriptionAr: 'دراسة منهجية لأصح كتاب بعد كتاب الله، مع شرح الأحاديث وفقهها وفوائدها',
    category: 'hadith',
    duration: '12 أسبوعاً',
    difficulty: 'intermediate',
    targetAudience: 'طلاب الحديث والراغبين في دراسة الصحيح',
    image: '📚',
    topics: ['بدء الوحي', 'كتاب الإيمان', 'كتاب العلم', 'الطهارة', 'الصلاة'],
    instructor: 'الشيخ إبراهيم المحدث',
    price: 300,
    maxParticipants: 40,
    currentParticipants: 35
  },
  {
    id: 'hadith-muslim',
    titleAr: 'رحلة صحيح مسلم',
    descriptionAr: 'رحلة في ثاني أصح كتب الحديث، مع التركيز على الأحاديث الفريدة ومنهج الإمام مسلم',
    category: 'hadith',
    duration: '10 أسابيع',
    difficulty: 'intermediate',
    targetAudience: 'من أتم دراسة صحيح البخاري',
    image: '📖',
    topics: ['كتاب الإيمان', 'كتاب الطهارة', 'كتاب الصلاة', 'كتاب الزكاة', 'كتاب الحج'],
    instructor: 'الشيخ عمر الحديثي',
    price: 280,
    maxParticipants: 35,
    currentParticipants: 30
  },
  {
    id: 'hadith-arbain',
    titleAr: 'رحلة الأربعين النووية',
    descriptionAr: 'حفظ وشرح الأربعين حديثاً النووية التي تجمع أصول الدين وفروعه',
    category: 'hadith',
    duration: '4 أسابيع',
    difficulty: 'beginner',
    targetAudience: 'المبتدئين في طلب الحديث',
    image: '✨',
    topics: ['الأحاديث الأربعين', 'حفظ الأحاديث', 'شرح الأحاديث', 'فقه الأحاديث'],
    instructor: 'الشيخ خالد الناصح',
    price: 0,
    maxParticipants: 60,
    currentParticipants: 45
  },
  {
    id: 'hadith-terminology',
    titleAr: 'رحلة علوم الحديث',
    descriptionAr: 'دراسة مصطلح الحديث ومعرفة الصحيح من الضعيف والموضوع',
    category: 'hadith',
    duration: '8 أسابيع',
    difficulty: 'advanced',
    targetAudience: 'طلاب العلم المتقدمين',
    image: '🔍',
    topics: ['الحديث الصحيح', 'الحديث الحسن', 'الحديث الضعيف', 'الموضوعات', 'علل الحديث'],
    instructor: 'الشيخ سعيد العليم',
    price: 220,
    maxParticipants: 30,
    currentParticipants: 22
  },

  // Quran Trips
  {
    id: 'quran-tafseer',
    titleAr: 'رحلة تفسير القرآن',
    descriptionAr: 'دراسة منهجية لتفسير القرآن الكريم مع التركيز على أسباب النزول ومعاني الآيات',
    category: 'quran',
    duration: '16 أسبوعاً',
    difficulty: 'intermediate',
    targetAudience: 'الحفاظ والراغبين في فهم القرآن',
    image: '📗',
    topics: ['أصول التفسير', 'تفسير جزء عم', 'أسباب النزول', 'الناسخ والمنسوخ'],
    instructor: 'الشيخ محمود المفسر',
    price: 350,
    maxParticipants: 45,
    currentParticipants: 40
  },
  {
    id: 'quran-tajweed',
    titleAr: 'رحلة إتقان التجويد',
    descriptionAr: 'تعلم أحكام التجويد النظرية والعملية لإتقان قراءة القرآن الكريم',
    category: 'quran',
    duration: '6 أسابيع',
    difficulty: 'beginner',
    targetAudience: 'المبتدئين في تعلم القرآن',
    image: '🎵',
    topics: ['المخارج', 'الصفات', 'الأحكام', 'المدود', 'الوقف والابتداء'],
    instructor: 'الشيخ فهد المقرئ',
    price: 180,
    maxParticipants: 50,
    currentParticipants: 42
  },
  {
    id: 'quran-memorization',
    titleAr: 'رحلة حفظ القرآن الكريم',
    descriptionAr: 'برنامج منهجي لحفظ القرآن الكريم مع المراجعة والتثبيت',
    category: 'quran',
    duration: '24 شهراً',
    difficulty: 'beginner',
    targetAudience: 'الراغبين في حفظ القرآن الكريم',
    image: '🌟',
    topics: ['منهج الحفظ', 'طرق التثبيت', 'المراجعة', 'الربط'],
    instructor: 'الشيخ عبدالرحمن الحافظ',
    price: 500,
    maxParticipants: 30,
    currentParticipants: 25
  },

  // Islamic Books Trips
  {
    id: 'books-aqeedah',
    titleAr: 'رحلة العقيدة الصحيحة',
    descriptionAr: 'دراسة كتب العقيدة الإسلامية الصحيحة مثل كتاب التوحيد والواسطية',
    category: 'books',
    duration: '8 أسابيع',
    difficulty: 'intermediate',
    targetAudience: 'طلاب العلم',
    image: '🏛️',
    topics: ['كتاب التوحيد', 'العقيدة الواسطية', 'أصول الإيمان الستة', 'شروط لا إله إلا الله'],
    instructor: 'الشيخ صالح العقدي',
    price: 200,
    maxParticipants: 40,
    currentParticipants: 30
  },
  {
    id: 'books-seerah',
    titleAr: 'رحلة السيرة النبوية',
    descriptionAr: 'دراسة شاملة لسيرة النبي محمد ﷺ من المولد إلى الوفاة',
    category: 'books',
    duration: '12 أسبوعاً',
    difficulty: 'beginner',
    targetAudience: 'جميع المسلمين',
    image: '🌙',
    topics: ['المولد والنشأة', 'البعثة', 'الهجرة', 'الغزوات', 'فتح مكة', 'حجة الوداع'],
    instructor: 'الشيخ ماجد السيري',
    price: 0,
    maxParticipants: 80,
    currentParticipants: 65
  },
  {
    id: 'books-adab',
    titleAr: 'رحلة الآداب الإسلامية',
    descriptionAr: 'دراسة كتب الآداب الشرعية والأخلاق الإسلامية العملية',
    category: 'books',
    duration: '5 أسابيع',
    difficulty: 'beginner',
    targetAudience: 'الأسر والمربين',
    image: '🌺',
    topics: ['آداب الطعام', 'آداب النوم', 'آداب المجلس', 'حقوق الجار', 'بر الوالدين'],
    instructor: 'الشيخ راشد المربي',
    price: 120,
    maxParticipants: 55,
    currentParticipants: 40
  },

  // Islamic History Trips
  {
    id: 'history-khulafa',
    titleAr: 'رحلة الخلفاء الراشدين',
    descriptionAr: 'دراسة سيرة الخلفاء الراشدين الأربعة وإنجازاتهم',
    category: 'history',
    duration: '6 أسابيع',
    difficulty: 'beginner',
    targetAudience: 'محبو التاريخ الإسلامي',
    image: '👑',
    topics: ['أبو بكر الصديق', 'عمر بن الخطاب', 'عثمان بن عفان', 'علي بن أبي طالب'],
    instructor: 'الدكتور طارق المؤرخ',
    price: 150,
    maxParticipants: 50,
    currentParticipants: 38
  },
  {
    id: 'history-andalus',
    titleAr: 'رحلة الأندلس الإسلامية',
    descriptionAr: 'تاريخ الحضارة الإسلامية في الأندلس من الفتح إلى السقوط',
    category: 'history',
    duration: '7 أسابيع',
    difficulty: 'intermediate',
    targetAudience: 'المهتمين بالحضارة الإسلامية',
    image: '🏰',
    topics: ['الفتح الإسلامي', 'عصر الخلافة', 'ملوك الطوائف', 'المرابطون', 'الموحدون', 'السقوط'],
    instructor: 'الدكتور نبيل الأندلسي',
    price: 180,
    maxParticipants: 45,
    currentParticipants: 35
  },
  {
    id: 'history-ottoman',
    titleAr: 'رحلة الدولة العثمانية',
    descriptionAr: 'تاريخ الدولة العثمانية من النشأة حتى السقوط وإنجازاتها',
    category: 'history',
    duration: '8 أسابيع',
    difficulty: 'intermediate',
    targetAudience: 'دارسو التاريخ الإسلامي',
    image: '⚔️',
    topics: ['النشأة', 'الفتوحات', 'فتح القسطنطينية', 'العصر الذهبي', 'الضعف والانحلال'],
    instructor: 'الدكتور عثمان التركي',
    price: 190,
    maxParticipants: 40,
    currentParticipants: 32
  }
];

const categories = [
  { id: 'all', nameAr: 'جميع الرحلات', icon: GraduationCap, color: 'from-islamic-emerald to-islamic-teal' },
  { id: 'fiqh', nameAr: 'الفقه الإسلامي', icon: BookMarked, color: 'from-persian-blue to-royal-gold' },
  { id: 'hadith', nameAr: 'علوم الحديث', icon: Scroll, color: 'from-copper-bronze to-desert-sand' },
  { id: 'quran', nameAr: 'علوم القرآن', icon: BookOpen, color: 'from-islamic-emerald to-persian-blue' },
  { id: 'books', nameAr: 'الكتب الإسلامية', icon: Award, color: 'from-royal-gold to-copper-bronze' },
  { id: 'history', nameAr: 'التاريخ الإسلامي', icon: Landmark, color: 'from-islamic-teal to-islamic-emerald' }
];

const difficultyLevels = {
  beginner: { nameAr: 'مبتدئ', color: 'bg-green-100 text-green-800' },
  intermediate: { nameAr: 'متوسط', color: 'bg-blue-100 text-blue-800' },
  advanced: { nameAr: 'متقدم', color: 'bg-purple-100 text-purple-800' }
};

export function EducationalTripsPage({ onBack, onRegisterClick }: EducationalTripsPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTrips = educationalTrips.filter(trip => {
    const matchesCategory = selectedCategory === 'all' || trip.category === selectedCategory;
    const matchesSearch = trip.titleAr.includes(searchQuery) || 
                         trip.descriptionAr.includes(searchQuery) ||
                         trip.topics.some(topic => topic.includes(searchQuery));
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.icon || BookOpen;
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.color || 'from-gray-400 to-gray-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pearl-cream via-desert-sand to-warm-white" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-islamic-emerald via-islamic-teal to-persian-blue text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-royal-gold to-copper-bronze rounded-full flex items-center justify-center shadow-xl">
                <MapPin className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold font-arabic-serif">
                  الرحلات التعليمية
                </h1>
                <p className="text-emerald-100 text-lg font-arabic-sans mt-1">
                  رحلات علمية شاملة في العلوم الإسلامية
                </p>
              </div>
            </motion.div>

            <Button
              onClick={onBack}
              className="bg-white/20 hover:bg-white/30 border-0 backdrop-blur-sm font-arabic-sans"
            >
              <ArrowRight className="ml-2 h-5 w-5" />
              العودة
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="ابحث عن رحلة تعليمية..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-12 py-6 text-lg bg-white/90 backdrop-blur-sm border-white/30 font-arabic-sans"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-islamic-emerald" />
            <h2 className="text-xl font-bold text-islamic-emerald font-arabic-serif">
              تصنيف الرحلات
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <motion.button
                  key={category.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedCategory === category.id
                      ? `bg-gradient-to-r ${category.color} text-white border-transparent shadow-lg`
                      : 'bg-white border-gray-200 text-gray-700 hover:border-islamic-emerald'
                  }`}
                >
                  <Icon className={`w-6 h-6 mx-auto mb-2 ${
                    selectedCategory === category.id ? 'text-white' : 'text-islamic-emerald'
                  }`} />
                  <span className="text-sm font-arabic-sans font-bold block">
                    {category.nameAr}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Trips Grid */}
        {filteredTrips.length === 0 ? (
          <div className="text-center py-20">
            <Target className="w-24 h-24 text-islamic-emerald/40 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-islamic-emerald mb-4 font-arabic-serif">
              لا توجد رحلات متاحة
            </h2>
            <p className="text-xl text-copper-bronze font-arabic-sans">
              جرب البحث بكلمات مختلفة أو تصفح جميع الرحلات
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrips.map((trip, index) => {
              const Icon = getCategoryIcon(trip.category);
              const availableSpots = trip.maxParticipants - trip.currentParticipants;
              const difficultyInfo = difficultyLevels[trip.difficulty];

              return (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-2 border-gray-200 hover:border-islamic-emerald transition-all duration-300 h-full hover:shadow-xl bg-white/90 backdrop-blur-sm">
                    <CardHeader>
                      <div className={`w-20 h-20 mx-auto bg-gradient-to-br ${getCategoryColor(trip.category)} rounded-2xl flex items-center justify-center mb-4 shadow-lg text-4xl`}>
                        {trip.image}
                      </div>
                      
                      <CardTitle className="text-islamic-emerald text-right text-xl font-arabic-serif font-bold mb-2">
                        {trip.titleAr}
                      </CardTitle>
                      
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`${difficultyInfo.color} px-3 py-1 rounded-full text-xs font-arabic-sans font-medium`}>
                          {difficultyInfo.nameAr}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-copper-bronze font-arabic-sans">
                          <Clock className="w-3 h-3" />
                          <span>{trip.duration}</span>
                        </div>
                      </div>

                      <CardDescription className="text-right text-sm font-arabic-sans text-copper-bronze">
                        {trip.instructor}
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <p className="text-sm text-gray-700 text-right mb-4 font-arabic-sans leading-relaxed">
                        {trip.descriptionAr}
                      </p>

                      <div className="mb-4">
                        <h4 className="text-xs font-bold text-islamic-emerald mb-2 font-arabic-sans flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          الفئة المستهدفة:
                        </h4>
                        <p className="text-xs text-copper-bronze font-arabic-sans">
                          {trip.targetAudience}
                        </p>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-xs font-bold text-islamic-emerald mb-2 font-arabic-sans">
                          المحاور الرئيسية:
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {trip.topics.slice(0, 3).map((topic, idx) => (
                            <span
                              key={idx}
                              className="bg-desert-sand/50 text-islamic-emerald px-2 py-1 rounded-full text-xs font-arabic-sans"
                            >
                              {topic}
                            </span>
                          ))}
                          {trip.topics.length > 3 && (
                            <span className="bg-desert-sand/50 text-islamic-emerald px-2 py-1 rounded-full text-xs font-arabic-sans">
                              +{trip.topics.length - 3}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-4 text-xs">
                        <span className="text-copper-bronze flex items-center gap-1 font-arabic-sans">
                          <Users className="w-3 h-3" />
                          <span>{availableSpots > 0 ? `${availableSpots} مقعد متاح` : 'الرحلة مكتملة'}</span>
                        </span>
                        <span className="text-islamic-emerald font-bold font-arabic-sans">
                          {trip.price > 0 ? `${trip.price} ريال` : '🎁 مجاني'}
                        </span>
                      </div>

                      <Button
                        onClick={onRegisterClick}
                        disabled={availableSpots <= 0}
                        className={`w-full bg-gradient-to-r ${getCategoryColor(trip.category)} text-white font-arabic-sans font-bold py-3 disabled:opacity-50 shadow-lg hover:shadow-xl transition-all duration-300`}
                      >
                        {availableSpots <= 0 ? (
                          '🔒 الرحلة مكتملة'
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            <span>✨</span>
                            <span>سجل الآن</span>
                            <span>🎓</span>
                          </span>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 grid md:grid-cols-4 gap-4"
        >
          <Card className="text-center p-6 bg-gradient-to-br from-islamic-emerald/10 to-islamic-teal/10 border-islamic-emerald/30">
            <div className="text-4xl font-bold text-islamic-emerald mb-2 font-arabic-sans">
              {educationalTrips.length}
            </div>
            <div className="text-sm text-copper-bronze font-arabic-sans">رحلة تعليمية</div>
          </Card>
          
          <Card className="text-center p-6 bg-gradient-to-br from-persian-blue/10 to-royal-gold/10 border-persian-blue/30">
            <div className="text-4xl font-bold text-persian-blue mb-2 font-arabic-sans">
              {educationalTrips.filter(t => t.category === 'fiqh').length}
            </div>
            <div className="text-sm text-copper-bronze font-arabic-sans">رحلة فقهية</div>
          </Card>
          
          <Card className="text-center p-6 bg-gradient-to-br from-copper-bronze/10 to-desert-sand/10 border-copper-bronze/30">
            <div className="text-4xl font-bold text-copper-bronze mb-2 font-arabic-sans">
              {educationalTrips.filter(t => t.category === 'hadith').length}
            </div>
            <div className="text-sm text-copper-bronze font-arabic-sans">رحلة حديثية</div>
          </Card>
          
          <Card className="text-center p-6 bg-gradient-to-br from-royal-gold/10 to-islamic-emerald/10 border-royal-gold/30">
            <div className="text-4xl font-bold text-royal-gold mb-2 font-arabic-sans">
              {educationalTrips.filter(t => t.price === 0).length}
            </div>
            <div className="text-sm text-copper-bronze font-arabic-sans">رحلة مجانية</div>
          </Card>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 text-center bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-royal-gold/20"
        >
          <div className="islamic-divider mb-6">
            <span className="text-royal-gold text-2xl">❋</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-islamic-emerald mb-4 font-arabic-serif">
            🌿 انطلق في رحلتك العلمية
          </h2>
          <p className="text-lg text-copper-bronze mb-8 max-w-2xl mx-auto font-arabic-sans leading-relaxed">
            رحلات تعليمية شاملة في الفقه والحديث والقرآن والتاريخ الإسلامي. 
            اختر رحلتك واكتسب علماً ينفعك في الدنيا والآخرة.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={onRegisterClick}
              size="lg"
              className="bg-gradient-to-r from-islamic-emerald to-islamic-teal text-white px-12 py-6 text-xl font-arabic-sans font-bold shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              <span className="flex items-center gap-3">
                <span>🎓</span>
                <span>سجل في رحلة الآن</span>
                <span>✨</span>
              </span>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
