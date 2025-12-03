import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { StudentLayout } from './StudentLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { DataTable } from '@/components/shared/DataTable';
import { LoadingCards } from '@/components/shared/LoadingState';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { CreditCard, Calendar, CheckCircle, Clock, Package, ShoppingCart, Users, Check } from 'lucide-react';

export function StudentSubscriptionPage() {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [selectedSheikh, setSelectedSheikh] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: subscription, isLoading: subLoading } = useQuery<any>({
    queryKey: ['/api/student/subscription'],
  });

  const { data: payments = [], isLoading: paymentsLoading } = useQuery<any[]>({
    queryKey: ['/api/student/payments'],
  });

  const { data: plans = [] } = useQuery<any[]>({
    queryKey: ['/api/subscription-plans/active'],
  });

  const { data: sheikhs = [] } = useQuery<any[]>({
    queryKey: ['/api/teachers'],
  });

  const addToCartMutation = useMutation({
    mutationFn: async (data: { planId: string; sheikhId?: string }) => {
      return apiRequest('POST', '/api/cart/subscription', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      setIsDialogOpen(false);
      setSelectedPlan(null);
      setSelectedSheikh('');
      toast({
        title: 'تمت الإضافة للسلة',
        description: 'تم إضافة الاشتراك للسلة بنجاح',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ',
        description: error.message || 'حدث خطأ أثناء الإضافة للسلة',
        variant: 'destructive',
      });
    },
  });

  const renewMutation = useMutation({
    mutationFn: async (planId: string) => {
      return apiRequest('POST', '/api/subscription/renew', { planId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/student/subscription'] });
      toast({
        title: 'تم إرسال طلب التجديد',
        description: 'سيتم التواصل معك قريباً',
      });
    },
    onError: () => {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء إرسال الطلب',
        variant: 'destructive',
      });
    },
  });

  const handleSelectPlan = (plan: any) => {
    setSelectedPlan(plan);
    setIsDialogOpen(true);
  };

  const handleAddToCart = () => {
    if (!selectedPlan) return;
    addToCartMutation.mutate({
      planId: selectedPlan.id,
      sheikhId: selectedSheikh || undefined,
    });
  };

  const isLoading = subLoading || paymentsLoading;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">نشط</Badge>;
      case 'expired':
        return <Badge variant="destructive">منتهي</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">قيد المراجعة</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const paymentColumns = [
    { 
      key: 'createdAt', 
      header: 'التاريخ',
      render: (p: any) => new Date(p.createdAt).toLocaleDateString('ar-SA')
    },
    { 
      key: 'amount', 
      header: 'المبلغ',
      render: (p: any) => `${p.amount} ${p.currency || 'ر.س'}`
    },
    { key: 'paymentMethod', header: 'طريقة الدفع' },
    { 
      key: 'status', 
      header: 'الحالة',
      render: (p: any) => getStatusBadge(p.status)
    }
  ];

  const daysRemaining = subscription?.endDate 
    ? Math.max(0, Math.ceil((new Date(subscription.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;

  return (
    <StudentLayout>
      <PageHeader 
        title="الاشتراك والدفع"
        description="إدارة اشتراكك ومتابعة المدفوعات"
      />

      {isLoading ? (
        <LoadingCards count={4} />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <StatsCard
              title="حالة الاشتراك"
              value={subscription?.status === 'active' ? 'نشط' : 'غير نشط'}
              subtitle={subscription?.planName || 'لا يوجد اشتراك'}
              icon={<Package className="h-4 w-4" />}
            />
            <StatsCard
              title="الأيام المتبقية"
              value={daysRemaining}
              subtitle="يوم"
              icon={<Calendar className="h-4 w-4" />}
            />
            <StatsCard
              title="الحصص المتبقية"
              value={subscription?.remainingSessions || 0}
              subtitle="حصة"
              icon={<Clock className="h-4 w-4" />}
            />
            <StatsCard
              title="إجمالي المدفوعات"
              value={payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0)}
              subtitle="ر.س"
              icon={<CreditCard className="h-4 w-4" />}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>الاشتراك الحالي</CardTitle>
                <CardDescription>تفاصيل اشتراكك الحالي</CardDescription>
              </CardHeader>
              <CardContent>
                {subscription ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">الخطة</span>
                      <span className="font-medium">{subscription.planName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">الحالة</span>
                      {getStatusBadge(subscription.status)}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">المعلم</span>
                      <span className="font-medium">{subscription.sheikhName || 'غير محدد'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">تاريخ البدء</span>
                      <span>{new Date(subscription.startDate).toLocaleDateString('ar-SA')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">تاريخ الانتهاء</span>
                      <span>{new Date(subscription.endDate).toLocaleDateString('ar-SA')}</span>
                    </div>
                    {subscription.status !== 'active' && (
                      <Button 
                        className="w-full mt-4"
                        onClick={() => renewMutation.mutate(subscription.planId)}
                        disabled={renewMutation.isPending}
                        data-testid="button-renew-subscription"
                      >
                        {renewMutation.isPending ? 'جاري الإرسال...' : 'تجديد الاشتراك'}
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground mb-4">لا يوجد اشتراك حالي</p>
                    <p className="text-sm text-muted-foreground">اختر خطة من الخطط المتاحة للاشتراك</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>الخطط المتاحة</CardTitle>
                <CardDescription>اختر الخطة المناسبة لك</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {plans.length > 0 ? plans.map((plan: any) => (
                    <div 
                      key={plan.id}
                      className="p-4 rounded-lg border hover-elevate cursor-pointer transition-all"
                      onClick={() => handleSelectPlan(plan)}
                      data-testid={`card-plan-${plan.id}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">{plan.name}</p>
                          <p className="text-sm text-muted-foreground">{plan.description}</p>
                        </div>
                        <Badge variant="secondary">{plan.price} ر.س</Badge>
                      </div>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li className="flex items-center gap-1">
                          <Check className="h-3 w-3 text-green-500" />
                          {plan.sessionsCount} حصة
                        </li>
                        <li className="flex items-center gap-1">
                          <Check className="h-3 w-3 text-green-500" />
                          {plan.durationDays} يوم
                        </li>
                        {plan.features && plan.features.map((feature: string, idx: number) => (
                          <li key={idx} className="flex items-center gap-1">
                            <Check className="h-3 w-3 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button 
                        className="w-full mt-3" 
                        variant="outline"
                        size="sm"
                        data-testid={`button-select-plan-${plan.id}`}
                      >
                        <ShoppingCart className="h-4 w-4 ml-2" />
                        اختيار هذه الخطة
                      </Button>
                    </div>
                  )) : (
                    <p className="text-center text-muted-foreground py-4">
                      لا توجد خطط متاحة حالياً
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <DataTable
            title="سجل المدفوعات"
            description="جميع المدفوعات السابقة"
            columns={paymentColumns}
            data={payments}
            isLoading={paymentsLoading}
            emptyMessage="لا توجد مدفوعات"
          />
        </>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>تأكيد الاشتراك</DialogTitle>
            <DialogDescription>
              اختر المعلم الذي تريد الدراسة معه
            </DialogDescription>
          </DialogHeader>
          
          {selectedPlan && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{selectedPlan.name}</span>
                  <Badge>{selectedPlan.price} ر.س</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{selectedPlan.description}</p>
                <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                  <span>{selectedPlan.sessionsCount} حصة</span>
                  <span>{selectedPlan.durationDays} يوم</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">اختر المعلم (الشيخ)</label>
                <Select value={selectedSheikh} onValueChange={setSelectedSheikh}>
                  <SelectTrigger data-testid="select-sheikh">
                    <SelectValue placeholder="اختر المعلم" />
                  </SelectTrigger>
                  <SelectContent>
                    {sheikhs.map((sheikh: any) => (
                      <SelectItem key={sheikh.id} value={sheikh.id}>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          {sheikh.firstName} {sheikh.lastName}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  يمكنك تغيير المعلم لاحقاً إذا لزم الأمر
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              data-testid="button-cancel-subscription"
            >
              إلغاء
            </Button>
            <Button 
              onClick={handleAddToCart}
              disabled={addToCartMutation.isPending}
              data-testid="button-confirm-add-to-cart"
            >
              {addToCartMutation.isPending ? (
                'جاري الإضافة...'
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4 ml-2" />
                  إضافة للسلة
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </StudentLayout>
  );
}
