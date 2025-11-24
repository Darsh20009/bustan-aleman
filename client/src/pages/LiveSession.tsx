import { useEffect, useState } from 'react';
import { useRoute } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import { Loader2 } from 'lucide-react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import ZegoSession from '@/components/ZegoSession';

interface ZegoConfig {
  appID: number;
  serverSecret: string;
}

export default function LiveSession() {
  const [, params] = useRoute('/session/:sessionId');
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [zegoToken, setZegoToken] = useState<string | null>(null);
  const [loadingError, setLoadingError] = useState<string | null>(null);

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
      const roomID = `bustan_${params.sessionId}`;
      const userID = user.id;
      const userName = user.firstName || 'Guest';

      console.log('🎥 Requesting ZegoCloud config:', { roomID, userID, userName });

      fetch('/api/zego-config')
        .then(res => res.json())
        .then((config: ZegoConfig) => {
          if (config.appID && config.serverSecret) {
            console.log('✅ ZegoCloud config received, generating token...');
            
            try {
              // Generate token on frontend using official method
              const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
                config.appID,
                config.serverSecret,
                roomID,
                userID,
                userName
              );
              
              console.log('✅ ZegoCloud token generated:', { roomID, userID, userName });
              setZegoToken(kitToken);
            } catch (error) {
              console.error('❌ Error generating token:', error);
              setLoadingError('فشل في توليد رمز الجلسة');
              setTimeout(() => setLocation('/'), 3000);
            }
          } else {
            console.error('Invalid config:', config);
            setLoadingError('بيانات الخادم غير كاملة');
            setTimeout(() => setLocation('/'), 3000);
          }
        })
        .catch(error => {
          console.error('Error getting ZegoCloud config:', error);
          setLoadingError('خطأ في الاتصال بالخادم');
          setTimeout(() => setLocation('/'), 3000);
        });
    }
  }, [isLoading, user, params?.sessionId, setLocation]);

  const handleLeaveRoom = () => {
    console.log('Leaving ZegoCloud room');
    setLocation('/');
  };

  if (isLoading || !zegoToken) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">{loadingError || 'جاري تحضير الحصة...'}</p>
          <p className="text-white text-sm mt-2">يرجى الانتظار</p>
        </div>
      </div>
    );
  }

  if (!user || !params?.sessionId) {
    return null;
  }

  const roomID = `bustan_${params.sessionId}`;
  const userID = user.id;
  const userName = user.firstName || 'Guest';

  // Render ZegoCloud session
  return (
    <div className="fixed inset-0 w-full h-full" data-testid="live-session-container">
      <ZegoSession
        roomID={roomID}
        userID={userID}
        userName={userName}
        token={zegoToken}
        onLeaveRoom={handleLeaveRoom}
      />
    </div>
  );
}
