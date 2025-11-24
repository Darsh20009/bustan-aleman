import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Loader2, PhoneOff } from 'lucide-react';

interface BigBlueButtonSessionProps {
  sessionId: string;
  onLeave: () => void;
}

export default function BigBlueButtonSession({ sessionId, onLeave }: BigBlueButtonSessionProps) {
  const { user, isLoading } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();
  const [joinUrl, setJoinUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

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
        const meetingID = `bustan_${sessionId}`;
        
        // Get BBB server URL from env or use demo
        const bbbServer = import.meta.env.VITE_BBB_SERVER || 'https://demo.bigbluebutton.org';

        // For demo.bigbluebutton.org, use direct join URL without authentication
        // For production BBB servers, you'd need to implement checksum-based authentication
        const joinUrl = bbbServer.includes('demo.bigbluebutton.org') 
          ? `${bbbServer}/api/join?meetingID=${encodeURIComponent(meetingID)}&fullName=${encodeURIComponent(displayName)}&redirect=true`
          : `${bbbServer}/api/join?meetingID=${encodeURIComponent(meetingID)}&fullName=${encodeURIComponent(displayName)}&redirect=true`;
        
        setJoinUrl(joinUrl);
        setLoading(false);
      } catch (error) {
        console.error('Error initializing BigBlueButton:', error);
        setLoading(false);
      }
    };

    initializeBBB();
  }, [isLoading, user, sessionId]);

  const handleLeaveSession = () => {
    // Clean up and navigate away
    onLeave?.();
  };

  if (isLoading || loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">جاري تحميل الحصة...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-black" dir="rtl">
      {/* Control Bar */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 shadow-lg flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-lg">الحصة المباشرة</h2>
          <p className="text-white/80 text-sm">bustan_Sessions</p>
        </div>
        <Button
          variant="destructive"
          onClick={handleLeaveSession}
          className="flex items-center gap-2"
          data-testid="button-leave-bbb"
        >
          <PhoneOff className="w-4 h-4" />
          مغادرة
        </Button>
      </div>

      {/* BBB Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden flex items-center justify-center bg-black"
        id="bbb-container"
      >
        {joinUrl && (
          <iframe
            ref={iframeRef}
            src={joinUrl}
            allow="camera; microphone; display-capture"
            allowFullScreen
            className="w-full h-full border-0"
            title="BigBlueButton Session"
          />
        )}
      </div>
    </div>
  );
}

// Type declaration for BigBlueButton
declare global {
  interface Window {
    bbbApiInstance?: any;
  }
}
