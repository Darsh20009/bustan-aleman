import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Moon,
  Sun,
  Repeat,
  BookMarked,
  StickyNote,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Settings,
  Bookmark,
  BookOpen,
  Eye,
  EyeOff
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface QuranAyah {
  number: number;
  text: string;
  translation?: string;
  tafsir?: string;
}

interface Surah {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
  ayahs: QuranAyah[];
}

interface WordHighlight {
  surahNumber: number;
  ayahNumber: number;
  wordIndex: number;
  wordText: string;
  note: string;
}

interface EnhancedQuranReaderProps {
  initialSurah?: number;
  studentId?: string;
}

const RECITERS = [
  { id: 'ar.alafasy', name: 'مشاري العفاسي', style: 'مرتل' },
  { id: 'ar.abdulbasitmurattal', name: 'عبد الباسط عبد الصمد', style: 'مرتل' },
  { id: 'ar.abdulsamad', name: 'عبد الباسط عبد الصمد', style: 'مجود' },
  { id: 'ar.shaatree', name: 'أبو بكر الشاطري', style: 'مرتل' },
  { id: 'ar.hanirifai', name: 'هاني الرفاعي', style: 'مرتل' },
  { id: 'ar.husary', name: 'محمود خليل الحصري', style: 'معلم' },
  { id: 'ar.minshawi', name: 'محمد صديق المنشاوي', style: 'مجود' },
  { id: 'ar.sudais', name: 'عبد الرحمن السديس', style: 'مرتل' },
];

