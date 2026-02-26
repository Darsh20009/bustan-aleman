import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { AdminLayout } from './AdminLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Users, UserCheck, UserX, Shield, Search, Edit, ToggleLeft, ToggleRight } from 'lucide-react';

const ROLE_LABELS: Record<string, string> = {
  student: 'طالب',
  supervisor: 'مشرف',
  teacher: 'معلم',
  admin: 'مدير',
  owner: 'مالك',
};

const ROLE_COLORS: Record<string, string> = {
  student: 'bg-blue-100 text-blue-700',
  supervisor: 'bg-purple-100 text-purple-700',
  teacher: 'bg-indigo-100 text-indigo-700',
  admin: 'bg-emerald-100 text-emerald-700',
  owner: 'bg-red-100 text-red-700',
};

export function AdminUsersPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newRole, setNewRole] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const { data: users = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/admin/users'],
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      return apiRequest('PATCH', `/api/admin/users/${userId}/role`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setEditDialogOpen(false);
      toast({ title: 'تم التحديث', description: 'تم تغيير دور المستخدم بنجاح' });
    },
    onError: () => {
      toast({ title: 'خطأ', description: 'فشل في تغيير الدور', variant: 'destructive' });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ userId, isActive }: { userId: string; isActive: boolean }) => {
      return apiRequest('PATCH', `/api/admin/users/${userId}/status`, { isActive });
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: vars.isActive ? 'تم التفعيل' : 'تم التعطيل',
        description: vars.isActive ? 'تم تفعيل الحساب بنجاح' : 'تم تعطيل الحساب بنجاح',
      });
    },
    onError: () => {
      toast({ title: 'خطأ', description: 'فشل في تحديث الحالة', variant: 'destructive' });
    },
  });

  const filteredUsers = users.filter((u: any) => {
    const matchSearch = !searchQuery ||
      u.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phoneNumber?.includes(searchQuery) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = filterRole === 'all' || u.role === filterRole;
    const matchStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && u.isActive) ||
      (filterStatus === 'inactive' && !u.isActive);
    return matchSearch && matchRole && matchStatus;
  });

  const totalStudents = users.filter((u: any) => u.role === 'student').length;
  const totalTeachers = users.filter((u: any) => u.role === 'supervisor' || u.role === 'teacher').length;
  const totalAdmins = users.filter((u: any) => u.role === 'admin' || u.role === 'owner').length;
  const activeUsers = users.filter((u: any) => u.isActive).length;

  return (
    <AdminLayout>
      <PageHeader
        title="إدارة المستخدمين"
        description="عرض وإدارة جميع مستخدمي المنصة"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatsCard title="إجمالي المستخدمين" value={users.length} subtitle="مستخدم مسجل" icon={<Users className="h-4 w-4" />} />
        <StatsCard title="الطلاب" value={totalStudents} subtitle="طالب نشط" icon={<Users className="h-4 w-4" />} />
        <StatsCard title="المعلمون" value={totalTeachers} subtitle="معلم ومشرف" icon={<Shield className="h-4 w-4" />} />
        <StatsCard title="حسابات نشطة" value={activeUsers} subtitle={`من ${users.length}`} icon={<UserCheck className="h-4 w-4" />} />
      </div>

      <Card>
        <CardContent className="p-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث بالاسم أو الهاتف..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 text-right"
                data-testid="input-search-users"
              />
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-full sm:w-40" data-testid="select-filter-role">
                <SelectValue placeholder="الدور" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأدوار</SelectItem>
                <SelectItem value="student">طلاب</SelectItem>
                <SelectItem value="supervisor">مشرفون</SelectItem>
                <SelectItem value="teacher">معلمون</SelectItem>
                <SelectItem value="admin">مديرون</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-40" data-testid="select-filter-status">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="inactive">غير نشط</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          {isLoading ? (
            <div className="text-center py-12 text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent mx-auto mb-3" />
              <p>جاري التحميل...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>لا توجد نتائج</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((u: any) => (
                <div
                  key={u.id}
                  data-testid={`user-row-${u.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="h-9 w-9 shrink-0">
                      <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm font-bold">
                        {(u.firstName?.charAt(0) || '؟').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 dark:text-white truncate font-arabic">
                        {u.firstName} {u.lastName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate" dir="ltr">
                        {u.phoneNumber || u.email || '—'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    <Badge className={`text-xs font-arabic ${ROLE_COLORS[u.role] || 'bg-gray-100 text-gray-700'}`} data-testid={`badge-role-${u.id}`}>
                      {ROLE_LABELS[u.role] || u.role}
                    </Badge>
                    {u.isActive ? (
                      <Badge className="bg-emerald-100 text-emerald-700 text-xs" data-testid={`badge-active-${u.id}`}>نشط</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700 text-xs" data-testid={`badge-inactive-${u.id}`}>معطل</Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-blue-600 hover:bg-blue-50"
                      onClick={() => {
                        setSelectedUser(u);
                        setNewRole(u.role);
                        setEditDialogOpen(true);
                      }}
                      data-testid={`button-edit-role-${u.id}`}
                      title="تغيير الدور"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-7 w-7 p-0 ${u.isActive ? 'text-red-500 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                          data-testid={`button-toggle-status-${u.id}`}
                          title={u.isActive ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                        >
                          {u.isActive ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent dir="rtl">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="font-arabic">
                            {u.isActive ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                          </AlertDialogTitle>
                          <AlertDialogDescription className="font-arabic">
                            هل أنت متأكد من {u.isActive ? 'تعطيل' : 'تفعيل'} حساب {u.firstName} {u.lastName}؟
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="font-arabic">إلغاء</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => toggleStatusMutation.mutate({ userId: u.id, isActive: !u.isActive })}
                            className={u.isActive ? 'bg-red-600 hover:bg-red-700 font-arabic' : 'bg-emerald-600 hover:bg-emerald-700 font-arabic'}
                          >
                            {u.isActive ? 'تعطيل' : 'تفعيل'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Role Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent dir="rtl" className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-arabic">تغيير الدور</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold">
                    {selectedUser.firstName?.charAt(0)?.toUpperCase() || '؟'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm font-arabic">{selectedUser.firstName} {selectedUser.lastName}</p>
                  <p className="text-xs text-gray-500">{selectedUser.phoneNumber}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2 font-arabic">اختر الدور الجديد</p>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger data-testid="select-new-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">طالب</SelectItem>
                    <SelectItem value="supervisor">مشرف</SelectItem>
                    <SelectItem value="teacher">معلم</SelectItem>
                    <SelectItem value="admin">مدير</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} className="font-arabic">
              إلغاء
            </Button>
            <Button
              onClick={() => selectedUser && updateRoleMutation.mutate({ userId: selectedUser.id, role: newRole })}
              disabled={updateRoleMutation.isPending || !newRole || newRole === selectedUser?.role}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-arabic"
              data-testid="button-confirm-role-change"
            >
              {updateRoleMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
