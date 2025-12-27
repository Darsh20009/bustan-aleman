import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Calendar, Award } from 'lucide-react';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date;
  daysActive: number[];
  totalDaysActive: number;
}

export function StreakTracker({ streak }: { streak: StreakData }) {
  const today = new Date();
  const lastActive = new Date(streak.lastActiveDate);
  const daysSinceLastActive = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
  const isActiveToday = daysSinceLastActive === 0;
  const streakAtRisk = daysSinceLastActive === 1;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Current Streak */}
      <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">السلسلة الحالية</CardTitle>
          <Flame className={`w-5 h-5 ${isActiveToday ? 'text-red-500 animate-pulse' : 'text-orange-400'}`} />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-orange-600">{streak.currentStreak}</div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {isActiveToday ? '✓ اليوم' : streakAtRisk ? '⚠️ آخر فرصة' : `${daysSinceLastActive} أيام منذ آخر نشاط`}
          </p>
        </CardContent>
      </Card>

      {/* Longest Streak */}
      <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">أطول سلسلة</CardTitle>
          <Award className="w-5 h-5 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-yellow-600">{streak.longestStreak}</div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">يوم</p>
        </CardContent>
      </Card>

      {/* Total Days Active */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">إجمالي الأيام النشطة</CardTitle>
          <Calendar className="w-5 h-5 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">{streak.totalDaysActive}</div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">يوم</p>
        </CardContent>
      </Card>

      {/* Streak Status Banner */}
      <div className="md:col-span-3">
        <div className={`p-4 rounded-lg border-2 ${
          isActiveToday 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-300' 
            : streakAtRisk
            ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300'
            : 'bg-gray-50 dark:bg-gray-900/20 border-gray-300'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`text-2xl ${isActiveToday ? '🔥' : streakAtRisk ? '⚠️' : '📅'}`} />
            <div>
              <p className="font-semibold text-sm">
                {isActiveToday 
                  ? 'رائع! لقد كنت نشطاً اليوم' 
                  : streakAtRisk
                  ? 'سلسلتك في خطر - تحقق من الدروس اليوم!'
                  : 'لا تفوت اليوم - حافظ على سلسلتك!'}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {isActiveToday
                  ? 'استمر على نفس الوتيرة للحفاظ على سلسلتك'
                  : streakAtRisk
                  ? `استكمل نشاطك اليوم قبل منتصف الليل`
                  : `بدأت سلسلة جديدة، حافظ على الزخم`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}