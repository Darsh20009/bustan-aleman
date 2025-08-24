import { useState, useEffect, useCallback } from 'react';
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
  { id: 'abdulbasit', name: 'عبد الباسط عبد الصمد', style: 'مجود' },
  { id: 'maher', name: 'ماهر المعيقلي', style: 'مرتل' },
  { id: 'sudais', name: 'عبد الرحمن السديس', style: 'مرتل' },
  { id: 'ajamy', name: 'أحمد العجمي', style: 'مجود' },
  { id: 'hussary', name: 'محمود خليل الحصري', style: 'معلم' },
];

const SURAH_NAMES = [
  { number: 1, name: 'الفاتحة', englishName: 'Al-Fatiha', numberOfAyahs: 7 },
  { number: 2, name: 'البقرة', englishName: 'Al-Baqarah', numberOfAyahs: 286 },
  { number: 3, name: 'آل عمران', englishName: 'Aal-E-Imran', numberOfAyahs: 200 },
  // Add more surahs as needed
];

export default function EnhancedQuranReader({ initialSurah = 1, studentId }: EnhancedQuranReaderProps) {
  const [currentSurah, setCurrentSurah] = useState<Surah | null>(null);
  const [currentAyah, setCurrentAyah] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState([1]);
  const [volume, setVolume] = useState([50]);
  const [selectedReciter, setSelectedReciter] = useState('abdulbasit');
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [isRepeatMode, setIsRepeatMode] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [fontSize, setFontSize] = useState([18]);
  const [showTranslation, setShowTranslation] = useState(false);
  const [bookmarkedAyahs, setBookmarkedAyahs] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Load Surah data
  const loadSurah = useCallback(async (surahNumber: number) => {
    setLoading(true);
    try {
      // Simulate API call - in real app, fetch from Quran API
      const mockSurah: Surah = {
        number: surahNumber,
        name: SURAH_NAMES.find(s => s.number === surahNumber)?.name || 'السورة',
        englishName: SURAH_NAMES.find(s => s.number === surahNumber)?.englishName || 'Surah',
        numberOfAyahs: SURAH_NAMES.find(s => s.number === surahNumber)?.numberOfAyahs || 0,
        ayahs: []
      };

      // Generate mock ayahs based on surah
      if (surahNumber === 1) {
        mockSurah.ayahs = [
          { 
            number: 1, 
            text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
            translation: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.',
            tafsir: 'بسم الله: أي أبدأ قراءتي مستعيناً باسم الله، والرحمن الرحيم اسمان من أسماء الله الحسنى، والرحمن أبلغ من الرحيم.'
          },
          { 
            number: 2, 
            text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
            translation: '[All] praise is [due] to Allah, Lord of the worlds -',
            tafsir: 'الحمد لله: أي الثناء الكامل لله وحده، رب العالمين: أي خالق جميع المخلوقات ومالكها ومدبر أمورها.'
          },
          { 
            number: 3, 
            text: 'الرَّحْمَٰنِ الرَّحِيمِ',
            translation: 'The Entirely Merciful, the Especially Merciful,',
            tafsir: 'الرحمن الرحيم: وصفان يدلان على سعة رحمة الله تعالى بخلقه في الدنيا والآخرة.'
          },
          { 
            number: 4, 
            text: 'مَالِكِ يَوْمِ الدِّينِ',
            translation: 'Sovereign of the Day of Recompense.',
            tafsir: 'مالك يوم الدين: أي صاحب السلطان النافذ يوم القيامة، وهو يوم الجزاء والحساب.'
          },
          { 
            number: 5, 
            text: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
            translation: 'It is You we worship and You we ask for help.',
            tafsir: 'إياك نعبد: أي نخصك وحدك بالعبادة، وإياك نستعين: نطلب العون منك وحدك في جميع أمورنا.'
          },
          { 
            number: 6, 
            text: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
            translation: 'Guide us to the straight path -',
            tafsir: 'اهدنا الصراط المستقيم: أي وفقنا للطريق القويم الذي لا اعوجاج فيه، وهو دين الإسلام.'
          },
          { 
            number: 7, 
            text: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
            translation: 'The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.',
            tafsir: 'صراط الذين أنعمت عليهم: طريق المؤمنين من الأنبياء والصالحين، غير المغضوب عليهم: وهم اليهود، ولا الضالين: وهم النصارى.'
          }
        ];
      }

      setCurrentSurah(mockSurah);
      setCurrentAyah(0);
      
    } catch (error) {
      console.error('Error loading surah:', error);
      toast({
        title: 'خطأ في تحميل السورة',
        description: 'لم نتمكن من تحميل السورة المطلوبة',
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
      if (currentAudio) {
        currentAudio.pause();
        setCurrentAudio(null);
      }

      setIsPlaying(true);
      setCurrentAyah(ayahIndex);

      // Simulate audio loading
      const audio = new Audio();
      const ayahNumber = ayahIndex + 1;
      
      // Mock audio URL - replace with real API
      const surahStr = currentSurah.number.toString().padStart(3, '0');
      const ayahStr = ayahNumber.toString().padStart(3, '0');
      
      audio.src = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${surahStr}${ayahStr}.mp3`;
      
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
        }
      });
      
      await audio.play();
      
      toast({
        title: '🎵 بدء التلاوة',
        description: `الآية ${ayahNumber} من سورة ${currentSurah.name}`,
      });
      
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsPlaying(false);
      toast({
        title: 'خطأ في التشغيل',
        description: 'لم نتمكن من تشغيل التلاوة',
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