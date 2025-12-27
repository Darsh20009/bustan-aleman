import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, CheckCircle2, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export interface Goal {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  progress: number;
  maxProgress: number;
  status: 'active' | 'completed' | 'abandoned';
}

export function LearningGoals({ goals = [] }: { goals?: Goal[] }) {
  const [newGoal, setNewGoal] = useState({ title: '', targetDays: 7 });
  const [openDialog, setOpenDialog] = useState(false);

  const mockGoals: Goal[] = goals.length === 0 ? [
    {
      id: '1',
      title: 'حفظ سورة الفاتحة',
      description: 'حفظ سورة الفاتحة بشكل كامل وسليم',
      targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      progress: 7,
      maxProgress: 7,
      status: 'completed',
    },
    {
      id: '2',
      title: 'حفظ 5 آيات من سورة البقرة',
      description: 'الآيات 1-5 من سورة البقرة',
      targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      progress: 3,
      maxProgress: 5,
      status: 'active',
    },
    {
      id: '3',
      title: 'مراجعة سورة الإخلاص',
      description: 'مراجعة كاملة وتصحيح النطق',
      targetDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      progress: 1,
      maxProgress: 1,
      status: 'active',
    },
  ] : goals;

  const completedGoals = mockGoals.filter(g => g.status === 'completed').length;
  const activeGoals = mockGoals.filter(g => g.status === 'active').length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>الأهداف التعليمية</CardTitle>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              هدف جديد
            </Button>
          </DialogTrigger>
          <DialogContent dir="rtl">
            <DialogHeader>
              <DialogTitle>إضافة هدف جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">عنوان الهدف</label>
                <Input
                  placeholder="مثال: حفظ سورة الملك"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">آخر موعد (أيام)</label>
                <Input
                  type="number"
                  min={1}
                  max={365}
                  value={newGoal.targetDays}
                  onChange={(e) => setNewGoal({ ...newGoal, targetDays: parseInt(e.target.value) })}
                  className="mt-1"
                />
              </div>
              <Button
                onClick={() => {
                  setOpenDialog(false);
                  setNewGoal({ title: '', targetDays: 7 });
                }}
                className="w-full"
              >
                إضافة الهدف
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400">أهداف مكتملة</p>
            <p className="text-2xl font-bold text-green-600">{completedGoals}</p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-400">أهداف نشطة</p>
            <p className="text-2xl font-bold text-blue-600">{activeGoals}</p>
          </div>
        </div>

        {/* Goals List */}
        <div className="space-y-3">
          {mockGoals.map((goal) => {
            const daysUntilDeadline = Math.floor(
              (goal.targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            );
            const isOverdue = daysUntilDeadline < 0;
            const progressPercent = (goal.progress / goal.maxProgress) * 100;

            return (
              <div
                key={goal.id}
                className={`p-4 rounded-lg border-2 transition-all ${
                  goal.status === 'completed'
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-300'
                    : isOverdue
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-300'
                    : 'bg-gray-50 dark:bg-gray-900/20 border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm">{goal.title}</h3>
                      {goal.status === 'completed' && (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {goal.description}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    data-testid={`button-remove-goal-${goal.id}`}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="w-full bg-gray-300 rounded-full h-2 mr-2">
                      <div
                        className={`h-full rounded-full transition-all ${
                          goal.status === 'completed'
                            ? 'bg-green-600'
                            : isOverdue
                            ? 'bg-red-600'
                            : 'bg-blue-600'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <span className="text-xs whitespace-nowrap text-gray-600">
                      {goal.progress}/{goal.maxProgress}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {goal.status === 'completed'
                        ? '✓ مكتمل'
                        : isOverdue
                        ? '⏰ تأخر'
                        : `${daysUntilDeadline} يوم متبقي`}
                    </Badge>
                    <span className={`text-xs font-medium ${progressPercent === 100 ? 'text-green-600' : 'text-gray-600'}`}>
                      {Math.round(progressPercent)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}