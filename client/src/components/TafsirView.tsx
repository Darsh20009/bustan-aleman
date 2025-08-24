import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Volume2, VolumeX, Copy, Share2, Heart, Star, Bookmark } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TafsirViewProps {
  text: string;
  tafsir?: string;
  ayahNumber: number;
  surahNumber?: number;
  surahName?: string;
  page?: number;
  juz?: number;
  onBookmark?: (ayahNumber: number) => void;
  onShare?: (text: string, ayahNumber: number) => void;
}

const TafsirView = ({ 
  text, 
  tafsir, 
  ayahNumber, 
  surahNumber, 
  surahName, 
  page, 
  juz,
  onBookmark,
  onShare
}: TafsirViewProps) => {
  const [activeTab, setActiveTab] = useState<string>("quran");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const { toast } = useToast();
  
  // تحويل الرقم إلى أرقام عربية
  const toArabicNumeral = (num: number | undefined): string => {
    if (num === undefined || num === null || isNaN(num)) return '٠';
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().split('').map(digit => arabicNumerals[parseInt(digit)] || '٠').join('');
  };

  // تشغيل تلاوة الآية
  const playAyah = async () => {
    try {
      if (currentAudio) {
        currentAudio.pause();
        setCurrentAudio(null);
      }

      if (!surahNumber) {
        toast({
          title: "خطأ",
          description: "لا يمكن تشغيل التلاوة - رقم السورة غير محدد",
          variant: "destructive"
        });
        return;
      }

      setIsPlaying(true);
      
      // استخدام تلاوة الشيخ عبد الباسط عبد الصمد
      const surahStr = surahNumber.toString().padStart(3, '0');
      const ayahStr = ayahNumber.toString().padStart(3, '0');
      
      // محاولة عدة مصادر للصوت
      const audioSources = [
        `https://cdn.islamic.network/quran/audio-surah/128/ar.abdulbasitmurattal/${surahStr}${ayahStr}.mp3`,
        `https://verses.quran.com/Abdur-Rashid/mp3/${surahStr}${ayahStr}.mp3`,
        `https://download.quranicaudio.com/quran/abdur_rasheed_sufi/${surahStr}${ayahStr}.mp3`
      ];

      let audio: HTMLAudioElement | null = null;
      
      for (const source of audioSources) {
        try {
          audio = new Audio(source);
          await new Promise((resolve, reject) => {
            audio!.addEventListener('loadeddata', resolve);
            audio!.addEventListener('error', reject);
            audio!.load();
          });
          break;
        } catch (error) {
          continue;
        }
      }

      if (!audio) {
        throw new Error('لا يمكن العثور على مصدر الصوت');
      }

      setCurrentAudio(audio);
      
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentAudio(null);
      });
      
      await audio.play();
      
      toast({
        title: "🎵 تم بدء التلاوة",
        description: `الآية ${toArabicNumeral(ayahNumber)} من ${surahName || 'السورة'}`
      });
      
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
      toast({
        title: "خطأ في تشغيل التلاوة",
        description: "لم نتمكن من تشغيل التلاوة في الوقت الحالي",
        variant: "destructive"
      });
    }
  };

  const stopAyah = () => {
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
      setIsPlaying(false);
      toast({
        title: "⏹️ تم إيقاف التلاوة",
        description: "تم إيقاف تشغيل التلاوة"
      });
    }
  };

  const copyAyah = async () => {
    try {
      const textToCopy = `${text} {${toArabicNumeral(ayahNumber)}}`;
      await navigator.clipboard.writeText(textToCopy);
      toast({
        title: "📋 تم النسخ",
        description: "تم نسخ الآية إلى الحافظة"
      });
    } catch (error) {
      toast({
        title: "خطأ في النسخ",
        description: "لم نتمكن من نسخ النص",
        variant: "destructive"
      });
    }
  };

  const shareAyah = () => {
    if (onShare) {
      onShare(text, ayahNumber);
    } else {
      const shareText = `${text}\n{${toArabicNumeral(ayahNumber)}} ${surahName || ''}`;
      if (navigator.share) {
        navigator.share({
          title: `آية من القرآن الكريم`,
          text: shareText
        });
      } else {
        copyAyah();
      }
    }
  };

  const bookmarkAyah = () => {
    if (onBookmark) {
      onBookmark(ayahNumber);
    }
    toast({
      title: "🔖 تمت الإضافة للمفضلة",
      description: `تم حفظ الآية ${toArabicNumeral(ayahNumber)} في المفضلة`
    });
  };

  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        setCurrentAudio(null);
      }
    };
  }, [currentAudio]);

  return (
    <div className="my-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <TabsList className="grid grid-cols-2 w-48">
              <TabsTrigger value="quran">القرآن</TabsTrigger>
              <TabsTrigger value="tafsir">التفسير</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              {page && (
                <Badge variant="outline" className="text-xs">
                  صفحة {toArabicNumeral(page)}
                </Badge>
              )}
              {juz && (
                <Badge variant="outline" className="text-xs">
                  جزء {toArabicNumeral(juz)}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={isPlaying ? stopAyah : playAyah}
                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
              >
                {isPlaying ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={copyAyah}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <Copy className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={shareAyah}
                className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
              >
                <Share2 className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={bookmarkAyah}
                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
              >
                <Bookmark className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="verse-end bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-bold">
              {toArabicNumeral(ayahNumber)}
            </div>
          </div>
        </div>
        
        <TabsContent value="quran" className="mt-0">
          <Card className="border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
            <CardContent className="pt-6">
              <div className="text-center">
                {surahName && (
                  <div className="mb-4 pb-2 border-b border-amber-200">
                    <h3 className="text-lg font-bold text-amber-800 mb-1">{surahName}</h3>
                    {surahNumber && (
                      <p className="text-sm text-amber-600">سورة رقم {toArabicNumeral(surahNumber)}</p>
                    )}
                  </div>
                )}
                
                <div className="relative p-6 bg-white/60 rounded-lg shadow-inner">
                  <div className="absolute top-2 right-2 opacity-20">
                    <BookOpen className="h-6 w-6 text-amber-600" />
                  </div>
                  
                  <p className="quran-text text-2xl leading-loose text-right text-green-800 font-amiri">
                    {text}
                  </p>
                  
                  <div className="absolute bottom-2 left-2 opacity-20">
                    <Star className="h-4 w-4 text-amber-600" />
                  </div>
                </div>
                
                {isPlaying && (
                  <div className="mt-4 flex items-center justify-center text-emerald-600">
                    <div className="flex space-x-1">
                      <div className="w-2 h-8 bg-current rounded animate-pulse" style={{animationDelay: '0ms'}}></div>
                      <div className="w-2 h-6 bg-current rounded animate-pulse" style={{animationDelay: '150ms'}}></div>
                      <div className="w-2 h-10 bg-current rounded animate-pulse" style={{animationDelay: '300ms'}}></div>
                      <div className="w-2 h-4 bg-current rounded animate-pulse" style={{animationDelay: '450ms'}}></div>
                    </div>
                    <span className="mr-3 text-sm font-medium">جاري التلاوة...</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tafsir" className="mt-0">
          <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardContent className="pt-6">
              {tafsir ? (
                <div>
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-blue-200">
                    <div className="flex items-center text-blue-700">
                      <BookOpen className="h-5 w-5 ml-2" /> 
                      <span className="font-bold text-lg">التفسير الميسر</span>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      آية {toArabicNumeral(ayahNumber)}
                    </Badge>
                  </div>
                  
                  <div className="relative p-4 bg-white/70 rounded-lg">
                    <div className="absolute top-2 right-2 opacity-20">
                      <Heart className="h-5 w-5 text-blue-600" />
                    </div>
                    
                    <p className="text-base leading-relaxed text-gray-700 text-right font-medium">
                      {tafsir}
                    </p>
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-100/50 rounded-lg">
                    <p className="text-sm text-blue-600 text-center">
                      💡 هذا التفسير مبسط لمساعدتك على فهم معاني الآيات الكريمة
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-2">التفسير غير متوفر حالياً</p>
                  <p className="text-gray-400 text-sm">نعمل على إضافة المزيد من التفاسير قريباً</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TafsirView;