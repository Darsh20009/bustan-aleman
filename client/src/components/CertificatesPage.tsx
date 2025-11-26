import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Award, Download, Plus } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';

interface Certificate {
  id: string;
  titleAr: string;
  studentName: string;
  studentId: string;
  issuedAt: string;
  verificationToken: string;
}

export default function CertificatesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [studentId, setStudentId] = useState('');
  const [titleAr, setTitleAr] = useState('');

  // Fetch certificates
  const { data: certificates = [], isLoading } = useQuery<Certificate[]>({
    queryKey: ['/api/certificates'],
    enabled: user?.role === 'supervisor' || user?.role === 'admin',
  });

  // Fetch students for dropdown
  const { data: students = [] } = useQuery<Array<{ id: string; firstName: string; lastName: string }>>({
    queryKey: ['/api/students'],
    enabled: user?.role === 'supervisor' || user?.role === 'admin',
  });

  // Create certificate mutation
  const createCertMutation = useMutation({
    mutationFn: async (data: { studentId: string; titleAr: string }) => {
      return apiRequest('POST', '/api/certificates', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/certificates'] });
      setStudentId('');
      setTitleAr('');
      toast({ title: 'تم إنشاء الشهادة بنجاح' });
    },
    onError: (error: any) => {
      toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    },
  });

  const handleCreateCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !titleAr.trim()) {
      toast({ title: 'خطأ', description: 'جميع الحقول مطلوبة', variant: 'destructive' });
      return;
    }
    createCertMutation.mutate({ studentId, titleAr });
  };

  const downloadCertificate = (certId: string) => {
    const link = document.createElement('a');
    link.href = `/api/certificates/${certId}/pdf`;
    link.download = `certificate-${certId}.pdf`;
    link.click();
  };

  if (!user || (user.role !== 'supervisor' && user.role !== 'admin')) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p className="text-red-600">ليس لديك صلاحية للوصول لهذه الصفحة</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6" dir="rtl">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-amber-100 rounded-lg">
          <Award className="h-6 w-6 text-amber-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">إدارة الشهادات</h1>
          <p className="text-sm text-gray-600">إنشاء وإدارة شهادات الطلاب</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Certificate Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                إنشاء شهادة جديدة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateCertificate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">الطالب</label>
                  <Select value={studentId} onValueChange={setStudentId}>
                    <SelectTrigger data-testid="select-student">
                      <SelectValue placeholder="اختر الطالب" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.firstName} {student.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">عنوان الشهادة</label>
                  <Input
                    value={titleAr}
                    onChange={(e) => setTitleAr(e.target.value)}
                    placeholder="مثال: شهادة إتمام حفظ القرآن"
                    data-testid="input-title"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={createCertMutation.isPending}
                  className="w-full"
                  data-testid="button-create-certificate"
                >
                  {createCertMutation.isPending ? 'جاري الإنشاء...' : 'إنشاء الشهادة'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Certificates List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>الشهادات المصدرة</CardTitle>
              <CardDescription>{certificates.length} شهادة</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-center py-8 text-gray-500">جاري التحميل...</p>
              ) : certificates.length === 0 ? (
                <p className="text-center py-8 text-gray-500">لا توجد شهادات بعد</p>
              ) : (
                <div className="space-y-3">
                  {certificates.map((cert) => (
                    <div
                      key={cert.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                      data-testid={`certificate-item-${cert.id}`}
                    >
                      <div>
                        <p className="font-medium">{cert.studentName}</p>
                        <p className="text-sm text-gray-600">{cert.titleAr}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(cert.issuedAt).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadCertificate(cert.id)}
                        data-testid={`button-download-${cert.id}`}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
