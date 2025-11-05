import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  BookMarked,
  ZoomIn,
  ZoomOut,
  Eye,
  Maximize2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { QuranSearch } from '@/components/QuranSearch';
import { EnhancedAudioPlayer } from '@/components/EnhancedAudioPlayer';
import { MemorizationMarkers } from '@/components/MemorizationMarkers';
import { WordNotes } from '@/components/WordNotes';
import { RecitationMode } from '@/components/RecitationMode';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EnhancedMushafReaderProps {
  initialPage?: number;
  mode?: 'read' | 'memorize' | 'recite';
}

export function EnhancedMushafReader({ initialPage = 1, mode = 'read' }: EnhancedMushafReaderProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem('quranFontSize');
    return saved ? parseInt(saved) : 20;
  });
  const [currentMode, setCurrentMode] = useState(mode);
  const [currentAyahForAudio, setCurrentAyahForAudio] = useState<number>(1);

  const { data: pageData, isLoading } = useQuery<{ 
    verses?: Array<{ 
      text: string; 
      number: number; 
      numberInSurah: number;
      surahNumber: number;
      surahName: string;
    }>;
    surahInfo?: {
      number: number;
      name: string;
      startPage: number;
      endPage: number;
    };
  }>({
    queryKey: ['/api/quran/page', currentPage],
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    gcTime: 1000 * 60 * 60 * 24, // Keep in cache for 24 hours
  });

  const totalPages = 604;

  useEffect(() => {
    localStorage.setItem('quranFontSize', fontSize.toString());
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('lastQuranPage', currentPage.toString());
  }, [currentPage]);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handlePageJump = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSearchResultClick = async (surah: number, ayah: number) => {
    // Navigate to the page containing this ayah
    try {
      // Fetch the page data for this surah/ayah from the API
      const response = await fetch(`/api/quran/surah/${surah}/ayah/${ayah}/page`);
      if (response.ok) {
        const data = await response.json();
        if (data.page) {
          setCurrentPage(data.page);
        }
      } else {
        console.error('Failed to find page for surah', surah, 'ayah', ayah);
      }
    } catch (error) {
      console.error('Error navigating to ayah:', error);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        if (e.key === 'ArrowRight') goToPreviousPage();
        if (e.key === 'ArrowLeft') goToNextPage();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage]);

  if (currentMode === 'recite' && pageData?.verses) {
    return (
      <div className="h-full p-4 md:p-8">
        <div className="mb-4">
          <Button
            variant="outline"
            onClick={() => setCurrentMode('read')}
            data-testid="button-exit-recitation"
          >
            <ChevronRight className="ml-2 h-4 w-4" />
            العودة للقراءة
          </Button>
        </div>
        <RecitationMode
          surahNumber={pageData.verses[0]?.surahNumber || 1}
          ayahs={pageData.verses.map(v => ({
            number: v.number,
            text: v.text,
            numberInSurah: v.numberInSurah
          }))}
          surahName={pageData.verses[0]?.surahName || ''}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Top Controls */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 border-b-4 border-amber-400 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Page Navigation */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                data-testid="button-prev-page"
                className="bg-white/20 hover:bg-white/30 border-white/40 text-white"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
              
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={currentPage}
                  onChange={(e) => handlePageJump(parseInt(e.target.value) || 1)}
                  className="w-20 text-center bg-white/90 border-white text-emerald-800 font-bold"
                  min={1}
                  max={totalPages}
                  data-testid="input-page-number"
                />
                <span className="text-sm text-white font-semibold whitespace-nowrap">
                  من {totalPages}
                </span>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                data-testid="button-next-page"
                className="bg-white/20 hover:bg-white/30 border-white/40 text-white"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </div>

            {/* Center Actions */}
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <QuranSearch onResultClick={handleSearchResultClick} />
              
              <Button
                variant={currentMode === 'memorize' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentMode(currentMode === 'memorize' ? 'read' : 'memorize')}
                data-testid="button-memorize-mode"
                className={`gap-2 ${currentMode === 'memorize' ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-white/20 hover:bg-white/30 border-white/40 text-white'}`}
              >
                <BookMarked className="h-4 w-4" />
                <span className="hidden md:inline">وضع الحفظ</span>
              </Button>
              
              <Button
                variant={currentMode === 'recite' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentMode('recite')}
                data-testid="button-recite-mode"
                className={`gap-2 ${currentMode === 'recite' ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-white/20 hover:bg-white/30 border-white/40 text-white'}`}
              >
                <Eye className="h-4 w-4" />
                <span className="hidden md:inline">وضع التلاوة</span>
              </Button>
            </div>

            {/* Font Size Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setFontSize(prev => Math.max(14, prev - 2))}
                data-testid="button-zoom-out"
                className="bg-white/20 hover:bg-white/30 border-white/40 text-white"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm text-white font-semibold w-12 text-center">
                {fontSize}px
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setFontSize(prev => Math.min(32, prev + 2))}
                data-testid="button-zoom-in"
                className="bg-white/20 hover:bg-white/30 border-white/40 text-white"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mushaf Page Display */}
      <div className="flex-1 overflow-auto p-4 md:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="max-w-5xl mx-auto"
          >
            {/* Audio Player - Always visible */}
            {pageData?.verses && pageData.verses.length > 0 && (
              <div className="mb-6">
                <EnhancedAudioPlayer
                  surahNumber={pageData.verses[0].surahNumber}
                  ayahNumber={currentAyahForAudio}
                  onAyahChange={setCurrentAyahForAudio}
                  totalAyahs={pageData.verses[pageData.verses.length - 1].numberInSurah}
                />
              </div>
            )}

            <Card className="overflow-hidden shadow-2xl border-2 border-emerald-200 bg-white dark:bg-gray-900">
              <CardContent className="p-8 md:p-16">
                {/* Page Header - مبسط وجميل */}
                <div className="text-center mb-6 pb-6 border-b-2 border-emerald-300">
                  <div className="text-3xl md:text-4xl font-arabic-serif text-emerald-700 dark:text-emerald-300 mb-3">
                    بسم الله الرحمن الرحيم
                  </div>
                  {pageData?.surahInfo && (
                    <div className="text-xl text-emerald-600 font-semibold">
                      {pageData.surahInfo.name}
                    </div>
                  )}
                </div>

                {/* Page Content */}
                <div 
                  className="quran-text font-arabic-serif leading-loose text-center space-y-3"
                  style={{ 
                    fontSize: `${fontSize}px`,
                    lineHeight: '2.8em',
                    color: '#065f46'
                  }}
                >
                  {pageData?.verses?.map((verse, index) => {
                    const words = verse.text.split(' ');
                    return (
                      <div 
                        key={index}
                        className="inline-block mb-2"
                        onMouseEnter={() => setCurrentAyahForAudio(verse.numberInSurah)}
                      >
                        <span className="inline hover:bg-emerald-50 dark:hover:bg-emerald-950/30 px-1 rounded transition-colors">
                          {currentMode === 'memorize' ? (
                            words.map((word, wordIndex) => (
                              <WordNotes
                                key={wordIndex}
                                surahNumber={verse.surahNumber}
                                ayahNumber={verse.numberInSurah}
                                wordIndex={wordIndex}
                                wordText={word}
                              >
                                {word}{' '}
                              </WordNotes>
                            ))
                          ) : (
                            verse.text
                          )}
                          <span className="text-emerald-600 dark:text-emerald-400 mx-2">
                            ﴿{verse.numberInSurah}﴾
                          </span>
                        </span>
                        {currentMode === 'memorize' && (
                          <div className="inline-block mr-2">
                            <MemorizationMarkers
                              surahNumber={verse.surahNumber}
                              ayahNumber={verse.numberInSurah}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Page Footer */}
                <div className="mt-8 pt-6 border-t-2 border-emerald-300 text-center">
                  <div className="flex justify-center items-center gap-6">
                    <Badge className="bg-emerald-100 text-emerald-800 px-4 py-2">
                      الجزء {Math.ceil(currentPage / 20)}
                    </Badge>
                    <Badge className="bg-emerald-100 text-emerald-800 px-4 py-2">
                      صفحة {currentPage}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Page Navigation Hint */}
            <div className="mt-6 text-center">
              <p className="text-emerald-700 dark:text-emerald-300 font-semibold">
                ← استخدم الأزرار أعلاه أو الأسهم للتنقل →
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
