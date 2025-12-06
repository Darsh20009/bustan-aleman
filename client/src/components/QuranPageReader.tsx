import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
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
  FileText,
  Settings,
  Book,
  Navigation,
  Moon,
  Sun
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
  const [fontSize, setFontSize] = useState([32]);
  const [lineSpacing, setLineSpacing] = useState([2.2]);
  const { toast } = useToast();

  const [notes, setNotes] = useState<AyahNote[]>([]);
  const [markers, setMarkers] = useState<AyahMarker[]>([]);
  const [selectedAyah, setSelectedAyah] = useState<Ayah | null>(null);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedReciter, setSelectedReciter] = useState('ar.alafasy');
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [playingAyah, setPlayingAyah] = useState<number | null>(null);
  const [showTafsir, setShowTafsir] = useState<{ [key: number]: boolean }>({});
  const [tafsirData, setTafsirData] = useState<{ [key: number]: string }>({});
  const [globalSearchResults, setGlobalSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [ayahActionPanel, setAyahActionPanel] = useState<Ayah | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [quranTheme, setQuranTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('quran-theme') as 'light' | 'dark' || 'light';
    }
    return 'light';
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isDraggingRef = useRef(false);
  const dragDistanceRef = useRef(0);

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
    const savedPage = localStorage.getItem('quran-current-page');
    if (savedNotes) setNotes(JSON.parse(savedNotes));
    if (savedMarkers) setMarkers(JSON.parse(savedMarkers));
    if (savedPage) setCurrentPage(parseInt(savedPage));
  }, []);

  const toggleQuranTheme = () => {
    const newTheme = quranTheme === 'light' ? 'dark' : 'light';
    setQuranTheme(newTheme);
    localStorage.setItem('quran-theme', newTheme);
  };

  useEffect(() => {
    localStorage.setItem('quran-current-page', currentPage.toString());
  }, [currentPage]);

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

  const goToNextPage = useCallback(() => {
    if (currentPage < 604) {
      setSwipeDirection('left');
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage]);

  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setSwipeDirection('right');
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= 604) {
      setCurrentPage(page);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToNextPage();
      } else if (e.key === 'ArrowRight') {
        goToPreviousPage();
      } else if (e.key === 'Escape') {
        setAyahActionPanel(null);
        setSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNextPage, goToPreviousPage]);

  // Swipe gesture handling - track drag distance to distinguish clicks from swipes
  const handleDragStart = () => {
    isDraggingRef.current = true;
    dragDistanceRef.current = 0;
    setIsDragging(true);
  };

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Track the maximum drag distance
    dragDistanceRef.current = Math.max(dragDistanceRef.current, Math.abs(info.offset.x));
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    const velocity = 500;
    const hadSignificantDrag = dragDistanceRef.current > 10; // Small threshold to detect actual drags vs clicks
    
    // Only trigger page change if drag exceeded threshold
    if (Math.abs(info.offset.x) > threshold || Math.abs(info.velocity.x) > velocity) {
      if (info.offset.x > threshold || info.velocity.x > velocity) {
        goToPreviousPage();
      } else if (info.offset.x < -threshold || info.velocity.x < -velocity) {
        goToNextPage();
      }
    }
    
    // Reset dragging state - use timeout only if there was significant drag
    // This prevents blocking immediate post-drag clicks
    if (hadSignificantDrag) {
      requestAnimationFrame(() => {
        isDraggingRef.current = false;
        setIsDragging(false);
        dragDistanceRef.current = 0;
      });
    } else {
      isDraggingRef.current = false;
      setIsDragging(false);
      dragDistanceRef.current = 0;
    }
  };
  
  // Check if click should be allowed - only block if there was significant drag movement
  const shouldAllowClick = () => {
    return dragDistanceRef.current < 10;
  };

  // Handle ayah click with keyboard support
  const handleAyahKeyDown = (e: React.KeyboardEvent, ayah: Ayah) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleAyahClick(ayah);
    }
  };

  const increaseFontSize = () => {
    setFontSize(prev => [Math.min(prev[0] + 2, 48)]);
  };

  const decreaseFontSize = () => {
    setFontSize(prev => [Math.max(prev[0] - 2, 20)]);
  };

  const resetSettings = () => {
    setFontSize([32]);
    setLineSpacing([2.2]);
    toast({
      title: "تم إعادة التعيين",
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
      title: "تم حفظ الملاحظة",
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
        title: "تمت الإضافة",
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

  const normalizeArabicForSearch = (text: string): string => {
    let normalized = text
      .replace(/[\u064B-\u065F]/g, '')
      .replace(/[\u0670]/g, '')
      .replace(/[\u06D6-\u06DC]/g, '')
      .replace(/[\u06DF-\u06E8]/g, '')
      .replace(/[\u06EA-\u06ED]/g, '')
      .replace(/[\u08D3-\u08E1]/g, '')
      .replace(/[\u08E3-\u08FF]/g, '');
    
    normalized = normalized
      .replace(/[أإآ]/g, 'ا')
      .replace(/[ؤ]/g, 'و')
      .replace(/[ئ]/g, 'ي')
      .replace(/[ة]/g, 'ه')
      .replace(/[ى]/g, 'ي')
      .toLowerCase()
      .trim();
    
    return normalized;
  };

  const searchInQuran = async (query: string) => {
    if (!query.trim() || query.trim().length < 2) {
      setGlobalSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/quran/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const results = await response.json();
        setGlobalSearchResults(results);
      }
    } catch (error) {
      console.error('خطأ في البحث:', error);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        searchInQuran(searchQuery);
      } else {
        setGlobalSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Search filtering for current page ayahs
  const matchesSearch = (ayah: Ayah) => {
    if (!searchQuery.trim()) return true;
    const normalizedQuery = normalizeArabicForSearch(searchQuery);
    const normalizedText = normalizeArabicForSearch(ayah.text);
    return normalizedText.includes(normalizedQuery);
  };

  const filteredAyahs = searchQuery.trim() ? pageData?.ayahs.filter(matchesSearch) || [] : pageData?.ayahs || [];

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

  const handleAyahClick = (ayah: Ayah) => {
    if (ayahActionPanel?.number === ayah.number) {
      setAyahActionPanel(null);
    } else {
      setAyahActionPanel(ayah);
    }
  };

  // Get unique surahs on the page
  const getSurahsOnPage = () => {
    if (!pageData?.ayahs) return [];
    const uniqueSurahs = new Map();
    pageData.ayahs.forEach(ayah => {
      if (!uniqueSurahs.has(ayah.surah.number)) {
        uniqueSurahs.set(ayah.surah.number, ayah.surah);
      }
    });
    return Array.from(uniqueSurahs.values());
  };

  // Page animation variants
  const pageVariants = {
    enter: (direction: 'left' | 'right' | null) => ({
      x: direction === 'left' ? 300 : direction === 'right' ? -300 : 0,
      opacity: 0,
      rotateY: direction === 'left' ? -15 : direction === 'right' ? 15 : 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      rotateY: 0,
    },
    exit: (direction: 'left' | 'right' | null) => ({
      x: direction === 'left' ? -300 : direction === 'right' ? 300 : 0,
      opacity: 0,
      rotateY: direction === 'left' ? 15 : direction === 'right' ? -15 : 0,
    }),
  };

  const isDarkTheme = quranTheme === 'dark';

  return (
    <div className={`min-h-screen ${isDarkTheme ? 'bg-[#1A1A1A]' : 'bg-[#F5F0E6]'}`} dir="rtl">
      {/* Decorative border pattern - hidden on mobile */}
      <div className="hidden sm:block fixed inset-0 pointer-events-none z-0">
        <div className={`absolute inset-4 border-4 ${isDarkTheme ? 'border-[#D4AF37]/20' : 'border-[#8B7355]/20'} rounded-lg`} />
        <div className={`absolute inset-6 border-2 ${isDarkTheme ? 'border-[#D4AF37]/10' : 'border-[#8B7355]/10'} rounded-lg`} />
      </div>

      {/* Top navigation bar */}
      <motion.div 
        className="sticky top-0 z-50 bg-gradient-to-b from-[#2D5A3D] to-[#1E4D2B] shadow-xl"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-3 py-2">
          <div className="flex items-center justify-between gap-2">
            {/* Right side - Back and Surah info */}
            <div className="flex items-center gap-2">
              {onBack && (
                <Button
                  onClick={onBack}
                  size="sm"
                  variant="ghost"
                  className="text-[#D4AF37] hover:bg-white/10"
                  data-testid="button-back-home"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              )}
              <div className="text-[#D4AF37]">
                <div className="text-sm font-bold flex items-center gap-2">
                  <Book className="w-4 h-4" />
                  <span>الجزء {pageData?.juz || 1}</span>
                </div>
                {getSurahsOnPage()[0] && (
                  <div className="text-xs opacity-80">{getSurahsOnPage()[0].name}</div>
                )}
              </div>
            </div>

            {/* Center - Page number with ornamental design */}
            <div className="flex items-center gap-1">
              <Button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                size="sm"
                variant="ghost"
                className="text-[#D4AF37] hover:bg-white/10 disabled:opacity-30"
                data-testid="button-previous-page"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 bg-[#D4AF37]/20 rounded-full blur-md" />
                <div className="relative bg-[#D4AF37] text-[#2D5A3D] px-4 py-1 rounded-full font-bold text-lg min-w-[80px] text-center">
                  {currentPage}
                </div>
              </div>

              <Button
                onClick={goToNextPage}
                disabled={currentPage === 604}
                size="sm"
                variant="ghost"
                className="text-[#D4AF37] hover:bg-white/10 disabled:opacity-30"
                data-testid="button-next-page"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
            </div>

            {/* Left side - Actions */}
            <div className="flex items-center gap-1">
              <Button
                onClick={() => setSearchOpen(true)}
                size="sm"
                variant="ghost"
                className="text-[#D4AF37] hover:bg-white/10"
                data-testid="button-search"
              >
                <Search className="w-5 h-5" />
              </Button>
              <Button
                onClick={() => setShowSettings(true)}
                size="sm"
                variant="ghost"
                className="text-[#D4AF37] hover:bg-white/10"
                data-testid="button-settings"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main content area with swipe gesture */}
      <div 
        ref={containerRef}
        className="relative min-h-[calc(100vh-60px)] flex items-center justify-center p-2 sm:p-4 overflow-hidden"
      >
        <AnimatePresence mode="wait" custom={swipeDirection}>
          <motion.div
            key={currentPage}
            custom={swipeDirection}
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 30,
              duration: 0.4 
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            className="w-full max-w-3xl mx-auto cursor-grab active:cursor-grabbing"
            style={{ perspective: 1000 }}
          >
            {/* Mushaf Page */}
            <div className={`relative ${isDarkTheme ? 'bg-[#2A2A2A]' : 'bg-[#FDF8F0]'} rounded-lg shadow-2xl overflow-hidden`}>
              {/* Ornamental frame - hidden on mobile */}
              <div className="hidden sm:block absolute inset-0 pointer-events-none">
                {/* Corner decorations */}
                <div className={`absolute top-2 right-2 w-12 h-12 border-t-2 border-r-2 ${isDarkTheme ? 'border-[#D4AF37]/40' : 'border-[#8B7355]/40'} rounded-tr-lg`} />
                <div className={`absolute top-2 left-2 w-12 h-12 border-t-2 border-l-2 ${isDarkTheme ? 'border-[#D4AF37]/40' : 'border-[#8B7355]/40'} rounded-tl-lg`} />
                <div className={`absolute bottom-2 right-2 w-12 h-12 border-b-2 border-r-2 ${isDarkTheme ? 'border-[#D4AF37]/40' : 'border-[#8B7355]/40'} rounded-br-lg`} />
                <div className={`absolute bottom-2 left-2 w-12 h-12 border-b-2 border-l-2 ${isDarkTheme ? 'border-[#D4AF37]/40' : 'border-[#8B7355]/40'} rounded-bl-lg`} />
                {/* Inner frame */}
                <div className={`absolute inset-4 border ${isDarkTheme ? 'border-[#D4AF37]/20' : 'border-[#8B7355]/20'} rounded`} />
              </div>

              {/* Page header with Surah name */}
              <div className="bg-gradient-to-r from-[#2D5A3D] via-[#3D7A4D] to-[#2D5A3D] text-white py-2 sm:py-3 px-3 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getSurahsOnPage().map((surah, idx) => (
                      <Badge 
                        key={surah.number} 
                        className="bg-[#D4AF37] text-[#2D5A3D] font-bold"
                      >
                        {surah.name}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-[#D4AF37] text-sm font-medium">
                    صفحة {currentPage} من 604
                  </div>
                </div>
              </div>

              {/* Ayahs content */}
              <div className="p-3 sm:p-6 md:p-10 min-h-[60vh]">
                {isLoading ? (
                  <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                      <div className="relative">
                        <div className={`w-16 h-16 border-4 ${isDarkTheme ? 'border-[#D4AF37]/20' : 'border-[#2D5A3D]/20'} rounded-full`} />
                        <div className={`absolute top-0 left-0 w-16 h-16 border-4 ${isDarkTheme ? 'border-[#D4AF37]' : 'border-[#2D5A3D]'} border-t-transparent rounded-full animate-spin`} />
                      </div>
                      <p className={`${isDarkTheme ? 'text-[#D4AF37]' : 'text-[#2D5A3D]'} mt-4 font-semibold`}>جاري التحميل...</p>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="text-right font-arabic leading-loose"
                    style={{
                      fontSize: `${fontSize[0]}px`,
                      lineHeight: `${lineSpacing[0]}em`,
                    }}
                  >
                    {/* Bismillah for new Surahs */}
                    {pageData?.ayahs[0]?.numberInSurah === 1 && 
                     pageData.ayahs[0].surah.number !== 1 && 
                     pageData.ayahs[0].surah.number !== 9 && (
                      <div className="text-center mb-4 sm:mb-8 py-2 sm:py-4">
                        <div className="inline-block relative">
                          <div className="absolute inset-0 bg-[#D4AF37]/10 blur-xl rounded-full" />
                          <p className={`relative ${isDarkTheme ? 'text-[#D4AF37]' : 'text-[#2D5A3D]'} font-bold text-xl sm:text-2xl md:text-3xl`}>
                            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Continuous text layout like traditional Mushaf */}
                    <div className="text-justify" dir="rtl">
                      {filteredAyahs.length === 0 && searchQuery ? (
                        <div className="text-center py-12">
                          <Search className={`w-12 h-12 ${isDarkTheme ? 'text-[#D4AF37]/40' : 'text-[#8B7355]/40'} mx-auto mb-4`} />
                          <p className={`${isDarkTheme ? 'text-[#D4AF37]' : 'text-[#8B7355]'} text-lg`}>لم يتم العثور على نتائج</p>
                          <p className={`${isDarkTheme ? 'text-[#D4AF37]/60' : 'text-[#8B7355]/60'} text-sm mt-2`}>جرب كلمات بحث أخرى</p>
                        </div>
                      ) : (
                        filteredAyahs.map((ayah, index) => {
                          const isMemorized = hasMarker(ayah, 'memorized');
                          const needsReview = hasMarker(ayah, 'review');
                          const hasNote = getAyahNote(ayah);
                          const isSelected = ayahActionPanel?.number === ayah.number;
                          
                          return (
                            <span
                              key={ayah.number}
                              role="button"
                              tabIndex={0}
                              aria-label={`آية ${ayah.numberInSurah} من ${ayah.surah.name}`}
                              aria-pressed={isSelected}
                              className={`inline cursor-pointer transition-all duration-200 rounded-sm px-0.5 outline-none
                                focus:ring-2 focus:ring-[#D4AF37] focus:ring-offset-1
                                ${isSelected ? 'bg-[#D4AF37]/30' : ''}
                                ${isMemorized ? (isDarkTheme ? 'text-emerald-400' : 'text-[#2D5A3D]') : ''}
                                ${needsReview ? (isDarkTheme ? 'text-amber-400' : 'text-amber-700') : ''}
                                ${!isMemorized && !needsReview ? (isDarkTheme ? 'text-[#E8E8E8]' : 'text-[#1A1A1A]') : ''}
                                hover:bg-[#D4AF37]/20
                              `}
                              onClick={() => shouldAllowClick() && handleAyahClick(ayah)}
                              onKeyDown={(e) => handleAyahKeyDown(e, ayah)}
                              data-testid={`ayah-${ayah.number}`}
                            >
                              {/* Surah header inline */}
                              {ayah.numberInSurah === 1 && index > 0 && (
                                <span className="block w-full text-center my-6">
                                  <span className="inline-block bg-gradient-to-r from-[#2D5A3D] to-[#3D7A4D] text-white px-6 py-2 rounded-full text-lg font-bold shadow-lg">
                                    {ayah.surah.name}
                                  </span>
                                </span>
                              )}
                              {ayah.text}
                              <span className="inline-flex items-center justify-center w-8 h-8 mx-1 text-[#D4AF37] text-sm font-bold align-middle">
                                ﴿{ayah.numberInSurah.toLocaleString('ar-EG')}﴾
                              </span>
                              {/* Markers indicators */}
                              {(isMemorized || needsReview || hasNote) && (
                                <span className="inline-flex gap-0.5 mx-1 align-middle">
                                  {isMemorized && <span className="w-2 h-2 rounded-full bg-emerald-500" aria-label="محفوظ" />}
                                  {needsReview && <span className="w-2 h-2 rounded-full bg-amber-500" aria-label="للمراجعة" />}
                                  {hasNote && <span className="w-2 h-2 rounded-full bg-blue-500" aria-label="يوجد ملاحظة" />}
                                </span>
                              )}
                            </span>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Page footer */}
              <div className="bg-gradient-to-r from-[#2D5A3D] via-[#3D7A4D] to-[#2D5A3D] py-2 px-6">
                <div className="flex items-center justify-center gap-4 text-[#D4AF37] text-sm">
                  <span>الجزء {pageData?.juz || 1}</span>
                  <span className="opacity-50">|</span>
                  <span>الحزب {Math.ceil((pageData?.juz || 1) * 2)}</span>
                </div>
              </div>
            </div>

            {/* Swipe hint */}
            <div className="flex items-center justify-center mt-4 gap-6 text-[#8B7355]/60 dark:text-[#D4AF37]/40 text-sm">
              <div className="flex items-center gap-1">
                <ChevronRight className="w-4 h-4" />
                <span>اسحب للسابق</span>
              </div>
              <div className="flex items-center gap-1">
                <span>اسحب للتالي</span>
                <ChevronLeft className="w-4 h-4" />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows for desktop */}
        <Button
          onClick={goToPreviousPage}
          disabled={currentPage === 1}
          className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 bg-[#2D5A3D] text-[#D4AF37] hover:bg-[#3D7A4D] disabled:opacity-30 rounded-full w-12 h-12"
          size="icon"
          data-testid="button-nav-prev"
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
        <Button
          onClick={goToNextPage}
          disabled={currentPage === 604}
          className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 bg-[#2D5A3D] text-[#D4AF37] hover:bg-[#3D7A4D] disabled:opacity-30 rounded-full w-12 h-12"
          size="icon"
          data-testid="button-nav-next"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
      </div>

      {/* Ayah Action Panel - Appears when ayah is clicked */}
      <AnimatePresence>
        {ayahActionPanel && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#2A2A2A] rounded-t-3xl shadow-2xl border-t-4 border-[#D4AF37]"
          >
            <div className="max-w-3xl mx-auto p-4">
              {/* Handle bar */}
              <div className="flex justify-center mb-3">
                <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
              </div>

              {/* Ayah preview */}
              <div className="mb-4 p-3 bg-[#F5F0E6] dark:bg-[#1A1A1A] rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-[#2D5A3D] text-white">
                    {ayahActionPanel.surah.name}
                  </Badge>
                  <span className="text-sm text-[#8B7355] dark:text-[#D4AF37]">
                    آية {ayahActionPanel.numberInSurah}
                  </span>
                  <Button
                    onClick={() => setAyahActionPanel(null)}
                    size="sm"
                    variant="ghost"
                    className="mr-auto text-gray-400 hover:text-gray-600"
                    data-testid="button-close-panel"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <p className="text-[#1A1A1A] dark:text-[#E8E8E8] text-lg font-arabic leading-relaxed line-clamp-2">
                  {ayahActionPanel.text}
                </p>
              </div>

              {/* Action buttons grid - responsive: 3 cols on mobile, 5 on larger screens */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3 mb-4">
                <Button
                  onClick={() => playAyah(ayahActionPanel)}
                  className={`flex flex-col items-center gap-1 h-auto py-3 sm:py-4 min-h-[60px] sm:min-h-[70px] ${
                    playingAyah === ayahActionPanel.number 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                  }`}
                  data-testid={`button-play-${ayahActionPanel.number}`}
                >
                  {playingAyah === ayahActionPanel.number ? (
                    <Pause className="w-5 h-5 sm:w-6 sm:h-6" />
                  ) : (
                    <Play className="w-5 h-5 sm:w-6 sm:h-6" />
                  )}
                  <span className="text-xs sm:text-sm">استماع</span>
                </Button>

                <Button
                  onClick={() => toggleTafsir(ayahActionPanel)}
                  className={`flex flex-col items-center gap-1 h-auto py-3 sm:py-4 min-h-[60px] sm:min-h-[70px] ${
                    showTafsir[ayahActionPanel.number]
                      ? 'bg-indigo-600 text-white'
                      : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                  }`}
                  data-testid={`button-tafsir-${ayahActionPanel.number}`}
                >
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="text-xs sm:text-sm">التفسير</span>
                </Button>

                <Button
                  onClick={() => toggleMarker(ayahActionPanel, 'memorized')}
                  className={`flex flex-col items-center gap-1 h-auto py-3 sm:py-4 min-h-[60px] sm:min-h-[70px] ${
                    hasMarker(ayahActionPanel, 'memorized')
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                  }`}
                  data-testid={`button-memorized-${ayahActionPanel.number}`}
                >
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="text-xs sm:text-sm">محفوظ</span>
                </Button>

                <Button
                  onClick={() => toggleMarker(ayahActionPanel, 'review')}
                  className={`flex flex-col items-center gap-1 h-auto py-3 sm:py-4 min-h-[60px] sm:min-h-[70px] ${
                    hasMarker(ayahActionPanel, 'review')
                      ? 'bg-amber-600 text-white'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
                  }`}
                  data-testid={`button-review-${ayahActionPanel.number}`}
                >
                  <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="text-xs sm:text-sm">مراجعة</span>
                </Button>

                <Button
                  onClick={() => openNoteDialog(ayahActionPanel)}
                  className={`flex flex-col items-center gap-1 h-auto py-3 sm:py-4 min-h-[60px] sm:min-h-[70px] ${
                    getAyahNote(ayahActionPanel)
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  }`}
                  data-testid={`button-note-${ayahActionPanel.number}`}
                >
                  <StickyNote className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="text-xs sm:text-sm">ملاحظة</span>
                </Button>
              </div>

              {/* Tafsir display */}
              {showTafsir[ayahActionPanel.number] && tafsirData[ayahActionPanel.number] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl mb-3"
                >
                  <h4 className="text-sm font-bold text-indigo-700 dark:text-indigo-300 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    التفسير الميسر
                  </h4>
                  <p className="text-indigo-900 dark:text-indigo-100 text-sm leading-relaxed">
                    {tafsirData[ayahActionPanel.number]}
                  </p>
                </motion.div>
              )}

              {/* Note display */}
              {getAyahNote(ayahActionPanel) && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                  <h4 className="text-sm font-bold text-blue-700 dark:text-blue-300 mb-1 flex items-center gap-2">
                    <StickyNote className="w-4 h-4" />
                    ملاحظتك
                  </h4>
                  <p className="text-blue-900 dark:text-blue-100 text-sm">
                    {getAyahNote(ayahActionPanel)?.note}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Dialog */}
      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#2D5A3D] dark:text-[#D4AF37]">
              <Search className="w-5 h-5" />
              البحث في القرآن
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في القرآن الكريم..."
                className="w-full pr-10 pl-4 py-3 border-2 border-[#2D5A3D]/30 rounded-xl focus:border-[#2D5A3D] focus:ring-2 focus:ring-[#2D5A3D]/20 outline-none transition-all bg-white dark:bg-[#2A2A2A] dark:text-white"
                data-testid="input-search"
              />
            </div>

            {/* Quick navigation */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400 w-full mb-1">انتقال سريع:</span>
              {[1, 50, 100, 200, 300, 400, 500, 604].map((page) => (
                <Button
                  key={page}
                  onClick={() => {
                    goToPage(page);
                    setSearchOpen(false);
                  }}
                  size="sm"
                  variant="outline"
                  className="text-[#2D5A3D] dark:text-[#D4AF37] border-[#2D5A3D]/30 dark:border-[#D4AF37]/30 hover:bg-[#2D5A3D] dark:hover:bg-[#D4AF37] hover:text-white dark:hover:text-[#1A1A1A]"
                  data-testid={`button-quick-nav-${page}`}
                >
                  صفحة {page}
                </Button>
              ))}
            </div>

            {/* Search results */}
            {isSearching && (
              <div className="text-center py-4 text-gray-500">
                <div className="animate-spin w-6 h-6 border-2 border-[#2D5A3D] border-t-transparent rounded-full mx-auto mb-2" />
                جاري البحث...
              </div>
            )}

            {globalSearchResults.length > 0 && (
              <div className="max-h-[40vh] overflow-y-auto space-y-2">
                <p className="text-sm text-[#2D5A3D] dark:text-[#D4AF37] font-bold">
                  عدد النتائج: {globalSearchResults.length}
                </p>
                {globalSearchResults.map((result, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      goToPage(result.page);
                      setSearchOpen(false);
                      setSearchQuery('');
                      setGlobalSearchResults([]);
                    }}
                    className="w-full text-right p-3 bg-[#F5F0E6] dark:bg-[#2A2A2A] hover:bg-[#2D5A3D]/10 rounded-lg border border-[#2D5A3D]/20 transition-colors"
                    data-testid={`search-result-${idx}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-[#2D5A3D] text-white text-xs">
                        {result.surahName}
                      </Badge>
                      <span className="text-xs text-[#8B7355] dark:text-[#D4AF37]">
                        آية {result.ayahNumber} - صفحة {result.page}
                      </span>
                    </div>
                    <p className="text-sm text-[#1A1A1A] dark:text-[#E8E8E8] leading-relaxed line-clamp-2">
                      {result.ayahText}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-[400px]" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#2D5A3D] dark:text-[#D4AF37]">
              <Settings className="w-5 h-5" />
              إعدادات القراءة
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Font size */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                حجم الخط: {fontSize[0]}
              </label>
              <div className="flex items-center gap-3">
                <Button
                  onClick={decreaseFontSize}
                  size="sm"
                  variant="outline"
                  className="border-[#2D5A3D] dark:border-[#D4AF37] text-[#2D5A3D] dark:text-[#D4AF37]"
                  data-testid="button-decrease-font"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div 
                    className="h-full bg-[#2D5A3D] dark:bg-[#D4AF37] rounded-full transition-all"
                    style={{ width: `${((fontSize[0] - 20) / 28) * 100}%` }}
                  />
                </div>
                <Button
                  onClick={increaseFontSize}
                  size="sm"
                  variant="outline"
                  className="border-[#2D5A3D] dark:border-[#D4AF37] text-[#2D5A3D] dark:text-[#D4AF37]"
                  data-testid="button-increase-font"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Theme toggle */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                مظهر المصحف
              </label>
              <div className="flex items-center gap-2">
                <Button
                  onClick={toggleQuranTheme}
                  variant="outline"
                  className={`flex-1 flex items-center justify-center gap-2 py-3 ${
                    !isDarkTheme 
                      ? 'bg-[#2D5A3D] text-white border-[#2D5A3D]' 
                      : 'border-[#2D5A3D]/30 text-[#2D5A3D] dark:text-[#D4AF37] dark:border-[#D4AF37]/30'
                  }`}
                  data-testid="button-light-theme"
                >
                  <Sun className="w-4 h-4" />
                  <span className="text-sm">فاتح</span>
                </Button>
                <Button
                  onClick={toggleQuranTheme}
                  variant="outline"
                  className={`flex-1 flex items-center justify-center gap-2 py-3 ${
                    isDarkTheme 
                      ? 'bg-[#D4AF37] text-[#1A1A1A] border-[#D4AF37]' 
                      : 'border-[#2D5A3D]/30 text-[#2D5A3D] dark:text-[#D4AF37] dark:border-[#D4AF37]/30'
                  }`}
                  data-testid="button-dark-theme"
                >
                  <Moon className="w-4 h-4" />
                  <span className="text-sm">داكن</span>
                </Button>
              </div>
            </div>

            {/* Reciter selection */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                القارئ
              </label>
              <select
                value={selectedReciter}
                onChange={(e) => setSelectedReciter(e.target.value)}
                className="w-full px-4 py-2 border-2 border-[#2D5A3D]/30 rounded-lg focus:border-[#2D5A3D] outline-none bg-white dark:bg-[#2A2A2A] dark:text-white"
                data-testid="select-reciter"
              >
                {reciters.map(reciter => (
                  <option key={reciter.id} value={reciter.id}>
                    {reciter.name} ({reciter.style})
                  </option>
                ))}
              </select>
            </div>

            {/* Reset button */}
            <Button
              onClick={resetSettings}
              variant="outline"
              className="w-full border-[#2D5A3D] dark:border-[#D4AF37] text-[#2D5A3D] dark:text-[#D4AF37] hover:bg-[#2D5A3D] dark:hover:bg-[#D4AF37] hover:text-white dark:hover:text-[#1A1A1A]"
              data-testid="button-reset-settings"
            >
              <RotateCcw className="w-4 h-4 ml-2" />
              إعادة تعيين الإعدادات
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Note Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-[#2D5A3D] dark:text-[#D4AF37]">
              إضافة ملاحظة
            </DialogTitle>
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
              className="min-h-[150px] text-right border-[#2D5A3D]/30 focus:border-[#2D5A3D]"
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
                className="bg-[#2D5A3D] hover:bg-[#1E4D2B] text-white"
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
