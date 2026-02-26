import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Clock, BookOpen, CheckCircle } from 'lucide-react';

export interface Reminder {
  id: string;
  type: 'session' | 'homework' | 'review' | 'goal';
  title: string;
  time: Date;
  status: 'pending' | 'completed' | 'upcoming';
}

export function WeeklyReminders({ reminders = [] }: { reminders?: Reminder[] }) {
  const mockReminders = reminders.length === 0 ? [
    { id: '1', type: 'session', title: 'حصة مع الشيخ أحمد - التجويد', time: new Date(Date.now() + 2 * 60 * 60 * 1000), status: 'upcoming' as const },
    { id: '2', type: 'homework', title: 'تسليم واجب حفظ سورة الفاتحة', time: new Date(Date.now() + 5 * 60 * 60 * 1000), status: 'pending' as const },
    { id: '3', type: 'review', title: 'مراجعة جزء عم', time: new Date(Date.now() + 24 * 60 * 60 * 1000), status: 'pending' as const },
  ] : reminders;

  const getIcon = (type: string) => {
    switch (type) {
      case 'session':
        return <Clock className="w-5 h-5" />;
      case 'homework':
        return <BookOpen className="w-5 h-5" />;
      case 'review':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          التذكيرات والمهام
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {mockReminders.map((reminder) => {
          const timeUntil = new Date(reminder.time).getTime() - Date.now();
          const hoursUntil = Math.floor(timeUntil / (1000 * 60 * 60));
          const minutesUntil = Math.floor((timeUntil % (1000 * 60 * 60)) / (1000 * 60));

          return (
            <div
              key={reminder.id}
              className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-all ${
                reminder.status === 'completed'
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-300'
                  : reminder.status === 'upcoming'
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300'
                  : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300'
              }`}
            >
              <div className={`p-2 rounded-lg ${
                reminder.status === 'completed'
                  ? 'bg-green-200'
                  : reminder.status === 'upcoming'
                  ? 'bg-blue-200'
                  : 'bg-yellow-200'
              }`}>
                {getIcon(reminder.type)}
              </div>

              <div className="flex-1">
                <p className="font-semibold text-sm">{reminder.title}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {reminder.status === 'completed'
                    ? '✓ مكتمل'
                    : hoursUntil > 0
                    ? `خلال ${hoursUntil} ساعة و ${minutesUntil} دقيقة`
                    : `خلال ${minutesUntil} دقيقة`}
                </p>
              </div>

              <Button
                size="sm"
                variant="outline"
                className="text-xs"
                data-testid={`button-reminder-${reminder.id}`}
              >
                {reminder.status === 'completed' ? 'تم' : 'تأكيد'}
              </Button>
            </div>
          );
        })}

        {mockReminders.length === 0 && (
          <div className="text-center py-8">
            <Bell className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">لا توجد تذكيرات حالية</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
