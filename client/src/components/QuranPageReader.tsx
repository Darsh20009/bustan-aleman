import { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { 
  ChevronLeft,
  ChevronRight,
  BookOpen,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Settings
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface QuranPageProps {
  studentId?: string;
  onBack?: () => void;
}

interface PageData {
  page: number;
  juz: number;
  ayahs: Array<{
    number: number;
    text: string;
    surah: {
      number: number;
      name: string;
      englishName: string;
    };
  }>;
}

export default function QuranPageReader({ studentId, onBack }: QuranPageProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [fontSize, setFontSize] = useState([28]);
  const [lineSpacing, setLineSpacing] = useState([2]);
  const { toast } = useToast();

  const { data: pageData, isLoading } = useQuery<PageData>({
    queryKey: ['/api/quran/page', currentPage],
    queryFn: async () => {
      const response = await fetch(`https://api.alquran.cloud/v1/page/${currentPage}/quran-uthmani`);
      if (!response.ok) throw new Error('فشل تحميل الصفحة');
      const result = await response.json();
      if (result.code !== 200) throw new Error('بيانات غير صحيحة');
      return {
        page: result.data.number,
        juz: result.data.surahs[0]?.ayahs[0]?.juz || 1,
        ayahs: result.data.ayahs.map((ayah: any) => ({
          number: ayah.number,
          text: ayah.text,
          surah: {
            number: ayah.surah.number,
            name: ayah.surah.name,
            englishName: ayah.surah.englishName
          }
        }))
      };
    },
  });

  const goToNextPage = () => {
    if (currentPage < 604) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= 604) {
      setCurrentPage(page);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToNextPage();
      } else if (e.key === 'ArrowRight') {
        goToPreviousPage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage]);

  const increaseFontSize = () => {
    setFontSize(prev => [Math.min(prev[0] + 2, 48)]);
  };

  const decreaseFontSize = () => {
    setFontSize(prev => [Math.max(prev[0] - 2, 18)]);
  };

  const resetSettings = () => {
    setFontSize([28]);
    setLineSpacing([2]);
    toast({
      title: "✅ تم إعادة التعيين",
      description: "تمت إعادة الإعدادات إلى الوضع الافتراضي"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50" dir="rtl">
      {/* Header with Controls */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-emerald-600 to-green-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Back Button & Page Info */}
            <div className="flex items-center gap-4">
              {onBack && (
                <Button
                  onClick={onBack}
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-emerald-700"
                  data-testid="button-back-home"
                >
                  ← العودة
                </Button>
              )}
              <div className="flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-white" />
                <div className="text-white">
                  <div className="text-lg font-bold">صفحة {currentPage}</div>
                  <div className="text-xs opacity-90">من 604</div>
                </div>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center gap-2">
              <Button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-emerald-700 disabled:opacity-50"
                data-testid="button-previous-page"
              >
                <ChevronRight className="w-5 h-5" />
                <span className="mr-1">السابق</span>
              </Button>

              <input
                type="number"
                min="1"
                max="604"
                value={currentPage}
                onChange={(e) => goToPage(Number(e.target.value))}
                className="w-20 px-2 py-1 text-center rounded-md border-2 border-emerald-300 bg-white text-emerald-900 font-bold"
                data-testid="input-page-number"
              />

              <Button
                onClick={goToNextPage}
                disabled={currentPage === 604}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-emerald-700 disabled:opacity-50"
                data-testid="button-next-page"
              >
                <span className="ml-1">التالي</span>
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </div>

            {/* Font Controls */}
            <div className="flex items-center gap-2">
              <Button
                onClick={decreaseFontSize}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-emerald-700"
                data-testid="button-decrease-font"
              >
                <ZoomOut className="w-5 h-5" />
              </Button>

              <span className="text-white text-sm min-w-[3rem] text-center">
                {fontSize[0]}px
              </span>

              <Button
                onClick={increaseFontSize}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-emerald-700"
                data-testid="button-increase-font"
              >
                <ZoomIn className="w-5 h-5" />
              </Button>

              <Button
                onClick={resetSettings}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-emerald-700"
                data-testid="button-reset-settings"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Page Progress Bar */}
          <div className="mt-3">
            <div className="w-full bg-emerald-800/30 rounded-full h-2">
              <div
                className="bg-emerald-200 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentPage / 604) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quran Page Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-white via-emerald-50/30 to-green-50/30 shadow-2xl border-4 border-emerald-200/50 rounded-2xl overflow-hidden">
              {/* Decorative Header */}
              <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-600 text-white py-4 px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {pageData?.ayahs[0] && (
                      <>
                        <Badge className="bg-emerald-800 text-white px-4 py-1 text-base">
                          {pageData.ayahs[0].surah.name}
                        </Badge>
                        <span className="text-emerald-100 text-sm">
                          ({pageData.ayahs[0].surah.englishName})
                        </span>
                      </>
                    )}
                  </div>
                  <Badge className="bg-emerald-800 text-white px-4 py-1 text-base">
                    الجزء {pageData?.juz || 1}
                  </Badge>
                </div>
              </div>

              {/* Page Content */}
              <div className="p-8 md:p-12">
                {isLoading ? (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 mx-auto mb-4" />
                      <p className="text-emerald-700 text-lg font-semibold">جاري التحميل...</p>
                    </div>
                  </div>
                ) : (
                  <div
                    className="text-right leading-loose space-y-1"
                    style={{
                      fontSize: `${fontSize[0]}px`,
                      lineHeight: `${lineSpacing[0]}em`,
                    }}
                  >
                    {/* بسم الله الرحمن الرحيم في بداية السور */}
                    {pageData?.ayahs[0]?.number === 1 && pageData.ayahs[0].surah.number !== 1 && pageData.ayahs[0].surah.number !== 9 && (
                      <div className="text-center mb-8 py-4">
                        <p className="text-emerald-800 font-semibold text-3xl">
                          بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                        </p>
                      </div>
                    )}

                    {/* Ayahs */}
                    <div className="space-y-3">
                      {pageData?.ayahs.map((ayah, index) => (
                        <span
                          key={ayah.number}
                          className="inline font-arabic text-emerald-900"
                          data-testid={`ayah-${ayah.number}`}
                        >
                          {ayah.text}
                          <span className="inline-flex items-center justify-center w-8 h-8 mx-2 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 text-white text-sm font-bold shadow-md">
                            {ayah.number}
                          </span>
                          {' '}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Decorative Bottom Border */}
                <div className="mt-12 pt-6 border-t-2 border-emerald-200">
                  <div className="flex items-center justify-center gap-2 text-emerald-600">
                    <div className="w-16 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent rounded-full" />
                    <BookOpen className="w-5 h-5" />
                    <div className="w-16 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent rounded-full" />
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Quick Page Jumps */}
        <div className="mt-6 grid grid-cols-4 gap-3">
          {[1, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360, 390, 420, 450, 480, 510, 540, 570, 600].map((page) => (
            <Button
              key={page}
              onClick={() => goToPage(page)}
              variant={currentPage === page ? "default" : "outline"}
              className={
                currentPage === page
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700"
                  : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              }
              data-testid={`button-jump-${page}`}
            >
              صفحة {page}
            </Button>
          ))}
        </div>
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="fixed bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 border-2 border-emerald-200">
        <div className="text-xs text-emerald-800">
          <p className="font-bold mb-2">اختصارات لوحة المفاتيح:</p>
          <p>← السهم الأيسر: الصفحة التالية</p>
          <p>→ السهم الأيمن: الصفحة السابقة</p>
        </div>
      </div>
    </div>
  );
}
