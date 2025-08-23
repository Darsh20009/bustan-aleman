import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, Calendar, BookOpen } from "lucide-react";

export default function Courses() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ["/api/courses"],
  });

  // Filter courses based on search and filters
  const filteredCourses = (Array.isArray(courses) ? courses : []).filter((course: any) => {
    const matchesSearch = course.titleAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (course.titleEn && course.titleEn.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || course.category === selectedCategory;
    const matchesLevel = selectedLevel === "all" || course.level === selectedLevel;
    
    return matchesSearch && matchesCategory && matchesLevel;
  }) || [];

  const upcomingCourses = filteredCourses.filter((course: any) => 
    new Date(course.startDate) > new Date()
  );

  const categories = [
    { value: "all", label: "جميع الفئات" },
    { value: "quran", label: "القرآن الكريم" },
    { value: "ramadan", label: "البرامج الرمضانية" },
    { value: "fiqh", label: "الفقه الإسلامي" },
  ];

  const levels = [
    { value: "all", label: "جميع المستويات" },
    { value: "beginner", label: "مبتدئ" },
    { value: "intermediate", label: "متوسط" },
    { value: "advanced", label: "متقدم" },
  ];

  return (
    <div className="min-h-screen bg-warm-white">
      <Navigation />
      
      {/* Header */}
      <section className="hero-section">
        <div className="islamic-pattern-overlay"></div>
        <div className="hero-content container mx-auto px-4">
          <h1 
            className="text-4xl md:text-5xl font-bold font-arabic-serif mb-6"
            data-testid="page-title"
          >
            الدورات التعليمية
          </h1>
          <p className="text-xl mb-8 opacity-90">
            اكتشف مجموعة متنوعة من الدورات الإسلامية التعليمية المصممة خصيصًا لك
          </p>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 bg-light-beige">
        <div className="container mx-auto px-4">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="ابحث عن الدورات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                    data-testid="input-search-courses"
                  />
                </div>
                
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger data-testid="select-category">
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                  <SelectTrigger data-testid="select-level">
                    <SelectValue placeholder="اختر المستوى" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button 
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                    setSelectedLevel("all");
                  }}
                  variant="outline"
                  data-testid="button-clear-filters"
                >
                  <Filter className="ml-2 h-4 w-4" />
                  مسح الفلاتر
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Course Statistics */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="islamic-card text-center">
              <CardContent className="p-6">
                <BookOpen className="text-3xl text-islamic-green mb-4 mx-auto" size={48} />
                <h3 className="text-2xl font-bold text-islamic-green mb-2">
                  {Array.isArray(courses) ? courses.length : 0}
                </h3>
                <p className="text-gray-600">إجمالي الدورات</p>
              </CardContent>
            </Card>
            
            <Card className="islamic-card text-center">
              <CardContent className="p-6">
                <Calendar className="text-3xl text-warm-gold mb-4 mx-auto" size={48} />
                <h3 className="text-2xl font-bold text-warm-gold mb-2">
                  {upcomingCourses.length}
                </h3>
                <p className="text-gray-600">الدورات القادمة</p>
              </CardContent>
            </Card>
            
            <Card className="islamic-card text-center">
              <CardContent className="p-6">
                <Filter className="text-3xl text-earth-brown mb-4 mx-auto" size={48} />
                <h3 className="text-2xl font-bold text-earth-brown mb-2">
                  {filteredCourses.length}
                </h3>
                <p className="text-gray-600">النتائج المطابقة</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-16 bg-light-beige">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold font-arabic-serif text-islamic-green">
              الدورات المتاحة
            </h2>
            {filteredCourses.length > 0 && (
              <p className="text-gray-600">
                عرض {filteredCourses.length} من {Array.isArray(courses) ? courses.length : 0} دورة
              </p>
            )}
          </div>
          
          {coursesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse" data-testid={`course-skeleton-${i}`}>
                  <CardContent className="p-6">
                    <div className="h-16 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="courses-grid">
              {filteredCourses.map((course: any) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <Card className="text-center py-12" data-testid="no-courses-found">
              <CardContent>
                <BookOpen className="text-6xl text-gray-300 mb-4 mx-auto" size={96} />
                <h3 className="text-xl font-semibold mb-2">لا توجد دورات مطابقة للبحث</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || selectedCategory !== "all" || selectedLevel !== "all" 
                    ? "جرب تغيير معايير البحث أو الفلاتر"
                    : "لا توجد دورات متاحة حاليًا"
                  }
                </p>
                {(searchTerm || selectedCategory !== "all" || selectedLevel !== "all") && (
                  <Button 
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("all");
                      setSelectedLevel("all");
                    }}
                    className="btn-islamic-primary"
                    data-testid="button-clear-all-filters"
                  >
                    مسح جميع الفلاتر
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Course Categories Info */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold font-arabic-serif text-islamic-green text-center mb-12">
            فئات الدورات
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="islamic-card text-center border-t-4 border-islamic-green">
              <CardContent className="p-6">
                <BookOpen className="text-4xl text-islamic-green mb-4 mx-auto" size={64} />
                <h3 className="text-xl font-bold mb-3">القرآن الكريم</h3>
                <p className="text-gray-600 arabic-text">
                  دورات تحفيظ القرآن الكريم مع التجويد والتفسير
                </p>
              </CardContent>
            </Card>
            
            <Card className="islamic-card text-center border-t-4 border-warm-gold">
              <CardContent className="p-6">
                <Calendar className="text-4xl text-warm-gold mb-4 mx-auto" size={64} />
                <h3 className="text-xl font-bold mb-3">البرامج الرمضانية</h3>
                <p className="text-gray-600 arabic-text">
                  برامج إعداد خاصة لشهر رمضان المبارك
                </p>
              </CardContent>
            </Card>
            
            <Card className="islamic-card text-center border-t-4 border-earth-brown">
              <CardContent className="p-6">
                <Filter className="text-4xl text-earth-brown mb-4 mx-auto" size={64} />
                <h3 className="text-xl font-bold mb-3">الفقه الإسلامي</h3>
                <p className="text-gray-600 arabic-text">
                  دورات تعليم الفقه والأحكام الشرعية
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
