import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Zap, Target, Calendar, BookOpen } from 'lucide-react';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: 'trophy' | 'star' | 'zap' | 'target' | 'calendar' | 'book';
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

const iconMap = {
  trophy: Trophy,
  star: Star,
  zap: Zap,
  target: Target,
  calendar: Calendar,
  book: BookOpen,
};

const levelColors = {
  bronze: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-300' },
  silver: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-300' },
  gold: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
  platinum: { bg: 'bg-cyan-100', text: 'text-cyan-700', border: 'border-cyan-300' },
};

export function AchievementBadge({ achievement, isUnlocked }: { achievement: Achievement; isUnlocked: boolean }) {
  const Icon = iconMap[achievement.icon];
  const colors = levelColors[achievement.level];

  return (
    <Card className={`p-4 text-center transition-all ${isUnlocked ? colors.bg + ' ' + colors.border : 'bg-gray-100 border-gray-300 opacity-50'} border-2`}>
      <div className="flex flex-col items-center gap-2">
        <div className={`p-3 rounded-lg ${isUnlocked ? colors.bg : 'bg-gray-200'}`}>
          <Icon className={`w-6 h-6 ${isUnlocked ? colors.text : 'text-gray-400'}`} />
        </div>
        <h3 className="font-bold text-sm">{achievement.name}</h3>
        <p className="text-xs text-gray-600 dark:text-gray-400">{achievement.description}</p>
        
        {achievement.progress !== undefined && achievement.maxProgress && (
          <div className="w-full mt-2">
            <div className="bg-gray-300 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full ${isUnlocked ? colors.bg : 'bg-gray-400'}`}
                style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
              />
            </div>
            <p className="text-xs mt-1 text-gray-600">
              {achievement.progress}/{achievement.maxProgress}
            </p>
          </div>
        )}

        {isUnlocked && (
          <Badge variant="default" className="mt-2 text-xs">
            تم فتح القفل
          </Badge>
        )}
      </div>
    </Card>
  );
}

export function AchievementGrid({ achievements }: { achievements: Achievement[] }) {
  const unlockedCount = achievements.filter(a => a.unlockedAt).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">الإنجازات</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            تم فتح {unlockedCount} من {achievements.length} إنجاز
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-yellow-600">{unlockedCount * 10}</div>
          <p className="text-xs text-gray-600">نقاط</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {achievements.map((achievement) => (
          <AchievementBadge
            key={achievement.id}
            achievement={achievement}
            isUnlocked={!!achievement.unlockedAt}
          />
        ))}
      </div>
    </div>
  );
}