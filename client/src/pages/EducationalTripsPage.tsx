import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { BookOpen, Download, ArrowRight, FileText, Heart, Star, Filter, Search } from 'lucide-react';
import { Input } from '../components/ui/input';

interface Resource {
  id: string;
  title: string;
  description: string;
  category: string;
  content: string;
  author: string;
  pages: number;
  rating?: number;
  authenticity?: string;
  downloads: number;
  free: boolean;
}

interface EducationalTripsPageProps {
  onBack: () => void;
  onRegisterClick?: () => void;
}

const resources: Resource[] = [
  // الحديث - Hadith
  {
    id: 'hadith-sahih-bukhari',
    title: 'صحيح البخاري',
    description: 'أصح كتاب بعد القرآن - مجموعة شاملة من 7275 حديث موثق',
    category: 'hadith',
    content: 'مجموعة كاملة من أحاديث صحيح البخاري مع التقييمات والشروحات. كل حديث مصنف حسب الدرجة (صحيح، حسن، ضعيف)',
    author: 'الإمام محمد بن إسماعيل البخاري',
    pages: 1320,
    authenticity: 'صحيح',
    downloads: 24500,
    free: true,
    rating: 5
  },
  {
    id: 'hadith-sahih-muslim',
    title: 'صحيح مسلم',
    description: 'ثاني أصح كتب الحديث - 5033 حديث صحيح مع التوثيق',
    category: 'hadith',
    content: 'مجموعة كاملة من أحاديث صحيح مسلم مع الشروح والفوائد. كل حديث معه تقييم الدرجة والمصادر',
    author: 'الإمام مسلم بن الحجاج',
    pages: 1120,
    authenticity: 'صحيح',
    downloads: 22100,
    free: true,
    rating: 5
  },
  {
    id: 'hadith-sunan-tirmidhi',
    title: 'سنن الترمذي',
    description: '3956 حديث مع تقييم درجات الأحاديث والتعليقات',
    category: 'hadith',
    content: 'مجموعة أحاديث سنن الترمذي مع تقييم الدرجة (صحيح، حسن، ضعيف) وشروح مختصرة',
    author: 'الإمام محمد بن عيسى الترمذي',
    pages: 920,
    authenticity: 'متنوع',
    downloads: 16800,
    free: true,
    rating: 4.8
  },
  {
    id: 'hadith-sunan-nasai',
    title: 'سنن النسائي',
    description: '5761 حديث من كتاب السنن - مع درجات التوثيق',
    category: 'hadith',
    content: 'أحاديث السنن الصغرى للنسائي مع تقييم الدرجة وملاحظات الحفاظ',
    author: 'الإمام أحمد بن شعيب النسائي',
    pages: 1080,
    authenticity: 'متنوع',
    downloads: 15900,
    free: true,
    rating: 4.7
  },
  {
    id: 'hadith-sunan-abi-dawood',
    title: 'سنن أبي داود',
    description: '4800 حديث مع درجات الصحة والضعف والتوثيق',
    category: 'hadith',
    content: 'مجموعة أحاديث سنن أبي داود مع تقييم شامل لدرجة الأحاديث',
    author: 'الإمام أبو داود سليمان بن الأشعث',
    pages: 980,
    authenticity: 'متنوع',
    downloads: 14200,
    free: true,
    rating: 4.6
  },
  {
    id: 'hadith-sunan-ibn-majah',
    title: 'سنن ابن ماجه',
    description: '4341 حديث مع التقييمات والشروح المختصرة',
    category: 'hadith',
    content: 'سنن ابن ماجه كاملة مع تقييم درجات الأحاديث والمصادر',
    author: 'الإمام محمد بن يزيد ابن ماجه',
    pages: 890,
    authenticity: 'متنوع',
    downloads: 12800,
    free: true,
    rating: 4.5
  },
  {
    id: 'hadith-arbain-nawawi',
    title: 'الأربعين النووية',
    description: '40 حديث مختار يجمع أصول الدين والشريعة',
    category: 'hadith',
    content: 'أربعين حديث مختاره للإمام النووي مع شروح مفصلة وفوائد',
    author: 'الإمام يحيى بن شرف النووي',
    pages: 180,
    authenticity: 'صحيح',
    downloads: 45000,
    free: true,
    rating: 5
  },

  // الفقه - Fiqh
  {
    id: 'fiqh-bidayah-mutafarqin',
    title: 'بداية المتفقه في أصول الفقه',
    description: 'كتاب أساسي في فهم الفقه والأحكام الشرعية',
    category: 'fiqh',
    content: 'شرح تفصيلي لأساسيات الفقه والعبادات والمعاملات والحدود والسياسة',
    author: 'الإمام عبد الله بن أحمد النجاري',
    pages: 350,
    downloads: 18900,
    free: true,
    rating: 4.8
  },
  {
    id: 'fiqh-muwatta',
    title: 'موطأ مالك',
    description: 'أول كتاب حديث وفقهي جمع الحديث والآراء الفقهية',
    category: 'fiqh',
    content: 'موطأ الإمام مالك مع أحكام فقهية شاملة وآراء المذاهب',
    author: 'الإمام مالك بن أنس',
    pages: 680,
    downloads: 14500,
    free: true,
    rating: 4.9
  },
  {
    id: 'fiqh-bidayat-mujtahid',
    title: 'بداية المجتهد ونهاية المقتصد',
    description: 'موسوعة فقهية شاملة في الأحكام والخلافات',
    category: 'fiqh',
    content: 'دراسة مقارنة للمذاهب الفقهية الأربع مع الأدلة والآراء',
    author: 'الإمام محمد بن أحمد ابن رشد',
    pages: 1240,
    downloads: 16700,
    free: true,
    rating: 4.9
  },
  {
    id: 'fiqh-kitab-tawhid',
    title: 'كتاب التوحيد',
    description: 'أساسيات التوحيد والعقيدة الإسلامية الصحيحة',
    category: 'fiqh',
    content: 'شرح شامل للتوحيد وأنواعه والشرك وأنواعه مع الأدلة من القرآن والسنة',
    author: 'الشيخ محمد بن عبد الوهاب',
    pages: 420,
    downloads: 28900,
    free: true,
    rating: 5
  },
  {
    id: 'fiqh-zaad-mustaqni',
    title: 'زاد المستقنع',
    description: 'مختصر فقهي شامل في العبادات والمعاملات',
    category: 'fiqh',
    content: 'مختصر الفقه الحنبلي مع شروح سهلة وممتعة',
    author: 'الشيخ موسى بن أحمد الحجاوي',
    pages: 560,
    downloads: 19800,
    free: true,
    rating: 4.7
  },

  // السيرة النبوية - Seerah
  {
    id: 'seerah-sirah-nabawiyyah',
    title: 'السيرة النبوية لابن هشام',
    description: 'أشهر كتاب في السيرة النبوية - من المولد إلى الوفاة',
    category: 'seerah',
    content: 'السيرة الكاملة للنبي محمد ﷺ من المولد الشريف إلى وفاته مع التفاصيل والأحداث المهمة',
    author: 'الإمام عبد الملك بن هشام',
    pages: 1850,
    downloads: 35600,
    free: true,
    rating: 5
  },
  {
    id: 'seerah-wafa-al-wafa',
    title: 'الوفا بأحوال المصطفى',
    description: 'سيرة النبي ﷺ الكاملة مع الأحاديث والتفاصيل',
    category: 'seerah',
    content: 'دراسة تفصيلية لحياة النبي محمد ﷺ مع كل الأحداث المهمة والدروس',
    author: 'الإمام نور الدين الهيثمي',
    pages: 1560,
    downloads: 28900,
    free: true,
    rating: 4.9
  },
  {
    id: 'seerah-ar-raheeq',
    title: 'الرحيق المختوم',
    description: 'سيرة النبي ﷺ باختصار وتركيز على الأحداث المهمة',
    category: 'seerah',
    content: 'السيرة النبوية الكاملة مع التركيز على الأحداث الحاسمة والدروس المستفادة',
    author: 'الشيخ صفي الرحمن المباركفوري',
    pages: 520,
    downloads: 42100,
    free: true,
    rating: 5
  },
  {
    id: 'seerah-gazwat',
    title: 'غزوات النبي ﷺ',
    description: 'دراسة مفصلة لكل غزوات النبي محمد ﷺ',
    category: 'seerah',
    content: 'شرح تفصيلي لكل غزوات النبي ﷺ مع الدروس والفوائد من كل غزوة',
    author: 'الإمام ابن سيد الناس',
    pages: 680,
    downloads: 21400,
    free: true,
    rating: 4.8
  },

  // العلوم الإسلامية - Islamic Sciences
  {
    id: 'science-quran-sciences',
    title: 'علوم القرآن',
    description: 'شامل في علوم القرآن والتفسير والقراءات',
    category: 'sciences',
    content: 'دراسة شاملة لعلوم القرآن من الوحي إلى الحفظ مع النسخ والإعجاز والقراءات',
    author: 'الإمام الزركشي',
    pages: 890,
    downloads: 17600,
    free: true,
    rating: 4.8
  },
  {
    id: 'science-hadith-terminology',
    title: 'مصطلح الحديث',
    description: 'دليل شامل لفهم درجات الأحاديث والتقييمات',
    category: 'sciences',
    content: 'شرح مفصل لمصطلحات الحديث والرجال والعلل مع أمثلة عملية',
    author: 'الإمام الخطيب البغدادي',
    pages: 520,
    downloads: 19800,
    free: true,
    rating: 4.9
  },
  {
    id: 'science-aqeedah-tahawiyyah',
    title: 'العقيدة الطحاوية',
    description: 'عقيدة إسلامية كاملة مع الشرح المفصل',
    category: 'sciences',
    content: 'شرح شامل للعقيدة الإسلامية الصحيحة من كتاب العقيدة الطحاوية',
    author: 'الإمام أبو جعفر الطحاوي',
    pages: 420,
    downloads: 25900,
    free: true,
    rating: 5
  },
  {
    id: 'science-tafsir-jalalain',
    title: 'تفسير الجلالين',
    description: 'تفسير موجز وشامل للقرآن الكريم',
    category: 'sciences',
    content: 'تفسير القرآن الكريم كاملاً مع شرح المعاني والأحكام',
    author: 'الإمام جلال الدين المحلي وجلال الدين السيوطي',
    pages: 1240,
    downloads: 38900,
    free: true,
    rating: 4.9
  }
];

