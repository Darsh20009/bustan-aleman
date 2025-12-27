import { StudentLayout } from './StudentLayout';
import { AchievementGrid, Achievement } from '@/components/AchievementBadge';
import { StreakTracker, StreakData } from '@/components/StreakTracker';
import { ProgressChart, ProgressData } from '@/components/ProgressChart';
import { Leaderboard } from '@/components/Leaderboard';
import { LearningGoals } from '@/components/LearningGoals';
import { WeeklyReminders } from '@/components/WeeklyReminders';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, Flame, Trophy, Target, Bell } from 'lucide-react';

export function AnalyticsDashboardPage() {
  const streakData: StreakData = {
    currentStreak: 12,
    longestStreak: 28,
    lastActiveDate: new Date(),
    daysActive: [],
    totalDaysActive: 45,
  };

  const progressData: ProgressData = {
    week: ['الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'],
    daily: [],
    memorized: 145,
    inReview: 82,
    notStarted: 220,
  };

  const achievements: Achievement[] = [
    {
      id: '1',
      name: 'البداية المميزة',
      description: 'أكمل أول 5 آيات',
      icon: 'star',
      level: 'bronze',
      unlockedAt: new Date(),
    },
    {
      id: '2',
      name: 'الحافظ المجد',
      description: 'حفظ 100 آية',
      icon: 'trophy',
      level: 'silver',
      unlockedAt: new Date(),
    },
    {
      id: '3',
      name: 'السلسلة الذهبية',
      description: 'إكمال 30 يوم متتالي',
      icon: 'zap',
      level: 'gold',
      progress: 12,
      maxProgress: 30,
    },
    {
      id: '4',
      name: 'حافظ المشاتي',
      description: 'حفظ القرآن الكريم كاملاً',
      icon: 'book',
      level: 'platinum',
      progress: 145,
      maxProgress: 604,
    },
  ];

  return (
    <StudentLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">لوحة التحليلات المتقدمة</h1>
        <p className="text-gray-600 dark:text-gray-400">تابع تقدمك وإنجازاتك في رحلة حفظ القرآن</p>
      </div>

      <Tabs defaultValue="streak" className="w-full space-y-6">
        <TabsList className="grid w-full grid-cols-5 gap-1">
          <TabsTrigger value="streak" className="flex items-center gap-2" data-testid="tab-streak">
            <Flame className="h-4 w-4" />
            <span className="hidden sm:inline">السلسلة</span>
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2" data-testid="tab-achievements">
            <Trophy className="h-4 w-4" />
            <span className="hidden sm:inline">إنجازات</span>
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2" data-testid="tab-progress">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">تقدم</span>
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-2" data-testid="tab-goals">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">أهداف</span>
          </TabsTrigger>
          <TabsTrigger value="reminders" className="flex items-center gap-2" data-testid="tab-reminders">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">تذكيرات</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="streak">
          <StreakTracker streak={streakData} />
        </TabsContent>

        <TabsContent value="achievements">
          <AchievementGrid achievements={achievements} />
        </TabsContent>

        <TabsContent value="progress">
          <ProgressChart data={progressData} />
        </TabsContent>

        <TabsContent value="goals">
          <div className="space-y-6">
            <LearningGoals />
            <Leaderboard />
          </div>
        </TabsContent>

        <TabsContent value="reminders">
          <WeeklyReminders />
        </TabsContent>
      </Tabs>
    </StudentLayout>
  );
}