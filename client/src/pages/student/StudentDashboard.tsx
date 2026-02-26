export { WeeklyReminders } from '@/components/WeeklyReminders';
export type { Reminder } from '@/components/WeeklyReminders';

import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { StudentLayout } from './StudentLayout';
import { useAuth } from '@/hooks/useAuth';
import { StatsCard } from '@/components/shared/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Calendar,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  TrendingUp,
  Mic,
  Video,
  Clock,
  Star,
  ArrowLeft,
  AlertCircle,
  BookMarked,
  Award,
} from 'lucide-react';

const SURAH_NAMES: Record<number, string> = {
  1: 'الفاتحة', 2: 'البقرة', 3: 'آل عمران', 4: 'النساء', 5: 'المائدة',
  6: 'الأنعام', 7: 'الأعراف', 8: 'الأنفال', 9: 'التوبة', 10: 'يونس',
  36: 'يس', 55: 'الرحمن', 56: 'الواقعة', 67: 'الملك', 78: 'النبأ',
  112: 'الإخلاص', 113: 'الفلق', 114: 'الناس',
};

function getSurahName(num: number): string {
  return SURAH_NAMES[num] || `سورة ${num}`;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'صباح الخير';
  if (hour < 17) return 'مساء الخير';
  return 'مساء النور';
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ar-SA', { weekday: 'long', month: 'long', day: 'numeric' });
  } catch {
    return String(dateStr);
  }
}

function getLevelLabel(level: string | null | undefined): string {
  const map: Record<string, string> = {
    beginner: 'مبتدئ', intermediate: 'متوسط', advanced: 'متقدم',
  };
  return map[level || ''] || level || 'غير محدد';
}

function getLevelColor(level: string | null | undefined): string {
  const map: Record<string, string> = {
    beginner: 'bg-blue-100 text-blue-700',
    intermediate: 'bg-amber-100 text-amber-700',
    advanced: 'bg-emerald-100 text-emerald-700',
  };
  return map[level || ''] || 'bg-gray-100 text-gray-700';
}

function getHomeworkStatusInfo(hw: any): { label: string; color: string } {
  const now = new Date();
  const due = hw.dueDate ? new Date(hw.dueDate) : null;
  if (hw.status === 'graded') return { label: 'مُقيَّم', color: 'bg-blue-100 text-blue-700' };
  if (hw.status === 'submitted') return { label: 'تم التسليم', color: 'bg-emerald-100 text-emerald-700' };
  if (due && due < now) return { label: 'متأخر', color: 'bg-red-100 text-red-700' };
  return { label: 'قيد الانتظار', color: 'bg-amber-100 text-amber-700' };
}

function getHomeworkTypeLabel(type: string): string {
  const map: Record<string, string> = {
    memorization: 'حفظ', review: 'مراجعة', recitation: 'تلاوة', written: 'مكتوب', quiz: 'اختبار',
  };
  return map[type] || type;
}