export function EducationalTripsPage({ onBack, onRegisterClick }: EducationalTripsPageProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);

  const categories = [
    { id: 'all', label: 'جميع المصادر', color: 'from-emerald-500 to-teal-500' },
    { id: 'hadith', label: 'الحديث الشريف', color: 'from-blue-500 to-cyan-500' },
    { id: 'fiqh', label: 'الفقه الإسلامي', color: 'from-green-500 to-emerald-500' },
    { id: 'seerah', label: 'السيرة النبوية', color: 'from-purple-500 to-pink-500' },
    { id: 'sciences', label: 'العلوم الإسلامية', color: 'from-orange-500 to-amber-500' },
  ];

  const filteredResources = resources.filter(resource => {
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesSearch = resource.title.includes(searchQuery) || 
                         resource.description.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  const toggleFavorite = (id: string) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-8 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={onBack}
            className="mb-6 flex items-center gap-2 text-white/80 hover:text-white transition-colors font-arabic-sans"
            data-testid="button-back-trips"
          >
            <ArrowRight className="w-5 h-5" />
            العودة للخلف
          </button>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 font-arabic-serif">مكتبة العلم الإسلامي</h1>
          <p className="text-lg text-emerald-100 max-w-2xl font-arabic-sans">مجموعة شاملة من الكتب والمصادر الإسلامية المجانية - الحديث والفقه والسيرة والعلوم الإسلامية</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="relative">
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-emerald-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="ابحث عن كتاب أو موضوع..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-12 py-6 text-lg bg-white border-2 border-emerald-200 rounded-lg font-arabic-sans focus:border-emerald-500"
              data-testid="input-search-resources"
            />
          </div>
        </motion.div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-emerald-800 font-arabic-serif">تصنيفات المصادر</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {categories.map((cat) => (
              <motion.button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-3 rounded-lg font-arabic-sans font-bold transition-all duration-300 ${
                  selectedCategory === cat.id
                    ? `bg-gradient-to-r ${cat.color} text-white shadow-lg`
                    : 'bg-white text-emerald-700 border-2 border-emerald-200 hover:border-emerald-400'
                }`}
                data-testid={`filter-category-${cat.id}`}
              >
                {cat.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource, index) => (
            <motion.div
              key={resource.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              data-testid={`resource-card-${resource.id}`}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 border-emerald-100 bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <button
                      onClick={() => toggleFavorite(resource.id)}
                      className="text-emerald-300 hover:text-red-500 transition-colors"
                      data-testid={`button-favorite-${resource.id}`}
                    >
                      <Heart className={`w-5 h-5 ${favorites.includes(resource.id) ? 'fill-current text-red-500' : ''}`} />
                    </button>
                  </div>
                  <CardTitle className="text-xl font-arabic-sans text-emerald-900">{resource.title}</CardTitle>
                  <CardDescription className="text-emerald-700 font-arabic-sans">{resource.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-emerald-600 font-arabic-sans">
                        <span className="font-bold">{resource.pages}</span> صفحة
                      </span>
                      {resource.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-emerald-700 font-arabic-sans font-bold">{resource.rating}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-emerald-600 font-arabic-sans">
                      <span className="font-bold">{resource.author}</span>
                    </div>
                    {resource.authenticity && (
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-3 py-1 rounded-full font-bold font-arabic-sans ${
                          resource.authenticity === 'صحيح' ? 'bg-green-100 text-green-800' :
                          resource.authenticity === 'متنوع' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {resource.authenticity}
                        </span>
                      </div>
                    )}
                    <div className="text-xs text-emerald-500 font-arabic-sans">
                      <span>{resource.downloads.toLocaleString()} تحميل</span>
                    </div>
                  </div>

                  <div className="bg-emerald-50 p-3 rounded-lg mb-4 text-sm text-emerald-800 border border-emerald-200 max-h-20 overflow-y-auto font-arabic-sans">
                    {resource.content}
                  </div>

                  <Button
                    onClick={() => onRegisterClick?.()}
                    size="sm"
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-arabic-sans hover:shadow-lg"
                    data-testid={`button-download-${resource.id}`}
                  >
                    <Download className="w-4 h-4 ml-2" />
                    تحميل مجاني
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-emerald-800 mb-2 font-arabic-serif">لا توجد نتائج</h3>
            <p className="text-emerald-600 font-arabic-sans">جرب البحث بكلمات مختلفة</p>
          </div>
        )}

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-16 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-2xl p-8 border-2 border-emerald-200"
        >
          <h2 className="text-3xl font-bold text-emerald-900 mb-8 text-center font-arabic-serif">إحصائيات المكتبة</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-emerald-600 mb-2">{resources.length}+</p>
              <p className="text-lg text-emerald-900 font-arabic-sans">كتاب ومصدر</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-emerald-600 mb-2">100%</p>
              <p className="text-lg text-emerald-900 font-arabic-sans">مجاني</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-emerald-600 mb-2">{resources.reduce((sum, r) => sum + r.downloads, 0).toLocaleString()}</p>
              <p className="text-lg text-emerald-900 font-arabic-sans">تحميل</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-emerald-600 mb-2">✓</p>
              <p className="text-lg text-emerald-900 font-arabic-sans">موثق شرعياً</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
