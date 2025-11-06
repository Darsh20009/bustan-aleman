import { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  ChevronLeft,
  ChevronRight,
  BookOpen,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  StickyNote,
  Bookmark,
  CheckCircle2,
  RefreshCw,
  Search,
  X,
  Play,
  Pause,
  Volume2,
  FileText
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface QuranPageProps {
  studentId?: string;
  onBack?: () => void;
}

interface Ayah {
  number: number;
  numberInSurah: number;
  text: string;
  surah: {
    number: number;
    name: string;
    englishName: string;
  };
  audio?: string;
}

interface Reciter {
  id: string;
  name: string;
  style: string;
}

interface PageData {
  page: number;
  juz: number;
  ayahs: Ayah[];
}

interface AyahNote {
  surahNumber: number;
  ayahNumber: number;
  note: string;
}

interface AyahMarker {
  surahNumber: number;
  ayahNumber: number;
  type: 'memorized' | 'review';
}

export default function QuranPageReader({ studentId, onBack }: QuranPageProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [fontSize, setFontSize] = useState([28]);
  const [lineSpacing, setLineSpacing] = useState([2]);
  const { toast } = useToast();

  const [notes, setNotes] = useState<AyahNote[]>([]);
  const [markers, setMarkers] = useState<AyahMarker[]>([]);
  const [selectedAyah, setSelectedAyah] = useState<Ayah | null>(null);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState(false);
  const [selectedReciter, setSelectedReciter] = useState('ar.alafasy');
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const [showTafsir, setShowTafsir] = useState<{ [key: number]: boolean }>({});
  const [tafsirData, setTafsirData] = useState<{ [key: number]: string }>({});

  const reciters: Reciter[] = [
    { id: 'ar.alafasy', name: 'مشاري العفاسي', style: 'مرتل' },
    { id: 'ar.abdulbasitmurattal', name: 'عبد الباسط عبد الصمد', style: 'مرتل' },
    { id: 'ar.abdulsamad', name: 'عبد الباسط عبد الصمد', style: 'مجود' },
    { id: 'ar.shaatree', name: 'أبو بكر الشاطري', style: 'مرتل' },
    { id: 'ar.husary', name: 'محمود خليل الحصري', style: 'مرتل' },
    { id: 'ar.minshawi', name: 'محمد صديق المنشاوي', style: 'مجود' },
    { id: 'ar.sudais', name: 'عبد الرحمن السديس', style: 'مرتل' },
  ];

  useEffect(() => {
    const savedNotes = localStorage.getItem('quran-notes');
    const savedMarkers = localStorage.getItem('quran-markers');
    if (savedNotes) setNotes(JSON.parse(savedNotes));
    if (savedMarkers) setMarkers(JSON.parse(savedMarkers));
  }, []);

  const saveNotes = (newNotes: AyahNote[]) => {
    setNotes(newNotes);
    localStorage.setItem('quran-notes', JSON.stringify(newNotes));
  };

  const saveMarkers = (newMarkers: AyahMarker[]) => {
    setMarkers(newMarkers);
    localStorage.setItem('quran-markers', JSON.stringify(newMarkers));
  };

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
          numberInSurah: ayah.numberInSurah,
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

  const openNoteDialog = (ayah: Ayah) => {
    setSelectedAyah(ayah);
    const existingNote = notes.find(
      n => n.surahNumber === ayah.surah.number && n.ayahNumber === ayah.numberInSurah
    );
    setNoteText(existingNote?.note || '');
    setNoteDialogOpen(true);
  };

  const saveNote = () => {
    if (!selectedAyah) return;
    
    const newNotes = notes.filter(
      n => !(n.surahNumber === selectedAyah.surah.number && n.ayahNumber === selectedAyah.numberInSurah)
    );
    
    if (noteText.trim()) {
      newNotes.push({
        surahNumber: selectedAyah.surah.number,
        ayahNumber: selectedAyah.numberInSurah,
        note: noteText.trim()
      });
    }
    
    saveNotes(newNotes);
    setNoteDialogOpen(false);
    toast({
      title: "✅ تم حفظ الملاحظة",
      description: noteText.trim() ? "تمت إضافة الملاحظة بنجاح" : "تم حذف الملاحظة"
    });
  };

  const toggleMarker = (ayah: Ayah, type: 'memorized' | 'review') => {
    const existingMarkerIndex = markers.findIndex(
      m => m.surahNumber === ayah.surah.number && 
           m.ayahNumber === ayah.numberInSurah && 
           m.type === type
    );

    let newMarkers: AyahMarker[];
    if (existingMarkerIndex >= 0) {
      newMarkers = markers.filter((_, idx) => idx !== existingMarkerIndex);
      toast({
        title: "تم الإلغاء",
        description: type === 'memorized' ? "تم إلغاء علامة الحفظ" : "تم إلغاء علامة المراجعة"
      });
    } else {
      newMarkers = [...markers, {
        surahNumber: ayah.surah.number,
        ayahNumber: ayah.numberInSurah,
        type
      }];
      toast({
        title: "✅ تم الإضافة",
        description: type === 'memorized' ? "تمت إضافة علامة الحفظ" : "تمت إضافة علامة المراجعة"
      });
    }
    
    saveMarkers(newMarkers);
  };

  const getAyahNote = (ayah: Ayah) => {
    return notes.find(
      n => n.surahNumber === ayah.surah.number && n.ayahNumber === ayah.numberInSurah
    );
  };

  const hasMarker = (ayah: Ayah, type: 'memorized' | 'review') => {
    return markers.some(
      m => m.surahNumber === ayah.surah.number && 
           m.ayahNumber === ayah.numberInSurah && 
           m.type === type
    );
  };

  const matchesSearch = (ayah: Ayah) => {
    if (!searchQuery.trim()) return true;
    return ayah.text.includes(searchQuery.trim());
  };

  const filteredAyahs = pageData?.ayahs.filter(matchesSearch) || [];

  const playAyah = async (ayah: Ayah) => {
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
      setPlayingAyah(null);
    }

    if (playingAyah === ayah.number) {
      return;
    }

    try {
      const audioUrl = `https://cdn.islamic.network/quran/audio/128/${selectedReciter}/${ayah.number}.mp3`;
      const audio = new Audio(audioUrl);
      
      audio.addEventListener('ended', () => {
        setPlayingAyah(null);
        setCurrentAudio(null);
      });

      audio.addEventListener('error', () => {
        toast({
          title: "خطأ",
          description: "فشل تشغيل الصوت",
          variant: "destructive"
        });
        setPlayingAyah(null);
        setCurrentAudio(null);
      });

      await audio.play();
      setCurrentAudio(audio);
      setPlayingAyah(ayah.number);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل تشغيل الصوت",
        variant: "destructive"
      });
    }
  };

  const toggleTafsir = async (ayah: Ayah) => {
    const ayahKey = ayah.number;
    
    if (showTafsir[ayahKey]) {
      setShowTafsir(prev => ({ ...prev, [ayahKey]: false }));
      return;
    }

    if (!tafsirData[ayahKey]) {
      try {
        const response = await fetch(`https://api.alquran.cloud/v1/ayah/${ayah.number}/ar.muyassar`);
        const result = await response.json();
        
        if (result.code === 200 && result.data) {
          setTafsirData(prev => ({ ...prev, [ayahKey]: result.data.text }));
          setShowTafsir(prev => ({ ...prev, [ayahKey]: true }));
        }
      } catch (error) {
        toast({
          title: "خطأ",
          description: "فشل تحميل التفسير",
          variant: "destructive"
        });
      }
    } else {
      setShowTafsir(prev => ({ ...prev, [ayahKey]: true }));
    }
  };

  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
      }
    };
  }, [currentAudio]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-100 to-green-50" dir="rtl">
      <div className="sticky top-0 z-50 bg-gradient-to-r from-emerald-600 to-green-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
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

            <div className="flex items-center gap-2">
              <select
                value={selectedReciter}
                onChange={(e) => setSelectedReciter(e.target.value)}
                className="px-3 py-1.5 rounded-md bg-emerald-700 text-white text-sm border-2 border-emerald-500"
                data-testid="select-reciter"
              >
                {reciters.map(reciter => (
                  <option key={reciter.id} value={reciter.id}>
                    {reciter.name} ({reciter.style})
                  </option>
                ))}
              </select>

              <Button
                onClick={() => setSearchMode(!searchMode)}
                size="sm"
                variant="ghost"
                className={`text-white hover:bg-emerald-700 ${searchMode ? 'bg-emerald-700' : ''}`}
                data-testid="button-toggle-search"
              >
                <Search className="w-5 h-5" />
              </Button>

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

          {searchMode && (
            <div className="mt-3">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن آية..."
                  className="w-full px-4 py-2 pr-10 rounded-lg text-emerald-900 border-2 border-emerald-300"
                  data-testid="input-search-ayah"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-600" />
                {searchQuery && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSearchQuery('')}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                    data-testid="button-clear-search"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              {searchQuery && (
                <p className="text-xs text-emerald-100 mt-1">
                  {filteredAyahs.length} آية من أصل {pageData?.ayahs.length || 0}
                </p>
              )}
            </div>
          )}

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

      <div className="max-w-5xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 shadow-2xl border-4 border-green-300/50 rounded-2xl overflow-hidden">
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
                    {pageData?.ayahs[0]?.numberInSurah === 1 && pageData.ayahs[0].surah.number !== 1 && pageData.ayahs[0].surah.number !== 9 && (
                      <div className="text-center mb-8 py-4">
                        <p className="text-emerald-800 font-semibold text-3xl">
                          بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                        </p>
                      </div>
                    )}

                    <div className="space-y-4">
                      {filteredAyahs.length === 0 && searchQuery ? (
                        <div className="text-center py-12">
                          <Search className="w-12 h-12 text-emerald-300 mx-auto mb-4" />
                          <p className="text-emerald-600 text-lg">لم يتم العثور على نتائج</p>
                          <p className="text-emerald-500 text-sm mt-2">جرب كلمات بحث أخرى</p>
                        </div>
                      ) : (
                        filteredAyahs.map((ayah, index) => {
                          const ayahNote = getAyahNote(ayah);
                          const isMemorized = hasMarker(ayah, 'memorized');
                          const needsReview = hasMarker(ayah, 'review');
                          
                          return (
                            <div
                              key={ayah.number}
                              className={`relative p-4 rounded-lg transition-all ${
                                isMemorized ? 'bg-green-100 border-r-4 border-green-600' :
                                needsReview ? 'bg-amber-100 border-r-4 border-amber-500' :
                                'bg-green-50/70 border-r-4 border-transparent hover:border-green-300'
                              }`}
                              data-testid={`ayah-container-${ayah.number}`}
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 text-white text-sm font-bold shadow-md">
                                      {ayah.numberInSurah}
                                    </span>
                                    <span className="text-xs text-emerald-600">
                                      {ayah.surah.name}
                                    </span>
                                  </div>
                                  
                                  <p
                                    className="font-arabic text-emerald-900 leading-loose mb-3"
                                    data-testid={`ayah-${ayah.number}`}
                                  >
                                    {ayah.text}
                                  </p>

                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => playAyah(ayah)}
                                      className={`h-8 ${playingAyah === ayah.number ? 'bg-purple-600 text-white border-purple-600' : 'text-purple-600 border-purple-300 hover:bg-purple-50'}`}
                                      data-testid={`button-play-${ayah.number}`}
                                    >
                                      {playingAyah === ayah.number ? (
                                        <Pause className="w-4 h-4 ml-1" />
                                      ) : (
                                        <Play className="w-4 h-4 ml-1" />
                                      )}
                                      {playingAyah === ayah.number ? 'إيقاف' : 'استماع'}
                                    </Button>

                                    <Button
                                      size="sm"
                                      variant={showTafsir[ayah.number] ? "default" : "outline"}
                                      onClick={() => toggleTafsir(ayah)}
                                      className={`h-8 ${showTafsir[ayah.number] ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'text-indigo-600 border-indigo-300 hover:bg-indigo-50'}`}
                                      data-testid={`button-tafsir-${ayah.number}`}
                                    >
                                      <FileText className="w-4 h-4 ml-1" />
                                      {showTafsir[ayah.number] ? 'إخفاء التفسير' : 'التفسير'}
                                    </Button>

                                    <Button
                                      size="sm"
                                      variant={isMemorized ? "default" : "outline"}
                                      onClick={() => toggleMarker(ayah, 'memorized')}
                                      className={`h-8 ${isMemorized ? 'bg-green-600 hover:bg-green-700 text-white' : 'text-green-600 border-green-300 hover:bg-green-50'}`}
                                      data-testid={`button-memorized-${ayah.number}`}
                                    >
                                      <CheckCircle2 className="w-4 h-4 ml-1" />
                                      {isMemorized ? 'محفوظ' : 'حفظ'}
                                    </Button>
                                    
                                    <Button
                                      size="sm"
                                      variant={needsReview ? "default" : "outline"}
                                      onClick={() => toggleMarker(ayah, 'review')}
                                      className={`h-8 ${needsReview ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'text-amber-600 border-amber-300 hover:bg-amber-50'}`}
                                      data-testid={`button-review-${ayah.number}`}
                                    >
                                      <RefreshCw className="w-4 h-4 ml-1" />
                                      {needsReview ? 'للمراجعة' : 'مراجعة'}
                                    </Button>
                                    
                                    <Button
                                      size="sm"
                                      variant={ayahNote ? "default" : "outline"}
                                      onClick={() => openNoteDialog(ayah)}
                                      className={`h-8 ${ayahNote ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'text-blue-600 border-blue-300 hover:bg-blue-50'}`}
                                      data-testid={`button-note-${ayah.number}`}
                                    >
                                      <StickyNote className="w-4 h-4 ml-1" />
                                      {ayahNote ? 'تعديل الملاحظة' : 'إضافة ملاحظة'}
                                    </Button>
                                  </div>
                                  
                                  {showTafsir[ayah.number] && tafsirData[ayah.number] && (
                                    <div className="mt-3 p-4 bg-indigo-50 border-r-2 border-indigo-400 rounded">
                                      <div className="flex items-start gap-2">
                                        <FileText className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1">
                                          <p className="text-xs text-indigo-600 font-bold mb-1">التفسير الميسر:</p>
                                          <p className="text-indigo-900 text-right text-sm leading-relaxed">{tafsirData[ayah.number]}</p>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {ayahNote && (
                                    <div className="mt-3 p-3 bg-blue-50 border-r-2 border-blue-400 rounded">
                                      <div className="flex items-start gap-2">
                                        <StickyNote className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                        <p className="text-blue-800 text-right text-sm">{ayahNote.note}</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

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

      <div className="fixed bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 border-2 border-emerald-200">
        <div className="text-xs text-emerald-800">
          <p className="font-bold mb-2">اختصارات لوحة المفاتيح:</p>
          <p>← السهم الأيسر: الصفحة التالية</p>
          <p>→ السهم الأيمن: الصفحة السابقة</p>
          <div className="mt-3 pt-3 border-t border-emerald-200">
            <p className="font-bold mb-1">العلامات:</p>
            <div className="flex items-center gap-1 mb-1">
              <CheckCircle2 className="w-3 h-3 text-green-600" />
              <span>محفوظ</span>
            </div>
            <div className="flex items-center gap-1 mb-1">
              <RefreshCw className="w-3 h-3 text-amber-600" />
              <span>للمراجعة</span>
            </div>
            <div className="flex items-center gap-1">
              <StickyNote className="w-3 h-3 text-blue-600" />
              <span>ملاحظة</span>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]" dir="rtl">
          <DialogHeader>
            <DialogTitle>إضافة ملاحظة</DialogTitle>
            <DialogDescription>
              {selectedAyah && (
                <span>
                  {selectedAyah.surah.name} - الآية {selectedAyah.numberInSurah}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="اكتب ملاحظتك هنا..."
              className="min-h-[150px] text-right"
              data-testid="textarea-note"
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setNoteDialogOpen(false)}
                data-testid="button-cancel-note"
              >
                إلغاء
              </Button>
              <Button
                onClick={saveNote}
                className="bg-emerald-600 hover:bg-emerald-700"
                data-testid="button-save-note"
              >
                حفظ
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
