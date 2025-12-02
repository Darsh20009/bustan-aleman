import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Search,
  Filter,
  RefreshCw,
  User,
  Phone,
  Calendar,
  Receipt,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BankTransferRequest {
  id: string;
  userId: string;
  subscriptionId?: string;
  amount: string;
  currency: string;
  bankName?: string;
  accountHolderName?: string;
  transferReference?: string;
  transferDate?: string;
  receiptUrl?: string;
  receiptFileName?: string;
  status: string;
  notes?: string;
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  userName?: string;
  userPhone?: string;
}

export default function BankTransferAdminPage() {
  const { toast } = useToast();
  const [selectedRequest, setSelectedRequest] = useState<BankTransferRequest | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const { data: requests = [], isLoading, refetch } = useQuery<BankTransferRequest[]>({
    queryKey: ['/api/admin/bank-transfer/requests', activeTab],
    queryFn: async () => {
      const statusParam = activeTab === 'all' ? '' : `?status=${activeTab}`;
      const response = await fetch(`/api/admin/bank-transfer/requests${statusParam}`);
      if (!response.ok) throw new Error('Failed to fetch requests');
      return response.json();
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      return await apiRequest(`/api/admin/bank-transfer/request/${id}/approve`, 'POST', { notes });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bank-transfer/requests'] });
      toast({
        title: "تمت الموافقة",
        description: "تمت الموافقة على طلب التحويل البنكي بنجاح",
      });
      setApproveDialogOpen(false);
      setSelectedRequest(null);
      setAdminNotes('');
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل في الموافقة على الطلب",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      return await apiRequest(`/api/admin/bank-transfer/request/${id}/reject`, 'POST', { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bank-transfer/requests'] });
      toast({
        title: "تم الرفض",
        description: "تم رفض طلب التحويل البنكي",
      });
      setRejectDialogOpen(false);
      setSelectedRequest(null);
      setRejectionReason('');
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل في رفض الطلب",
        variant: "destructive",
      });
    },
  });

  const filteredRequests = requests.filter((request) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      request.userName?.toLowerCase().includes(searchLower) ||
      request.userPhone?.includes(searchTerm) ||
      request.transferReference?.toLowerCase().includes(searchLower) ||
      request.bankName?.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            تمت الموافقة
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            مرفوض
          </Badge>
        );
      case 'under_review':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            قيد المراجعة
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            قيد الانتظار
          </Badge>
        );
    }
  };

  const getStats = () => {
    const pending = requests.filter(r => r.status === 'pending').length;
    const underReview = requests.filter(r => r.status === 'under_review').length;
    const approved = requests.filter(r => r.status === 'approved').length;
    const rejected = requests.filter(r => r.status === 'rejected').length;
    const totalAmount = requests
      .filter(r => r.status === 'approved')
      .reduce((sum, r) => sum + parseFloat(r.amount || '0'), 0);
    return { pending, underReview, approved, rejected, totalAmount };
  };

  const stats = getStats();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-lg text-gray-700">جاري تحميل الطلبات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-8 px-4" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Building2 className="w-8 h-8 text-blue-600" />
            إدارة طلبات التحويل البنكي
          </h1>
          <p className="text-gray-600 mt-2">مراجعة والموافقة على طلبات التحويل البنكي</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-yellow-800">{stats.pending}</p>
              <p className="text-sm text-yellow-600">قيد الانتظار</p>
            </CardContent>
          </Card>
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <Eye className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-800">{stats.underReview}</p>
              <p className="text-sm text-blue-600">قيد المراجعة</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-800">{stats.approved}</p>
              <p className="text-sm text-green-600">تمت الموافقة</p>
            </CardContent>
          </Card>
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4 text-center">
              <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-800">{stats.rejected}</p>
              <p className="text-sm text-red-600">مرفوض</p>
            </CardContent>
          </Card>
          <Card className="bg-emerald-50 border-emerald-200">
            <CardContent className="p-4 text-center">
              <Receipt className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-emerald-800">{stats.totalAmount.toFixed(2)}</p>
              <p className="text-sm text-emerald-600">إجمالي المعتمد (ر.س)</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <CardTitle>قائمة الطلبات</CardTitle>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="بحث بالاسم، الهاتف، المرجع..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                    data-testid="input-search-requests"
                  />
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => refetch()}
                  data-testid="button-refresh-requests"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-5 w-full mb-6">
                <TabsTrigger value="all" data-testid="tab-all">الكل</TabsTrigger>
                <TabsTrigger value="pending" data-testid="tab-pending">قيد الانتظار</TabsTrigger>
                <TabsTrigger value="under_review" data-testid="tab-under-review">قيد المراجعة</TabsTrigger>
                <TabsTrigger value="approved" data-testid="tab-approved">تمت الموافقة</TabsTrigger>
                <TabsTrigger value="rejected" data-testid="tab-rejected">مرفوض</TabsTrigger>
              </TabsList>

              <div className="space-y-4">
                {filteredRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">لا توجد طلبات</p>
                  </div>
                ) : (
                  filteredRequests.map((request) => (
                    <Card key={request.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <User className="w-5 h-5 text-gray-500" />
                              <span className="font-semibold text-lg">{request.userName || 'غير معروف'}</span>
                              {getStatusBadge(request.status)}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                <span>{request.userPhone || '-'}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Receipt className="w-4 h-4" />
                                <span className="font-bold text-emerald-600">{request.amount} {request.currency}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Building2 className="w-4 h-4" />
                                <span>{request.bankName || '-'}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(request.createdAt).toLocaleDateString('ar-SA')}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedRequest(request);
                                setViewDialogOpen(true);
                              }}
                              data-testid={`button-view-${request.id}`}
                            >
                              <Eye className="w-4 h-4 ml-1" />
                              عرض
                            </Button>
                            {(request.status === 'pending' || request.status === 'under_review') && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    setApproveDialogOpen(true);
                                  }}
                                  data-testid={`button-approve-${request.id}`}
                                >
                                  <CheckCircle className="w-4 h-4 ml-1" />
                                  موافقة
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    setRejectDialogOpen(true);
                                  }}
                                  data-testid={`button-reject-${request.id}`}
                                >
                                  <XCircle className="w-4 h-4 ml-1" />
                                  رفض
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle>تفاصيل طلب التحويل البنكي</DialogTitle>
            <DialogDescription>معلومات كاملة عن الطلب</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">اسم المستخدم</p>
                  <p className="font-semibold">{selectedRequest.userName || 'غير معروف'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">رقم الهاتف</p>
                  <p className="font-semibold">{selectedRequest.userPhone || '-'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">المبلغ</p>
                  <p className="font-semibold text-emerald-600">{selectedRequest.amount} {selectedRequest.currency}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">الحالة</p>
                  {getStatusBadge(selectedRequest.status)}
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">اسم البنك</p>
                  <p className="font-semibold">{selectedRequest.bankName || '-'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">اسم صاحب الحساب</p>
                  <p className="font-semibold">{selectedRequest.accountHolderName || '-'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">رقم المرجع</p>
                  <p className="font-semibold font-mono">{selectedRequest.transferReference || '-'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">تاريخ التحويل</p>
                  <p className="font-semibold">
                    {selectedRequest.transferDate
                      ? new Date(selectedRequest.transferDate).toLocaleDateString('ar-SA')
                      : '-'}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg col-span-2">
                  <p className="text-sm text-gray-500">تاريخ الطلب</p>
                  <p className="font-semibold">
                    {new Date(selectedRequest.createdAt).toLocaleString('ar-SA')}
                  </p>
                </div>
                {selectedRequest.notes && (
                  <div className="p-3 bg-gray-50 rounded-lg col-span-2">
                    <p className="text-sm text-gray-500">ملاحظات المستخدم</p>
                    <p className="font-semibold">{selectedRequest.notes}</p>
                  </div>
                )}
                {selectedRequest.rejectionReason && (
                  <div className="p-3 bg-red-50 rounded-lg col-span-2">
                    <p className="text-sm text-red-500">سبب الرفض</p>
                    <p className="font-semibold text-red-800">{selectedRequest.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>تأكيد الموافقة</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من الموافقة على هذا الطلب؟ سيتم تفعيل الاشتراك تلقائياً.
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="font-semibold">{selectedRequest.userName}</p>
                <p className="text-emerald-600 font-bold">{selectedRequest.amount} {selectedRequest.currency}</p>
              </div>
              <div>
                <label className="text-sm font-medium">ملاحظات إدارية (اختياري)</label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="أضف ملاحظات..."
                  rows={2}
                  data-testid="input-admin-notes"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
              إلغاء
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => {
                if (selectedRequest) {
                  approveMutation.mutate({ id: selectedRequest.id, notes: adminNotes });
                }
              }}
              disabled={approveMutation.isPending}
              data-testid="button-confirm-approve"
            >
              {approveMutation.isPending ? (
                <Loader2 className="w-4 h-4 ml-1 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 ml-1" />
              )}
              تأكيد الموافقة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>رفض الطلب</DialogTitle>
            <DialogDescription>
              يرجى تحديد سبب الرفض. سيتم إرسال إشعار للمستخدم.
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="font-semibold">{selectedRequest.userName}</p>
                <p className="text-red-600 font-bold">{selectedRequest.amount} {selectedRequest.currency}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-red-700">سبب الرفض *</label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="أدخل سبب الرفض..."
                  rows={3}
                  className="border-red-200 focus:border-red-400"
                  data-testid="input-rejection-reason"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              إلغاء
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedRequest && rejectionReason.trim()) {
                  rejectMutation.mutate({ id: selectedRequest.id, reason: rejectionReason });
                }
              }}
              disabled={rejectMutation.isPending || !rejectionReason.trim()}
              data-testid="button-confirm-reject"
            >
              {rejectMutation.isPending ? (
                <Loader2 className="w-4 h-4 ml-1 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4 ml-1" />
              )}
              تأكيد الرفض
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
