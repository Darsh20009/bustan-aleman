import { useState, useEffect, useCallback, useRef } from 'react';

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
  interface SpeechRecognitionInstance extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    maxAlternatives: number;
    start: () => void;
    stop: () => void;
    abort: () => void;
    onresult: ((event: any) => void) | null;
    onerror: ((event: any) => void) | null;
    onend: (() => void) | null;
    onstart: (() => void) | null;
  }
}

function getArabicErrorMessage(error: string): string {
  const messages: Record<string, string> = {
    'not-allowed': 'لم يتم السماح باستخدام الميكروفون. افتح الإعدادات وامنح إذن الميكروفون للمتصفح.',
    'no-speech': 'لم يتم اكتشاف أي كلام. تأكد من أن الميكروفون يعمل وحاول مرة أخرى.',
    'audio-capture': 'تعذر التقاط الصوت. تحقق من توصيل الميكروفون.',
    'network': 'خطأ في الشبكة أثناء التعرف على الصوت. تحقق من اتصالك بالإنترنت.',
    'service-not-allowed': 'خدمة التعرف على الصوت غير متاحة. استخدم متصفح Chrome أو Edge.',
    'aborted': 'تم إيقاف التسجيل.',
    'language-not-supported': 'اللغة العربية غير مدعومة في هذا المتصفح. حاول تغيير لغة المتصفح.',
  };
  return messages[error] || `حدث خطأ: ${error}`;
}

interface UseSpeechRecognitionResult {
  transcript: string;
  interimTranscript: string;
  isListening: boolean;
  isSupported: boolean;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

export function useSpeechRecognition(): UseSpeechRecognitionResult {
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const isListeningRef = useRef(false);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const createRecognition = useCallback(() => {
    if (!isSupported) return null;
    try {
      const SpeechRecognitionAPI =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognitionAPI();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'ar-SA';
      recognition.maxAlternatives = 3;

      recognition.onresult = (event: any) => {
        let interimText = '';
        let finalText = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const text = result[0].transcript;

          if (result.isFinal) {
            finalText += text + ' ';
          } else {
            interimText += text;
          }
        }

        if (finalText.trim()) {
          setTranscript((prev) => (prev + ' ' + finalText).trim());
          setInterimTranscript('');
        }

        if (interimText) {
          setInterimTranscript(interimText);
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'no-speech') {
          return;
        }
        if (event.error === 'aborted') {
          return;
        }
        const msg = getArabicErrorMessage(event.error);
        setError(msg);
        setIsListening(false);
        isListeningRef.current = false;
      };

      recognition.onend = () => {
        if (isListeningRef.current) {
          if (restartTimerRef.current) {
            clearTimeout(restartTimerRef.current);
          }
          restartTimerRef.current = setTimeout(() => {
            if (isListeningRef.current && recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch {
                setIsListening(false);
                isListeningRef.current = false;
              }
            }
          }, 200);
        } else {
          setIsListening(false);
        }
      };

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      return recognition;
    } catch (e) {
      console.error('[Speech] Failed to initialize:', e);
      return null;
    }
  }, [isSupported]);

  useEffect(() => {
    if (!isSupported) return;
    recognitionRef.current = createRecognition();

    return () => {
      if (restartTimerRef.current) {
        clearTimeout(restartTimerRef.current);
      }
      if (recognitionRef.current) {
        isListeningRef.current = false;
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, [isSupported, createRecognition]);

  const startListening = useCallback(async () => {
    if (!isSupported) {
      setError('التعرف على الصوت غير مدعوم في هذا المتصفح. يرجى استخدام Google Chrome أو Microsoft Edge.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
    } catch (e: any) {
      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
        setError('لم يتم السماح باستخدام الميكروفون. يرجى الضغط على أيقونة القفل في شريط العنوان ومنح إذن الميكروفون.');
        return;
      }
      if (e.name === 'NotFoundError') {
        setError('لم يتم العثور على ميكروفون. يرجى توصيل ميكروفون وإعادة المحاولة.');
        return;
      }
    }

    if (!recognitionRef.current) {
      recognitionRef.current = createRecognition();
    }

    if (!recognitionRef.current) {
      setError('تعذر تهيئة نظام التعرف على الصوت.');
      return;
    }

    setError(null);
    setTranscript('');
    setInterimTranscript('');
    isListeningRef.current = true;
    try {
      recognitionRef.current.start();
    } catch (e: any) {
      if (e.name === 'InvalidStateError') {
        setIsListening(true);
      } else {
        setError('تعذر بدء التعرف على الصوت: ' + e.message);
        isListeningRef.current = false;
      }
    }
  }, [isSupported, createRecognition]);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
    setInterimTranscript('');
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  return {
    transcript,
    interimTranscript,
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
}

export function normalizeArabicText(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/[ىئ]/g, 'ي')
    .replace(/ة/g, 'ه')
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

export function compareArabicTexts(
  spoken: string,
  expected: string
): { similarity: number; matchedWords: number; totalWords: number; isCorrect: boolean } {
  const spokenNorm = normalizeArabicText(spoken);
  const expectedNorm = normalizeArabicText(expected);
  const expectedWords = expectedNorm.split(/\s+/).filter(Boolean);
  const spokenWords = spokenNorm.split(/\s+/).filter(Boolean);

  let matchedWords = 0;
  let lastFoundIndex = -1;

  for (const expectedWord of expectedWords) {
    const foundIndex = spokenWords.findIndex(
      (sw, idx) =>
        idx > lastFoundIndex &&
        (sw === expectedWord ||
          sw.includes(expectedWord) ||
          expectedWord.includes(sw) ||
          levenshteinSimilarity(sw, expectedWord) > 0.8)
    );
    if (foundIndex !== -1) {
      matchedWords++;
      lastFoundIndex = foundIndex;
    }
  }

  const similarity =
    expectedWords.length > 0
      ? Math.min(100, (matchedWords / expectedWords.length) * 100)
      : 0;

  return {
    similarity,
    matchedWords,
    totalWords: expectedWords.length,
    isCorrect: similarity >= 70,
  };
}
