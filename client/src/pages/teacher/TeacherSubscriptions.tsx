import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { TeacherLayout } from './TeacherLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { DataTable } from '@/components/shared/DataTable';
import { LoadingCards } from '@/components/shared/LoadingState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { CreditCard, Users, CheckCircle, XCircle, Search, FileText, Clock } from 'lucide-react';

export function TeacherSubscriptionsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubscription, setSelectedSubscription] = useState<any>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [activationDialogOpen, setActivationDialogOpen] = useState(false);

  const { data: students = [], isLoading: studentsLoading } = useQuery<any[]>({
    queryKey: ['/api/sheikh/students'],
  });

  const { data: subscriptions = [], isLoading: subscriptionsLoading } = useQuery<any[]>({
    queryKey: ['/api/sheikh/subscriptions'],
    enabled: false,
  });

  const { data: plans = [] } = useQuery<any[]>({
    queryKey: ['/api/subscription-plans/active'],
  });

  const activateSubscriptionMutation = useMutation({
    mutationFn: async (data: { studentId: string; planId: string }) => {
      return apiRequest('POST', '/api/sheikh/activate-subscription', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sheikh/students'] });
      setActivationDialogOpen(false);
      setSelectedSubscription(null);
      toast({
        title: 'تم تفعيل الاشتراك',
        description: 'تم تفعيل اشتراك الطالب بنجاح',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في تفعيل الاشتراك',
        variant: 'destructive',
      });
    },
  });

  const filteredStudents = students.filter((s: any) => 
    s.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.phoneNumber?.includes(searchQuery)
  );

  const activeSubscriptions = students.filter((s: any) => s.isPaid).length;
  const pendingSubscriptions = students.filter((s: any) => !s.isPaid).length;

  const handleActivateSubscription = (student: any) => {
    setSelectedSubscription(student);
    setSelectedPlanId('');
    setActivationDialogOpen(true);
  };

  const columns = [
    {
      key: 'studentName',
      header: 'اسم الطالب',
      render: (s: any) => <span className="font-medium">{s.studentName}</span>
    },
    { key: 'phoneNumber', header: 'رقم الهاتف' },
    { 
      key: 'currentLevel', 
      header: 'المستوى',
      render: (s: any) => (
        <Badge variant="secondary">
          {s.currentLevel === 'advanced' ? 'متقدم' : s.currentLevel === 'intermediate' ? 'متوسط' : 'مبتدئ'}
        </Badge>
      )
    },
    { 
      key: 'isPaid', 
      header: 'حالة الاشتراك',
      render: (s: any) => (
        <Badge variant={s.isPaid ? 'default' : 'destructive'}>
          {s.isPaid ? 'مفعل' : 'غير مفعل'}
        </Badge>
      )
    },
    { 
      key: 'monthlyPrice', 
      header: 'السعر الشهري',
      render: (s: any) => `${s.monthlyPrice || 0} ر.س`
    },
    {
      key: 'actions',
      header: 'إجراءات',
      render: (s: any) => (
        <div className="flex gap-2">
          {!s.isPaid && (
            <Button 
              size="sm"
              onClick={() => handleActivateSubscription(s)}
              data-testid={`button-activate-subscription-${s.id}`}
            >
              <CheckCircle className="h-4 w-4 ml-1" />
              تفعيل
            </Button>
          )}
          <Button 
            size="sm" 
            variant="outline"
            data-testid={`button-view-invoice-${s.id}`}
          >
            <FileText className="h-4 w-4 ml-1" />
            فاتورة
          </Button>
        </div>
      )
    }
  ];

  const isLoading = studentsLoading || subscriptionsLoading;

  return (
    <TeacherLayout>
      <PageHeader 
        title="إدارة الاشتراكات"
        description="تفعيل وإدارة اشتراكات الطلاب"
      />

      {isLoading ? (
        <LoadingCards count={3} />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <StatsCard
              title="إجمالي الطلاب"
              value={students.length}
              subtitle="طالب مسجل"
              icon={<Users className="h-4 w-4" />}
            />
            <StatsCard
              title="الاشتراكات المفعلة"
              value={activeSubscriptions}
              subtitle="اشتراك نشط"
              icon={<CheckCircle className="h-4 w-4" />}
            />
            <StatsCard
              title="بانتظار التفعيل"
              value={pendingSubscriptions}
              subtitle="اشتراك معلق"
              icon={<Clock className="h-4 w-4" />}
            />
          </div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث بالاسم أو رقم الهاتف..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                  data-testid="input-search-subscriptions"
                />
              </div>
            </CardContent>
          </Card>

          <DataTable
            columns={columns}
            data={filteredStudents}
            isLoading={isLoading}
            emptyMessage="لا يوجد طلاب"
          />
        </>
      )}

      <Dialog open={activationDialogOpen} onOpenChange={setActivationDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>تفعيل الاشتراك</DialogTitle>
          </DialogHeader>
          
          {selectedSubscription && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium">{selectedSubscription.studentName}</p>
                <p className="text-sm text-muted-foreground">{selectedSubscription.phoneNumber}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">اختر خطة الاشتراك</label>
                <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                  <SelectTrigger data-testid="select-plan">
                    <SelectValue placeholder="اختر الخطة" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.length > 0 ? (
                      plans.map((plan: any) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.nameAr || plan.name} - {plan.price} {plan.currency || 'ر.س'}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-sm text-muted-foreground">لا توجد خطط متاحة</div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setActivationDialogOpen(false)}>
              إلغاء
            </Button>
            <Button 
              onClick={() => {
                if (selectedSubscription && selectedPlanId) {
                  activateSubscriptionMutation.mutate({
                    studentId: selectedSubscription.id,
                    planId: selectedPlanId,
                  });
                }
              }}
              disabled={activateSubscriptionMutation.isPending || !selectedPlanId}
              data-testid="button-confirm-activation"
            >
              {activateSubscriptionMutation.isPending ? 'جاري التفعيل...' : 'تفعيل الاشتراك'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TeacherLayout>
  );
}
