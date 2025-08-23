import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, GraduationCap, Award } from "lucide-react";
import type { Instructor } from "@shared/schema";

interface TeacherProfileProps {
  instructor: Instructor;
}

export default function TeacherProfile({ instructor }: TeacherProfileProps) {
  return (
    <Card 
      className="islamic-card text-center hover:shadow-xl transition-all duration-300"
      data-testid={`teacher-profile-${instructor.id}`}
    >
      <CardContent className="p-8">
        {/* Profile Image */}
        <div className="relative mb-6">
          {instructor.profileImageUrl ? (
            <img 
              src={instructor.profileImageUrl}
              alt={instructor.nameAr}
              className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-islamic-green shadow-lg"
              data-testid={`teacher-image-${instructor.id}`}
            />
          ) : (
            <div className="w-32 h-32 rounded-full mx-auto bg-islamic-green border-4 border-islamic-green flex items-center justify-center shadow-lg">
              <User className="text-white" size={48} />
            </div>
          )}
          
          {/* Status Badge */}
          {instructor.isActive && (
            <Badge className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-warm-gold text-dark-charcoal">
              متاح للتدريس
            </Badge>
          )}
        </div>

        {/* Name and Title */}
        <h3 
          className="text-2xl font-bold font-arabic-serif text-islamic-green mb-2"
          data-testid={`teacher-name-${instructor.id}`}
        >
          {instructor.nameAr}
        </h3>
        
        {instructor.titleAr && (
          <p 
            className="text-warm-gold font-semibold mb-4"
            data-testid={`teacher-title-${instructor.id}`}
          >
            {instructor.titleAr}
          </p>
        )}

        {/* Biography */}
        {instructor.bioAr && (
          <p 
            className="text-gray-700 leading-relaxed mb-6 arabic-text"
            data-testid={`teacher-bio-${instructor.id}`}
          >
            {instructor.bioAr}
          </p>
        )}

        {/* Qualifications and Experience */}
        <div className="space-y-4">
          {instructor.qualifications && (
            <div className="bg-light-beige p-4 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <GraduationCap className="text-islamic-green" size={20} />
                <h4 className="font-bold text-islamic-green">المؤهلات</h4>
              </div>
              <p className="text-sm text-gray-700 arabic-text">
                {instructor.qualifications}
              </p>
            </div>
          )}

          {instructor.experience && (
            <div className="bg-white border border-border p-4 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Award className="text-warm-gold" size={20} />
                <h4 className="font-bold text-warm-gold">الخبرة</h4>
              </div>
              <p className="text-sm text-gray-700 arabic-text">
                {instructor.experience}
              </p>
            </div>
          )}
        </div>

        {/* English Name and Title (if available) */}
        {(instructor.nameEn || instructor.titleEn) && (
          <div className="mt-6 pt-4 border-t border-border">
            {instructor.nameEn && (
              <p className="text-gray-600 text-sm font-medium">{instructor.nameEn}</p>
            )}
            {instructor.titleEn && (
              <p className="text-gray-500 text-xs">{instructor.titleEn}</p>
            )}
          </div>
        )}

        {/* Creation Date */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-400">
            انضم في {instructor.createdAt ? new Date(instructor.createdAt).toLocaleDateString('ar') : 'غير محدد'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
