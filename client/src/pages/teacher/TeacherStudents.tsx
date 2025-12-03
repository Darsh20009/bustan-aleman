import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TeacherLayout } from './TeacherLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { DataTable } from '@/components/shared/DataTable';
import { LoadingCards } from '@/components/shared/LoadingState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Users, UserCheck, UserX, Search, Eye } from 'lucide-react';

export function TeacherStudentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const { data: students = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/teacher/students'],
  });

  const activeStudents = students.filter((s: any) => s.status === 'active');
  const inactiveStudents = students.filter((s: any) => s.status !== 'active');

  const filteredStudents = students.filter((s: any) => 
    s.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.phoneNumber?.includes(searchQuery)
  );

  const columns = [
    {
      key: 'name',
      header: 'الاسم',
      render: (s: any) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{s.firstName?.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{s.firstName} {s.lastName}</span>
        </div>
      )
    },
    { key: 'phoneNumber', header: 'رقم الهاتف' },
    { 
      key: 'currentLevel', 
      header: 'المستوى',
      render: (s: any) => (
        <Badge variant="secondary">
          {s.currentLevel === 'advanced' ? 'متقدم' : s.currentLevel === 'intermediate' ? 'متوسط' : 'مبتدئ'}
        </Badge>
      )
    },
    { 
      key: 'attendanceRate', 
      header: 'نسبة الحضور',
      render: (s: any) => `${s.attendanceRate || 0}%`
    },
    { 
      key: 'status', 
      header: 'الحالة',
      render: (s: any) => (
        <Badge variant={s.status === 'active' ? 'default' : 'secondary'}>
          {s.status === 'active' ? 'نشط' : 'غير نشط'}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'إجراءات',
      render: (s: any) => (
        <Button 
          size="sm" 
          variant="ghost"
          onClick={() => setSelectedStudent(s)}
          data-testid={`button-view-student-${s.id}`}
        >
          <Eye className="h-4 w-4" />
        </Button>
      )
    }
  ];

  return (
    <TeacherLayout>
      <PageHeader 
        title="عرض الطلاب"
        description="إدارة ومتابعة الطلاب المسجلين"
      />

      {isLoading ? (
        <LoadingCards count={3} />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <StatsCard
              title="إجمالي الطلاب"
              value={students.length}
              subtitle="طالب مسجل"
              icon={<Users className="h-4 w-4" />}
            />
            <StatsCard
              title="الطلاب النشطين"
              value={activeStudents.length}
              subtitle="طالب نشط"
              icon={<UserCheck className="h-4 w-4" />}
            />
            <StatsCard
              title="الطلاب غير النشطين"
              value={inactiveStudents.length}
              subtitle="طالب غير نشط"
              icon={<UserX className="h-4 w-4" />}
            />
          </div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ابحث بالاسم أو رقم الهاتف..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                  data-testid="input-search-students"
                />
              </div>
            </CardContent>
          </Card>

          <DataTable
            columns={columns}
            data={filteredStudents}
            isLoading={isLoading}
            emptyMessage="لا يوجد طلاب"
          />
        </>
      )}

      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل الطالب</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">
                    {selectedStudent.firstName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedStudent.firstName} {selectedStudent.lastName}
                  </h3>
                  <p className="text-muted-foreground">{selectedStudent.email}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">رقم الهاتف</p>
                  <p className="font-medium">{selectedStudent.phoneNumber || '-'}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">المستوى</p>
                  <Badge variant="secondary">
                    {selectedStudent.currentLevel === 'advanced' ? 'متقدم' : 'مبتدئ'}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">نسبة الحضور</p>
                  <p className="font-medium">{selectedStudent.attendanceRate || 0}%</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">الحالة</p>
                  <Badge variant={selectedStudent.status === 'active' ? 'default' : 'secondary'}>
                    {selectedStudent.status === 'active' ? 'نشط' : 'غير نشط'}
                  </Badge>
                </div>
              </div>

              {selectedStudent.memorizedSurahs && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">السور المحفوظة</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedStudent.memorizedSurahs.split(',').map((surah: string, index: number) => (
                      <Badge key={index} variant="outline">{surah.trim()}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </TeacherLayout>
  );
}