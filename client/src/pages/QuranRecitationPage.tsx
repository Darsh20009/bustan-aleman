import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useSpeechRecognition, normalizeArabicText, compareArabicTexts } from '@/hooks/useSpeechRecognition';
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
  AlertTriangle,
  Send,
  X,
  ChevronDown,
  ChevronUp,
  Settings2,
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
  page: number;
  juz: number;
}

interface WordStatus {
  word: string;
  normalized: string;
  status: 'correct' | 'incorrect' | 'pending' | 'skipped';
  errorType?: string;
}

interface RecitationError {
  ayahNumber: number;
  ayahText: string;
  expected: string;
  spoken: string;
  type: string;
  count: number;
}

interface PageAyahGroup {
  page: number;
  ayahs: Ayah[];
  surahName: string;
}

function normalizeArabic(text: string): string {
  return text
    .replace(/[\u064B-\u065F\u0610-\u061A\u06D6-\u06ED\u0670]/g, '')
    .replace(/[أإآٱا]/g, 'ا')
    .replace(/[ىئي]/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/\u0640/g, '')
    .replace(/\s+/g, ' ')
    .trim();
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

function compareWordsDetailed(spoken: string, expectedWords: string[], isFinal: boolean = false): WordStatus[] {
  const spokenNorm = normalizeArabic(spoken);
  const spokenWords = spokenNorm.split(/\s+/).filter(w => w.trim());
  const spokenCount = spokenWords.length;

  let spokenIdx = 0;
  let lastMatchedExpectedIdx = -1;

  return expectedWords.map((expectedWord, expectedIdx) => {
    const expectedNorm = normalizeArabic(expectedWord);
    if (!expectedNorm) return { word: expectedWord, normalized: expectedNorm, status: 'correct' as const };

    if (spokenIdx >= spokenCount) {
      return { word: expectedWord, normalized: expectedNorm, status: isFinal ? 'incorrect' as const : 'pending' as const, errorType: isFinal ? 'حفظ' : undefined };
    }

    let bestMatch = -1;
    let bestSim = 0;
    const searchWindow = Math.min(spokenCount, spokenIdx + 5);

    for (let i = spokenIdx; i < searchWindow; i++) {
      const sim = levenshteinSimilarity(spokenWords[i], expectedNorm);
      if (sim > bestSim) {
        bestSim = sim;
        bestMatch = i;
      }
      if (spokenWords[i] === expectedNorm) {
        bestSim = 1;
        bestMatch = i;
        break;
      }
    }

    if (bestSim >= 0.7 && bestMatch >= 0) {
      if (bestMatch > spokenIdx + 1) {
        spokenIdx = bestMatch + 1;
        lastMatchedExpectedIdx = expectedIdx;
        return { word: expectedWord, normalized: expectedNorm, status: 'incorrect' as const, errorType: 'ترتيب' };
      }
      spokenIdx = bestMatch + 1;
      lastMatchedExpectedIdx = expectedIdx;
      return { word: expectedWord, normalized: expectedNorm, status: 'correct' as const };
    }

    if (spokenIdx < spokenCount) {
      const directSim = levenshteinSimilarity(spokenWords[spokenIdx], expectedNorm);
      if (directSim >= 0.5) {
        spokenIdx++;
        lastMatchedExpectedIdx = expectedIdx;
        return { word: expectedWord, normalized: expectedNorm, status: 'incorrect' as const, errorType: 'تجويد' };
      }
    }

    if (!isFinal && expectedIdx > lastMatchedExpectedIdx + 2) {
      return { word: expectedWord, normalized: expectedNorm, status: 'pending' as const };
    }

    return { word: expectedWord, normalized: expectedNorm, status: isFinal ? 'incorrect' as const : 'skipped' as const, errorType: 'حفظ' };
  });
}

function detectPageFromSpeech(spokenText: string, allPages: Map<number, Ayah[]>): number | null {
  const spokenNorm = normalizeArabic(spokenText);
  const spokenWords = spokenNorm.split(/\s+/).filter(w => w.length > 1);
  if (spokenWords.length < 3) return null;

  let bestPage = -1;
  let bestScore = 0;

  allPages.forEach((ayahs, pageNum) => {
    const pageText = ayahs.map(a => normalizeArabic(a.text)).join(' ');
    const pageWords = pageText.split(/\s+/);

    let matchCount = 0;
    for (const sw of spokenWords.slice(0, 8)) {
      if (pageWords.some(pw => pw === sw || levenshteinSimilarity(pw, sw) > 0.8)) {
        matchCount++;
      }
    }

    const score = matchCount / Math.min(spokenWords.length, 8);
    if (score > bestScore && score > 0.4) {
      bestScore = score;
      bestPage = pageNum;
    }
  });

  return bestPage > 0 ? bestPage : null;
}

const RECITERS = [
  { id: 'ar.alafasy', name: 'مشاري العفاسي', everyayah: 'Alafasy_64kbps' },
  { id: 'ar.minshawi', name: 'محمد صديق المنشاوي', everyayah: 'Mohammad_al_Minshawi_128kbps' },
  { id: 'ar.husary', name: 'محمود خليل الحصري', everyayah: 'Husary_128kbps' },
  { id: 'ar.abdulbasitmurattal', name: 'عبد الباسط عبد الصمد', everyayah: 'Abdul_Basit_Murattal_192kbps' },
];

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

  const [currentPage, setCurrentPage] = useState(() => {
    const saved = localStorage.getItem('recitation-current-page');
    return saved ? parseInt(saved) : 604;
  });
  const [selectedReciter, setSelectedReciter] = useState('ar.alafasy');
  const [mode, setMode] = useState<'select' | 'reciting' | 'results'>('select');
  const [isPlaying, setIsPlaying] = useState(false);
  const [wordStatuses, setWordStatuses] = useState<WordStatus[]>([]);
  const [sessionErrors, setSessionErrors] = useState<RecitationError[]>([]);
  const [currentAyahIdx, setCurrentAyahIdx] = useState(0);
  const [showErrorBar, setShowErrorBar] = useState(true);
  const [sessionScore, setSessionScore] = useState(0);
  const [ayahScores, setAyahScores] = useState<{ ayah: number; score: number; surah: string }[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [hasRecitedCurrent, setHasRecitedCurrent] = useState(false);
  const [totalRecitedAyahs, setTotalRecitedAyahs] = useState(0);
  const [reportSent, setReportSent] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const processedRef = useRef(false);
  const errorMapRef = useRef<Map<string, RecitationError>>(new Map());
  const nearbyPagesRef = useRef<Map<number, Ayah[]>>(new Map());
  const pageJumpCooldownRef = useRef(false);

  const { data: pageData, isLoading } = useQuery<{ ayahs: Ayah[] }>({
    queryKey: ['/api/quran/page', currentPage],
    queryFn: async () => {
      const res = await fetch(`https://api.alquran.cloud/v1/page/${currentPage}/quran-uthmani`);
      const json = await res.json();
      return json.data;
    },
    staleTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    const loadNearby = async () => {
      const pages = [currentPage - 2, currentPage - 1, currentPage + 1, currentPage + 2].filter(p => p >= 1 && p <= 604);
      for (const p of pages) {
        if (!nearbyPagesRef.current.has(p)) {
          try {
            const res = await fetch(`https://api.alquran.cloud/v1/page/${p}/quran-uthmani`);
            const json = await res.json();
            if (json.data?.ayahs) {
              nearbyPagesRef.current.set(p, json.data.ayahs);
            }
          } catch {}
        }
      }
    };
    loadNearby();
  }, [currentPage]);

  const ayahs = pageData?.ayahs || [];
  const currentAyah = ayahs[currentAyahIdx];
  const pageProgress = ayahs.length ? ((currentAyahIdx + 1) / ayahs.length) * 100 : 0;

  const pageSurahs = useMemo(() => {
    const surahs = new Map<number, string>();
    ayahs.forEach(a => {
      if (!surahs.has(a.surah.number)) surahs.set(a.surah.number, a.surah.name);
    });
    return Array.from(surahs.values());
  }, [ayahs]);

  useEffect(() => {
    localStorage.setItem('recitation-current-page', currentPage.toString());
  }, [currentPage]);

  const savePracticeMutation = useMutation({
    mutationFn: async (data: { surahNumber: number; score: number; ayahsCount: number; mistakes?: string }) => {
      return apiRequest('/api/quran/recitation-attempts', 'POST', data);
    },
  });

  const reportErrorsMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/ai/report-recitation-errors', 'POST', data);
    },
    onSuccess: () => {
      setReportSent(true);
      toast({ title: 'تم إرسال التقرير', description: 'سيتم إعلام الشيخ المسؤول بالأخطاء المتكررة' });
    },
    onError: () => {
      toast({ title: 'خطأ', description: 'تعذر إرسال التقرير', variant: 'destructive' });
    },
  });

  useEffect(() => {
    if (!isListening || !currentAyah || processedRef.current) return;

    const combined = ((transcript || '') + ' ' + (interimTranscript || '')).trim();
    if (!combined) return;

    const words = combined.split(/\s+/).filter(w => w.length > 1);
    if (words.length < 2) return;

    const ayahWords = currentAyah.text.split(/\s+/).filter(w => w.trim());
    const results = compareWordsDetailed(combined, ayahWords, false);
    setWordStatuses(results);

    if (mode === 'reciting' && nearbyPagesRef.current.size > 0 && !pageJumpCooldownRef.current) {
      nearbyPagesRef.current.set(currentPage, ayahs);
      const detectedPage = detectPageFromSpeech(combined, nearbyPagesRef.current);
      if (detectedPage && detectedPage !== currentPage && words.length >= 8) {
        const correctOnCurrent = results.filter(r => r.status === 'correct').length;
        const totalOnCurrent = results.length;
        if (totalOnCurrent > 0 && (correctOnCurrent / totalOnCurrent) < 0.3) {
          pageJumpCooldownRef.current = true;
          setTimeout(() => { pageJumpCooldownRef.current = false; }, 10000);
          setCurrentPage(detectedPage);
          setCurrentAyahIdx(0);
          resetTranscript();
          setWordStatuses([]);
          processedRef.current = false;
          toast({ title: 'تم الانتقال تلقائياً', description: `انتقل إلى الصفحة ${detectedPage}` });
        }
      }
    }
  }, [transcript, interimTranscript, isListening, currentAyah, mode]);

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    setIsPlaying(false);
  };

  const playAyahAudio = (ayahNumber: number) => {
    stopAudio();
    const reciterData = RECITERS.find(r => r.id === selectedReciter) || RECITERS[0];
    const ayah = ayahs.find(a => a.number === ayahNumber);
    const surahPadded = String(ayah?.surah.number || 1).padStart(3, '0');
    const ayahPadded = String(ayah?.numberInSurah || 1).padStart(3, '0');

    const primaryUrl = `https://cdn.islamic.network/quran/audio/128/${selectedReciter}/${ayahNumber}.mp3`;
    const fallbackUrl = `https://everyayah.com/data/${reciterData.everyayah}/${surahPadded}${ayahPadded}.mp3`;

    const tryPlay = (url: string, fallback?: () => void) => {
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => { setIsPlaying(false); if (fallback) fallback(); };
      audio.play().catch(() => { if (fallback) fallback(); });
    };

    tryPlay(primaryUrl, () => tryPlay(fallbackUrl));
  };

  const startReciting = () => {
    if (!isSupported) {
      toast({ title: 'غير مدعوم', description: 'يرجى استخدام Chrome أو Edge', variant: 'destructive' });
      return;
    }
    stopAudio();
    resetTranscript();
    processedRef.current = false;
    setHasRecitedCurrent(false);
    const ayahWords = currentAyah?.text.split(/\s+/).filter(w => w.trim()) || [];
    setWordStatuses(ayahWords.map(w => ({ word: w, normalized: normalizeArabic(w), status: 'pending' })));
    startListening();
  };

  const stopReciting = () => {
    stopListening();
    processedRef.current = true;
    setHasRecitedCurrent(true);

    if (!currentAyah) return;
    const combined = ((transcript || '') + ' ' + (interimTranscript || '')).trim();
    if (!combined) {
      toast({ title: 'لم يُكتشف صوت', description: 'تأكد من الميكروفون وحاول مجدداً', variant: 'destructive' });
      return;
    }

    const ayahWords = currentAyah.text.split(/\s+/).filter(w => w.trim());
    const results = compareWordsDetailed(combined, ayahWords, true);
    setWordStatuses(results);

    const correct = results.filter(r => r.status === 'correct').length;
    const score = Math.round((correct / results.length) * 100);

    setAyahScores(prev => [...prev, {
      ayah: currentAyah.numberInSurah,
      score,
      surah: currentAyah.surah.name,
    }]);
    setTotalRecitedAyahs(prev => prev + 1);

    const incorrect = results.filter(r => r.status === 'incorrect');
    const spokenWords = normalizeArabic(combined).split(/\s+/);

    incorrect.forEach(wr => {
      const key = `p${currentPage}-s${currentAyah.surah.number}-a${currentAyah.numberInSurah}-${wr.normalized}`;
      const existing = errorMapRef.current.get(key);
      const nearestSpoken = spokenWords.find(sw => levenshteinSimilarity(sw, wr.normalized) > 0.3) || '(غير واضح)';

      if (existing) {
        existing.count++;
        existing.spoken = nearestSpoken;
      } else {
        errorMapRef.current.set(key, {
          ayahNumber: currentAyah.numberInSurah,
          ayahText: currentAyah.text.substring(0, 60) + '...',
          expected: wr.word,
          spoken: nearestSpoken,
          type: wr.errorType || 'حفظ',
          count: 1,
        });
      }
    });

    setSessionErrors(Array.from(errorMapRef.current.values()));

    const avgScore = [...ayahScores, { score }].reduce((s, a) => s + a.score, 0) / (ayahScores.length + 1);
    setSessionScore(Math.round(avgScore));
  };

  const moveToNextAyah = () => {
    stopAudio();
    if (isListening) stopListening();

    if (currentAyahIdx >= ayahs.length - 1) {
      if (currentPage < 604) {
        setCurrentPage(prev => prev === 604 ? prev : prev + 1);
        setCurrentAyahIdx(0);
      } else {
        finishSession();
      }
    } else {
      setCurrentAyahIdx(prev => prev + 1);
    }

    resetTranscript();
    processedRef.current = false;
    setHasRecitedCurrent(false);
    setWordStatuses([]);
  };

  const moveToPrevAyah = () => {
    stopAudio();
    if (isListening) stopListening();
    if (currentAyahIdx > 0) {
      setCurrentAyahIdx(prev => prev - 1);
    } else if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      setCurrentAyahIdx(-1);
    }
    resetTranscript();
    processedRef.current = false;
    setHasRecitedCurrent(false);
    setWordStatuses([]);
  };

  useEffect(() => {
    if (currentAyahIdx === -1 && ayahs.length > 0) {
      setCurrentAyahIdx(ayahs.length - 1);
    }
  }, [currentAyahIdx, ayahs.length]);

  const retryAyah = () => {
    stopAudio();
    if (isListening) stopListening();
    resetTranscript();
    processedRef.current = false;
    setHasRecitedCurrent(false);
    const ayahWords = currentAyah?.text.split(/\s+/).filter(w => w.trim()) || [];
    setWordStatuses(ayahWords.map(w => ({ word: w, normalized: normalizeArabic(w), status: 'pending' })));
  };

  const finishSession = () => {
    if (isListening) stopListening();
    stopAudio();

    const surahNum = ayahs[0]?.surah?.number || 1;
    savePracticeMutation.mutate({
      surahNumber: surahNum,
      score: sessionScore,
      ayahsCount: totalRecitedAyahs,
      mistakes: JSON.stringify(sessionErrors.slice(0, 20)),
    });

    setMode('results');
  };

  const sendErrorReport = () => {
    const repeatedErrors = sessionErrors.filter(e => e.count >= 2);
    if (repeatedErrors.length === 0) {
      toast({ title: 'لا توجد أخطاء متكررة', description: 'الأخطاء المتكررة فقط يتم إرسالها للشيخ' });
      return;
    }

    reportErrorsMutation.mutate({
      studentName: 'الطالب',
      errors: repeatedErrors,
      totalAyahs: totalRecitedAyahs,
      accuracy: sessionScore,
      surahName: pageSurahs.join(' و '),
      pageNumber: currentPage,
      sessionSummary: `تسميع صفحة ${currentPage} - ${totalRecitedAyahs} آية - دقة ${sessionScore}%`,
    });
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= 604) {
      setCurrentPage(page);
      setCurrentAyahIdx(0);
      setWordStatuses([]);
      setHasRecitedCurrent(false);
      processedRef.current = false;
      resetTranscript();
    }
  };

  const startSession = () => {
    setMode('reciting');
    setCurrentAyahIdx(0);
    setSessionErrors([]);
    setAyahScores([]);
    setSessionScore(0);
    setTotalRecitedAyahs(0);
    setReportSent(false);
    errorMapRef.current.clear();
    setWordStatuses([]);
    setHasRecitedCurrent(false);
    processedRef.current = false;
    resetTranscript();
  };

  useEffect(() => {
    return () => {
      stopAudio();
      if (isListening) stopListening();
    };
  }, []);

  const recentErrors = sessionErrors.slice(-5);
  const incorrectCount = wordStatuses.filter(w => w.status === 'incorrect').length;
  const correctCount = wordStatuses.filter(w => w.status === 'correct').length;
  const currentScore = wordStatuses.length > 0 ? Math.round((correctCount / wordStatuses.length) * 100) : 0;

  if (mode === 'select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 pb-safe" dir="rtl">
        <div className="max-w-lg mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" size="sm" onClick={onBack || (() => window.history.back())} data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-emerald-800 dark:text-emerald-300">التسميع الذكي</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">تسميع صفحات المصحف مع تقييم فوري</p>
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-lg p-5 mb-4 border border-emerald-100 dark:border-zinc-700">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              <span className="font-semibold text-emerald-800 dark:text-emerald-300">اختر الصفحة</span>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <Button variant="outline" size="sm" onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1} data-testid="button-prev-page">
                <ChevronRight className="w-4 h-4" />
              </Button>
              <div className="flex-1 text-center">
                <input
                  type="number"
                  min={1}
                  max={604}
                  value={currentPage}
                  onChange={e => {
                    const val = parseInt(e.target.value);
                    if (val >= 1 && val <= 604) setCurrentPage(val);
                  }}
                  className="w-20 text-center text-2xl font-bold bg-transparent border-b-2 border-emerald-300 text-emerald-800 dark:text-emerald-300 outline-none mx-auto block"
                  data-testid="input-page-number"
                />
                <p className="text-xs text-gray-500 mt-1">صفحة من 604</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= 604} data-testid="button-next-page">
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </div>

            {pageSurahs.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {pageSurahs.map((s, i) => (
                  <Badge key={i} variant="secondary" className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs">
                    {s}
                  </Badge>
                ))}
              </div>
            )}

            <select
              value={selectedReciter}
              onChange={e => setSelectedReciter(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-zinc-600 bg-gray-50 dark:bg-zinc-700 text-sm text-gray-800 dark:text-gray-200"
              data-testid="select-reciter"
            >
              {RECITERS.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <Button
            className="w-full h-14 text-lg bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-lg"
            onClick={startSession}
            disabled={isLoading}
            data-testid="button-start-session"
          >
            <Mic className="w-6 h-6 ml-2" />
            ابدأ التسميع
          </Button>

          <div className="mt-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
            <p className="text-xs text-amber-700 dark:text-amber-400 font-medium mb-2">كيف يعمل؟</p>
            <ul className="text-xs text-amber-600 dark:text-amber-500 space-y-1">
              <li>• اضغط المايكروفون واقرأ الآية</li>
              <li>• الكلمات الصحيحة <span className="text-green-600 font-bold">بالأخضر</span> والخاطئة <span className="text-red-600 font-bold">بالأحمر</span></li>
              <li>• شريط الأخطاء يظهر من الأسفل</li>
              <li>• لو قرأت صفحة مختلفة ينتقل تلقائياً</li>
              <li>• الأخطاء المتكررة ترسل للشيخ المسؤول</li>
            </ul>
          </div>

          {!isSupported && (
            <div className="mt-4 bg-red-50 dark:bg-red-950/20 rounded-xl p-4 border border-red-200">
              <p className="text-sm text-red-700 dark:text-red-400 font-medium">متصفحك لا يدعم التسميع الصوتي</p>
              <p className="text-xs text-red-600 dark:text-red-500 mt-1">يرجى استخدام Chrome أو Edge</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (mode === 'results') {
    const repeatedErrors = sessionErrors.filter(e => e.count >= 2);
    const scoreColor = sessionScore >= 80 ? 'text-green-500' : sessionScore >= 60 ? 'text-yellow-500' : 'text-red-500';
    const scoreBg = sessionScore >= 80 ? 'bg-green-100 dark:bg-green-900/30' : sessionScore >= 60 ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-red-100 dark:bg-red-900/30';

    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-zinc-900 dark:to-zinc-800 pb-safe" dir="rtl">
        <div className="max-w-lg mx-auto px-4 py-6">
          <div className="text-center mb-6">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-3 ${scoreBg}`}>
              <span className={`text-3xl font-bold ${scoreColor}`}>{sessionScore}%</span>
            </div>
            <h2 className="text-xl font-bold text-emerald-800 dark:text-emerald-300">
              {sessionScore >= 80 ? 'ما شاء الله! تلاوة ممتازة' : sessionScore >= 60 ? 'جيد، واصل التدريب' : 'تحتاج مراجعة أكثر'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              صفحة {currentPage} • {totalRecitedAyahs} آية • {pageSurahs.join(' و ')}
            </p>
          </div>

          {ayahScores.length > 0 && (
            <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 mb-4 border border-gray-100 dark:border-zinc-700">
              <h3 className="font-semibold text-sm mb-3 text-gray-700 dark:text-gray-300">نتائج الآيات</h3>
              <div className="grid grid-cols-5 sm:grid-cols-7 gap-2">
                {ayahScores.map((a, i) => (
                  <div key={i} className={`text-center p-2 rounded-lg text-xs font-medium ${
                    a.score >= 80 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                    a.score >= 60 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                    'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                  }`} data-testid={`ayah-score-${i}`}>
                    <div className="text-[10px] text-gray-500">آية {a.ayah}</div>
                    <div className="font-bold">{a.score}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {sessionErrors.length > 0 && (
            <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 mb-4 border border-gray-100 dark:border-zinc-700">
              <h3 className="font-semibold text-sm mb-3 text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                الأخطاء ({sessionErrors.length})
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {sessionErrors.map((err, i) => (
                  <div key={i} className={`flex items-start gap-2 p-2 rounded-lg text-xs ${
                    err.count >= 2 ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' : 'bg-gray-50 dark:bg-zinc-700'
                  }`} data-testid={`error-${i}`}>
                    <Badge variant={err.count >= 2 ? 'destructive' : 'secondary'} className="text-[10px] shrink-0">
                      {err.type}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-red-600 dark:text-red-400 font-arabic line-through">{err.spoken}</span>
                        <span className="text-gray-400">←</span>
                        <span className="text-green-600 dark:text-green-400 font-arabic font-medium">{err.expected}</span>
                      </div>
                      <span className="text-[10px] text-gray-400">آية {err.ayahNumber} {err.count > 1 ? `(${err.count} مرات)` : ''}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {repeatedErrors.length > 0 && !reportSent && (
            <Button
              className="w-full mb-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl"
              onClick={sendErrorReport}
              disabled={reportErrorsMutation.isPending}
              data-testid="button-send-report"
            >
              <Send className="w-4 h-4 ml-2" />
              {reportErrorsMutation.isPending ? 'جاري الإرسال...' : `إرسال ${repeatedErrors.length} أخطاء متكررة للشيخ`}
            </Button>
          )}

          {reportSent && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 mb-3 text-center border border-green-200 dark:border-green-800">
              <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto mb-1" />
              <p className="text-sm text-green-700 dark:text-green-300">تم إرسال التقرير للشيخ المسؤول</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
              onClick={() => { setMode('select'); }}
              data-testid="button-new-session"
            >
              <RotateCcw className="w-4 h-4 ml-2" />
              جلسة جديدة
            </Button>
            <Button
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={onBack || (() => window.history.back())}
              data-testid="button-back-home"
            >
              الصفحة الرئيسية
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d1f17] via-[#132e1f] to-[#0d1f17] flex flex-col pb-safe" dir="rtl">
      {/* Top bar - compact */}
      <div className="flex items-center justify-between px-3 py-2 bg-black/30 backdrop-blur-sm sticky top-0 z-30">
        <Button
          variant="ghost"
          size="sm"
          className="text-white/70 hover:text-white h-8 px-2"
          onClick={() => { stopAudio(); if (isListening) stopListening(); setMode('select'); }}
          data-testid="button-back-select"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>

        <div className="text-center flex-1 min-w-0">
          <p className="text-white text-sm font-semibold truncate">صفحة {currentPage}</p>
          <p className="text-emerald-400 text-[10px] truncate">{pageSurahs.join(' • ')} • آية {currentAyahIdx + 1}/{ayahs.length}</p>
        </div>

        <div className="flex items-center gap-1">
          {sessionScore > 0 && (
            <Badge className={`text-[10px] ${sessionScore >= 70 ? 'bg-green-600' : 'bg-red-600'}`}>
              {sessionScore}%
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-white/50 hover:text-white h-8 w-8 p-0"
            onClick={() => setShowSettings(!showSettings)}
            data-testid="button-settings"
          >
            <Settings2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Settings dropdown */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-black/40 backdrop-blur-md border-b border-white/10 overflow-hidden"
          >
            <div className="px-4 py-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-white/60 text-xs w-16">القارئ:</span>
                <select
                  value={selectedReciter}
                  onChange={e => setSelectedReciter(e.target.value)}
                  className="flex-1 p-1.5 rounded-lg bg-white/10 text-white text-xs border border-white/20"
                  data-testid="select-reciter-settings"
                >
                  {RECITERS.map(r => (
                    <option key={r.id} value={r.id} className="text-black">{r.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white/60 text-xs w-16">الصفحة:</span>
                <div className="flex items-center gap-1 flex-1">
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-white/60" onClick={() => goToPage(currentPage - 1)} disabled={currentPage <= 1}>
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                  <input
                    type="number"
                    min={1} max={604}
                    value={currentPage}
                    onChange={e => { const v = parseInt(e.target.value); if (v >= 1 && v <= 604) goToPage(v); }}
                    className="w-14 text-center bg-white/10 text-white rounded-lg p-1 text-sm border border-white/20"
                    data-testid="input-page-settings"
                  />
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-white/60" onClick={() => goToPage(currentPage + 1)} disabled={currentPage >= 604}>
                    <ChevronLeft className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress bar */}
      <div className="px-3 py-1">
        <Progress value={pageProgress} className="h-1 bg-white/10" />
      </div>

      {/* Main content - scrollable ayah area */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400" />
          </div>
        ) : currentAyah ? (
          <div className="space-y-3">
            {/* Surah header if first ayah of surah */}
            {currentAyah.numberInSurah === 1 && (
              <div className="text-center py-2">
                <div className="inline-block bg-emerald-900/40 border border-emerald-500/30 rounded-xl px-6 py-2">
                  <p className="text-emerald-300 font-arabic text-lg font-bold">{currentAyah.surah.name}</p>
                </div>
              </div>
            )}

            {/* Ayah text with word highlighting */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-white/10 min-h-[120px]">
              <div className="flex flex-wrap gap-x-2 gap-y-3 justify-center leading-[2.5] sm:leading-[3]" dir="rtl">
                {wordStatuses.length > 0 ? wordStatuses.map((ws, i) => (
                  <motion.span
                    key={`${currentAyahIdx}-${i}`}
                    initial={ws.status !== 'pending' ? { scale: 0.9 } : false}
                    animate={{ scale: 1 }}
                    className={`text-xl sm:text-2xl md:text-3xl font-arabic px-0.5 rounded transition-all duration-300 ${
                      ws.status === 'correct'
                        ? 'text-green-400 bg-green-900/20'
                        : ws.status === 'incorrect'
                        ? 'text-red-400 bg-red-900/30 underline decoration-wavy decoration-red-500 underline-offset-4'
                        : ws.status === 'skipped'
                        ? 'text-yellow-400 bg-yellow-900/20'
                        : 'text-white/80'
                    }`}
                    data-testid={`word-${i}`}
                  >
                    {ws.word}
                  </motion.span>
                )) : (
                  <p className="text-white text-xl sm:text-2xl md:text-3xl font-arabic leading-[2.5] text-center" data-testid="text-ayah">
                    {currentAyah.text}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-center gap-2 mt-4 pt-3 border-t border-white/10">
                <span className="text-emerald-400 text-xs">{currentAyah.surah.name}</span>
                <span className="text-white/30">•</span>
                <span className="text-white/50 text-xs">آية {currentAyah.numberInSurah}</span>
                {hasRecitedCurrent && wordStatuses.length > 0 && (
                  <>
                    <span className="text-white/30">•</span>
                    <span className={`text-xs font-bold ${currentScore >= 80 ? 'text-green-400' : currentScore >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {currentScore}%
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Live transcript */}
            <AnimatePresence>
              {isListening && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="bg-white/5 rounded-xl p-3 border border-white/10"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-white/60 text-xs">جاري الاستماع...</span>
                  </div>
                  <p className="text-white/70 text-sm font-arabic text-right min-h-[1.5rem]" data-testid="text-live-transcript">
                    {((transcript || '') + ' ' + (interimTranscript || '')).trim() || '...'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Score after reciting */}
            <AnimatePresence>
              {hasRecitedCurrent && wordStatuses.length > 0 && !isListening && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`rounded-xl p-3 border ${
                    currentScore >= 80 ? 'bg-green-900/20 border-green-500/30' :
                    currentScore >= 60 ? 'bg-yellow-900/20 border-yellow-500/30' :
                    'bg-red-900/20 border-red-500/30'
                  }`}
                  data-testid="div-current-score"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {currentScore >= 80 ? <CheckCircle2 className="w-5 h-5 text-green-400" /> :
                       currentScore >= 60 ? <AlertTriangle className="w-5 h-5 text-yellow-400" /> :
                       <XCircle className="w-5 h-5 text-red-400" />}
                      <div>
                        <p className="text-white text-sm font-medium">
                          {currentScore >= 90 ? 'ما شاء الله!' : currentScore >= 80 ? 'أحسنت!' : currentScore >= 60 ? 'جيد' : 'تحتاج إعادة'}
                        </p>
                        <p className="text-white/50 text-xs">{correctCount} من {wordStatuses.length} كلمة صحيحة</p>
                      </div>
                    </div>
                    <span className={`text-2xl font-bold ${currentScore >= 80 ? 'text-green-400' : currentScore >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {currentScore}%
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action buttons after reciting */}
            {hasRecitedCurrent && !isListening && (
              <div className="flex items-center justify-center gap-2">
                <Button size="sm" variant="ghost" className="text-white/60 hover:text-white text-xs h-8"
                  onClick={() => playAyahAudio(currentAyah.number)} data-testid="button-listen-ayah">
                  <Volume2 className="w-3.5 h-3.5 ml-1" /> استمع
                </Button>
                <Button size="sm" variant="ghost" className="text-white/60 hover:text-white text-xs h-8"
                  onClick={retryAyah} data-testid="button-retry-ayah">
                  <RotateCcw className="w-3.5 h-3.5 ml-1" /> أعد
                </Button>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
                  onClick={moveToNextAyah} data-testid="button-next-ayah">
                  التالية <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                </Button>
              </div>
            )}
          </div>
        ) : null}

        {/* Speech error */}
        {speechError && speechError !== 'IFRAME_BLOCKED' && (
          <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-3 mt-3 text-center">
            <p className="text-red-300 text-xs">{speechError}</p>
          </div>
        )}
        {speechError === 'IFRAME_BLOCKED' && (
          <div className="bg-amber-900/30 border border-amber-500/30 rounded-xl p-3 mt-3 text-center space-y-2">
            <p className="text-amber-200 text-xs">لاستخدام الميكروفون، يجب فتح التطبيق في نافذة مستقلة</p>
            <button onClick={() => window.open(window.location.href, '_blank')} className="text-amber-300 underline text-xs">فتح في نافذة جديدة</button>
          </div>
        )}
      </div>

      {/* Floating mic button - mobile-friendly */}
      <div className="sticky bottom-0 z-20">
        {/* Error bar - slides up from bottom */}
        <AnimatePresence>
          {showErrorBar && recentErrors.length > 0 && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="bg-red-950/95 backdrop-blur-md border-t border-red-500/30"
            >
              <div className="flex items-center justify-between px-3 py-1.5">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-red-300 text-[10px] font-medium">أخطاء التلاوة ({sessionErrors.length})</span>
                </div>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-400 hover:text-red-300" onClick={() => setShowErrorBar(false)}>
                  <X className="w-3 h-3" />
                </Button>
              </div>
              <div className="px-3 pb-2 space-y-1 max-h-24 overflow-y-auto">
                {recentErrors.map((err, i) => (
                  <div key={i} className="flex items-center gap-2 text-[11px]">
                    <Badge variant="destructive" className="text-[9px] h-4 px-1.5">{err.type}</Badge>
                    <span className="text-red-300 font-arabic">{err.expected}</span>
                    <span className="text-red-500/50">→</span>
                    <span className="text-red-400/70 font-arabic">{err.spoken}</span>
                    {err.count > 1 && <span className="text-red-500 text-[9px]">({err.count}×)</span>}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsed error indicator */}
        {!showErrorBar && sessionErrors.length > 0 && (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-red-400 hover:text-red-300 text-[10px] h-6 bg-red-950/80 rounded-t-lg rounded-b-none px-3"
              onClick={() => setShowErrorBar(true)}
              data-testid="button-show-errors"
            >
              <ChevronUp className="w-3 h-3 ml-1" />
              {sessionErrors.length} أخطاء
            </Button>
          </div>
        )}

        {/* Mic controls area */}
        <div className="bg-gradient-to-t from-black/80 to-black/40 backdrop-blur-md px-4 py-3 pb-safe">
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-white/50 hover:text-white h-10 w-10 p-0 rounded-full"
              onClick={moveToPrevAyah}
              disabled={currentAyahIdx === 0 && currentPage <= 1}
              data-testid="button-prev"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>

            <button
              onClick={isListening ? stopReciting : startReciting}
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all shadow-2xl active:scale-95 touch-manipulation ${
                isListening
                  ? 'bg-red-500 shadow-red-500/40 animate-pulse'
                  : 'bg-emerald-500 shadow-emerald-500/40 hover:bg-emerald-400'
              }`}
              data-testid="button-mic"
            >
              {isListening ? (
                <MicOff className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              ) : (
                <Mic className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              )}
            </button>

            <Button
              variant="ghost"
              size="sm"
              className="text-white/50 hover:text-white h-10 w-10 p-0 rounded-full"
              onClick={moveToNextAyah}
              data-testid="button-next"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </div>

          <p className="text-center text-white/40 text-[11px] mt-1.5">
            {isListening ? 'اضغط لإيقاف التسجيل' : hasRecitedCurrent ? 'أعد القراءة أو انتقل للتالية' : 'اضغط المايكروفون وابدأ التلاوة'}
          </p>

          {/* Quick actions */}
          <div className="flex items-center justify-center gap-4 mt-2">
            <button
              onClick={() => currentAyah && playAyahAudio(currentAyah.number)}
              className="text-white/40 hover:text-white/70 transition-colors"
              data-testid="button-play-audio"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            {totalRecitedAyahs > 0 && (
              <button
                onClick={finishSession}
                className="text-emerald-400/60 hover:text-emerald-400 transition-colors text-[11px] flex items-center gap-1"
                data-testid="button-finish"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                إنهاء ({totalRecitedAyahs} آية)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
