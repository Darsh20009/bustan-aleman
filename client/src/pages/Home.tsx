import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { BookOpen, Calendar, Trophy, Users } from "lucide-react";

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ["/api/courses"],
  });

  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ["/api/user/enrollments"],
  });

  return (
    <div className="min-h-screen bg-warm-white dark:bg-gray-950 transition-colors">
      <Navigation />
      
      {/* Welcome Section */}
      <section className="hero-section dark:bg-gradient-to-b dark:from-gray-900 dark:to-gray-800">
        <div className="islamic-pattern-overlay dark:opacity-30"></div>
        <div className="hero-content container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-arabic-serif mb-4 sm:mb-6 text-white dark:text-white"
            data-testid="welcome-title"
          >
            أهلاً وسهلاً {(user as any)?.firstName || 'بك'}
          </h1>
          <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 opacity-90 text-white dark:text-gray-200">
            في بستان الإيمان - رحلتك نحو التعلم والإيمان تبدأ من هنا
          </p>
          <div className="flex flex-wrap gap-3 sm:gap-4 justify-center">
            <Button 
              onClick={() => setLocation("/courses")}
              className="btn-islamic-secondary px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base"
              data-testid="button-browse-courses"
            >
              استكشف الدورات
            </Button>
            <Button 
              onClick={() => setLocation("/quran")}
              className="btn-islamic-primary px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base"
              data-testid="button-quran-section"
            >
              قسم القرآن الكريم
            </Button>
          </div>
        </div>
      </section>

      {/* Dashboard Stats */}
      <section className="py-8 sm:py-12 bg-light-beige dark:bg-gray-900 transition-colors">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <Card className="islamic-card text-center dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-3 sm:p-6">
                <BookOpen className="text-islamic-green dark:text-green-400 mb-2 sm:mb-4 mx-auto" size={32} />
                <h3 className="text-xl sm:text-2xl font-bold text-islamic-green dark:text-green-400 mb-1 sm:mb-2">
                  {Array.isArray(enrollments) ? enrollments.length : 0}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">الدورات المسجلة</p>
              </CardContent>
            </Card>
            
            <Card className="islamic-card text-center dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-3 sm:p-6">
                <Calendar className="text-warm-gold dark:text-yellow-400 mb-2 sm:mb-4 mx-auto" size={32} />
                <h3 className="text-xl sm:text-2xl font-bold text-warm-gold dark:text-yellow-400 mb-1 sm:mb-2">
                  {Array.isArray(courses) ? courses.filter((c: any) => new Date(c.startDate) > new Date()).length : 0}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">الدورات القادمة</p>
              </CardContent>
            </Card>
            
            <Card className="islamic-card text-center dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-3 sm:p-6">
                <Trophy className="text-earth-brown dark:text-orange-400 mb-2 sm:mb-4 mx-auto" size={32} />
                <h3 className="text-xl sm:text-2xl font-bold text-earth-brown dark:text-orange-400 mb-1 sm:mb-2">0</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">الإنجازات</p>
              </CardContent>
            </Card>
            
            <Card className="islamic-card text-center dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-3 sm:p-6">
                <Users className="text-islamic-green dark:text-green-400 mb-2 sm:mb-4 mx-auto" size={32} />
                <h3 className="text-xl sm:text-2xl font-bold text-islamic-green dark:text-green-400 mb-1 sm:mb-2">50+</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">زملاء الدراسة</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* My Enrollments */}
      <section className="py-10 sm:py-16 bg-white dark:bg-gray-950 transition-colors">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-between items-center mb-6 sm:mb-8 gap-3">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold font-arabic-serif text-islamic-green dark:text-green-400">
              دوراتي المسجلة
            </h2>
            <Button 
              onClick={() => setLocation("/courses")}
              variant="outline"
              size="sm"
              className="text-sm"
              data-testid="button-view-all-courses"
            >
              عرض جميع الدورات
            </Button>
          </div>
          
          {enrollmentsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="animate-pulse" data-testid={`enrollment-skeleton-${i}`}>
                  <CardContent className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-2 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : enrollments && Array.isArray(enrollments) && enrollments.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="enrollments-grid">
              {enrollments.map((enrollment: any) => (
                <Card key={enrollment.id} className="islamic-card">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2">دورة مسجلة</h3>
                    <p className="text-gray-600 mb-4">
                      تاريخ التسجيل: {new Date(enrollment.enrollmentDate).toLocaleDateString('ar')}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-islamic-green h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${enrollment.progress || 0}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      التقدم: {enrollment.progress || 0}%
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12" data-testid="no-enrollments">
              <CardContent>
                <BookOpen className="text-6xl text-gray-300 mb-4 mx-auto" size={96} />
                <h3 className="text-xl font-semibold mb-2">لم تسجل في أي دورة بعد</h3>
                <p className="text-gray-600 mb-6">ابدأ رحلتك التعليمية بالتسجيل في إحدى دوراتنا</p>
                <Button 
                  onClick={() => setLocation("/courses")}
                  className="btn-islamic-primary"
                  data-testid="button-browse-courses-empty"
                >
                  استكشف الدورات المتاحة
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-10 sm:py-16 bg-light-beige">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold font-arabic-serif text-islamic-green text-center mb-8 sm:mb-12">
            إجراءات سريعة
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <Card className="islamic-card cursor-pointer hover-elevate" onClick={() => setLocation("/quran")}>
              <CardContent className="p-4 sm:p-6 text-center">
                <BookOpen className="text-islamic-green mb-3 sm:mb-4 mx-auto" size={48} />
                <h3 className="text-lg sm:text-xl font-bold mb-2">قسم القرآن الكريم</h3>
                <p className="text-sm sm:text-base text-gray-600">ابدأ رحلة حفظ القرآن الكريم</p>
              </CardContent>
            </Card>
            
            <Card className="islamic-card cursor-pointer hover-elevate" onClick={() => setLocation("/courses")}>
              <CardContent className="p-4 sm:p-6 text-center">
                <Calendar className="text-warm-gold mb-3 sm:mb-4 mx-auto" size={48} />
                <h3 className="text-lg sm:text-xl font-bold mb-2">الدورات المتاحة</h3>
                <p className="text-sm sm:text-base text-gray-600">تصفح جميع الدورات التعليمية</p>
              </CardContent>
            </Card>
            
            <Card className="islamic-card cursor-pointer hover-elevate" onClick={() => setLocation("/about")}>
              <CardContent className="p-4 sm:p-6 text-center">
                <Users className="text-earth-brown mb-3 sm:mb-4 mx-auto" size={48} />
                <h3 className="text-lg sm:text-xl font-bold mb-2">من نحن</h3>
                <p className="text-sm sm:text-base text-gray-600">تعرف على رسالتنا ورؤيتنا</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
