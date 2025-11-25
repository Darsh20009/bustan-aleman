import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, BookOpen, TrendingUp, BarChart3 } from 'lucide-react';

interface Course {
  id: string;
  titleAr: string;
  category: string;
  maxStudents: number;
  currentStudents?: number;
  isPaid: boolean;
  price?: number;
  createdAt: string;
}

interface CourseStudent {
  id: string;
  studentName: string;
  phoneNumber: string;
  enrolledAt: string;
  progress?: number;
  status: 'active' | 'completed' | 'paused';
}

export default function CourseManagementPage() {
  const [selectedCourse, setSelectedCourse] = useState<string>('');

  // Fetch supervisor's courses
  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ['my-courses-manage'],
    queryFn: async () => {
      const response = await fetch('/api/courses');
      return response.json();
    },
  });

  // Fetch course students
  const { data: courseStudents = [] } = useQuery<CourseStudent[]>({
    queryKey: ['course-students', selectedCourse],
    queryFn: async () => {
      const response = await fetch(`/api/courses/${selectedCourse}/students`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!selectedCourse,
  });

  const selectedCourseData = courses.find((c: Course) => c.id === selectedCourse);

  const categoryAr: Record<string, string> = {
    quran: 'القرآن الكريم',
    fiqh: 'الفقه الإسلامي',
    hadith: 'الحديث الشريف',
    seerah: 'السيرة النبوية',
    other: 'أخرى',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-emerald-900 mb-2">إدارة الدورات</h1>
          <p className="text-gray-600">إدارة محتوى الدورات والطلاب والمتابعة</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Courses Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-emerald-200 sticky top-6">
              <CardHeader>
                <CardTitle className="text-emerald-700">الدورات الخاصة بي</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {courses.length === 0 ? (
                  <p className="text-sm text-gray-500">لا توجد دورات</p>
                ) : (
                  courses.map((course: Course) => (
                    <button
                      key={course.id}
                      onClick={() => setSelectedCourse(course.id)}
                      className={`w-full text-right p-3 rounded-lg border-2 transition-colors ${
                        selectedCourse === course.id
                          ? 'bg-emerald-100 border-emerald-500'
                          : 'bg-white border-gray-200 hover:border-emerald-300'
                      }`}
                    >
                      <div className="font-medium text-sm text-emerald-900">{course.titleAr}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {categoryAr[course.category]}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {course.currentStudents || 0} / {course.maxStudents}
                      </div>
                    </button>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {selectedCourseData ? (
              <Tabs defaultValue="overview" className="w-full space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
                  <TabsTrigger value="students">الطلاب</TabsTrigger>
                  <TabsTrigger value="content">المحتوى</TabsTrigger>
                  <TabsTrigger value="progress">التقدم</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview">
                  <Card className="border-emerald-200">
                    <CardHeader>
                      <CardTitle className="text-emerald-700">معلومات الدورة</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-emerald-50 rounded-lg">
                          <div className="text-sm text-gray-600">العنوان</div>
                          <div className="font-semibold text-emerald-900">{selectedCourseData.titleAr}</div>
                        </div>
                        <div className="p-4 bg-emerald-50 rounded-lg">
                          <div className="text-sm text-gray-600">التصنيف</div>
                          <div className="font-semibold text-emerald-900">
                            {categoryAr[selectedCourseData.category]}
                          </div>
                        </div>
                        <div className="p-4 bg-emerald-50 rounded-lg">
                          <div className="text-sm text-gray-600">عدد الطلاب</div>
                          <div className="font-semibold text-emerald-900">
                            {selectedCourseData.currentStudents || 0} / {selectedCourseData.maxStudents}
                          </div>
                        </div>
                        <div className="p-4 bg-emerald-50 rounded-lg">
                          <div className="text-sm text-gray-600">نوع الدورة</div>
                          <div className="font-semibold text-emerald-900">
                            {selectedCourseData.isPaid ? `مدفوعة (${selectedCourseData.price} ريال)` : 'مجانية'}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Students Tab */}
                <TabsContent value="students">
                  <Card className="border-emerald-200">
                    <CardHeader>
                      <CardTitle className="text-emerald-700 flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        الطلاب المسجلين
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {courseStudents.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">لا يوجد طلاب مسجلين بعد</p>
                      ) : (
                        <div className="space-y-3">
                          {courseStudents.map((student: CourseStudent) => (
                            <div key={student.id} className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-emerald-900">{student.studentName}</h4>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  student.status === 'active' ? 'bg-emerald-200 text-emerald-800' :
                                  student.status === 'completed' ? 'bg-blue-200 text-blue-800' :
                                  'bg-gray-200 text-gray-800'
                                }`}>
                                  {student.status === 'active' ? 'نشط' :
                                   student.status === 'completed' ? 'مكتمل' :
                                   'متوقف'}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">{student.phoneNumber}</p>
                              {student.progress !== undefined && (
                                <div className="mt-2">
                                  <div className="text-xs text-gray-600 mb-1">التقدم: {student.progress}%</div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-emerald-500 h-2 rounded-full transition-all"
                                      style={{ width: `${student.progress}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Content Tab */}
                <TabsContent value="content">
                  <Card className="border-emerald-200">
                    <CardHeader>
                      <CardTitle className="text-emerald-700 flex items-center gap-2">
                        <BookOpen className="w-5 h-5" />
                        محتوى الدورة
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="p-4 bg-blue-50 rounded-lg text-blue-800 text-center">
                        <p>ميزة إضافة المحتوى قريباً</p>
                        <p className="text-sm mt-2">يمكنك إضافة الوحدات والدروس والملفات هنا</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Progress Tab */}
                <TabsContent value="progress">
                  <Card className="border-emerald-200">
                    <CardHeader>
                      <CardTitle className="text-emerald-700 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        تقدم الطلاب
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {courseStudents.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">لا يوجد بيانات متاحة</p>
                      ) : (
                        <div className="space-y-3">
                          {courseStudents
                            .filter(s => s.progress !== undefined)
                            .sort((a, b) => (b.progress || 0) - (a.progress || 0))
                            .map((student: CourseStudent) => (
                              <div key={student.id} className="flex items-center gap-4">
                                <div className="flex-1">
                                  <p className="font-medium text-sm text-emerald-900">{student.studentName}</p>
                                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                    <div 
                                      className="bg-emerald-500 h-2 rounded-full transition-all"
                                      style={{ width: `${student.progress || 0}%` }}
                                    ></div>
                                  </div>
                                </div>
                                <div className="text-sm font-semibold text-emerald-600 w-12 text-right">
                                  {student.progress}%
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <Card className="border-emerald-200">
                <CardContent className="p-12 text-center">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">اختر دورة لعرض تفاصيلها</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
