import { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX,
  Settings,
  Repeat,
  Repeat1
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useQuery } from '@tanstack/react-query';

interface EnhancedAudioPlayerProps {
  surahNumber: number;
  ayahNumber: number;
  onAyahChange?: (ayah: number) => void;
  totalAyahs?: number;
}

const RECITERS = [
  { id: "1", name: "عبد الباسط عبد الصمد", path: "AbdulSamad_64kbps_QuranExplorer.Com" },
  { id: "2", name: "ماهر المعيقلي", path: "Maher_AlMuaiqly_64kbps" },
  { id: "3", name: "محمود خليل الحصري", path: "Husary_64kbps" },
  { id: "4", name: "مشاري راشد العفاسي", path: "Alafasy_64kbps" },
  { id: "5", name: "سعد الغامدي", path: "Ghamdi_40kbps" },
  { id: "6", name: "عبد الرحمن السديس", path: "Sudais_64kbps" },
  { id: "7", name: "سعود الشريم", path: "Shuraim_64kbps" },
  { id: "8", name: "أحمد العجمي", path: "Ahmed_ibn_Ali_al-Ajamy_64kbps" },
];

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function EnhancedAudioPlayer({ 
  surahNumber, 
  ayahNumber, 
  onAyahChange,
  totalAyahs = 286 
}: EnhancedAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedReciter, setSelectedReciter] = useState<string>("4");
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [autoPlay, setAutoPlay] = useState(true);
  const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>('none');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const selectedReciterData = RECITERS.find(r => r.id === selectedReciter);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      
      audioRef.current.addEventListener('play', () => setIsPlaying(true));
      audioRef.current.addEventListener('pause', () => setIsPlaying(false));
      audioRef.current.addEventListener('ended', handleAyahEnd);
      audioRef.current.addEventListener('error', handleAudioError);
      audioRef.current.addEventListener('loadstart', () => setIsLoading(true));
      audioRef.current.addEventListener('canplay', () => setIsLoading(false));
      audioRef.current.addEventListener('timeupdate', () => {
        setCurrentTime(audioRef.current?.currentTime || 0);
      });
      audioRef.current.addEventListener('durationchange', () => {
        setDuration(audioRef.current?.duration || 0);
      });
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);
  
  useEffect(() => {
    if (audioRef.current) {
      loadAudio();
    }
  }, [selectedReciter, surahNumber, ayahNumber]);
  
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);
  
  const loadAudio = () => {
    if (!selectedReciterData || !audioRef.current) return;
    
    const baseUrl = "https://everyayah.com/data";
    const reciterPath = selectedReciterData.path;
    const formattedSurah = surahNumber.toString().padStart(3, '0');
    const formattedAyah = ayahNumber.toString().padStart(3, '0');
    const audioUrl = `${baseUrl}/${reciterPath}/${formattedSurah}${formattedAyah}.mp3`;
    
    setError(null);
    audioRef.current.src = audioUrl;
    
    if (isPlaying || autoPlay) {
      audioRef.current.play().catch(handleAudioError);
    }
  };
  
  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(handleAudioError);
    }
  };
  
  const playPrevious = () => {
    if (ayahNumber > 1 && onAyahChange) {
      onAyahChange(ayahNumber - 1);
    }
  };
  
  const playNext = () => {
    if (ayahNumber < totalAyahs && onAyahChange) {
      onAyahChange(ayahNumber + 1);
    }
  };
  
  const handleAyahEnd = () => {
    if (repeatMode === 'one') {
      audioRef.current?.play();
    } else if (repeatMode === 'all' || autoPlay) {
      if (ayahNumber < totalAyahs) {
        playNext();
      }
    }
  };
  
  const handleAudioError = (err: any) => {
    setIsLoading(false);
    const errorMessage = "تعذر تحميل الملف الصوتي. تأكد من اتصالك بالإنترنت.";
    setError(errorMessage);
    console.error("Audio error:", err);
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleRepeatMode = () => {
    if (repeatMode === 'none') setRepeatMode('all');
    else if (repeatMode === 'all') setRepeatMode('one');
    else setRepeatMode('none');
  };

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current && duration) {
      const newTime = (value[0] / 100) * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 rounded-xl shadow-lg p-4 md:p-6 border border-emerald-200 dark:border-emerald-900">
      <div className="flex flex-col space-y-4">
        {/* Header with Reciter Selection */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <Select value={selectedReciter} onValueChange={setSelectedReciter}>
              <SelectTrigger className="w-full bg-white dark:bg-gray-800" data-testid="select-reciter">
                <SelectValue placeholder="اختر القارئ" />
              </SelectTrigger>
              <SelectContent>
                {RECITERS.map((reciter) => (
                  <SelectItem key={reciter.id} value={reciter.id}>
                    {reciter.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Settings Button */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" data-testid="button-audio-settings">
                <Settings className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-3">إعدادات التشغيل</h4>
                  
                  <div className="space-y-3">
                    {/* Playback Speed */}
                    <div className="flex items-center justify-between">
                      <Label htmlFor="speed">سرعة التشغيل</Label>
                      <Select 
                        value={playbackSpeed.toString()} 
                        onValueChange={(v) => setPlaybackSpeed(parseFloat(v))}
                      >
                        <SelectTrigger className="w-24" id="speed">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PLAYBACK_SPEEDS.map((speed) => (
                            <SelectItem key={speed} value={speed.toString()}>
                              {speed}x
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Auto Play */}
                    <div className="flex items-center justify-between">
                      <Label htmlFor="autoplay">التشغيل التلقائي</Label>
                      <Switch
                        id="autoplay"
                        checked={autoPlay}
                        onCheckedChange={setAutoPlay}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Slider
            value={[duration ? (currentTime / duration) * 100 : 0]}
            min={0}
            max={100}
            step={0.1}
            onValueChange={handleSeek}
            className="w-full"
            data-testid="slider-audio-progress"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        
        {/* Control Buttons */}
        <div className="flex justify-center items-center gap-2">
          {/* Repeat Button */}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleRepeatMode}
            className={repeatMode !== 'none' ? 'text-emerald-600 dark:text-emerald-400' : ''}
            data-testid="button-repeat"
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="h-5 w-5" />
            ) : (
              <Repeat className="h-5 w-5" />
            )}
          </Button>

          {/* Previous Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={playPrevious}
            disabled={isLoading || ayahNumber <= 1}
            data-testid="button-prev-ayah"
          >
            <SkipBack className="h-5 w-5" />
          </Button>
          
          {/* Play/Pause Button */}
          <Button 
            variant="default" 
            size="icon" 
            className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white shadow-lg"
            onClick={togglePlayPause}
            disabled={isLoading}
            data-testid="button-play-pause"
          >
            {isLoading ? (
              <div className="w-6 h-6 rounded-full border-2 border-t-transparent border-white animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6 mr-1" />
            )}
          </Button>
          
          {/* Next Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={playNext}
            disabled={isLoading || ayahNumber >= totalAyahs}
            data-testid="button-next-ayah"
          >
            <SkipForward className="h-5 w-5" />
          </Button>

          {/* Volume Controls */}
          <div className="flex items-center gap-2 mr-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleMute}
              data-testid="button-mute"
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </Button>
            
            <Slider
              className="w-20 hidden md:block"
              value={[volume * 100]}
              min={0}
              max={100}
              step={1}
              onValueChange={(values) => setVolume(values[0] / 100)}
              data-testid="slider-volume"
            />
          </div>
        </div>
        
        {/* Current Info & Error */}
        <div className="text-center">
          {error ? (
            <div className="text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              {selectedReciterData?.name} • الآية {ayahNumber}
              {playbackSpeed !== 1 && ` • ${playbackSpeed}x`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
