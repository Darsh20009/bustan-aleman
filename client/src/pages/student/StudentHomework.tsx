import { useQuery } from '@tanstack/react-query';
import { StudentLayout } from './StudentLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClipboardList, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export function StudentHomeworkPage() {
  const { data: homework = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/homework'],
  });

  const pendingHomework = homework.filter((h: any) => h.status === 'pending');
  const completedHomework = homework.filter((h: any) => h.status === 'completed');
  const overdueHomework = homework.filter((h: any) => h.status === 'overdue');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">معلق</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">مكتمل</Badge>;
      case 'overdue':
        return <Badge variant="destructive">متأخر</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const columns = [
    { key: 'title', header: 'العنوان' },
    { 
      key: 'dueDate', 
      header: 'تاريخ التسليم',
      render: (h: any) => new Date(h.dueDate).toLocaleDateString('ar-SA')
    },
    { key: 'sheikhName', header: 'المعلم' },
    { 
      key: 'status', 
      header: 'الحالة',
      render: (h: any) => getStatusBadge(h.status)
    },
    {
      key: 'actions',
      header: 'إجراءات',
      render: (h: any) => (
        h.status === 'pending' && (
          <Button size="sm" data-testid={`button-submit-homework-${h.id}`}>
            تسليم
          </Button>
        )
      )
    }
  ];

  return (
    <StudentLayout>
      <PageHeader 
        title="واجباتي"
        description="متابعة وتسليم الواجبات المطلوبة"
      />

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">معلقة</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingHomework.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">مكتملة</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedHomework.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
            <CardTitle className="text-sm font-medium">متأخرة</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueHomework.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">المعلقة ({pendingHomework.length})</TabsTrigger>
          <TabsTrigger value="completed">المكتملة ({completedHomework.length})</TabsTrigger>
          <TabsTrigger value="all">الكل ({homework.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {pendingHomework.length === 0 ? (
            <EmptyState
              icon={<ClipboardList className="h-12 w-12" />}
              title="لا توجد واجبات معلقة"
              description="أحسنت! لقد أكملت جميع واجباتك"
            />
          ) : (
            <DataTable
              columns={columns}
              data={pendingHomework}
              isLoading={isLoading}
            />
          )}
        </TabsContent>

        <TabsContent value="completed">
          {completedHomework.length === 0 ? (
            <EmptyState
              icon={<CheckCircle className="h-12 w-12" />}
              title="لا توجد واجبات مكتملة"
              description="لم تقم بتسليم أي واجبات بعد"
            />
          ) : (
            <DataTable
              columns={columns}
              data={completedHomework}
              isLoading={isLoading}
            />
          )}
        </TabsContent>

        <TabsContent value="all">
          <DataTable
            columns={columns}
            data={homework}
            isLoading={isLoading}
            emptyMessage="لا توجد واجبات"
          />
        </TabsContent>
      </Tabs>
    </StudentLayout>
  );
}