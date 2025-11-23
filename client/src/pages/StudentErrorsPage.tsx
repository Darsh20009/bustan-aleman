import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, AlertTriangle, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

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

interface StudentErrorsPageProps {
  studentId: string;
  onBack?: () => void;
}

interface StudentError {
  id: string;
  studentId: string;
  surahNumber: number;
  ayahNumber: number;
  errorType: 'pronunciation' | 'tajweed' | 'memorization';
  errorDescription: string;
  recordedAt?: string;
  sheikhId?: string;
}

export default function StudentErrorsPage({ studentId, onBack }: StudentErrorsPageProps) {
  const { toast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newError, setNewError] = useState({
    surahNumber: 1,
    ayahNumber: 1,
    errorType: 'pronunciation' as 'pronunciation' | 'tajweed' | 'memorization',
    errorDescription: '',
  });

  const { data: errors = [], isLoading } = useQuery<StudentError[]>({
    queryKey: ['/api/sheikh/student-errors', studentId],
    queryFn: async () => {
      if (!studentId) return [];
      const response = await fetch(`/api/sheikh/student-errors?studentId=${studentId}`);
      if (!response.ok) throw new Error('Failed to fetch errors');
      return response.json();
    },
    enabled: !!studentId,
  });

  const createErrorMutation = useMutation({
    mutationFn: async (data: typeof newError) => {
      return await apiRequest(`/api/sheikh/student-errors`, 'POST', {
        ...data,
        studentId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sheikh/student-errors', studentId] });
      toast({
        title: "تم إضافة الخطأ ✅",
        description: "تم تسجيل الخطأ بنجاح",
      });
      setNewError({
        surahNumber: 1,
        ayahNumber: 1,
        errorType: 'pronunciation',
        errorDescription: '',
      });
      setShowAddForm(false);
    },
    onError: () => {
      toast({
        title: "خطأ",
        description: "فشل في إضافة الخطأ",
        variant: "destructive",
      });
    },
  });

  const deleteErrorMutation = useMutation({
    mutationFn: async (errorId: string) => {
      return await apiRequest(`/api/sheikh/student-errors/${errorId}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sheikh/student-errors', studentId] });
      toast({
        title: "تم الحذف ✅",
        description: "تم حذف الخطأ بنجاح",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createErrorMutation.mutate(newError);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-red-50" dir="rtl">
      <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-red-600 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4"
            >
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">أخطاء الطالب</h1>
                <p className="text-rose-100 text-lg">متابعة وتسجيل أخطاء الطالب في القراءة والتجويد</p>
              </div>
            </motion.div>
            {onBack && (
              <Button
                onClick={onBack}
                variant="outline"
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                data-testid="button-back"
              >
                ← العودة
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white shadow-lg"
            data-testid="button-add-error"
          >
            <Plus className="w-5 h-5 ml-2" />
            إضافة خطأ جديد
          </Button>
        </div>

        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="border-2 border-rose-200 bg-rose-50/50">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">تسجيل خطأ جديد</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-bold">اختر السورة</Label>
                      <Select
                        value={newError.surahNumber.toString()}
                        onValueChange={(val) => setNewError({ ...newError, surahNumber: parseInt(val) })}
                      >
                        <SelectTrigger data-testid="select-surah">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SURAH_NAMES.map((name, index) => (
                            <SelectItem key={index + 1} value={(index + 1).toString()}>
                              {index + 1}. {name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-bold">رقم الآية</Label>
                      <Select
                        value={newError.ayahNumber.toString()}
                        onValueChange={(val) => setNewError({ ...newError, ayahNumber: parseInt(val) })}
                      >
                        <SelectTrigger data-testid="select-ayah">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 100 }, (_, i) => i + 1).map(num => (
                            <SelectItem key={num} value={num.toString()}>
                              الآية {num}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-bold">نوع الخطأ</Label>
                      <Select
                        value={newError.errorType}
                        onValueChange={(val: typeof newError.errorType) => setNewError({ ...newError, errorType: val })}
                      >
                        <SelectTrigger data-testid="select-error-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pronunciation">نطق</SelectItem>
                          <SelectItem value="tajweed">تجويد</SelectItem>
                          <SelectItem value="memorization">حفظ</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-bold">وصف الخطأ</Label>
                    <Textarea
                      value={newError.errorDescription}
                      onChange={(e) => setNewError({ ...newError, errorDescription: e.target.value })}
                      placeholder="اكتب وصفاً تفصيلياً للخطأ..."
                      className="min-h-[100px]"
                      data-testid="textarea-error-description"
                      required
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddForm(false)}
                      data-testid="button-cancel"
                    >
                      إلغاء
                    </Button>
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-rose-600 to-pink-600"
                      disabled={createErrorMutation.isPending}
                      data-testid="button-submit-error"
                    >
                      {createErrorMutation.isPending ? 'جاري الحفظ...' : 'حفظ الخطأ'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {errors.length === 0 && !showAddForm && (
            <div className="col-span-full text-center py-12">
              <AlertTriangle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">لا توجد أخطاء مسجلة حتى الآن</p>
            </div>
          )}

          {errors.map((error: any) => (
            <motion.div
              key={error.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="border-2 border-rose-200 hover:border-rose-300 transition-colors">
                <CardHeader className="bg-gradient-to-r from-rose-100 to-pink-100">
                  <CardTitle className="flex items-center justify-between">
                    <span>{SURAH_NAMES[error.surahNumber - 1]} - آية {error.ayahNumber}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteErrorMutation.mutate(error.id)}
                      disabled={deleteErrorMutation.isPending}
                      data-testid={`button-delete-error-${error.id}`}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-600">النوع:</span>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      error.errorType === 'pronunciation' ? 'bg-blue-100 text-blue-700' :
                      error.errorType === 'tajweed' ? 'bg-purple-100 text-purple-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {error.errorType === 'pronunciation' ? 'نطق' :
                       error.errorType === 'tajweed' ? 'تجويد' : 'حفظ'}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm">{error.errorDescription}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(error.recordedAt).toLocaleDateString('ar-SA')}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
