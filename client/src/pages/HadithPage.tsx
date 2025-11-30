import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowRight, 
  BookOpen, 
  Search, 
  Heart, 
  Share2, 
  Copy,
  BookMarked,
  Scroll,
  Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Hadith {
  id: string;
  arabicText: string;
  translationText?: string;
  narrator: string;
  source: string;
  chapter?: string;
  number?: number;
  grade?: string;
}

const SAMPLE_HADITHS: Hadith[] = [
  {
    id: '1',
    arabicText: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ فَهِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ، وَمَنْ كَانَتْ هِجْرَتُهُ لِدُنْيَا يُصِيبُهَا أَوِ امْرَأَةٍ يَنْكِحُهَا فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ',
    narrator: 'عمر بن الخطاب رضي الله عنه',
    source: 'صحيح البخاري',
    chapter: 'بدء الوحي',
    number: 1,
    grade: 'صحيح'
  },
  {
    id: '2',
    arabicText: 'لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ',
    narrator: 'أنس بن مالك رضي الله عنه',
    source: 'صحيح البخاري',
    chapter: 'الإيمان',
    number: 13,
    grade: 'صحيح'
  },
  {
    id: '3',
    arabicText: 'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ، وَمَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيُكْرِمْ جَارَهُ، وَمَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيُكْرِمْ ضَيْفَهُ',
    narrator: 'أبو هريرة رضي الله عنه',
    source: 'صحيح البخاري',
    chapter: 'الأدب',
    number: 6018,
    grade: 'صحيح'
  },
  {
    id: '4',
    arabicText: 'الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ، وَالْمُهَاجِرُ مَنْ هَجَرَ مَا نَهَى اللَّهُ عَنْهُ',
    narrator: 'عبد الله بن عمرو رضي الله عنهما',
    source: 'صحيح البخاري',
    chapter: 'الإيمان',
    number: 10,
    grade: 'صحيح'
  },
  {
    id: '5',
    arabicText: 'الدِّينُ النَّصِيحَةُ، قُلْنَا: لِمَنْ؟ قَالَ: لِلَّهِ وَلِكِتَابِهِ وَلِرَسُولِهِ وَلِأَئِمَّةِ الْمُسْلِمِينَ وَعَامَّتِهِمْ',
    narrator: 'تميم الداري رضي الله عنه',
    source: 'صحيح مسلم',
    chapter: 'الإيمان',
    number: 55,
    grade: 'صحيح'
  },
  {
    id: '6',
    arabicText: 'مَثَلُ الْمُؤْمِنِينَ فِي تَوَادِّهِمْ وَتَرَاحُمِهِمْ وَتَعَاطُفِهِمْ مَثَلُ الْجَسَدِ إِذَا اشْتَكَى مِنْهُ عُضْوٌ تَدَاعَى لَهُ سَائِرُ الْجَسَدِ بِالسَّهَرِ وَالْحُمَّى',
    narrator: 'النعمان بن بشير رضي الله عنه',
    source: 'صحيح مسلم',
    chapter: 'البر والصلة',
    number: 2586,
    grade: 'صحيح'
  },
  {
    id: '7',
    arabicText: 'لَا تَحَاسَدُوا، وَلَا تَنَاجَشُوا، وَلَا تَبَاغَضُوا، وَلَا تَدَابَرُوا، وَلَا يَبِعْ بَعْضُكُمْ عَلَى بَيْعِ بَعْضٍ، وَكُونُوا عِبَادَ اللَّهِ إِخْوَانًا',
    narrator: 'أبو هريرة رضي الله عنه',
    source: 'صحيح مسلم',
    chapter: 'البر والصلة',
    number: 2564,
    grade: 'صحيح'
  },
  {
    id: '8',
    arabicText: 'إِنَّ اللَّهَ لَا يَنْظُرُ إِلَى صُوَرِكُمْ وَأَمْوَالِكُمْ، وَلَكِنْ يَنْظُرُ إِلَى قُلُوبِكُمْ وَأَعْمَالِكُمْ',
    narrator: 'أبو هريرة رضي الله عنه',
    source: 'صحيح مسلم',
    chapter: 'البر والصلة',
    number: 2564,
    grade: 'صحيح'
  },
  {
    id: '9',
    arabicText: 'اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ، وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا، وَخَالِقِ النَّاسَ بِخُلُقٍ حَسَنٍ',
    narrator: 'أبو ذر الغفاري رضي الله عنه',
    source: 'جامع الترمذي',
    chapter: 'البر والصلة',
    number: 1987,
    grade: 'حسن'
  },
  {
    id: '10',
    arabicText: 'مَا مَلَأَ آدَمِيٌّ وِعَاءً شَرًّا مِنْ بَطْنٍ، بِحَسْبِ ابْنِ آدَمَ أُكُلَاتٌ يُقِمْنَ صُلْبَهُ، فَإِنْ كَانَ لَا مَحَالَةَ فَثُلُثٌ لِطَعَامِهِ، وَثُلُثٌ لِشَرَابِهِ، وَثُلُثٌ لِنَفَسِهِ',
    narrator: 'المقدام بن معد يكرب رضي الله عنه',
    source: 'جامع الترمذي',
    chapter: 'الزهد',
    number: 2380,
    grade: 'صحيح'
  }
];

