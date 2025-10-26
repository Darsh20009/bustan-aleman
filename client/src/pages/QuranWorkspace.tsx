import { useState } from 'react';
import { WorkspaceLayout } from '@/components/WorkspaceLayout';
import { MushafQuranReader } from '@/components/MushafQuranReader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { BookMarked, TrendingUp, Clock, Award } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';

export default function QuranWorkspace() {
  const { user } = useAuth();
  const studentId = (user as any)?.id;

  const { data: stats } = useQuery({
    queryKey: ['/api/quran/stats', studentId],
    enabled: !!studentId,
  });

  const { data: markers } = useQuery({
    queryKey: ['/api/quran/markers', studentId],
    enabled: !!studentId,
  });

  // Right Panel - Statistics & Progress
  const rightPanel = (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-lg font-bold mb-4 text-islamic-green dark:text-green-400">
          إحصائياتك
        </h3>
        
        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <BookMarked className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="font-medium">صفحات مقروءة</span>
                </div>
                <Badge variant="secondary">{stats?.pagesRead || 0}</Badge>
              </div>
              <Progress value={(stats?.pagesRead || 0) / 604 * 100} className="h-2" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium">آيات محفوظة</span>
                </div>
                <Badge variant="secondary">{stats?.memorizedAyahs || 0}</Badge>
              </div>
              <Progress value={((stats?.memorizedAyahs || 0) / 6236) * 100} className="h-2" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  <span className="font-medium">وقت القراءة</span>
                </div>
                <Badge variant="secondary">{stats?.minutesSpent || 0} دقيقة</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <span className="font-medium">مستوى الإتقان</span>
                </div>
                <Badge variant="secondary">{stats?.masteryLevel || 0}%</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Bookmarks */}
      {markers && markers.length > 0 && (
        <div>
          <h3 className="text-lg font-bold mb-4 text-islamic-green dark:text-green-400">
            علاماتك الأخيرة
          </h3>
          <div className="space-y-2">
            {markers.slice(0, 5).map((marker: any) => (
              <Card key={marker.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">سورة {marker.surahNumber} - آية {marker.ayahNumber}</p>
                      <p className="text-sm text-muted-foreground">{marker.markerType}</p>
                    </div>
                    <Badge 
                      style={{ backgroundColor: marker.markerColor }}
                      className="text-white"
                    >
                      {marker.markerType === 'memorization' ? 'حفظ' : 
                       marker.markerType === 'review' ? 'مراجعة' : 
                       marker.markerType === 'bookmark' ? 'علامة' : 'مكتمل'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <WorkspaceLayout rightPanel={rightPanel}>
      <MushafQuranReader />
    </WorkspaceLayout>
  );
}
