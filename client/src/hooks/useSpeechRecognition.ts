import { useState, useEffect, useCallback, useRef } from 'react';

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message: string;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
  
  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    maxAlternatives?: number;
    start: () => void;
    stop: () => void;
    abort: () => void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
    onend: () => void;
    onstart: () => void;
  }
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
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isMountedRef = useRef(true);

  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  useEffect(() => {
    if (!isSupported) return;

    try {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognitionAPI();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'ar-SA';
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        if (!isMountedRef.current) return;
        
        let finalTranscript = '';
        let interim = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          
          if (result.isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interim += transcript;
          }
        }
        
        if (finalTranscript.trim()) {
          setTranscript(prev => {
            const newTranscript = (prev + ' ' + finalTranscript).trim().replace(/\s+/g, ' ');
            return newTranscript;
          });
        }
        
        const trimmedInterim = interim.trim();
        setInterimTranscript(trimmedInterim);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        if (!isMountedRef.current) return;
        console.error('Speech recognition error:', event.error);
        setError(getArabicErrorMessage(event.error));
        setIsListening(false);
      };

      recognition.onend = () => {
        if (!isMountedRef.current) return;
        setIsListening(false);
      };

      recognition.onstart = () => {
        if (!isMountedRef.current) return;
        setIsListening(true);
        setError(null);
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.error('Failed to initialize speech recognition:', e);
      setError('فشل تهيئة التعرف على الصوت');
    }

    return () => {
      isMountedRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          console.error('Error aborting recognition:', e);
        }
      }
    };
  }, [isSupported]);

  const getArabicErrorMessage = (error: string): string => {
    switch (error) {
      case 'no-speech':
        return 'لم يتم اكتشاف صوت. حاول مرة أخرى.';
      case 'audio-capture':
        return 'لم يتم العثور على ميكروفون.';
      case 'not-allowed':
        return 'يرجى السماح بالوصول إلى الميكروفون.';
      case 'network':
        return 'خطأ في الشبكة. تحقق من اتصالك بالإنترنت.';
      case 'aborted':
        return 'تم إيقاف التسجيل.';
      default:
        return 'حدث خطأ غير متوقع.';
    }
  };

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening && isMountedRef.current) {
      setError(null);
      setTranscript('');
      setInterimTranscript('');
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error('Error starting recognition:', e);
        if (e instanceof Error && e.message.includes('already started')) {
          try {
            recognitionRef.current.abort();
            setTimeout(() => {
              if (recognitionRef.current && isMountedRef.current) {
                recognitionRef.current.start();
              }
            }, 100);
          } catch (abortError) {
            console.error('Error aborting recognition:', abortError);
          }
        }
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isMountedRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error('Error stopping recognition:', e);
        try {
          recognitionRef.current.abort();
        } catch (abortError) {
          console.error('Error aborting recognition:', abortError);
        }
      }
    }
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
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '') // Remove diacritics and Quranic marks
    .replace(/[أإآٱ]/g, 'ا') // Normalize Alef
    .replace(/[ؤ]/g, 'و') // Normalize Waw
    .replace(/[ئ]/g, 'ي') // Normalize Ya
    .replace(/ة/g, 'ه') // Normalize Ta Marbuta
    .replace(/ى/g, 'ي') // Normalize Alef Maqsura
    .replace(/\s+/g, ' ')
    .trim();
}

export function compareArabicTexts(spoken: string, expected: string): { 
  similarity: number; 
  matchedWords: number; 
  totalWords: number;
  isCorrect: boolean;
} {
  const normalizedSpoken = normalizeArabicText(spoken);
  const normalizedExpected = normalizeArabicText(expected);
  
  if (!normalizedSpoken || !normalizedExpected) {
    return { similarity: 0, matchedWords: 0, totalWords: normalizedExpected.split(' ').length, isCorrect: false };
  }

  const spokenWords = normalizedSpoken.split(' ').filter(w => w.length > 0);
  const expectedWords = normalizedExpected.split(' ').filter(w => w.length > 0);
  
  let matchedWords = 0;
  let lastFoundIndex = -1;

  // Ordered word matching for better accuracy in Quran
  for (const expected of expectedWords) {
    const foundIndex = spokenWords.findIndex((spoken, idx) => 
      idx > lastFoundIndex && (
        spoken === expected || 
        expected.includes(spoken) || 
        spoken.includes(expected) || 
        levenshteinSimilarity(spoken, expected) > 0.8
      )
    );

    if (foundIndex !== -1) {
      matchedWords++;
      lastFoundIndex = foundIndex;
    }
  }
  
  const similarity = expectedWords.length > 0 
    ? (matchedWords / expectedWords.length) * 100 
    : 0;
  
  return {
    similarity: Math.min(100, similarity),
    matchedWords,
    totalWords: expectedWords.length,
    isCorrect: similarity >= 80 // Increased threshold for better accuracy
  };
}

function levenshteinSimilarity(s1: string, s2: string): number {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  if (longer.length === 0) return 1.0;
  
  const costs = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  
  const distance = costs[s2.length];
  return (longer.length - distance) / longer.length;
}
