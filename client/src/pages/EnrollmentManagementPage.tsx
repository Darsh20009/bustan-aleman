import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, XCircle, Users, Clock, ArrowRight } from 'lucide-react';

interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  status: 'pending' | 'approved' | 'rejected';
  enrolledAt: string;
  studentName?: string;
  courseName?: string;
}

export default function EnrollmentManagementPage() {
  const { toast } = useToast();
  const [selectedCourse, setSelectedCourse] = useState<string>('');

  // Fetch courses for the supervisor
  const { data: courses = [] } = useQuery({
    queryKey: ['/api/supervisor/courses'],
    queryFn: async () => {
      const response = await fetch('/api/courses');
      return response.json();
    },
  });

  // Fetch all enrollments
  const { data: enrollments = [], refetch: refetchEnrollments } = useQuery({
    queryKey: ['enrollments'],
    queryFn: async () => {
      const response = await fetch('/api/enrollments');
      if (!response.ok) return [];
      return response.json();
    },
  });

  // Approve enrollment mutation
  const approveEnrollment = useMutation({
    mutationFn: async (enrollmentId: string) => {
      return apiRequest(`/api/enrollments/${enrollmentId}/approve`, 'POST', {});
    },
    onSuccess: () => {
      refetchEnrollments();
      toast({
        title: '✅ تم القبول',
        description: 'تم قبول طلب الانضمام بنجاح',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: '❌ خطأ',
        description: error.message || 'فشل قبول الطلب',
      });
    },
  });

  // Reject enrollment mutation
  const rejectEnrollment = useMutation({
    mutationFn: async (enrollmentId: string) => {
      return apiRequest(`/api/enrollments/${enrollmentId}/reject`, 'POST', {});
    },
    onSuccess: () => {
      refetchEnrollments();
      toast({
        title: '✅ تم الرفض',
        description: 'تم رفض طلب الانضمام',
      });
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: '❌ خطأ',
        description: error.message || 'فشل رفض الطلب',
      });
    },
  });

  const pendingEnrollments = enrollments.filter((e: Enrollment) => e.status === 'pending');
  const approvedEnrollments = enrollments.filter((e: Enrollment) => e.status === 'approved');
  const rejectedEnrollments = enrollments.filter((e: Enrollment) => e.status === 'rejected');

  const EnrollmentCard = ({ enrollment, status }: { enrollment: Enrollment; status: 'pending' | 'approved' | 'rejected' }) => (
    <Card className="border-emerald-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h4 className="font-semibold text-emerald-900">{enrollment.studentName || 'طالب'}</h4>
            <p className="text-sm text-gray-600 mt-1">الدورة: {enrollment.courseName || 'غير محدد'}</p>
            <p className="text-xs text-gray-500 mt-1">التاريخ: {new Date(enrollment.enrolledAt).toLocaleDateString('ar')}</p>
          </div>
          
          {status === 'pending' && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="default"
                className="bg-emerald-500 hover:bg-emerald-600"
                onClick={() => approveEnrollment.mutate(enrollment.id)}
                disabled={approveEnrollment.isPending}
              >
                <CheckCircle2 className="w-4 h-4 ml-1" />
                قبول
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => rejectEnrollment.mutate(enrollment.id)}
                disabled={rejectEnrollment.isPending}
              >
                <XCircle className="w-4 h-4 ml-1" />
                رفض
              </Button>
            </div>
          )}

          {status === 'approved' && (
            <div className="px-3 py-1 bg-emerald-100 rounded-lg text-sm text-emerald-700">
              ✓ موافق عليه
            </div>
          )}

          {status === 'rejected' && (
            <div className="px-3 py-1 bg-red-100 rounded-lg text-sm text-red-700">
              ✗ مرفوض
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-emerald-900 mb-2">إدارة طلبات الانضمام</h1>
          <p className="text-gray-600">قبول أو رفض طلبات الطلاب للانضمام للدورات</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-emerald-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">طلبات قيد الانتظار</p>
                  <p className="text-2xl font-bold text-emerald-600">{pendingEnrollments.length}</p>
                </div>
                <Clock className="w-8 h-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">موافق عليه</p>
                  <p className="text-2xl font-bold text-emerald-600">{approvedEnrollments.length}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">مرفوض</p>
                  <p className="text-2xl font-bold text-emerald-600">{rejectedEnrollments.length}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-emerald-700">الطلبات</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pending">قيد الانتظار ({pendingEnrollments.length})</TabsTrigger>
                <TabsTrigger value="approved">موافق عليه ({approvedEnrollments.length})</TabsTrigger>
                <TabsTrigger value="rejected">مرفوض ({rejectedEnrollments.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="space-y-4 mt-4">
                {pendingEnrollments.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">لا توجد طلبات قيد الانتظار</p>
                ) : (
                  pendingEnrollments.map((enrollment: Enrollment) => (
                    <EnrollmentCard key={enrollment.id} enrollment={enrollment} status="pending" />
                  ))
                )}
              </TabsContent>

              <TabsContent value="approved" className="space-y-4 mt-4">
                {approvedEnrollments.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">لا توجد طلبات موافق عليها</p>
                ) : (
                  approvedEnrollments.map((enrollment: Enrollment) => (
                    <EnrollmentCard key={enrollment.id} enrollment={enrollment} status="approved" />
                  ))
                )}
              </TabsContent>

              <TabsContent value="rejected" className="space-y-4 mt-4">
                {rejectedEnrollments.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">لا توجد طلبات مرفوضة</p>
                ) : (
                  rejectedEnrollments.map((enrollment: Enrollment) => (
                    <EnrollmentCard key={enrollment.id} enrollment={enrollment} status="rejected" />
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
