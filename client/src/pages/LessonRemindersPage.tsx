import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Bell,
  Clock,
  Calendar,
  MessageSquare,
  Mail,
  Phone,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LessonReminder {
  id: string;
  userId: string;
  studentId?: string;
  liveRoomId?: string;
  reminderType: string;
  scheduledFor: string;
  status: string;
  channels?: string;
  messageAr?: string;
  messageEn?: string;
  sentAt?: string;
  createdAt: string;
}

export default function LessonRemindersPage() {
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    reminderType: 'lesson',
    scheduledFor: '',
    scheduledTime: '',
    messageAr: '',
    messageEn: '',
    channels: {
      sms: true,
      email: true,
      push: true,
    },
  });

  const { data: reminders = [], isLoading, refetch } = useQuery<LessonReminder[]>({
    queryKey: ['/api/reminders'],
  });

  const createReminderMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/reminders', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reminders'] });
      toast({
        title: "تم إنشاء التذكير",
        description: "سيتم إرسال التذكير في الوقت المحدد",
      });
      setCreateDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل في إنشاء التذكير",
        variant: "destructive",
      });
    },
  });

  const cancelReminderMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/reminders/${id}/cancel`, 'POST', {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reminders'] });
      toast({
        title: "تم إلغاء التذكير",
        description: "تم إلغاء التذكير بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ",
        description: error.message || "فشل في إلغاء التذكير",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      reminderType: 'lesson',
      scheduledFor: '',
      scheduledTime: '',
      messageAr: '',
      messageEn: '',
      channels: {
        sms: true,
        email: true,
        push: true,
      },
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.scheduledFor || !formData.scheduledTime) {
      toast({
        title: "خطأ",
        description: "يرجى تحديد تاريخ ووقت التذكير",
        variant: "destructive",
      });
      return;
    }

    const scheduledDateTime = new Date(`${formData.scheduledFor}T${formData.scheduledTime}`);
    
    createReminderMutation.mutate({
      reminderType: formData.reminderType,
      scheduledFor: scheduledDateTime.toISOString(),
      messageAr: formData.messageAr,
      messageEn: formData.messageEn,
      channels: Object.entries(formData.channels)
        .filter(([, enabled]) => enabled)
        .map(([channel]) => channel),
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return (
          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            تم الإرسال
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            ملغي
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-orange-100 text-orange-800 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            فشل
          </Badge>
        );
      default:
        return (
          <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            قيد الانتظار
          </Badge>
        );
    }
  };

  const getReminderTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      lesson: 'تذكير حصة',
      exam: 'تذكير اختبار',
      assignment: 'تذكير واجب',
      session: 'تذكير جلسة',
      general: 'تذكير عام',
    };
    return types[type] || type;
  };

  const parseChannels = (channelsStr?: string): string[] => {
    if (!channelsStr) return [];
    try {
      return JSON.parse(channelsStr);
    } catch {
      return [];
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-lg text-gray-700">جاري تحميل التذكيرات...</p>
        </div>
      </div>
    );
  }

  const pendingReminders = reminders.filter(r => r.status === 'pending');
  const sentReminders = reminders.filter(r => r.status === 'sent');
  const cancelledReminders = reminders.filter(r => r.status === 'cancelled' || r.status === 'failed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-8 px-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Bell className="w-8 h-8 text-emerald-600" />
              تذكيرات الدروس
            </h1>
            <p className="text-gray-600 mt-2">إدارة تذكيرات الحصص والمواعيد المهمة</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="outline"
              onClick={() => refetch()}
              data-testid="button-refresh-reminders"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setCreateDialogOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700"
              data-testid="button-create-reminder"
            >
              <Plus className="w-4 h-4 ml-2" />
              إنشاء تذكير
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-800">{pendingReminders.length}</p>
              <p className="text-sm text-blue-600">قيد الانتظار</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-800">{sentReminders.length}</p>
              <p className="text-sm text-green-600">تم الإرسال</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="p-4 text-center">
              <XCircle className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{cancelledReminders.length}</p>
              <p className="text-sm text-gray-600">ملغي / فشل</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>التذكيرات</CardTitle>
            <CardDescription>قائمة جميع التذكيرات المجدولة</CardDescription>
          </CardHeader>
          <CardContent>
            {reminders.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">لا توجد تذكيرات</p>
                <Button
                  onClick={() => setCreateDialogOpen(true)}
                  variant="outline"
                  data-testid="button-create-first-reminder"
                >
                  <Plus className="w-4 h-4 ml-2" />
                  إنشاء أول تذكير
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {reminders.map((reminder) => (
                  <Card key={reminder.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant="outline">{getReminderTypeLabel(reminder.reminderType)}</Badge>
                            {getStatusBadge(reminder.status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(reminder.scheduledFor).toLocaleDateString('ar-SA')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{new Date(reminder.scheduledFor).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                          {reminder.messageAr && (
                            <p className="text-gray-700">{reminder.messageAr}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            {parseChannels(reminder.channels).map((channel) => (
                              <Badge key={channel} variant="secondary" className="text-xs">
                                {channel === 'sms' && <Phone className="w-3 h-3 ml-1" />}
                                {channel === 'email' && <Mail className="w-3 h-3 ml-1" />}
                                {channel === 'push' && <Bell className="w-3 h-3 ml-1" />}
                                {channel}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {reminder.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => cancelReminderMutation.mutate(reminder.id)}
                            disabled={cancelReminderMutation.isPending}
                            data-testid={`button-cancel-reminder-${reminder.id}`}
                          >
                            {cancelReminderMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Trash2 className="w-4 h-4 ml-1" />
                                إلغاء
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle>إنشاء تذكير جديد</DialogTitle>
            <DialogDescription>أدخل تفاصيل التذكير الذي تريد إنشاءه</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="reminderType">نوع التذكير</Label>
              <Select
                value={formData.reminderType}
                onValueChange={(value) => setFormData({ ...formData, reminderType: value })}
              >
                <SelectTrigger data-testid="select-reminder-type">
                  <SelectValue placeholder="اختر نوع التذكير" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lesson">تذكير حصة</SelectItem>
                  <SelectItem value="exam">تذكير اختبار</SelectItem>
                  <SelectItem value="assignment">تذكير واجب</SelectItem>
                  <SelectItem value="session">تذكير جلسة</SelectItem>
                  <SelectItem value="general">تذكير عام</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="scheduledFor">التاريخ</Label>
                <Input
                  id="scheduledFor"
                  type="date"
                  value={formData.scheduledFor}
                  onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
                  data-testid="input-scheduled-date"
                />
              </div>
              <div>
                <Label htmlFor="scheduledTime">الوقت</Label>
                <Input
                  id="scheduledTime"
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                  data-testid="input-scheduled-time"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="messageAr">نص التذكير (عربي)</Label>
              <Textarea
                id="messageAr"
                value={formData.messageAr}
                onChange={(e) => setFormData({ ...formData, messageAr: e.target.value })}
                placeholder="أدخل نص التذكير بالعربية..."
                rows={3}
                data-testid="input-message-ar"
              />
            </div>

            <div>
              <Label className="mb-3 block">قنوات الإرسال</Label>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="channel-sms"
                    checked={formData.channels.sms}
                    onCheckedChange={(checked) => 
                      setFormData({ 
                        ...formData, 
                        channels: { ...formData.channels, sms: !!checked } 
                      })
                    }
                    data-testid="checkbox-channel-sms"
                  />
                  <Label htmlFor="channel-sms" className="flex items-center gap-1 cursor-pointer">
                    <Phone className="w-4 h-4" />
                    SMS
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="channel-email"
                    checked={formData.channels.email}
                    onCheckedChange={(checked) => 
                      setFormData({ 
                        ...formData, 
                        channels: { ...formData.channels, email: !!checked } 
                      })
                    }
                    data-testid="checkbox-channel-email"
                  />
                  <Label htmlFor="channel-email" className="flex items-center gap-1 cursor-pointer">
                    <Mail className="w-4 h-4" />
                    Email
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="channel-push"
                    checked={formData.channels.push}
                    onCheckedChange={(checked) => 
                      setFormData({ 
                        ...formData, 
                        channels: { ...formData.channels, push: !!checked } 
                      })
                    }
                    data-testid="checkbox-channel-push"
                  />
                  <Label htmlFor="channel-push" className="flex items-center gap-1 cursor-pointer">
                    <Bell className="w-4 h-4" />
                    إشعار
                  </Label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                إلغاء
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={createReminderMutation.isPending}
                data-testid="button-submit-reminder"
              >
                {createReminderMutation.isPending ? (
                  <Loader2 className="w-4 h-4 ml-1 animate-spin" />
                ) : (
                  <Bell className="w-4 h-4 ml-1" />
                )}
                إنشاء التذكير
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
