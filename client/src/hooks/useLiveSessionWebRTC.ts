import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Participant {
  userId: string;
  role: string;
  studentId?: string;
  isHandRaised?: boolean;
  isMuted?: boolean;
  isAudioMutedByHost?: boolean;
  reaction?: string;
}

interface Message {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
  isPrivate?: boolean;
}

export function useLiveSessionWebRTC(roomToken: string, onDisconnect?: () => void) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [isAudioMutedByHost, setIsAudioMutedByHost] = useState(false);
  const [whiteboardCommands, setWhiteboardCommands] = useState<any[]>([]);
  
  const wsRef = useRef<WebSocket | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const originalVideoTrackRef = useRef<MediaStreamTrack | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!user?.id || !roomToken) {
      console.warn('⚠️ Missing user ID or room token, skipping WebSocket connection');
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    console.log('🔌 Connecting to WebSocket:', wsUrl);
    
    let ws: WebSocket;
    let reconnectTimeout: NodeJS.Timeout;
    
    const connect = () => {
      try {
        ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('🔌 WebSocket connected to live session');
          
          try {
            ws.send(JSON.stringify({
              type: 'auth',
              payload: { 
                userId: user.id, 
                role: user.role, 
                studentId: user.role === 'student' ? user.id : undefined 
              }
            }));
            
            setTimeout(() => {
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                  type: 'room:join',
                  payload: { roomToken }
                }));
                
                setIsConnected(true);
              }
            }, 100);
          } catch (error) {
            console.error('❌ Error sending initial messages:', error);
          }
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            handleWebSocketMessage(message);
          } catch (error) {
            console.error('❌ Error parsing WebSocket message:', error);
          }
        };

        ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
        };

        ws.onclose = (event) => {
          console.log('👋 WebSocket disconnected:', event.code, event.reason);
          setIsConnected(false);
          wsRef.current = null;
        };
      } catch (error) {
        console.error('❌ Failed to create WebSocket:', error);
        toast({
          variant: 'destructive',
          title: 'خطأ في الاتصال',
          description: 'فشل في إنشاء اتصال بالحصة'
        });
      }
    };

    connect();

    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (ws && ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(JSON.stringify({
            type: 'room:leave',
            payload: { roomToken }
          }));
        } catch (error) {
          console.error('❌ Error sending leave message:', error);
        }
      }
      if (ws) {
        ws.close();
      }
      cleanupMedia();
    };
  }, [roomToken, user?.id, user?.role]);

  // Get user media on mount
  useEffect(() => {
    async function initMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        
        localStreamRef.current = stream;
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        
        console.log('📹 Local media acquired');
      } catch (error) {
        console.error('❌ Error getting media:', error);
        toast({
          variant: 'destructive',
          title: 'خطأ في الوصول للكاميرا',
          description: 'تأكد من السماح بالوصول للكاميرا والميكروفون'
        });
      }
    }
    
    initMedia();
    
    return () => cleanupMedia();
  }, []);

  const handleWebSocketMessage = async (message: any) => {
    const { type, payload } = message;

    switch (type) {
      case 'room:joined':
        console.log('✅ Joined room:', payload.roomToken);
        break;

      case 'room:participants':
        console.log('👥 Participants:', payload.participants);
        setParticipants(payload.participants || []);
        
        const others = (payload.participants || []).filter((p: Participant) => p.userId !== user?.id);
        if (others.length > 0 && user?.role === 'supervisor') {
          await createOffer();
        }
        break;

      case 'webrtc:offer':
        console.log('📨 Received offer from:', payload.from);
        await handleOffer(payload.data);
        break;

      case 'webrtc:answer':
        console.log('📨 Received answer from:', payload.from);
        await handleAnswer(payload.data);
        break;

      case 'webrtc:ice-candidate':
        console.log('🧊 Received ICE candidate from:', payload.from);
        await handleIceCandidate(payload.data);
        break;

      case 'chat_message':
        setMessages(prev => [...prev, {
          id: payload.id || Date.now().toString(),
          userId: payload.senderId || payload.from || 'unknown',
          userName: payload.senderName || payload.userName || 'مستخدم',
          text: payload.content || payload.text || '',
          timestamp: payload.createdAt 
            ? new Date(payload.createdAt).toLocaleTimeString('ar-SA')
            : new Date().toLocaleTimeString('ar-SA')
        }]);
        break;

      case 'whiteboard:command':
        setWhiteboardCommands(prev => [...prev, {
          id: payload.id || Date.now().toString(),
          command: payload.command,
          userId: payload.userId,
          timestamp: payload.timestamp
        }]);
        break;

      case 'room:hand-raised':
      case 'room:hand-lowered':
      case 'room:reaction':
        setParticipants(prev => 
          prev.map(p => 
            p.userId === payload.userId
              ? {
                  ...p,
                  isHandRaised: type === 'room:hand-raised' ? true : type === 'room:hand-lowered' ? false : p.isHandRaised,
                  reaction: type === 'room:reaction' ? payload.reaction : p.reaction
                }
              : p
          )
        );
        break;

      case 'room:participant-muted':
        if (payload.participantId === user?.id) {
          setIsAudioMutedByHost(payload.shouldMute);
          
          if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach(track => {
              track.enabled = !payload.shouldMute;
            });
            setIsAudioEnabled(!payload.shouldMute);
          }
          
          toast({
            variant: payload.shouldMute ? 'destructive' : 'default',
            title: payload.shouldMute ? 'تم كتم صوتك من قبل المشرف' : 'سمح لك المشرف بفتح الميكروفون',
            description: payload.shouldMute ? 'لا يمكنك فتح الميكروفون حتى يسمح المشرف' : 'يمكنك الآن فتح الميكروفون'
          });
        }
        
        setParticipants(prev => 
          prev.map(p => 
            p.userId === payload.participantId
              ? { ...p, isAudioMutedByHost: payload.shouldMute }
              : p
          )
        );
        break;

      case 'room:participant-removed':
        if (payload.participantId === user?.id) {
          toast({
            variant: 'destructive',
            title: 'تمت إزالتك من الحصة',
            description: 'قام المشرف بإزالتك من الحصة'
          });
          leaveRoom();
        } else {
          setParticipants(prev => prev.filter(p => p.userId !== payload.participantId));
        }
        break;

      case 'room:all-muted':
        if (user?.role === 'student') {
          setIsAudioMutedByHost(true);
          
          if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach(track => {
              track.enabled = false;
            });
            setIsAudioEnabled(false);
          }
          
          toast({
            variant: 'destructive',
            title: 'تم كتم الجميع',
            description: 'قام المشرف بكتم صوت جميع المشاركين'
          });
        }
        break;

      default:
        console.log('⚠️ Unknown message type:', type);
    }
  };

  const createPeerConnection = () => {
    if (peerConnectionRef.current) {
      return peerConnectionRef.current;
    }

    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };

    const pc = new RTCPeerConnection(configuration);
    peerConnectionRef.current = pc;

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'webrtc:ice-candidate',
          payload: event.candidate
        }));
      }
    };

    pc.ontrack = (event) => {
      console.log('🎥 Remote track received');
      const [remoteStream] = event.streams;
      
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
      
      setRemoteStreams(prev => {
        const newMap = new Map(prev);
        newMap.set('remote', remoteStream);
        return newMap;
      });
    };

    pc.onconnectionstatechange = () => {
      console.log('🔄 Connection state:', pc.connectionState);
      if (pc.connectionState === 'failed') {
        toast({
          variant: 'destructive',
          title: 'خطأ في الاتصال',
          description: 'فشل الاتصال مع المشارك الآخر'
        });
      }
    };

    return pc;
  };

  const createOffer = async () => {
    try {
      const pc = createPeerConnection();
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'webrtc:offer',
          payload: offer
        }));
        console.log('📤 Offer sent');
      }
    } catch (error) {
      console.error('❌ Error creating offer:', error);
    }
  };

  const handleOffer = async (offer: RTCSessionDescriptionInit) => {
    try {
      const pc = createPeerConnection();
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'webrtc:answer',
          payload: answer
        }));
        console.log('📤 Answer sent');
      }
    } catch (error) {
      console.error('❌ Error handling offer:', error);
    }
  };

  const handleAnswer = async (answer: RTCSessionDescriptionInit) => {
    try {
      const pc = peerConnectionRef.current;
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        console.log('✅ Answer applied');
      }
    } catch (error) {
      console.error('❌ Error handling answer:', error);
    }
  };

  const handleIceCandidate = async (candidate: RTCIceCandidateInit) => {
    try {
      const pc = peerConnectionRef.current;
      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
        console.log('✅ ICE candidate added');
      }
    } catch (error) {
      console.error('❌ Error adding ICE candidate:', error);
    }
  };

  const toggleAudio = () => {
    if (isAudioMutedByHost && !isAudioEnabled) {
      toast({
        variant: 'destructive',
        title: 'لا يمكن فتح الميكروفون',
        description: 'تم كتم صوتك من قبل المشرف'
      });
      return;
    }
    
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsAudioEnabled(prev => !prev);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoEnabled(prev => !prev);
    }
  };

  const sendMessage = (text: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const senderName = user?.firstName && user?.lastName 
        ? `${user.firstName} ${user.lastName}`
        : user?.firstName || 'مستخدم';
      
      wsRef.current.send(JSON.stringify({
        type: 'chat_message',
        payload: {
          content: text,
          senderId: user?.id,
          senderName,
          receiverId: null,
          messageType: 'text',
          isGroupMessage: true
        }
      }));
    }
  };

  const sendWhiteboardCommand = (command: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'whiteboard:command',
        payload: {
          command
        }
      }));
    }
  };

  const leaveRoom = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'room:leave',
        payload: { roomToken }
      }));
    }
    cleanupMedia();
    onDisconnect?.();
  };

  const startScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });
      
      screenStreamRef.current = screenStream;
      
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = screenStream;
      }
      
      const pc = peerConnectionRef.current;
      if (pc && localStreamRef.current) {
        const videoTrack = screenStream.getVideoTracks()[0];
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        
        if (sender) {
          originalVideoTrackRef.current = localStreamRef.current.getVideoTracks()[0];
          
          await sender.replaceTrack(videoTrack);
          console.log('📺 Screen sharing started - audio tracks preserved, original camera saved');
          setIsScreenSharing(true);
          
          videoTrack.onended = () => {
            stopScreenShare();
          };
          
          toast({
            title: 'بدأت مشاركة الشاشة',
            description: 'يمكن للطلاب رؤية شاشتك الآن - الصوت مستمر'
          });
        }
      }
    } catch (error) {
      console.error('❌ Error starting screen share:', error);
      toast({
        variant: 'destructive',
        title: 'خطأ في مشاركة الشاشة',
        description: 'لم نتمكن من مشاركة شاشتك'
      });
    }
  };

  const stopScreenShare = async () => {
    try {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
        screenStreamRef.current = null;
      }
      
      const pc = peerConnectionRef.current;
      if (pc && originalVideoTrackRef.current) {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        
        if (sender) {
          await sender.replaceTrack(originalVideoTrackRef.current);
          
          if (localVideoRef.current) {
            const newStream = new MediaStream();
            newStream.addTrack(originalVideoTrackRef.current);
            if (localStreamRef.current) {
              localStreamRef.current.getAudioTracks().forEach(track => newStream.addTrack(track));
            }
            localVideoRef.current.srcObject = newStream;
          }
          
          console.log('📺 Screen sharing stopped, camera restored');
          setIsScreenSharing(false);
          originalVideoTrackRef.current = null;
          
          toast({
            title: 'توقفت مشاركة الشاشة',
            description: 'عدت إلى الكاميرا'
          });
        }
      }
    } catch (error) {
      console.error('❌ Error stopping screen share:', error);
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: 'حدث خطأ عند العودة للكاميرا'
      });
    }
  };

  const cleanupMedia = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
  };

  const toggleHandRaise = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'room:toggle-hand',
        payload: { roomToken, userId: user?.id }
      }));
    }
  };

  const sendReaction = (reaction: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'room:reaction',
        payload: { roomToken, userId: user?.id, reaction }
      }));
      
      setTimeout(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: 'room:reaction',
            payload: { roomToken, userId: user?.id, reaction: null }
          }));
        }
      }, 3000);
    }
  };

  const muteParticipant = (participantId: string, shouldMute: boolean) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && (user?.role === 'supervisor' || user?.role === 'admin')) {
      wsRef.current.send(JSON.stringify({
        type: 'room:mute-participant',
        payload: { roomToken, participantId, shouldMute }
      }));
    }
  };

  const muteAll = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN && (user?.role === 'supervisor' || user?.role === 'admin')) {
      wsRef.current.send(JSON.stringify({
        type: 'room:mute-all',
        payload: { roomToken }
      }));
      
      toast({
        title: 'تم كتم الجميع',
        description: 'تم كتم صوت جميع المشاركين'
      });
    }
  };

  const removeParticipant = (participantId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && (user?.role === 'supervisor' || user?.role === 'admin')) {
      wsRef.current.send(JSON.stringify({
        type: 'room:remove-participant',
        payload: { roomToken, participantId }
      }));
    }
  };

  const lockRoom = (shouldLock: boolean) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && (user?.role === 'supervisor' || user?.role === 'admin')) {
      wsRef.current.send(JSON.stringify({
        type: 'room:lock',
        payload: { roomToken, isLocked: shouldLock }
      }));
      
      toast({
        title: shouldLock ? 'تم قفل الغرفة' : 'تم فتح الغرفة',
        description: shouldLock ? 'لن يتمكن أحد من الدخول' : 'يمكن للجميع الدخول الآن'
      });
    }
  };

  return {
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    participants,
    messages,
    isConnected,
    remoteStreams,
    localVideoRef,
    remoteVideoRef,
    screenVideoRef,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    sendMessage,
    sendWhiteboardCommand,
    whiteboardCommands,
    leaveRoom,
    toggleHandRaise,
    sendReaction,
    muteParticipant,
    muteAll,
    removeParticipant,
    lockRoom,
    isAudioMutedByHost
  };
}
