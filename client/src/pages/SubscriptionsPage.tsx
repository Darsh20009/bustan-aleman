import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, CreditCard, Building2, AlertCircle, ShoppingCart, Loader2, Zap, Users, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

interface SubscriptionPlan {
  id: string;
  nameAr: string;
  nameEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  duration: string;
  durationDays: number;
  price: number;
  currency: string;
  sessionsCount?: number;
  features?: string;
  isActive: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
}

interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  status: 'pending' | 'active' | 'expired' | 'cancelled' | 'payment_overdue';
  startDate?: string;
  endDate?: string;
  sessionsRemaining?: number;
  autoRenew?: boolean;
  paymentGateway?: string;
}

export default function SubscriptionsPage() {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'paypal' | 'bank_transfer' | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Fetch subscription plans
  const { data: plans = [] } = useQuery({
    queryKey: ['/api/subscription/plans'],
  }) as { data: SubscriptionPlan[] };

  // Fetch user's current subscription
  const { data: userSubscription } = useQuery({
    queryKey: ['/api/subscription/my-subscription'],
  }) as { data: UserSubscription | undefined };

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async (subscriptionPlanId: string) => {
      return await apiRequest('/api/cart/subscription', 'POST', { subscriptionPlanId });
    },
    onSuccess: (data: any, planId: string) => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      queryClient.invalidateQueries({ queryKey: ['/api/cart/full'] });
      const plan = plans.find(p => p.id === planId);
      toast({
        title: "تمت الإضافة للسلة",
        description: `تمت إضافة ${plan?.nameAr || 'الخطة'} إلى السلة بنجاح`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل في إضافة الخطة للسلة",
        variant: "destructive",
      });
    },
  });

  // Subscribe mutation
  const subscribeMutation = useMutation({
    mutationFn: async ({ planId, paymentMethod }: { planId: string; paymentMethod: string }) => {
      return await apiRequest('/api/subscription/subscribe', 'POST', { planId, paymentMethod });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscription/my-subscription'] });
      toast({
        title: "تم إنشاء طلب الاشتراك",
        description: data.message || "تم إنشاء طلب الاشتراك بنجاح",
      });
      if (selectedPaymentMethod === 'bank_transfer') {
        setLocation('/bank-transfer-checkout');
      }
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل في إنشاء الاشتراك",
        variant: "destructive",
      });
    },
  });

  // Sort plans by featured and sort order
  const sortedPlans = (Array.isArray(plans) ? [...plans] : []).sort((a: SubscriptionPlan, b: SubscriptionPlan) => {
    if (a.isFeatured !== b.isFeatured) {
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    }
    return (a.sortOrder || 0) - (b.sortOrder || 0);
  });

  const parseFeatures = (features: string | undefined) => {
    if (!features) return [];
    try {
      return JSON.parse(features);
    } catch {
      return [features];
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'expired':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'payment_overdue':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: 'نشط',
      expired: 'منتهي',
      pending: 'قيد الانتظار',
      payment_overdue: 'تأخير في الدفع',
      cancelled: 'ملغى',
    };
    return labels[status] || status;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 dark:from-slate-900 dark:via-emerald-950 dark:to-slate-900 py-12 px-4" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-block mb-6">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full p-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 font-amiri">
            خطط الاشتراك
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            اختر الخطة المناسبة لك وابدأ رحلتك في تعلم القرآن الكريم مع أفضل المعلمين
          </p>
        </div>

        {/* Current Subscription Card */}
        {userSubscription && (
          <Card className="mb-12 bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-700 dark:to-teal-700 text-white border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-4 gap-8">
                <div>
                  <p className="text-emerald-100 text-sm mb-2">اشتراكك الحالي</p>
                  <Badge className="bg-white/20 text-white border-0">
                    {getStatusLabel((userSubscription as UserSubscription).status)}
                  </Badge>
                </div>
                {(userSubscription as UserSubscription).startDate && (
                  <div>
                    <p className="text-emerald-100 text-sm mb-2">تاريخ البدء</p>
                    <p className="font-bold text-lg">
                      {new Date((userSubscription as UserSubscription).startDate!).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                )}
                {(userSubscription as UserSubscription).endDate && (
                  <div>
                    <p className="text-emerald-100 text-sm mb-2">تاريخ الانتهاء</p>
                    <p className="font-bold text-lg">
                      {new Date((userSubscription as UserSubscription).endDate!).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                )}
                {(userSubscription as UserSubscription).sessionsRemaining !== undefined && (
                  <div>
                    <p className="text-emerald-100 text-sm mb-2">الحصص المتبقية</p>
                    <p className="font-bold text-lg">
                      {(userSubscription as UserSubscription).sessionsRemaining} حصة
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Subscription Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {(Array.isArray(sortedPlans) && sortedPlans.length > 0) ? (
            sortedPlans.map((plan: SubscriptionPlan) => (
              <div key={plan.id} className="h-full">
                <Card
                  className={`h-full flex flex-col transition-all duration-300 hover:shadow-xl ${
                    plan.isFeatured
                      ? 'md:scale-105 border-2 border-orange-400 shadow-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20'
                      : 'border-gray-200 hover:border-emerald-300 dark:border-slate-700'
                  }`}
                >
                  {/* Featured Badge */}
                  {plan.isFeatured && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <Badge className="bg-gradient-to-r from-orange-400 to-amber-400 text-white border-0 px-4 py-1 shadow-lg">
                        ⭐ خطة مميزة
                      </Badge>
                    </div>
                  )}

                  {/* Plan Header */}
                  <CardHeader className={`pb-4 ${plan.isFeatured ? 'pt-6' : ''}`}>
                    <CardTitle className="text-2xl text-emerald-700 dark:text-emerald-400 mb-2 font-amiri">
                      {plan.nameAr}
                    </CardTitle>
                    {plan.descriptionAr && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">{plan.descriptionAr}</p>
                    )}
                  </CardHeader>

                  {/* Plan Content */}
                  <CardContent className="flex-1 flex flex-col pb-4">
                    {/* Price Section */}
                    <div className="mb-8 p-6 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl">
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">السعر</p>
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-5xl font-bold text-emerald-700 dark:text-emerald-400">
                          {parseFloat(plan.price.toString()).toFixed(0)}
                        </span>
                        <span className="text-xl text-gray-600 dark:text-gray-400">{plan.currency}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        لمدة {plan.duration === 'weekly' ? 'أسبوع' : plan.duration === 'monthly' ? 'شهر' : plan.duration === 'quarterly' ? '3 أشهر' : 'سنة'}
                      </p>
                    </div>

                    {/* Sessions Count */}
                    {plan.sessionsCount && (
                      <div className="mb-6 flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <Clock className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">عدد الحصص</p>
                          <p className="font-bold text-gray-900 dark:text-white">{plan.sessionsCount} حصة</p>
                        </div>
                      </div>
                    )}

                    {/* Features Section */}
                    {parseFeatures(plan.features).length > 0 && (
                      <div className="mb-6 flex-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          المميزات
                        </p>
                        <ul className="space-y-2">
                          {parseFeatures(plan.features).map((feature: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-3 mt-auto">
                      <Button
                        onClick={() => addToCartMutation.mutate(plan.id)}
                        disabled={addToCartMutation.isPending || !plan.isActive}
                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 text-base shadow-md disabled:opacity-50"
                        data-testid={`button-add-cart-${plan.id}`}
                      >
                        {addToCartMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                            جاري الإضافة...
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4 ml-2" />
                            أضف للسلة
                          </>
                        )}
                      </Button>

                      <Button
                        onClick={() => {
                          setSelectedPlanId(plan.id);
                          setSelectedPaymentMethod(null);
                          setExpandedPlanId(expandedPlanId === plan.id ? null : plan.id);
                        }}
                        disabled={!plan.isActive}
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3 text-base shadow-md disabled:opacity-50"
                        data-testid={`button-subscribe-now-${plan.id}`}
                      >
                        اشترك الآن مباشرة
                      </Button>

                      {!plan.isActive && (
                        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 p-3 rounded-lg">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          الخطة غير متاحة حالياً
                        </div>
                      )}
                    </div>
                  </CardContent>

                  {/* Payment Methods - Collapsible */}
                  {selectedPlanId === plan.id && expandedPlanId === plan.id && (
                    <div className="border-t border-gray-200 dark:border-slate-700 p-4 space-y-3 bg-gray-50 dark:bg-slate-800">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">اختر طريقة الدفع:</p>
                      
                      <Button
                        onClick={() => {
                          setSelectedPaymentMethod('paypal');
                          subscribeMutation.mutate({ planId: plan.id, paymentMethod: 'paypal' });
                        }}
                        disabled={subscribeMutation.isPending}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                        data-testid={`button-subscribe-paypal-${plan.id}`}
                      >
                        {subscribeMutation.isPending && selectedPaymentMethod === 'paypal' ? (
                          <>
                            <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                            جاري المعالجة...
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4 ml-2" />
                            الدفع عبر PayPal
                          </>
                        )}
                      </Button>

                      <Button
                        onClick={() => {
                          setSelectedPaymentMethod('bank_transfer');
                          subscribeMutation.mutate({ planId: plan.id, paymentMethod: 'bank_transfer' });
                        }}
                        disabled={subscribeMutation.isPending}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                        data-testid={`button-subscribe-bank-${plan.id}`}
                      >
                        {subscribeMutation.isPending && selectedPaymentMethod === 'bank_transfer' ? (
                          <>
                            <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                            جاري المعالجة...
                          </>
                        ) : (
                          <>
                            <Building2 className="w-4 h-4 ml-2" />
                            التحويل البنكي
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </Card>
              </div>
            ))
          ) : (
            <Card className="md:col-span-3">
              <CardContent className="p-12 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-lg">لا توجد خطط اشتراك متاحة حالياً</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* FAQ Section */}
        <Card className="border-gray-200 dark:border-slate-700 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
            <CardTitle className="text-2xl text-emerald-900 dark:text-emerald-300 font-amiri">
              الأسئلة الشائعة
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="border-b border-gray-200 dark:border-slate-700 pb-6 last:border-b-0 last:pb-0">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-lg">هل يمكنني تغيير الخطة لاحقاً؟</h4>
              <p className="text-gray-600 dark:text-gray-400">نعم، يمكنك تغيير خطتك في أي وقت وستتم معالجة الفرق في السعر تلقائياً.</p>
            </div>
            <div className="border-b border-gray-200 dark:border-slate-700 pb-6 last:border-b-0 last:pb-0">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-lg">هل هناك ضمان استرجاع الأموال؟</h4>
              <p className="text-gray-600 dark:text-gray-400">نعم، نقدم ضمان استرجاع كامل الأموال خلال 7 أيام من الاشتراك بدون شروط.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-lg">متى يتم تجديد الاشتراك؟</h4>
              <p className="text-gray-600 dark:text-gray-400">يتم التجديد تلقائياً في نهاية فترة الاشتراك إذا كان الاشتراك مفعلاً. يمكنك إلغاء الاشتراك في أي وقت.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
