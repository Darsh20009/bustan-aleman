import { useQuery } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

interface NotificationBellProps {
  onClick: () => void;
}

export function NotificationBell({ onClick }: NotificationBellProps) {
  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={onClick}
      className="relative"
      data-testid="button-notifications"
    >
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <span
          className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center"
          data-testid="badge-unread-count"
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Button>
  );
}
