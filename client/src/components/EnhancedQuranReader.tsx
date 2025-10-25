import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Settings, 
  BookOpen,
  Moon,
  Sun,
  Repeat,
  Shuffle,
  Heart,
  Download,
  Share2
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import TafsirView from './TafsirView';

interface QuranAyah {
  number: number;
  text: string;
  translation?: string;
  tafsir?: string;
  audioUrl?: string;
}

interface Surah {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
  ayahs: QuranAyah[];
}

interface EnhancedQuranReaderProps {
  initialSurah?: number;
  studentId?: string;
}

const RECITERS = [
  { id: 'ar.alafasy', name: 'مشاري العفاسي', style: 'مرتل', apiId: 'ar.alafasy' },
  { id: 'ar.abdulbasitmurattal', name: 'عبد الباسط عبد الصمد', style: 'مرتل', apiId: 'ar.abdulbasitmurattal' },
  { id: 'ar.abdulsamad', name: 'عبد الباسط عبد الصمد', style: 'مجود', apiId: 'ar.abdulsamad' },
  { id: 'ar.shaatree', name: 'أبو بكر الشاطري', style: 'مرتل', apiId: 'ar.shaatree' },
  { id: 'ar.hanirifai', name: 'هاني الرفاعي', style: 'مرتل', apiId: 'ar.hanirifai' },
  { id: 'ar.husary', name: 'محمود خليل الحصري', style: 'معلم', apiId: 'ar.husary' },
  { id: 'ar.minshawi', name: 'محمد صديق المنشاوي', style: 'مجود', apiId: 'ar.minshawi' },
  { id: 'ar.sudais', name: 'عبد الرحمن السديس', style: 'مرتل', apiId: 'ar.sudais' },
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
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState([1]);
  const [volume, setVolume] = useState([50]);
  const [selectedReciter, setSelectedReciter] = useState('ar.alafasy');
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [isRepeatMode, setIsRepeatMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState([18]);
  const [showTranslation, setShowTranslation] = useState(false);
  const [bookmarkedAyahs, setBookmarkedAyahs] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Use ref to track audio without triggering re-renders
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Stop audio helper function - no dependencies to avoid infinite loops
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setCurrentAudio(prev => {
      if (prev) {
        prev.pause();
      }
      return null;
    });
    setIsPlaying(false);
  }, []);

  // Load Surah data
  const loadSurah = useCallback(async (surahNumber: number) => {
    // Stop any playing audio when switching surahs
    stopAudio();
    
    setLoading(true);
    try {
      const surahInfo = SURAH_NAMES.find(s => s.number === surahNumber);
      if (!surahInfo) {
        throw new Error('السورة غير موجودة');
      }

      // Fetch Quran text in Arabic (Uthmani script) with English translation and Arabic tafsir
      const response = await fetch(
        `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,en.sahih,ar.muyassar`
      );
      
      if (!response.ok) {
        throw new Error('فشل تحميل البيانات');
      }

      const data = await response.json();
      
      if (data.code !== 200 || !data.data || data.data.length < 3) {
        throw new Error('بيانات غير صحيحة');
      }

      const arabicData = data.data[0]; // Arabic text (Uthmani)
      const translationData = data.data[1]; // English translation
      const tafsirData = data.data[2]; // Arabic tafsir (simplified)

      // Build ayahs array
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
      
      toast({
        title: '✅ تم تحميل السورة',
        description: `${surah.name} - ${surah.numberOfAyahs} آية`,
      });
      
    } catch (error) {
      console.error('Error loading surah:', error);
      toast({
        title: 'خطأ في تحميل السورة',
        description: 'لم نتمكن من تحميل السورة المطلوبة. تأكد من اتصالك بالإنترنت.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [toast, stopAudio]);

  useEffect(() => {
    loadSurah(initialSurah);
  }, [initialSurah, loadSurah]);

  const playAyah = async (ayahIndex: number) => {
    if (!currentSurah) return;
    
    try {
      // Stop previous audio
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (currentAudio) {
        currentAudio.pause();
      }

      setIsPlaying(true);
      setCurrentAyah(ayahIndex);

      const ayahNumber = ayahIndex + 1;
      const surahStr = currentSurah.number.toString().padStart(3, '0');
      const ayahStr = ayahNumber.toString().padStart(3, '0');
      
      // Fetch audio URL from AlQuran API
      const response = await fetch(
        `https://api.alquran.cloud/v1/ayah/${currentSurah.number}:${ayahNumber}/${selectedReciter}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch audio');
      }

      const data = await response.json();
      
      if (data.code !== 200 || !data.data?.audio) {
        throw new Error('No audio available');
      }

      const audio = new Audio();
      audio.src = data.data.audio;
      
      audioRef.current = audio;
      setCurrentAudio(audio);
      
      audio.playbackRate = playbackSpeed[0];
      audio.volume = volume[0] / 100;
      
      audio.addEventListener('ended', () => {
        if (isAutoPlay && ayahIndex < currentSurah.ayahs.length - 1) {
          playAyah(ayahIndex + 1);
        } else if (isRepeatMode) {
          playAyah(ayahIndex);
        } else {
          setIsPlaying(false);
          setCurrentAudio(null);
          audioRef.current = null;
        }
      });
      
      await audio.play();
      
      const reciterName = RECITERS.find(r => r.id === selectedReciter)?.name || '';
      toast({
        title: '🎵 بدء التلاوة',
        description: `الآية ${ayahNumber} من سورة ${currentSurah.name} - ${reciterName}`,
      });
      
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
      toast({
        title: 'خطأ في التشغيل',
        description: 'لم نتمكن من تشغيل التلاوة. تأكد من اتصالك بالإنترنت.',
        variant: 'destructive'
      });
    }
  };

  const pauseAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      setIsPlaying(false);
    }
  };

  const nextAyah = () => {
    if (currentSurah && currentAyah < currentSurah.ayahs.length - 1) {
      const nextIndex = currentAyah + 1;
      setCurrentAyah(nextIndex);
      if (isPlaying) playAyah(nextIndex);
    }
  };

  const prevAyah = () => {
    if (currentAyah > 0) {
      const prevIndex = currentAyah - 1;
      setCurrentAyah(prevIndex);
      if (isPlaying) playAyah(prevIndex);
    }
  };

  const bookmarkAyah = (ayahNumber: number) => {
    setBookmarkedAyahs(prev => 
      prev.includes(ayahNumber) 
        ? prev.filter(a => a !== ayahNumber)
        : [...prev, ayahNumber]
    );
  };

  const shareAyah = (text: string, ayahNumber: number) => {
    const shareText = `${text}\n{${ayahNumber}} سورة ${currentSurah?.name}`;
    if (navigator.share) {
      navigator.share({
        title: `آية من القرآن الكريم`,
        text: shareText
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast({
        title: '📋 تم النسخ',
        description: 'تم نسخ الآية إلى الحافظة'
      });
    }
  };

  useEffect(() => {
    if (currentAudio) {
      currentAudio.playbackRate = playbackSpeed[0];
      currentAudio.volume = volume[0] / 100;
    }
  }, [playbackSpeed, volume, currentAudio]);

  // Cleanup audio on component unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Stop audio when reciter changes
  useEffect(() => {
    if (isPlaying) {
      stopAudio();
      toast({
        title: 'تم تغيير القارئ',
        description: 'اضغط على زر التشغيل للاستماع بصوت القارئ الجديد',
      });
    }
  }, [selectedReciter, stopAudio, toast, isPlaying]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-amber-600 font-medium">جاري تحميل القرآن الكريم...</p>
        </div>
      </div>
    );
  }

  if (!currentSurah) return null;

  return (
    <div className={`w-full max-w-6xl mx-auto p-4 ${isDarkMode ? 'dark' : ''}`}>
      {/* Header Controls */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold text-amber-800">
              {currentSurah.name} - {currentSurah.englishName}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDarkMode(!isDarkMode)}
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              
              <Select value={currentSurah.number.toString()} onValueChange={(value) => loadSurah(parseInt(value))}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SURAH_NAMES.map(surah => (
                    <SelectItem key={surah.number} value={surah.number.toString()}>
                      {surah.number}. {surah.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Audio Controls */}
          <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevAyah}
                  disabled={currentAyah === 0}
                >
                  <SkipBack className="h-4 w-4" />
                </Button>
                
                <Button
                  onClick={isPlaying ? pauseAudio : () => playAyah(currentAyah)}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={nextAyah}
                  disabled={currentAyah === currentSurah.ayahs.length - 1}
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={isAutoPlay ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setIsAutoPlay(!isAutoPlay)}
                  className={isAutoPlay ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  <Play className="h-4 w-4" />
                </Button>
                
                <Button
                  variant={isRepeatMode ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setIsRepeatMode(!isRepeatMode)}
                  className={isRepeatMode ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  <Repeat className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 w-32">
                <Volume2 className="h-4 w-4" />
                <Slider
                  value={volume}
                  onValueChange={setVolume}
                  max={100}
                  step={1}
                  className="flex-1"
                />
              </div>
              
              <Select value={selectedReciter} onValueChange={setSelectedReciter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RECITERS.map(reciter => (
                    <SelectItem key={reciter.id} value={reciter.id}>
                      {reciter.name} ({reciter.style})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Settings Panel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm">حجم الخط:</span>
              <Slider
                value={fontSize}
                onValueChange={setFontSize}
                min={14}
                max={28}
                step={2}
                className="flex-1"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm">سرعة التشغيل:</span>
              <Slider
                value={playbackSpeed}
                onValueChange={setPlaybackSpeed}
                min={0.5}
                max={2}
                step={0.25}
                className="flex-1"
              />
              <span className="text-xs">{playbackSpeed[0]}x</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={showTranslation ? "default" : "ghost"}
                size="sm"
                onClick={() => setShowTranslation(!showTranslation)}
              >
                عرض الترجمة
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ayahs Display */}
      <div className="space-y-4">
        <AnimatePresence>
          {currentSurah.ayahs.map((ayah, index) => (
            <motion.div
              key={ayah.number}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`relative ${
                currentAyah === index ? 'ring-2 ring-amber-500 ring-offset-2' : ''
              }`}
            >
              <TafsirView
                text={ayah.text}
                tafsir={ayah.tafsir}
                ayahNumber={ayah.number}
                surahNumber={currentSurah.number}
                surahName={currentSurah.name}
                onBookmark={bookmarkAyah}
                onShare={shareAyah}
              />
              
              {showTranslation && ayah.translation && (
                <Card className="mt-2 border-l-4 border-l-blue-500">
                  <CardContent className="pt-4">
                    <p className="text-gray-700 italic">{ayah.translation}</p>
                  </CardContent>
                </Card>
              )}
              
              {bookmarkedAyahs.includes(ayah.number) && (
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                    <Heart className="h-3 w-3 mr-1 fill-current" />
                    مفضلة
                  </Badge>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Progress Indicator */}
      <div className="fixed bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <div className="text-sm text-center mb-2">
          آية {currentAyah + 1} من {currentSurah.ayahs.length}
        </div>
        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-300"
            style={{ width: `${((currentAyah + 1) / currentSurah.ayahs.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}