import { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { type Reciter } from '@shared/schema';

interface AudioPlayerProps {
  surahNumber: number;
  ayahNumber: number;
}

const AudioPlayer = ({ surahNumber, ayahNumber }: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedReciter, setSelectedReciter] = useState<string>("1"); // عبد الباسط عبد الصمد افتراضيًا
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // الحصول على قائمة القراء
  const { data: reciters } = useQuery<Reciter[]>({
    queryKey: ['/api/reciters'],
  });

  // الحصول على معلومات القارئ المحدد
  const { data: reciter } = useQuery<Reciter>({
    queryKey: ['/api/reciters', selectedReciter],
    enabled: !!selectedReciter,
  });

  useEffect(() => {
    // إنشاء العنصر الصوتي
    if (!audioRef.current) {
      audioRef.current = new Audio();
      
      // إضافة مستمعي الأحداث
      audioRef.current.addEventListener('play', () => setIsPlaying(true));
      audioRef.current.addEventListener('pause', () => setIsPlaying(false));
      audioRef.current.addEventListener('ended', handleAyahEnd);
      audioRef.current.addEventListener('error', handleAudioError);
      audioRef.current.addEventListener('loadstart', () => setIsLoading(true));
      audioRef.current.addEventListener('canplay', () => setIsLoading(false));
    }
    
    // تنظيف عند إزالة المكون
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener('play', () => setIsPlaying(true));
        audioRef.current.removeEventListener('pause', () => setIsPlaying(false));
        audioRef.current.removeEventListener('ended', handleAyahEnd);
        audioRef.current.removeEventListener('error', handleAudioError);
        audioRef.current.removeEventListener('loadstart', () => setIsLoading(true));
        audioRef.current.removeEventListener('canplay', () => setIsLoading(false));
      }
    };
  }, []);
  
  // تحديث المصدر الصوتي عند تغيير القارئ أو السورة أو الآية
  useEffect(() => {
    if (audioRef.current) {
      loadAudio();
    }
  }, [selectedReciter, surahNumber, ayahNumber]);
  
  // تحديث مستوى الصوت عند تغييره
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);
  
  // تحميل الصوت
  const loadAudio = () => {
    if (!reciter || !audioRef.current) return;
    
    // استخدام واجهة API EveryAyah للقراءات القرآنية
    // هذه الواجهة متاحة للاستخدام العام وتوفر تلاوات من قراء مختلفين
    const baseUrl = "https://everyayah.com/data";
    
    // تحديد المسار حسب القارئ
    let reciterPath;
    switch (parseInt(selectedReciter)) {
      case 1: // عبد الباسط عبد الصمد
        reciterPath = "AbdulSamad_64kbps_QuranExplorer.Com";
        break;
      case 2: // ماهر المعيقلي
        reciterPath = "Maher_AlMuaiqly_64kbps";
        break;
      case 3: // محمود خليل الحصري
        reciterPath = "Husary_64kbps";
        break;
      case 4: // مشاري راشد العفاسي
        reciterPath = "Alafasy_64kbps";
        break;
      case 5: // سعد الغامدي
        reciterPath = "Ghamdi_40kbps";
        break;
      case 6: // عبد الرحمن السديس
        reciterPath = "Sudais_64kbps";
        break;
      case 7: // سعود الشريم
        reciterPath = "Shuraim_64kbps";
        break;
      case 8: // أحمد العجمي
        reciterPath = "Ahmed_ibn_Ali_al-Ajamy_64kbps";
        break;
      default:
        reciterPath = "Alafasy_64kbps"; // مشاري العفاسي كخيار افتراضي
    }
    
    // تنسيق رقم السورة بحيث يكون طوله 3 أرقام (مثال: 001، 012، 114)
    const formattedSurah = surahNumber.toString().padStart(3, '0');
    
    // تنسيق رقم الآية بحيث يكون طوله 3 أرقام أيضًا
    const formattedAyah = ayahNumber.toString().padStart(3, '0');
    
    // بناء عنوان الملف الصوتي
    const audioUrl = `${baseUrl}/${reciterPath}/${formattedSurah}${formattedAyah}.mp3`;
    
    // وضع عنوان الملف الصوتي
    setError(null);
    audioRef.current.src = audioUrl;
    console.log("Loading audio:", audioUrl);
    
    // إذا كان يعمل بالفعل، استمر في التشغيل بعد تحميل الملف الجديد
    if (isPlaying) {
      audioRef.current.play().catch(handleAudioError);
    }
  };
  
  // التبديل بين التشغيل والإيقاف
  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(handleAudioError);
    }
  };
  
  // الانتقال إلى الآية السابقة
  const playPrevious = () => {
    // أي منطق تحتاجه للانتقال للآية السابقة
    // في هذا المثال، سننتقل للآية السابقة في نفس السورة
    if (ayahNumber > 1) {
      // الانتقال للآية السابقة منطق سيتم تنفيذه من خلال الكومبوننت الأب
      // يمكن إضافة callback function كـ props
    }
  };
  
  // الانتقال إلى الآية التالية
  const playNext = () => {
    // أي منطق تحتاجه للانتقال للآية التالية
    // يمكن إضافة callback function كـ props
  };
  
  // التعامل مع انتهاء الآية
  const handleAyahEnd = () => {
    // الافتراضي: الانتقال للآية التالية تلقائيًا
    playNext();
  };
  
  // التعامل مع أخطاء الصوت
  const handleAudioError = (err: any) => {
    setIsLoading(false);
    // عرض رسالة خطأ محددة تتعلق بالشبكة والاتصال
    const errorMessage = "تعذر تحميل الملف الصوتي. تأكد من اتصالك بالإنترنت أو جرب قارئاً آخر.";
    setError(errorMessage);
    console.error("Audio error:", err);
    
    // محاولة تشغيل مرة أخرى بعد ثوانٍ قليلة
    setTimeout(() => {
      if (audioRef.current) {
        console.log("Retrying audio playback...");
        audioRef.current.load();
        audioRef.current.play().catch(e => {
          console.error("Retry failed:", e);
        });
      }
    }, 3000);
  };
  
  // التبديل بين الصوت والكتم
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };
  
  // تغيير القارئ
  const handleReciterChange = (value: string) => {
    setSelectedReciter(value);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 my-4">
      <div className="flex flex-col space-y-4">
        {/* اختيار القارئ */}
        <div className="w-full">
          <Select 
            value={selectedReciter} 
            onValueChange={handleReciterChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="اختر القارئ" />
            </SelectTrigger>
            <SelectContent>
              {reciters?.map((reciter) => (
                <SelectItem key={reciter.id} value={reciter.id.toString()}>
                  {reciter.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* أزرار التحكم */}
        <div className="flex justify-center items-center space-x-2 rtl:space-x-reverse">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={playPrevious}
            disabled={isLoading || ayahNumber <= 1}
          >
            <SkipBack className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="default" 
            size="icon" 
            className="w-12 h-12 rounded-full bg-primary text-white"
            onClick={togglePlayPause}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="w-5 h-5 rounded-full border-2 border-t-transparent border-white animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 ml-0.5" />
            )}
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={playNext}
            disabled={isLoading}
          >
            <SkipForward className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center space-x-2 rtl:space-x-reverse ml-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleMute}
              className="text-primary"
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
            
            <Slider
              className="w-24"
              value={[volume * 100]}
              min={0}
              max={100}
              step={1}
              onValueChange={(values) => setVolume(values[0] / 100)}
            />
          </div>
        </div>
        
        {/* رسالة الخطأ */}
        {error && (
          <div className="text-red-500 text-center text-sm mt-2">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioPlayer;