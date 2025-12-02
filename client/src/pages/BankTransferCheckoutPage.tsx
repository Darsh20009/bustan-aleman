import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Building2, Upload, CheckCircle, Clock, AlertCircle, ArrowRight, Copy, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

interface BankTransferRequest {
  id: string;
  userId: string;
  amount: string;
  currency: string;
  bankName?: string;
  accountHolderName?: string;
  transferReference?: string;
  transferDate?: string;
  receiptUrl?: string;
  status: string;
  createdAt: string;
}

export default function BankTransferCheckoutPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    bankName: '',
    accountHolderName: '',
    transferReference: '',
    transferDate: '',
    notes: '',
  });

  const { data: cartItems = [], isLoading: isLoadingCart } = useQuery({
    queryKey: ['/api/cart/full'],
  });

  const { data: existingRequests = [] } = useQuery<BankTransferRequest[]>({
    queryKey: ['/api/bank-transfer/my-requests'],
  });

  const submitBankTransferMutation = useMutation({
    mutationFn: async (data: typeof formData & { amount: number }) => {
      return await apiRequest('/api/bank-transfer/request', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bank-transfer/my-requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      queryClient.invalidateQueries({ queryKey: ['/api/cart/full'] });
      toast({
        title: "تم إرسال طلب التحويل",
        description: "سيتم مراجعة طلبك وتفعيل اشتراكك بعد التأكيد من الإدارة",
      });
      setLocation('/my-subscriptions');
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل في إرسال طلب التحويل",
        variant: "destructive",
      });
    },
  });

  const calculateTotal = () => {
    let total = 0;
    (cartItems as any[]).forEach((item: any) => {
      if (item.plan?.price) {
        total += parseFloat(item.plan.price);
      } else if (item.course?.price) {
        total += parseFloat(item.course.price);
      }
    });
    return total;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "تم النسخ",
      description: `تم نسخ ${label} بنجاح`,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = calculateTotal();
    if (amount <= 0) {
      toast({
        title: "خطأ",
        description: "السلة فارغة",
        variant: "destructive",
      });
      return;
    }
    submitBankTransferMutation.mutate({ ...formData, amount });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">تمت الموافقة</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">مرفوض</Badge>;
      case 'under_review':
        return <Badge className="bg-yellow-100 text-yellow-800">قيد المراجعة</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">قيد الانتظار</Badge>;
    }
  };

  if (isLoadingCart) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-lg text-gray-700">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-8 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation('/subscriptions')}
            className="mb-4"
            data-testid="button-back-subscriptions"
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة للاشتراكات
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Building2 className="w-8 h-8 text-blue-600" />
            الدفع عبر التحويل البنكي
          </h1>
          <p className="text-gray-600 mt-2">يرجى إتمام التحويل وإرسال بيانات التحويل للتأكيد</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-blue-900">بيانات الحساب البنكي</CardTitle>
                <CardDescription>قم بالتحويل لأحد الحسابات التالية</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="font-semibold text-blue-900 mb-2">بنك الراجحي</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">رقم الحساب:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold">123456789012</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => copyToClipboard('123456789012', 'رقم الحساب')}
                          data-testid="button-copy-account"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">رقم الآيبان:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs">SA1234567890123456789012</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => copyToClipboard('SA1234567890123456789012', 'رقم الآيبان')}
                          data-testid="button-copy-iban"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">اسم المستفيد:</span>
                      <span className="font-semibold">بستان الإيمان للتعليم</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <p className="font-semibold text-emerald-900 mb-2">البنك الأهلي</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">رقم الحساب:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold">987654321098</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => copyToClipboard('987654321098', 'رقم الحساب')}
                          data-testid="button-copy-account-2"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">رقم الآيبان:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs">SA9876543210987654321098</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => copyToClipboard('SA9876543210987654321098', 'رقم الآيبان')}
                          data-testid="button-copy-iban-2"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">اسم المستفيد:</span>
                      <span className="font-semibold">بستان الإيمان للتعليم</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">ملخص الطلب</CardTitle>
              </CardHeader>
              <CardContent>
                {(cartItems as any[]).length === 0 ? (
                  <p className="text-gray-500 text-center py-4">السلة فارغة</p>
                ) : (
                  <div className="space-y-3">
                    {(cartItems as any[]).map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">
                          {item.plan?.nameAr || item.course?.titleAr || 'عنصر'}
                        </span>
                        <span className="font-bold text-emerald-600">
                          {item.plan?.price || item.course?.price || '0'} ر.س
                        </span>
                      </div>
                    ))}
                    <div className="border-t pt-3 mt-3 flex justify-between items-center">
                      <span className="text-lg font-bold">الإجمالي:</span>
                      <span className="text-2xl font-bold text-emerald-600">
                        {calculateTotal().toFixed(2)} ر.س
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">تأكيد التحويل</CardTitle>
                <CardDescription>أدخل بيانات التحويل الخاصة بك</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="bankName">اسم البنك المحول منه</Label>
                    <Input
                      id="bankName"
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      placeholder="مثال: بنك الراجحي"
                      data-testid="input-bank-name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="accountHolderName">اسم صاحب الحساب</Label>
                    <Input
                      id="accountHolderName"
                      value={formData.accountHolderName}
                      onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                      placeholder="الاسم كما يظهر في الحساب"
                      data-testid="input-account-holder"
                    />
                  </div>

                  <div>
                    <Label htmlFor="transferReference">رقم المرجع / العملية</Label>
                    <Input
                      id="transferReference"
                      value={formData.transferReference}
                      onChange={(e) => setFormData({ ...formData, transferReference: e.target.value })}
                      placeholder="رقم العملية من إيصال التحويل"
                      data-testid="input-transfer-reference"
                    />
                  </div>

                  <div>
                    <Label htmlFor="transferDate">تاريخ التحويل</Label>
                    <Input
                      id="transferDate"
                      type="date"
                      value={formData.transferDate}
                      onChange={(e) => setFormData({ ...formData, transferDate: e.target.value })}
                      data-testid="input-transfer-date"
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">ملاحظات إضافية (اختياري)</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="أي ملاحظات أخرى..."
                      rows={3}
                      data-testid="input-notes"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3"
                    disabled={submitBankTransferMutation.isPending || (cartItems as any[]).length === 0}
                    data-testid="button-submit-transfer"
                  >
                    {submitBankTransferMutation.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                        جاري الإرسال...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 ml-2" />
                        إرسال طلب التحويل
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {existingRequests.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">طلباتي السابقة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {existingRequests.slice(0, 5).map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{request.amount} {request.currency}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(request.createdAt).toLocaleDateString('ar-SA')}
                          </p>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
