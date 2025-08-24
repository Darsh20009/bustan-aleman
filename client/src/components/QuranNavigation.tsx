import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Search, BookOpen, List } from "lucide-react";

interface QuranNavigationProps {
  currentPage?: number;
  currentSurah?: number;
  mode: 'page' | 'surah';
  onPageChange: (page: number) => void;
  onSurahChange: (surah: number) => void;
  onModeChange: (mode: 'page' | 'surah') => void;
}

interface Surah {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
}

const QuranNavigation = ({ 
  currentPage = 1, 
  currentSurah = 1, 
  mode, 
  onPageChange, 
  onSurahChange, 
  onModeChange 
}: QuranNavigationProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPage, setSelectedPage] = useState(currentPage.toString());
  const [selectedSurah, setSelectedSurah] = useState(currentSurah.toString());

  // Fetch surahs list
  const { data: surahs } = useQuery<Surah[]>({
    queryKey: ['/api/quran/surahs'],
  });

  // Search in Quran
  const { data: searchResults = [] } = useQuery<any[]>({
    queryKey: ['/api/quran/search', searchQuery],
    enabled: searchQuery.length >= 2,
  });

  const handlePageJump = () => {
    const page = parseInt(selectedPage);
    if (page >= 1 && page <= 604) {
      onPageChange(page);
    }
  };

  const handleSurahJump = () => {
    const surah = parseInt(selectedSurah);
    if (surah >= 1 && surah <= 114) {
      onSurahChange(surah);
    }
  };

  const nextPage = () => {
    if (mode === 'page' && currentPage < 604) {
      onPageChange(currentPage + 1);
    } else if (mode === 'surah' && currentSurah < 114) {
      onSurahChange(currentSurah + 1);
    }
  };

  const previousPage = () => {
    if (mode === 'page' && currentPage > 1) {
      onPageChange(currentPage - 1);
    } else if (mode === 'surah' && currentSurah > 1) {
      onSurahChange(currentSurah - 1);
    }
  };

  // Convert number to Arabic numeral
  const toArabicNumeral = (num: number): string => {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().split('').map(digit => arabicNumerals[parseInt(digit)]).join('');
  };

  return (
    <Card className="p-4 mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
      <div className="flex flex-col space-y-4">
        {/* Mode Selection */}
        <div className="flex justify-center">
          <div className="flex rounded-lg bg-white p-1 shadow-sm border">
            <Button
              variant={mode === 'page' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onModeChange('page')}
              className="flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>عرض الصفحات</span>
            </Button>
            <Button
              variant={mode === 'surah' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onModeChange('surah')}
              className="flex items-center gap-2"
            >
              <List className="w-4 h-4" />
              <span>عرض السور</span>
            </Button>
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Previous/Next Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={previousPage}
              disabled={mode === 'page' ? currentPage <= 1 : currentSurah <= 1}
              className="flex items-center gap-1"
            >
              <ChevronRight className="w-4 h-4" />
              <span>السابق</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={nextPage}
              disabled={mode === 'page' ? currentPage >= 604 : currentSurah >= 114}
              className="flex items-center gap-1"
            >
              <span>التالي</span>
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </div>

          {/* Current Position Display */}
          <div className="text-center">
            {mode === 'page' ? (
              <div className="text-lg font-bold text-amber-800">
                الصفحة {toArabicNumeral(currentPage)} من {toArabicNumeral(604)}
              </div>
            ) : (
              <div className="text-lg font-bold text-amber-800">
                السورة {toArabicNumeral(currentSurah)} من {toArabicNumeral(114)}
              </div>
            )}
          </div>

          {/* Jump Controls */}
          <div className="flex items-center gap-2">
            {mode === 'page' ? (
              <>
                <Input
                  type="number"
                  min="1"
                  max="604"
                  value={selectedPage}
                  onChange={(e) => setSelectedPage(e.target.value)}
                  className="w-20 text-center"
                  placeholder="صفحة"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePageJump}
                >
                  انتقل
                </Button>
              </>
            ) : (
              <>
                <Select value={selectedSurah} onValueChange={setSelectedSurah}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="اختر السورة" />
                  </SelectTrigger>
                  <SelectContent>
                    {surahs?.map((surah) => (
                      <SelectItem key={surah.number} value={surah.number.toString()}>
                        {surah.number}. {surah.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSurahJump}
                >
                  انتقل
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Search Section */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="ابحث في القرآن الكريم..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {searchResults.length > 0 && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  النتائج ({searchResults.length})
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>نتائج البحث عن "{searchQuery}"</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  {searchResults.map((result: any, index: number) => (
                    <Card key={index} className="p-3 cursor-pointer hover:bg-gray-50"
                          onClick={() => {
                            onSurahChange(result.surahNumber);
                            onModeChange('surah');
                          }}>
                      <div className="text-sm text-gray-600 mb-1">
                        {result.surahName} - آية {toArabicNumeral(result.ayahNumber)}
                      </div>
                      <div className="text-lg leading-relaxed">
                        {result.ayahText}
                      </div>
                    </Card>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </Card>
  );
};

export default QuranNavigation;
