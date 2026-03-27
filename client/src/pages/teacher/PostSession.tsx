import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { TeacherLayout } from './TeacherLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import {
  BookOpen, CheckCircle2, AlertTriangle, Star, Brain,
  ChevronLeft, Save, Send, Loader2, User, Clock,
  BookMarked, RefreshCw, PenTool, Award, Sparkles
} from 'lucide-react';

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

interface ErrorEntry {
  surah: number;
  ayah: number;
  errorType: string;
  description: string;
}

interface StudentInfo {
  id: string;
  name: string;
  lastAssignment?: {
    memorization?: string;
    review?: string;
    date?: string;
  };
  memorizedPages?: number;
  level?: string;
}

export function PostSessionPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [aiEvaluating, setAiEvaluating] = useState(false);
  const [step, setStep] = useState(1);

  const [attendance, setAttendance] = useState<'present' | 'late' | 'absent' | 'excused'>('present');
  const [reviewRating, setReviewRating] = useState(8);
  const [newMemRating, setNewMemRating] = useState(8);
  const [errors, setErrors] = useState<ErrorEntry[]>([]);
  const [teacherNotes, setTeacherNotes] = useState('');

  const [newMemSurah, setNewMemSurah] = useState(1);
  const [newMemFromAyah, setNewMemFromAyah] = useState(1);
  const [newMemToAyah, setNewMemToAyah] = useState(7);
  const [memorizationType, setMemorizationType] = useState('half_page');

  const [nearReviewSurah, setNearReviewSurah] = useState(1);
  const [nearReviewFromAyah, setNearReviewFromAyah] = useState(1);
  const [nearReviewToAyah, setNearReviewToAyah] = useState(7);

  const [farReviewSurah, setFarReviewSurah] = useState(1);
  const [farReviewFromAyah, setFarReviewFromAyah] = useState(1);
  const [farReviewToAyah, setFarReviewToAyah] = useState(7);

  const [aiEvaluation, setAiEvaluation] = useState<any>(null);
  const [sendEmail, setSendEmail] = useState(true);

  useEffect(() => {
    fetchStudentInfo();
  }, [studentId]);

  const fetchStudentInfo = async () => {
    try {
      const res = await fetch(`/api/sheikh/students/${studentId}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setStudent(data);
        if (data.lastAssignment?.memorization) {
          // do nothing special - just display the last assignment text
        }
      }
    } catch (error) {
      console.error('Error fetching student:', error);
    } finally {
      setLoading(false);
    }
  };

  const addError = () => {
    setErrors([...errors, { surah: newMemSurah, ayah: 1, errorType: 'tajweed', description: '' }]);
  };

  const updateError = (index: number, field: keyof ErrorEntry, value: any) => {
    const updated = [...errors];
    updated[index] = { ...updated[index], [field]: value };
    setErrors(updated);
  };

  const removeError = (index: number) => {
    setErrors(errors.filter((_, i) => i !== index));
  };

  const requestAiEvaluation = async () => {
    setAiEvaluating(true);
    try {
      const res = await fetch('/api/ai/evaluate-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          studentId,
          reviewRating,
          newMemorizationRating: newMemRating,
          errors: errors.map(e => ({
            surah: SURAH_NAMES[e.surah - 1],
            ayah: e.ayah,
            type: e.errorType,
            description: e.description
          })),
          teacherNotes
        })
      });
      if (res.ok) {
        const data = await res.json();
        setAiEvaluation(data);
        toast({ title: 'تم التقييم', description: 'تم الحصول على تقييم الذكاء الاصطناعي' });
      }
    } catch (error) {
      toast({ title: 'خطأ', description: 'فشل في الحصول على التقييم', variant: 'destructive' });
    } finally {
      setAiEvaluating(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        studentId,
        attendance,
        reviewRating,
        newMemorizationRating: newMemRating,
        errors,
        teacherNotes,
        newAssignment: {
          newMemorization: { surah: newMemSurah, fromAyah: newMemFromAyah, toAyah: newMemToAyah },
          nearReview: { surah: nearReviewSurah, fromAyah: nearReviewFromAyah, toAyah: nearReviewToAyah },
          farReview: { surah: farReviewSurah, fromAyah: farReviewFromAyah, toAyah: farReviewToAyah },
          memorizationType
        },
        aiEvaluation,
        sendEmailToStudent: sendEmail
      };

      const res = await fetch('/api/sheikh/post-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast({ title: 'تم الحفظ', description: 'تم حفظ تقرير الحصة وتعيين الواجب الجديد بنجاح' });
        navigate('/teacher');
      } else {
        throw new Error('Failed');
      }
    } catch (error) {
      toast({ title: 'خطأ', description: 'فشل في حفظ التقرير', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <TeacherLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-10 h-10 animate-spin text-[#2D5A3D]" />
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout>
      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6" dir="rtl" data-testid="post-session-page">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookMarked className="w-7 h-7 text-[#2D5A3D]" />
            <div>
              <h1 className="text-xl font-bold text-[#2D5A3D]">تقرير ما بعد الحصة</h1>
              {student && <p className="text-sm text-gray-500">{student.name}</p>}
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate('/teacher')} data-testid="button-back">
            <ChevronLeft className="w-4 h-4 ml-1" />
            رجوع
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`flex-1 h-2 rounded-full transition-all ${step >= s ? 'bg-[#2D5A3D]' : 'bg-gray-200'}`} />
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>الحضور والتقييم</span>
          <span>الأخطاء</span>
          <span>الواجب الجديد</span>
          <span>المراجعة والإرسال</span>
        </div>

        {step === 1 && (
          <Card className="p-5 space-y-5" data-testid="step-attendance">
            <CardHeader className="p-0">
              <CardTitle className="text-[#2D5A3D] flex items-center gap-2">
                <User className="w-5 h-5" />
                الحضور والتقييم
              </CardTitle>
            </CardHeader>

            {student?.lastAssignment && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-blue-800 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  الواجب السابق
                  {student.lastAssignment.date && <span className="text-xs text-blue-500">({student.lastAssignment.date})</span>}
                </h4>
                {student.lastAssignment.memorization && (
                  <p className="text-sm text-blue-700 whitespace-pre-line">{student.lastAssignment.memorization}</p>
                )}
                {student.lastAssignment.review && (
                  <p className="text-sm text-blue-600">{student.lastAssignment.review}</p>
                )}
              </div>
            )}

            <div>
              <Label>حالة الحضور</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {(['present', 'late', 'absent', 'excused'] as const).map(status => (
                  <Button
                    key={status}
                    variant={attendance === status ? 'default' : 'outline'}
                    className={attendance === status ? 'bg-[#2D5A3D]' : ''}
                    onClick={() => setAttendance(status)}
                    data-testid={`button-attendance-${status}`}
                  >
                    {status === 'present' ? 'حاضر' : status === 'late' ? 'متأخر' : status === 'absent' ? 'غائب' : 'معذور'}
                  </Button>
                ))}
              </div>
            </div>

            {attendance !== 'absent' && (
              <>
                <div>
                  <Label>تقييم المراجعة (من 10)</Label>
                  <div className="flex items-center gap-3 mt-2">
                    <Input type="range" min="0" max="10" value={reviewRating} onChange={e => setReviewRating(Number(e.target.value))} className="flex-1" data-testid="input-review-rating" />
                    <Badge className={reviewRating >= 7 ? 'bg-green-100 text-green-700' : reviewRating >= 5 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}>
                      {reviewRating}/10
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label>تقييم الحفظ الجديد (من 10)</Label>
                  <div className="flex items-center gap-3 mt-2">
                    <Input type="range" min="0" max="10" value={newMemRating} onChange={e => setNewMemRating(Number(e.target.value))} className="flex-1" data-testid="input-new-mem-rating" />
                    <Badge className={newMemRating >= 7 ? 'bg-green-100 text-green-700' : newMemRating >= 5 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}>
                      {newMemRating}/10
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label>ملاحظات المعلم</Label>
                  <Textarea value={teacherNotes} onChange={e => setTeacherNotes(e.target.value)} placeholder="أضف ملاحظاتك عن أداء الطالب..." className="mt-2" data-testid="input-teacher-notes" />
                </div>
              </>
            )}

            <div className="flex justify-end">
              <Button onClick={() => setStep(2)} className="bg-[#2D5A3D] hover:bg-[#3D7A4D]" data-testid="button-next-step-1">
                التالي
              </Button>
            </div>
          </Card>
        )}

        {step === 2 && (
          <Card className="p-5 space-y-5" data-testid="step-errors">
            <CardHeader className="p-0">
              <CardTitle className="text-[#2D5A3D] flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                تسجيل الأخطاء
              </CardTitle>
            </CardHeader>

            {errors.map((error, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3" data-testid={`error-entry-${index}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">خطأ #{index + 1}</span>
                  <Button variant="ghost" size="sm" onClick={() => removeError(index)} className="text-red-500 h-8" data-testid={`button-remove-error-${index}`}>
                    حذف
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <Label className="text-xs">السورة</Label>
                    <Select value={String(error.surah)} onValueChange={v => updateError(index, 'surah', Number(v))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {SURAH_NAMES.map((name, i) => (
                          <SelectItem key={i} value={String(i + 1)}>{name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">رقم الآية</Label>
                    <Input type="number" min="1" value={error.ayah} onChange={e => updateError(index, 'ayah', Number(e.target.value))} />
                  </div>
                  <div>
                    <Label className="text-xs">نوع الخطأ</Label>
                    <Select value={error.errorType} onValueChange={v => updateError(index, 'errorType', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tajweed">تجويد</SelectItem>
                        <SelectItem value="pronunciation">نطق</SelectItem>
                        <SelectItem value="memorization">حفظ</SelectItem>
                        <SelectItem value="hesitation">تردد</SelectItem>
                        <SelectItem value="repetition">تكرار</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">الوصف</Label>
                    <Input value={error.description} onChange={e => updateError(index, 'description', e.target.value)} placeholder="وصف الخطأ" />
                  </div>
                </div>
              </div>
            ))}

            <Button variant="outline" onClick={addError} className="w-full border-dashed" data-testid="button-add-error">
              <PenTool className="w-4 h-4 ml-2" />
              إضافة خطأ
            </Button>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)} data-testid="button-prev-step-2">السابق</Button>
              <Button onClick={() => setStep(3)} className="bg-[#2D5A3D] hover:bg-[#3D7A4D]" data-testid="button-next-step-2">التالي</Button>
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card className="p-5 space-y-5" data-testid="step-assignment">
            <CardHeader className="p-0">
              <CardTitle className="text-[#2D5A3D] flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                تعيين الواجب الجديد
              </CardTitle>
            </CardHeader>

            <div>
              <Label>نوع الحفظ</Label>
              <Select value={memorizationType} onValueChange={setMemorizationType}>
                <SelectTrigger data-testid="select-memorization-type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="half_page">نصف وجه</SelectItem>
                  <SelectItem value="full_page">وجه كامل</SelectItem>
                  <SelectItem value="custom">مخصص</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-[#2D5A3D] flex items-center gap-2">
                <BookMarked className="w-4 h-4" />
                الحفظ الجديد
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">السورة</Label>
                  <Select value={String(newMemSurah)} onValueChange={v => setNewMemSurah(Number(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SURAH_NAMES.map((name, i) => (
                        <SelectItem key={i} value={String(i + 1)}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">من آية</Label>
                  <Input type="number" min="1" value={newMemFromAyah} onChange={e => setNewMemFromAyah(Number(e.target.value))} data-testid="input-new-mem-from" />
                </div>
                <div>
                  <Label className="text-xs">إلى آية</Label>
                  <Input type="number" min="1" value={newMemToAyah} onChange={e => setNewMemToAyah(Number(e.target.value))} data-testid="input-new-mem-to" />
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-amber-700 flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                المراجعة القريبة
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">السورة</Label>
                  <Select value={String(nearReviewSurah)} onValueChange={v => setNearReviewSurah(Number(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SURAH_NAMES.map((name, i) => (
                        <SelectItem key={i} value={String(i + 1)}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">من آية</Label>
                  <Input type="number" min="1" value={nearReviewFromAyah} onChange={e => setNearReviewFromAyah(Number(e.target.value))} />
                </div>
                <div>
                  <Label className="text-xs">إلى آية</Label>
                  <Input type="number" min="1" value={nearReviewToAyah} onChange={e => setNearReviewToAyah(Number(e.target.value))} />
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-blue-700 flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                المراجعة البعيدة
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">السورة</Label>
                  <Select value={String(farReviewSurah)} onValueChange={v => setFarReviewSurah(Number(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SURAH_NAMES.map((name, i) => (
                        <SelectItem key={i} value={String(i + 1)}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">من آية</Label>
                  <Input type="number" min="1" value={farReviewFromAyah} onChange={e => setFarReviewFromAyah(Number(e.target.value))} />
                </div>
                <div>
                  <Label className="text-xs">إلى آية</Label>
                  <Input type="number" min="1" value={farReviewToAyah} onChange={e => setFarReviewToAyah(Number(e.target.value))} />
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)} data-testid="button-prev-step-3">السابق</Button>
              <Button onClick={() => { requestAiEvaluation(); setStep(4); }} className="bg-[#2D5A3D] hover:bg-[#3D7A4D]" data-testid="button-next-step-3">
                <Brain className="w-4 h-4 ml-2" />
                التالي مع تقييم AI
              </Button>
            </div>
          </Card>
        )}

        {step === 4 && (
          <Card className="p-5 space-y-5" data-testid="step-review">
            <CardHeader className="p-0">
              <CardTitle className="text-[#2D5A3D] flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                المراجعة والإرسال
              </CardTitle>
            </CardHeader>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-gray-700">ملخص التقييم</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span>الحضور:</span><Badge>{attendance === 'present' ? 'حاضر' : attendance === 'late' ? 'متأخر' : attendance === 'absent' ? 'غائب' : 'معذور'}</Badge></div>
                  <div className="flex justify-between"><span>تقييم المراجعة:</span><span>{reviewRating}/10</span></div>
                  <div className="flex justify-between"><span>تقييم الحفظ:</span><span>{newMemRating}/10</span></div>
                  <div className="flex justify-between"><span>عدد الأخطاء:</span><span>{errors.length}</span></div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-gray-700">الواجب الجديد</h4>
                <div className="space-y-1 text-sm">
                  <p>حفظ: {SURAH_NAMES[newMemSurah - 1]} ({newMemFromAyah}-{newMemToAyah})</p>
                  <p>مراجعة قريبة: {SURAH_NAMES[nearReviewSurah - 1]} ({nearReviewFromAyah}-{nearReviewToAyah})</p>
                  <p>مراجعة بعيدة: {SURAH_NAMES[farReviewSurah - 1]} ({farReviewFromAyah}-{farReviewToAyah})</p>
                </div>
              </div>
            </div>

            {aiEvaluating && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-3" />
                <p className="text-purple-700 font-medium">جاري تقييم الذكاء الاصطناعي...</p>
              </div>
            )}

            {aiEvaluation && (
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-5 space-y-3">
                <h4 className="font-medium text-purple-800 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                  تقييم الذكاء الاصطناعي
                </h4>
                {aiEvaluation.overallRating && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm">التقييم العام:</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className={`w-4 h-4 ${s <= Math.round(aiEvaluation.overallRating / 2) ? 'text-[#D4AF37] fill-[#D4AF37]' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <span className="text-sm font-bold">{aiEvaluation.overallRating}/10</span>
                  </div>
                )}
                {aiEvaluation.feedback && (
                  <p className="text-sm text-purple-700">{aiEvaluation.feedback}</p>
                )}
                {aiEvaluation.recommendations && (
                  <div>
                    <h5 className="text-sm font-medium text-purple-800 mb-1">التوصيات:</h5>
                    <ul className="text-sm text-purple-600 space-y-1 list-disc list-inside">
                      {(Array.isArray(aiEvaluation.recommendations) ? aiEvaluation.recommendations : [aiEvaluation.recommendations]).map((rec: string, i: number) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {teacherNotes && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-700 mb-2">ملاحظات المعلم</h4>
                <p className="text-sm text-gray-600">{teacherNotes}</p>
              </div>
            )}

            <div className="flex items-center justify-between border-t pt-4">
              <div className="flex items-center gap-2">
                <Switch checked={sendEmail} onCheckedChange={setSendEmail} data-testid="switch-send-email" />
                <Label className="text-sm">إرسال بريد إلكتروني للطالب</Label>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(3)} data-testid="button-prev-step-4">السابق</Button>
              <Button onClick={handleSubmit} disabled={submitting} className="bg-[#2D5A3D] hover:bg-[#3D7A4D]" data-testid="button-submit-report">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Send className="w-4 h-4 ml-2" />}
                {submitting ? 'جاري الحفظ...' : 'حفظ وإرسال التقرير'}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </TeacherLayout>
  );
}