const QUOTES = [
  { text: 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ', source: 'صحيح البخاري' },
  { text: 'إِنَّ هَذَا الْقُرْآنَ مَأْدُبَةُ اللَّهِ فَاقْبَلُوا مَأْدُبَتَهُ مَا اسْتَطَعْتُمْ', source: 'المستدرك' },
  { text: 'اقْرَأُوا الْقُرْآنَ فَإِنَّهُ يَأْتِي يَوْمَ الْقِيَامَةِ شَفِيعًا لِأَصْحَابِهِ', source: 'صحيح مسلم' },
  { text: 'مَنْ قَرَأَ حَرْفًا مِنْ كِتَابِ اللَّهِ فَلَهُ بِهِ حَسَنَةٌ وَالْحَسَنَةُ بِعَشْرِ أَمْثَالِهَا', source: 'سنن الترمذي' },
];

function MotivationalQuote() {
  const q = QUOTES[new Date().getDay() % QUOTES.length];
  return (
    <Card className="border-0 bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg">
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <Star className="h-5 w-5 mt-1 text-yellow-300 shrink-0" />
          <div>
            <p className="text-base font-semibold leading-relaxed font-arabic">{q.text}</p>
            <p className="text-emerald-200 text-sm mt-1">— {q.source}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-60 rounded-xl lg:col-span-2" />
        <Skeleton className="h-60 rounded-xl" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-52 rounded-xl" />
        <Skeleton className="h-52 rounded-xl" />
      </div>
    </div>
  );
}

export function StudentDashboardPage() {
  const { user } = useAuth();

  const { data: dashboard, isLoading } = useQuery<any>({
    queryKey: ['/api/student/dashboard'],
  });

  const { data: announcements = [] } = useQuery<any[]>({
    queryKey: ['/api/announcements'],
  });

  if (isLoading) {
    return (
      <StudentLayout>
        <div className="p-6"><SkeletonDashboard /></div>
      </StudentLayout>
    );
  }

  const sessions = dashboard?.sessions || {};
  const homework = dashboard?.homework || {};
  const quran = dashboard?.quran || {};
  const student = dashboard?.student || {};
  const subscription = dashboard?.subscription || {};

  const memorizedPercent = Math.min(Math.round(((quran.memorizedSurahs || 0) / 114) * 100), 100);
  const recentAnnouncements = (announcements as any[]).slice(0, 3);

  return (
    <StudentLayout>
      <div className="p-4 md:p-6 space-y-6" dir="rtl">

        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-arabic">
              {getGreeting()}، {user?.firstName || student?.name || 'طالب'} 👋
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
              {new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {student?.level && (
              <Badge className={`text-sm px-3 py-1 ${getLevelColor(student.level)}`} data-testid="badge-level">
                {getLevelLabel(student.level)}
              </Badge>
            )}
            {subscription?.status === 'active' ? (
              <Badge className="bg-emerald-100 text-emerald-700 text-sm px-3 py-1" data-testid="badge-subscription-active">
                <CheckCircle2 className="h-3.5 w-3.5 ml-1" /> اشتراك نشط
              </Badge>
            ) : (
              <Badge className="bg-red-100 text-red-700 text-sm px-3 py-1" data-testid="badge-subscription-inactive">
                <AlertCircle className="h-3.5 w-3.5 ml-1" /> غير مشترك
              </Badge>
            )}
          </div>
        </div>

        {/* Motivational Quote */}
        <MotivationalQuote />

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="الحصص القادمة"
            value={sessions.upcoming || 0}
            subtitle={`من أصل ${sessions.total || 0} حصة`}
            icon={<Calendar className="h-4 w-4" />}
          />
          <StatsCard
            title="الواجبات المعلقة"
            value={homework.pending || 0}
            subtitle={`تم إنجاز ${homework.completed || 0}`}
            icon={<ClipboardList className="h-4 w-4" />}
          />
          <StatsCard
            title="نسبة الحضور"
            value={`${sessions.attendanceRate || 0}%`}
            subtitle="من إجمالي الحصص"
            icon={<TrendingUp className="h-4 w-4" />}
          />
          <StatsCard
            title="السور المحفوظة"
            value={quran.memorizedSurahs || 0}
            subtitle="من 114 سورة"
            icon={<BookOpen className="h-4 w-4" />}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-4 lg:grid-cols-3">

          {/* Upcoming Sessions */}
          <Card className="lg:col-span-2 border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-arabic">
                <Video className="h-5 w-5 text-emerald-600" />
                الحصص القادمة
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sessions.recentUpcoming && sessions.recentUpcoming.length > 0 ? (
                <div className="space-y-3">
                  {(sessions.recentUpcoming as any[]).map((session: any, i: number) => (
                    <div
                      key={session.id || i}
                      data-testid={`session-card-${i}`}
                      className={`flex items-center justify-between p-3 rounded-lg border ${i === 0
                        ? 'border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-800'
                        : 'border-gray-100 bg-gray-50 dark:bg-gray-800/30 dark:border-gray-700'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${i === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                          <Calendar className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">
                            {session.sheikhName || 'حصة دراسية'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(session.sessionDate || session.date)}
                            {session.startTime ? ` — ${session.startTime}` : ''}
                          </p>
                        </div>
                      </div>
                      {i === 0 && session.isEnabled && session.roomToken ? (
                        <Link href={`/session/${session.roomToken}`}>
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-7" data-testid="button-join-session">
                            انضم الآن
                          </Button>
                        </Link>
                      ) : i === 0 ? (
                        <Badge className="bg-amber-100 text-amber-700 text-xs">
                          <Clock className="h-3 w-3 ml-1" /> انتظار
                        </Badge>
                      ) : null}
                    </div>
                  ))}
                  <Link href="/student/sessions">
                    <Button variant="outline" size="sm" className="w-full mt-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50 font-arabic" data-testid="button-all-sessions">
                      عرض جميع الحصص
                      <ArrowLeft className="h-4 w-4 mr-2" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Calendar className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">لا توجد حصص قادمة</p>
                  <p className="text-xs mt-1">سيتم إضافة حصصك من قِبل المعلم</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quran Progress */}
          <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-arabic">
                <BookMarked className="h-5 w-5 text-emerald-600" />
                تقدم القرآن
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">السور المحفوظة</span>
                  <span className="font-bold text-emerald-600">{quran.memorizedSurahs || 0} / 114</span>
                </div>
                <Progress value={memorizedPercent} className="h-2.5" />
                <p className="text-xs text-gray-400 mt-1">{memorizedPercent}% من القرآن الكريم</p>
              </div>

              {quran.lastSurah > 0 && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-100 dark:border-amber-800">
                  <p className="text-xs text-amber-700 dark:text-amber-400 font-medium mb-1">آخر موضع للقراءة</p>
                  <p className="text-sm font-bold text-amber-800 dark:text-amber-300 font-arabic">
                    {getSurahName(quran.lastSurah)} — الآية {quran.lastAyah}
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-2 pt-1">
                <Link href="/quran">
                  <Button variant="outline" size="sm" className="w-full text-emerald-600 border-emerald-200 hover:bg-emerald-50 font-arabic text-xs" data-testid="button-open-quran">
                    <BookOpen className="h-3.5 w-3.5 ml-2" />
                    المصحف الإلكتروني
                  </Button>
                </Link>
                <Link href="/quran/recitation">
                  <Button variant="outline" size="sm" className="w-full text-blue-600 border-blue-200 hover:bg-blue-50 font-arabic text-xs" data-testid="button-open-recitation">
                    <Mic className="h-3.5 w-3.5 ml-2" />
                    تسميع القرآن
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Homework & Announcements */}
        <div className="grid gap-4 lg:grid-cols-2">

          {/* Recent Homework */}
          <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base font-arabic">
                  <ClipboardList className="h-5 w-5 text-emerald-600" />
                  الواجبات الأخيرة
                </CardTitle>
                <Link href="/student/homework">
                  <Button variant="ghost" size="sm" className="text-emerald-600 text-xs h-7" data-testid="button-view-homework">
                    عرض الكل
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {homework.recent && (homework.recent as any[]).length > 0 ? (
                <div className="space-y-2">
                  {(homework.recent as any[]).map((hw: any, i: number) => {
                    const status = getHomeworkStatusInfo(hw);
                    return (
                      <div key={hw.id || i} data-testid={`homework-item-${i}`} className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/20 rounded-full">
                            <ClipboardList className="h-3.5 w-3.5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[160px]">
                              {hw.title || hw.titleAr || `واجب ${getHomeworkTypeLabel(hw.type || '')}`}
                            </p>
                            {hw.dueDate && (
                              <p className="text-xs text-gray-400">
                                الموعد: {new Date(hw.dueDate).toLocaleDateString('ar-SA')}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge className={`text-xs shrink-0 ${status.color}`}>{status.label}</Badge>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <CheckCircle2 className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">لا توجد واجبات حالياً</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Announcements */}
          <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base font-arabic">
                <Star className="h-5 w-5 text-amber-500" />
                الإعلانات
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentAnnouncements.length > 0 ? (
                <div className="space-y-2">
                  {recentAnnouncements.map((ann: any, i: number) => (
                    <div key={ann.id || i} data-testid={`announcement-${i}`} className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-100 dark:border-amber-800">
                      <p className="text-sm font-semibold text-amber-800 dark:text-amber-300 font-arabic">
                        {ann.title || ann.titleAr}
                      </p>
                      {ann.content && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 line-clamp-2">{ann.content}</p>
                      )}
                      {ann.createdAt && (
                        <p className="text-xs text-amber-400 mt-1.5">{new Date(ann.createdAt).toLocaleDateString('ar-SA')}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Star className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">لا توجد إعلانات حالياً</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-arabic">روابط سريعة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {([
                { icon: BookOpen, label: 'المصحف', href: '/quran', color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100', testId: 'quick-quran' },
                { icon: Mic, label: 'التسميع', href: '/quran/recitation', color: 'text-blue-600 bg-blue-50 hover:bg-blue-100', testId: 'quick-recitation' },
                { icon: ClipboardList, label: 'الواجبات', href: '/student/homework', color: 'text-amber-600 bg-amber-50 hover:bg-amber-100', testId: 'quick-homework' },
                { icon: TrendingUp, label: 'متابعة الحفظ', href: '/student/quran-tracking', color: 'text-purple-600 bg-purple-50 hover:bg-purple-100', testId: 'quick-tracking' },
                { icon: Calendar, label: 'حصصي', href: '/student/sessions', color: 'text-rose-600 bg-rose-50 hover:bg-rose-100', testId: 'quick-sessions' },
                { icon: CheckCircle2, label: 'الحضور', href: '/student/attendance', color: 'text-teal-600 bg-teal-50 hover:bg-teal-100', testId: 'quick-attendance' },
                { icon: Award, label: 'الاشتراك', href: '/student/subscription', color: 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100', testId: 'quick-subscription' },
                { icon: BookMarked, label: 'تواصل', href: '/student/contact', color: 'text-orange-600 bg-orange-50 hover:bg-orange-100', testId: 'quick-contact' },
              ] as const).map(({ icon: Icon, label, href, color, testId }) => (
                <Link key={href} href={href}>
                  <button
                    data-testid={`button-${testId}`}
                    className={`w-full flex flex-col items-center gap-2 p-3 rounded-xl border border-transparent transition-all ${color} hover:shadow-sm`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs font-medium font-arabic">{label}</span>
                  </button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </StudentLayout>
  );
}
