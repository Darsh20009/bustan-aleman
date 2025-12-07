import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { TeacherLayout } from './TeacherLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingCards } from '@/components/shared/LoadingState';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  BookOpen, 
  Users, 
  Target, 
  AlertCircle, 
  RefreshCw,
  CheckCircle2,
  Save,
  Search,
  Plus,
  Trash2,
  BookMarked,
  PenLine
} from 'lucide-react';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const SURAH_NAMES = [
  "الفاتحة", "البقرة", "آل عمران", "النساء", "المائدة", "الأنعام", "الأعراف", "الأنفال",
  "التوبة", "يونس", "هود", "يوسف", "الرعد", "إبراهيم", "الحجر", "النحل", "الإسراء",
  "الكهف", "مريم", "طه", "الأنبياء", "الحج", "المؤمنون", "النور", "الفرقان", "الشعراء",
  "النمل", "القصص", "العنكبوت", "الروم", "لقمان", "السجدة", "الأحزاب", "سبأ", "فاطر",
  "يس", "الصافات", "ص", "الزمر", "غافر", "فصلت", "الشورى", "الزخرف", "الدخان",
  "الجاثية", "الأحقاف", "محمد", "الفتح", "الحجرات", "ق", "الذاريات", "الطور", "النجم",
  "القمر", "الرحمن", "الواقعة", "الحديد", "المجادلة", "الحشر", "الممتحنة", "الصف",
  "الجمعة", "المنافقون", "التغابن", "الطلاق", "التحريم", "الملك", "القلم", "الحاقة",
  "المعارج", "نوح", "الجن", "المزمل", "المدثر", "القيامة", "الإنسان", "المرسلات",
  "النبأ", "النازعات", "عبس", "التكوير", "الانفطار", "المطففين", "الانشقاق", "البروج",
  "الطارق", "الأعلى", "الغاشية", "الفجر", "البلد", "الشمس", "الليل", "الضحى",
  "الشرح", "التين", "العلق", "القدر", "البينة", "الزلزلة", "العاديات", "القارعة",
  "التكاثر", "العصر", "الهمزة", "الفيل", "قريش", "الماعون", "الكوثر", "الكافرون",
  "النصر", "المسد", "الإخلاص", "الفلق", "الناس"
];

const SURAH_AYAH_COUNTS = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111,
  110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45,
  83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55,
  78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20,
  56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 26, 30, 20, 15, 21,
  11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6
];

interface Student {
  id: string;
  firstName?: string;
  lastName?: string;
  studentName?: string;
  phoneNumber?: string;
  currentLevel?: string;
  status?: string;
}

interface DailyAssignment {
  id?: string;
  studentId: string;
  assignmentDate: string;
  memorization?: string;
  review?: string;
  mistakes?: string;
  notes?: string;
}

interface StudentError {
  id?: string;
  studentId: string;
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  errorType: string;
  errorDescription?: string;
  sheikhNote?: string;
  severity: string;
  isResolved: boolean;
}

