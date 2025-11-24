import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, Calendar, Clock, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Session {
  id: string;
  studentName: string;
  sheikhName: string;
  sessionDate: string;
  sessionTime: string;
  roomToken: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
  isEnabled: boolean;
  notes?: string;
}

export default function StudentSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/student/live-sessions');
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      } else {
        throw new Error('Failed to fetch sessions');
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast({
        title: "خطأ",
        description: "فشل في جلب الحصص",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const joinSession = (roomToken: string) => {
    // Open session in same window - navigate directly
    window.location.href = `/session/${roomToken}`;
  };

  const getStatusBadge = (status: string, isEnabled: boolean) => {
    if (!isEnabled) {
      return <Badge variant="secondary" className="bg-gray-200">معطلة</Badge>;
    }
    switch (status) {
      case 'active':
        return <Badge className="bg-emerald-600">نشطة</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-600">مجدولة</Badge>;
      case 'completed':
        return <Badge className="bg-gray-600">منتهية</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-600">ملغاة</Badge>;
      default:
        return <Badge>غير معروف</Badge>;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ar-SA');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-emerald-700 text-lg">جاري تحميل الحصص...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-emerald-900 mb-2">الحصص المباشرة</h1>
          <p className="text-emerald-700 text-lg">احضر الحصص التعليمية مع الشيخ</p>
        </div>

        {/* Sessions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sessions.length === 0 ? (
            <Card className="col-span-full border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-12">
                <div className="text-center">
                  <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">لا توجد حصص متاحة حالياً</p>
                  <p className="text-gray-500 text-sm mt-2">سيتم إضافة حصص جديدة قريباً</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            sessions.map((session) => (
              <Card 
                key={session.id} 
                className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover-elevate transition-all overflow-hidden"
              >
                <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Video className="w-5 h-5" />
                      <CardTitle className="text-lg">{session.sheikhName}</CardTitle>
                    </div>
                    {getStatusBadge(session.status, session.isEnabled)}
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Date and Time */}
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600">التاريخ</p>
                        <p className="font-semibold text-gray-900">{formatDate(session.sessionDate)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600">الوقت</p>
                        <p className="font-semibold text-gray-900">{session.sessionTime}</p>
                      </div>
                    </div>

                    {/* Notes */}
                    {session.notes && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                        {session.notes}
                      </div>
                    )}

                    {/* Status Info */}
                    {!session.isEnabled && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-600">
                        <p>⏸️ الحصة معطلة حالياً، انتظر تفعيل الشيخ</p>
                      </div>
                    )}

                    {session.isEnabled && session.status !== 'cancelled' && (
                      <Button
                        onClick={() => joinSession(session.roomToken)}
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                        data-testid="button-join-session"
                      >
                        <Video className="w-4 h-4 ml-2" />
                        دخول الحصة المباشرة
                      </Button>
                    )}

                    {session.status === 'cancelled' && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
                        <p>❌ تم إلغاء هذه الحصة</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
