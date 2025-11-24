import { useEffect } from 'react';
import { useRoute } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';

export default function LiveSession() {
  const [, params] = useRoute('/session/:sessionId');
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation('/');
      return;
    }

    if (!isLoading && user && params?.sessionId) {
      // Get secure join URL from backend with checksum
      const meetingID = `bustan_${params.sessionId}`;

      console.log('🔐 Requesting secure BBB join URL:', { meetingID });

      fetch(`/api/bbb-join-url?meetingID=${encodeURIComponent(meetingID)}`)
        .then(res => res.json())
        .then(data => {
          if (data.joinUrl) {
            console.log('✅ Redirecting to BBB:', data.joinUrl);
            window.location.href = data.joinUrl;
          } else {
            console.error('No joinUrl in response:', data);
            setLocation('/');
          }
        })
        .catch(error => {
          console.error('Error getting BBB join URL:', error);
          setLocation('/');
        });
    }
  }, [isLoading, user, params?.sessionId, setLocation]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user || !params?.sessionId) {
    return null;
  }

  // Loading screen while redirecting to BBB
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
        <p className="text-white text-xl">جاري الاتصال بـ BigBlueButton...</p>
        <p className="text-white text-sm mt-2">يرجى الانتظار</p>
      </div>
    </div>
  );
}
