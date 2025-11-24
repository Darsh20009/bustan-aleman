import { useEffect, useRef, useCallback } from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

interface ZegoSessionProps {
  roomID: string;
  userID: string;
  userName: string;
  token: string;
  onLeaveRoom?: () => void;
}

export default function ZegoSession({ roomID, userID, userName, token, onLeaveRoom }: ZegoSessionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<any>(null);

  const handleLeaveRoom = useCallback(() => {
    console.log('User left ZegoCloud room');
    if (onLeaveRoom) {
      onLeaveRoom();
    }
  }, [onLeaveRoom]);

  useEffect(() => {
    if (!containerRef.current || !token) return;

    try {
      console.log('🎥 Initializing ZegoCloud session:', { roomID, userID, userName });

      // Create instance with token
      const zp = ZegoUIKitPrebuilt.create(token);
      instanceRef.current = zp;

      // Join room with configuration
      zp.joinRoom({
        container: containerRef.current,
        scenario: {
          mode: ZegoUIKitPrebuilt.VideoConference,
        },
        showScreenSharingButton: true,
        showPreJoinView: false,
        showRoomDetailsButton: false,
        showUserList: true,
        showLayoutButton: true,
        maxUsers: 50,
        onLeaveRoom: handleLeaveRoom,
        onJoinRoom: () => {
          console.log(`✅ User ${userName} joined room ${roomID}`);
        },
        onUserJoin: (users: any) => {
          console.log('👥 Users joined:', users);
        },
        onUserLeave: (users: any) => {
          console.log('👥 Users left:', users);
        },
      });
    } catch (error) {
      console.error('❌ Error initializing ZegoCloud session:', error);
    }

    return () => {
      // Cleanup on unmount
      if (instanceRef.current) {
        try {
          instanceRef.current.destroy();
        } catch (e) {
          console.log('Cleanup complete');
        }
      }
    };
  }, [roomID, userID, userName, token, handleLeaveRoom]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
      }}
      data-testid="zego-session-container"
    />
  );
}
