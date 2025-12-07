import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { StudentLayout } from './StudentLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { LoadingCards } from '@/components/shared/LoadingState';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Link } from 'wouter';
import { 
  BookOpen, 
  TrendingUp, 
  Target, 
  Award, 
  Calendar,
  Clock,
  BarChart3,
  RefreshCw,
  CheckCircle2,
  BookMarked,
  FileText,
  Share2,
  Download,
  Copy,
  Check
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

const TOTAL_QURAN_AYAHS = 6236;

export function StudentQuranTrackingPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: progress, isLoading: progressLoading } = useQuery<any>({
    queryKey: ['/api/student/progress'],
  });

  const { data: memorizations = [], isLoading: memorizationsLoading } = useQuery<any[]>({
    queryKey: ['/api/quran/memorization'],
  });

  const { data: readingStats = [], isLoading: statsLoading } = useQuery<any[]>({
    queryKey: ['/api/quran/reading-stats'],
  });

  const { data: dueReviews = [], isLoading: reviewsLoading } = useQuery<any[]>({
    queryKey: ['/api/quran/reviews/due'],
  });

  const isLoading = progressLoading || memorizationsLoading || statsLoading || reviewsLoading;

  const calculateOverallProgress = () => {
    if (!memorizations || memorizations.length === 0) return { memorized: 0, percentage: 0 };
    
    let totalMemorizedAyahs = 0;
    memorizations.forEach((mem: any) => {
      if (mem.status === 'completed' || mem.status === 'reviewing') {
        totalMemorizedAyahs += (mem.toAyah - mem.fromAyah + 1);
      }
    });
    
    return {
      memorized: totalMemorizedAyahs,
      percentage: Math.round((totalMemorizedAyahs / TOTAL_QURAN_AYAHS) * 100 * 10) / 10
    };
  };

  const getLastMemorizedPosition = () => {
    if (!memorizations || memorizations.length === 0) {
      return progress?.lastSurah && progress?.lastAyah 
        ? { surah: progress.lastSurah, ayah: progress.lastAyah }
        : null;
    }
    
    const sortedMem = [...memorizations].sort((a: any, b: any) => {
      if (a.surahNumber !== b.surahNumber) return b.surahNumber - a.surahNumber;
      return b.toAyah - a.toAyah;
    });
    
    if (sortedMem.length > 0) {
      return { 
        surah: sortedMem[0].surahNumber, 
        ayah: sortedMem[0].toAyah,
        surahName: SURAH_NAMES[sortedMem[0].surahNumber - 1]
      };
    }
    return null;
  };

  const getTodayReview = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayStats = readingStats.find((s: any) => s.date?.startsWith(today));
    return todayStats || { ayahsRead: 0, pagesRead: 0, minutesSpent: 0 };
  };

  const getWeeklyStats = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weekStats = readingStats.filter((s: any) => new Date(s.date) >= weekAgo);
    return {
      totalAyahs: weekStats.reduce((sum: number, s: any) => sum + (s.ayahsRead || 0), 0),
      totalPages: weekStats.reduce((sum: number, s: any) => sum + (s.pagesRead || 0), 0),
      totalMinutes: weekStats.reduce((sum: number, s: any) => sum + (s.minutesSpent || 0), 0),
      daysActive: weekStats.length
    };
  };

  const overallProgress = calculateOverallProgress();
  const lastPosition = getLastMemorizedPosition();
  const todayReview = getTodayReview();
  const weeklyStats = getWeeklyStats();

  const getCompletedSurahsCount = () => {
    if (!memorizations) return 0;
    
    const surahProgress: { [key: number]: number } = {};
    memorizations.forEach((mem: any) => {
      if (!surahProgress[mem.surahNumber]) surahProgress[mem.surahNumber] = 0;
      if (mem.status === 'completed' || mem.status === 'reviewing') {
        surahProgress[mem.surahNumber] += (mem.toAyah - mem.fromAyah + 1);
      }
    });
    
    let completedCount = 0;
    Object.keys(surahProgress).forEach((surahNum) => {
      const num = parseInt(surahNum);
      if (surahProgress[num] >= SURAH_AYAH_COUNTS[num - 1]) {
        completedCount++;
      }
    });
    
    return completedCount;
  };

  const generateReportText = () => {
    const today = new Date();
    const dateStr = today.toLocaleDateString('ar-EG', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    const rating = weeklyStats.daysActive >= 5 ? "ممتاز" : weeklyStats.daysActive >= 3 ? "جيد" : "يحتاج تحسين";
    const commitment = Math.round((weeklyStats.daysActive / 7) * 100);
    
    return `التقرير الأسبوعي لحفظ القرآن الكريم
التاريخ: ${dateStr}

نسبة الإنجاز الكلية: ${overallProgress.percentage}%
عدد الآيات المحفوظة: ${overallProgress.memorized} آية من ${TOTAL_QURAN_AYAHS}
السور المكتملة: ${getCompletedSurahsCount()} من 114 سورة

إحصائيات الأسبوع:
- عدد الآيات المقروءة: ${weeklyStats.totalAyahs} آية
- عدد الصفحات: ${weeklyStats.totalPages} صفحة
- وقت القراءة: ${Math.round(weeklyStats.totalMinutes / 60)} ساعة
- أيام النشاط: ${weeklyStats.daysActive} أيام

معدل القراءة اليومي: ${weeklyStats.daysActive > 0 ? Math.round(weeklyStats.totalAyahs / weeklyStats.daysActive) : 0} آية
نسبة الالتزام: ${commitment}%
التقييم العام: ${rating}

${lastPosition ? `آخر موضع: سورة ${lastPosition.surahName || SURAH_NAMES[lastPosition.surah - 1]} - الآية ${lastPosition.ayah}` : ''}

بارك الله في جهودكم ووفقكم لحفظ كتابه الكريم`;
  };

  const copyReportToClipboard = async () => {
    const reportText = generateReportText();
    
    if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
      toast({
        title: "غير مدعوم",
        description: "يرجى نسخ التقرير يدوياً من النص أعلاه",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "تم النسخ",
        description: "تم نسخ التقرير إلى الحافظة"
      });
    } catch (err) {
      toast({
        title: "خطأ",
        description: "فشل نسخ التقرير، يرجى النسخ يدوياً",
        variant: "destructive"
      });
    }
  };

  const shareReport = async () => {
    const reportText = generateReportText();
    
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'التقرير الأسبوعي لحفظ القرآن',
          text: reportText
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          copyReportToClipboard();
        }
      }
    } else if (typeof navigator !== 'undefined' && typeof navigator.clipboard?.writeText === 'function') {
      copyReportToClipboard();
    } else {
      toast({
        title: "المشاركة غير متاحة",
        description: "يمكنك نسخ النص يدوياً من التقرير أعلاه"
      });
    }
  };

  return (
    <StudentLayout>
      <PageHeader 
        title="متابعة حفظ القرآن"
        description="تتبع تقدمك في الحفظ والمراجعة اليومية"
        actions={
          <div className="flex gap-2 flex-wrap">
            <Button asChild variant="outline">
              <Link href="/student/memorization">
                <BarChart3 className="ml-2 h-4 w-4" />
                تفاصيل الحفظ
              </Link>
            </Button>
            <Button asChild>
              <Link href="/quran">
                <BookOpen className="ml-2 h-4 w-4" />
                فتح المصحف
              </Link>
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <LoadingCards count={4} />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <StatsCard
              title="آخر موضع وصلت إليه"
              value={lastPosition ? `${lastPosition.surahName || SURAH_NAMES[lastPosition.surah - 1]}` : "لم تبدأ بعد"}
              subtitle={lastPosition ? `الآية ${lastPosition.ayah}` : "ابدأ الحفظ الآن"}
              icon={<BookMarked className="h-4 w-4" />}
            />
            <StatsCard
              title="نسبة الإنجاز الكلية"
              value={`${overallProgress.percentage}%`}
              subtitle={`${overallProgress.memorized} آية من ${TOTAL_QURAN_AYAHS}`}
              icon={<Target className="h-4 w-4" />}
            />
            <StatsCard
              title="المراجعة اليومية"
              value={`${todayReview.ayahsRead || 0} آية`}
              subtitle={`${todayReview.pagesRead || 0} صفحة اليوم`}
              icon={<RefreshCw className="h-4 w-4" />}
            />
            <StatsCard
              title="السور المكتملة"
              value={getCompletedSurahsCount()}
              subtitle="من 114 سورة"
              icon={<Award className="h-4 w-4" />}
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview" data-testid="tab-overview">
                <TrendingUp className="ml-2 h-4 w-4" />
                نظرة عامة
              </TabsTrigger>
              <TabsTrigger value="daily" data-testid="tab-daily">
                <Calendar className="ml-2 h-4 w-4" />
                المراجعة اليومية
              </TabsTrigger>
              <TabsTrigger value="weekly" data-testid="tab-weekly">
                <FileText className="ml-2 h-4 w-4" />
                التقرير الأسبوعي
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>تقدم الحفظ</CardTitle>
                    <CardDescription>نسبة إتمام حفظ القرآن الكريم</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-muted-foreground">الإنجاز الكلي</span>
                        <span className="font-medium">{overallProgress.percentage}%</span>
                      </div>
                      <Progress value={overallProgress.percentage} className="h-4" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {overallProgress.memorized}
                        </div>
                        <div className="text-sm text-muted-foreground">آية محفوظة</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {Math.ceil(overallProgress.memorized / 15)}
                        </div>
                        <div className="text-sm text-muted-foreground">صفحة تقريباً</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>المراجعات المستحقة</CardTitle>
                    <CardDescription>الأقسام التي تحتاج مراجعة</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {dueReviews.length > 0 ? (
                      <ScrollArea className="h-[200px]">
                        <div className="space-y-3">
                          {dueReviews.slice(0, 5).map((review: any, index: number) => (
                            <div 
                              key={index}
                              className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800"
                            >
                              <div>
                                <p className="font-medium">
                                  سورة {SURAH_NAMES[review.surahNumber - 1]}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  الآيات {review.fromAyah} - {review.toAyah}
                                </p>
                              </div>
                              <Badge variant="outline" className="bg-amber-100 dark:bg-amber-900">
                                مراجعة
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500" />
                        <p>لا توجد مراجعات مستحقة اليوم</p>
                        <p className="text-sm">أحسنت! استمر في الحفظ</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="daily" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>إحصائيات اليوم</CardTitle>
                  <CardDescription>نشاطك في القراءة والحفظ لهذا اليوم</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
                      <BookOpen className="h-8 w-8 mx-auto mb-2 text-emerald-600 dark:text-emerald-400" />
                      <div className="text-2xl font-bold">{todayReview.ayahsRead || 0}</div>
                      <div className="text-sm text-muted-foreground">آيات مقروءة</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                      <div className="text-2xl font-bold">{todayReview.pagesRead || 0}</div>
                      <div className="text-sm text-muted-foreground">صفحات</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-950/30">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
                      <div className="text-2xl font-bold">{todayReview.minutesSpent || 0}</div>
                      <div className="text-sm text-muted-foreground">دقيقة</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-orange-50 dark:bg-orange-950/30">
                      <RefreshCw className="h-8 w-8 mx-auto mb-2 text-orange-600 dark:text-orange-400" />
                      <div className="text-2xl font-bold">{dueReviews.length}</div>
                      <div className="text-sm text-muted-foreground">مراجعات مستحقة</div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-medium mb-4">الموضع الحالي في المصحف</h4>
                    {lastPosition ? (
                      <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                        <div>
                          <p className="font-medium text-lg">
                            سورة {lastPosition.surahName || SURAH_NAMES[lastPosition.surah - 1]}
                          </p>
                          <p className="text-muted-foreground">الآية {lastPosition.ayah}</p>
                        </div>
                        <Button asChild size="sm">
                          <Link href="/quran">
                            متابعة القراءة
                          </Link>
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        لم تبدأ بالحفظ بعد. ابدأ رحلتك الآن!
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="weekly" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>التقرير الأسبوعي</CardTitle>
                  <CardDescription>ملخص نشاطك خلال الأسبوع الماضي</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                    <div className="text-center p-4 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
                      <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                        {weeklyStats.totalAyahs}
                      </div>
                      <div className="text-sm text-muted-foreground">آية هذا الأسبوع</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {weeklyStats.totalPages}
                      </div>
                      <div className="text-sm text-muted-foreground">صفحة</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30">
                      <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                        {Math.round(weeklyStats.totalMinutes / 60)}
                      </div>
                      <div className="text-sm text-muted-foreground">ساعة قراءة</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30">
                      <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                        {weeklyStats.daysActive}
                      </div>
                      <div className="text-sm text-muted-foreground">أيام نشطة</div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t">
                    <h4 className="font-medium">ملخص الأداء</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">معدل القراءة اليومي</span>
                        <span className="font-medium">
                          {weeklyStats.daysActive > 0 
                            ? Math.round(weeklyStats.totalAyahs / weeklyStats.daysActive)
                            : 0} آية
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">نسبة الالتزام</span>
                        <Badge variant={weeklyStats.daysActive >= 5 ? "default" : "secondary"}>
                          {Math.round((weeklyStats.daysActive / 7) * 100)}%
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">التقييم العام</span>
                        <Badge 
                          variant="outline"
                          className={weeklyStats.daysActive >= 5 ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300" : ""}
                        >
                          {weeklyStats.daysActive >= 5 ? "ممتاز" : weeklyStats.daysActive >= 3 ? "جيد" : "يحتاج تحسين"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t text-center">
                    <p className="text-sm text-muted-foreground mb-3">
                      يمكن إرسال هذا التقرير لولي الأمر
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setReportDialogOpen(true)}
                      data-testid="button-send-report"
                    >
                      <Share2 className="ml-2 h-4 w-4" />
                      مشاركة التقرير
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}

      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="sm:max-w-[500px]" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              التقرير الأسبوعي
            </DialogTitle>
            <DialogDescription>
              شارك هذا التقرير مع ولي الأمر لمتابعة تقدم الحفظ
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-muted text-sm leading-relaxed whitespace-pre-line max-h-[300px] overflow-y-auto">
              {generateReportText()}
            </div>
            
            <div className="flex gap-2 justify-center flex-wrap">
              <Button
                onClick={copyReportToClipboard}
                variant="outline"
                className="flex items-center gap-2"
                data-testid="button-copy-report"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-green-600" />
                    تم النسخ
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    نسخ التقرير
                  </>
                )}
              </Button>
              <Button
                onClick={shareReport}
                className="flex items-center gap-2"
                data-testid="button-share-report"
              >
                <Share2 className="h-4 w-4" />
                مشاركة
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </StudentLayout>
  );
}
