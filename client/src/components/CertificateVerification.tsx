import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, CheckCircle, XCircle, Search, Award, Calendar, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Certificate {
  id: string;
  titleAr: string;
  titleEn?: string;
  descriptionAr?: string;
  grade: string;
  teacherName: string;
  issuedAt: string;
  code: string;
  status: string;
  qrImageDataUrl?: string;
}

interface CertificateVerificationProps {
  verificationToken?: string; // From URL params
  publicMode?: boolean;
}

export default function CertificateVerification({ 
  verificationToken: initialToken,
  publicMode = true 
}: CertificateVerificationProps) {
  const [token, setToken] = useState(initialToken || '');
  const [searchToken, setSearchToken] = useState('');
  const [shouldFetch, setShouldFetch] = useState(!!initialToken);
  const { toast } = useToast();

  // Query to verify certificate
  const { 
    data: certificate, 
    isLoading, 
    error, 
    refetch,
    isError
  } = useQuery<Certificate>({
    queryKey: ['/api/certificates/verify', token],
    queryFn: async () => {
      const response = await fetch(`/api/certificates/verify/${token}`);
      if (!response.ok) {
        throw new Error('Certificate not found or invalid');
      }
      return response.json();
    },
    enabled: shouldFetch && !!token,
    retry: false,
  });

  const handleVerify = () => {
    if (!searchToken.trim()) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى إدخال رمز التحقق أو الرابط",
      });
      return;
    }

    // Extract token from URL if a full URL is provided
    let tokenToUse = searchToken.trim();
    if (tokenToUse.includes('/verify/')) {
      const parts = tokenToUse.split('/verify/');
      tokenToUse = parts[parts.length - 1];
    }

    setToken(tokenToUse);
    setShouldFetch(true);
    refetch();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'revoked':
        return <XCircle className="h-8 w-8 text-red-500" />;
      case 'expired':
        return <XCircle className="h-8 w-8 text-gray-500" />;
      default:
        return <XCircle className="h-8 w-8 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'valid':
        return { text: 'شهادة صالحة وموثقة', color: 'text-green-600', bg: 'bg-green-50' };
      case 'revoked':
        return { text: 'شهادة ملغية', color: 'text-red-600', bg: 'bg-red-50' };
      case 'expired':
        return { text: 'شهادة منتهية الصلاحية', color: 'text-gray-600', bg: 'bg-gray-50' };
      default:
        return { text: 'حالة غير معروفة', color: 'text-gray-600', bg: 'bg-gray-50' };
    }
  };

  // Auto-verify if token is provided in props
  useEffect(() => {
    if (initialToken && !certificate && !isLoading) {
      setShouldFetch(true);
    }
  }, [initialToken, certificate, isLoading]);

  return (
    <div className="container mx-auto p-6 max-w-4xl" dir="rtl">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="p-4 bg-blue-100 rounded-full">
            <Shield className="h-12 w-12 text-blue-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">التحقق من الشهادات</h1>
        <p className="text-gray-600">
          تحقق من صحة الشهادات الصادرة من منصة بستان الإيمان
        </p>
      </div>

      {/* Search Section */}
      {!certificate && !isLoading && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              البحث عن شهادة
            </CardTitle>
            <CardDescription>
              أدخل رمز التحقق أو الرابط الكامل للشهادة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                value={searchToken}
                onChange={(e) => setSearchToken(e.target.value)}
                placeholder="أدخل رمز التحقق أو رابط الشهادة..."
                className="flex-1"
                data-testid="input-verification-token"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleVerify();
                  }
                }}
              />
              <Button 
                onClick={handleVerify}
                disabled={!searchToken.trim()}
                data-testid="button-verify"
              >
                <Search className="h-4 w-4 mr-2" />
                تحقق
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              يمكنك إدخال الرمز المطبوع على الشهادة أو مسح رمز QR ضوئياً
            </p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">جاري التحقق من الشهادة...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {isError && !isLoading && (
        <Alert className="mb-6">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>لم يتم العثور على الشهادة</strong>
            <br />
            يرجى التأكد من صحة رمز التحقق أو الرابط المُدخل
          </AlertDescription>
        </Alert>
      )}

      {/* Certificate Display */}
      {certificate && !isLoading && (
        <Card className="mb-6">
          <CardContent className="p-8">
            {/* Status Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                {getStatusIcon(certificate.status)}
              </div>
              <div className={`inline-block px-4 py-2 rounded-full ${getStatusText(certificate.status).bg}`}>
                <span className={`font-semibold ${getStatusText(certificate.status).color}`}>
                  {getStatusText(certificate.status).text}
                </span>
              </div>
            </div>

            {/* Certificate Details */}
            <div className="border-2 border-dashed border-gray-200 p-8 rounded-lg bg-gradient-to-br from-yellow-50 to-orange-50">
              <div className="text-center">
                <div className="mb-6">
                  <div className="flex items-center justify-center mb-4">
                    <Award className="h-12 w-12 text-yellow-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {certificate.titleAr}
                  </h2>
                  {certificate.titleEn && (
                    <p className="text-xl text-gray-600 mb-4">
                      {certificate.titleEn}
                    </p>
                  )}
                </div>

                {certificate.descriptionAr && (
                  <div className="mb-6">
                    <p className="text-gray-700 leading-relaxed">
                      {certificate.descriptionAr}
                    </p>
                  </div>
                )}

                {/* Certificate Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Award className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-500">التقدير</p>
                    <Badge className="bg-green-100 text-green-800 text-sm">
                      {certificate.grade}
                    </Badge>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-500">المعلم</p>
                    <p className="font-semibold text-gray-900">{certificate.teacherName}</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Calendar className="h-6 w-6 text-purple-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-500">تاريخ الإصدار</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(certificate.issuedAt).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                </div>

                {/* QR Code */}
                {certificate.qrImageDataUrl && (
                  <div className="mt-8">
                    <img 
                      src={certificate.qrImageDataUrl} 
                      alt="QR Code" 
                      className="mx-auto border rounded w-32 h-32"
                    />
                    <p className="text-sm text-gray-500 mt-2">رمز التحقق الأصلي</p>
                  </div>
                )}

                {/* Certificate Footer */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>رمز الشهادة:</strong> {certificate.code}</p>
                    <p><strong>تاريخ التحقق:</strong> {new Date().toLocaleDateString('ar-EG')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Footer */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 text-blue-800">
                <Shield className="h-5 w-5" />
                <span className="font-medium">تم التحقق من الشهادة بنجاح</span>
              </div>
              <p className="text-center text-sm text-blue-600 mt-2">
                هذه الشهادة صادرة من منصة بستان الإيمان التعليمية وقد تم التحقق من صحتها
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">كيفية التحقق من الشهادات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">1</div>
              <div>
                <p className="font-medium">استخدم رمز التحقق</p>
                <p>أدخل الرمز المطبوع على الشهادة الورقية</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">2</div>
              <div>
                <p className="font-medium">امسح رمز QR</p>
                <p>استخدم كاميرا هاتفك لمسح رمز QR الموجود على الشهادة</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">3</div>
              <div>
                <p className="font-medium">استخدم الرابط المباشر</p>
                <p>يمكن نسخ الرابط ولصقه مباشرة في المتصفح</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}