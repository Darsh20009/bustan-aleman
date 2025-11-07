import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  Brain, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  TrendingUp,
  Clock
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ReviewItem {
  id: string;
  surahNumber: number;
  surahName: string;
  fromAyah: number;
  toAyah: number;
  lastReviewDate: string | null;
  nextReviewDate: string;
  reviewCount: number;
  difficultyLevel: number;
  status: 'due' | 'soon' | 'later';
}

export default function QuranReviewSystem() {
  const { user } = useAuth();
  const { toast } = useToast();
  const studentId = user?.studentId || user?.id;

  const [selectedReview, setSelectedReview] = useState<ReviewItem | null>(null);
  const [reviewResult, setReviewResult] = useState<'easy' | 'medium' | 'hard' | null>(null);

  // Fetch review items using spaced repetition algorithm
  const { data: reviewItems, isLoading } = useQuery<ReviewItem[]>({
    queryKey: [`/api/quran/review-items/${studentId}`],
    enabled: !!studentId,
  });

  const reviewMutation = useMutation({
    mutationFn: async (data: { 
      reviewId: string; 
      difficulty: 'easy' | 'medium' | 'hard' 
    }) => {
      return apiRequest('POST', '/api/quran/complete-review', {
        reviewId: data.reviewId,
        difficulty: data.difficulty,
        studentId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/quran/review-items/${studentId}`] });
      toast({
        title: '✅ تم تسجيل المراجعة',
        description: 'سيتم جدولة المراجعة التالية تلقائياً'
      });
      setSelectedReview(null);
      setReviewResult(null);
    }
  });

  const dueItems = reviewItems?.filter(item => item.status === 'due') || [];
  const soonItems = reviewItems?.filter(item => item.status === 'soon') || [];
  const laterItems = reviewItems?.filter(item => item.status === 'later') || [];

  const calculateNextReview = (difficulty: 'easy' | 'medium' | 'hard', reviewCount: number) => {
    // Spaced repetition intervals (in days)
    const intervals = {
      easy: [1, 3, 7, 14, 30, 60, 90],
      medium: [1, 2, 4, 8, 15, 30, 60],
      hard: [1, 1, 2, 3, 5, 7, 14]
    };
    
    const intervalList = intervals[difficulty];
    const index = Math.min(reviewCount, intervalList.length - 1);
    return intervalList[index];
  };

  const handleReviewComplete = (difficulty: 'easy' | 'medium' | 'hard') => {
    if (!selectedReview) return;
    
    setReviewResult(difficulty);
    setTimeout(() => {
      reviewMutation.mutate({
        reviewId: selectedReview.id,
        difficulty
      });
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل المراجعات...</p>
        </div>
      </div>
    );
  }

  if (selectedReview) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
          <CardTitle className="text-2xl text-center">
            مراجعة سورة {selectedReview.surahName}
          </CardTitle>
          <CardDescription className="text-center text-lg">
            الآيات {selectedReview.fromAyah} - {selectedReview.toAyah}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <div className="space-y-6">
            <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-lg border-2 border-amber-200 dark:border-amber-800">
              <p className="text-center text-lg mb-4 font-medium">
                اتل الآيات من حفظك، ثم قيّم مستوى إتقانك:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <Button
                  size="lg"
                  variant={reviewResult === 'hard' ? 'default' : 'outline'}
                  className={`h-24 ${reviewResult === 'hard' ? 'bg-red-500 hover:bg-red-600' : ''}`}
                  onClick={() => handleReviewComplete('hard')}
                  disabled={!!reviewResult}
                  data-testid="button-review-hard"
                >
                  <div className="flex flex-col items-center gap-2">
                    <XCircle className="h-8 w-8" />
                    <span className="text-lg">صعب</span>
                    <span className="text-sm text-muted-foreground">
                      مراجعة بعد {calculateNextReview('hard', selectedReview.reviewCount)} يوم
                    </span>
                  </div>
                </Button>

                <Button
                  size="lg"
                  variant={reviewResult === 'medium' ? 'default' : 'outline'}
                  className={`h-24 ${reviewResult === 'medium' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}`}
                  onClick={() => handleReviewComplete('medium')}
                  disabled={!!reviewResult}
                  data-testid="button-review-medium"
                >
                  <div className="flex flex-col items-center gap-2">
                    <RefreshCw className="h-8 w-8" />
                    <span className="text-lg">متوسط</span>
                    <span className="text-sm text-muted-foreground">
                      مراجعة بعد {calculateNextReview('medium', selectedReview.reviewCount)} أيام
                    </span>
                  </div>
                </Button>

                <Button
                  size="lg"
                  variant={reviewResult === 'easy' ? 'default' : 'outline'}
                  className={`h-24 ${reviewResult === 'easy' ? 'bg-green-500 hover:bg-green-600' : ''}`}
                  onClick={() => handleReviewComplete('easy')}
                  disabled={!!reviewResult}
                  data-testid="button-review-easy"
                >
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle className="h-8 w-8" />
                    <span className="text-lg">سهل</span>
                    <span className="text-sm text-muted-foreground">
                      مراجعة بعد {calculateNextReview('easy', selectedReview.reviewCount)} يوم
                    </span>
                  </div>
                </Button>
              </div>
            </div>

            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => setSelectedReview(null)}
                disabled={!!reviewResult}
                data-testid="button-cancel-review"
              >
                إلغاء المراجعة
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-green-600 dark:text-green-400" />
            نظام المراجعة الذكي
          </CardTitle>
          <CardDescription>
            نظام مراجعة قائم على التكرار المتباعد لمساعدتك على تثبيت الحفظ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                {dueItems.length}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                مراجعات متأخرة
              </div>
            </div>
            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {soonItems.length}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                مراجعات قريبة
              </div>
            </div>
            <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {laterItems.length}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                مراجعات مؤجلة
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {dueItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <Calendar className="h-5 w-5" />
              مراجعات اليوم ({dueItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dueItems.map((item) => (
                <Card key={item.id} className="border-red-200 dark:border-red-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-lg">
                          سورة {item.surahName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          الآيات {item.fromAyah} - {item.toAyah}
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 ml-1" />
                            {item.reviewCount} مراجعة سابقة
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <TrendingUp className="h-3 w-3 ml-1" />
                            مستوى {item.difficultyLevel}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        onClick={() => setSelectedReview(item)}
                        data-testid={`button-start-review-${item.id}`}
                      >
                        ابدأ المراجعة
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {soonItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
              <Calendar className="h-5 w-5" />
              مراجعات قريبة ({soonItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {soonItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg"
                >
                  <div>
                    <span className="font-medium">سورة {item.surahName}</span>
                    <span className="text-sm text-muted-foreground mr-2">
                      ({item.fromAyah}-{item.toAyah})
                    </span>
                  </div>
                  <Badge variant="outline">
                    بعد {Math.ceil((new Date(item.nextReviewDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} يوم
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
