import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import TafsirView from "@/components/TafsirView";
import AudioPlayer from "@/components/AudioPlayer";
import QuranNavigation from "@/components/QuranNavigation";
import { Button } from "@/components/ui/button";
import { BookOpen, Headphones, BookMarked } from "lucide-react";

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

  const toArabicNumeral = (num: number | undefined): string => {
    if (num === undefined || num === null || isNaN(num)) return '٠';
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().split('').map(digit => arabicNumerals[parseInt(digit)] || '٠').join('');
  };
  
  const handleAyahClick = (ayah: Ayah) => {
    setSelectedAyah(ayah);
    setShowTafsir(true);
  };

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-5xl mx-auto p-6 md:p-10 min-h-[calc(100vh-130px)] border-2 border-emerald-100 dark:border-emerald-900">
        <div className="text-center mb-8">
          <Skeleton className="h-10 w-48 mx-auto bg-emerald-100 dark:bg-emerald-900" />
          <Skeleton className="h-4 w-32 mx-auto mt-2 bg-emerald-100 dark:bg-emerald-900" />
          <Skeleton className="h-1 w-48 mx-auto mt-4 bg-emerald-100 dark:bg-emerald-900" />
          <Skeleton className="h-6 w-64 mx-auto mt-4 bg-emerald-100 dark:bg-emerald-900" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-full bg-emerald-100 dark:bg-emerald-900" />
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
        <Card className="bg-gradient-to-br from-white to-emerald-50 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-2xl w-full max-w-5xl mx-auto p-6 md:p-10 min-h-[calc(100vh-130px)] border-2 border-emerald-200 dark:border-emerald-800">
          <div className="text-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-100 to-emerald-50 dark:from-emerald-900 dark:to-gray-800 rounded-lg opacity-50"></div>
              <div className="py-6 px-4 relative">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-emerald-600"></div>
                  <BookMarked className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-emerald-600"></div>
                </div>
                <h2 className="text-3xl md:text-4xl font-amiri text-emerald-700 dark:text-emerald-300 mb-2">سورة {surah.name}</h2>
                <div className="text-sm md:text-base text-emerald-600 dark:text-emerald-400 mb-3">
                  {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} - {toArabicNumeral(surah.numberOfAyahs)} آيات
                </div>
                <div className="w-48 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent mx-auto mb-4 rounded-full"></div>
                <div className="text-lg md:text-2xl font-amiri text-emerald-800 dark:text-emerald-200">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
              </div>
            </div>
          </div>
        
          <div className="flex flex-col sm:flex-row justify-center gap-3 mb-6 px-2">
            <Button 
              variant={showTafsir ? "default" : "outline"} 
              className="flex items-center gap-2 w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white border-emerald-600"
              onClick={() => setShowTafsir(!showTafsir)}
              data-testid="button-toggle-tafsir"
            >
              <BookOpen className="h-4 w-4" />
              <span>التفسير</span>
            </Button>
          
            <Button 
              variant={showAudioPlayer ? "default" : "outline"} 
              className="flex items-center gap-2 w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white border-emerald-600"
              onClick={() => setShowAudioPlayer(!showAudioPlayer)}
              data-testid="button-toggle-audio"
            >
              <Headphones className="h-4 w-4" />
              <span>الاستماع</span>
            </Button>
          </div>
        
          {showAudioPlayer && selectedAyah && (
            <div className="mb-6">
              <AudioPlayer 
                surahNumber={surah.number} 
                ayahNumber={selectedAyah.number} 
              />
            </div>
          )}
        
          <div className="quran-text text-xl md:text-2xl leading-loose text-gray-800 dark:text-gray-100 mb-8 bg-white dark:bg-gray-800 rounded-lg p-6 md:p-8 shadow-inner border border-emerald-100 dark:border-emerald-900" data-testid="quran-text-container">
            {showTafsir && selectedAyah ? (
              <TafsirView
                text={selectedAyah.text}
                tafsir={selectedAyah.tafsir}
                ayahNumber={selectedAyah.number}
              />
            ) : (
              <p className="font-amiri text-justify">
                {surah.ayahs.map((ayah) => (
                  <span 
                    key={ayah.number} 
                    onClick={() => handleAyahClick(ayah)}
                    className="cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900 hover:text-emerald-900 dark:hover:text-emerald-100 rounded px-1 py-0.5 transition-all duration-200"
                    data-testid={`ayah-${ayah.number}`}
                  >
                    {ayah.text}
                    <span className="inline-flex items-center justify-center w-8 h-8 mx-1 text-sm bg-emerald-600 dark:bg-emerald-700 text-white rounded-full">{toArabicNumeral(ayah.number)}</span>
                    {" "}
                  </span>
                ))}
              </p>
            )}

            <div className="w-full flex justify-center py-6 mt-6">
              <div className="px-6 py-3 bg-gradient-to-r from-emerald-100 to-emerald-50 dark:from-emerald-900 dark:to-gray-800 rounded-full flex items-center justify-center border-2 border-emerald-600 dark:border-emerald-400">
                <span className="text-emerald-700 dark:text-emerald-300 text-lg font-amiri">صدق الله العظيم</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  } else {
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
        <Card className="bg-gradient-to-br from-white to-emerald-50 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-2xl w-full max-w-5xl mx-auto p-6 md:p-10 min-h-[calc(100vh-130px)] border-2 border-emerald-200 dark:border-emerald-800">
          <div className="flex flex-col sm:flex-row justify-center gap-3 mb-6 px-2">
            <Button 
              variant={showTafsir ? "default" : "outline"} 
              className="flex items-center gap-2 w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white border-emerald-600"
              onClick={() => setShowTafsir(!showTafsir)}
              data-testid="button-toggle-tafsir"
            >
              <BookOpen className="h-4 w-4" />
              <span>التفسير</span>
            </Button>
          
            <Button 
              variant={showAudioPlayer ? "default" : "outline"} 
              className="flex items-center gap-2 w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white border-emerald-600"
              onClick={() => setShowAudioPlayer(!showAudioPlayer)}
              data-testid="button-toggle-audio"
            >
              <Headphones className="h-4 w-4" />
              <span>الاستماع</span>
            </Button>
          </div>
        
          {showAudioPlayer && selectedAyah && (
            <div className="mb-6">
              <AudioPlayer 
                surahNumber={parseInt(Object.keys(pageData.surahs).find(
                  surahNum => pageData.surahs[surahNum].ayahs.some(a => a.number === selectedAyah.number)
                ) || "1")} 
                ayahNumber={selectedAyah.number} 
              />
            </div>
          )}
        
          {showTafsir && selectedAyah && (
            <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-inner border border-emerald-100 dark:border-emerald-900">
              <TafsirView
                text={selectedAyah.text}
                tafsir={selectedAyah.tafsir}
                ayahNumber={selectedAyah.number}
              />
            </div>
          )}
        
          {(!showTafsir || !selectedAyah) && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 md:p-8 shadow-inner border border-emerald-100 dark:border-emerald-900" data-testid="quran-page-container">
              {surahsOnPage.map(([surahNum, surah], index) => (
                <div key={surahNum}>
                  {index > 0 && (
                    <div className="my-8">
                      <Separator className="bg-gradient-to-r from-transparent via-emerald-300 dark:via-emerald-700 to-transparent h-0.5" />
                    </div>
                  )}
            
                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-emerald-600"></div>
                      <BookMarked className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                      <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-emerald-600"></div>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-amiri text-emerald-700 dark:text-emerald-300">سورة {surah.name}</h2>
                    <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent mx-auto my-3 rounded-full"></div>
                    <div className="text-lg md:text-xl font-amiri text-emerald-800 dark:text-emerald-200">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
                  </div>
            
                  <div className="quran-text text-xl md:text-2xl leading-loose text-gray-800 dark:text-gray-100">
                    <p className="font-amiri text-justify mb-4">
                      {surah.ayahs.map((ayah) => (
                        <span 
                          key={ayah.number} 
                          onClick={() => handleAyahClick(ayah)}
                          className="cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900 hover:text-emerald-900 dark:hover:text-emerald-100 rounded px-1 py-0.5 transition-all duration-200"
                          data-testid={`ayah-${ayah.number}`}
                        >
                          {ayah.text}
                          <span className="inline-flex items-center justify-center w-8 h-8 mx-1 text-sm bg-emerald-600 dark:bg-emerald-700 text-white rounded-full">{toArabicNumeral(ayah.number)}</span>
                          {" "}
                        </span>
                      ))}
                    </p>
                  </div>
                </div>
              ))}
        
              <div className="w-full flex justify-center py-6 mt-6">
                <div className="px-6 py-3 bg-gradient-to-r from-emerald-100 to-emerald-50 dark:from-emerald-900 dark:to-gray-800 rounded-full flex items-center justify-center border-2 border-emerald-600 dark:border-emerald-400">
                  <span className="text-emerald-700 dark:text-emerald-300 text-lg font-amiri">صدق الله العظيم</span>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    );
  }
};

export default QuranReader;
