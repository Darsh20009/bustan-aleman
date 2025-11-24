import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Loader2, PhoneOff } from 'lucide-react';

interface JitsiMeetSessionProps {
  sessionId: string;
  onLeave: () => void;
}

export default function JitsiMeetSession({ sessionId, onLeave }: JitsiMeetSessionProps) {
  const { user, isLoading } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Ensure user is authenticated
    if (!isLoading && !user) {
      setLocation('/');
      return;
    }
  }, [isLoading, user, setLocation]);

  useEffect(() => {
    if (isLoading || !user) return;

    // Load Jitsi Meet API script
    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    
    script.onload = () => {
      initializeJitsi();
    };

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [isLoading, user, sessionId]);

  const initializeJitsi = () => {
    if (!containerRef.current || !window.JitsiMeetExternalAPI) return;

    const roomName = `bustan_${sessionId}`;
    const displayName = user?.firstName || 'Guest';

    try {
      const api = new window.JitsiMeetExternalAPI(
        'meet.jit.si',
        {
          roomName: roomName,
          parentNode: containerRef.current,
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            disableDeepLinking: true,
            prejoinPageEnabled: false, // فوري بدون صفحة pre-join
            openNewWindowForScreenShare: true,
          },
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: [
              'microphone',
              'camera',
              'desktop',
              'chat',
              'settings',
            ],
            SHOW_JITSI_WATERMARK: false,
          },
          userInfo: {
            displayName: displayName,
          },
        }
      );

      // Don't auto-leave when conference ends - let user decide when to close
      // Users can close the window manually when they're done

      // Store API reference for cleanup
      (window as any).jitsiApiInstance = api;
    } catch (error) {
      console.error('Error initializing Jitsi Meet:', error);
    }
  };

  const handleLeaveSession = () => {
    // Clean up Jitsi API
    if ((window as any).jitsiApiInstance) {
      try {
        (window as any).jitsiApiInstance.dispose();
      } catch (error) {
        console.error('Error disposing Jitsi API:', error);
      }
    }
    // Don't navigate away - let the user stay in the window
    // They can close it manually when done
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
          data-testid="button-leave-jitsi"
        >
          <PhoneOff className="w-4 h-4" />
          مغادرة
        </Button>
      </div>

      {/* Jitsi Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden"
        id="jitsi-container"
      />
    </div>
  );
}

// Type declaration for Jitsi Meet External API
declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
    jitsiApiInstance?: any;
  }
}
