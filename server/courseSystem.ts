// نظام إدارة الدورات التحفيظية
export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  startDate: string;
  endDate: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: 'quran' | 'fiqh' | 'ramadan';
  maxStudents: number;
  currentStudents: number;
  price: number;
  isActive: boolean;
  requirements: string[];
  schedule: {
    days: string[];
    time: string;
    duration: string;
  };
  curriculum: {
    week: number;
    topic: string;
    objectives: string[];
    surahs?: string[];
  }[];
}

export interface CourseEnrollment {
  id: string;
  studentId: string;
  courseId: string;
  enrollmentDate: string;
  status: 'enrolled' | 'active' | 'completed' | 'dropped';
  progress: number;
  currentWeek: number;
  completedLessons: string[];
  attendance: {
    date: string;
    attended: boolean;
    notes?: string;
  }[];
  grades: {
    assessment: string;
    score: number;
    date: string;
  }[];
}

export class CourseManager {
  private courses: Course[] = [
    {
      id: 'quran-basic',
      title: 'دورة تحفيظ القرآن الكريم - المستوى الأساسي',
      description: 'دورة شاملة لحفظ القرآن الكريم مع أحدث الأساليب التعليمية والمتابعة الشخصية لكل طالب',
      instructor: 'الشيخ أحمد يوسف',
      startDate: '2025-02-15',
      endDate: '2025-08-15',
      level: 'beginner',
      category: 'quran',
      maxStudents: 20,
      currentStudents: 5,
      price: 0,
      isActive: true,
      requirements: ['إتقان قراءة الحروف العربية', 'الالتزام بالحضور'],
      schedule: {
        days: ['الأحد', 'الثلاثاء', 'الخميس'],
        time: '16:00',
        duration: '90 دقيقة'
      },
      curriculum: [
        {
          week: 1,
          topic: 'مراجعة التجويد الأساسي',
          objectives: ['إتقان الحروف والحركات', 'فهم أحكام النون الساكنة'],
          surahs: ['الفاتحة', 'الناس', 'الفلق']
        },
        {
          week: 2,
          topic: 'حفظ جزء عم - القسم الأول',
          objectives: ['حفظ سورة النبأ', 'فهم معاني الآيات'],
          surahs: ['النبأ']
        }
      ]
    },
    {
      id: 'ramadan-level1',
      title: 'المسابقة الرمضانية - المستوى الأول',
      description: 'مسابقة رمضانية مخصصة للمبتدئين في حفظ القرآن مع جوائز قيمة ومتابعة يومية',
      instructor: 'الأستاذة فاطمة الزهراء',
      startDate: '2025-03-01',
      endDate: '2025-03-30',
      level: 'beginner',
      category: 'ramadan',
      maxStudents: 15,
      currentStudents: 8,
      price: 0,
      isActive: true,
      requirements: ['حفظ جزء عم'],
      schedule: {
        days: ['يومياً'],
        time: '19:00',
        duration: '60 دقيقة'
      },
      curriculum: [
        {
          week: 1,
          topic: 'مراجعة جزء عم',
          objectives: ['إتقان التلاوة', 'فهم المعاني'],
          surahs: ['النبأ', 'النازعات', 'عبس']
        }
      ]
    },
    {
      id: 'fiqh-kids',
      title: 'دورة الفقه للأطفال',
      description: 'دورة تفاعلية لتعليم الأطفال أساسيات الفقه والعبادات بطريقة ممتعة ومبسطة',
      instructor: 'الشيخ محمد العلي',
      startDate: '2025-03-20',
      endDate: '2025-06-20',
      level: 'beginner',
      category: 'fiqh',
      maxStudents: 30,
      currentStudents: 12,
      price: 0,
      isActive: true,
      requirements: ['العمر: 6-12 سنة'],
      schedule: {
        days: ['السبت'],
        time: '10:00',
        duration: '60 دقيقة'
      },
      curriculum: [
        {
          week: 1,
          topic: 'الطهارة',
          objectives: ['تعلم الوضوء', 'أهمية النظافة'],
        }
      ]
    }
  ];

  private enrollments: CourseEnrollment[] = [];

  getAllCourses(): Course[] {
    return this.courses.filter(course => course.isActive);
  }

  getCourse(courseId: string): Course | null {
    return this.courses.find(c => c.id === courseId) || null;
  }

  async enrollStudent(studentId: string, courseId: string): Promise<CourseEnrollment | null> {
    const course = this.getCourse(courseId);
    if (!course) return null;

    if (course.currentStudents >= course.maxStudents) {
      throw new Error('الدورة ممتلئة');
    }

    // تحقق من التسجيل المسبق
    const existingEnrollment = this.enrollments.find(
      e => e.studentId === studentId && e.courseId === courseId
    );
    if (existingEnrollment) {
      throw new Error('أنت مسجل في هذه الدورة بالفعل');
    }

    const enrollment: CourseEnrollment = {
      id: `enrollment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      studentId,
      courseId,
      enrollmentDate: new Date().toISOString(),
      status: 'enrolled',
      progress: 0,
      currentWeek: 1,
      completedLessons: [],
      attendance: [],
      grades: []
    };

    this.enrollments.push(enrollment);
    course.currentStudents++;

    return enrollment;
  }

  getStudentEnrollments(studentId: string): CourseEnrollment[] {
    return this.enrollments.filter(e => e.studentId === studentId);
  }

  updateProgress(enrollmentId: string, progress: number, completedLesson?: string): boolean {
    const enrollment = this.enrollments.find(e => e.id === enrollmentId);
    if (!enrollment) return false;

    enrollment.progress = Math.min(100, Math.max(0, progress));
    
    if (completedLesson && !enrollment.completedLessons.includes(completedLesson)) {
      enrollment.completedLessons.push(completedLesson);
    }

    if (enrollment.progress >= 100) {
      enrollment.status = 'completed';
    } else if (enrollment.progress > 0) {
      enrollment.status = 'active';
    }

    return true;
  }

  addAttendance(enrollmentId: string, date: string, attended: boolean, notes?: string): boolean {
    const enrollment = this.enrollments.find(e => e.id === enrollmentId);
    if (!enrollment) return false;

    enrollment.attendance.push({
      date,
      attended,
      notes
    });

    return true;
  }
}

export const courseManager = new CourseManager();