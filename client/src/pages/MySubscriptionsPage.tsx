import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, CheckCircle2, XCircle, BookOpen } from 'lucide-react';

interface Subscription {
  id: string;
  courseId: string;
  courseName: string;
  courseCategory: string;
  status: 'pending' | 'approved' | 'rejected';
  enrolledAt: string;
  instructor?: string;
}

export default function MySubscriptionsPage() {
  // Fetch my subscriptions
  const { data: subscriptions = [] } = useQuery({
    queryKey: ['my-subscriptions'],
    queryFn: async () => {
      const response = await fetch('/api/my-enrollments');
      if (!response.ok) return [];
      return response.json();
    },
  });

  const pendingSubscriptions = subscriptions.filter((s: Subscription) => s.status === 'pending');
  const approvedSubscriptions = subscriptions.filter((s: Subscription) => s.status === 'approved');
  const rejectedSubscriptions = subscriptions.filter((s: Subscription) => s.status === 'rejected');

  const SubscriptionCard = ({ subscription }: { subscription: Subscription }) => {
    const categoryAr: Record<string, string> = {
      quran: 'القرآن الكريم',
      fiqh: 'الفقه الإسلامي',
      hadith: 'الحديث الشريف',
      seerah: 'السيرة النبوية',
      other: 'أخرى',
    };

    const getStatusIcon = () => {
      switch (subscription.status) {
        case 'pending':
          return <Clock className="w-5 h-5 text-amber-500" />;
        case 'approved':
          return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
        case 'rejected':
          return <XCircle className="w-5 h-5 text-red-500" />;
      }
    };

    const getStatusText = () => {
      switch (subscription.status) {
        case 'pending':
          return 'قيد الانتظار';
        case 'approved':
          return 'موافق عليه';
        case 'rejected':
          return 'مرفوض';
      }
    };

    return (
      <Card className="border-emerald-200 hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-emerald-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-emerald-900">{subscription.courseName}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    التصنيف: {categoryAr[subscription.courseCategory] || subscription.courseCategory}
                  </p>
                  {subscription.instructor && (
                    <p className="text-sm text-gray-600">المدرس: {subscription.instructor}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    تاريخ التسجيل: {new Date(subscription.enrolledAt).toLocaleDateString('ar')}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-opacity-10" 
                 style={{
                   backgroundColor: subscription.status === 'approved' ? '#ecfdf5' :
                                   subscription.status === 'pending' ? '#fffbeb' :
                                   '#fef2f2'
                 }}>
              {getStatusIcon()}
              <span className="text-sm font-medium" style={{
                color: subscription.status === 'approved' ? '#059669' :
                       subscription.status === 'pending' ? '#b45309' :
                       '#dc2626'
              }}>
                {getStatusText()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-emerald-900 mb-2">اشتراكاتي والطلبات</h1>
          <p className="text-gray-600">عرض جميع الدورات المسجل بها والطلبات قيد الانتظار</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-emerald-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">طلبات قيد الانتظار</p>
                  <p className="text-2xl font-bold text-amber-600">{pendingSubscriptions.length}</p>
                </div>
                <Clock className="w-8 h-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">دورات مقبولة</p>
                  <p className="text-2xl font-bold text-emerald-600">{approvedSubscriptions.length}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">طلبات مرفوضة</p>
                  <p className="text-2xl font-bold text-red-600">{rejectedSubscriptions.length}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-emerald-700">الاشتراكات</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="approved" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="approved">مقبولة ({approvedSubscriptions.length})</TabsTrigger>
                <TabsTrigger value="pending">قيد الانتظار ({pendingSubscriptions.length})</TabsTrigger>
                <TabsTrigger value="rejected">مرفوضة ({rejectedSubscriptions.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="approved" className="space-y-4 mt-4">
                {approvedSubscriptions.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">لم تسجل في أي دورات بعد</p>
                  </div>
                ) : (
                  approvedSubscriptions.map((sub: Subscription) => (
                    <SubscriptionCard key={sub.id} subscription={sub} />
                  ))
                )}
              </TabsContent>

              <TabsContent value="pending" className="space-y-4 mt-4">
                {pendingSubscriptions.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">لا توجد طلبات قيد الانتظار</p>
                  </div>
                ) : (
                  pendingSubscriptions.map((sub: Subscription) => (
                    <SubscriptionCard key={sub.id} subscription={sub} />
                  ))
                )}
              </TabsContent>

              <TabsContent value="rejected" className="space-y-4 mt-4">
                {rejectedSubscriptions.length === 0 ? (
                  <div className="text-center py-8">
                    <XCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">لا توجد طلبات مرفوضة</p>
                  </div>
                ) : (
                  rejectedSubscriptions.map((sub: Subscription) => (
                    <SubscriptionCard key={sub.id} subscription={sub} />
                  ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
