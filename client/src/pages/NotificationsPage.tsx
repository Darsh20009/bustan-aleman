import { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Bell, Trash2, CheckCircle, AlertCircle, Clock, Info } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
  relatedId?: string;
  relatedType?: string;
}

export default function NotificationsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [filterType, setFilterType] = useState<'all' | 'unread'>('all');

  // Get notifications
  const { data: notifications = [], isLoading, refetch } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) =>
      apiRequest('POST', `/api/notifications/${notificationId}/read`, {}),
    onSuccess: () => {
      refetch();
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/notifications/read-all', {}),
    onSuccess: () => {
      toast({ title: 'تم تحديث جميع الإشعارات' });
      refetch();
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId: string) =>
      apiRequest('DELETE', `/api/notifications/${notificationId}`, {}),
    onSuccess: () => {
      toast({ title: 'تم حذف الإشعار' });
      refetch();
    },
  });

  // WebSocket for real-time notifications
  useEffect(() => {
    if (!user?.id) return;

    const token = localStorage.getItem('sessionToken');
    if (!token) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host; // This includes hostname:port or just hostname
    const ws = new WebSocket(`${protocol}//${host}/ws?token=${token}`);

    ws.onopen = () => {
      console.log('✅ WebSocket connected for notifications');
      ws.send(
        JSON.stringify({
          type: 'auth',
          payload: { userId: user.id, token },
        })
      );
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'notification') {
          refetch();
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error);
    };

    return () => {
      ws.close();
    };
  }, [user?.id, refetch]);

  const filteredNotifications =
    filterType === 'unread'
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getNotificationColor = (type: string, isRead: boolean) => {
    if (isRead) return 'bg-gray-50';
    switch (type) {
      case 'success':
        return 'bg-green-50';
      case 'error':
        return 'bg-red-50';
      case 'warning':
        return 'bg-yellow-50';
      default:
        return 'bg-blue-50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 md:p-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-indigo-900 font-arabic-serif">
              الإشعارات
            </h1>
          </div>
          <p className="text-indigo-700 font-arabic-sans">
            عدد الإشعارات الجديدة: {unreadCount}
          </p>
        </div>

        {/* Controls */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <div className="flex gap-2">
            <Button
              onClick={() => setFilterType('all')}
              variant={filterType === 'all' ? 'default' : 'outline'}
              className="font-arabic-sans"
              data-testid="button-all-notifications"
            >
              الكل
            </Button>
            <Button
              onClick={() => setFilterType('unread')}
              variant={filterType === 'unread' ? 'default' : 'outline'}
              className="font-arabic-sans"
              data-testid="button-unread-notifications"
            >
              الجديدة ({unreadCount})
            </Button>
          </div>
          {unreadCount > 0 && (
            <Button
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              variant="outline"
              className="mr-auto font-arabic-sans"
              data-testid="button-mark-all-read"
            >
              تحديد الكل كمقروء
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {isLoading ? (
            <Card>
              <CardContent className="py-8 text-center">
                <div className="text-gray-500 font-arabic-sans">جاري التحميل...</div>
              </CardContent>
            </Card>
          ) : filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Bell className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <div className="text-gray-500 font-arabic-sans">
                  {filterType === 'unread' ? 'لا توجد إشعارات جديدة' : 'لا توجد إشعارات'}
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`transition-colors ${getNotificationColor(
                  notification.type,
                  notification.isRead
                )} border-l-4 ${
                  notification.type === 'success'
                    ? 'border-l-green-500'
                    : notification.type === 'error'
                      ? 'border-l-red-500'
                      : notification.type === 'warning'
                        ? 'border-l-yellow-500'
                        : 'border-l-blue-500'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4 justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1">
                        <div
                          className={`font-semibold text-sm font-arabic-sans ${
                            !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                          }`}
                        >
                          {notification.title}
                        </div>
                        <p className="text-sm text-gray-700 mt-1 font-arabic-sans">
                          {notification.message}
                        </p>
                        <div className="text-xs text-gray-500 mt-2 font-arabic-sans">
                          {new Date(notification.createdAt).toLocaleString('ar-SA')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {!notification.isRead && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => markAsReadMutation.mutate(notification.id)}
                          disabled={markAsReadMutation.isPending}
                          className="font-arabic-sans"
                          data-testid={`button-read-${notification.id}`}
                        >
                          قراءة
                        </Button>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteNotificationMutation.mutate(notification.id)}
                        disabled={deleteNotificationMutation.isPending}
                        className="text-red-500 hover:text-red-700"
                        data-testid={`button-delete-${notification.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
