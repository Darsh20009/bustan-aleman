import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, Calendar, User, BookOpen, QrCode, Download, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Certificate {
  id: string;
  titleAr: string;
  titleEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  grade: string;
  teacherName: string;
  issuedAt: string;
  qrImageDataUrl?: string;
  code: string;
  verificationToken: string;
  status: string;
}

interface CertificateViewerProps {
  studentId?: string; // If provided, shows certificates for specific student
  showActions?: boolean; // Whether to show download/share actions
  isPublic?: boolean; // Public view mode (for verification)
}

export default function CertificateViewer({ 
  studentId, 
  showActions = true, 
  isPublic = false 
}: CertificateViewerProps) {
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { toast } = useToast();

  // Query to fetch certificates
  const { data: certificates = [], isLoading, error } = useQuery<Certificate[]>({
    queryKey: studentId ? ['/api/certificates', { studentId }] : ['/api/certificates'],
    enabled: !isPublic, // Only fetch if not in public mode
  });

  const handleDownloadCertificate = (certificate: Certificate) => {
    // Create a printable certificate content
    const content = `
      <div style="font-family: 'Arial', sans-serif; text-align: center; padding: 40px; direction: rtl;">
        <div style="border: 8px solid #2d5016; padding: 30px; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);">
          <h1 style="color: #2d5016; font-size: 36px; margin-bottom: 30px; font-weight: bold;">
            🏆 بستان الإيمان 🏆
          </h1>
          <h2 style="color: #1e40af; font-size: 28px; margin-bottom: 20px;">
            ${certificate.titleAr}
          </h2>
          ${certificate.titleEn ? `<h3 style="color: #64748b; font-size: 20px; margin-bottom: 20px;">${certificate.titleEn}</h3>` : ''}
          
          <div style="margin: 40px 0;">
            <p style="font-size: 18px; color: #374151; line-height: 1.8;">
              يشهد هذا أنه قد أتم بنجاح
            </p>
            <p style="font-size: 24px; color: #2d5016; font-weight: bold; margin: 20px 0;">
              الطالب المجتهد
            </p>
            ${certificate.descriptionAr ? `<p style="font-size: 16px; color: #6b7280; margin: 20px 0;">${certificate.descriptionAr}</p>` : ''}
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 50px;">
            <div style="text-align: right;">
              <p style="color: #374151;"><strong>التقدير:</strong> ${certificate.grade}</p>
              <p style="color: #374151;"><strong>المعلم:</strong> ${certificate.teacherName}</p>
              <p style="color: #374151;"><strong>تاريخ الإصدار:</strong> ${new Date(certificate.issuedAt).toLocaleDateString('ar-EG')}</p>
            </div>
            ${certificate.qrImageDataUrl ? `
              <div style="text-align: left;">
                <img src="${certificate.qrImageDataUrl}" alt="QR Code" style="width: 100px; height: 100px; border: 1px solid #d1d5db;" />
                <p style="color: #6b7280; font-size: 12px; margin-top: 5px;">رمز التحقق</p>
              </div>
            ` : ''}
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; color: #6b7280; font-size: 14px;">
            <p>رمز الشهادة: ${certificate.code}</p>
            <p>يمكن التحقق من صحة هذه الشهادة عبر موقعنا الإلكتروني</p>
          </div>
        </div>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>شهادة - ${certificate.titleAr}</title>
            <meta charset="utf-8">
            <style>
              @media print { 
                body { margin: 0; } 
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            ${content}
            <div class="no-print" style="text-align: center; margin: 20px;">
              <button onclick="window.print()" style="padding: 10px 20px; background: #2d5016; color: white; border: none; border-radius: 5px; cursor: pointer;">
                طباعة الشهادة
              </button>
              <button onclick="window.close()" style="padding: 10px 20px; background: #6b7280; color: white; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">
                إغلاق
              </button>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleShareCertificate = async (certificate: Certificate) => {
    const shareData = {
      title: `شهادة - ${certificate.titleAr}`,
      text: `حصلت على شهادة: ${certificate.titleAr} بتقدير ${certificate.grade}`,
      url: window.location.origin + `/verify/${certificate.verificationToken}`,
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        toast({
          title: "تم النسخ!",
          description: "تم نسخ رابط الشهادة إلى الحافظة",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive", 
        title: "خطأ في المشاركة",
        description: "لم نتمكن من مشاركة الشهادة",
      });
    }
  };

  const openDetails = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setDetailsOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4" dir="rtl">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 space-x-reverse">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12" dir="rtl">
        <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">حدث خطأ في تحميل الشهادات</p>
      </div>
    );
  }

  if (certificates.length === 0) {
    return (
      <div className="text-center py-12" dir="rtl">
        <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد شهادات</h3>
        <p className="text-gray-500">لم تحصل على أي شهادات بعد</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'bg-green-100 text-green-800';
      case 'revoked': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'valid': return 'صالحة';
      case 'revoked': return 'ملغية';
      case 'expired': return 'منتهية الصلاحية';
      default: return 'غير محددة';
    }
  };

  return (
    <div className="space-y-4" dir="rtl">
      {certificates.map((certificate) => (
        <Card 
          key={certificate.id} 
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => openDetails(certificate)}
          data-testid={`certificate-card-${certificate.id}`}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Award className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900">
                    {certificate.titleAr}
                  </h3>
                  {certificate.titleEn && (
                    <p className="text-sm text-gray-500">{certificate.titleEn}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {certificate.teacherName}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(certificate.issuedAt).toLocaleDateString('ar-EG')}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <Badge className={`text-xs ${getStatusColor(certificate.status)}`}>
                  {getStatusText(certificate.status)}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {certificate.grade}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Certificate Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-600" />
              تفاصيل الشهادة
            </DialogTitle>
            <DialogDescription>
              جميع تفاصيل الشهادة ومعلومات التحقق
            </DialogDescription>
          </DialogHeader>
          
          {selectedCertificate && (
            <div className="space-y-6">
              {/* Certificate Preview */}
              <div className="border-2 border-dashed border-gray-200 p-6 rounded-lg bg-gradient-to-br from-yellow-50 to-orange-50">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedCertificate.titleAr}
                  </h2>
                  {selectedCertificate.titleEn && (
                    <p className="text-lg text-gray-600 mb-4">
                      {selectedCertificate.titleEn}
                    </p>
                  )}
                  
                  {selectedCertificate.descriptionAr && (
                    <p className="text-gray-700 mb-4">
                      {selectedCertificate.descriptionAr}
                    </p>
                  )}
                  
                  <div className="flex justify-center items-center gap-8 mt-6">
                    <div>
                      <p className="text-sm text-gray-600">التقدير</p>
                      <Badge className="bg-green-100 text-green-800">
                        {selectedCertificate.grade}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">المعلم</p>
                      <p className="font-semibold">{selectedCertificate.teacherName}</p>
                    </div>
                  </div>
                  
                  {selectedCertificate.qrImageDataUrl && (
                    <div className="mt-6">
                      <img 
                        src={selectedCertificate.qrImageDataUrl} 
                        alt="QR Code" 
                        className="mx-auto border rounded w-24 h-24"
                      />
                      <p className="text-xs text-gray-500 mt-1">رمز التحقق</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Certificate Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">رمز الشهادة</p>
                  <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                    {selectedCertificate.code}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">تاريخ الإصدار</p>
                  <p className="text-sm">
                    {new Date(selectedCertificate.issuedAt).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              {/* Actions */}
              {showActions && (
                <div className="flex gap-2 pt-4">
                  <Button 
                    onClick={() => handleDownloadCertificate(selectedCertificate)}
                    className="flex-1"
                    data-testid="button-download-certificate"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    تحميل / طباعة
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => handleShareCertificate(selectedCertificate)}
                    className="flex-1"
                    data-testid="button-share-certificate"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    مشاركة
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}