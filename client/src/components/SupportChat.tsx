import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Mail, Phone, Clock } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface Message {
  id: string;
  senderId: string;
  receiverId: string | null;
  content: string;
  messageType: string;
  isRead: boolean;
  readAt: string | null;
  isGroupMessage: boolean;
  createdAt: string;
}

interface SupportChatProps {
  userId?: string;
  userRole?: 'student' | 'supervisor' | 'admin';
}

export function SupportChat({ userId, userRole }: SupportChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<'chat' | 'contact'>('chat');
  const [message, setMessage] = useState('');
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Check if support is available based on current time
  const isSupportAvailable = () => {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    
    // Support available Saturday-Thursday, 9 AM - 9 PM Saudi time
    const isWorkingDay = day !== 5; // Friday is day 5
    const isWorkingHour = hour >= 9 && hour < 21;
    
    return isWorkingDay && isWorkingHour;
  };

  const [available] = useState(isSupportAvailable());

  // Fetch messages if user is logged in
  const { data: messages, isLoading } = useQuery<Message[]>({
    queryKey: ['/api/messages', userId],
    enabled: !!userId && isOpen,
    refetchInterval: 5000, // Poll every 5 seconds when chat is open
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return await apiRequest('/api/messages', {
        method: 'POST',
        body: JSON.stringify({
          content,
          messageType: 'text',
          receiverId: userRole === 'student' ? null : null, // Will be handled by backend
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
      setMessage('');
      scrollToBottom();
    },
    onError: () => {
      toast({
        title: 'خطأ',
        description: 'فشل إرسال الرسالة',
        variant: 'destructive',
      });
    },
  });

  // Send contact message mutation
  const sendContactMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/contact', {
        method: 'POST',
        body: JSON.stringify(contactForm),
      });
    },
    onSuccess: () => {
      toast({
        title: 'تم الإرسال!',
        description: 'سنتواصل معك قريباً',
      });
      setContactForm({ name: '', email: '', phone: '', subject: '', message: '' });
    },
    onError: () => {
      toast({
        title: 'خطأ',
        description: 'فشل إرسال الرسالة',
        variant: 'destructive',
      });
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages && messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (message.trim() && userId) {
      sendMessageMutation.mutate(message.trim());
    }
  };

  const handleWhatsApp = () => {
    const supportPhone = '+966532441566';
    const text = encodeURIComponent('مرحباً، أحتاج إلى مساعدة');
    window.open(`https://wa.me/${supportPhone}?text=${text}`, '_blank');
  };

  const handleEmail = () => {
    const supportEmail = 'support@bustan-aliman.com';
    const subject = encodeURIComponent('طلب دعم فني');
    window.location.href = `mailto:${supportEmail}?subject=${subject}`;
  };

  return (
    <>
      {/* Floating Support Button */}
      <div className="fixed bottom-6 left-6 z-50" dir="ltr">
        <div className="relative group">
          <Button
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300"
            data-testid="button-support-toggle"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <MessageCircle className="w-6 h-6 text-white" />
            )}
            
            {/* Subtle glow effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Button>
          
          {/* Status indicator */}
          <div className="absolute top-0 right-0 w-4 h-4 rounded-full border-2 border-white shadow-md">
            <div className={`w-full h-full rounded-full ${available ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
          </div>
        </div>
      </div>

      {/* Support Chat Window */}
      {isOpen && (
        <div 
          className="fixed bottom-24 left-6 z-50 w-96 max-w-[calc(100vw-3rem)] animate-in slide-in-from-bottom-5" 
          dir="rtl"
          data-testid="support-chat-window"
        >
          <Card className="shadow-2xl border-0">
            <CardHeader className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-t-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-white">الدعم الفني</CardTitle>
                    <div className="flex items-center gap-2 text-sm">
                      <div className={`w-2 h-2 rounded-full ${available ? 'bg-emerald-300' : 'bg-amber-300'}`}></div>
                      <span className="text-white/90 text-xs">
                        {available ? 'متاح الآن' : 'غير متاح حالياً'}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 text-white hover:bg-white/20"
                  data-testid="button-close-support"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant={currentTab === 'chat' ? 'default' : 'ghost'}
                  onClick={() => setCurrentTab('chat')}
                  className={currentTab === 'chat' ? 'bg-white text-emerald-600' : 'text-white hover:bg-white/20'}
                  data-testid="button-tab-chat"
                >
                  <MessageCircle className="w-4 h-4 ml-1" />
                  المحادثة
                </Button>
                <Button
                  size="sm"
                  variant={currentTab === 'contact' ? 'default' : 'ghost'}
                  onClick={() => setCurrentTab('contact')}
                  className={currentTab === 'contact' ? 'bg-white text-emerald-600' : 'text-white hover:bg-white/20'}
                  data-testid="button-tab-contact"
                >
                  <Mail className="w-4 h-4 ml-1" />
                  اتصل بنا
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {currentTab === 'chat' ? (
                <div className="flex flex-col h-96">
                  {/* Working Hours Info */}
                  <div className="bg-amber-50 border-b border-amber-100 p-3">
                    <div className="flex items-center gap-2 text-amber-800">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs">
                        ساعات العمل: السبت - الخميس، 9 صباحاً - 9 مساءً
                      </span>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
                    {!userId ? (
                      <div className="text-center text-muted-foreground py-8">
                        <p className="mb-4">يرجى تسجيل الدخول للمحادثة مع الدعم الفني</p>
                        <div className="space-y-2">
                          <p className="text-sm">أو تواصل معنا عبر:</p>
                          <div className="flex justify-center gap-2">
                            <Button
                              size="sm"
                              onClick={handleWhatsApp}
                              className="bg-[#25D366] hover:bg-[#20BD5C] text-white"
                              data-testid="button-whatsapp-direct"
                            >
                              <SiWhatsapp className="w-4 h-4 ml-1" />
                              واتساب
                            </Button>
                            <Button
                              size="sm"
                              onClick={handleEmail}
                              variant="outline"
                              data-testid="button-email-direct"
                            >
                              <Mail className="w-4 h-4 ml-1" />
                              البريد
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : isLoading ? (
                      <div className="text-center text-muted-foreground py-8">
                        <p>جاري تحميل الرسائل...</p>
                      </div>
                    ) : messages && messages.length > 0 ? (
                      <>
                        {messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.senderId === userId ? 'justify-start' : 'justify-end'}`}
                          >
                            <div
                              className={`max-w-[80%] p-3 rounded-lg ${
                                msg.senderId === userId
                                  ? 'bg-white border border-gray-200'
                                  : 'bg-emerald-500 text-white'
                              }`}
                            >
                              <p className="text-sm">{msg.content}</p>
                              <span className={`text-xs ${msg.senderId === userId ? 'text-gray-500' : 'text-white/70'}`}>
                                {new Date(msg.createdAt).toLocaleTimeString('ar-SA', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </>
                    ) : (
                      <div className="text-center text-muted-foreground py-8">
                        <p>لا توجد رسائل بعد. ابدأ المحادثة!</p>
                      </div>
                    )}
                  </div>

                  {/* Message Input */}
                  {userId && (
                    <div className="p-3 border-t bg-white">
                      <div className="flex gap-2">
                        <Input
                          placeholder="اكتب رسالتك..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          className="flex-1"
                          data-testid="input-chat-message"
                        />
                        <Button
                          size="icon"
                          onClick={handleSendMessage}
                          disabled={!message.trim() || sendMessageMutation.isPending}
                          className="bg-emerald-500 hover:bg-emerald-600"
                          data-testid="button-send-message"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
                  {/* Quick Contact Options */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <Button
                      onClick={handleWhatsApp}
                      className="bg-[#25D366] hover:bg-[#20BD5C] text-white"
                      data-testid="button-whatsapp"
                    >
                      <SiWhatsapp className="w-4 h-4 ml-1" />
                      واتساب
                    </Button>
                    <Button
                      onClick={handleEmail}
                      variant="outline"
                      data-testid="button-email"
                    >
                      <Mail className="w-4 h-4 ml-1" />
                      البريد
                    </Button>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-sm text-muted-foreground mb-4">أو أرسل رسالة عبر النموذج:</p>
                    
                    <div className="space-y-3">
                      <Input
                        placeholder="الاسم"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        data-testid="input-contact-name"
                      />
                      <Input
                        type="email"
                        placeholder="البريد الإلكتروني"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        data-testid="input-contact-email"
                      />
                      <Input
                        type="tel"
                        placeholder="رقم الهاتف (اختياري)"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                        data-testid="input-contact-phone"
                      />
                      <Input
                        placeholder="الموضوع"
                        value={contactForm.subject}
                        onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                        data-testid="input-contact-subject"
                      />
                      <Textarea
                        placeholder="رسالتك..."
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        rows={4}
                        data-testid="textarea-contact-message"
                      />
                      <Button
                        onClick={() => sendContactMutation.mutate()}
                        disabled={!contactForm.name || !contactForm.email || !contactForm.subject || !contactForm.message || sendContactMutation.isPending}
                        className="w-full bg-emerald-500 hover:bg-emerald-600"
                        data-testid="button-send-contact"
                      >
                        <Send className="w-4 h-4 ml-2" />
                        {sendContactMutation.isPending ? 'جاري الإرسال...' : 'إرسال'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
