import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import CertificateGenerator from './CertificateGenerator';
import CertificateViewer from './CertificateViewer';
import { Award, Plus, Users, BookOpen } from 'lucide-react';

interface Certificate {
  id: string;
  titleAr: string;
  studentId: string;
  grade: string;
  teacherName: string;
  issuedAt: string;
  status: string;
}

export default function CertificatesPage() {
  const [activeTab, setActiveTab] = useState('my-certificates');
  const { user } = useAuth();

  // Fetch certificate statistics for supervisors/admins
  const { data: certificateStats } = useQuery<{
    totalCertificates: number;
    validCertificates: number;
    totalStudents: number;
  }>({
    queryKey: ['/api/certificates/stats'],
    enabled: user?.role === 'supervisor' || user?.role === 'admin',
  });

  // Get recent certificates for overview
  const { data: recentCertificates = [] } = useQuery<Certificate[]>({
    queryKey: ['/api/certificates', { recent: true, limit: 5 }],
    enabled: user?.role === 'supervisor' || user?.role === 'admin',
  });

  const isStudent = user?.role === 'student';
  const isSupervisorOrAdmin = user?.role === 'supervisor' || user?.role === 'admin';

  return (
    <div className="container mx-auto p-6" dir="rtl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-yellow-100 rounded-full">
            <Award className="h-8 w-8 text-yellow-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isStudent ? 'شهاداتي' : 'إدارة الشهادات'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isStudent 
                ? 'جميع الشهادات التي حصلت عليها'
                : 'إنشاء وإدارة شهادات الطلاب'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards for Supervisors/Admins */}
      {isSupervisorOrAdmin && certificateStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">إجمالي الشهادات</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {certificateStats.totalCertificates}
                  </p>
                </div>
                <Award className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">الشهادات الصالحة</p>
                  <p className="text-3xl font-bold text-green-600">
                    {certificateStats.validCertificates}
                  </p>
                </div>
                <Award className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">عدد الطلاب</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {certificateStats.totalStudents}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      {isStudent ? (
        // Student View: Show only their certificates
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              شهاداتي
            </CardTitle>
            <CardDescription>
              جميع الشهادات التي حصلت عليها من المنصة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CertificateViewer studentId={user?.id} />
          </CardContent>
        </Card>
      ) : (
        // Supervisor/Admin View: Tabs for different functions
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="my-certificates" className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              عرض الشهادات
            </TabsTrigger>
            <TabsTrigger value="generate" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              إنشاء شهادة
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              الشهادات الحديثة
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-certificates">
            <Card>
              <CardHeader>
                <CardTitle>جميع الشهادات</CardTitle>
                <CardDescription>
                  عرض وإدارة جميع الشهادات في النظام
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CertificateViewer showActions={false} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="generate">
            <CertificateGenerator />
          </TabsContent>

          <TabsContent value="recent">
            <Card>
              <CardHeader>
                <CardTitle>الشهادات الحديثة</CardTitle>
                <CardDescription>
                  آخر الشهادات التي تم إصدارها
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentCertificates.length === 0 ? (
                  <div className="text-center py-8">
                    <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">لا توجد شهادات حديثة</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentCertificates.map((certificate) => (
                      <div 
                        key={certificate.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                        data-testid={`recent-certificate-${certificate.id}`}
                      >
                        <div>
                          <h4 className="font-semibold">{certificate.titleAr}</h4>
                          <p className="text-sm text-gray-600">
                            المعلم: {certificate.teacherName} • التقدير: {certificate.grade}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(certificate.issuedAt).toLocaleDateString('ar-EG')}
                          </p>
                        </div>
                        <div className={`px-2 py-1 text-xs rounded-full ${
                          certificate.status === 'valid' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {certificate.status === 'valid' ? 'صالحة' : 'غير صالحة'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}