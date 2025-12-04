import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { TeacherLayout } from './TeacherLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { MessageCircle, Send, Users, Search } from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  messageType: string;
  createdAt: string;
  senderName?: string;
}

interface Student {
  id: string;
  studentName: string;
  phoneNumber: string;
  userId?: string;
}

export function TeacherMessagesPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const { data: students = [], isLoading } = useQuery<Student[]>({
    queryKey: ['/api/sheikh/students'],
  });

  const filteredStudents = students.filter((s: Student) => 
    s.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.phoneNumber?.includes(searchQuery)
  );

  useEffect(() => {
    if (!user) return;

    const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'auth',
        payload: { userId: user.id, role: user.role }
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'chat_message') {
        setMessages(prev => [...prev, data.payload]);
        scrollToBottom();
      }
    };

    return () => ws.close();
  }, [user]);

  useEffect(() => {
    if (selectedStudent) {
      fetchMessages(selectedStudent.userId || selectedStudent.id);
    }
  }, [selectedStudent]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async (studentId: string) => {
    try {
      const response = await fetch(`/api/messages/${studentId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedStudent || !user) return;

    const messagePayload = {
      content: newMessage,
      senderId: user.id,
      receiverId: selectedStudent.userId || selectedStudent.id,
      messageType: 'text',
      isGroupMessage: false,
    };

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'chat_message',
        payload: messagePayload,
      }));
    }

    setMessages(prev => [...prev, {
      ...messagePayload,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      senderName: `${user.firstName} ${user.lastName}`,
    }]);

    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <TeacherLayout>
      <PageHeader 
        title="الرسائل"
        description="تواصل مع الطلاب"
      />

      <div className="grid gap-6 lg:grid-cols-3 h-[calc(100vh-200px)]">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              الطلاب
            </CardTitle>
            <div className="relative mt-2">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
                data-testid="input-search-students"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              {isLoading ? (
                <div className="p-4 text-center text-muted-foreground">جاري التحميل...</div>
              ) : filteredStudents.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">لا يوجد طلاب</div>
              ) : (
                <div className="divide-y">
                  {filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      className={`p-4 cursor-pointer hover-elevate transition-colors ${
                        selectedStudent?.id === student.id ? 'bg-primary/10' : ''
                      }`}
                      onClick={() => setSelectedStudent(student)}
                      data-testid={`student-chat-${student.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{student.studentName?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{student.studentName}</p>
                          <p className="text-sm text-muted-foreground truncate">{student.phoneNumber}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 flex flex-col">
          {selectedStudent ? (
            <>
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{selectedStudent.studentName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{selectedStudent.studentName}</CardTitle>
                    <p className="text-sm text-muted-foreground">{selectedStudent.phoneNumber}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-0 flex flex-col">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>لا توجد رسائل</p>
                        <p className="text-sm">ابدأ المحادثة الآن</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              message.senderId === user?.id
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              message.senderId === user?.id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            }`}>
                              {formatTime(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="اكتب رسالتك..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="min-h-[80px] resize-none"
                      data-testid="textarea-message"
                    />
                    <Button 
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="self-end"
                      data-testid="button-send-message"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">اختر طالباً للبدء</p>
                <p className="text-sm">اختر طالباً من القائمة لبدء المحادثة</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </TeacherLayout>
  );
}
