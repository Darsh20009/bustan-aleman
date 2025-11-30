import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowRight, 
  Plus, 
  AlertCircle, 
  CheckCircle, 
  BookOpen,
  User,
  Edit,
  Trash2,
  Search,
  Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';

interface Student {
  id: string;
  studentName: string;
  phoneNumber?: string;
  currentLevel?: string;
}

interface StudentError {
  id: string;
  studentId: string;
  sheikhId?: string;
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  wordIndex?: number;
  errorType: string;
  errorDescription?: string;
  sheikhNote?: string;
  severity: string;
  isResolved: boolean;
  resolvedDate?: string;
  createdAt: string;
}

const SURAH_NAMES = [
  { number: 1, name: 'الفاتحة' },
  { number: 2, name: 'البقرة' },
  { number: 3, name: 'آل عمران' },
  { number: 78, name: 'النبأ' },
  { number: 79, name: 'النازعات' },
  { number: 80, name: 'عبس' },
  { number: 81, name: 'التكوير' },
  { number: 82, name: 'الانفطار' },
  { number: 83, name: 'المطففين' },
  { number: 84, name: 'الانشقاق' },
  { number: 85, name: 'البروج' },
  { number: 86, name: 'الطارق' },
  { number: 87, name: 'الأعلى' },
  { number: 88, name: 'الغاشية' },
  { number: 89, name: 'الفجر' },
  { number: 90, name: 'البلد' },
  { number: 91, name: 'الشمس' },
  { number: 92, name: 'الليل' },
  { number: 93, name: 'الضحى' },
  { number: 94, name: 'الشرح' },
  { number: 95, name: 'التين' },
  { number: 96, name: 'العلق' },
  { number: 97, name: 'القدر' },
  { number: 98, name: 'البينة' },
  { number: 99, name: 'الزلزلة' },
  { number: 100, name: 'العاديات' },
  { number: 101, name: 'القارعة' },
  { number: 102, name: 'التكاثر' },
  { number: 103, name: 'العصر' },
  { number: 104, name: 'الهمزة' },
  { number: 105, name: 'الفيل' },
  { number: 106, name: 'قريش' },
  { number: 107, name: 'الماعون' },
  { number: 108, name: 'الكوثر' },
  { number: 109, name: 'الكافرون' },
  { number: 110, name: 'النصر' },
  { number: 111, name: 'المسد' },
  { number: 112, name: 'الإخلاص' },
  { number: 113, name: 'الفلق' },
  { number: 114, name: 'الناس' },
];

const ERROR_TYPES = [
  { value: 'recitation', label: 'خطأ في التلاوة' },
  { value: 'memorization', label: 'خطأ في الحفظ' },
  { value: 'tajweed', label: 'خطأ في التجويد' },
];

const SEVERITY_LEVELS = [
  { value: 'low', label: 'بسيط', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'medium', label: 'متوسط', color: 'bg-orange-100 text-orange-800' },
  { value: 'high', label: 'جسيم', color: 'bg-red-100 text-red-800' },
];

interface SheikhStudentErrorsPageProps {
  onBack: () => void;
}

