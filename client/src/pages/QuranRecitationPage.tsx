import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { queryClient, apiRequest } from '@/lib/queryClient';
import {
  Mic,
  MicOff,
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Volume2,
  ArrowLeft,
  Star,
  BookOpen,
  Headphones,
  Activity,
  Info,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Ayah {
  number: number;
  numberInSurah: number;
  text: string;
  surah: {
    number: number;
    name: string;
    englishName: string;
    numberOfAyahs: number;
  };
}

interface WordResult {
  word: string;
  status: 'correct' | 'incorrect' | 'pending';
}

interface AyahResult {
  ayahNumber: number;
  score: number;
  wordResults: WordResult[];
  spokenText: string;
}

const SURAHS = [
  { number: 1, name: 'الفاتحة', ayahs: 7 },
  { number: 2, name: 'البقرة', ayahs: 286 },
  { number: 3, name: 'آل عمران', ayahs: 200 },
  { number: 4, name: 'النساء', ayahs: 176 },
  { number: 5, name: 'المائدة', ayahs: 120 },
  { number: 6, name: 'الأنعام', ayahs: 165 },
  { number: 7, name: 'الأعراف', ayahs: 206 },
  { number: 8, name: 'الأنفال', ayahs: 75 },
  { number: 9, name: 'التوبة', ayahs: 129 },
  { number: 10, name: 'يونس', ayahs: 109 },
  { number: 18, name: 'الكهف', ayahs: 110 },
  { number: 36, name: 'يس', ayahs: 83 },
  { number: 55, name: 'الرحمن', ayahs: 78 },
  { number: 56, name: 'الواقعة', ayahs: 96 },
  { number: 67, name: 'الملك', ayahs: 30 },
  { number: 78, name: 'النبأ', ayahs: 40 },
  { number: 87, name: 'الأعلى', ayahs: 19 },
  { number: 89, name: 'الفجر', ayahs: 30 },
  { number: 93, name: 'الضحى', ayahs: 11 },
  { number: 94, name: 'الشرح', ayahs: 8 },
  { number: 96, name: 'العلق', ayahs: 19 },
  { number: 99, name: 'الزلزلة', ayahs: 8 },
  { number: 100, name: 'العاديات', ayahs: 11 },
  { number: 101, name: 'القارعة', ayahs: 11 },
  { number: 102, name: 'التكاثر', ayahs: 8 },
  { number: 103, name: 'العصر', ayahs: 3 },
  { number: 104, name: 'الهمزة', ayahs: 9 },
  { number: 105, name: 'الفيل', ayahs: 5 },
  { number: 106, name: 'قريش', ayahs: 4 },
  { number: 107, name: 'الماعون', ayahs: 7 },
  { number: 108, name: 'الكوثر', ayahs: 3 },
  { number: 109, name: 'الكافرون', ayahs: 6 },
  { number: 110, name: 'النصر', ayahs: 3 },
  { number: 111, name: 'المسد', ayahs: 5 },
  { number: 112, name: 'الإخلاص', ayahs: 4 },
  { number: 113, name: 'الفلق', ayahs: 5 },
  { number: 114, name: 'الناس', ayahs: 6 },
];

const RECITERS = [
  { id: 'ar.alafasy', name: 'مشاري العفاسي' },
  { id: 'ar.minshawi', name: 'محمد صديق المنشاوي' },
  { id: 'ar.husary', name: 'محمود خليل الحصري' },
  { id: 'ar.abdulbasitmurattal', name: 'عبد الباسط عبد الصمد' },
];

function normalizeArabic(text: string): string {
  return text
    .replace(/[\u064B-\u065F\u0610-\u061A\u06D6-\u06ED]/g, '')
    .replace(/[أإآا]/g, 'ا')
    .replace(/[ىي]/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/\s+/g, ' ')
    .trim();
}

function compareWords(spoken: string, expected: string): WordResult[] {
  const spokenNorm = normalizeArabic(spoken);
  const expectedWords = expected.split(/\s+/).filter(w => w.trim());
  const spokenWords = spokenNorm.split(/\s+/).filter(w => w.trim());

  return expectedWords.map((expectedWord) => {
    const expectedNorm = normalizeArabic(expectedWord);
    const found = spokenWords.some((spokenWord) => {
      const spokenNorm2 = normalizeArabic(spokenWord);
      if (spokenNorm2 === expectedNorm) return true;
      if (spokenNorm2.includes(expectedNorm) || expectedNorm.includes(spokenNorm2)) return true;
      return levenshteinSimilarity(spokenNorm2, expectedNorm) > 0.75;
    });
    return {
      word: expectedWord,
      status: found ? 'correct' : 'incorrect',
    } as WordResult;
  });
}

function levenshteinSimilarity(s1: string, s2: string): number {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  if (longer.length === 0) return 1.0;
  const costs: number[] = [];
  for (let i = 0; i <= shorter.length; i++) {
    let lastVal = i;
    for (let j = 0; j <= longer.length; j++) {
      if (i === 0) costs[j] = j;
      else if (j > 0) {
        let newVal = costs[j - 1];
        if (shorter[i - 1] !== longer[j - 1])
          newVal = Math.min(Math.min(newVal, lastVal), costs[j]) + 1;
        costs[j - 1] = lastVal;
        lastVal = newVal;
      }
    }
    if (i > 0) costs[longer.length] = lastVal;
  }
  const distance = costs[longer.length] ?? 0;
  return (longer.length - distance) / longer.length;
}

export default function QuranRecitationPage({ onBack }: { onBack?: () => void }) {
  const { toast } = useToast();
  const {
    isSupported,
    startListening,
    stopListening,
    transcript,
    interimTranscript,
    resetTranscript,
    isListening,
    error: speechError,
  } = useSpeechRecognition();

  const [selectedSurah, setSelectedSurah] = useState<number>(1);
  const [selectedReciter, setSelectedReciter] = useState<string>('ar.alafasy');
  const [currentAyahIndex, setCurrentAyahIndex] = useState<number>(0);
  const [mode, setMode] = useState<'select' | 'listen' | 'practice' | 'results'>('select');
  const [isPlaying, setIsPlaying] = useState(false);
  const [wordResults, setWordResults] = useState<WordResult[]>([]);
  const [sessionResults, setSessionResults] = useState<AyahResult[]>([]);
  const [hasRecited, setHasRecited] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [micStatus, setMicStatus] = useState<'idle' | 'testing' | 'ok' | 'error'>('idle');
  const [micError, setMicError] = useState<string>('');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasProcessedRef = useRef(false);

  const { data: surahData, isLoading } = useQuery<{ ayahs: Ayah[] }>({
    queryKey: [`https://api.alquran.cloud/v1/surah/${selectedSurah}`],
    queryFn: async () => {
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${selectedSurah}`);
      const json = await res.json();
      return json.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const ayahs = surahData?.ayahs || [];
  const currentAyah = ayahs[currentAyahIndex];

  const savePracticeMutation = useMutation({
    mutationFn: async (data: { surahNumber: number; score: number; ayahsCount: number }) => {
      return apiRequest('/api/quran/recitation-attempts', 'POST', data);
    },
  });

  const testMicrophone = async () => {
    setMicStatus('testing');
    setMicError('');
    if (!isSupported) {
      setMicStatus('error');
      setMicError('متصفحك لا يدعم ميزة التسميع. يرجى استخدام Google Chrome أو Microsoft Edge.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setMicStatus('ok');
    } catch (e: any) {
      setMicStatus('error');
      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
        setMicError('تم رفض إذن الميكروفون. اضغط على أيقونة 🔒 في شريط العنوان ← الإذونات ← الميكروفون ← السماح، ثم أعد تحميل الصفحة.');
      } else if (e.name === 'NotFoundError') {
        setMicError('لم يُعثر على ميكروفون. يرجى توصيل ميكروفون بجهازك.');
      } else if (e.name === 'NotReadableError') {
        setMicError('الميكروفون مستخدم من تطبيق آخر. أغلق التطبيق الآخر وحاول مرة ثانية.');
      } else {
        setMicError('خطأ في الميكروفون: ' + (e.message || e.name));
      }
    }
  };

  useEffect(() => {
    return () => {
      stopAudio();
      if (isListening) {
        stopListening();
      }
    };
  }, []);

  useEffect(() => {
    const combined = ((transcript || '') + ' ' + (interimTranscript || '')).trim();
    setLiveTranscript(combined);

    if (!isListening || !currentAyah || !combined || hasProcessedRef.current) return;

    const words = combined.split(/\s+/).filter(w => w.length > 1);
    if (words.length >= 2) {
      const results = compareWords(combined, currentAyah.text);
      setWordResults(results);
    }
  }, [transcript, interimTranscript, isListening, currentAyah]);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    setIsPlaying(false);
  };

  const RECITER_EVERYAYAH: Record<string, string> = {
    'ar.alafasy': 'Alafasy_64kbps',
    'ar.minshawi': 'Mohammad_al_Minshawi_128kbps',
    'ar.husary': 'Husary_128kbps',
    'ar.abdulbasitmurattal': 'Abdul_Basit_Murattal_192kbps',
  };

  const playAudio = async (ayahNumber: number) => {
    stopAudio();
    const surahPadded = String(selectedSurah).padStart(3, '0');
    const ayah = ayahs.find(a => a.number === ayahNumber);
    const ayahInSurah = ayah?.numberInSurah ?? 1;
    const ayahInSurahPadded = String(ayahInSurah).padStart(3, '0');

    const primaryUrl = `https://cdn.islamic.network/quran/audio/128/${selectedReciter}/${ayahNumber}.mp3`;
    const everyayahDir = RECITER_EVERYAYAH[selectedReciter] || 'Alafasy_64kbps';
    const fallbackUrl = `https://everyayah.com/data/${everyayahDir}/${surahPadded}${ayahInSurahPadded}.mp3`;

    const tryPlay = (url: string, onFail?: () => void) => {
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => {
        setIsPlaying(false);
        if (autoAdvance && mode === 'listen') {
          setTimeout(() => {
            if (currentAyahIndex < ayahs.length - 1) {
              setCurrentAyahIndex(prev => {
                const next = prev + 1;
                setTimeout(() => playAudio(ayahs[next].number), 500);
                return next;
              });
            }
          }, 1000);
        }
      };
      audio.onerror = () => {
        setIsPlaying(false);
        if (onFail) onFail();
      };
      audio.play().catch(() => {
        if (onFail) onFail();
      });
      return audio;
    };

    tryPlay(primaryUrl, () => {
      tryPlay(fallbackUrl);
    });
  };

  const togglePlayPause = () => {
    if (!currentAyah) return;
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      playAudio(currentAyah.number);
    }
  };

  const startPractice = () => {
    stopAudio();
    if (!isSupported) {
      toast({
        title: 'المتصفح غير مدعوم',
        description: 'يرجى استخدام متصفح Google Chrome للتسميع',
        variant: 'destructive',
      });
      return;
    }
    resetTranscript();
    hasProcessedRef.current = false;
    setWordResults(currentAyah ? currentAyah.text.split(/\s+/).map(w => ({ word: w, status: 'pending' })) : []);
    setHasRecited(false);
    setLiveTranscript('');
    startListening();
  };

  const stopPractice = () => {
    stopListening();
    hasProcessedRef.current = true;

    if (!currentAyah) return;
    const combined = ((transcript || '') + ' ' + (interimTranscript || '')).trim() || liveTranscript.trim();

    if (!combined) {
      toast({ title: 'لم يتم التعرف على صوت', description: 'حاول مرة أخرى وتأكد من منح إذن الميكروفون', variant: 'destructive' });
      return;
    }

    const results = compareWords(combined, currentAyah.text);
    setWordResults(results);
    setHasRecited(true);

    const correct = results.filter(r => r.status === 'correct').length;
    const score = Math.round((correct / results.length) * 100);

    setSessionResults(prev => [...prev, {
      ayahNumber: currentAyah.numberInSurah,
      score,
      wordResults: results,
      spokenText: combined,
    }]);
  };

  const nextAyah = () => {
    stopAudio();
    if (isListening) stopListening();
    if (currentAyahIndex >= ayahs.length - 1) {
      setMode('results');
      return;
    }
    setCurrentAyahIndex(prev => prev + 1);
    setWordResults([]);
    setHasRecited(false);
    setLiveTranscript('');
    hasProcessedRef.current = false;
    resetTranscript();
  };

  const previousAyah = () => {
    stopAudio();
    if (isListening) stopListening();
    if (currentAyahIndex > 0) {
      setCurrentAyahIndex(prev => prev - 1);
      setWordResults([]);
      setHasRecited(false);
      setLiveTranscript('');
      hasProcessedRef.current = false;
      resetTranscript();
    }
  };

  const retryAyah = () => {
    stopAudio();
    if (isListening) stopListening();
    setWordResults(currentAyah ? currentAyah.text.split(/\s+/).map(w => ({ word: w, status: 'pending' })) : []);
    setHasRecited(false);
    setLiveTranscript('');
    hasProcessedRef.current = false;
    resetTranscript();
  };

  const getAverageScore = () => {
    if (!sessionResults.length) return 0;
    return Math.round(sessionResults.reduce((sum, r) => sum + r.score, 0) / sessionResults.length);
  };

  const finishSession = () => {
    const avg = getAverageScore();
    savePracticeMutation.mutate({
      surahNumber: selectedSurah,
      score: avg,
      ayahsCount: sessionResults.length,
    });
    setMode('results');
  };

  if (mode === 'select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900" dir="rtl">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" onClick={onBack || (() => window.history.back())} data-testid="button-back">
              <ArrowLeft className="w-5 h-5 ml-2" />
              رجوع
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-emerald-800 dark:text-emerald-300">تسميع القرآن الكريم</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">تدرب على التلاوة واحصل على تقييم فوري</p>
            </div>
          </div>

          <div className="grid gap-6">
            <Card className="border-emerald-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                  <BookOpen className="w-5 h-5" />
                  اختر السورة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={String(selectedSurah)} onValueChange={v => { setSelectedSurah(Number(v)); setCurrentAyahIndex(0); }}>
                  <SelectTrigger className="h-12 text-base" data-testid="select-surah">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SURAHS.map(s => (
                      <SelectItem key={s.number} value={String(s.number)}>
                        {s.number}. سورة {s.name} ({s.ayahs} آية)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedReciter} onValueChange={setSelectedReciter}>
                  <SelectTrigger className="h-12 text-base" data-testid="select-reciter">
                    <SelectValue placeholder="اختر القارئ" />
                  </SelectTrigger>
                  <SelectContent>
                    {RECITERS.map(r => (
                      <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Card
                className="border-blue-200 cursor-pointer hover:shadow-lg transition-all hover:border-blue-400 bg-blue-50 dark:bg-blue-950/30"
                onClick={() => { setMode('listen'); setCurrentAyahIndex(0); }}
                data-testid="card-listen-mode"
              >
                <CardContent className="pt-6 text-center">
                  <div className="w-14 h-14 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Headphones className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-1">الاستماع</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">استمع للتلاوة أولاً</p>
                </CardContent>
              </Card>

              <Card
                className="border-emerald-200 cursor-pointer hover:shadow-lg transition-all hover:border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30"
                onClick={() => { setMode('practice'); setCurrentAyahIndex(0); setSessionResults([]); }}
                data-testid="card-practice-mode"
              >
                <CardContent className="pt-6 text-center">
                  <div className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Mic className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-bold text-emerald-800 dark:text-emerald-300 mb-1">التسميع</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">اقرأ وراجع أخطاءك</p>
                </CardContent>
              </Card>
            </div>

            {/* Mic Test Card */}
            <Card className={`border-2 transition-colors ${
              micStatus === 'ok' ? 'border-green-300 bg-green-50 dark:bg-green-950/20' :
              micStatus === 'error' ? 'border-red-300 bg-red-50 dark:bg-red-950/20' :
              'border-gray-200 bg-gray-50 dark:bg-gray-950/20'
            }`}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {micStatus === 'ok' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                    ) : micStatus === 'error' ? (
                      <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                    ) : (
                      <Mic className="w-5 h-5 text-gray-500 shrink-0" />
                    )}
                    <span className={`text-sm font-medium ${
                      micStatus === 'ok' ? 'text-green-700 dark:text-green-300' :
                      micStatus === 'error' ? 'text-red-700 dark:text-red-300' :
                      'text-gray-700 dark:text-gray-300'
                    }`}>
                      {micStatus === 'ok' ? '✅ الميكروفون يعمل بشكل صحيح' :
                       micStatus === 'error' ? '❌ مشكلة في الميكروفون' :
                       micStatus === 'testing' ? '⏳ جاري الاختبار...' :
                       'اختبر الميكروفون قبل البدء'}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={testMicrophone}
                    disabled={micStatus === 'testing'}
                    data-testid="button-test-mic"
                    className="shrink-0"
                  >
                    {micStatus === 'testing' ? (
                      <span className="flex items-center gap-1">
                        <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                        جاري...
                      </span>
                    ) : (
                      <>
                        <Mic className="w-3.5 h-3.5 ml-1" />
                        اختبار
                      </>
                    )}
                  </Button>
                </div>
                {micError && (
                  <p className="text-red-600 dark:text-red-400 text-xs mt-2 leading-relaxed">{micError}</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                  <div className="text-sm text-amber-800 dark:text-amber-300">
                    <p className="font-medium mb-1">كيف يعمل التسميع؟</p>
                    <ul className="space-y-1 text-xs">
                      <li>• اختر السورة والقارئ ثم اضغط <strong>التسميع</strong></li>
                      <li>• اضغط على زر المايكروفون وابدأ القراءة</li>
                      <li>• سيتم تحويل صوتك لنص ومقارنته بالآية</li>
                      <li>• الكلمات الصحيحة <span className="text-green-600 font-bold">بالأخضر</span> والخطأ <span className="text-red-600 font-bold">بالأحمر</span></li>
                      <li>• يعمل بتقنية التعرف على الصوت المدمجة في المتصفح</li>
                    </ul>
                    <div className="mt-2 pt-2 border-t border-amber-200 dark:border-amber-700">
                      <p className="text-xs font-medium text-amber-700 dark:text-amber-400">⚡ متطلبات التسميع:</p>
                      <ul className="text-xs mt-1 space-y-0.5 text-amber-700 dark:text-amber-400">
                        <li>✅ متصفح Google Chrome أو Microsoft Edge</li>
                        <li>✅ السماح للمتصفح باستخدام الميكروفون</li>
                        <li>✅ اتصال بالإنترنت</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'results') {
    const avg = getAverageScore();
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-zinc-900 dark:to-zinc-800" dir="rtl">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${
              avg >= 80 ? 'bg-green-100' : avg >= 60 ? 'bg-yellow-100' : 'bg-red-100'
            }`}>
              <span className={`text-3xl font-bold ${
                avg >= 80 ? 'text-green-600' : avg >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}>{avg}%</span>
            </div>
            <h2 className="text-2xl font-bold text-emerald-800 dark:text-emerald-300 mb-2">
              {avg >= 80 ? 'ممتاز! أحسنت التلاوة' : avg >= 60 ? 'جيد، تحتاج لمزيد من التدريب' : 'تحتاج لمزيد من المراجعة'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              تلوت {sessionResults.length} من {ayahs.length} آيات
            </p>
          </div>

          <div className="space-y-4 mb-8">
            {sessionResults.map((result, i) => (
              <Card key={i} className={`border ${result.score >= 80 ? 'border-green-200' : result.score >= 60 ? 'border-yellow-200' : 'border-red-200'}`}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-sm">الآية {result.ayahNumber}</span>
                    <Badge variant={result.score >= 80 ? 'default' : 'destructive'} className={result.score >= 80 ? 'bg-green-600' : ''}>
                      {result.score}%
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3" dir="rtl">
                    {result.wordResults.map((wr, j) => (
                      <span
                        key={j}
                        className={`text-base px-1 rounded font-arabic ${
                          wr.status === 'correct'
                            ? 'text-green-700 bg-green-50'
                            : 'text-red-700 bg-red-50 underline decoration-wavy'
                        }`}
                      >
                        {wr.word}
                      </span>
                    ))}
                  </div>
                  {result.score < 100 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      ما تلوته: <span className="font-medium">{result.spokenText || '(لم يُسجَّل)'}</span>
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex gap-3">
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => { setMode('practice'); setCurrentAyahIndex(0); setSessionResults([]); setWordResults([]); setHasRecited(false); }}
              data-testid="button-retry-session"
            >
              <RotateCcw className="w-4 h-4 ml-2" />
              إعادة التسميع
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => { setMode('select'); setSessionResults([]); }} data-testid="button-back-select">
              اختيار سورة أخرى
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentSurahInfo = SURAHS.find(s => s.number === selectedSurah);
  const progress = ayahs.length ? ((currentAyahIndex + 1) / ayahs.length) * 100 : 0;
  const correctCount = wordResults.filter(w => w.status === 'correct').length;
  const totalCount = wordResults.length;
  const score = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-teal-900 to-emerald-900" dir="rtl">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            className="text-white/70 hover:text-white hover:bg-white/10"
            onClick={() => { stopAudio(); if (isListening) stopListening(); setMode('select'); }}
            data-testid="button-back"
          >
            <ArrowLeft className="w-5 h-5 ml-2" />
            رجوع
          </Button>
          <div className="text-center">
            <h2 className="text-white font-bold">سورة {currentSurahInfo?.name}</h2>
            <p className="text-emerald-300 text-sm">الآية {currentAyahIndex + 1} من {ayahs.length}</p>
          </div>
          <Button
            variant="ghost"
            className={`text-sm ${mode === 'listen' ? 'text-blue-300' : 'text-emerald-300'}`}
            onClick={() => {
              stopAudio();
              if (isListening) stopListening();
              setMode(mode === 'listen' ? 'practice' : 'listen');
              setWordResults([]);
              setHasRecited(false);
            }}
            data-testid="button-toggle-mode"
          >
            {mode === 'listen' ? <Mic className="w-4 h-4 ml-1" /> : <Headphones className="w-4 h-4 ml-1" />}
            {mode === 'listen' ? 'تسميع' : 'استماع'}
          </Button>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <Progress value={progress} className="h-2 bg-white/20" />
          <div className="flex justify-between text-xs text-emerald-300 mt-1">
            <span>الآية {currentAyahIndex + 1}</span>
            <span>المتبقي: {ayahs.length - currentAyahIndex - 1}</span>
          </div>
        </div>

        {/* Session score */}
        {sessionResults.length > 0 && (
          <div className="flex items-center justify-between mb-4 bg-white/10 rounded-lg px-4 py-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-300" />
              <span className="text-sm text-white">متوسط الجلسة:</span>
            </div>
            <span className={`font-bold text-lg ${getAverageScore() >= 80 ? 'text-green-400' : getAverageScore() >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
              {getAverageScore()}%
            </span>
          </div>
        )}

        {/* Ayah Display */}
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-400"></div>
          </div>
        ) : currentAyah ? (
          <Card className="bg-white/10 border-white/20 mb-6 backdrop-blur-sm">
            <CardContent className="pt-8 pb-8">
              {mode === 'practice' && wordResults.length > 0 ? (
                <div className="flex flex-wrap gap-2 justify-center leading-loose" dir="rtl">
                  {wordResults.map((wr, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className={`text-2xl sm:text-3xl font-arabic px-1 rounded-md transition-all ${
                        wr.status === 'correct'
                          ? 'text-green-300 bg-green-900/30'
                          : wr.status === 'incorrect'
                          ? 'text-red-300 bg-red-900/30 underline decoration-wavy decoration-red-400'
                          : 'text-white/60'
                      }`}
                      data-testid={`word-${i}`}
                    >
                      {wr.word}
                    </motion.span>
                  ))}
                </div>
              ) : (
                <p
                  className="text-white text-2xl sm:text-3xl font-arabic leading-loose text-center"
                  data-testid="text-ayah"
                >
                  {currentAyah.text}
                </p>
              )}

              <p className="text-emerald-400 text-sm text-center mt-4">
                {currentAyah.surah?.name} - الآية {currentAyah.numberInSurah}
              </p>
            </CardContent>
          </Card>
        ) : null}

        {/* Controls */}
        {mode === 'listen' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="ghost"
                className="text-white/70 hover:text-white hover:bg-white/10"
                onClick={previousAyah}
                disabled={currentAyahIndex === 0}
                data-testid="button-prev-ayah"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>

              <Button
                onClick={togglePlayPause}
                className={`w-16 h-16 rounded-full ${isPlaying ? 'bg-blue-500 hover:bg-blue-600' : 'bg-white hover:bg-gray-100'}`}
                data-testid="button-play-audio"
              >
                {isPlaying
                  ? <Pause className={`w-7 h-7 text-white`} />
                  : <Play className="w-7 h-7 text-emerald-800" />
                }
              </Button>

              <Button
                variant="ghost"
                className="text-white/70 hover:text-white hover:bg-white/10"
                onClick={nextAyah}
                disabled={currentAyahIndex >= ayahs.length - 1}
                data-testid="button-next-ayah"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
            </div>

            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
                onClick={() => playAudio(currentAyah?.number || 1)}
                data-testid="button-replay-ayah"
              >
                <RotateCcw className="w-4 h-4 ml-2" />
                إعادة
              </Button>
              <Button
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
                onClick={() => {
                  stopAudio();
                  setMode('practice');
                  setWordResults([]);
                  setHasRecited(false);
                }}
                data-testid="button-start-practice"
              >
                <Mic className="w-4 h-4 ml-2" />
                ابدأ التسميع
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Live transcript */}
            <AnimatePresence>
              {isListening && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="bg-white/10 rounded-xl p-4 border border-white/20"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                    <span className="text-white text-sm font-medium">جاري الاستماع...</span>
                  </div>
                  <p className="text-white/80 text-base text-right font-arabic min-h-[2rem]" data-testid="text-live-transcript">
                    {liveTranscript || '...'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Score after reciting */}
            {hasRecited && totalCount > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`rounded-xl p-4 border ${
                  score >= 80 ? 'bg-green-900/30 border-green-500/30' : score >= 60 ? 'bg-yellow-900/30 border-yellow-500/30' : 'bg-red-900/30 border-red-500/30'
                }`}
                data-testid="div-score"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">نتيجة الآية</p>
                    <p className="text-white/60 text-sm">{correctCount} من {totalCount} كلمة صحيحة</p>
                  </div>
                  <div className={`text-3xl font-bold ${score >= 80 ? 'text-green-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {score}%
                  </div>
                </div>
                {score === 100 && (
                  <div className="flex items-center gap-2 mt-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-300 text-sm">تلاوة ممتازة!</span>
                  </div>
                )}
              </motion.div>
            )}

            {/* Mic button */}
            <div className="flex items-center justify-center gap-4">
              <Button
                variant="ghost"
                className="text-white/70 hover:text-white hover:bg-white/10"
                onClick={previousAyah}
                disabled={currentAyahIndex === 0}
                data-testid="button-prev-ayah"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>

              <Button
                onClick={isListening ? stopPractice : startPractice}
                className={`w-20 h-20 rounded-full transition-all ${
                  isListening
                    ? 'bg-red-500 hover:bg-red-600 scale-110'
                    : 'bg-emerald-500 hover:bg-emerald-600'
                }`}
                data-testid="button-mic"
              >
                {isListening ? (
                  <MicOff className="w-8 h-8 text-white" />
                ) : (
                  <Mic className="w-8 h-8 text-white" />
                )}
              </Button>

              <Button
                variant="ghost"
                className="text-white/70 hover:text-white hover:bg-white/10"
                onClick={nextAyah}
                data-testid="button-next-ayah"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
            </div>

            <p className="text-center text-white/50 text-sm">
              {isListening
                ? 'اضغط على المايكروفون لإنهاء التسجيل'
                : hasRecited
                ? 'اضغط مجدداً لإعادة القراءة أو انتقل للآية التالية'
                : 'اضغط على المايكروفون وابدأ القراءة'}
            </p>

            {/* Speech error */}
            {speechError && (
              <div className="bg-red-900/40 border border-red-500/40 rounded-xl p-4 text-center space-y-2" data-testid="div-speech-error">
                <p className="text-red-300 text-sm font-medium">⚠️ {speechError}</p>
                {speechError.includes('إذن') || speechError.includes('السماح') ? (
                  <p className="text-red-200/70 text-xs">
                    اضغط على أيقونة 🔒 في شريط العنوان ← الإذونات ← الميكروفون ← السماح
                  </p>
                ) : null}
              </div>
            )}

            {/* Bottom actions */}
            <div className="flex items-center justify-center gap-3 mt-2">
              <Button
                variant="ghost"
                className="text-white/60 hover:text-white hover:bg-white/10 text-sm"
                onClick={() => playAudio(currentAyah?.number || 1)}
                data-testid="button-listen-ayah"
              >
                <Volume2 className="w-4 h-4 ml-1" />
                استمع
              </Button>
              {hasRecited && (
                <Button
                  variant="ghost"
                  className="text-white/60 hover:text-white hover:bg-white/10 text-sm"
                  onClick={retryAyah}
                  data-testid="button-retry"
                >
                  <RotateCcw className="w-4 h-4 ml-1" />
                  إعادة
                </Button>
              )}
              {hasRecited && (
                <Button
                  className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm"
                  onClick={currentAyahIndex >= ayahs.length - 1 ? finishSession : nextAyah}
                  data-testid="button-next"
                >
                  {currentAyahIndex >= ayahs.length - 1 ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 ml-1" />
                      انهاء الجلسة
                    </>
                  ) : (
                    <>
                      الآية التالية
                      <ChevronLeft className="w-4 h-4 mr-1" />
                    </>
                  )}
                </Button>
              )}
            </div>

            {!isSupported && (
              <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-xl p-4 text-center space-y-2">
                <p className="text-yellow-300 text-sm font-semibold">⚠️ متصفحك لا يدعم ميزة التسميع</p>
                <p className="text-yellow-200/80 text-xs">
                  يرجى استخدام <strong>Google Chrome</strong> أو <strong>Microsoft Edge</strong> للاستفادة من هذه الميزة.
                </p>
                <a
                  href="https://www.google.com/chrome/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block text-xs bg-yellow-500/30 hover:bg-yellow-500/50 text-yellow-200 px-3 py-1 rounded-full mt-1 transition-colors"
                >
                  تحميل Chrome
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating background indicator when listening */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg"
            data-testid="div-recording-indicator"
          >
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-sm font-medium">جاري التسجيل...</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
