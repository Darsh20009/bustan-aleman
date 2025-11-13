import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
  Shield,
  MoreVertical,
  Settings,
  Hand,
  Smile,
  ThumbsUp,
  Heart,
  UserMinus,
  Lock,
  Unlock
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
    leaveRoom,
    toggleHandRaise,
    sendReaction,
    muteParticipant,
    muteAll,
    removeParticipant,
    lockRoom,
    isAudioMutedByHost
  } = useLiveSessionWebRTC(roomId, onLeave);

  const isShamsikh = user?.role === 'supervisor' || user?.role === 'admin';

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
    <div className="h-screen overflow-y-auto bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900" dir="rtl">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-emerald-600 to-teal-600 p-2 md:p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2 md:gap-4">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="w-8 h-8 md:w-12 md:h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Video className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </div>
            <div>
              <h2 className="text-base md:text-2xl font-bold text-white">الحصة المباشرة</h2>
              <div className="flex items-center gap-2 md:gap-3 text-white/80 text-xs md:text-sm flex-wrap">
                <Badge className="bg-green-500 text-white text-xs">
                  <span className="w-2 h-2 bg-white rounded-full inline-block ml-1 animate-pulse"></span>
                  {isConnected ? 'متصل' : 'غير متصل'}
                </Badge>
                <span className="hidden md:flex items-center gap-1">
                  <Users className="w-3 h-3 md:w-4 md:h-4" />
                  {participants.length} مشاركين
                </span>
                {isShamsikh && (
                  <Badge className="bg-amber-500 text-white flex items-center gap-1 text-xs">
                    <Shield className="w-3 h-3" />
                    <span className="hidden md:inline">مشرف</span>
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-1 md:gap-2 flex-wrap">
            {isShamsikh && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1 md:gap-2 text-xs md:text-sm"
                    data-testid="button-controls-menu"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="hidden md:inline">أدوات التحكم</span>
                    <MoreVertical className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={toggleWhiteboard} data-testid="menu-toggle-whiteboard">
                    <Pencil className="w-4 h-4 ml-2" />
                    {whiteboardEnabled ? 'إخفاء السبورة' : 'إظهار السبورة'}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={isScreenSharing ? stopScreenShare : startScreenShare}
                    data-testid="menu-toggle-screen-share"
                  >
                    {isScreenSharing ? <MonitorOff className="w-4 h-4 ml-2" /> : <Monitor className="w-4 h-4 ml-2" />}
                    {isScreenSharing ? 'إيقاف مشاركة الشاشة' : 'مشاركة الشاشة'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Button
              size="sm"
              variant="destructive"
              onClick={leaveRoom}
              className="flex items-center gap-1 md:gap-2 text-xs md:text-sm"
              data-testid="button-leave-session"
            >
              <PhoneOff className="w-3 h-3 md:w-5 md:h-5" />
              <span>مغادرة</span>
            </Button>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="p-4 pb-8 min-h-[calc(100vh-80px)]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Video & Whiteboard Section */}
          <div className="lg:col-span-2 space-y-4">
            {/* View Toggle Buttons */}
            <div className="flex gap-2 bg-black/40 p-1 rounded-lg">
              <Button
                variant={activeTab === 'video' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('video')}
                className="flex-1"
                data-testid="button-view-video"
              >
                <Video className="w-4 h-4 ml-2" />
                الفيديو
              </Button>
              <Button
                variant={activeTab === 'whiteboard' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('whiteboard')}
                className={`flex-1 ${activeTab === 'whiteboard' ? 'bg-[#085142]' : ''}`}
                data-testid="button-view-whiteboard"
              >
                <Pencil className="w-4 h-4 ml-2" />
                السبورة البيضاء
              </Button>
            </div>

            {/* Video Section - Always mounted, hidden when whiteboard active */}
            <div className={activeTab === 'video' ? 'block space-y-4' : 'hidden'}>
              {/* Remote Video */}
              <Card className="bg-black/40 border-emerald-500/30 h-[400px] md:h-[500px]">
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
              <Card className="bg-black/40 border-emerald-500/30 h-[250px] md:h-[300px]">
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
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-3">
                      {/* Main Controls */}
                      <div className="flex items-center gap-3">
                        <Button
                          size="icon"
                          variant={isAudioEnabled ? "default" : "destructive"}
                          onClick={toggleAudio}
                          className="rounded-full w-12 h-12"
                          data-testid="button-toggle-audio"
                          disabled={isAudioMutedByHost}
                          title={isAudioMutedByHost ? "تم كتم صوتك من قبل المشرف" : ""}
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
                        
                        {!isShamsikh && (
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={toggleHandRaise}
                            className="rounded-full w-12 h-12 bg-white/10 border-white/30"
                            data-testid="button-raise-hand"
                          >
                            <Hand className="w-5 h-5 text-yellow-400" />
                          </Button>
                        )}
                      </div>
                      
                      {/* Reaction Buttons */}
                      {!isShamsikh && (
                        <div className="flex items-center gap-2 bg-black/50 px-3 py-2 rounded-full">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => sendReaction('👍')}
                            className="w-10 h-10 text-2xl p-0"
                            data-testid="button-reaction-thumbsup"
                          >
                            👍
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => sendReaction('❤️')}
                            className="w-10 h-10 text-2xl p-0"
                            data-testid="button-reaction-heart"
                          >
                            ❤️
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => sendReaction('👏')}
                            className="w-10 h-10 text-2xl p-0"
                            data-testid="button-reaction-clap"
                          >
                            👏
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => sendReaction('✋')}
                            className="w-10 h-10 text-2xl p-0"
                            data-testid="button-reaction-raise"
                          >
                            ✋
                          </Button>
                        </div>
                      )}
                    </div>
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-emerald-500 text-white">
                        أنت
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Whiteboard Section - Always mounted, hidden when video active */}
            <div className={activeTab === 'whiteboard' ? 'block' : 'hidden'}>
              <div className="min-h-[700px]">
                <LiveWhiteboard
                  roomToken={roomId}
                  userId={user?.id || ''}
                  isEnabled={isShamsikh || whiteboardEnabled}
                  onSendCommand={handleWhiteboardCommand}
                  onExecuteCommand={(executeFunc) => {
                    whiteboardExecuteRef.current = executeFunc;
                  }}
                />
              </div>
            </div>
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
                {isShamsikh && (
                  <div className="flex gap-2 mb-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={muteAll}
                      className="flex-1 bg-white/10 border-white/30 text-white hover:bg-white/20"
                      data-testid="button-mute-all"
                    >
                      <MicOff className="w-4 h-4 ml-2" />
                      كتم الجميع
                    </Button>
                  </div>
                )}
                
                {participants.map((participant: any) => (
                  <div
                    key={participant.userId}
                    className="relative p-3 bg-white/10 rounded-lg"
                    data-testid={`participant-${participant.userId}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold relative">
                        {participant.role === 'supervisor' ? 'ش' : 'ط'}
                        {participant.reaction && (
                          <div className="absolute -top-2 -right-2 text-2xl animate-bounce">
                            {participant.reaction}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 bg-[#0a5447]">
                          <p className="text-white font-medium">
                            {participant.role === 'supervisor' ? 'الشيخ' : 'الطالب'}
                          </p>
                          {participant.isHandRaised && (
                            <Badge className="bg-yellow-500 text-black flex items-center gap-1">
                              <Hand className="w-3 h-3" />
                              يد مرفوعة
                            </Badge>
                          )}
                          {participant.isAudioMutedByHost && (
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <MicOff className="w-3 h-3" />
                              مكتوم
                            </Badge>
                          )}
                        </div>
                        <p className="text-white/60 text-sm">
                          {participant.role}
                        </p>
                      </div>
                      
                      {isShamsikh && participant.userId !== user?.id && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-white hover:bg-white/20"
                              data-testid={`button-participant-menu-${participant.userId}`}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => muteParticipant(participant.userId, !participant.isAudioMutedByHost)}
                              data-testid={`menu-mute-participant-${participant.userId}`}
                            >
                              <MicOff className="w-4 h-4 ml-2" />
                              {participant.isAudioMutedByHost ? 'إلغاء الكتم' : 'كتم الصوت'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => removeParticipant(participant.userId)}
                              className="text-red-600"
                              data-testid={`menu-remove-participant-${participant.userId}`}
                            >
                              <UserMinus className="w-4 h-4 ml-2" />
                              إزالة من الحصة
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                      
                      {!isShamsikh && (
                        <Badge className="bg-green-500 text-white">
                          متصل
                        </Badge>
                      )}
                    </div>
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
            <Card className="bg-black/40 border-emerald-500/30 flex flex-col max-h-[500px]">
              <CardHeader className="pb-3 flex-shrink-0">
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  المحادثة
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 overflow-hidden p-4">
                <div className="flex-1 overflow-y-auto space-y-2 mb-3 pr-2" style={{ maxHeight: 'calc(500px - 150px)' }}>
                  {messages.map((msg: any) => {
                    // Filter out whiteboard commands from display
                    try {
                      const parsed = JSON.parse(msg.text);
                      if (parsed.type === 'whiteboard') {
                        return null;
                      }
                    } catch {
                      // Not a JSON message, display normally
                    }
                    
                    return (
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
                    );
                  })}
                  {messages.filter((msg: any) => {
                    try {
                      const parsed = JSON.parse(msg.text);
                      return parsed.type !== 'whiteboard';
                    } catch {
                      return true;
                    }
                  }).length === 0 && (
                    <div className="text-center text-white/60 py-8">
                      <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>لا توجد رسائل بعد</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 flex-shrink-0">
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
