import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search,
  BookMarked,
  Volume2,
  ZoomIn,
  ZoomOut,
  BookOpen,
  CheckCircle2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useTodayAssignment } from '@/hooks/useTodayAssignment';

interface MushafQuranReaderProps {
  initialPage?: number;
}

export function MushafQuranReader({ initialPage = 1 }: MushafQuranReaderProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [searchTerm, setSearchTerm] = useState('');
  const [fontSize, setFontSize] = useState(20);
  const [showSearch, setShowSearch] = useState(false);
  const { assignment, memorizationRanges, reviewRanges, isMemorization, isReview } = useTodayAssignment();

  const { data: pageData, isLoading } = useQuery<{ verses?: Array<{ text: string; number: number; numberInSurah: number }> }>({
    queryKey: ['/api/quran/page', currentPage],
  });

  const totalPages = 604;

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

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
      {/* Assignment Summary */}
      {assignment && (memorizationRanges.length > 0 || reviewRanges.length > 0) && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 border-b border-emerald-200 dark:border-emerald-800"
        >
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center gap-4 flex-wrap">
              {memorizationRanges.length > 0 && (
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                    الحفظ: {memorizationRanges.map(r => `${r.surah}:${r.startVerse}-${r.endVerse}`).join(', ')}
                  </span>
                </div>
              )}
              {reviewRanges.length > 0 && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    المراجعة: {reviewRanges.map(r => `${r.surah}:${r.startVerse}-${r.endVerse}`).join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Top Controls */}
      <div className="bg-white dark:bg-gray-900 border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          {/* Page Navigation */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              data-testid="button-prev-page"
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
              <span className="text-sm text-muted-foreground">
                من {totalPages}
              </span>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              data-testid="button-next-page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>

          {/* Center Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSearch(!showSearch)}
              data-testid="button-search"
            >
              <Search className="h-4 w-4 ml-2" />
              بحث
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              data-testid="button-bookmarks"
            >
              <BookMarked className="h-4 w-4 ml-2" />
              العلامات
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              data-testid="button-audio"
            >
              <Volume2 className="h-4 w-4 ml-2" />
              تشغيل
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

        {/* Search Bar (Collapsible) */}
        {showSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t bg-muted/30 dark:bg-gray-800/30"
          >
            <div className="max-w-7xl mx-auto px-4 py-3">
              <Input
                placeholder="ابحث عن آية أو كلمة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
                data-testid="input-search-quran"
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Mushaf Page Display */}
      <div className="flex-1 overflow-auto p-4 md:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="overflow-hidden shadow-2xl border-4 border-amber-200 dark:border-amber-900 bg-white dark:bg-gray-900">
              <CardContent className="p-8 md:p-12">
                {/* Page Header */}
                <div className="text-center mb-8 pb-4 border-b-2 border-amber-200 dark:border-amber-800">
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="text-lg px-4 py-2">
                      الجزء {Math.ceil(currentPage / 20)}
                    </Badge>
                    <div className="text-center">
                      <div className="text-3xl font-arabic-serif text-islamic-green dark:text-green-400 mb-2">
                        بسم الله الرحمن الرحيم
                      </div>
                    </div>
                    <Badge variant="outline" className="text-lg px-4 py-2">
                      صفحة {currentPage}
                    </Badge>
                  </div>
                </div>

                {/* Page Content */}
                {isLoading ? (
                  <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-islamic-green dark:border-green-400 mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">جاري تحميل الصفحة...</p>
                  </div>
                ) : (
                  <div 
                    className="quran-text font-arabic-serif leading-loose text-justify"
                    style={{ 
                      fontSize: `${fontSize}px`,
                      lineHeight: '2.5em',
                      color: 'var(--foreground)'
                    }}
                  >
                    {pageData?.verses?.map((verse: any, index: number) => {
                      const surahNum = Math.floor(verse.number / 1000);
                      const ayahNum = verse.number % 1000;
                      const isMemorizationVerse = isMemorization(surahNum, ayahNum);
                      const isReviewVerse = isReview(surahNum, ayahNum);
                      
                      return (
                        <span
                          key={index}
                          className={`inline px-1 rounded cursor-pointer transition-all ${
                            isMemorizationVerse 
                              ? 'bg-emerald-200 dark:bg-emerald-900/50 hover:bg-emerald-300 dark:hover:bg-emerald-800/70' 
                              : isReviewVerse
                              ? 'bg-blue-200 dark:bg-blue-900/50 hover:bg-blue-300 dark:hover:bg-blue-800/70'
                              : 'hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
                          }`}
                          data-testid={`verse-${verse.number}`}
                        >
                          {verse.text}
                          <span className="text-islamic-green dark:text-green-400 mx-1">
                            ﴿{verse.numberInSurah}﴾
                          </span>
                        </span>
                      );
                    })}
                    
                    {/* Placeholder if no data */}
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
              <p>استخدم الأسهم ← → أو اسحب لليمين/اليسار للتنقل بين الصفحات</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
