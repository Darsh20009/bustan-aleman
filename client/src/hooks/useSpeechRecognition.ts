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

interface UseSpeechRecognitionResult {
  transcript: string;
  interimTranscript: string;
  isListening: boolean;
  isSupported: boolean;
  isInIframe: boolean;
  error: string | null;
  startListening: () => Promise<void>;
  stopListening: () => void;
  resetTranscript: () => void;
}

function isInsideIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

export function useSpeechRecognition(): UseSpeechRecognitionResult {
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const isListeningRef = useRef(false);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const inIframe = isInsideIframe();

  const hasSpeechAPI =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const isSupported = hasSpeechAPI;

  useEffect(() => {
    if (!hasSpeechAPI) return;

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
        if (event.error === 'no-speech' || event.error === 'aborted') return;
        
        const messages: Record<string, string> = {
          'not-allowed': 'لم يتم السماح باستخدام الميكروفون. اضغط على رمز القفل في شريط العنوان ← الميكروفون ← السماح.',
          'audio-capture': 'تعذر التقاط الصوت. تحقق من توصيل الميكروفون.',
          'network': 'خطأ في الشبكة. تحقق من اتصالك بالإنترنت.',
          'service-not-allowed': 'الخدمة غير متاحة. استخدم متصفح Chrome أو Edge.',
          'language-not-supported': 'اللغة العربية غير مدعومة في هذا المتصفح.',
        };
        setError(messages[event.error] || `خطأ في التعرف على الصوت: ${event.error}`);
        setIsListening(false);
        isListeningRef.current = false;
      };

      recognition.onend = () => {
        if (isListeningRef.current) {
          if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
          restartTimerRef.current = setTimeout(() => {
            if (isListeningRef.current && recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch {
                setIsListening(false);
                isListeningRef.current = false;
              }
            }
          }, 300);
        } else {
          setIsListening(false);
        }
      };

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.error('[Speech] Failed to initialize:', e);
    }

    return () => {
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      isListeningRef.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
        recognitionRef.current = null;
      }
    };
  }, []);

  const startListening = useCallback(async () => {
    if (!hasSpeechAPI) {
      setError('التعرف على الصوت غير مدعوم في هذا المتصفح. يرجى استخدام Google Chrome أو Microsoft Edge.');
      return;
    }

    if (inIframe) {
      setError('IFRAME_BLOCKED');
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('لا يمكن الوصول إلى الميكروفون في هذه البيئة.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
    } catch (e: any) {
      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
        setError('لم يتم السماح باستخدام الميكروفون. اضغط على رمز القفل في شريط العنوان ← الإذونات ← الميكروفون ← السماح.');
        return;
      }
      if (e.name === 'NotFoundError' || e.name === 'DevicesNotFoundError') {
        setError('لم يتم العثور على ميكروفون. يرجى توصيل ميكروفون وإعادة المحاولة.');
        return;
      }
      if (e.name === 'SecurityError' || e.name === 'NotSupportedError') {
        setError('IFRAME_BLOCKED');
        return;
      }
      setError('تعذر الوصول إلى الميكروفون: ' + (e.message || e.name));
      return;
    }

    if (!recognitionRef.current) {
      setError('تعذر تهيئة نظام التعرف على الصوت. يرجى تحديث الصفحة.');
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
  }, [hasSpeechAPI, inIframe]);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
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
    isInIframe: inIframe,
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
