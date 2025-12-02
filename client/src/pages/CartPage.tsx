import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '../lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ShoppingCart, Trash2, CreditCard, ArrowRight, Building2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { useLocation } from 'wouter';

interface CartPageProps {
  onBack?: () => void;
}

export default function CartPage({ onBack }: CartPageProps = {}) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const { data: cartItems = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/cart/full'],
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (courseId: string) => {
      await apiRequest(`/api/cart/${courseId}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart/full'] });
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: 'تم الحذف',
        description: 'تم حذف الدورة من العربة',
      });
    },
    onError: () => {
      toast({
        title: 'خطأ',
        description: 'فشل حذف الدورة',
        variant: 'destructive',
      });
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/cart/checkout', 'POST');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart/full'] });
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user/enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/courses'] });
      toast({
        title: '✅ تم التسجيل بنجاح!',
        description: 'تم تسجيلك في جميع الدورات المختارة',
      });
    },
    onError: () => {
      toast({
        title: 'خطأ',
        description: 'فشل إتمام التسجيل',
        variant: 'destructive',
      });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-6" dir="rtl">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">عربة التسوق</h1>
              <p className="text-white/90 text-sm">({cartItems.length}) دورة</p>
            </div>
          </div>
          {onBack && (
            <Button
              onClick={onBack}
              variant="outline"
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              data-testid="button-back-cart"
            >
              ← العودة
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {cartItems.length === 0 ? (
          <Card className="border-0 shadow-xl">
            <CardContent className="p-16 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingCart className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-gray-900">العربة فارغة</h3>
              <p className="text-lg text-gray-600 mb-6">لم تقم بإضافة أي دورات أو اشتراكات للعربة بعد</p>
              {onBack && (
                <Button
                  onClick={onBack}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  data-testid="button-browse-courses"
                >
                  <ArrowRight className="w-5 h-5 ml-2" />
                  تصفح الدورات
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Cart Items */}
            <div className="space-y-4">
              {cartItems.map((item: any) => {
                const isSubscription = item.type === 'subscription' || item.subscriptionPlanId;
                const isCourse = item.courseId && !isSubscription;
                
                return (
                  <Card key={item.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          {isCourse && (
                            <>
                              <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {item.course?.titleAr || 'دورة تعليمية'}
                              </h3>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {item.course?.descriptionAr || ''}
                              </p>
                              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                                <span>المدة: {item.course?.duration || 'غير محدد'}</span>
                                <span>•</span>
                                <span>المستوى: {item.course?.level || 'جميع المستويات'}</span>
                              </div>
                            </>
                          )}
                          {isSubscription && (
                            <>
                              <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {item.plan?.nameAr || 'خطة اشتراك'}
                              </h3>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {item.plan?.descriptionAr || ''}
                              </p>
                              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                                <span>السعر: {item.plan?.price} {item.plan?.currency || 'SAR'}</span>
                                <span>•</span>
                                <span>عدد الحصص: {item.plan?.sessionsCount || 'غير محدد'}</span>
                              </div>
                            </>
                          )}
                        </div>

                        <Button
                          onClick={() => removeFromCartMutation.mutate(isSubscription ? item.subscriptionPlanId : item.courseId)}
                          disabled={removeFromCartMutation.isPending}
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50"
                          data-testid={`button-remove-from-cart-${isSubscription ? item.subscriptionPlanId : item.courseId}`}
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Checkout Section */}
            <Card className="border-0 shadow-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
              <CardHeader>
                <CardTitle className="text-2xl text-white">إتمام الطلب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-lg">
                  <span>إجمالي العناصر:</span>
                  <span className="font-bold">{cartItems.length} عنصر</span>
                </div>
                
                {/* Calculate total price */}
                {(() => {
                  let totalPrice = 0;
                  let hasPaidItems = false;
                  cartItems.forEach((item: any) => {
                    const price = item.plan?.price || item.course?.price || 0;
                    if (parseFloat(price) > 0) {
                      hasPaidItems = true;
                      totalPrice += parseFloat(price);
                    }
                  });
                  
                  return (
                    <>
                      {hasPaidItems && (
                        <div className="flex items-center justify-between text-lg border-t border-white/20 pt-4">
                          <span>الإجمالي:</span>
                          <span className="font-bold text-2xl">{totalPrice.toFixed(2)} ر.س</span>
                        </div>
                      )}
                      
                      {hasPaidItems ? (
                        <>
                          <Button
                            onClick={() => setLocation('/bank-transfer-checkout')}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-6"
                            data-testid="button-bank-transfer"
                          >
                            <Building2 className="w-5 h-5 ml-2" />
                            الدفع عبر التحويل البنكي
                          </Button>
                          <p className="text-sm text-white/80 text-center">
                            سيتم توجيهك لصفحة إتمام الدفع
                          </p>
                        </>
                      ) : (
                        <>
                          <Button
                            onClick={() => checkoutMutation.mutate()}
                            disabled={checkoutMutation.isPending}
                            className="w-full bg-white text-emerald-700 hover:bg-emerald-50 text-lg py-6"
                            data-testid="button-checkout"
                          >
                            <CreditCard className="w-5 h-5 ml-2" />
                            {checkoutMutation.isPending ? 'جاري التسجيل...' : 'تسجيل في جميع الدورات'}
                          </Button>
                          <p className="text-sm text-white/80 text-center">
                            سيتم تسجيلك تلقائياً في جميع الدورات المختارة
                          </p>
                        </>
                      )}
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
