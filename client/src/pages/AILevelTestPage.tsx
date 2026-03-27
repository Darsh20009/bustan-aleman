import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Brain, BookOpen, ChevronLeft, ChevronRight, Loader2, CheckCircle2, Star, Sparkles, Award } from 'lucide-react';

const SURAH_NAMES = [
  'الفاتحة', 'البقرة', 'آل عمران', 'النساء', 'المائدة', 'الأنعام', 'الأعراف', 'الأنفال', 'التوبة', 'يونس',
  'هود', 'يوسف', 'الرعد', 'إبراهيم', 'الحجر', 'النحل', 'الإسراء', 'الكهف', 'مريم', 'طه',
  'الأنبياء', 'الحج', 'المؤمنون', 'النور', 'الفرقان', 'الشعراء', 'النمل', 'القصص', 'العنكبوت', 'الروم',
  'لقمان', 'السجدة', 'الأحزاب', 'سبأ', 'فاطر', 'يس', 'الصافات', 'ص', 'الزمر', 'غافر',
  'فصلت', 'الشورى', 'الزخرف', 'الدخان', 'الجاثية', 'الأحقاف', 'محمد', 'الفتح', 'الحجرات', 'ق',
  'الذاريات', 'الطور', 'النجم', 'القمر', 'الرحمن', 'الواقعة', 'الحديد', 'المجادلة', 'الحشر', 'الممتحنة',
  'الصف', 'الجمعة', 'المنافقون', 'التغابن', 'الطلاق', 'التحريم', 'الملك', 'القلم', 'الحاقة', 'المعارج',
  'نوح', 'الجن', 'المزمل', 'المدثر', 'القيامة', 'الإنسان', 'المرسلات', 'النبأ', 'النازعات', 'عبس',
  'التكوير', 'الانفطار', 'المطففين', 'الانشقاق', 'البروج', 'الطارق', 'الأعلى', 'الغاشية', 'الفجر', 'البلد',
  'الشمس', 'الليل', 'الضحى', 'الشرح', 'التين', 'العلق', 'القدر', 'البينة', 'الزلزلة', 'العاديات',
  'القارعة', 'التكاثر', 'العصر', 'الهمزة', 'الفيل', 'قريش', 'الماعون', 'الكوثر', 'الكافرون', 'النصر',
  'المسد', 'الإخلاص', 'الفلق', 'الناس'
];

const JUZ_LIST = Array.from({ length: 30 }, (_, i) => i + 1);

interface TestQuestion {
  id: number;
  question: string;
  type: 'choice' | 'surah_select' | 'juz_select' | 'scale';
  options?: string[];
  answer?: string;
}

const QUESTIONS: TestQuestion[] = [
  { id: 1, question: 'هل سبق لك حفظ شيء من القرآن الكريم؟', type: 'choice', options: ['نعم، أحفظ أجزاء', 'نعم، أحفظ القرآن كاملاً', 'أحفظ بعض السور القصيرة فقط', 'لم أبدأ بعد'] },
  { id: 2, question: 'كم جزءاً تحفظ من القرآن الكريم تقريباً؟', type: 'juz_select' },
  { id: 3, question: 'ما آخر سورة حفظتها؟', type: 'surah_select' },
  { id: 4, question: 'كيف تقيّم مستواك في التجويد؟', type: 'choice', options: ['ممتاز - أعرف جميع أحكام التجويد', 'جيد - أعرف الأحكام الأساسية', 'مبتدئ - أعرف القليل', 'لا أعرف شيئاً عن التجويد'] },
  { id: 5, question: 'كم مرة تقريباً تراجع ما تحفظ أسبوعياً؟', type: 'choice', options: ['يومياً', '3-5 مرات أسبوعياً', '1-2 مرة أسبوعياً', 'نادراً'] },
  { id: 6, question: 'هل درست على يد شيخ أو معلم من قبل؟', type: 'choice', options: ['نعم، في حلقة تحفيظ', 'نعم، عبر الإنترنت', 'درست ذاتياً', 'لم أدرس من قبل'] },
  { id: 7, question: 'ما هدفك من الالتحاق بالأكاديمية؟', type: 'choice', options: ['إتمام حفظ القرآن كاملاً', 'مراجعة وتثبيت الحفظ', 'تعلم التجويد', 'البدء من الصفر'] },
];

