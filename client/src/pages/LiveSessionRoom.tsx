import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
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
  BookOpen,
  Send,
  Users,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LiveSessionRoomProps {
  roomId: string;
  studentId: string;
  sheikhId: string;
  onLeave: () => void;
}

interface Message {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
}

export default function LiveSessionRoom({ roomId, studentId, sheikhId, onLeave }: LiveSessionRoomProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentSurah, setCurrentSurah] = useState(1);
  const [currentAyah, setCurrentAyah] = useState(1);
  const [surahText, setSurahText] = useState<any[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [participants, setParticipants] = useState<string[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const localAudioRef = useRef<HTMLAudioElement | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

  // WebSocket Connection
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('🔌 Connected to live session');
      ws.send(JSON.stringify({
        type: 'auth',
        payload: { userId: user?.id, role: user?.role }
      }));
      
      ws.send(JSON.stringify({
        type: 'room:join',
        roomId,
        userId: user?.id
      }));
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      handleWebSocketMessage(message);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast({
        variant: 'destructive',
        title: 'خطأ في الاتصال',
        description: 'حدث خطأ في الاتصال بالحصة'
      });
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'room:leave',
          roomId
        }));
      }
      ws.close();
    };
  }, [roomId, user]);

  const handleWebSocketMessage = (message: any) => {
    switch (message.type) {
      case 'room:user-joined':
        setParticipants(prev => [...prev, message.userId]);
        toast({
          title: '👋 انضم مشارك جديد',
          description: 'انضم شخص للحصة'
        });
        break;
      
      case 'room:user-left':
        setParticipants(prev => prev.filter(id => id !== message.userId));
        break;
      
      case 'mushaf:update':
        setCurrentSurah(message.surahNumber);
        setCurrentAyah(message.ayahNumber);
        break;
      
      case 'chat:message':
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          userId: message.from,
          userName: message.userName,
          text: message.text,
          timestamp: new Date().toLocaleTimeString('ar-SA')
        }]);
        break;
    }
  };

  // Fetch Surah Text
  useEffect(() => {
    fetch(`https://api.alquran.cloud/v1/surah/${currentSurah}`)
      .then(res => res.json())
      .then(data => {
        if (data.data && data.data.ayahs) {
          setSurahText(data.data.ayahs);
        }
      })
      .catch(err => console.error('Error fetching surah:', err));
  }, [currentSurah]);

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    // في التطبيق الحقيقي، سنشغل/نوقف MediaStream
    toast({
      title: isAudioEnabled ? '🔇 تم كتم الصوت' : '🎤 تم تفعيل الصوت',
      description: isAudioEnabled ? 'تم إيقاف الميكروفون' : 'تم تشغيل الميكروفون'
    });
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    toast({
      title: isVideoEnabled ? '📹 تم إيقاف الكاميرا' : '📹 تم تشغيل الكاميرا',
      description: isVideoEnabled ? 'تم إيقاف الفيديو' : 'تم تشغيل الفيديو'
    });
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      type: 'chat:message',
      roomId,
      from: user?.id,
      userName: user?.firstName || 'مستخدم',
      text: newMessage
    };

    wsRef.current?.send(JSON.stringify(message));
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      userId: user?.id || '',
      userName: user?.firstName || 'أنا',
      text: newMessage,
      timestamp: new Date().toLocaleTimeString('ar-SA')
    }]);
    setNewMessage('');
  };

  const updateMushafPosition = (surahNumber: number, ayahNumber: number) => {
    wsRef.current?.send(JSON.stringify({
      type: 'mushaf:update',
      roomId,
      surahNumber,
      ayahNumber
    }));
  };

  const handleLeave = () => {
    wsRef.current?.send(JSON.stringify({
      type: 'room:leave',
      roomId
    }));
    onLeave();
  };

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'relative'} bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900`} dir="rtl">
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
                  مباشر
                </Badge>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {participants.length + 1} مشاركين
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="text-white hover:bg-white/20"
              data-testid="button-toggle-fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </Button>
            <Button
              variant="destructive"
              onClick={handleLeave}
              className="bg-red-600 hover:bg-red-700"
              data-testid="button-leave-room"
            >
              <PhoneOff className="w-5 h-5 ml-2" />
              إنهاء الحصة
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 max-w-7xl mx-auto h-[calc(100vh-100px)]">
        {/* Mushaf Viewer */}
        <div className="lg:col-span-2">
          <Card className="h-full border-2 border-white/20 bg-white/95 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-emerald-800">
                <span className="flex items-center">
                  <BookOpen className="w-6 h-6 ml-2" />
                  المصحف الشريف - السورة {currentSurah}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentSurah(Math.max(1, currentSurah - 1))}
                    disabled={currentSurah === 1}
                  >
                    السورة السابقة
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentSurah(Math.min(114, currentSurah + 1))}
                    disabled={currentSurah === 114}
                  >
                    السورة التالية
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[calc(100%-80px)] overflow-y-auto">
              <div className="space-y-4">
                {surahText.map((ayah) => (
                  <div
                    key={ayah.number}
                    className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      ayah.numberInSurah === currentAyah
                        ? 'bg-emerald-100 border-emerald-500 shadow-lg scale-105'
                        : 'bg-white border-gray-200 hover:border-emerald-300'
                    }`}
                    onClick={() => {
                      setCurrentAyah(ayah.numberInSurah);
                      updateMushafPosition(currentSurah, ayah.numberInSurah);
                    }}
                    data-testid={`ayah-${ayah.numberInSurah}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold">
                        {ayah.numberInSurah}
                      </div>
                      <p className="text-2xl leading-loose text-right flex-1" style={{ fontFamily: 'Amiri, serif' }}>
                        {ayah.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chat & Controls Sidebar */}
        <div className="space-y-4">
          {/* Controls */}
          <Card className="border-2 border-white/20 bg-white/95 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-emerald-800">التحكم</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2 justify-center">
                <Button
                  size="lg"
                  variant={isAudioEnabled ? "default" : "outline"}
                  onClick={toggleAudio}
                  className={`flex-1 ${isAudioEnabled ? 'bg-green-600 hover:bg-green-700' : ''}`}
                  data-testid="button-toggle-audio"
                >
                  {isAudioEnabled ? <Mic className="w-5 h-5 ml-2" /> : <MicOff className="w-5 h-5 ml-2" />}
                  {isAudioEnabled ? 'كتم' : 'تشغيل'}
                </Button>
                <Button
                  size="lg"
                  variant={isVideoEnabled ? "default" : "outline"}
                  onClick={toggleVideo}
                  className={`flex-1 ${isVideoEnabled ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                  data-testid="button-toggle-video"
                >
                  {isVideoEnabled ? <Video className="w-5 h-5 ml-2" /> : <VideoOff className="w-5 h-5 ml-2" />}
                  {isVideoEnabled ? 'إيقاف' : 'كاميرا'}
                </Button>
              </div>
              
              <div className="text-center p-4 bg-emerald-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">الآية الحالية</p>
                <p className="text-3xl font-bold text-emerald-800">{currentAyah}</p>
              </div>
            </CardContent>
          </Card>

          {/* Chat */}
          <Card className="border-2 border-white/20 bg-white/95 backdrop-blur-sm flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-emerald-800 flex items-center">
                <MessageSquare className="w-5 h-5 ml-2" />
                المحادثة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-[300px] overflow-y-auto space-y-2 p-2 bg-gray-50 rounded-lg">
                  {messages.length === 0 ? (
                    <p className="text-center text-gray-400 mt-20">لا توجد رسائل بعد</p>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-2 rounded-lg ${
                          msg.userId === user?.id
                            ? 'bg-emerald-100 ml-auto max-w-[80%]'
                            : 'bg-white max-w-[80%]'
                        }`}
                      >
                        <p className="font-bold text-xs text-gray-600">{msg.userName}</p>
                        <p className="text-sm">{msg.text}</p>
                        <p className="text-xs text-gray-400 text-left">{msg.timestamp}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="اكتب رسالة..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    data-testid="input-chat-message"
                  />
                  <Button
                    onClick={sendMessage}
                    className="bg-emerald-600 hover:bg-emerald-700"
                    data-testid="button-send-message"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