export function TeacherQuranTrackingPage() {
  const { toast } = useToast();
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('assignment');
  const [addErrorDialogOpen, setAddErrorDialogOpen] = useState(false);

  const [newMemorization, setNewMemorization] = useState({ surah: 1, fromAyah: 1, toAyah: 7 });
  const [newReview, setNewReview] = useState({ surah: 1, fromAyah: 1, toAyah: 7 });
  const [notes, setNotes] = useState('');
  
  const [newError, setNewError] = useState({
    surahNumber: 1,
    ayahNumber: 1,
    errorType: 'tajweed',
    errorDescription: '',
    sheikhNote: '',
    severity: 'medium'
  });

  const { data: students = [], isLoading: studentsLoading } = useQuery<Student[]>({
    queryKey: ['/api/teacher/students'],
  });

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  const { data: studentAssignment, isLoading: assignmentLoading, refetch: refetchAssignment } = useQuery<DailyAssignment>({
    queryKey: [`/api/teacher/student-assignment?studentId=${selectedStudentId}`],
    enabled: !!selectedStudentId,
  });

  const { data: studentErrors = [], isLoading: errorsLoading, refetch: refetchErrors } = useQuery<StudentError[]>({
    queryKey: [`/api/teacher/student-errors?studentId=${selectedStudentId}`],
    enabled: !!selectedStudentId,
  });

  const { data: studentMemorization = [], isLoading: memorizationLoading } = useQuery<any[]>({
    queryKey: [`/api/teacher/student-memorization?studentId=${selectedStudentId}`],
    enabled: !!selectedStudentId,
  });

  const saveAssignmentMutation = useMutation({
    mutationFn: async (data: DailyAssignment) => {
      return apiRequest('POST', '/api/teacher/student-assignment', data);
    },
    onSuccess: () => {
      toast({ title: "تم الحفظ", description: "تم حفظ التكليف بنجاح" });
      queryClient.invalidateQueries({ queryKey: [`/api/teacher/student-assignment?studentId=${selectedStudentId}`] });
    },
    onError: () => {
      toast({ title: "خطأ", description: "فشل حفظ التكليف", variant: "destructive" });
    }
  });

  const addErrorMutation = useMutation({
    mutationFn: async (data: Omit<StudentError, 'id'>) => {
      return apiRequest('POST', '/api/teacher/student-errors', data);
    },
    onSuccess: () => {
      toast({ title: "تم الحفظ", description: "تم إضافة الخطأ بنجاح" });
      setAddErrorDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: [`/api/teacher/student-errors?studentId=${selectedStudentId}`] });
      setNewError({
        surahNumber: 1,
        ayahNumber: 1,
        errorType: 'tajweed',
        errorDescription: '',
        sheikhNote: '',
        severity: 'medium'
      });
    },
    onError: () => {
      toast({ title: "خطأ", description: "فشل إضافة الخطأ", variant: "destructive" });
    }
  });

  const resolveErrorMutation = useMutation({
    mutationFn: async (errorId: string) => {
      return apiRequest('PATCH', `/api/teacher/student-errors/${errorId}/resolve`);
    },
    onSuccess: () => {
      toast({ title: "تم التحديث", description: "تم تحديث حالة الخطأ" });
      queryClient.invalidateQueries({ queryKey: [`/api/teacher/student-errors?studentId=${selectedStudentId}`] });
    },
    onError: () => {
      toast({ title: "خطأ", description: "فشل تحديث الخطأ", variant: "destructive" });
    }
  });

  const filteredStudents = students.filter((s: Student) => {
    const name = s.firstName || s.studentName || '';
    const lastName = s.lastName || '';
    const fullName = `${name} ${lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase()) ||
      s.phoneNumber?.includes(searchQuery);
  });

  // Parse assignment text to extract surah and ayah range
  const parseAssignmentText = (text: string | undefined) => {
    if (!text) return null;
    
    // Match patterns like "سورة الفاتحة (1-7)" or "سورة البقرة (10-20)"
    const match = text.match(/سورة\s+(\S+)\s*\((\d+)-(\d+)\)/);
    if (match) {
      const surahName = match[1];
      const fromAyah = parseInt(match[2]);
      const toAyah = parseInt(match[3]);
      const surahIndex = SURAH_NAMES.findIndex(name => name === surahName);
      if (surahIndex >= 0) {
        return { surah: surahIndex + 1, fromAyah, toAyah };
      }
    }
    return null;
  };

  // Load existing assignment data into form when fetched
  useEffect(() => {
    if (studentAssignment) {
      const memData = parseAssignmentText(studentAssignment.memorization);
      if (memData) {
        setNewMemorization(memData);
      }
      
      const revData = parseAssignmentText(studentAssignment.review);
      if (revData) {
        setNewReview(revData);
      }
      
      setNotes(studentAssignment.notes || '');
    }
  }, [studentAssignment]);

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    // Reset form to defaults when switching students
    setNewMemorization({ surah: 1, fromAyah: 1, toAyah: 7 });
    setNewReview({ surah: 1, fromAyah: 1, toAyah: 7 });
    setNotes('');
  };

  const handleSaveAssignment = () => {
    if (!selectedStudentId) return;
    
    const today = new Date().toISOString().split('T')[0];
    const memorizationText = `سورة ${SURAH_NAMES[newMemorization.surah - 1]} (${newMemorization.fromAyah}-${newMemorization.toAyah})`;
    const reviewText = `سورة ${SURAH_NAMES[newReview.surah - 1]} (${newReview.fromAyah}-${newReview.toAyah})`;
    
    saveAssignmentMutation.mutate({
      studentId: selectedStudentId,
      assignmentDate: today,
      memorization: memorizationText,
      review: reviewText,
      notes: notes,
    });
  };

  const handleAddError = () => {
    if (!selectedStudentId) return;
    
    addErrorMutation.mutate({
      studentId: selectedStudentId,
      surahNumber: newError.surahNumber,
      surahName: SURAH_NAMES[newError.surahNumber - 1],
      ayahNumber: newError.ayahNumber,
      errorType: newError.errorType,
      errorDescription: newError.errorDescription,
      sheikhNote: newError.sheikhNote,
      severity: newError.severity,
      isResolved: false,
    });
  };

  const getProgressPercentage = () => {
    if (!studentMemorization || studentMemorization.length === 0) return 0;
    const completed = studentMemorization.filter((m: any) => m.status === 'completed' || m.status === 'reviewing').length;
    return Math.round((completed / studentMemorization.length) * 100);
  };

  const unresolvedErrors = studentErrors.filter((e: StudentError) => !e.isResolved);

  return (
    <TeacherLayout>
      <PageHeader 
        title="متابعة حفظ القرآن"
        description="إدارة تكليفات الطلاب ومتابعة تقدمهم في الحفظ"
      />

      {studentsLoading ? (
        <LoadingCards count={2} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-12">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                اختيار الطالب
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث بالاسم أو الهاتف..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                  data-testid="input-search-students"
                />
              </div>

              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {filteredStudents.map((student: Student) => (
                    <div
                      key={student.id}
                      onClick={() => handleSelectStudent(student.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedStudentId === student.id 
                          ? 'bg-primary/10 border border-primary' 
                          : 'hover-elevate bg-muted/50'
                      }`}
                      data-testid={`student-card-${student.id}`}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {(student.firstName || student.studentName || '؟').charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {student.firstName || student.studentName} {student.lastName || ''}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {student.phoneNumber || 'لا يوجد هاتف'}
                        </p>
                      </div>
                      <Badge variant={student.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                        {student.currentLevel === 'advanced' ? 'متقدم' : 
                         student.currentLevel === 'intermediate' ? 'متوسط' : 'مبتدئ'}
                      </Badge>
                    </div>
                  ))}
                  {filteredStudents.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      لا يوجد طلاب مطابقين للبحث
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <div className="lg:col-span-8 space-y-6">
            {!selectedStudentId ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">اختر طالباً للمتابعة</h3>
                  <p className="text-muted-foreground">
                    اختر طالباً من القائمة لعرض وتعديل تكليفاته
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="text-lg">
                          {(selectedStudent?.firstName || selectedStudent?.studentName || '؟').charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>
                          {selectedStudent?.firstName || selectedStudent?.studentName} {selectedStudent?.lastName || ''}
                        </CardTitle>
                        <CardDescription>{selectedStudent?.phoneNumber}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-primary">{getProgressPercentage()}%</p>
                        <p className="text-xs text-muted-foreground">نسبة الإنجاز</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-destructive">{unresolvedErrors.length}</p>
                        <p className="text-xs text-muted-foreground">أخطاء معلقة</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Progress value={getProgressPercentage()} className="h-2" />
                  </CardContent>
                </Card>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="assignment" data-testid="tab-assignment">
                      <BookOpen className="ml-2 h-4 w-4" />
                      التكليف اليومي
                    </TabsTrigger>
                    <TabsTrigger value="errors" data-testid="tab-errors">
                      <AlertCircle className="ml-2 h-4 w-4" />
                      الأخطاء ({unresolvedErrors.length})
                    </TabsTrigger>
                    <TabsTrigger value="progress" data-testid="tab-progress">
                      <Target className="ml-2 h-4 w-4" />
                      تقدم الحفظ
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="assignment" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BookMarked className="h-5 w-5" />
                          الحفظ الجديد
                        </CardTitle>
                        <CardDescription>حدد الآيات الجديدة التي يجب على الطالب حفظها</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>السورة</Label>
                            <Select
                              value={newMemorization.surah.toString()}
                              onValueChange={(v) => setNewMemorization({
                                ...newMemorization,
                                surah: parseInt(v),
                                toAyah: Math.min(newMemorization.toAyah, SURAH_AYAH_COUNTS[parseInt(v) - 1])
                              })}
                            >
                              <SelectTrigger data-testid="select-memorization-surah">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {SURAH_NAMES.map((name, idx) => (
                                  <SelectItem key={idx} value={(idx + 1).toString()}>
                                    {idx + 1}. {name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>من آية</Label>
                            <Input
                              type="number"
                              min={1}
                              max={SURAH_AYAH_COUNTS[newMemorization.surah - 1]}
                              value={newMemorization.fromAyah}
                              onChange={(e) => setNewMemorization({
                                ...newMemorization,
                                fromAyah: parseInt(e.target.value) || 1
                              })}
                              data-testid="input-memorization-from"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>إلى آية</Label>
                            <Input
                              type="number"
                              min={newMemorization.fromAyah}
                              max={SURAH_AYAH_COUNTS[newMemorization.surah - 1]}
                              value={newMemorization.toAyah}
                              onChange={(e) => setNewMemorization({
                                ...newMemorization,
                                toAyah: parseInt(e.target.value) || 1
                              })}
                              data-testid="input-memorization-to"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <RefreshCw className="h-5 w-5" />
                          المراجعة
                        </CardTitle>
                        <CardDescription>حدد الآيات التي يجب على الطالب مراجعتها</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>السورة</Label>
                            <Select
                              value={newReview.surah.toString()}
                              onValueChange={(v) => setNewReview({
                                ...newReview,
                                surah: parseInt(v),
                                toAyah: Math.min(newReview.toAyah, SURAH_AYAH_COUNTS[parseInt(v) - 1])
                              })}
                            >
                              <SelectTrigger data-testid="select-review-surah">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {SURAH_NAMES.map((name, idx) => (
                                  <SelectItem key={idx} value={(idx + 1).toString()}>
                                    {idx + 1}. {name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>من آية</Label>
                            <Input
                              type="number"
                              min={1}
                              max={SURAH_AYAH_COUNTS[newReview.surah - 1]}
                              value={newReview.fromAyah}
                              onChange={(e) => setNewReview({
                                ...newReview,
                                fromAyah: parseInt(e.target.value) || 1
                              })}
                              data-testid="input-review-from"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>إلى آية</Label>
                            <Input
                              type="number"
                              min={newReview.fromAyah}
                              max={SURAH_AYAH_COUNTS[newReview.surah - 1]}
                              value={newReview.toAyah}
                              onChange={(e) => setNewReview({
                                ...newReview,
                                toAyah: parseInt(e.target.value) || 1
                              })}
                              data-testid="input-review-to"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <PenLine className="h-5 w-5" />
                          ملاحظات للطالب
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Textarea
                          placeholder="أضف ملاحظات أو توجيهات للطالب..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="min-h-[100px]"
                          data-testid="textarea-notes"
                        />
                      </CardContent>
                    </Card>

                    <Button 
                      onClick={handleSaveAssignment}
                      disabled={saveAssignmentMutation.isPending}
                      className="w-full"
                      data-testid="button-save-assignment"
                    >
                      <Save className="ml-2 h-4 w-4" />
                      {saveAssignmentMutation.isPending ? 'جاري الحفظ...' : 'حفظ التكليف'}
                    </Button>
                  </TabsContent>

                  <TabsContent value="errors" className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">أخطاء الطالب</h3>
                      <Button onClick={() => setAddErrorDialogOpen(true)} data-testid="button-add-error">
                        <Plus className="ml-2 h-4 w-4" />
                        إضافة خطأ
                      </Button>
                    </div>

                    {errorsLoading ? (
                      <LoadingCards count={2} />
                    ) : studentErrors.length === 0 ? (
                      <Card>
                        <CardContent className="py-12 text-center">
                          <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
                          <p className="text-muted-foreground">لا توجد أخطاء مسجلة لهذا الطالب</p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="space-y-3">
                        {studentErrors.map((error: StudentError) => (
                          <Card key={error.id} className={error.isResolved ? 'opacity-60' : ''}>
                            <CardContent className="pt-4">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge variant={
                                      error.severity === 'high' ? 'destructive' : 
                                      error.severity === 'medium' ? 'default' : 'secondary'
                                    }>
                                      {error.severity === 'high' ? 'خطير' : 
                                       error.severity === 'medium' ? 'متوسط' : 'بسيط'}
                                    </Badge>
                                    <Badge variant="outline">
                                      {error.errorType === 'tajweed' ? 'تجويد' : 
                                       error.errorType === 'pronunciation' ? 'نطق' : 'حفظ'}
                                    </Badge>
                                    {error.isResolved && (
                                      <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                                        تم الحل
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="font-medium">
                                    سورة {error.surahName} - الآية {error.ayahNumber}
                                  </p>
                                  {error.errorDescription && (
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {error.errorDescription}
                                    </p>
                                  )}
                                  {error.sheikhNote && (
                                    <p className="text-sm mt-2 p-2 bg-muted rounded">
                                      <strong>ملاحظة الشيخ:</strong> {error.sheikhNote}
                                    </p>
                                  )}
                                </div>
                                {!error.isResolved && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => error.id && resolveErrorMutation.mutate(error.id)}
                                    disabled={resolveErrorMutation.isPending}
                                    data-testid={`button-resolve-error-${error.id}`}
                                  >
                                    <CheckCircle2 className="ml-1 h-4 w-4" />
                                    تم الحل
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="progress" className="space-y-4">
                    {memorizationLoading ? (
                      <LoadingCards count={2} />
                    ) : studentMemorization.length === 0 ? (
                      <Card>
                        <CardContent className="py-12 text-center">
                          <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-muted-foreground">لا يوجد سجل حفظ لهذا الطالب</p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2">
                        {studentMemorization.map((mem: any, idx: number) => (
                          <Card key={idx}>
                            <CardContent className="pt-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium">
                                  سورة {SURAH_NAMES[mem.surahNumber - 1]}
                                </h4>
                                <Badge variant={
                                  mem.status === 'completed' ? 'default' :
                                  mem.status === 'reviewing' ? 'secondary' : 'outline'
                                }>
                                  {mem.status === 'completed' ? 'مكتمل' :
                                   mem.status === 'reviewing' ? 'مراجعة' : 'جاري الحفظ'}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                الآيات {mem.fromAyah} - {mem.toAyah}
                              </p>
                              <div className="flex items-center gap-2">
                                <Progress value={mem.masteryLevel || 0} className="flex-1 h-2" />
                                <span className="text-sm font-medium">{mem.masteryLevel || 0}%</span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        </div>
      )}

      <Dialog open={addErrorDialogOpen} onOpenChange={setAddErrorDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>إضافة خطأ جديد</DialogTitle>
            <DialogDescription>
              سجل خطأ في قراءة أو حفظ الطالب
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>السورة</Label>
                <Select
                  value={newError.surahNumber.toString()}
                  onValueChange={(v) => setNewError({ ...newError, surahNumber: parseInt(v) })}
                >
                  <SelectTrigger data-testid="select-error-surah">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SURAH_NAMES.map((name, idx) => (
                      <SelectItem key={idx} value={(idx + 1).toString()}>
                        {idx + 1}. {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>رقم الآية</Label>
                <Input
                  type="number"
                  min={1}
                  max={SURAH_AYAH_COUNTS[newError.surahNumber - 1]}
                  value={newError.ayahNumber}
                  onChange={(e) => setNewError({ ...newError, ayahNumber: parseInt(e.target.value) || 1 })}
                  data-testid="input-error-ayah"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>نوع الخطأ</Label>
                <Select
                  value={newError.errorType}
                  onValueChange={(v) => setNewError({ ...newError, errorType: v })}
                >
                  <SelectTrigger data-testid="select-error-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tajweed">تجويد</SelectItem>
                    <SelectItem value="pronunciation">نطق</SelectItem>
                    <SelectItem value="memorization">حفظ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>الخطورة</Label>
                <Select
                  value={newError.severity}
                  onValueChange={(v) => setNewError({ ...newError, severity: v })}
                >
                  <SelectTrigger data-testid="select-error-severity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">بسيط</SelectItem>
                    <SelectItem value="medium">متوسط</SelectItem>
                    <SelectItem value="high">خطير</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>وصف الخطأ</Label>
              <Textarea
                placeholder="صف الخطأ بالتفصيل..."
                value={newError.errorDescription}
                onChange={(e) => setNewError({ ...newError, errorDescription: e.target.value })}
                data-testid="textarea-error-description"
              />
            </div>
            <div className="space-y-2">
              <Label>ملاحظة للطالب</Label>
              <Textarea
                placeholder="أضف ملاحظة أو توجيه للطالب..."
                value={newError.sheikhNote}
                onChange={(e) => setNewError({ ...newError, sheikhNote: e.target.value })}
                data-testid="textarea-error-note"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddErrorDialogOpen(false)}>
              إلغاء
            </Button>
            <Button 
              onClick={handleAddError}
              disabled={addErrorMutation.isPending}
              data-testid="button-confirm-add-error"
            >
              {addErrorMutation.isPending ? 'جاري الحفظ...' : 'إضافة الخطأ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TeacherLayout>
  );
}
