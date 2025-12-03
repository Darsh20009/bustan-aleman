import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AdminLayout } from './AdminLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { 
  MessageSquare, 
  Mail, 
  MailOpen, 
  Send,
  Clock,
  CheckCircle
} from 'lucide-react';

export function AdminMessagesPage() {
  const { toast } = useToast();
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [replyText, setReplyText] = useState('');

  const { data: messages = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/admin/messages'],
  });

  const replyMutation = useMutation({
    mutationFn: async ({ messageId, reply }: { messageId: string; reply: string }) => {
      return apiRequest(`/api/admin/messages/${messageId}/reply`, {
        method: 'POST',
        body: JSON.stringify({ reply }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/messages'] });
      setSelectedMessage(null);
      setReplyText('');
      toast({
        title: 'تم إرسال الرد',
        description: 'تم إرسال الرد بنجاح',
      });
    },
    onError: () => {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء إرسال الرد',
        variant: 'destructive',
      });
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: string) => {
      return apiRequest(`/api/admin/messages/${messageId}/read`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/messages'] });
    },
  });

  const unreadMessages = messages.filter((m: any) => !m.isRead);
  const repliedMessages = messages.filter((m: any) => m.replied);

  const handleReply = () => {
    if (!selectedMessage || !replyText.trim()) return;
    replyMutation.mutate({
      messageId: selectedMessage.id,
      reply: replyText,
    });
  };

  const handleOpenMessage = (message: any) => {
    setSelectedMessage(message);
    if (!message.isRead) {
      markAsReadMutation.mutate(message.id);
    }
  };

  return (
    <AdminLayout>
      <PageHeader 
        title="الرسائل"
        description="إدارة رسائل الطلاب والمعلمين"
      />

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <StatsCard
          title="إجمالي الرسائل"
          value={messages.length}
          subtitle="رسالة"
          icon={<MessageSquare className="h-4 w-4" />}
        />
        <StatsCard
          title="غير مقروءة"
          value={unreadMessages.length}
          subtitle="رسالة جديدة"
          icon={<Mail className="h-4 w-4" />}
        />
        <StatsCard
          title="تم الرد عليها"
          value={repliedMessages.length}
          subtitle="رسالة"
          icon={<MailOpen className="h-4 w-4" />}
        />
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">الكل ({messages.length})</TabsTrigger>
          <TabsTrigger value="unread">غير مقروءة ({unreadMessages.length})</TabsTrigger>
          <TabsTrigger value="replied">تم الرد ({repliedMessages.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <MessageList 
            messages={messages} 
            isLoading={isLoading}
            onOpenMessage={handleOpenMessage}
          />
        </TabsContent>

        <TabsContent value="unread">
          <MessageList 
            messages={unreadMessages} 
            isLoading={isLoading}
            onOpenMessage={handleOpenMessage}
          />
        </TabsContent>

        <TabsContent value="replied">
          <MessageList 
            messages={repliedMessages} 
            isLoading={isLoading}
            onOpenMessage={handleOpenMessage}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل الرسالة</DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>{selectedMessage.senderName?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{selectedMessage.senderName}</h3>
                    <span className="text-sm text-muted-foreground">
                      {new Date(selectedMessage.createdAt).toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedMessage.senderEmail}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">{selectedMessage.subject}</h4>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {selectedMessage.message}
                </p>
              </div>

              {selectedMessage.reply && (
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm font-medium mb-2">ردك السابق:</p>
                  <p className="text-muted-foreground">{selectedMessage.reply}</p>
                </div>
              )}

              {!selectedMessage.replied && (
                <div className="space-y-4">
                  <Textarea
                    placeholder="اكتب ردك هنا..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="min-h-[100px]"
                    data-testid="textarea-reply"
                  />
                  <Button 
                    onClick={handleReply}
                    disabled={replyMutation.isPending || !replyText.trim()}
                    className="w-full"
                    data-testid="button-send-reply"
                  >
                    {replyMutation.isPending ? (
                      'جاري الإرسال...'
                    ) : (
                      <>
                        <Send className="ml-2 h-4 w-4" />
                        إرسال الرد
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

function MessageList({ 
  messages, 
  isLoading,
  onOpenMessage 
}: { 
  messages: any[]; 
  isLoading: boolean;
  onOpenMessage: (message: any) => void;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          جاري التحميل...
        </CardContent>
      </Card>
    );
  }

  if (messages.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>لا توجد رسائل</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y">
          {messages.map((message: any) => (
            <div 
              key={message.id}
              className={`flex items-start gap-4 p-4 cursor-pointer transition-colors hover:bg-muted/50 ${
                !message.isRead ? 'bg-primary/5' : ''
              }`}
              onClick={() => onOpenMessage(message)}
              data-testid={`message-item-${message.id}`}
            >
              <Avatar>
                <AvatarFallback>{message.senderName?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className={`font-medium truncate ${!message.isRead ? 'text-primary' : ''}`}>
                    {message.senderName}
                  </p>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(message.createdAt).toLocaleDateString('ar-SA')}
                  </span>
                </div>
                <p className="text-sm font-medium mb-1 truncate">{message.subject}</p>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {message.message}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                {!message.isRead && (
                  <Badge variant="default" className="text-xs">جديد</Badge>
                )}
                {message.replied ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <Clock className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}