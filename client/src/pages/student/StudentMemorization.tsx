import { useQuery } from '@tanstack/react-query';
import { StudentLayout } from './StudentLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { LoadingCards } from '@/components/shared/LoadingState';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { BookOpen, TrendingUp, Target, Award, AlertTriangle } from 'lucide-react';

export function StudentMemorizationPage() {
  const { data: progress, isLoading: progressLoading } = useQuery<any>({
    queryKey: ['/api/student/progress'],
  });

  const { data: errors = [], isLoading: errorsLoading } = useQuery<any[]>({
    queryKey: ['/api/student/errors'],
  });

  const unresolvedErrors = errors.filter((e: any) => !e.isResolved);
  const isLoading = progressLoading || errorsLoading;

  const surahProgress = [
    { name: 'الفاتحة', progress: 100, verses: 7 },
    { name: 'البقرة', progress: 45, verses: 286 },
    { name: 'آل عمران', progress: 20, verses: 200 },
    { name: 'النساء', progress: 0, verses: 176 },
  ];

  return (
    <StudentLayout>
      <PageHeader 
        title="مستوى الحفظ"
        description="تتبع تقدمك في حفظ القرآن الكريم"
        actions={
          <Button asChild>
            <Link href="/quran">
              <BookOpen className="ml-2 h-4 w-4" />
              فتح المصحف
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <LoadingCards count={4} />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <StatsCard
              title="الأجزاء المحفوظة"
              value={progress?.memorizedParts || 0}
              subtitle="من 30 جزء"
              icon={<BookOpen className="h-4 w-4" />}
            />
            <StatsCard
              title="السور المكتملة"
              value={progress?.completedSurahs || 0}
              subtitle="من 114 سورة"
              icon={<Award className="h-4 w-4" />}
            />
            <StatsCard
              title="نسبة الإنجاز"
              value={`${progress?.overallProgress || 0}%`}
              subtitle="من الخطة"
              icon={<TrendingUp className="h-4 w-4" />}
            />
            <StatsCard
              title="الأخطاء المعلقة"
              value={unresolvedErrors.length}
              subtitle="تحتاج مراجعة"
              icon={<AlertTriangle className="h-4 w-4" />}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>التقدم العام</CardTitle>
                <CardDescription>نسبة إتمام الحفظ الكلية</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">الإنجاز الكلي</span>
                    <span className="font-medium">{progress?.overallProgress || 0}%</span>
                  </div>
                  <Progress value={progress?.overallProgress || 0} className="h-3" />
                </div>

                <div className="space-y-4">
                  {surahProgress.map((surah, index) => (
                    <div key={index}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{surah.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {surah.progress}% ({Math.round(surah.verses * surah.progress / 100)}/{surah.verses} آية)
                        </span>
                      </div>
                      <Progress value={surah.progress} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>السور المحفوظة</CardTitle>
                <CardDescription>السور التي أتممت حفظها</CardDescription>
              </CardHeader>
              <CardContent>
                {progress?.memorizedSurahs && progress.memorizedSurahs.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {progress.memorizedSurahs.map((surah: string, index: number) => (
                      <Badge key={index} variant="secondary" className="py-1.5 px-3">
                        {surah}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    لم تقم بحفظ أي سورة بعد
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {unresolvedErrors.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  الأخطاء التي تحتاج مراجعة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {unresolvedErrors.slice(0, 5).map((error: any, index: number) => (
                    <div 
                      key={index}
                      className="p-4 rounded-lg bg-destructive/5 border border-destructive/20"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium">
                            سورة {error.surah} - آية {error.ayahNumber}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {error.errorDescription}
                          </p>
                        </div>
                        <Badge variant="destructive">غير محلول</Badge>
                      </div>
                    </div>
                  ))}
                  {unresolvedErrors.length > 5 && (
                    <p className="text-sm text-muted-foreground text-center">
                      و {unresolvedErrors.length - 5} أخطاء أخرى
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </StudentLayout>
  );
}