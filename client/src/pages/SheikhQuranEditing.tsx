import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { BookOpen, AlertCircle, PenTool, Save, Users, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Surah {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
}

interface Student {
  id: string;
  studentName: string;
  phoneNumber: string;
}

interface LiveAnnotation {
  id: string;
  studentId: string;
  sheikhId: string;
  surahNumber: number;
  ayahNumber: number;
  annotationType: string;
  annotationText: string;
  createdAt: string;
}

const ERROR_TYPES = [
  { value: 'pronunciation', label: '🗣️ أخطاء نطق' },
  { value: 'tajweed', label: '📖 أخطاء تجويد' },
  { value: 'memorization', label: '🧠 أخطاء حفظ' },
];

export default function SheikhQuranEditing() {
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedSurah, setSelectedSurah] = useState<string>('');
  const [selectedAyah, setSelectedAyah] = useState<string>('');
  const [errorType, setErrorType] = useState<string>('');
  const [errorDescription, setErrorDescription] = useState('');
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [surahText, setSurahText] = useState<any[]>([]);
  const { toast } = useToast();

  // Fetch students
  const { data: students = [] } = useQuery<Student[]>({
    queryKey: ['/api/sheikh/students'],
  });

  // Fetch surahs
  const { data: surahs = [] } = useQuery<Surah[]>({
    queryKey: ['/api/surahs'],
  });

  // Fetch student annotations
  const { data: studentAnnotations = [] } = useQuery<LiveAnnotation[]>({
    queryKey: ['/api/live-annotations/student', selectedStudent],
    enabled: !!selectedStudent,
  });

  // Fetch surah text
  useEffect(() => {
    if (selectedSurah) {
      fetch(`https://api.alquran.cloud/v1/surah/${selectedSurah}`)
        .then(res => res.json())
        .then(data => {
          if (data.data && data.data.ayahs) {
            setSurahText(data.data.ayahs);
          }
        })
        .catch(err => console.error('Error fetching surah:', err));
    }
  }, [selectedSurah]);

  // Add annotation mutation
  const addAnnotation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/live-annotations', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/live-annotations/student', selectedStudent] });
      toast({
        title: '✅ تم تسجيل التعليق',
        description: 'تم إرسال إشعار للطالب',
      });
      setShowErrorDialog(false);
      resetErrorForm();
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: '❌ خطأ',
        description: 'فشل تسجيل التعليق',
      });
    },
  });

  // Delete annotation mutation
  const deleteAnnotation = useMutation({
    mutationFn: async (annotationId: string) => {
      return apiRequest(`/api/live-annotations/${annotationId}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/live-annotations/student', selectedStudent] });
      toast({
        title: '✅ تم الحذف',
        description: 'تم حذف التعليق بنجاح',
      });
    },
  });

  const resetErrorForm = () => {
    setSelectedAyah('');
    setErrorType('');
    setErrorDescription('');
  };

  const handleSaveError = () => {
    if (!selectedStudent || !selectedSurah || !selectedAyah || !errorType || !errorDescription) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'يرجى ملء جميع الحقول',
      });
      return;
    }

    addAnnotation.mutate({
      studentId: selectedStudent,
      surahNumber: parseInt(selectedSurah),
      ayahNumber: parseInt(selectedAyah),
      annotationType: errorType,
      annotationText: errorDescription,
    });
  };

  const selectedSurahData = surahs.find(s => s.number.toString() === selectedSurah);
  const selectedStudentData = students.find(s => s.id === selectedStudent);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-orange-800 mb-2">📝 تعديلات القرآن للشيخ</h1>
          <p className="text-gray-600">تتبع أخطاء الطلاب وإضافة ملاحظات على التلاوة</p>
        </div>

        {/* Student & Surah Selection */}
        <Card className="mb-6 border-2 border-orange-200 bg-white">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center">
              <Users className="w-6 h-6 ml-2" />
              اختيار الطالب والسورة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>اختر الطالب</Label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger data-testid="select-student-quran">
                    <SelectValue placeholder="اختر طالباً" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.studentName} - {student.phoneNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>اختر السورة</Label>
                <Select value={selectedSurah} onValueChange={setSelectedSurah}>
                  <SelectTrigger data-testid="select-surah-quran">
                    <SelectValue placeholder="اختر سورة" />
                  </SelectTrigger>
                  <SelectContent>
                    {surahs.map((surah) => (
                      <SelectItem key={surah.number} value={surah.number.toString()}>
                        {surah.number}. {surah.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedStudent && selectedSurah && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quran Text */}
            <div className="lg:col-span-2">
              <Card className="border-2 border-orange-200 bg-white">
                <CardHeader>
                  <CardTitle className="text-orange-800 flex items-center justify-between">
                    <span className="flex items-center">
                      <BookOpen className="w-6 h-6 ml-2" />
                      {selectedSurahData?.name}
                    </span>
                    <span className="text-sm text-gray-600">
                      {selectedSurahData?.numberOfAyahs} آية
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="max-h-[600px] overflow-y-auto">
                  <div className="space-y-4">
                    {surahText.map((ayah, index) => (
                      <div
                        key={ayah.number}
                        className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-lg border border-orange-200 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => {
                          setSelectedAyah(ayah.numberInSurah.toString());
                          setShowErrorDialog(true);
                        }}
                        data-testid={`ayah-${ayah.numberInSurah}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                            {ayah.numberInSurah}
                          </div>
                          <p className="text-2xl leading-loose text-right font-arabic" style={{ fontFamily: 'Amiri, serif' }}>
                            {ayah.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Errors Panel */}
            <div>
              <Card className="border-2 border-red-200 bg-white sticky top-6">
                <CardHeader>
                  <CardTitle className="text-red-800 flex items-center">
                    <AlertCircle className="w-6 h-6 ml-2" />
                    أخطاء {selectedStudentData?.studentName}
                  </CardTitle>
                </CardHeader>
                <CardContent className="max-h-[600px] overflow-y-auto">
                  {studentAnnotations.length === 0 ? (
                    <div className="text-center py-8">
                      <Check className="w-16 h-16 text-green-400 mx-auto mb-3" />
                      <p className="text-gray-500">لا توجد أخطاء مسجلة</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {studentAnnotations.map((annotation) => (
                        <div
                          key={annotation.id}
                          className="bg-red-50 border border-red-200 rounded-lg p-3"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <p className="font-bold text-red-800 text-sm mb-1">
                                السورة {annotation.surahNumber} - الآية {annotation.ayahNumber}
                              </p>
                              <p className="text-xs text-gray-600 mb-1">
                                {ERROR_TYPES.find(t => t.value === annotation.annotationType)?.label}
                              </p>
                              <p className="text-sm text-gray-700">{annotation.annotationText}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteAnnotation.mutate(annotation.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-100 h-6 w-6 p-0"
                              data-testid={`button-delete-error-${annotation.id}`}
                            >
                              ×
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {!selectedStudent && !selectedSurah && (
          <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
            <CardContent className="py-16 text-center">
              <BookOpen className="w-24 h-24 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-400 mb-2">
                اختر طالباً وسورة للبدء
              </h3>
              <p className="text-gray-500">
                يمكنك النقر على أي آية لإضافة خطأ أو ملاحظة
              </p>
            </CardContent>
          </Card>
        )}

        {/* Add Error Dialog */}
        <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
          <DialogContent className="sm:max-w-[500px]" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-2xl text-orange-800">
                📌 إضافة خطأ للآية {selectedAyah}
              </DialogTitle>
              <DialogDescription>
                السورة: {selectedSurahData?.name} - الطالب: {selectedStudentData?.studentName}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>نوع الخطأ</Label>
                <Select value={errorType} onValueChange={setErrorType}>
                  <SelectTrigger data-testid="select-error-type">
                    <SelectValue placeholder="اختر نوع الخطأ" />
                  </SelectTrigger>
                  <SelectContent>
                    {ERROR_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>وصف الخطأ</Label>
                <Textarea
                  placeholder="اكتب تفاصيل الخطأ والملاحظات..."
                  value={errorDescription}
                  onChange={(e) => setErrorDescription(e.target.value)}
                  rows={4}
                  data-testid="textarea-error-description"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                onClick={handleSaveError}
                disabled={addAnnotation.isPending}
                className="bg-orange-600 hover:bg-orange-700"
                data-testid="button-save-error"
              >
                <Save className="w-4 h-4 ml-2" />
                {addAnnotation.isPending ? 'جاري الحفظ...' : 'حفظ الخطأ'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
