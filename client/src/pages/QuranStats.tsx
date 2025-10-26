import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Calendar, Book, Clock, TrendingUp, Award } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { QuranReadingStats } from "@shared/schema";

export default function QuranStats() {
  const [readingTime, setReadingTime] = useState(0);
  const [isReading, setIsReading] = useState(false);

  const { data: todayStats, isLoading: loadingToday } = useQuery<QuranReadingStats | null>({
    queryKey: ['/api/quran/stats/today'],
  });

  const { data: weekStats, isLoading: loadingWeek } = useQuery<QuranReadingStats[]>({
    queryKey: ['/api/quran/stats', { period: 'week' }],
    queryFn: async () => {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const response = await fetch(`/api/quran/stats?startDate=${startDate}&endDate=${endDate}`);
      return response.json();
    },
  });

  const updateStatsMutation = useMutation({
    mutationFn: async (data: {
      readingDate: string;
      ayahsRead: number;
      pagesRead: number;
      minutesSpent: number;
      surahsCompleted: string;
    }) => {
      return await apiRequest('/api/quran/stats', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quran/stats/today'] });
      queryClient.invalidateQueries({ queryKey: ['/api/quran/stats'] });
    },
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isReading) {
      interval = setInterval(() => {
        setReadingTime(prev => prev + 1);
      }, 60000);
    }
    return () => clearInterval(interval);
  }, [isReading]);

  const handleStartReading = () => {
    setIsReading(true);
  };

  const handleStopReading = () => {
    setIsReading(false);
    if (readingTime > 0) {
      const today = new Date().toISOString().split('T')[0];
      updateStatsMutation.mutate({
        readingDate: today,
        ayahsRead: (todayStats?.ayahsRead || 0) + 1,
        pagesRead: (todayStats?.pagesRead || 0) + 1,
        minutesSpent: (todayStats?.minutesSpent || 0) + readingTime,
        surahsCompleted: todayStats?.surahsCompleted || '[]',
      });
      setReadingTime(0);
    }
  };

  const getTotalStats = () => {
    if (!weekStats) return { totalAyahs: 0, totalPages: 0, totalMinutes: 0 };
    return weekStats.reduce((acc, stat) => ({
      totalAyahs: acc.totalAyahs + (stat.ayahsRead || 0),
      totalPages: acc.totalPages + (stat.pagesRead || 0),
      totalMinutes: acc.totalMinutes + (stat.minutesSpent || 0),
    }), { totalAyahs: 0, totalPages: 0, totalMinutes: 0 });
  };

  const weekTotals = getTotalStats();
  const dailyAverage = weekStats ? Math.round(weekTotals.totalMinutes / weekStats.length) : 0;
  const goalMinutes = 30;
  const todayProgress = todayStats ? Math.min(((todayStats.minutesSpent || 0) / goalMinutes) * 100, 100) : 0;

  if (loadingToday || loadingWeek) {
    return (
      <div className="container max-w-6xl mx-auto p-4 md:p-8" dir="rtl">
        <Skeleton className="h-12 w-64 mb-8 bg-emerald-100 dark:bg-emerald-900" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 bg-emerald-100 dark:bg-emerald-900" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto p-4 md:p-8" dir="rtl" data-testid="quran-stats-page">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-emerald-700 dark:text-emerald-300 mb-2 flex items-center gap-3">
          <BarChart className="w-8 h-8" />
          إحصائيات القراءة اليومية
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          تابع تقدمك في قراءة القرآن الكريم
        </p>
      </div>

      <div className="mb-8 flex gap-4">
        {!isReading ? (
          <Button
            onClick={handleStartReading}
            className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white"
            data-testid="button-start-reading"
          >
            <Clock className="w-4 h-4 ml-2" />
            بدء القراءة
          </Button>
        ) : (
          <Button
            onClick={handleStopReading}
            className="bg-orange-600 hover:bg-orange-700 text-white"
            data-testid="button-stop-reading"
          >
            <Clock className="w-4 h-4 ml-2" />
            إيقاف القراءة ({readingTime} دقيقة)
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900 dark:to-gray-800 border-2 border-emerald-200 dark:border-emerald-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-300">
              قراءة اليوم
            </h3>
            <Calendar className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">الهدف اليومي</p>
              <Progress value={todayProgress} className="h-2 mb-2" />
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {todayStats?.minutesSpent || 0} / {goalMinutes} دقيقة
              </p>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">آيات مقروءة:</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-300" data-testid="text-ayahs-today">
                {todayStats?.ayahsRead || 0}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">صفحات مقروءة:</span>
              <span className="font-bold text-emerald-700 dark:text-emerald-300" data-testid="text-pages-today">
                {todayStats?.pagesRead || 0}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900 dark:to-gray-800 border-2 border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300">
              هذا الأسبوع
            </h3>
            <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">مجموع الآيات:</span>
              <span className="font-bold text-blue-700 dark:text-blue-300" data-testid="text-ayahs-week">
                {weekTotals.totalAyahs}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">مجموع الصفحات:</span>
              <span className="font-bold text-blue-700 dark:text-blue-300" data-testid="text-pages-week">
                {weekTotals.totalPages}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">مجموع الدقائق:</span>
              <span className="font-bold text-blue-700 dark:text-blue-300" data-testid="text-minutes-week">
                {weekTotals.totalMinutes}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-50 to-white dark:from-orange-900 dark:to-gray-800 border-2 border-orange-200 dark:border-orange-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-orange-700 dark:text-orange-300">
              المعدل اليومي
            </h3>
            <Award className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">معدل القراءة:</span>
              <span className="font-bold text-orange-700 dark:text-orange-300" data-testid="text-daily-average">
                {dailyAverage} دقيقة/يوم
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">أيام القراءة:</span>
              <span className="font-bold text-orange-700 dark:text-orange-300">
                {weekStats?.length || 0} أيام
              </span>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-white dark:bg-gray-800 border-2 border-emerald-200 dark:border-emerald-700">
        <h3 className="text-xl font-semibold text-emerald-700 dark:text-emerald-300 mb-6 flex items-center gap-2">
          <Book className="w-5 h-5" />
          سجل القراءة الأسبوعي
        </h3>
        <div className="space-y-3">
          {weekStats && weekStats.length > 0 ? (
            weekStats.map((stat, index) => (
              <div 
                key={stat.id} 
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                data-testid={`stat-day-${index}`}
              >
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">
                    {new Date(stat.readingDate).toLocaleDateString('ar-SA', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.ayahsRead} آيات • {stat.pagesRead} صفحات • {stat.minutesSpent} دقيقة
                  </p>
                </div>
                <div className="text-left">
                  <div className="w-24 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full"
                      style={{ width: `${Math.min(((stat.minutesSpent || 0) / goalMinutes) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              لا توجد إحصائيات متاحة لهذا الأسبوع
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