const SURAH_NAMES = [
  { number: 1, name: 'الفاتحة', englishName: 'Al-Fatiha', numberOfAyahs: 7 },
  { number: 2, name: 'البقرة', englishName: 'Al-Baqarah', numberOfAyahs: 286 },
  { number: 3, name: 'آل عمران', englishName: 'Aal-E-Imran', numberOfAyahs: 200 },
  { number: 4, name: 'النساء', englishName: 'An-Nisa', numberOfAyahs: 176 },
  { number: 5, name: 'المائدة', englishName: 'Al-Maidah', numberOfAyahs: 120 },
  { number: 6, name: 'الأنعام', englishName: 'Al-Anam', numberOfAyahs: 165 },
  { number: 7, name: 'الأعراف', englishName: 'Al-Araf', numberOfAyahs: 206 },
  { number: 8, name: 'الأنفال', englishName: 'Al-Anfal', numberOfAyahs: 75 },
  { number: 9, name: 'التوبة', englishName: 'At-Tawbah', numberOfAyahs: 129 },
  { number: 10, name: 'يونس', englishName: 'Yunus', numberOfAyahs: 109 },
  { number: 11, name: 'هود', englishName: 'Hud', numberOfAyahs: 123 },
  { number: 12, name: 'يوسف', englishName: 'Yusuf', numberOfAyahs: 111 },
  { number: 13, name: 'الرعد', englishName: 'Ar-Rad', numberOfAyahs: 43 },
  { number: 14, name: 'إبراهيم', englishName: 'Ibrahim', numberOfAyahs: 52 },
  { number: 15, name: 'الحجر', englishName: 'Al-Hijr', numberOfAyahs: 99 },
  { number: 16, name: 'النحل', englishName: 'An-Nahl', numberOfAyahs: 128 },
  { number: 17, name: 'الإسراء', englishName: 'Al-Isra', numberOfAyahs: 111 },
  { number: 18, name: 'الكهف', englishName: 'Al-Kahf', numberOfAyahs: 110 },
  { number: 19, name: 'مريم', englishName: 'Maryam', numberOfAyahs: 98 },
  { number: 20, name: 'طه', englishName: 'Taha', numberOfAyahs: 135 },
  { number: 21, name: 'الأنبياء', englishName: 'Al-Anbiya', numberOfAyahs: 112 },
  { number: 22, name: 'الحج', englishName: 'Al-Hajj', numberOfAyahs: 78 },
  { number: 23, name: 'المؤمنون', englishName: 'Al-Muminun', numberOfAyahs: 118 },
  { number: 24, name: 'النور', englishName: 'An-Nur', numberOfAyahs: 64 },
  { number: 25, name: 'الفرقان', englishName: 'Al-Furqan', numberOfAyahs: 77 },
  { number: 26, name: 'الشعراء', englishName: 'Ash-Shuara', numberOfAyahs: 227 },
  { number: 27, name: 'النمل', englishName: 'An-Naml', numberOfAyahs: 93 },
  { number: 28, name: 'القصص', englishName: 'Al-Qasas', numberOfAyahs: 88 },
  { number: 29, name: 'العنكبوت', englishName: 'Al-Ankabut', numberOfAyahs: 69 },
  { number: 30, name: 'الروم', englishName: 'Ar-Rum', numberOfAyahs: 60 },
  { number: 31, name: 'لقمان', englishName: 'Luqman', numberOfAyahs: 34 },
  { number: 32, name: 'السجدة', englishName: 'As-Sajdah', numberOfAyahs: 30 },
  { number: 33, name: 'الأحزاب', englishName: 'Al-Ahzab', numberOfAyahs: 73 },
  { number: 34, name: 'سبأ', englishName: 'Saba', numberOfAyahs: 54 },
  { number: 35, name: 'فاطر', englishName: 'Fatir', numberOfAyahs: 45 },
  { number: 36, name: 'يس', englishName: 'Ya-Sin', numberOfAyahs: 83 },
  { number: 37, name: 'الصافات', englishName: 'As-Saffat', numberOfAyahs: 182 },
  { number: 38, name: 'ص', englishName: 'Sad', numberOfAyahs: 88 },
  { number: 39, name: 'الزمر', englishName: 'Az-Zumar', numberOfAyahs: 75 },
  { number: 40, name: 'غافر', englishName: 'Ghafir', numberOfAyahs: 85 },
  { number: 41, name: 'فصلت', englishName: 'Fussilat', numberOfAyahs: 54 },
  { number: 42, name: 'الشورى', englishName: 'Ash-Shura', numberOfAyahs: 53 },
  { number: 43, name: 'الزخرف', englishName: 'Az-Zukhruf', numberOfAyahs: 89 },
  { number: 44, name: 'الدخان', englishName: 'Ad-Dukhan', numberOfAyahs: 59 },
  { number: 45, name: 'الجاثية', englishName: 'Al-Jathiya', numberOfAyahs: 37 },
  { number: 46, name: 'الأحقاف', englishName: 'Al-Ahqaf', numberOfAyahs: 35 },
  { number: 47, name: 'محمد', englishName: 'Muhammad', numberOfAyahs: 38 },
  { number: 48, name: 'الفتح', englishName: 'Al-Fath', numberOfAyahs: 29 },
  { number: 49, name: 'الحجرات', englishName: 'Al-Hujurat', numberOfAyahs: 18 },
  { number: 50, name: 'ق', englishName: 'Qaf', numberOfAyahs: 45 },
  { number: 51, name: 'الذاريات', englishName: 'Adh-Dhariyat', numberOfAyahs: 60 },
  { number: 52, name: 'الطور', englishName: 'At-Tur', numberOfAyahs: 49 },
  { number: 53, name: 'النجم', englishName: 'An-Najm', numberOfAyahs: 62 },
  { number: 54, name: 'القمر', englishName: 'Al-Qamar', numberOfAyahs: 55 },
  { number: 55, name: 'الرحمن', englishName: 'Ar-Rahman', numberOfAyahs: 78 },
  { number: 56, name: 'الواقعة', englishName: 'Al-Waqiah', numberOfAyahs: 96 },
  { number: 57, name: 'الحديد', englishName: 'Al-Hadid', numberOfAyahs: 29 },
  { number: 58, name: 'المجادلة', englishName: 'Al-Mujadila', numberOfAyahs: 22 },
  { number: 59, name: 'الحشر', englishName: 'Al-Hashr', numberOfAyahs: 24 },
  { number: 60, name: 'الممتحنة', englishName: 'Al-Mumtahanah', numberOfAyahs: 13 },
  { number: 61, name: 'الصف', englishName: 'As-Saf', numberOfAyahs: 14 },
  { number: 62, name: 'الجمعة', englishName: 'Al-Jumuah', numberOfAyahs: 11 },
  { number: 63, name: 'المنافقون', englishName: 'Al-Munafiqun', numberOfAyahs: 11 },
  { number: 64, name: 'التغابن', englishName: 'At-Taghabun', numberOfAyahs: 18 },
  { number: 65, name: 'الطلاق', englishName: 'At-Talaq', numberOfAyahs: 12 },
  { number: 66, name: 'التحريم', englishName: 'At-Tahrim', numberOfAyahs: 12 },
  { number: 67, name: 'الملك', englishName: 'Al-Mulk', numberOfAyahs: 30 },
  { number: 68, name: 'القلم', englishName: 'Al-Qalam', numberOfAyahs: 52 },
  { number: 69, name: 'الحاقة', englishName: 'Al-Haqqah', numberOfAyahs: 52 },
  { number: 70, name: 'المعارج', englishName: 'Al-Maarij', numberOfAyahs: 44 },
  { number: 71, name: 'نوح', englishName: 'Nuh', numberOfAyahs: 28 },
  { number: 72, name: 'الجن', englishName: 'Al-Jinn', numberOfAyahs: 28 },
  { number: 73, name: 'المزمل', englishName: 'Al-Muzzammil', numberOfAyahs: 20 },
  { number: 74, name: 'المدثر', englishName: 'Al-Muddaththir', numberOfAyahs: 56 },
  { number: 75, name: 'القيامة', englishName: 'Al-Qiyamah', numberOfAyahs: 40 },
  { number: 76, name: 'الإنسان', englishName: 'Al-Insan', numberOfAyahs: 31 },
  { number: 77, name: 'المرسلات', englishName: 'Al-Mursalat', numberOfAyahs: 50 },
  { number: 78, name: 'النبأ', englishName: 'An-Naba', numberOfAyahs: 40 },
  { number: 79, name: 'النازعات', englishName: 'An-Naziat', numberOfAyahs: 46 },
  { number: 80, name: 'عبس', englishName: 'Abasa', numberOfAyahs: 42 },
  { number: 81, name: 'التكوير', englishName: 'At-Takwir', numberOfAyahs: 29 },
  { number: 82, name: 'الإنفطار', englishName: 'Al-Infitar', numberOfAyahs: 19 },
  { number: 83, name: 'المطففين', englishName: 'Al-Mutaffifin', numberOfAyahs: 36 },
  { number: 84, name: 'الإنشقاق', englishName: 'Al-Inshiqaq', numberOfAyahs: 25 },
  { number: 85, name: 'البروج', englishName: 'Al-Buruj', numberOfAyahs: 22 },
  { number: 86, name: 'الطارق', englishName: 'At-Tariq', numberOfAyahs: 17 },
  { number: 87, name: 'الأعلى', englishName: 'Al-Ala', numberOfAyahs: 19 },
  { number: 88, name: 'الغاشية', englishName: 'Al-Ghashiyah', numberOfAyahs: 26 },
  { number: 89, name: 'الفجر', englishName: 'Al-Fajr', numberOfAyahs: 30 },
  { number: 90, name: 'البلد', englishName: 'Al-Balad', numberOfAyahs: 20 },
  { number: 91, name: 'الشمس', englishName: 'Ash-Shams', numberOfAyahs: 15 },
  { number: 92, name: 'الليل', englishName: 'Al-Layl', numberOfAyahs: 21 },
  { number: 93, name: 'الضحى', englishName: 'Ad-Duhaa', numberOfAyahs: 11 },
  { number: 94, name: 'الشرح', englishName: 'Ash-Sharh', numberOfAyahs: 8 },
  { number: 95, name: 'التين', englishName: 'At-Tin', numberOfAyahs: 8 },
  { number: 96, name: 'العلق', englishName: 'Al-Alaq', numberOfAyahs: 19 },
  { number: 97, name: 'القدر', englishName: 'Al-Qadr', numberOfAyahs: 5 },
  { number: 98, name: 'البينة', englishName: 'Al-Bayyinah', numberOfAyahs: 8 },
  { number: 99, name: 'الزلزلة', englishName: 'Az-Zalzalah', numberOfAyahs: 8 },
  { number: 100, name: 'العاديات', englishName: 'Al-Adiyat', numberOfAyahs: 11 },
  { number: 101, name: 'القارعة', englishName: 'Al-Qariah', numberOfAyahs: 11 },
  { number: 102, name: 'التكاثر', englishName: 'At-Takathur', numberOfAyahs: 8 },
  { number: 103, name: 'العصر', englishName: 'Al-Asr', numberOfAyahs: 3 },
  { number: 104, name: 'الهمزة', englishName: 'Al-Humazah', numberOfAyahs: 9 },
  { number: 105, name: 'الفيل', englishName: 'Al-Fil', numberOfAyahs: 5 },
  { number: 106, name: 'قريش', englishName: 'Quraysh', numberOfAyahs: 4 },
  { number: 107, name: 'الماعون', englishName: 'Al-Maun', numberOfAyahs: 7 },
  { number: 108, name: 'الكوثر', englishName: 'Al-Kawthar', numberOfAyahs: 3 },
  { number: 109, name: 'الكافرون', englishName: 'Al-Kafirun', numberOfAyahs: 6 },
  { number: 110, name: 'النصر', englishName: 'An-Nasr', numberOfAyahs: 3 },
  { number: 111, name: 'المسد', englishName: 'Al-Masad', numberOfAyahs: 5 },
  { number: 112, name: 'الإخلاص', englishName: 'Al-Ikhlas', numberOfAyahs: 4 },
  { number: 113, name: 'الفلق', englishName: 'Al-Falaq', numberOfAyahs: 5 },
  { number: 114, name: 'الناس', englishName: 'An-Nas', numberOfAyahs: 6 }
];

