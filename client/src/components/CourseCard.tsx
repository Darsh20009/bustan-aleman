import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { BookOpen, Calendar, Users, Star } from "lucide-react";
import type { Course } from "@shared/schema";

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const enrollMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/enrollments", {
        courseId: course.id,
      });
    },
    onSuccess: () => {
      toast({
        title: "تم التسجيل بنجاح",
        description: `تم تسجيلك في دورة ${course.titleAr}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user/enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "يجب تسجيل الدخول",
          description: "سيتم توجيهك لتسجيل الدخول...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "خطأ في التسجيل",
        description: error.message || "حدث خطأ أثناء التسجيل في الدورة",
        variant: "destructive",
      });
    },
  });

  const getCategoryInfo = (category: string) => {
    switch (category) {
      case "quran":
        return {
          icon: BookOpen,
          color: "text-islamic-green border-islamic-green",
          bgColor: "bg-islamic-green",
        };
      case "ramadan":
        return {
          icon: Star,
          color: "text-warm-gold border-warm-gold",
          bgColor: "bg-warm-gold",
        };
      case "fiqh":
        return {
          icon: BookOpen,
          color: "text-earth-brown border-earth-brown",
          bgColor: "bg-earth-brown",
        };
      default:
        return {
          icon: BookOpen,
          color: "text-islamic-green border-islamic-green",
          bgColor: "bg-islamic-green",
        };
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case "beginner":
        return "مبتدئ";
      case "intermediate":
        return "متوسط";
      case "advanced":
        return "متقدم";
      default:
        return level;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "quran":
        return "القرآن الكريم";
      case "ramadan":
        return "رمضانية";
      case "fiqh":
        return "الفقه";
      default:
        return category;
    }
  };

  const categoryInfo = getCategoryInfo(course.category);
  const IconComponent = categoryInfo.icon;
  const startDate = new Date(course.startDate);
  const isUpcoming = startDate > new Date();
  const isRegistrationFull = (course.currentStudents || 0) >= (course.maxStudents || 50);

  return (
    <Card 
      className={`course-card ${course.category} islamic-card`}
      data-testid={`course-card-${course.id}`}
    >
      <CardContent className="p-6">
        <div className="text-center">
          <div className="flex justify-between items-start mb-4">
            <IconComponent className={`text-3xl ${categoryInfo.color.split(' ')[0]} flex-shrink-0`} size={32} />
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs">
                {getCategoryLabel(course.category)}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {getLevelLabel(course.level)}
              </Badge>
            </div>
          </div>

          <h3 
            className="text-lg font-semibold mb-2 arabic-text"
            data-testid={`course-title-${course.id}`}
          >
            {course.titleAr}
          </h3>

          {course.descriptionAr && (
            <p className="text-sm text-gray-600 mb-3 arabic-text line-clamp-2">
              {course.descriptionAr}
            </p>
          )}

          <div className="flex items-center justify-center gap-2 mb-2">
            <Calendar size={16} className="text-warm-gold" />
            <p 
              className="text-warm-gold font-semibold"
              data-testid={`course-date-${course.id}`}
            >
              {startDate.toLocaleDateString('ar')}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 mb-4">
            <Users size={16} className="text-gray-500" />
            <p className="text-sm text-gray-600">
              {course.currentStudents || 0} / {course.maxStudents || 50} طالب
            </p>
          </div>

          {course.price && course.price > 0 && (
            <div className="mb-4">
              <p className="text-lg font-bold text-islamic-green">
                {(course.price / 100).toFixed(2)} ر.س
              </p>
            </div>
          )}

          <Button 
            onClick={() => {
              if (!isAuthenticated) {
                window.location.href = "/api/login";
                return;
              }
              enrollMutation.mutate();
            }}
            className={`w-full ${categoryInfo.bgColor} text-white hover:opacity-90 transition-all`}
            disabled={!isUpcoming || isRegistrationFull || enrollMutation.isPending}
            data-testid={`button-enroll-${course.id}`}
          >
            {enrollMutation.isPending 
              ? "جاري التسجيل..." 
              : !isUpcoming 
                ? "انتهت الدورة" 
                : isRegistrationFull 
                  ? "الدورة مكتملة"
                  : isAuthenticated 
                    ? "سجل الآن" 
                    : "سجل دخولك للتسجيل"
            }
          </Button>

          {!isUpcoming && (
            <p className="text-xs text-gray-500 mt-2">
              بدأت في {startDate.toLocaleDateString('ar')}
            </p>
          )}

          {isUpcoming && (
            <p className="text-xs text-gray-500 mt-2">
              تبدأ خلال {Math.ceil((startDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} يوم
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
