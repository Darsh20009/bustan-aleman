import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  PhoneOff, 
  MessageSquare,
  Send,
  Users
} from 'lucide-react';
import { useLiveSessionWebRTC } from '@/hooks/useLiveSessionWebRTC';

interface LiveSessionRoomProps {
  roomId: string;
  studentId: string;
  sheikhId: string;
  onLeave: () => void;
}

export default function LiveSessionRoom({ roomId, onLeave }: LiveSessionRoomProps) {
  const [newMessage, setNewMessage] = useState('');
  const {
    isAudioEnabled,
    isVideoEnabled,
    participants,
    messages,
    isConnected,
    localVideoRef,
    remoteVideoRef,
    toggleAudio,
    toggleVideo,
    sendMessage,
    leaveRoom
  } = useLiveSessionWebRTC(roomId, onLeave);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    sendMessage(newMessage);
    setNewMessage('');
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">الحصة المباشرة</h2>
              <div className="flex items-center gap-3 text-white/80 text-sm">
                <Badge className="bg-green-500 text-white">
                  <span className="w-2 h-2 bg-white rounded-full inline-block ml-1 animate-pulse"></span>
                  {isConnected ? 'متصل' : 'غير متصل'}
                </Badge>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {participants.length} مشاركين
                </span>
              </div>
            </div>
          </div>

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

      {/* Main Content */}
      <div className="h-[calc(100vh-80px)] p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
          {/* Video Section */}
          <div className="lg:col-span-2 space-y-4">
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
                {participants.map((participant, idx) => (
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
                  {messages.map((msg) => (
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
