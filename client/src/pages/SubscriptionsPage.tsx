import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, CreditCard, Building2, AlertCircle, ShoppingCart, Loader2 } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">خطط الاشتراك</h1>
          <p className="text-xl text-gray-600">اختر الخطة المناسبة لك وابدأ رحلتك في تعلم القرآن الكريم</p>
        </div>

        {/* Current Subscription Status */}
        {userSubscription && (userSubscription as UserSubscription) && (
          <Card className="mb-12 border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-900">
                <Check className="w-5 h-5" />
                اشتراكك الحالي
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">الحالة</p>
                  <Badge className={`${getStatusColor((userSubscription as UserSubscription).status)} mt-2`}>
                    {getStatusLabel((userSubscription as UserSubscription).status)}
                  </Badge>
                </div>
                {(userSubscription as UserSubscription).startDate && (
                  <div>
                    <p className="text-sm text-gray-600">تاريخ البدء</p>
                    <p className="font-semibold text-gray-900 mt-1">
                      {new Date((userSubscription as UserSubscription).startDate!).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                )}
                {(userSubscription as UserSubscription).endDate && (
                  <div>
                    <p className="text-sm text-gray-600">تاريخ الانتهاء</p>
                    <p className="font-semibold text-gray-900 mt-1">
                      {new Date((userSubscription as UserSubscription).endDate!).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                )}
                {(userSubscription as UserSubscription).sessionsRemaining !== undefined && (
                  <div>
                    <p className="text-sm text-gray-600">الحصص المتبقية</p>
                    <p className="font-semibold text-gray-900 mt-1">
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
              <Card
                key={plan.id}
                className={`relative transition-all duration-300 ${
                  plan.isFeatured
                    ? 'md:scale-105 border-2 border-orange-400 shadow-2xl'
                    : 'border-gray-200 hover:shadow-lg'
                }`}
              >
                {/* Featured Badge */}
                {plan.isFeatured && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-orange-400 to-amber-400 text-white py-2 text-center font-bold">
                    خطة مميزة
                  </div>
                )}

                <CardHeader className={plan.isFeatured ? 'pt-16' : ''}>
                  <CardTitle className="text-2xl text-emerald-700 mb-2">
                    {plan.nameAr}
                  </CardTitle>
                  {plan.descriptionAr && (
                    <p className="text-sm text-gray-600 mb-4">{plan.descriptionAr}</p>
                  )}

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-gray-900">
                        {parseFloat(plan.price.toString()).toFixed(2)}
                      </span>
                      <span className="text-xl text-gray-600">{plan.currency}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      لمدة {plan.duration === 'weekly' ? 'أسبوع' : plan.duration === 'monthly' ? 'شهر' : plan.duration === 'quarterly' ? '3 أشهر' : 'سنة'}
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="flex flex-col h-full">
                  {/* Sessions Count */}
                  {plan.sessionsCount && (
                    <div className="mb-6 p-4 bg-emerald-50 rounded-lg">
                      <p className="text-sm text-gray-600">عدد الحصص</p>
                      <p className="text-2xl font-bold text-emerald-700">{plan.sessionsCount} حصة</p>
                    </div>
                  )}

                  {/* Features */}
                  {parseFeatures(plan.features).length > 0 && (
                    <div className="mb-6 flex-1">
                      <p className="text-sm font-semibold text-gray-900 mb-3">المميزات:</p>
                      <ul className="space-y-2">
                        {parseFeatures(plan.features).map((feature: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                            <Check className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Add to Cart Button - Primary */}
                  <Button
                    className="w-full mb-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 text-lg shadow-lg"
                    onClick={() => addToCartMutation.mutate(plan.id)}
                    disabled={addToCartMutation.isPending}
                    data-testid={`button-add-cart-${plan.id}`}
                  >
                    {addToCartMutation.isPending ? (
                      <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                    ) : (
                      <ShoppingCart className="w-5 h-5 ml-2" />
                    )}
                    أضف للسلة
                  </Button>

                  {/* Subscribe Now Button */}
                  <Button
                    className="w-full mb-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-2 shadow-md"
                    onClick={() => {
                      setSelectedPlanId(plan.id);
                      setSelectedPaymentMethod(null);
                    }}
                    data-testid={`button-subscribe-now-${plan.id}`}
                  >
                    اشترك الآن
                  </Button>

                  {/* Payment Methods - Show when plan is selected */}
                  {selectedPlanId === plan.id && (
                    <div className="space-y-2 mt-3 p-3 bg-gray-50 rounded-lg border">
                      <p className="text-sm font-medium text-gray-700 mb-2">اختر طريقة الدفع:</p>
                      <Button
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => {
                          setSelectedPaymentMethod('paypal');
                          subscribeMutation.mutate({ planId: plan.id, paymentMethod: 'paypal' });
                        }}
                        disabled={subscribeMutation.isPending}
                        data-testid={`button-subscribe-paypal-${plan.id}`}
                      >
                        {subscribeMutation.isPending && selectedPaymentMethod === 'paypal' ? (
                          <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                        ) : (
                          <CreditCard className="w-4 h-4 ml-2" />
                        )}
                        الدفع عبر PayPal
                      </Button>
                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        onClick={() => {
                          setSelectedPaymentMethod('bank_transfer');
                          subscribeMutation.mutate({ planId: plan.id, paymentMethod: 'bank_transfer' });
                        }}
                        disabled={subscribeMutation.isPending}
                        data-testid={`button-subscribe-bank-${plan.id}`}
                      >
                        {subscribeMutation.isPending && selectedPaymentMethod === 'bank_transfer' ? (
                          <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                        ) : (
                          <Building2 className="w-4 h-4 ml-2" />
                        )}
                        التحويل البنكي
                      </Button>
                    </div>
                  )}

                  {/* Is Active Status */}
                  {!plan.isActive && (
                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                      <AlertCircle className="w-4 h-4" />
                      الخطة غير متاحة حالياً
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="md:col-span-3">
              <CardContent className="p-12 text-center">
                <p className="text-gray-600">لا توجد خطط اشتراك متاحة حالياً</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Payment Method Info */}
        {selectedPaymentMethod === 'bank_transfer' && (
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Building2 className="w-5 h-5" />
                بيانات التحويل البنكي
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                يرجى الانتظار لتحميل بيانات الحساب البنكي. سيتم إرسال تعليمات التحويل إلى بريدك الإلكتروني.
              </p>
            </CardContent>
          </Card>
        )}

        {/* FAQ Section */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle>الأسئلة الشائعة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">هل يمكنني تغيير الخطة لاحقاً؟</h4>
              <p className="text-gray-600">نعم، يمكنك تغيير خطتك في أي وقت وستتم معالجة الفرق في السعر.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">هل هناك ضمان استرجاع الأموال؟</h4>
              <p className="text-gray-600">نعم، نقدم ضمان استرجاع كامل الأموال خلال 7 أيام من الاشتراك.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">متى يتم تجديد الاشتراك؟</h4>
              <p className="text-gray-600">يتم التجديد تلقائياً في نهاية فترة الاشتراك إذا لم تقم بإلغاء الاشتراك.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
