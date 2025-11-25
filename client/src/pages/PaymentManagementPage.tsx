import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Plus, DollarSign, Calendar, User } from 'lucide-react';
import { StudentPayment } from '@shared/schema';

interface StudentWithPayments {
  id: string;
  firstName: string;
  lastName?: string;
  phoneNumber: string;
  monthlyPrice?: string;
  payments: StudentPayment[];
}

export default function PaymentManagementPage() {
  const { toast } = useToast();
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    studentId: '',
    amount: '',
    currency: 'SAR',
    paymentMethod: 'whatsapp',
    subscriptionPeriod: 'monthly',
    sessionsIncluded: '4',
    expiryDate: '',
    notes: '',
  });

  // Get all students
  const { data: students = [], isLoading: isLoadingStudents } = useQuery<StudentWithPayments[]>({
    queryKey: ['/api/sheikh/students'],
  });

  // Get payments for selected student
  const { data: selectedPayments = [] } = useQuery<StudentPayment[]>({
    queryKey: ['/api/sheikh/payments', selectedStudent ?? ''],
    enabled: !!selectedStudent,
  });

  // Create payment mutation
  const createPaymentMutation = useMutation({
    mutationFn: (data: typeof formData) =>
      apiRequest('POST', '/api/sheikh/payments', {
        studentId: data.studentId,
        amount: parseFloat(data.amount),
        currency: data.currency,
        paymentMethod: data.paymentMethod,
        subscriptionPeriod: data.subscriptionPeriod,
        sessionsIncluded: parseInt(data.sessionsIncluded),
        expiryDate: data.expiryDate || undefined,
        notes: data.notes || undefined,
      }),
    onSuccess: () => {
      toast({ title: 'تم إنشاء الدفعة بنجاح' });
      queryClient.invalidateQueries({ queryKey: ['/api/sheikh/payments'] });
      setShowForm(false);
      setFormData({
        studentId: '',
        amount: '',
        currency: 'SAR',
        paymentMethod: 'whatsapp',
        subscriptionPeriod: 'monthly',
        sessionsIncluded: '4',
        expiryDate: '',
        notes: '',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ في إنشاء الدفعة',
        description: error.message || 'حدث خطأ غير متوقع',
        variant: 'destructive',
      });
    },
  });

  const handleCreatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId || !formData.amount) {
      toast({
        title: 'الرجاء ملء جميع الحقول المطلوبة',
        variant: 'destructive',
      });
      return;
    }
    createPaymentMutation.mutate(formData);
  };

  const selectedStudentData = students.find((s) => s.id === selectedStudent);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 md:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-8 h-8 text-emerald-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-emerald-900 font-arabic-serif">
              إدارة المدفوعات
            </h1>
          </div>
          <p className="text-emerald-700 font-arabic-sans">إدارة دفعات الطلاب والاشتراكات</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Students List */}
          <div className="md:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="font-arabic-serif text-lg">الطلاب</CardTitle>
                <CardDescription className="font-arabic-sans">
                  {students.length} طالب
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                {isLoadingStudents ? (
                  <div className="text-center text-gray-500 py-4">جاري التحميل...</div>
                ) : students.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">لا توجد طلاب</div>
                ) : (
                  students.map((student) => (
                    <button
                      key={student.id}
                      onClick={() => setSelectedStudent(student.id)}
                      className={`w-full text-right p-3 rounded-lg transition-colors ${
                        selectedStudent === student.id
                          ? 'bg-emerald-100 border-2 border-emerald-500'
                          : 'bg-gray-100 border-2 border-transparent hover:bg-gray-200'
                      }`}
                      data-testid={`button-student-${student.id}`}
                    >
                      <div className="font-semibold text-sm font-arabic-sans">
                        {student.firstName} {student.lastName || ''}
                      </div>
                      <div className="text-xs text-gray-600 font-arabic-sans">
                        {student.phoneNumber}
                      </div>
                    </button>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Payments List and Form */}
          <div className="md:col-span-2 space-y-6">
            {selectedStudentData && (
              <>
                {/* Student Info */}
                <Card className="bg-gradient-to-r from-emerald-50 to-teal-50">
                  <CardHeader>
                    <div className="flex items-center gap-3 justify-between">
                      <div>
                        <CardTitle className="font-arabic-serif">{selectedStudentData.firstName}</CardTitle>
                        <CardDescription className="font-arabic-sans">
                          {selectedStudentData.phoneNumber}
                        </CardDescription>
                      </div>
                      <User className="w-10 h-10 text-emerald-600" />
                    </div>
                  </CardHeader>
                </Card>

                {/* Add Payment Button */}
                {!showForm && (
                  <Button
                    onClick={() => {
                      setShowForm(true);
                      setFormData({ ...formData, studentId: selectedStudent });
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-arabic-sans gap-2"
                    data-testid="button-add-payment"
                  >
                    <Plus className="w-4 h-4" />
                    إضافة دفعة جديدة
                  </Button>
                )}

                {/* Payment Form */}
                {showForm && (
                  <Card className="border-2 border-emerald-200">
                    <CardHeader>
                      <CardTitle className="font-arabic-serif">إضافة دفعة جديدة</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleCreatePayment} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-arabic-sans font-semibold mb-1">
                              المبلغ *
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              required
                              value={formData.amount || ''}
                              onChange={(e) =>
                                setFormData({ ...formData, amount: e.target.value })
                              }
                              className="w-full px-3 py-2 border rounded-lg font-arabic-sans"
                              placeholder="500"
                              data-testid="input-payment-amount"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-arabic-sans font-semibold mb-1">
                              العملة
                            </label>
                            <select
                              value={formData.currency}
                              onChange={(e) =>
                                setFormData({ ...formData, currency: e.target.value })
                              }
                              className="w-full px-3 py-2 border rounded-lg font-arabic-sans"
                              data-testid="select-currency"
                            >
                              <option value="SAR">ريال سعودي (SAR)</option>
                              <option value="USD">دولار (USD)</option>
                              <option value="AED">درهم إماراتي (AED)</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-arabic-sans font-semibold mb-1">
                              طريقة الدفع
                            </label>
                            <select
                              value={formData.paymentMethod}
                              onChange={(e) =>
                                setFormData({ ...formData, paymentMethod: e.target.value })
                              }
                              className="w-full px-3 py-2 border rounded-lg font-arabic-sans"
                              data-testid="select-payment-method"
                            >
                              <option value="whatsapp">واتساب</option>
                              <option value="bank">تحويل بنكي</option>
                              <option value="cash">نقد</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-arabic-sans font-semibold mb-1">
                              فترة الاشتراك
                            </label>
                            <select
                              value={formData.subscriptionPeriod}
                              onChange={(e) =>
                                setFormData({ ...formData, subscriptionPeriod: e.target.value })
                              }
                              className="w-full px-3 py-2 border rounded-lg font-arabic-sans"
                              data-testid="select-subscription-period"
                            >
                              <option value="monthly">شهري</option>
                              <option value="quarterly">ثلاثي</option>
                              <option value="yearly">سنوي</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-arabic-sans font-semibold mb-1">
                              عدد الحصص
                            </label>
                            <input
                              type="number"
                              required
                              value={formData.sessionsIncluded}
                              onChange={(e) =>
                                setFormData({ ...formData, sessionsIncluded: e.target.value })
                              }
                              className="w-full px-3 py-2 border rounded-lg font-arabic-sans"
                              data-testid="input-sessions"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-arabic-sans font-semibold mb-1">
                              تاريخ الانتهاء
                            </label>
                            <input
                              type="date"
                              value={formData.expiryDate}
                              onChange={(e) =>
                                setFormData({ ...formData, expiryDate: e.target.value })
                              }
                              className="w-full px-3 py-2 border rounded-lg font-arabic-sans"
                              data-testid="input-expiry-date"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-arabic-sans font-semibold mb-1">
                            ملاحظات
                          </label>
                          <textarea
                            value={formData.notes}
                            onChange={(e) =>
                              setFormData({ ...formData, notes: e.target.value })
                            }
                            className="w-full px-3 py-2 border rounded-lg font-arabic-sans"
                            rows={3}
                            placeholder="أي ملاحظات إضافية..."
                            data-testid="textarea-notes"
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button
                            type="submit"
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-arabic-sans"
                            disabled={createPaymentMutation.isPending}
                            data-testid="button-submit-payment"
                          >
                            {createPaymentMutation.isPending ? 'جاري الإرسال...' : 'إنشاء الدفعة'}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowForm(false)}
                            className="flex-1 font-arabic-sans"
                            data-testid="button-cancel-payment"
                          >
                            إلغاء
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}

                {/* Payments List */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-arabic-serif flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-emerald-600" />
                      السجل المالي ({selectedPayments.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedPayments.length === 0 ? (
                      <div className="text-center text-gray-500 py-8 font-arabic-sans">
                        لا توجد دفعات لهذا الطالب
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {selectedPayments.map((payment) => (
                          <div
                            key={payment.id}
                            className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                            data-testid={`payment-record-${payment.id}`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <div className="font-semibold text-emerald-700 font-arabic-sans">
                                  {payment.amount} {payment.currency}
                                </div>
                                <div className="text-xs text-gray-600 font-arabic-sans">
                                  {payment.paymentMethod === 'whatsapp'
                                    ? 'واتساب'
                                    : payment.paymentMethod === 'bank'
                                      ? 'تحويل بنكي'
                                      : 'نقد'}
                                </div>
                              </div>
                              <div
                                className={`px-2 py-1 rounded text-xs font-semibold font-arabic-sans ${
                                  payment.status === 'active'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : payment.status === 'expired'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {payment.status === 'active'
                                  ? 'نشط'
                                  : payment.status === 'expired'
                                    ? 'منتهي'
                                    : 'قيد الانتظار'}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 font-arabic-sans">
                              <div>
                                حصص: {payment.sessionsRemaining}/{payment.sessionsIncluded}
                              </div>
                              {payment.expiryDate && (
                                <div>
                                  ينتهي: {new Date(payment.expiryDate).toLocaleDateString('ar-SA')}
                                </div>
                              )}
                            </div>
                            {payment.notes && (
                              <div className="mt-2 text-xs text-gray-700 bg-white p-2 rounded font-arabic-sans">
                                {payment.notes}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {!selectedStudent && (
              <Card className="text-center py-12">
                <div className="text-gray-500 font-arabic-sans mb-4">
                  <ArrowRight className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  اختر طالباً من القائمة لعرض ومعالجة دفعاته
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
