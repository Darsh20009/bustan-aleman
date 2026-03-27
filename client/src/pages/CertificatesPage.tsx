import { useState, useEffect } from 'react';
import { StudentLayout } from './student/StudentLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { Award, Download, Calendar, BookOpen, Star } from 'lucide-react';

interface Certificate {
  id: string;
  title: string;
  description: string;
  issuedDate: string;
  type: 'memorization' | 'course' | 'attendance' | 'achievement';
  level?: string;
  surahRange?: string;
}

export function CertificatesPage() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const res = await fetch('/api/student/certificates', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setCertificates(data);
      }
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'memorization': return 'حفظ';
      case 'course': return 'دورة';
      case 'attendance': return 'حضور';
      case 'achievement': return 'إنجاز';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'memorization': return 'bg-emerald-100 text-emerald-700';
      case 'course': return 'bg-blue-100 text-blue-700';
      case 'attendance': return 'bg-amber-100 text-amber-700';
      case 'achievement': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <StudentLayout>
      <div className="p-4 md:p-6 space-y-6" dir="rtl" data-testid="certificates-page">
        <div className="flex items-center gap-3">
          <Award className="w-7 h-7 text-[#D4AF37]" />
          <h1 className="text-2xl font-bold text-[#2D5A3D]">شهاداتي</h1>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#2D5A3D]"></div>
          </div>
        ) : certificates.length === 0 ? (
          <Card className="p-12 text-center">
            <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-500 mb-2">لا توجد شهادات بعد</h3>
            <p className="text-gray-400">أكمل حفظ أجزاء من القرآن أو أنهِ دورة للحصول على شهادتك الأولى</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {certificates.map((cert) => (
              <Card key={cert.id} className="overflow-hidden border-2 border-[#D4AF37]/20 hover:border-[#D4AF37]/50 transition-all" data-testid={`card-certificate-${cert.id}`}>
                <div className="bg-gradient-to-br from-[#2D5A3D] to-[#1a3a25] p-6 text-center">
                  <Award className="w-12 h-12 text-[#D4AF37] mx-auto mb-2" />
                  <h3 className="text-white font-bold text-lg">{cert.title}</h3>
                  {cert.level && <p className="text-[#D4AF37] text-sm mt-1">{cert.level}</p>}
                </div>
                <CardContent className="p-4 space-y-3">
                  <p className="text-gray-600 text-sm">{cert.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge className={getTypeColor(cert.type)}>{getTypeLabel(cert.type)}</Badge>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(cert.issuedDate).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                  {cert.surahRange && (
                    <div className="flex items-center gap-1 text-sm text-[#2D5A3D]">
                      <BookOpen className="w-4 h-4" />
                      <span>{cert.surahRange}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
