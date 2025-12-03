import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AdminLayout } from './AdminLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { DataTable } from '@/components/shared/DataTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { 
  CreditCard, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Search,
  DollarSign,
  Check,
  X
} from 'lucide-react';

export function AdminSubscriptionsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: subscriptions = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/admin/subscriptions'],
  });

  const { data: payments = [] } = useQuery<any[]>({
    queryKey: ['/api/admin/payments'],
  });

  const approveSubscriptionMutation = useMutation({
    mutationFn: async (subscriptionId: string) => {
      return apiRequest(`/api/admin/subscriptions/${subscriptionId}/approve`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/subscriptions'] });
      toast({
        title: 'تم تفعيل الاشتراك',
        description: 'تم تفعيل الاشتراك بنجاح',
      });
    },
    onError: () => {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تفعيل الاشتراك',
        variant: 'destructive',
      });
    },
  });

  const rejectSubscriptionMutation = useMutation({
    mutationFn: async (subscriptionId: string) => {
      return apiRequest(`/api/admin/subscriptions/${subscriptionId}/reject`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/subscriptions'] });
      toast({
        title: 'تم رفض الاشتراك',
        description: 'تم رفض الاشتراك',
      });
    },
  });

  const activeSubscriptions = subscriptions.filter((s: any) => s.status === 'active');
  const pendingSubscriptions = subscriptions.filter((s: any) => s.status === 'pending');
  const expiredSubscriptions = subscriptions.filter((s: any) => s.status === 'expired');

  const filteredSubscriptions = subscriptions.filter((s: any) => 
    s.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.planName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">نشط</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">قيد المراجعة</Badge>;
      case 'expired':
        return <Badge variant="destructive">منتهي</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const subscriptionColumns = [
    { key: 'studentName', header: 'الطالب' },
    { key: 'planName', header: 'الخطة' },
    { 
      key: 'startDate', 
      header: 'تاريخ البدء',
      render: (s: any) => new Date(s.startDate).toLocaleDateString('ar-SA')
    },
    { 
      key: 'endDate', 
      header: 'تاريخ الانتهاء',
      render: (s: any) => new Date(s.endDate).toLocaleDateString('ar-SA')
    },
    { 
      key: 'status', 
      header: 'الحالة',
      render: (s: any) => getStatusBadge(s.status)
    },
    {
      key: 'actions',
      header: 'إجراءات',
      render: (s: any) => (
        s.status === 'pending' && (
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => approveSubscriptionMutation.mutate(s.id)}
              data-testid={`button-approve-${s.id}`}
            >
              <Check className="h-4 w-4 text-green-600" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={() => rejectSubscriptionMutation.mutate(s.id)}
              data-testid={`button-reject-${s.id}`}
            >
              <X className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        )
      )
    }
  ];

  const paymentColumns = [
    { key: 'studentName', header: 'الطالب' },
    { 
      key: 'amount', 
      header: 'المبلغ',
      render: (p: any) => `${p.amount} ${p.currency || 'ر.س'}`
    },
    { key: 'paymentMethod', header: 'طريقة الدفع' },
    { 
      key: 'createdAt', 
      header: 'التاريخ',
      render: (p: any) => new Date(p.createdAt).toLocaleDateString('ar-SA')
    },
    { 
      key: 'status', 
      header: 'الحالة',
      render: (p: any) => getStatusBadge(p.status)
    }
  ];

  const totalRevenue = payments
    .filter((p: any) => p.status === 'completed')
    .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

  return (
    <AdminLayout>
      <PageHeader 
        title="إدارة الاشتراكات"
        description="التحكم في اشتراكات الطلاب والمدفوعات"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatsCard
          title="الاشتراكات النشطة"
          value={activeSubscriptions.length}
          subtitle="اشتراك فعال"
          icon={<CheckCircle className="h-4 w-4" />}
        />
        <StatsCard
          title="قيد المراجعة"
          value={pendingSubscriptions.length}
          subtitle="اشتراك معلق"
          icon={<Clock className="h-4 w-4" />}
        />
        <StatsCard
          title="المنتهية"
          value={expiredSubscriptions.length}
          subtitle="اشتراك منتهي"
          icon={<XCircle className="h-4 w-4" />}
        />
        <StatsCard
          title="إجمالي الإيرادات"
          value={`${totalRevenue} ر.س`}
          subtitle="المدفوعات المكتملة"
          icon={<DollarSign className="h-4 w-4" />}
        />
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ابحث بالاسم أو الخطة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
              data-testid="input-search-subscriptions"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="subscriptions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="subscriptions">الاشتراكات</TabsTrigger>
          <TabsTrigger value="pending">قيد المراجعة ({pendingSubscriptions.length})</TabsTrigger>
          <TabsTrigger value="payments">المدفوعات</TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions">
          <DataTable
            title="جميع الاشتراكات"
            columns={subscriptionColumns}
            data={filteredSubscriptions}
            isLoading={isLoading}
            emptyMessage="لا توجد اشتراكات"
          />
        </TabsContent>

        <TabsContent value="pending">
          <DataTable
            title="الاشتراكات المعلقة"
            description="اشتراكات تحتاج موافقة"
            columns={subscriptionColumns}
            data={pendingSubscriptions}
            isLoading={isLoading}
            emptyMessage="لا توجد اشتراكات معلقة"
          />
        </TabsContent>

        <TabsContent value="payments">
          <DataTable
            title="سجل المدفوعات"
            columns={paymentColumns}
            data={payments}
            isLoading={isLoading}
            emptyMessage="لا توجد مدفوعات"
          />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}