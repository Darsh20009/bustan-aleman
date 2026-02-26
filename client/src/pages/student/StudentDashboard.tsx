export { WeeklyReminders } from '@/components/WeeklyReminders';
export type { Reminder } from '@/components/WeeklyReminders';

import { WeeklyReminders } from '@/components/WeeklyReminders';

export function StudentDashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <WeeklyReminders />
    </div>
  );
}
