import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TeacherLayout } from './TeacherLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText, Users, TrendingUp, Search, Download, Calendar, BookOpen, CheckCircle } from 'lucide-react';

export function TeacherReportsPage() {
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: students = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/teacher/students'],
  });

  const { data: studentReport } = useQuery<any>({
    queryKey: ['/api/teacher/student-report', selectedStudent],
    enabled: !!selectedStudent,
  });

  const filteredStudents = students.filter((s: any) => 
    s.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <TeacherLayout>
      <PageHeader 
        title="تقارير الطلاب"
        description="عرض تقارير تفصيلية عن أداء كل طالب"
        actions={
          <Button variant="outline" data-testid="button-export-reports">
            <Download className="ml-2 h-4 w-4" />
            تصدير التقارير
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>قائمة الطلاب</CardTitle>
            <CardDescription>اختر طالب لعرض تقريره</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث عن طالب..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
                data-testid="input-search-students"
              />
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {filteredStudents.map((student: any) => (
                <div
                  key={student.id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedStudent === student.id 
                      ? 'bg-primary/10 border border-primary' 
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedStudent(student.id)}
                  data-testid={`student-item-${student.id}`}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{student.firstName?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{student.firstName} {student.lastName}</p>
                    <p className="text-sm text-muted-foreground">
                      {student.currentLevel === 'advanced' ? 'متقدم' : 'مبتدئ'}
                    </p>
                  </div>
                  <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                    {student.status === 'active' ? 'نشط' : 'غير نشط'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>تقرير الطالب</CardTitle>
          </CardHeader>
          <CardContent>
            {!selectedStudent ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>اختر طالب من القائمة لعرض تقريره</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg">
                      {studentReport?.firstName?.charAt(0) || 'ط'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {studentReport?.firstName} {studentReport?.lastName}
                    </h3>
                    <p className="text-muted-foreground">{studentReport?.email}</p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">نسبة الحضور</span>
                    </div>
                    <p className="text-2xl font-bold">{studentReport?.attendanceRate || 0}%</p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">السور المحفوظة</span>
                    </div>
                    <p className="text-2xl font-bold">{studentReport?.memorizedSurahsCount || 0}</p>
                  </div>
                  <div className="p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">الواجبات المسلمة</span>
                    </div>
                    <p className="text-2xl font-bold">{studentReport?.completedHomework || 0}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">تقدم الحفظ</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>نسبة الإنجاز</span>
                      <span>{studentReport?.progressRate || 0}%</span>
                    </div>
                    <Progress value={studentReport?.progressRate || 0} className="h-2" />
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">آخر التقييمات</h4>
                  {studentReport?.recentEvaluations?.length > 0 ? (
                    <div className="space-y-2">
                      {studentReport.recentEvaluations.map((eval_: any, index: number) => (
                        <div 
                          key={index}
                          className="flex items-center justify-between p-3 rounded-lg border"
                        >
                          <div>
                            <p className="font-medium">{eval_.surah}</p>
                            <p className="text-sm text-muted-foreground">
                              الآيات {eval_.fromAyah} - {eval_.toAyah}
                            </p>
                          </div>
                          <Badge variant="secondary">{eval_.grade}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">لا توجد تقييمات</p>
                  )}
                </div>

                <div>
                  <h4 className="font-medium mb-3">الأخطاء الشائعة</h4>
                  {studentReport?.commonErrors?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {studentReport.commonErrors.map((error: string, index: number) => (
                        <Badge key={index} variant="destructive">{error}</Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">لا توجد أخطاء مسجلة</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </TeacherLayout>
  );
}