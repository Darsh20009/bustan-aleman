import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  XCircle, 
  RotateCcw,
  Trophy,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EnhancedAudioPlayer } from '@/components/EnhancedAudioPlayer';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface RecitationModeProps {
  surahNumber: number;
  ayahs: Array<{ number: number; text: string; numberInSurah: number }>;
  surahName: string;
}

export function RecitationMode({ surahNumber, ayahs, surahName }: RecitationModeProps) {
  const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
  const [isTextHidden, setIsTextHidden] = useState(true);
  const [attempts, setAttempts] = useState<Array<'correct' | 'incorrect' | null>>([]);
  const [score, setScore] = useState(0);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const { toast } = useToast();

  const currentAyah = ayahs[currentAyahIndex];

  useEffect(() => {
    if (sessionStarted) {
      setAttempts(new Array(ayahs.length).fill(null));
    }
  }, [sessionStarted, ayahs.length]);

  const saveRecitationMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/quran/recitation-attempts', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quran/recitation-attempts'] });
      toast({
        title: "تم الحفظ",
        description: "تم حفظ نتيجة التلاوة بنجاح",
      });
    },
  });

  const startSession = () => {
    setSessionStarted(true);
    setCurrentAyahIndex(0);
    setAttempts(new Array(ayahs.length).fill(null));
    setScore(0);
    setSessionComplete(false);
    setIsTextHidden(true);
  };

  const markCorrect = () => {
    const newAttempts = [...attempts];
    newAttempts[currentAyahIndex] = 'correct';
    setAttempts(newAttempts);
    setScore(score + 1);
    nextAyah();
  };

  const markIncorrect = () => {
    const newAttempts = [...attempts];
    newAttempts[currentAyahIndex] = 'incorrect';
    setAttempts(newAttempts);
    nextAyah();
  };

  const nextAyah = () => {
    if (currentAyahIndex < ayahs.length - 1) {
      setCurrentAyahIndex(currentAyahIndex + 1);
      setIsTextHidden(true);
    } else {
      completeSession();
    }
  };

  const previousAyah = () => {
    if (currentAyahIndex > 0) {
      setCurrentAyahIndex(currentAyahIndex - 1);
      setIsTextHidden(true);
    }
  };

  const completeSession = () => {
    setSessionComplete(true);
    const totalAyahs = ayahs.length;
    const correctCount = attempts.filter(a => a === 'correct').length;
    const incorrectCount = attempts.filter(a => a === 'incorrect').length;
    const percentage = Math.round((correctCount / totalAyahs) * 100);

    // Save to database
    saveRecitationMutation.mutate({
      surahNumber,
      fromAyah: ayahs[0].numberInSurah,
      toAyah: ayahs[ayahs.length - 1].numberInSurah,
      totalAyahs,
      correctAyahs: correctCount,
      score: percentage,
      mode: 'practice',
      isCompleted: true,
      mistakes: JSON.stringify(
        ayahs
          .filter((_, index) => attempts[index] === 'incorrect')
          .map(a => ({
            ayahNumber: a.numberInSurah,
            type: 'recitation_error',
          }))
      ),
    });
  };

  const progress = ayahs.length > 0 ? ((currentAyahIndex + 1) / ayahs.length) * 100 : 0;

  if (!sessionStarted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-arabic-serif text-center text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-2">
            <BookOpen className="h-6 w-6" />
            وضع التلاوة والحفظ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="bg-emerald-50 dark:bg-emerald-950 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-2">{surahName}</h3>
              <p className="text-muted-foreground">
                عدد الآيات: {ayahs.length}
              </p>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg text-right">
              <h4 className="font-bold mb-2">كيفية الاستخدام:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• استمع للآية أولاً</li>
                <li>• حاول تلاوتها من الذاكرة</li>
                <li>• اضغط "إظهار النص" للتحقق</li>
                <li>• قيّم نفسك (صحيح/خطأ)</li>
                <li>• انتقل للآية التالية</li>
              </ul>
            </div>

            <Button
              size="lg"
              className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
              onClick={startSession}
              data-testid="button-start-recitation"
            >
              <Trophy className="ml-2 h-5 w-5" />
              ابدأ الجلسة
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (sessionComplete) {
    const percentage = Math.round((score / ayahs.length) * 100);
    const grade = percentage >= 90 ? 'ممتاز' : percentage >= 75 ? 'جيد جداً' : percentage >= 60 ? 'جيد' : 'يحتاج تحسين';

    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            <Trophy className="h-16 w-16 mx-auto text-yellow-500" />
            <h2 className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">
              أحسنت!
            </h2>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-emerald-50 dark:bg-emerald-950 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">النتيجة</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {percentage}%
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">صحيح</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {score}/{ayahs.length}
                </p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">التقييم</p>
                <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                  {grade}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                size="lg"
                className="w-full"
                onClick={startSession}
                data-testid="button-retry"
              >
                <RotateCcw className="ml-2 h-5 w-5" />
                إعادة الجلسة
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full"
                onClick={() => setSessionStarted(false)}
                data-testid="button-exit"
              >
                الخروج
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Progress Header */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                الآية {currentAyahIndex + 1} من {ayahs.length}
              </span>
              <Badge variant="secondary">
                {surahName}
              </Badge>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>النتيجة: {score}/{ayahs.length}</span>
              <span>{Math.round(progress)}% مكتمل</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audio Player */}
      <EnhancedAudioPlayer
        surahNumber={surahNumber}
        ayahNumber={currentAyah.numberInSurah}
        onAyahChange={(newAyah) => {
          const newIndex = ayahs.findIndex(a => a.numberInSurah === newAyah);
          if (newIndex !== -1) {
            setCurrentAyahIndex(newIndex);
          }
        }}
        totalAyahs={ayahs[ayahs.length - 1]?.numberInSurah || 1}
      />

      {/* Ayah Display */}
      <Card className="min-h-[300px]">
        <CardContent className="p-8">
          <AnimatePresence mode="wait">
            {isTextHidden ? (
              <motion.div
                key="hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center min-h-[200px] space-y-6"
              >
                <EyeOff className="h-16 w-16 text-muted-foreground" />
                <p className="text-xl text-muted-foreground">
                  استمع للآية وحاول تلاوتها من الذاكرة
                </p>
                <Button
                  size="lg"
                  onClick={() => setIsTextHidden(false)}
                  data-testid="button-show-text"
                >
                  <Eye className="ml-2 h-5 w-5" />
                  إظهار النص
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="visible"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <p className="text-3xl font-arabic-serif leading-loose">
                    {currentAyah.text}
                    <span className="text-emerald-600 dark:text-emerald-400 mx-2">
                      ﴿{currentAyah.numberInSurah}﴾
                    </span>
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <p className="text-center text-sm text-muted-foreground">
                    قيّم تلاوتك:
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      size="lg"
                      className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                      onClick={markCorrect}
                      data-testid="button-mark-correct"
                    >
                      <CheckCircle2 className="ml-2 h-5 w-5" />
                      صحيح
                    </Button>
                    <Button
                      size="lg"
                      variant="destructive"
                      onClick={markIncorrect}
                      data-testid="button-mark-incorrect"
                    >
                      <XCircle className="ml-2 h-5 w-5" />
                      خطأ
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={previousAyah}
          disabled={currentAyahIndex === 0}
          className="flex-1"
          data-testid="button-prev-ayah-recitation"
        >
          السابق
        </Button>
        <Button
          variant="outline"
          onClick={() => setSessionComplete(true)}
          className="flex-1"
          data-testid="button-end-session"
        >
          إنهاء الجلسة
        </Button>
        <Button
          onClick={nextAyah}
          disabled={currentAyahIndex === ayahs.length - 1}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
          data-testid="button-skip-ayah"
        >
          التالي
        </Button>
      </div>
    </div>
  );
}