export default function SheikhStudentErrorsPage({ onBack }: SheikhStudentErrorsPageProps) {
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'resolved' | 'unresolved'>('all');
  const { toast } = useToast();

  const [newError, setNewError] = useState({
    surahNumber: 1,
    ayahNumber: 1,
    wordIndex: 0,
    errorType: 'recitation',
    errorDescription: '',
    sheikhNote: '',
    severity: 'medium',
  });

  const { data: students = [], isLoading: studentsLoading } = useQuery<Student[]>({
    queryKey: ['/api/students'],
  });

  const { data: errors = [], isLoading: errorsLoading } = useQuery<StudentError[]>({
    queryKey: ['/api/student-errors', selectedStudent],
    queryFn: async () => {
      if (!selectedStudent) return [];
      const res = await fetch(`/api/student-errors/${selectedStudent}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!selectedStudent,
  });

  const addErrorMutation = useMutation({
    mutationFn: async (errorData: typeof newError) => {
      const surahName = SURAH_NAMES.find(s => s.number === errorData.surahNumber)?.name || '';
      return apiRequest('POST', '/api/student-errors', {
        ...errorData,
        studentId: selectedStudent,
        surahName,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/student-errors', selectedStudent] });
      setIsAddDialogOpen(false);
      setNewError({
        surahNumber: 1,
        ayahNumber: 1,
        wordIndex: 0,
        errorType: 'recitation',
        errorDescription: '',
        sheikhNote: '',
        severity: 'medium',
      });
      toast({ title: 'تم إضافة الخطأ بنجاح' });
    },
    onError: () => {
      toast({ title: 'فشل في إضافة الخطأ', variant: 'destructive' });
    },
  });

  const resolveErrorMutation = useMutation({
    mutationFn: async (errorId: string) => {
      return apiRequest('PATCH', `/api/student-errors/${errorId}`, {
        isResolved: true,
        resolvedDate: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/student-errors', selectedStudent] });
      toast({ title: 'تم حل الخطأ' });
    },
  });

  const deleteErrorMutation = useMutation({
    mutationFn: async (errorId: string) => {
      return apiRequest('DELETE', `/api/student-errors/${errorId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/student-errors', selectedStudent] });
      toast({ title: 'تم حذف الخطأ' });
    },
  });

  const filteredStudents = students.filter(student =>
    student.studentName.includes(searchQuery)
  );

  const filteredErrors = errors.filter(error => {
    if (filterStatus === 'resolved') return error.isResolved;
    if (filterStatus === 'unresolved') return !error.isResolved;
    return true;
  });

  const selectedStudentData = students.find(s => s.id === selectedStudent);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" dir="rtl">
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
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
                <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                  <AlertCircle className="h-6 w-6" />
                  إدارة أخطاء الطلاب
                </h1>
                <p className="text-blue-100 text-sm">تتبع وتصحيح أخطاء التلاوة والحفظ</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <aside className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  الطلاب
                </CardTitle>
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="بحث عن طالب..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-9"
                    data-testid="input-search-student"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-400px)]">
                  <div className="p-4 space-y-2">
                    {studentsLoading ? (
                      <p className="text-center text-gray-500 py-4">جاري التحميل...</p>
                    ) : filteredStudents.length === 0 ? (
                      <p className="text-center text-gray-500 py-4">لا يوجد طلاب</p>
                    ) : (
                      filteredStudents.map((student) => (
                        <button
                          key={student.id}
                          onClick={() => setSelectedStudent(student.id)}
                          className={`w-full p-3 rounded-lg text-right transition-all ${
                            selectedStudent === student.id
                              ? 'bg-blue-100 border-2 border-blue-500'
                              : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                          }`}
                          data-testid={`button-student-${student.id}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              selectedStudent === student.id
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 text-gray-600'
                            }`}>
                              <User className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium">{student.studentName}</p>
                              {student.currentLevel && (
                                <p className="text-xs text-gray-500">
                                  المستوى: {student.currentLevel}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </aside>

          <div className="lg:col-span-2 space-y-6">
            {selectedStudent ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">
                      أخطاء الطالب: {selectedStudentData?.studentName}
                    </h2>
                    <p className="text-gray-500 text-sm">
                      {filteredErrors.filter(e => !e.isResolved).length} خطأ غير محلول
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select
                      value={filterStatus}
                      onValueChange={(v) => setFilterStatus(v as any)}
                    >
                      <SelectTrigger className="w-40" data-testid="select-filter">
                        <Filter className="h-4 w-4 ml-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">جميع الأخطاء</SelectItem>
                        <SelectItem value="unresolved">غير محلولة</SelectItem>
                        <SelectItem value="resolved">محلولة</SelectItem>
                      </SelectContent>
                    </Select>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-add-error">
                          <Plus className="h-4 w-4 ml-2" />
                          إضافة خطأ
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle>إضافة خطأ جديد</DialogTitle>
                          <DialogDescription>
                            سجل خطأ جديد للطالب في التلاوة أو الحفظ
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>السورة</Label>
                              <Select
                                value={newError.surahNumber.toString()}
                                onValueChange={(v) => setNewError(prev => ({ ...prev, surahNumber: Number(v) }))}
                              >
                                <SelectTrigger data-testid="select-surah">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {SURAH_NAMES.map((surah) => (
                                    <SelectItem key={surah.number} value={surah.number.toString()}>
                                      {surah.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>رقم الآية</Label>
                              <Input
                                type="number"
                                min={1}
                                value={newError.ayahNumber}
                                onChange={(e) => setNewError(prev => ({ ...prev, ayahNumber: Number(e.target.value) }))}
                                data-testid="input-ayah"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>نوع الخطأ</Label>
                              <Select
                                value={newError.errorType}
                                onValueChange={(v) => setNewError(prev => ({ ...prev, errorType: v }))}
                              >
                                <SelectTrigger data-testid="select-error-type">
                                  <SelectValue />
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
                            <div>
                              <Label>درجة الخطورة</Label>
                              <Select
                                value={newError.severity}
                                onValueChange={(v) => setNewError(prev => ({ ...prev, severity: v }))}
                              >
                                <SelectTrigger data-testid="select-severity">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {SEVERITY_LEVELS.map((level) => (
                                    <SelectItem key={level.value} value={level.value}>
                                      {level.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div>
                            <Label>وصف الخطأ</Label>
                            <Textarea
                              value={newError.errorDescription}
                              onChange={(e) => setNewError(prev => ({ ...prev, errorDescription: e.target.value }))}
                              placeholder="صف الخطأ بالتفصيل..."
                              data-testid="input-description"
                            />
                          </div>
                          <div>
                            <Label>ملاحظات الشيخ</Label>
                            <Textarea
                              value={newError.sheikhNote}
                              onChange={(e) => setNewError(prev => ({ ...prev, sheikhNote: e.target.value }))}
                              placeholder="أضف ملاحظاتك للطالب..."
                              data-testid="input-sheikh-note"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                            إلغاء
                          </Button>
                          <Button
                            onClick={() => addErrorMutation.mutate(newError)}
                            disabled={addErrorMutation.isPending}
                            data-testid="button-save-error"
                          >
                            {addErrorMutation.isPending ? 'جاري الحفظ...' : 'حفظ الخطأ'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <div className="space-y-4">
                  {errorsLoading ? (
                    <Card className="p-8 text-center">
                      <p className="text-gray-500">جاري تحميل الأخطاء...</p>
                    </Card>
                  ) : filteredErrors.length === 0 ? (
                    <Card className="p-8 text-center">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-emerald-500" />
                      <h3 className="text-lg font-semibold text-gray-700">لا توجد أخطاء</h3>
                      <p className="text-gray-500">
                        {filterStatus === 'unresolved' 
                          ? 'جميع الأخطاء محلولة' 
                          : 'لم يتم تسجيل أي أخطاء بعد'}
                      </p>
                    </Card>
                  ) : (
                    filteredErrors.map((error) => (
                      <Card key={error.id} className={`${error.isResolved ? 'opacity-60' : ''}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline">
                                  <BookOpen className="h-3 w-3 ml-1" />
                                  {error.surahName} - آية {error.ayahNumber}
                                </Badge>
                                <Badge className={
                                  SEVERITY_LEVELS.find(s => s.value === error.severity)?.color
                                }>
                                  {SEVERITY_LEVELS.find(s => s.value === error.severity)?.label}
                                </Badge>
                                <Badge variant="secondary">
                                  {ERROR_TYPES.find(t => t.value === error.errorType)?.label}
                                </Badge>
                                {error.isResolved && (
                                  <Badge className="bg-emerald-100 text-emerald-800">
                                    <CheckCircle className="h-3 w-3 ml-1" />
                                    محلول
                                  </Badge>
                                )}
                              </div>
                              {error.errorDescription && (
                                <p className="text-gray-700 mb-2">{error.errorDescription}</p>
                              )}
                              {error.sheikhNote && (
                                <div className="bg-blue-50 p-3 rounded-lg mt-2">
                                  <p className="text-sm text-blue-800">
                                    <strong>ملاحظة الشيخ:</strong> {error.sheikhNote}
                                  </p>
                                </div>
                              )}
                              <p className="text-xs text-gray-400 mt-2">
                                {new Date(error.createdAt).toLocaleDateString('ar-SA')}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {!error.isResolved && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => resolveErrorMutation.mutate(error.id)}
                                  className="text-emerald-600 hover:text-emerald-700"
                                  data-testid={`button-resolve-${error.id}`}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteErrorMutation.mutate(error.id)}
                                className="text-red-600 hover:text-red-700"
                                data-testid={`button-delete-${error.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </>
            ) : (
              <Card className="h-96 flex items-center justify-center">
                <CardContent className="text-center">
                  <User className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    اختر طالباً
                  </h3>
                  <p className="text-gray-500">
                    اختر طالباً من القائمة لعرض وإدارة أخطائه
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
