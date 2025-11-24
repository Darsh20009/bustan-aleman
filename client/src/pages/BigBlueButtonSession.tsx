import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Loader2, PhoneOff } from 'lucide-react';

interface BigBlueButtonSessionProps {
  sessionId: string; // This is roomToken passed from URL
  onLeave: () => void;
}

export default function BigBlueButtonSession({ sessionId, onLeave }: BigBlueButtonSessionProps) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const windowRef = useRef<Window | null>(null);

  useEffect(() => {
    // Ensure user is authenticated
    if (!isLoading && !user) {
      setLocation('/');
      return;
    }
  }, [isLoading, user, setLocation]);

  useEffect(() => {
    if (isLoading || !user) return;

    const initializeBBB = async () => {
      try {
        const displayName = user?.firstName || 'Guest';
        // sessionId here is actually the roomToken
        const meetingID = `bustan_${sessionId}`;
        
        // Get BBB server URL from env or use demo
        const bbbServer = import.meta.env.VITE_BBB_SERVER || 'https://demo.bigbluebutton.org';

        console.log('BBB Session Info:', { meetingID, displayName, bbbServer });

        // Create join URL - BigBlueButton API
        // The demo server doesn't require authentication, just pass the meeting ID and name
        const params = new URLSearchParams({
          meetingID: meetingID,
          fullName: displayName,
          redirect: 'true'
        });

        const joinUrl = `${bbbServer}/api/join?${params.toString()}`;
        
        console.log('BBB Join URL:', joinUrl);

        // Instead of iframe, redirect to the join URL directly
        // This is more reliable for BigBlueButton
        window.location.href = joinUrl;
        
        setLoading(false);
      } catch (error) {
        console.error('Error initializing BigBlueButton:', error);
        setError('فشل في تحميل الحصة');
        setLoading(false);
      }
    };

    initializeBBB();
  }, [isLoading, user, sessionId]);

  const handleLeaveSession = () => {
    // Close the window if it was opened by us
    if (windowRef.current && !windowRef.current.closed) {
      windowRef.current.close();
    }
    onLeave?.();
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">جاري تحميل الحصة...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-600 text-white p-6 rounded-lg">
            <p className="text-xl font-bold">{error}</p>
            <Button 
              variant="secondary" 
              onClick={handleLeaveSession}
              className="mt-4"
            >
              العودة
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Loading screen while redirecting
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
        <p className="text-white text-xl">جاري الاتصال بـ BigBlueButton...</p>
        <p className="text-white text-sm mt-2">سيتم فتح الحصة في نافذة جديدة</p>
      </div>
    </div>
  );
}