export default function EnhancedQuranReader({ initialSurah = 1, studentId }: EnhancedQuranReaderProps) {
  const [currentSurah, setCurrentSurah] = useState<Surah | null>(null);
  const [currentAyah, setCurrentAyah] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState([1]);
  const [volume, setVolume] = useState([50]);
  const [selectedReciter, setSelectedReciter] = useState('ar.alafasy');
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [isRepeatMode, setIsRepeatMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState([22]);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showTafsir, setShowTafsir] = useState(false);
  const [mode, setMode] = useState<'read' | 'memorize' | 'review'>('read');
  const [highlightedWords, setHighlightedWords] = useState<Map<string, WordHighlight>>(new Map());
  const [selectedWord, setSelectedWord] = useState<{surah: number, ayah: number, index: number, text: string} | null>(null);
  const [wordNote, setWordNote] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load word highlights from backend
  const { data: savedHighlights } = useQuery<WordHighlight[]>({
    queryKey: ['/api/quran/highlights', studentId],
    enabled: !!studentId
  });

  // Save word highlight mutation
  const saveHighlightMutation = useMutation({
    mutationFn: async (highlight: Omit<WordHighlight, 'id'>) => {
      return apiRequest('POST', '/api/quran/highlights', {
        ...highlight,
        studentId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quran/highlights', studentId] });
      toast({ 
        title: '✅ تم الحفظ بنجاح',
        description: 'تم حفظ الملاحظة للكلمة'
      });
    },
    onError: (error: any) => {
      toast({
        title: '❌ خطأ في الحفظ',
        description: error?.message || 'حدث خطأ أثناء حفظ الملاحظة',
        variant: 'destructive'
      });
    }
  });

  // Delete word highlight mutation
  const deleteHighlightMutation = useMutation({
    mutationFn: async (key: string) => {
      const highlight = highlightedWords.get(key);
      if (highlight) {
        return apiRequest('DELETE', `/api/quran/highlights/${highlight.surahNumber}/${highlight.ayahNumber}/${highlight.wordIndex}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quran/highlights', studentId] });
      toast({ title: '✅ تم حذف التحديد' });
    }
  });

  // Track reading progress
  const trackProgressMutation = useMutation({
    mutationFn: async (data: { surahNumber: number, ayahNumber: number }) => {
      return apiRequest('POST', '/api/quran/progress', {
        studentId,
        ...data,
        readingDate: new Date().toISOString().split('T')[0]
      });
    }
  });

  useEffect(() => {
    if (savedHighlights) {
      const map = new Map<string, WordHighlight>();
      savedHighlights.forEach(h => {
        const key = `${h.surahNumber}-${h.ayahNumber}-${h.wordIndex}`;
        map.set(key, h);
      });
      setHighlightedWords(map);
    }
  }, [savedHighlights]);

  const loadSurah = useCallback(async (surahNumber: number) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    
    setLoading(true);
    try {
      const surahInfo = SURAH_NAMES.find(s => s.number === surahNumber);
      if (!surahInfo) throw new Error('السورة غير موجودة');

      const response = await fetch(
        `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,en.sahih,ar.muyassar`
      );
      
      if (!response.ok) throw new Error('فشل تحميل البيانات');

      const data = await response.json();
      if (data.code !== 200 || !data.data || data.data.length < 3) {
        throw new Error('بيانات غير صحيحة');
      }

      const arabicData = data.data[0];
      const translationData = data.data[1];
      const tafsirData = data.data[2];

      const ayahs: QuranAyah[] = arabicData.ayahs.map((ayah: any, index: number) => ({
        number: ayah.numberInSurah,
        text: ayah.text,
        translation: translationData.ayahs[index]?.text || '',
        tafsir: tafsirData.ayahs[index]?.text || ''
      }));

      const surah: Surah = {
        number: surahNumber,
        name: surahInfo.name,
        englishName: surahInfo.englishName,
        numberOfAyahs: surahInfo.numberOfAyahs,
        ayahs
      };

      setCurrentSurah(surah);
      setCurrentAyah(0);
    } catch (error) {
      console.error('Error loading surah:', error);
      toast({
        title: 'خطأ في تحميل السورة',
        description: 'تأكد من اتصالك بالإنترنت',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadSurah(initialSurah);
  }, [initialSurah, loadSurah]);

  const playAyah = async (ayahIndex: number) => {
    if (!currentSurah) return;
    
    try {
      if (audioRef.current) {
        audioRef.current.pause();
      }

      setIsPlaying(true);
      setCurrentAyah(ayahIndex);

      const ayahNumber = ayahIndex + 1;
      const response = await fetch(
        `https://api.alquran.cloud/v1/ayah/${currentSurah.number}:${ayahNumber}/${selectedReciter}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch audio');

      const data = await response.json();
      if (data.code !== 200 || !data.data?.audio) {
        throw new Error('No audio available');
      }

      const audio = new Audio();
      audio.src = data.data.audio;
      audioRef.current = audio;
      audio.playbackRate = playbackSpeed[0];
      audio.volume = volume[0] / 100;
      
      audio.addEventListener('ended', () => {
        if (isAutoPlay && ayahIndex < currentSurah.ayahs.length - 1) {
          playAyah(ayahIndex + 1);
        } else if (isRepeatMode) {
          playAyah(ayahIndex);
        } else {
          setIsPlaying(false);
          audioRef.current = null;
        }
      });
      
      await audio.play();
      
      // Track progress
      if (studentId) {
        trackProgressMutation.mutate({
          surahNumber: currentSurah.number,
          ayahNumber: ayahNumber
        });
      }
      
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
      toast({
        title: 'خطأ في التشغيل',
        description: 'تأكد من اتصالك بالإنترنت',
        variant: 'destructive'
      });
    }
  };

  const handleWordClick = (surahNum: number, ayahNum: number, wordIndex: number, wordText: string) => {
    const key = `${surahNum}-${ayahNum}-${wordIndex}`;
    const existingHighlight = highlightedWords.get(key);
    
    if (existingHighlight) {
      setWordNote(existingHighlight.note || '');
    } else {
      setWordNote('');
    }
    
    setSelectedWord({ surah: surahNum, ayah: ayahNum, index: wordIndex, text: wordText });
  };

  const saveWordNote = () => {
    if (!selectedWord) return;
    
    if (!studentId) {
      toast({
        title: 'تسجيل الدخول مطلوب',
        description: 'يجب تسجيل الدخول لحفظ الملاحظات',
        variant: 'destructive'
      });
      return;
    }
    
    const key = `${selectedWord.surah}-${selectedWord.ayah}-${selectedWord.index}`;
    const highlight: WordHighlight = {
      surahNumber: selectedWord.surah,
      ayahNumber: selectedWord.ayah,
      wordIndex: selectedWord.index,
      wordText: selectedWord.text,
      note: wordNote.trim()
    };
    
    // Update local state immediately for better UX
    setHighlightedWords(prev => new Map(prev).set(key, highlight));
    
    // Save to backend
    saveHighlightMutation.mutate(highlight);
    
    // Close dialog and reset
    setSelectedWord(null);
    setWordNote('');
  };

  const removeWordHighlight = (key: string) => {
    const newMap = new Map(highlightedWords);
    newMap.delete(key);
    setHighlightedWords(newMap);
    deleteHighlightMutation.mutate(key);
  };

  const nextSurah = () => {
    if (currentSurah && currentSurah.number < 114) {
      loadSurah(currentSurah.number + 1);
    }
  };

  const prevSurah = () => {
    if (currentSurah && currentSurah.number > 1) {
      loadSurah(currentSurah.number - 1);
    }
  };

  const renderWord = (word: string, wordIndex: number, surahNum: number, ayahNum: number) => {
    const key = `${surahNum}-${ayahNum}-${wordIndex}`;
    const isHighlighted = highlightedWords.has(key);
    
    return (
      <span
        key={wordIndex}
        onClick={() => handleWordClick(surahNum, ayahNum, wordIndex, word)}
        className={`cursor-pointer inline-block mx-1 px-1 rounded transition-all duration-200 hover:bg-opacity-70 ${
          isHighlighted 
            ? 'bg-red-500 text-white dark:bg-red-600' 
            : 'hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
        data-testid={`word-${surahNum}-${ayahNum}-${wordIndex}`}
      >
        {word}
      </span>
    );
  };

  const renderAyahWithWords = (ayah: QuranAyah, surahNum: number) => {
    const words = ayah.text.split(' ');
    return (
      <div className="leading-loose">
        {words.map((word, index) => renderWord(word, index, surahNum, ayah.number))}
        <span className="inline-flex items-center justify-center w-8 h-8 mr-2 text-sm rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 dark:from-emerald-600 dark:to-emerald-800 text-white">
          {ayah.number}
        </span>
      </div>
    );
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed[0];
      audioRef.current.volume = volume[0] / 100;
    }
  }, [playbackSpeed, volume]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDarkMode ? 'bg-gradient-to-br from-gray-900 via-emerald-900 to-black' : 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-600 dark:border-emerald-400 mx-auto mb-4"></div>
          <p className={`text-lg font-medium ${isDarkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>جاري تحميل القرآن الكريم...</p>
        </div>
      </div>
    );
  }

  if (!currentSurah) return null;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-emerald-900 to-black text-gray-100' 
        : 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 text-gray-900'
    }`} dir="rtl">
      {/* Top Navigation Bar */}
      <div className={`sticky top-0 z-50 backdrop-blur-lg border-b ${
        isDarkMode 
          ? 'bg-gray-900/90 border-emerald-800' 
          : 'bg-white/90 border-emerald-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Surah Navigation */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={prevSurah}
                disabled={currentSurah.number === 1}
                className={isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}
                data-testid="button-prev-surah"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              
              <Select 
                value={currentSurah.number.toString()} 
                onValueChange={(value) => loadSurah(parseInt(value))}
              >
                <SelectTrigger className={`w-56 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`} data-testid="select-surah">
                  <SelectValue>
                    <span className="font-semibold">{currentSurah.name}</span>
                    <span className="text-sm mr-2 opacity-70">({currentSurah.englishName})</span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
                  {SURAH_NAMES.map(surah => (
                    <SelectItem key={surah.number} value={surah.number.toString()}>
                      {surah.number}. {surah.name} - {surah.englishName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={nextSurah}
                disabled={currentSurah.number === 114}
                className={isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}
                data-testid="button-next-surah"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>

            {/* Mode Selector */}
            <div className="flex items-center gap-2">
              <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="w-auto">
                <TabsList className={isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}>
                  <TabsTrigger value="read" data-testid="tab-read">
                    <BookOpen className="h-4 w-4 ml-2" />
                    قراءة
                  </TabsTrigger>
                  <TabsTrigger value="memorize" data-testid="tab-memorize">
                    <BookMarked className="h-4 w-4 ml-2" />
                    حفظ
                  </TabsTrigger>
                  <TabsTrigger value="review" data-testid="tab-review">
                    <Repeat className="h-4 w-4 ml-2" />
                    مراجعة
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}
                data-testid="button-theme-toggle"
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Audio Controls Panel */}
      <div className={`border-b ${isDarkMode ? 'bg-gray-800/50 border-emerald-800' : 'bg-white/50 border-emerald-200'}`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Playback Controls */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentAyah(Math.max(0, currentAyah - 1))}
                disabled={currentAyah === 0}
                className={isDarkMode ? 'hover:bg-gray-700' : ''}
                data-testid="button-prev-ayah"
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              
              <Button
                onClick={isPlaying ? () => { audioRef.current?.pause(); setIsPlaying(false); } : () => playAyah(currentAyah)}
                className={`${isDarkMode ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-emerald-600 hover:bg-emerald-700'} text-white`}
                data-testid="button-play-pause"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentAyah(Math.min(currentSurah.ayahs.length - 1, currentAyah + 1))}
                disabled={currentAyah === currentSurah.ayahs.length - 1}
                className={isDarkMode ? 'hover:bg-gray-700' : ''}
                data-testid="button-next-ayah"
              >
                <SkipForward className="h-4 w-4" />
              </Button>

              <div className="h-6 w-px bg-gray-300 dark:bg-gray-700" />

              <Button
                variant={isAutoPlay ? "default" : "ghost"}
                size="sm"
                onClick={() => setIsAutoPlay(!isAutoPlay)}
                className={isAutoPlay ? (isDarkMode ? 'bg-emerald-700' : 'bg-emerald-600 text-white') : ''}
                data-testid="button-autoplay"
              >
                <Play className="h-4 w-4 ml-1" />
                تشغيل تلقائي
              </Button>
              
              <Button
                variant={isRepeatMode ? "default" : "ghost"}
                size="sm"
                onClick={() => setIsRepeatMode(!isRepeatMode)}
                className={isRepeatMode ? (isDarkMode ? 'bg-emerald-700' : 'bg-emerald-600 text-white') : ''}
                data-testid="button-repeat"
              >
                <Repeat className="h-4 w-4 ml-1" />
                تكرار
              </Button>
            </div>

            {/* Audio Settings */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 min-w-[120px]">
                <Volume2 className="h-4 w-4" />
                <Slider
                  value={volume}
                  onValueChange={setVolume}
                  max={100}
                  step={1}
                  className="flex-1"
                  data-testid="slider-volume"
                />
              </div>

              <Select value={selectedReciter} onValueChange={setSelectedReciter}>
                <SelectTrigger className={`w-48 ${isDarkMode ? 'bg-gray-700 border-gray-600' : ''}`} data-testid="select-reciter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
                  {RECITERS.map(reciter => (
                    <SelectItem key={reciter.id} value={reciter.id}>
                      {reciter.name} ({reciter.style})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Additional Settings */}
          <div className="flex items-center gap-4 mt-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm opacity-70">حجم الخط:</span>
              <Slider
                value={fontSize}
                onValueChange={setFontSize}
                min={16}
                max={36}
                step={2}
                className="w-32"
                data-testid="slider-font-size"
              />
              <span className="text-sm opacity-70">{fontSize[0]}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm opacity-70">السرعة:</span>
              <Slider
                value={playbackSpeed}
                onValueChange={setPlaybackSpeed}
                min={0.5}
                max={2}
                step={0.25}
                className="w-32"
                data-testid="slider-playback-speed"
              />
              <span className="text-sm opacity-70">{playbackSpeed[0]}x</span>
            </div>

            <Button
              variant={showTranslation ? "default" : "ghost"}
              size="sm"
              onClick={() => setShowTranslation(!showTranslation)}
              className={showTranslation ? (isDarkMode ? 'bg-emerald-700' : 'bg-emerald-600 text-white') : ''}
              data-testid="button-toggle-translation"
            >
              {showTranslation ? <Eye className="h-4 w-4 ml-1" /> : <EyeOff className="h-4 w-4 ml-1" />}
              الترجمة
            </Button>

            <Button
              variant={showTafsir ? "default" : "ghost"}
              size="sm"
              onClick={() => setShowTafsir(!showTafsir)}
              className={showTafsir ? (isDarkMode ? 'bg-emerald-700' : 'bg-emerald-600 text-white') : ''}
              data-testid="button-toggle-tafsir"
            >
              {showTafsir ? <Eye className="h-4 w-4 ml-1" /> : <EyeOff className="h-4 w-4 ml-1" />}
              التفسير
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - Quran Text */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Bismillah */}
        {currentSurah.number !== 1 && currentSurah.number !== 9 && (
          <div className="text-center mb-8">
            <p className={`text-3xl font-arabic ${isDarkMode ? 'text-emerald-300' : 'text-emerald-700'}`}>
              ﻿بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </p>
          </div>
        )}

        {/* Ayahs */}
        <div className="space-y-6">
          {currentSurah.ayahs.map((ayah, index) => (
            <motion.div
              key={ayah.number}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`p-6 rounded-xl transition-all duration-300 ${
                currentAyah === index
                  ? isDarkMode
                    ? 'bg-emerald-900/40 ring-2 ring-emerald-500 shadow-lg shadow-emerald-500/20'
                    : 'bg-emerald-100 ring-2 ring-emerald-400 shadow-lg'
                  : isDarkMode
                    ? 'bg-gray-800/30 hover:bg-gray-800/50'
                    : 'bg-white/50 hover:bg-white/80'
              }`}
              data-testid={`ayah-${ayah.number}`}
            >
              <div
                className={`text-right font-arabic leading-relaxed`}
                style={{ fontSize: `${fontSize[0]}px` }}
              >
                {renderAyahWithWords(ayah, currentSurah.number)}
              </div>

              {showTranslation && ayah.translation && (
                <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <p className={`text-sm italic ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {ayah.translation}
                  </p>
                </div>
              )}

              {showTafsir && ayah.tafsir && (
                <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-start gap-2">
                    <BookOpen className={`h-4 w-4 mt-1 flex-shrink-0 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {ayah.tafsir}
                    </p>
                  </div>
                </div>
              )}

              {mode === 'memorize' && (
                <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <Badge className={isDarkMode ? 'bg-emerald-700' : 'bg-emerald-600'}>
                    <BookMarked className="h-3 w-3 ml-1" />
                    وضع الحفظ
                  </Badge>
                </div>
              )}

              {mode === 'review' && (
                <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <Badge className={isDarkMode ? 'bg-blue-700' : 'bg-blue-600'}>
                    <Repeat className="h-3 w-3 ml-1" />
                    وضع المراجعة
                  </Badge>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Word Note Dialog */}
      <Dialog open={!!selectedWord} onOpenChange={(open) => !open && setSelectedWord(null)}>
        <DialogContent className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
          <DialogHeader>
            <DialogTitle className={isDarkMode ? 'text-gray-100' : ''}>
              إضافة ملاحظة للكلمة: {selectedWord?.text}
            </DialogTitle>
            <DialogDescription className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              أضف ملاحظة لمساعدتك على تذكر معنى أو حكم هذه الكلمة
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={wordNote}
              onChange={(e) => setWordNote(e.target.value)}
              placeholder="اكتب ملاحظتك هنا..."
              className={`min-h-[120px] ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : ''}`}
              data-testid="textarea-word-note"
            />
            <div className="flex gap-2 justify-end">
              <Button
                variant="ghost"
                onClick={() => setSelectedWord(null)}
                className={isDarkMode ? 'hover:bg-gray-700' : ''}
                data-testid="button-cancel-note"
              >
                إلغاء
              </Button>
              {selectedWord && highlightedWords.has(`${selectedWord.surah}-${selectedWord.ayah}-${selectedWord.index}`) && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    const key = `${selectedWord.surah}-${selectedWord.ayah}-${selectedWord.index}`;
                    removeWordHighlight(key);
                    setSelectedWord(null);
                  }}
                  data-testid="button-remove-highlight"
                >
                  حذف التحديد
                </Button>
              )}
              <Button
                onClick={saveWordNote}
                disabled={!wordNote.trim() || saveHighlightMutation.isPending}
                className={isDarkMode ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-emerald-600 hover:bg-emerald-700'}
                data-testid="button-save-note"
              >
                {saveHighlightMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-1"></div>
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <StickyNote className="h-4 w-4 ml-1" />
                    حفظ
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Progress Indicator */}
      <div className={`fixed bottom-6 left-6 p-4 rounded-xl shadow-2xl backdrop-blur-lg ${
        isDarkMode ? 'bg-gray-800/90' : 'bg-white/90'
      }`}>
        <div className="text-sm text-center mb-2 font-medium">
          آية {currentAyah + 1} من {currentSurah.ayahs.length}
        </div>
        <div className={`w-40 h-3 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              isDarkMode 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                : 'bg-gradient-to-r from-emerald-600 to-teal-600'
            }`}
            style={{ width: `${((currentAyah + 1) / currentSurah.ayahs.length) * 100}%` }}
          />
        </div>
        <div className="text-xs text-center mt-1 opacity-70">
          {Math.round(((currentAyah + 1) / currentSurah.ayahs.length) * 100)}%
        </div>
      </div>
    </div>
  );
}