export function AILevelTestPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [selectedJuz, setSelectedJuz] = useState('1');
  const [selectedSurah, setSelectedSurah] = useState('1');

  const handleAnswer = (qId: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [qId]: answer }));
  };

  const handleNext = () => {
    const q = QUESTIONS[currentQ];
    if (q.type === 'juz_select') {
      handleAnswer(q.id, selectedJuz);
    } else if (q.type === 'surah_select') {
      handleAnswer(q.id, SURAH_NAMES[parseInt(selectedSurah) - 1]);
    }
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    }
  };

  const handleSubmit = async () => {
    const q = QUESTIONS[currentQ];
    if (q.type === 'juz_select') {
      handleAnswer(q.id, selectedJuz);
    } else if (q.type === 'surah_select') {
      handleAnswer(q.id, SURAH_NAMES[parseInt(selectedSurah) - 1]);
    }

    setEvaluating(true);
    try {
      const res = await fetch('/api/ai/level-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ answers: { ...answers, [q.id]: q.type === 'juz_select' ? selectedJuz : q.type === 'surah_select' ? SURAH_NAMES[parseInt(selectedSurah) - 1] : answers[q.id] } })
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        throw new Error('Failed');
      }
    } catch (error) {
      toast({ title: 'خطأ', description: 'فشل في تحليل الإجابات', variant: 'destructive' });
    } finally {
      setEvaluating(false);
    }
  };

  const question = QUESTIONS[currentQ];
  const progress = ((currentQ + 1) / QUESTIONS.length) * 100;

  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f0f7f2] to-white flex items-center justify-center p-4" dir="rtl">
        <Card className="max-w-lg w-full overflow-hidden" data-testid="level-test-result">
          <div className="bg-gradient-to-br from-[#2D5A3D] to-[#1a3a25] p-8 text-center">
            <Award className="w-16 h-16 text-[#D4AF37] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">نتيجة تحديد المستوى</h2>
            <p className="text-[#D4AF37] text-lg">{result.level || 'مبتدئ'}</p>
          </div>
          <CardContent className="p-6 space-y-4">
            {result.memorizedJuz && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">الأجزاء المحفوظة تقريباً:</span>
                <Badge className="bg-[#2D5A3D] text-white">{result.memorizedJuz} جزء</Badge>
              </div>
            )}
            {result.tajweedLevel && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">مستوى التجويد:</span>
                <Badge className="bg-blue-100 text-blue-700">{result.tajweedLevel}</Badge>
              </div>
            )}
            {result.recommendation && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-medium text-purple-800 flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                  توصية الذكاء الاصطناعي
                </h4>
                <p className="text-sm text-purple-700">{result.recommendation}</p>
              </div>
            )}
            {result.startingSurah && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <h4 className="font-medium text-emerald-800 mb-1">نقطة البداية المقترحة</h4>
                <p className="text-sm text-emerald-700">سورة {result.startingSurah}</p>
              </div>
            )}
            <Button onClick={() => navigate('/student')} className="w-full bg-[#2D5A3D] hover:bg-[#3D7A4D] mt-4" data-testid="button-go-dashboard">
              الانتقال إلى لوحة التحكم
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0f7f2] to-white flex items-center justify-center p-4" dir="rtl">
      <Card className="max-w-lg w-full" data-testid="level-test-page">
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Brain className="w-8 h-8 text-[#2D5A3D]" />
            <CardTitle className="text-xl text-[#2D5A3D]">اختبار تحديد المستوى</CardTitle>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-[#2D5A3D] h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-xs text-gray-500 mt-1">السؤال {currentQ + 1} من {QUESTIONS.length}</p>
        </CardHeader>

        <CardContent className="space-y-5">
          {evaluating ? (
            <div className="py-12 text-center">
              <Loader2 className="w-12 h-12 animate-spin text-[#2D5A3D] mx-auto mb-4" />
              <p className="text-[#2D5A3D] font-medium">جاري تحليل إجاباتك بالذكاء الاصطناعي...</p>
              <p className="text-sm text-gray-500 mt-2">يرجى الانتظار</p>
            </div>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-gray-800 text-center">{question.question}</h3>

              {question.type === 'choice' && question.options && (
                <div className="space-y-2">
                  {question.options.map((opt, i) => (
                    <Button
                      key={i}
                      variant={answers[question.id] === opt ? 'default' : 'outline'}
                      className={`w-full justify-start text-right h-auto py-3 px-4 ${answers[question.id] === opt ? 'bg-[#2D5A3D] text-white' : ''}`}
                      onClick={() => handleAnswer(question.id, opt)}
                      data-testid={`button-option-${i}`}
                    >
                      {answers[question.id] === opt && <CheckCircle2 className="w-4 h-4 ml-2 flex-shrink-0" />}
                      {opt}
                    </Button>
                  ))}
                </div>
              )}

              {question.type === 'juz_select' && (
                <Select value={selectedJuz} onValueChange={setSelectedJuz}>
                  <SelectTrigger data-testid="select-juz"><SelectValue placeholder="اختر عدد الأجزاء" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">لا أحفظ شيئاً</SelectItem>
                    {JUZ_LIST.map(j => (
                      <SelectItem key={j} value={String(j)}>{j} جزء</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {question.type === 'surah_select' && (
                <Select value={selectedSurah} onValueChange={setSelectedSurah}>
                  <SelectTrigger data-testid="select-surah"><SelectValue placeholder="اختر السورة" /></SelectTrigger>
                  <SelectContent>
                    {SURAH_NAMES.map((name, i) => (
                      <SelectItem key={i} value={String(i + 1)}>{name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0} data-testid="button-prev-question">
                  <ChevronRight className="w-4 h-4 ml-1" />
                  السابق
                </Button>
                {currentQ === QUESTIONS.length - 1 ? (
                  <Button onClick={handleSubmit} className="bg-[#2D5A3D] hover:bg-[#3D7A4D]" disabled={!answers[question.id] && question.type === 'choice'} data-testid="button-submit-test">
                    <Brain className="w-4 h-4 ml-2" />
                    تحليل النتائج
                  </Button>
                ) : (
                  <Button onClick={handleNext} className="bg-[#2D5A3D] hover:bg-[#3D7A4D]" disabled={!answers[question.id] && question.type === 'choice'} data-testid="button-next-question">
                    التالي
                    <ChevronLeft className="w-4 h-4 mr-1" />
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
