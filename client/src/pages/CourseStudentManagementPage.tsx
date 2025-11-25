import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Users, Trash2, Plus, CheckCircle, Clock, User } from 'lucide-react';

interface CourseEnrollment {
  id: string;
  studentId: string;
  courseId: string;
  enrollmentDate: string;
  completionDate?: string;
  status: 'active' | 'completed' | 'dropped';
  student?: {
    id: string;
    firstName: string;
    lastName?: string;
    phoneNumber: string;
  };
}

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  level: string;
  startDate: string;
  price: number;
  maxStudents: number;
  enrollments?: CourseEnrollment[];
}

export default function CourseStudentManagementPage() {
  const { toast } = useToast();
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);

  // Get all courses
  const { data: courses = [], isLoading: isLoadingCourses } = useQuery<Course[]>({
    queryKey: ['/api/courses'],
  });

  // Get enrollments for selected course
  const { data: enrollments = [], isLoading: isLoadingEnrollments } = useQuery<CourseEnrollment[]>({
    queryKey: ['/api/courses', selectedCourse, 'enrollments'],
    enabled: !!selectedCourse,
    queryFn: async () => {
      const response = await fetch(`/api/courses/${selectedCourse}/enrollments`);
      if (!response.ok) throw new Error('Failed to fetch enrollments');
      return response.json();
    },
  });

  // Remove student from course
  const removeMutation = useMutation({
    mutationFn: (enrollmentId: string) =>
      apiRequest('DELETE', `/api/enrollments/${enrollmentId}`, {}),
    onSuccess: () => {
      toast({ title: 'تم حذف الطالب من الدورة بنجاح' });
      queryClient.invalidateQueries({
        queryKey: ['/api/courses', selectedCourse, 'enrollments'],
      });
    },
    onError: () => {
      toast({
        title: 'خطأ في حذف الطالب',
        variant: 'destructive',
      });
    },
  });

  const selectedCourseData = courses.find((c) => c.id === selectedCourse);
  const activeStudents = enrollments.filter((e) => e.status === 'active').length;
  const completedStudents = enrollments.filter((e) => e.status === 'completed').length;

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-8"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-blue-900 font-arabic-serif">
              إدارة طلاب الدورات
            </h1>
          </div>
          <p className="text-blue-700 font-arabic-sans">إدارة والتحكم في الطلاب المسجلين في الدورات</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Courses List */}
          <div className="md:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="font-arabic-serif text-lg">الدورات</CardTitle>
                <CardDescription className="font-arabic-sans">
                  {courses.length} دورة متاحة
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 max-h-96 overflow-y-auto">
                {isLoadingCourses ? (
                  <div className="text-center text-gray-500 py-4 font-arabic-sans">
                    جاري التحميل...
                  </div>
                ) : courses.length === 0 ? (
                  <div className="text-center text-gray-500 py-4 font-arabic-sans">
                    لا توجد دورات
                  </div>
                ) : (
                  courses.map((course) => (
                    <button
                      key={course.id}
                      onClick={() => setSelectedCourse(course.id)}
                      className={`w-full text-right p-3 rounded-lg transition-colors ${
                        selectedCourse === course.id
                          ? 'bg-blue-100 border-2 border-blue-500'
                          : 'bg-gray-100 border-2 border-transparent hover:bg-gray-200'
                      }`}
                      data-testid={`button-course-${course.id}`}
                    >
                      <div className="font-semibold text-sm font-arabic-sans">{course.title}</div>
                      <div className="text-xs text-gray-600 font-arabic-sans">
                        {course.instructor}
                      </div>
                      <div className="text-xs text-blue-600 font-semibold mt-1">
                        {course.level}
                      </div>
                    </button>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Course Details and Students */}
          <div className="md:col-span-2 space-y-6">
            {selectedCourseData && (
              <>
                {/* Course Info */}
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardHeader>
                    <div className="flex items-center gap-3 justify-between">
                      <div>
                        <CardTitle className="font-arabic-serif text-xl">
                          {selectedCourseData.title}
                        </CardTitle>
                        <CardDescription className="font-arabic-sans">
                          بقيادة {selectedCourseData.instructor}
                        </CardDescription>
                      </div>
                      <BookOpen className="w-10 h-10 text-blue-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{enrollments.length}</div>
                        <div className="text-xs text-gray-600 font-arabic-sans">إجمالي المسجلين</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{activeStudents}</div>
                        <div className="text-xs text-gray-600 font-arabic-sans">نشطون</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{completedStudents}</div>
                        <div className="text-xs text-gray-600 font-arabic-sans">أكملوا</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Students List */}
                <Card>
                  <CardHeader>
                    <CardTitle className="font-arabic-serif flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      الطلاب ({enrollments.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoadingEnrollments ? (
                      <div className="text-center text-gray-500 py-8 font-arabic-sans">
                        جاري التحميل...
                      </div>
                    ) : enrollments.length === 0 ? (
                      <div className="text-center text-gray-500 py-8 font-arabic-sans">
                        لا يوجد طلاب مسجلين في هذه الدورة
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {enrollments.map((enrollment) => (
                          <div
                            key={enrollment.id}
                            className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                            data-testid={`enrollment-${enrollment.id}`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="font-semibold text-sm font-arabic-sans">
                                  {enrollment.student?.firstName} {enrollment.student?.lastName || ''}
                                </div>
                                <div className="text-xs text-gray-600 font-arabic-sans mt-1">
                                  {enrollment.student?.phoneNumber}
                                </div>
                                <div className="text-xs text-gray-500 font-arabic-sans mt-1">
                                  تاريخ التسجيل:{' '}
                                  {new Date(enrollment.enrollmentDate).toLocaleDateString('ar-SA')}
                                </div>
                              </div>
                              <div className="flex items-center gap-3 ml-3">
                                <div
                                  className={`px-2 py-1 rounded text-xs font-semibold font-arabic-sans flex items-center gap-1 ${
                                    enrollment.status === 'active'
                                      ? 'bg-green-100 text-green-800'
                                      : enrollment.status === 'completed'
                                        ? 'bg-purple-100 text-purple-800'
                                        : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {enrollment.status === 'active' ? (
                                    <>
                                      <Clock className="w-3 h-3" />
                                      نشط
                                    </>
                                  ) : enrollment.status === 'completed' ? (
                                    <>
                                      <CheckCircle className="w-3 h-3" />
                                      أكمل
                                    </>
                                  ) : (
                                    <>
                                      <User className="w-3 h-3" />
                                      منسحب
                                    </>
                                  )}
                                </div>
                                {enrollment.status === 'active' && (
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => removeMutation.mutate(enrollment.id)}
                                    disabled={removeMutation.isPending}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    data-testid={`button-remove-${enrollment.id}`}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}

            {!selectedCourse && (
              <Card className="text-center py-12">
                <div className="text-gray-500 font-arabic-sans">
                  <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  اختر دورة من القائمة لعرض الطلاب المسجلين
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
