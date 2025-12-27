import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Trophy, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  avatar?: string;
  score: number;
  streakDays: number;
  memorizedAyahs: number;
}

export function Leaderboard({ entries = [] }: { entries?: LeaderboardEntry[] }) {
  // Sample data if none provided
  const mockData = entries.length === 0 ? [
    { rank: 1, userId: '1', userName: 'فاطمة محمد', score: 2850, streakDays: 45, memorizedAyahs: 230 },
    { rank: 2, userId: '2', userName: 'عمر علي', score: 2620, streakDays: 38, memorizedAyahs: 190 },
    { rank: 3, userId: '3', userName: 'ليلى حسن', score: 2410, streakDays: 32, memorizedAyahs: 175 },
    { rank: 4, userId: '4', userName: 'محمود خالد', score: 2180, streakDays: 28, memorizedAyahs: 160 },
    { rank: 5, userId: '5', userName: 'نور أحمد', score: 2040, streakDays: 25, memorizedAyahs: 145 },
  ] : entries;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Trophy className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Trophy className="w-5 h-5 text-orange-600" />;
      default:
        return <Star className="w-5 h-5 text-gray-400" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300';
      case 2:
        return 'bg-gray-50 dark:bg-gray-900/20 border-gray-300';
      case 3:
        return 'bg-orange-50 dark:bg-orange-900/20 border-orange-300';
      default:
        return 'border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          لوحة الصدارة
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          أفضل الطلاب الملتزمين بالحفظ والمراجعة
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {mockData.map((entry) => (
            <div
              key={entry.userId}
              className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${getRankColor(entry.rank)}`}
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="flex items-center justify-center w-8 h-8">
                  {getRankIcon(entry.rank)}
                </div>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={entry.avatar} />
                    <AvatarFallback>{entry.userName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold">{entry.userName}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      🔥 {entry.streakDays} يوم
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-gray-600 dark:text-gray-400">محفوظ</p>
                  <p className="text-sm font-semibold">{entry.memorizedAyahs}</p>
                </div>
                <Badge variant="default" className="bg-blue-600">
                  {entry.score}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200">
          <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
            💡 نصيحة: قم بالدراسة المنتظمة والمراجعة لتصعد في لوحة الصدارة
          </p>
        </div>
      </CardContent>
    </Card>
  );
}