const CATEGORIES = [
  { id: 'all', name: 'جميع الأحاديث', icon: BookOpen },
  { id: 'iman', name: 'الإيمان', icon: Heart },
  { id: 'akhlaq', name: 'الأخلاق', icon: Star },
  { id: 'muamalat', name: 'المعاملات', icon: Scroll },
];

interface HadithPageProps {
  onBack: () => void;
}

export default function HadithPage({ onBack }: HadithPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const filteredHadiths = SAMPLE_HADITHS.filter(hadith => {
    if (searchQuery) {
      return hadith.arabicText.includes(searchQuery) || 
             hadith.narrator.includes(searchQuery) ||
             hadith.source.includes(searchQuery);
    }
    return true;
  });

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
        toast({ title: 'تم إزالة الحديث من المفضلة' });
      } else {
        newFavorites.add(id);
        toast({ title: 'تم إضافة الحديث إلى المفضلة' });
      }
      return newFavorites;
    });
  };

  const copyHadith = async (hadith: Hadith) => {
    const text = `${hadith.arabicText}\n\nالراوي: ${hadith.narrator}\nالمصدر: ${hadith.source}`;
    await navigator.clipboard.writeText(text);
    toast({ title: 'تم نسخ الحديث' });
  };

  const shareHadith = async (hadith: Hadith) => {
    if (navigator.share) {
      await navigator.share({
        title: 'حديث شريف',
        text: `${hadith.arabicText}\n\nالراوي: ${hadith.narrator}`,
      });
    } else {
      copyHadith(hadith);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50" dir="rtl">
      <header className="bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onBack}
                className="text-white hover:bg-white/20"
                data-testid="button-back"
              >
                <ArrowRight className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Scroll className="h-6 w-6" />
                  الأحاديث النبوية
                </h1>
                <p className="text-amber-100 text-sm">تعلم من أحاديث النبي صلى الله عليه وسلم</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="ابحث في الأحاديث..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 text-right"
              data-testid="input-search"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`p-4 rounded-xl transition-all ${
                selectedCategory === category.id
                  ? 'bg-amber-500 text-white shadow-lg'
                  : 'bg-white hover:bg-amber-50 border border-amber-200'
              }`}
              data-testid={`button-category-${category.id}`}
            >
              <category.icon className={`h-6 w-6 mx-auto mb-2 ${
                selectedCategory === category.id ? 'text-white' : 'text-amber-600'
              }`} />
              <span className="text-sm font-medium">{category.name}</span>
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredHadiths.map((hadith) => (
            <Card key={hadith.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <BookMarked className="h-3 w-3" />
                    {hadith.source}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleFavorite(hadith.id)}
                      className={favorites.has(hadith.id) ? 'text-red-500' : 'text-gray-400'}
                      data-testid={`button-favorite-${hadith.id}`}
                    >
                      <Heart className={`h-5 w-5 ${favorites.has(hadith.id) ? 'fill-current' : ''}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyHadith(hadith)}
                      className="text-gray-400 hover:text-gray-600"
                      data-testid={`button-copy-${hadith.id}`}
                    >
                      <Copy className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => shareHadith(hadith)}
                      className="text-gray-400 hover:text-gray-600"
                      data-testid={`button-share-${hadith.id}`}
                    >
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-6 mb-4 border border-amber-100">
                  <p className="text-xl font-arabic leading-loose text-amber-900">
                    {hadith.arabicText}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <span className="font-medium">الراوي:</span>
                    <span>{hadith.narrator}</span>
                  </div>
                  {hadith.chapter && (
                    <div className="flex items-center gap-1">
                      <span className="font-medium">الباب:</span>
                      <span>{hadith.chapter}</span>
                    </div>
                  )}
                  {hadith.grade && (
                    <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                      {hadith.grade}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredHadiths.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Scroll className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                لم يتم العثور على أحاديث
              </h3>
              <p className="text-gray-500">
                جرب البحث بكلمات مختلفة
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
