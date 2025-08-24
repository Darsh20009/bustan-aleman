import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import TafsirView from "@/components/TafsirView";
import AudioPlayer from "@/components/AudioPlayer";
import QuranNavigation from "@/components/QuranNavigation";
import { Button } from "@/components/ui/button";
import { BookOpen, Headphones } from "lucide-react";

interface Ayah {
  number: number;
  text: string;
  surah: number;
  tafsir?: string;
}

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
  ayahs: Ayah[];
}

interface QuranPageData {
  page: number;
  surahs: {
    [surahNumber: string]: {
      name: string;
      ayahs: Ayah[];
    }
  };
}

interface QuranReaderProps {
  initialMode?: 'page' | 'surah';
  initialPageNumber?: number;
  initialSurahNumber?: number;
}

const QuranReader = ({ 
  initialMode = 'page', 
  initialPageNumber = 1, 
  initialSurahNumber = 1 
}: QuranReaderProps) => {
  const [mode, setMode] = useState<'page' | 'surah'>(initialMode);
  const [currentPage, setCurrentPage] = useState(initialPageNumber);
  const [currentSurah, setCurrentSurah] = useState(initialSurahNumber);
  const [showTafsir, setShowTafsir] = useState(false);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [selectedAyah, setSelectedAyah] = useState<Ayah | null>(null);
  
  const { data, isLoading } = useQuery<QuranPageData | Surah>({
    queryKey: mode === 'page' 
      ? [`/api/quran/page/${currentPage}`] 
      : [`/api/quran/surah/${currentSurah}`],
  });

  // Convert number to Arabic numeral
  const toArabicNumeral = (num: number): string => {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().split('').map(digit => arabicNumerals[parseInt(digit)]).join('');
  };
  
  // عرض التفسير أو مشغل الصوت للآية المحددة
  const handleAyahClick = (ayah: Ayah) => {
    setSelectedAyah(ayah);
    // سنعرض التفسير تلقائيًا عند اختيار آية
    setShowTafsir(true);
  };

  if (isLoading) {
    return (
      <Card className="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-auto p-3 md:p-6 min-h-[calc(100vh-130px)]">
        <div className="text-center mb-4 md:mb-8">
          <Skeleton className="h-6 md:h-10 w-24 md:w-48 mx-auto" />
          <Skeleton className="h-3 md:h-4 w-20 md:w-32 mx-auto mt-2" />
          <Skeleton className="h-1 w-24 md:w-48 mx-auto mt-4" />
          <Skeleton className="h-4 md:h-6 w-32 md:w-64 mx-auto mt-4" />
        </div>
        <div className="space-y-3 md:space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-4 md:h-6 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  if (!data) return null;

  if (mode === 'surah') {
    const surah = data as Surah;
    return (
      <div className="w-full">
        <QuranNavigation
          currentPage={currentPage}
          currentSurah={currentSurah}
          mode={mode}
          onPageChange={setCurrentPage}
          onSurahChange={setCurrentSurah}
          onModeChange={setMode}
        />
        <Card className="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-auto p-3 md:p-6 min-h-[calc(100vh-130px)]">
          <div className="text-center mb-6 md:mb-8">
          <div className="relative">
            <div className="absolute inset-0 islamic-pattern rounded-lg opacity-10"></div>
            <div className="py-4 md:py-6 px-2 md:px-4 relative">
              <h2 className="text-xl md:text-3xl font-amiri text-primary mb-2">سورة {surah.name}</h2>
              <div className="text-xs md:text-sm text-gray-600 mb-3">
                {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} - {toArabicNumeral(surah.numberOfAyahs)} آيات
              </div>
              <div className="w-32 md:w-48 h-1 bg-secondary mx-auto mb-4 rounded-full"></div>
              <div className="text-sm md:text-lg font-amiri text-accent">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
            </div>
          </div>
        </div>
        
        {/* أزرار التحكم - التفسير ومشغل الصوت */}
        <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 mb-4 md:mb-6 px-2">
          <Button 
            variant={showTafsir ? "default" : "outline"} 
            className="flex items-center gap-2 w-full sm:w-auto text-sm md:text-base"
            onClick={() => setShowTafsir(!showTafsir)}
          >
            <BookOpen className="h-3 w-3 md:h-4 md:w-4" />
            <span>التفسير</span>
          </Button>
          
          <Button 
            variant={showAudioPlayer ? "default" : "outline"} 
            className="flex items-center gap-2 w-full sm:w-auto text-sm md:text-base"
            onClick={() => setShowAudioPlayer(!showAudioPlayer)}
          >
            <Headphones className="h-3 w-3 md:h-4 md:w-4" />
            <span>الاستماع</span>
          </Button>
        </div>
        
        {/* مشغل الصوت إذا كان مفعلاً */}
        {showAudioPlayer && selectedAyah && (
          <AudioPlayer 
            surahNumber={surah.number} 
            ayahNumber={selectedAyah.number} 
          />
        )}
        
        <div className="quran-text text-lg md:text-xl leading-relaxed text-textDark mb-6 md:mb-8">
          {/* إذا كان التفسير مفعلاً والآية محددة، سنعرض الآية مع تفسيرها */}
          {showTafsir && selectedAyah ? (
            <TafsirView
              text={selectedAyah.text}
              tafsir={selectedAyah.tafsir}
              ayahNumber={selectedAyah.number}
            />
          ) : (
            // وإلا سنعرض كل الآيات
            <p className="mb-4">
              {surah.ayahs.map((ayah) => (
                <span 
                  key={ayah.number} 
                  onClick={() => handleAyahClick(ayah)}
                  className="cursor-pointer hover:bg-gray-100 rounded p-1"
                >
                  {ayah.text}
                  <span className="verse-end">{toArabicNumeral(ayah.number)}</span>
                  {" "}
                </span>
              ))}
            </p>
          )}

          <div className="w-full flex justify-center py-4">
            <div className="w-32 h-8 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
              <span className="text-primary text-sm font-amiri">صدق الله العظيم</span>
            </div>
          </div>
        </div>
        </Card>
      </div>
    );
  } else {
    // Page mode
    const pageData = data as QuranPageData;
    const surahsOnPage = Object.entries(pageData.surahs);
    
    return (
      <div className="w-full">
        <QuranNavigation
          currentPage={currentPage}
          currentSurah={currentSurah}
          mode={mode}
          onPageChange={setCurrentPage}
          onSurahChange={setCurrentSurah}
          onModeChange={setMode}
        />
        <Card className="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-auto p-3 md:p-6 min-h-[calc(100vh-130px)]">
          {/* أزرار التحكم - التفسير ومشغل الصوت */}
        <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 mb-4 md:mb-6 px-2">
          <Button 
            variant={showTafsir ? "default" : "outline"} 
            className="flex items-center gap-2 w-full sm:w-auto text-sm md:text-base"
            onClick={() => setShowTafsir(!showTafsir)}
          >
            <BookOpen className="h-3 w-3 md:h-4 md:w-4" />
            <span>التفسير</span>
          </Button>
          
          <Button 
            variant={showAudioPlayer ? "default" : "outline"} 
            className="flex items-center gap-2 w-full sm:w-auto text-sm md:text-base"
            onClick={() => setShowAudioPlayer(!showAudioPlayer)}
          >
            <Headphones className="h-3 w-3 md:h-4 md:w-4" />
            <span>الاستماع</span>
          </Button>
        </div>
        
        {/* مشغل الصوت إذا كان مفعلاً */}
        {showAudioPlayer && selectedAyah && (
          <AudioPlayer 
            surahNumber={parseInt(Object.keys(pageData.surahs).find(
              surahNum => pageData.surahs[surahNum].ayahs.some(a => a.number === selectedAyah.number)
            ) || "1")} 
            ayahNumber={selectedAyah.number} 
          />
        )}
        
        {/* إذا كان التفسير مفعلاً والآية محددة، سنعرض الآية مع تفسيرها */}
        {showTafsir && selectedAyah && (
          <TafsirView
            text={selectedAyah.text}
            tafsir={selectedAyah.tafsir}
            ayahNumber={selectedAyah.number}
          />
        )}
        
        {/* عرض السور والآيات */}
        {(!showTafsir || !selectedAyah) && surahsOnPage.map(([surahNum, surah], index) => (
          <div key={surahNum}>
            {index > 0 && <Separator className="my-6" />}
            
            <div className="text-center mb-4 md:mb-6">
              <h2 className="text-lg md:text-2xl font-amiri text-primary">سورة {surah.name}</h2>
              <div className="text-sm md:text-lg font-amiri text-accent mt-2 md:mt-3">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
            </div>
            
            <div className="quran-text text-base md:text-xl leading-relaxed text-textDark px-2 md:px-0">
              <p className="mb-2">
                {surah.ayahs.map((ayah) => (
                  <span 
                    key={ayah.number} 
                    onClick={() => handleAyahClick(ayah)}
                    className="cursor-pointer hover:bg-gray-100 rounded p-1"
                  >
                    {ayah.text}
                    <span className="verse-end">{toArabicNumeral(ayah.number)}</span>
                    {" "}
                  </span>
                ))}
              </p>
            </div>
          </div>
        ))}
        
        <div className="w-full flex justify-center py-4 mt-4">
          <div className="w-32 h-8 bg-primary bg-opacity-10 rounded-full flex items-center justify-center">
            <span className="text-primary text-sm font-amiri">صدق الله العظيم</span>
          </div>
        </div>
        </Card>
      </div>
    );
  }
};

export default QuranReader;
