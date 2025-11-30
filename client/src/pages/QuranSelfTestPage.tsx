import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowRight, 
  BookOpen, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Eye,
  EyeOff,
  SkipForward,
  Trophy,
  Target
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Ayah {
  number: number;
  text: string;
  surah: number;
  surahName: string;
}

interface TestSession {
  ayahs: Ayah[];
  currentIndex: number;
  correct: number;
  wrong: number;
  revealed: boolean;
  userAnswers: string[];
}

const SURAH_LIST = [
  { number: 1, name: 'الفاتحة', ayahs: 7 },
  { number: 112, name: 'الإخلاص', ayahs: 4 },
  { number: 113, name: 'الفلق', ayahs: 5 },
  { number: 114, name: 'الناس', ayahs: 6 },
];

export default function QuranSelfTestPage({ onBack }: { onBack: () => void }) {
  const { toast } = useToast();
  const [selectedSurah, setSelectedSurah] = useState('1');
  const [session, setSession] = useState<TestSession | null>(null);
  const [userInput, setUserInput] = useState('');
  const [testStarted, setTestStarted] = useState(false);

  const { data: ayahs = [] } = useQuery({
    queryKey: [`/api/quran/ayahs/${selectedSurah}`],
  });

  const startTest = () => {
    if (!ayahs || ayahs.length === 0) {
      toast({ title: 'خطأ', description: 'لم يتم العثور على السورة' });
      return;
    }

    const randomAyahs = [...(ayahs as Ayah[])]
      .sort(() => Math.random() - 0.5)
      .slice(0, 5);

    setSession({
      ayahs: randomAyahs,
      currentIndex: 0,
      correct: 0,
      wrong: 0,
      revealed: false,
      userAnswers: [],
    });
    setTestStarted(true);
    setUserInput('');
  };

  const handleCheck = () => {
    if (!session || !userInput.trim()) {
      toast({ title: 'تنبيه', description: 'الرجاء إدخال الإجابة' });
      return;
    }

    const currentAyah = session.ayahs[session.currentIndex];
    const isCorrect = userInput.trim() === currentAyah.text.trim();

    const newSession = {
      ...session,
      correct: session.correct + (isCorrect ? 1 : 0),
      wrong: session.wrong + (isCorrect ? 0 : 1),
      revealed: true,
      userAnswers: [...session.userAnswers, userInput],
    };

    setSession(newSession);

    if (isCorrect) {
      toast({ 
        title: 'ممتاز!', 
        description: 'إجابة صحيحة',
      });
    }
  };

  const handleNext = () => {
    if (!session) return;

    if (session.currentIndex + 1 < session.ayahs.length) {
      setSession({
        ...session,
        currentIndex: session.currentIndex + 1,
        revealed: false,
      });
      setUserInput('');
    } else {
      handleFinish();
    }
  };

  const handleSkip = () => {
    if (!session) return;
    
    const newSession = {
      ...session,
      wrong: session.wrong + 1,
      revealed: true,
    };
    setSession(newSession);
  };

  const handleFinish = () => {
    toast({
      title: 'انتهى الاختبار',
      description: `حصلت على ${session!.correct} من ${session!.ayahs.length}`,
    });
    setTestStarted(false);
    setSession(null);
  };

  const toggleReveal = () => {
    if (!session) return;
    setSession({ ...session, revealed: !session.revealed });
  };

  if (!testStarted || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-emerald-900 flex items-center gap-3">
              <Target className="w-8 h-8 text-emerald-600" />
              اختبر نفسك في القرآن
            </h1>
            <Button variant="outline" onClick={onBack} data-testid="button-back-self-test">
              <ArrowRight className="w-4 h-4 ml-2" />
              العودة
            </Button>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-emerald-700">اختر سورة للاختبار</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  السورة
                </label>
                <Select value={selectedSurah} onValueChange={setSelectedSurah}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SURAH_LIST.map((surah) => (
                      <SelectItem key={surah.number} value={surah.number.toString()}>
                        {surah.name} - {surah.ayahs} آية
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-6 border border-emerald-200">
                <h3 className="font-semibold text-emerald-900 mb-3">كيفية الاستخدام:</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    سيتم عرض 5 آيات من السورة المختارة
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    حاول استرجاع النص الكامل للآية
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    يمكنك عرض الإجابة الصحيحة للتعلم
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    سيتم حساب درجتك تلقائياً
                  </li>
                </ul>
              </div>

              <Button 
                onClick={startTest}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-6 text-lg font-semibold"
                data-testid="button-start-test"
              >
                <BookOpen className="w-5 h-5 ml-2" />
                ابدأ الاختبار
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentAyah = session.ayahs[session.currentIndex];
  const progress = ((session.currentIndex + 1) / session.ayahs.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-emerald-900">اختبر نفسك</h1>
                <p className="text-sm text-gray-600">{currentAyah.surahName}</p>
              </div>
            </div>
            <Badge className="bg-emerald-100 text-emerald-700 text-lg px-4 py-2">
              {session.currentIndex + 1} من {session.ayahs.length}
            </Badge>
          </div>

          <Progress value={progress} className="h-2" />
        </div>

        {/* Score Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{session.correct}</div>
              <div className="text-xs text-gray-600">صحيح</div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-gradient-to-br from-red-50 to-pink-50">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{session.wrong}</div>
              <div className="text-xs text-gray-600">خاطئ</div>
            </CardContent>
          </Card>
        </div>

        {/* Question Card */}
        <Card className="border-0 shadow-2xl mb-8">
          <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-t-lg">
            <CardTitle>ما النص الكامل لهذه الآية؟</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {/* Ayah Display */}
            <div className="mb-8 p-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border-2 border-emerald-200 text-center">
              <p className="text-2xl font-bold text-emerald-900 mb-2">
                {`سورة ${currentAyah.surahName}: الآية ${currentAyah.number}`}
              </p>
              {!session.revealed && (
                <div className="flex justify-center gap-2 mb-4">
                  <Eye className="w-5 h-5 text-gray-400" />
                </div>
              )}
              {session.revealed && (
                <div className="bg-white rounded-lg p-4 border border-emerald-300 my-4">
                  <p className="text-xl text-gray-700 font-arabic leading-relaxed">
                    {currentAyah.text}
                  </p>
                </div>
              )}
            </div>

            {/* User Input */}
            {!session.revealed ? (
              <>
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="أكتب النص الذي تتذكره..."
                  className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-emerald-500 focus:outline-none mb-4 font-arabic text-lg"
                  rows={4}
                  data-testid="input-ayah-answer"
                />

                <div className="flex gap-3">
                  <Button
                    onClick={handleCheck}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                    data-testid="button-check-answer"
                  >
                    <CheckCircle className="w-4 h-4 ml-2" />
                    تحقق
                  </Button>
                  <Button
                    onClick={handleSkip}
                    variant="outline"
                    className="flex-1"
                    data-testid="button-skip-question"
                  >
                    <SkipForward className="w-4 h-4 ml-2" />
                    تخطي
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-300">
                  {userInput === currentAyah.text.trim() ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-semibold">إجابة صحيحة!</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600">
                      <XCircle className="w-5 h-5" />
                      <span className="font-semibold">الإجابة غير صحيحة</span>
                    </div>
                  )}
                </div>

                <Button
                  onClick={session.currentIndex + 1 < session.ayahs.length ? handleNext : handleFinish}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white"
                  data-testid="button-next-ayah"
                >
                  {session.currentIndex + 1 < session.ayahs.length ? 'السؤال التالي' : 'انتهى الاختبار'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {/* Reveal Button */}
            {!session.revealed && (
              <Button
                onClick={toggleReveal}
                variant="ghost"
                className="w-full mt-4 text-emerald-600 hover:bg-emerald-50"
                data-testid="button-reveal-answer"
              >
                <Eye className="w-4 h-4 ml-2" />
                عرض الإجابة
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
