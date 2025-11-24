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
      // Redirect directly to BigBlueButton
      const displayName = user?.firstName || 'Guest';
      const meetingID = `bustan_${params.sessionId}`;
      const bbbServer = import.meta.env.VITE_BBB_SERVER || 'https://demo.bigbluebutton.org';

      console.log('BBB Direct Join:', { meetingID, displayName, bbbServer });

      const joinUrl = `${bbbServer}/api/join?meetingID=${encodeURIComponent(meetingID)}&fullName=${encodeURIComponent(displayName)}&redirect=true`;
      
      console.log('Redirecting to:', joinUrl);
      
      // Redirect directly
      window.location.href = joinUrl;
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
