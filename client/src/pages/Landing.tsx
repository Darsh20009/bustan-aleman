import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import TeacherProfile from "@/components/TeacherProfile";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { BookOpen, Heart, Star, Users } from "lucide-react";

export default function Landing() {
  const [, setLocation] = useLocation();

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ["/api/courses"],
  });

  const { data: instructors, isLoading: instructorsLoading } = useQuery({
    queryKey: ["/api/instructors"],
  });

  // Seed data on first load
  useEffect(() => {
    const seedData = async () => {
      try {
        await fetch("/api/seed", { method: "POST" });
      } catch (error) {
        console.log("Seed data already exists or error occurred");
      }
    };
    seedData();
  }, []);

  return (
    <div className="min-h-screen bg-warm-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="hero-section">
        <div className="islamic-pattern-overlay"></div>
        <div className="hero-content container mx-auto px-4">
          <h1 
            className="text-5xl md:text-6xl font-bold font-arabic-serif mb-6 animate-fade-in"
            data-testid="hero-title"
          >
            بستان الإيمان
          </h1>
          <p className="text-xl md:text-2xl mb-4 opacity-90 animate-slide-in-right">
            فلنستكشف تعاليم الدين
          </p>
          <p className="text-lg mb-8 opacity-80 animate-slide-in-left">
            مع القارئ الشيخ: أحمد عبدالعزيز (أبو مازن)
          </p>
          <Button 
            onClick={() => setLocation("/courses")}
            className="btn-islamic-secondary px-8 py-3 text-lg font-semibold animate-fade-in"
            data-testid="button-start-journey"
          >
            ابدأ رحلتك الآن
          </Button>
        </div>
      </section>

      {/* Hero Images Section */}
      <section className="py-12 bg-light-beige">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <img 
              src="https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
              alt="Islamic architecture" 
              className="rounded-xl shadow-lg w-full h-64 object-cover animate-fade-in"
              data-testid="img-islamic-architecture"
            />
            <img 
              src="https://images.unsplash.com/photo-1544816155-12df9643f363?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
              alt="Person holding Quran" 
              className="rounded-xl shadow-lg w-full h-64 object-cover animate-fade-in"
              data-testid="img-quran-reading"
            />
            <img 
              src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
              alt="Student reading book" 
              className="rounded-xl shadow-lg w-full h-64 object-cover animate-fade-in"
              data-testid="img-student-reading"
            />
          </div>
        </div>
      </section>

      {/* Upcoming Courses Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold font-arabic-serif text-islamic-green mb-4">
              الدورات القادمة
            </h2>
            <p className="text-xl text-gray-600">رحلة تعليمية حول العالم</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="courses-grid">
            {coursesLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="course-card animate-pulse" data-testid={`course-skeleton-${i}`}>
                  <div className="h-16 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              ))
            ) : courses && Array.isArray(courses) && courses.length ? (
              courses.map((course: any) => (
                <CourseCard key={course.id} course={course} />
              ))
            ) : (
              <div className="col-span-full text-center py-8" data-testid="no-courses">
                <p className="text-muted-foreground">لا توجد دورات متاحة حاليًا</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* What We Can Do Section */}
      <section className="py-16 bg-light-beige">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Islamic lamp on table" 
                className="rounded-xl shadow-lg w-full h-auto"
                data-testid="img-islamic-lamp"
              />
            </div>
            <div className="animate-slide-in-left">
              <h2 className="text-4xl font-bold font-arabic-serif text-islamic-green mb-6">
                ما يمكننا فعله من أجلك
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-6 arabic-text">
                نحن هنا لنساعدك على تحقيق أهدافك الدينية والتعليمية. سواء كنت تسعى لحفظ القرآن الكريم، تعلم الفقه، أو تحسين علاقتك مع الله، فريقنا هنا لدعمك بكل ما تحتاجه.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mb-8 arabic-text">
                في كل خطوة على الطريق، نحن معك لتحقيق التميز والارتقاء الروحي. فهل أنت مستعد للانطلاق في رحلة العلم والإيمان؟ نحن هنا من أجلك!
              </p>
              <Button 
                onClick={() => setLocation("/about")}
                className="btn-islamic-primary px-8 py-3 font-semibold"
                data-testid="button-learn-more"
              >
                تعرف علينا أكثر
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Deep Meanings Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold font-arabic-serif text-islamic-green mb-4">
              استكشف المعاني العميقة في تعاليم الدين
            </h2>
            <p className="text-xl text-gray-600 mb-8 arabic-text">
              انطلق في تجربة تعليمية في تحفيظ القرآن، والتي يتم اختيارها بعناية خصيصاً لك.
            </p>
            <div className="max-w-2xl mx-auto">
              <img 
                src="https://images.unsplash.com/photo-1571629798154-3c9a9d7adb23?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500" 
                alt="Islamic geometric pattern" 
                className="rounded-xl shadow-lg w-full h-auto"
                data-testid="img-islamic-pattern"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Teachers Section */}
      <section className="py-16 bg-light-beige">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold font-arabic-serif text-islamic-green mb-4">
              تعرّف على معلمينا المميزين
            </h2>
            <p className="text-xl text-gray-600">خبراء متخصصون متفانون يقودون نجاحنا</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" data-testid="instructors-grid">
            {instructorsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="animate-pulse" data-testid={`instructor-skeleton-${i}`}>
                  <CardContent className="p-8 text-center">
                    <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-6"></div>
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))
            ) : instructors && Array.isArray(instructors) && instructors.length ? (
              instructors.map((instructor: any) => (
                <TeacherProfile key={instructor.id} instructor={instructor} />
              ))
            ) : (
              <div className="col-span-full text-center py-8" data-testid="no-instructors">
                <p className="text-muted-foreground">لا توجد معلومات عن المعلمين حاليًا</p>
              </div>
            )}
          </div>

          {/* Quran Tips Section */}
          <div className="mt-12 max-w-3xl mx-auto">
            <Card className="bg-islamic-green text-white">
              <CardContent className="p-8 text-center">
                <BookOpen className="text-4xl mb-4 mx-auto" size={48} />
                <h3 className="text-2xl font-bold font-arabic-serif mb-4">نصائح لحفظ القرآن الكريم</h3>
                <p className="text-lg mb-4">صنع الشيخ (أحمد النفيس)</p>
                <Button 
                  className="bg-warm-gold text-dark-charcoal hover:bg-yellow-600 px-6 py-2"
                  data-testid="button-quran-tips"
                >
                  📖 اطلع على النصائح
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold font-arabic-serif text-islamic-green text-center mb-12">
            قيمنا الأساسية
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="islamic-card text-center border-t-4 border-islamic-green">
              <CardContent className="p-6">
                <Heart className="text-3xl text-islamic-green mb-4 mx-auto" size={48} />
                <h3 className="text-xl font-bold mb-3">الإخلاص</h3>
                <p className="text-gray-600 arabic-text">كل ما نقدمه يهدف إلى رضا الله</p>
              </CardContent>
            </Card>
            
            <Card className="islamic-card text-center border-t-4 border-warm-gold">
              <CardContent className="p-6">
                <Star className="text-3xl text-warm-gold mb-4 mx-auto" size={48} />
                <h3 className="text-xl font-bold mb-3">الجودة</h3>
                <p className="text-gray-600 arabic-text">نحرص على تقديم محتوى تعليمي بمستوى عالٍ من الاحترافية</p>
              </CardContent>
            </Card>
            
            <Card className="islamic-card text-center border-t-4 border-earth-brown">
              <CardContent className="p-6">
                <Users className="text-3xl text-earth-brown mb-4 mx-auto" size={48} />
                <h3 className="text-xl font-bold mb-3">الشمولية</h3>
                <p className="text-gray-600 arabic-text">نهتم بتلبية احتياجات جميع الفئات العمرية</p>
              </CardContent>
            </Card>
            
            <Card className="islamic-card text-center border-t-4 border-islamic-green">
              <CardContent className="p-6">
                <BookOpen className="text-3xl text-islamic-green mb-4 mx-auto" size={48} />
                <h3 className="text-xl font-bold mb-3">الإبداع</h3>
                <p className="text-gray-600 arabic-text">نبتكر طرقًا جديدة تجمع بين التعليم والمتعة</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
