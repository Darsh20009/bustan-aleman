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
    <div className="h-full flex flex-col bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Top Controls */}
      <div className="bg-white dark:bg-gray-900 border-b shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Page Navigation */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                data-testid="button-prev-page"
                className="hover:bg-emerald-50 dark:hover:bg-emerald-950"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={currentPage}
                  onChange={(e) => handlePageJump(parseInt(e.target.value) || 1)}
                  className="w-20 text-center"
                  min={1}
                  max={totalPages}
                  data-testid="input-page-number"
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  من {totalPages}
                </span>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                data-testid="button-next-page"
                className="hover:bg-emerald-50 dark:hover:bg-emerald-950"
              >
                <ChevronLeft className="h-4 w-4" />
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
                className="gap-2"
              >
                <BookMarked className="h-4 w-4" />
                <span className="hidden md:inline">وضع الحفظ</span>
              </Button>
              
              <Button
                variant={currentMode === 'recite' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentMode('recite')}
                data-testid="button-recite-mode"
                className="gap-2"
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
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground w-12 text-center">
                {fontSize}px
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setFontSize(prev => Math.min(32, prev + 2))}
                data-testid="button-zoom-in"
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

            <Card className="overflow-hidden shadow-2xl border-4 border-amber-300 dark:border-amber-900 bg-white dark:bg-gray-900">
              <CardContent className="p-6 md:p-12">
                {/* Page Header */}
                <div className="text-center mb-8 pb-4 border-b-2 border-amber-200 dark:border-amber-800">
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="text-base md:text-lg px-3 md:px-4 py-2 bg-emerald-50 dark:bg-emerald-950">
                      الجزء {Math.ceil(currentPage / 20)}
                    </Badge>
                    <div className="text-center flex-1">
                      <div className="text-2xl md:text-3xl font-arabic-serif text-emerald-700 dark:text-emerald-300 mb-2">
                        بسم الله الرحمن الرحيم
                      </div>
                      {pageData?.surahInfo && (
                        <div className="text-lg text-muted-foreground">
                          {pageData.surahInfo.name}
                        </div>
                      )}
                    </div>
                    <Badge variant="outline" className="text-base md:text-lg px-3 md:px-4 py-2 bg-emerald-50 dark:bg-emerald-950">
                      صفحة {currentPage}
                    </Badge>
                  </div>
                </div>

                {/* Page Content */}
                {isLoading ? (
                  <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 dark:border-emerald-400 mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">جاري تحميل الصفحة...</p>
                  </div>
                ) : (
                  <div 
                    className="quran-text font-arabic-serif leading-loose text-justify space-y-2"
                    style={{ 
                      fontSize: `${fontSize}px`,
                      lineHeight: '2.5em',
                      color: 'var(--foreground)'
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
                                <span 
                                  key={wordIndex}
                                  className="hover:bg-amber-100 dark:hover:bg-amber-900/40 cursor-pointer rounded px-0.5 transition-colors"
                                >
                                  {word}{' '}
                                </span>
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
                    
                    {!pageData?.verses && (
                      <div className="text-center py-20 text-muted-foreground">
                        <p className="text-2xl mb-4">الصفحة {currentPage}</p>
                        <p>يتم تحميل محتوى الصفحة من API القرآن الكريم</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Page Footer */}
                <div className="mt-8 pt-4 border-t-2 border-amber-200 dark:border-amber-800 text-center">
                  <div className="flex justify-center items-center gap-8 text-sm text-muted-foreground">
                    <span>الحزب {Math.ceil(currentPage / 10)}</span>
                    <span>•</span>
                    <span>الربع {Math.ceil(currentPage / 5)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Page Navigation Hint */}
            <div className="mt-4 text-center text-sm text-muted-foreground">
              <p>استخدم الأسهم ← → أو الأزرار أعلاه للتنقل بين الصفحات</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
