import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { 
  ArrowRight, 
  BookOpen, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Trophy,
  Star,
  Brain,
  Target,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';

interface QuranQuestion {
  id: string;
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  ayahText: string;
  options: string[];
  correctAnswer: number;
  questionType: 'completion' | 'identification';
}

interface TestResult {
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  score: number;
  timeTaken: number;
}

const SURAH_LIST = [
  { number: 1, name: 'الفاتحة', ayahs: 7 },
  { number: 2, name: 'البقرة', ayahs: 286 },
  { number: 3, name: 'آل عمران', ayahs: 200 },
  { number: 78, name: 'النبأ', ayahs: 40 },
  { number: 79, name: 'النازعات', ayahs: 46 },
  { number: 80, name: 'عبس', ayahs: 42 },
  { number: 81, name: 'التكوير', ayahs: 29 },
  { number: 82, name: 'الانفطار', ayahs: 19 },
  { number: 83, name: 'المطففين', ayahs: 36 },
  { number: 84, name: 'الانشقاق', ayahs: 25 },
  { number: 85, name: 'البروج', ayahs: 22 },
  { number: 86, name: 'الطارق', ayahs: 17 },
  { number: 87, name: 'الأعلى', ayahs: 19 },
  { number: 88, name: 'الغاشية', ayahs: 26 },
  { number: 89, name: 'الفجر', ayahs: 30 },
  { number: 90, name: 'البلد', ayahs: 20 },
  { number: 91, name: 'الشمس', ayahs: 15 },
  { number: 92, name: 'الليل', ayahs: 21 },
  { number: 93, name: 'الضحى', ayahs: 11 },
  { number: 94, name: 'الشرح', ayahs: 8 },
  { number: 95, name: 'التين', ayahs: 8 },
  { number: 96, name: 'العلق', ayahs: 19 },
  { number: 97, name: 'القدر', ayahs: 5 },
  { number: 98, name: 'البينة', ayahs: 8 },
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

interface QuranTestPageProps {
  onBack: () => void;
}

export default function QuranTestPage({ onBack }: QuranTestPageProps) {
  const [selectedSurah, setSelectedSurah] = useState<number | null>(null);
  const [questions, setQuestions] = useState<QuranQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Map<number, number>>(new Map());
  const [showResult, setShowResult] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [testStartTime, setTestStartTime] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAnswerFeedback, setShowAnswerFeedback] = useState(false);
  const { toast } = useToast();

  const generateQuestions = async (surahNumber: number) => {
    setIsGenerating(true);
    
    try {
      const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}`);
      const data = await response.json();
      
      if (data.code !== 200) {
        throw new Error('Failed to fetch surah');
      }

      const ayahs = data.data.ayahs;
      const surahName = SURAH_LIST.find(s => s.number === surahNumber)?.name || '';
      
      const eligibleAyahs = ayahs.filter((ayah: any) => ayah.text.split(' ').length >= 4);
      
      if (eligibleAyahs.length < 2) {
        toast({
          title: 'تنبيه',
          description: 'هذه السورة قصيرة جداً للاختبار. اختر سورة أطول.',
          variant: 'destructive'
        });
        setIsGenerating(false);
        return;
      }

      const generatedQuestions: QuranQuestion[] = [];
      const numQuestions = Math.min(10, Math.max(2, Math.floor(eligibleAyahs.length / 2)));
      const usedAyahs = new Set<number>();

      for (let i = 0; i < numQuestions && usedAyahs.size < eligibleAyahs.length; i++) {
        let ayahIndex: number;
        let attempts = 0;
        do {
          ayahIndex = Math.floor(Math.random() * eligibleAyahs.length);
          attempts++;
        } while (usedAyahs.has(ayahIndex) && attempts < 50);
        
        if (usedAyahs.has(ayahIndex)) continue;
        usedAyahs.add(ayahIndex);
        
        const ayah = eligibleAyahs[ayahIndex];
        const ayahWords = ayah.text.split(' ');

        const splitPoint = Math.floor(ayahWords.length / 2);
        const firstPart = ayahWords.slice(0, splitPoint).join(' ');
        const correctCompletion = ayahWords.slice(splitPoint).join(' ');

        const otherAyahs = eligibleAyahs.filter((_: any, idx: number) => idx !== ayahIndex);
        const shuffledOthers = otherAyahs.sort(() => Math.random() - 0.5).slice(0, 3);
        
        const options = [correctCompletion];
        shuffledOthers.forEach((other: any) => {
          const otherWords = other.text.split(' ');
          if (otherWords.length > splitPoint) {
            options.push(otherWords.slice(Math.floor(otherWords.length / 2)).join(' '));
          } else {
            options.push(otherWords.join(' '));
          }
        });

        while (options.length < 4 && otherAyahs.length > shuffledOthers.length) {
          const randomAyah = otherAyahs[Math.floor(Math.random() * otherAyahs.length)];
          const words = randomAyah.text.split(' ');
          options.push(words.slice(0, Math.min(words.length, 3)).join(' '));
        }

        const uniqueOptions = Array.from(new Set(options)).slice(0, 4);
        const shuffledOptions = uniqueOptions.sort(() => Math.random() - 0.5);
        const correctAnswer = shuffledOptions.indexOf(correctCompletion);

        generatedQuestions.push({
          id: `q-${i}`,
          surahNumber,
          surahName,
          ayahNumber: ayah.numberInSurah,
          ayahText: firstPart + ' ...',
          options: shuffledOptions,
          correctAnswer: correctAnswer >= 0 ? correctAnswer : 0,
          questionType: 'completion'
        });
      }

      if (generatedQuestions.length === 0) {
        toast({
          title: 'خطأ',
          description: 'لم نتمكن من إنشاء أسئلة لهذه السورة',
          variant: 'destructive'
        });
        setIsGenerating(false);
        return;
      }

      setQuestions(generatedQuestions);
      setCurrentQuestionIndex(0);
      setAnswers(new Map());
      setTestStartTime(Date.now());
      setShowResult(false);
      setTestResult(null);
    } catch (error) {
      console.error('Error generating questions:', error);
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل الأسئلة. تحقق من اتصالك بالإنترنت.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setShowAnswerFeedback(true);
    
    const isCorrect = answerIndex === questions[currentQuestionIndex].correctAnswer;
    
    setTimeout(() => {
      setAnswers(prev => new Map(prev).set(currentQuestionIndex, answerIndex));
      setShowAnswerFeedback(false);
      setSelectedAnswer(null);
      
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        calculateResult();
      }
    }, 1500);
  };

  const calculateResult = () => {
    const timeTaken = Math.floor((Date.now() - testStartTime) / 1000);
    let correct = 0;
    
    answers.forEach((answer, questionIndex) => {
      if (answer === questions[questionIndex]?.correctAnswer) {
        correct++;
      }
    });

    if (selectedAnswer === questions[currentQuestionIndex]?.correctAnswer) {
      correct++;
    }

    const total = questions.length;
    const score = Math.round((correct / total) * 100);

    setTestResult({
      totalQuestions: total,
      correctAnswers: correct,
      wrongAnswers: total - correct,
      score,
      timeTaken
    });
    setShowResult(true);
  };

  const resetTest = () => {
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers(new Map());
    setSelectedAnswer(null);
    setShowResult(false);
    setTestResult(null);
    setSelectedSurah(null);
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50" dir="rtl">
      <header className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onBack}
                className="text-white hover:bg-white/20"
                data-testid="button-back"
              >
                <ArrowRight className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Brain className="h-6 w-6" />
                  اختبر نفسك في القرآن
                </h1>
                <p className="text-emerald-100 text-sm">تدرب على حفظك واختبر معرفتك</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {!selectedSurah ? (
          <Card className="max-w-xl mx-auto">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-emerald-600" />
              </div>
              <CardTitle className="text-2xl">ابدأ الاختبار</CardTitle>
              <CardDescription>
                اختر السورة التي تريد اختبار حفظك فيها
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Select onValueChange={(v) => setSelectedSurah(Number(v))}>
                <SelectTrigger data-testid="select-surah">
                  <SelectValue placeholder="اختر السورة" />
                </SelectTrigger>
                <SelectContent>
                  {SURAH_LIST.map((surah) => (
                    <SelectItem key={surah.number} value={surah.number.toString()}>
                      سورة {surah.name} ({surah.ayahs} آية)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button 
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                disabled={!selectedSurah || isGenerating}
                onClick={() => selectedSurah && generateQuestions(selectedSurah)}
                data-testid="button-start-test"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 ml-2 animate-spin" />
                    جاري تحضير الأسئلة...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 ml-2" />
                    ابدأ الاختبار
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : questions.length > 0 && !showResult ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <Badge variant="outline" className="text-lg px-4 py-2">
                السؤال {currentQuestionIndex + 1} من {questions.length}
              </Badge>
              <Progress 
                value={((currentQuestionIndex + 1) / questions.length) * 100} 
                className="w-48 h-2"
              />
            </div>

            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-5 w-5 text-emerald-600" />
                  <span className="text-sm text-emerald-700">
                    سورة {currentQuestion.surahName} - الآية {currentQuestion.ayahNumber}
                  </span>
                </div>
                <CardTitle className="text-xl">أكمل الآية التالية:</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 mb-6 border border-amber-200">
                  <p className="text-2xl font-arabic leading-loose text-center text-amber-900">
                    {currentQuestion.ayahText}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = selectedAnswer === index;
                    const isCorrect = index === currentQuestion.correctAnswer;
                    const showFeedback = showAnswerFeedback && (isSelected || isCorrect);
                    
                    return (
                      <button
                        key={index}
                        onClick={() => !showAnswerFeedback && handleAnswerSelect(index)}
                        disabled={showAnswerFeedback}
                        className={`p-4 rounded-lg border-2 text-right transition-all ${
                          showFeedback
                            ? isCorrect
                              ? 'bg-emerald-100 border-emerald-500 text-emerald-800'
                              : isSelected
                                ? 'bg-red-100 border-red-500 text-red-800'
                                : 'bg-white border-gray-200'
                            : 'bg-white border-gray-200 hover:border-emerald-300 hover:bg-emerald-50'
                        }`}
                        data-testid={`button-answer-${index}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            showFeedback && isCorrect
                              ? 'bg-emerald-500 text-white'
                              : showFeedback && isSelected && !isCorrect
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-100 text-gray-600'
                          }`}>
                            {showFeedback && isCorrect ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : showFeedback && isSelected ? (
                              <XCircle className="h-4 w-4" />
                            ) : (
                              <span className="text-sm font-medium">{index + 1}</span>
                            )}
                          </div>
                          <p className="font-arabic text-lg flex-1">{option}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : showResult && testResult ? (
          <Card className="max-w-xl mx-auto text-center">
            <CardHeader>
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                testResult.score >= 80 
                  ? 'bg-emerald-100' 
                  : testResult.score >= 60 
                    ? 'bg-amber-100' 
                    : 'bg-red-100'
              }`}>
                <Trophy className={`h-10 w-10 ${
                  testResult.score >= 80 
                    ? 'text-emerald-600' 
                    : testResult.score >= 60 
                      ? 'text-amber-600' 
                      : 'text-red-600'
                }`} />
              </div>
              <CardTitle className="text-3xl">
                {testResult.score >= 80 ? 'ممتاز!' : testResult.score >= 60 ? 'جيد!' : 'حاول مرة أخرى'}
              </CardTitle>
              <CardDescription>
                لقد أكملت الاختبار
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-6xl font-bold text-emerald-600">
                {testResult.score}%
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-emerald-50 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-emerald-600">{testResult.correctAnswers}</div>
                  <div className="text-sm text-gray-600">إجابة صحيحة</div>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <XCircle className="h-6 w-6 text-red-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-600">{testResult.wrongAnswers}</div>
                  <div className="text-sm text-gray-600">إجابة خاطئة</div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <Star className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">{Math.floor(testResult.timeTaken / 60)}:{(testResult.timeTaken % 60).toString().padStart(2, '0')}</div>
                  <div className="text-sm text-gray-600">الوقت</div>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <Button 
                  variant="outline" 
                  onClick={resetTest}
                  data-testid="button-new-test"
                >
                  اختبار جديد
                </Button>
                <Button 
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => selectedSurah && generateQuestions(selectedSurah)}
                  data-testid="button-retry"
                >
                  <RefreshCw className="h-4 w-4 ml-2" />
                  إعادة الاختبار
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </main>
    </div>
  );
}
