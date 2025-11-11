import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  PhoneOff, 
  MessageSquare,
  Send,
  Users,
  Monitor,
  MonitorOff,
  Pencil,
  Shield
} from 'lucide-react';
import { useLiveSessionWebRTC } from '@/hooks/useLiveSessionWebRTC';
import { LiveWhiteboard } from '@/components/LiveWhiteboard';
import { useAuth } from '@/hooks/useAuth';
import type { DrawCommand } from '@/hooks/useWhiteboard';

interface LiveSessionRoomProps {
  roomId: string;
  studentId: string;
  sheikhId: string;
  onLeave: () => void;
}

export default function LiveSessionRoom({ roomId, onLeave }: LiveSessionRoomProps) {
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'video' | 'whiteboard'>('video');
  const [whiteboardEnabled, setWhiteboardEnabled] = useState(false);
  const [processedMessages, setProcessedMessages] = useState<Set<string>>(new Set());
  const whiteboardExecuteRef = useRef<((command: DrawCommand) => void) | null>(null);

  const {
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    participants,
    messages,
    isConnected,
    localVideoRef,
    remoteVideoRef,
    screenVideoRef,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    sendMessage,
    leaveRoom
  } = useLiveSessionWebRTC(roomId, onLeave);

  const isShamsikh = user?.role === 'supervisor';

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    sendMessage(newMessage);
    setNewMessage('');
  };

  const handleWhiteboardCommand = (command: DrawCommand) => {
    if (isConnected) {
      sendMessage(JSON.stringify({ type: 'whiteboard', data: command }));
    }
  };

  const handleExecuteRemoteCommand = useCallback((command: DrawCommand) => {
    if (whiteboardExecuteRef.current) {
      whiteboardExecuteRef.current(command);
    }
  }, []);

  useEffect(() => {
    messages.forEach((msg: any) => {
      if (processedMessages.has(msg.id)) {
        return;
      }

      try {
        const parsed = JSON.parse(msg.text);
        if (parsed.type === 'whiteboard' && parsed.data) {
          if (parsed.data.userId !== user?.id) {
            handleExecuteRemoteCommand(parsed.data);
          }
          setProcessedMessages(prev => new Set(prev).add(msg.id));
        }
      } catch {
      }
    });
  }, [messages, processedMessages, user?.id, handleExecuteRemoteCommand]);

  const toggleWhiteboard = () => {
    setWhiteboardEnabled(!whiteboardEnabled);
    if (!whiteboardEnabled) {
      setActiveTab('whiteboard');
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">الحصة المباشرة</h2>
              <div className="flex items-center gap-3 text-white/80 text-sm flex-wrap">
                <Badge className="bg-green-500 text-white">
                  <span className="w-2 h-2 bg-white rounded-full inline-block ml-1 animate-pulse"></span>
                  {isConnected ? 'متصل' : 'غير متصل'}
                </Badge>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {participants.length} مشاركين
                </span>
                {isShamsikh && (
                  <Badge className="bg-amber-500 text-white flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    مشرف
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Whiteboard Toggle - Sheikh Only */}
            {isShamsikh && (
              <Button
                variant={whiteboardEnabled ? "default" : "outline"}
                onClick={toggleWhiteboard}
                className="flex items-center gap-2"
                data-testid="button-toggle-whiteboard"
              >
                <Pencil className="w-5 h-5" />
                <span>{whiteboardEnabled ? 'إخفاء السبورة' : 'إظهار السبورة'}</span>
              </Button>
            )}

            {/* Screen Share - Sheikh Only */}
            {isShamsikh && (
              <Button
                variant={isScreenSharing ? "destructive" : "outline"}
                onClick={isScreenSharing ? stopScreenShare : startScreenShare}
                className="flex items-center gap-2"
                data-testid="button-toggle-screen-share"
              >
                {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
                <span>{isScreenSharing ? 'إيقاف مشاركة الشاشة' : 'مشاركة الشاشة'}</span>
              </Button>
            )}

            <Button
              variant="destructive"
              onClick={leaveRoom}
              className="flex items-center gap-2"
              data-testid="button-leave-session"
            >
              <PhoneOff className="w-5 h-5" />
              <span>مغادرة الحصة</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="h-[calc(100vh-80px)] p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
          {/* Video & Whiteboard Section */}
          <div className="lg:col-span-2 space-y-4">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'video' | 'whiteboard')} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-2 bg-black/40">
                <TabsTrigger value="video" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                  <Video className="w-4 h-4 ml-2" />
                  الفيديو
                </TabsTrigger>
                <TabsTrigger value="whiteboard" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                  <Pencil className="w-4 h-4 ml-2" />
                  السبورة البيضاء
                </TabsTrigger>
              </TabsList>

              <TabsContent value="video" className="flex-1 space-y-4 mt-4">
                {/* Remote Video */}
                <Card className="bg-black/40 border-emerald-500/30 h-[60%]">
                  <CardContent className="p-4 h-full">
                    <div className="relative h-full bg-gray-900 rounded-lg overflow-hidden">
                      <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                        data-testid="video-remote"
                      />
                      {participants.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center text-white/60">
                            <Users className="w-16 h-16 mx-auto mb-4" />
                            <p className="text-lg">في انتظار انضمام المشاركين...</p>
                          </div>
                        </div>
                      )}
                      {isScreenSharing && (
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-red-500 text-white flex items-center gap-1">
                            <Monitor className="w-3 h-3" />
                            يشارك الشاشة
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Local Video */}
                <Card className="bg-black/40 border-emerald-500/30 h-[35%]">
                  <CardContent className="p-4 h-full">
                    <div className="relative h-full bg-gray-900 rounded-lg overflow-hidden">
                      <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                        data-testid="video-local"
                      />
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-3">
                        <Button
                          size="icon"
                          variant={isAudioEnabled ? "default" : "destructive"}
                          onClick={toggleAudio}
                          className="rounded-full w-12 h-12"
                          data-testid="button-toggle-audio"
                        >
                          {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                        </Button>

                        <Button
                          size="icon"
                          variant={isVideoEnabled ? "default" : "destructive"}
                          onClick={toggleVideo}
                          className="rounded-full w-12 h-12"
                          data-testid="button-toggle-video"
                        >
                          {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                        </Button>
                      </div>
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-emerald-500 text-white">
                          أنت
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="whiteboard" className="flex-1 mt-4">
                <LiveWhiteboard
                  roomToken={roomId}
                  userId={user?.id || ''}
                  isEnabled={isShamsikh || whiteboardEnabled}
                  onSendCommand={handleWhiteboardCommand}
                  onExecuteCommand={(executeFunc) => {
                    whiteboardExecuteRef.current = executeFunc;
                  }}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Participants */}
            <Card className="bg-black/40 border-emerald-500/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  المشاركون ({participants.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {participants.map((participant: any) => (
                  <div
                    key={participant.userId}
                    className="flex items-center gap-3 p-3 bg-white/10 rounded-lg"
                    data-testid={`participant-${participant.userId}`}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                      {participant.role === 'supervisor' ? 'ش' : 'ط'}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">
                        {participant.role === 'supervisor' ? 'الشيخ' : 'الطالب'}
                      </p>
                      <p className="text-white/60 text-sm">
                        {participant.role}
                      </p>
                    </div>
                    <Badge className="bg-green-500 text-white">
                      متصل
                    </Badge>
                  </div>
                ))}
                {participants.length === 0 && (
                  <div className="text-center text-white/60 py-8">
                    <p>لا يوجد مشاركون آخرون</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Chat */}
            <Card className="bg-black/40 border-emerald-500/30 flex-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  المحادثة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-[300px] overflow-y-auto space-y-2 mb-3">
                  {messages.map((msg: any) => (
                    <div
                      key={msg.id}
                      className="bg-white/10 p-3 rounded-lg"
                      data-testid={`message-${msg.id}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-emerald-400 font-medium text-sm">
                          {msg.userName}
                        </span>
                        <span className="text-white/50 text-xs">
                          {msg.timestamp}
                        </span>
                      </div>
                      <p className="text-white">{msg.text}</p>
                    </div>
                  ))}
                  {messages.length === 0 && (
                    <div className="text-center text-white/60 py-8">
                      <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>لا توجد رسائل بعد</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="اكتب رسالة..."
                    className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                    data-testid="input-chat-message"
                  />
                  <Button
                    onClick={handleSendMessage}
                    className="bg-emerald-600 hover:bg-emerald-700"
                    data-testid="button-send-message"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
