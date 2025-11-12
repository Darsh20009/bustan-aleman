import type { Express } from "express";
import { jsonStorage } from "./jsonStorage";
// courseManager removed - using storage for all course operations
import { hashPassword, verifyPassword } from "./authUtils";
import { requireAuth, requireAdmin, requireSupervisorOrAdmin } from "./authMiddleware";
import { storage } from "./storage";
import { z } from "zod";

// Extend session data
declare module 'express-session' {
  interface SessionData {
    studentId: string;
    userId?: string;
    userRole?: 'student' | 'supervisor' | 'admin';
  }
}

// Helper function to get student data from either storage system
async function getCurrentStudent(req: any) {
  const { studentId, userId } = req.session || {};

  // Try to get from JSON storage first (legacy method)
  if (studentId) {
    const students = await jsonStorage.getAllStudents();
    const student = students.find(s => s.id === studentId && s.isActive);
    if (student) return student;
  }

  // Try to get by userId from database (new method)
  if (userId) {
    const user = await storage.getUser(userId);
    if (user && user.role === 'student') {
      const students = await jsonStorage.getAllStudents();
      const student = students.find(s => s.email === user.email && s.isActive);
      if (student) return student;
    }
  }

  return null;
}

// Registration schema
const registrationSchema = z.object({
  studentName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().min(10),
  dateOfBirth: z.string(),
  age: z.number().min(5).max(100),
});

export function setupJSONRoutes(app: Express) {
  // Initialize default students endpoint (DISABLED - pre-registered users are now initialized via phoneAuth)
  app.post('/api/init-data', async (req, res) => {
    try {
      res.json({ message: 'Default students initialization is handled by phoneAuth system' });
    } catch (error) {
      console.error('Error initializing default students:', error);
      res.status(500).json({ message: 'Failed to initialize default students' });
    }
  });

  // Sync JSON students to database
  app.post('/api/sync-students-to-db', async (req, res) => {
    try {
      const jsonStudents = await jsonStorage.getAllStudents();
      let syncedCount = 0;

      for (const jsonStudent of jsonStudents) {
        // Check if user exists
        const users = await storage.getAllUsers();
        let user = users.find((u: any) => u.phoneNumber === jsonStudent.phone);

        // Create user if doesn't exist
        if (!user) {
          user = await storage.createUserWithPhone({
            firstName: jsonStudent.studentName.split(' ')[0] || jsonStudent.studentName,
            phoneNumber: jsonStudent.phone || '+966532441566',
            passwordHash: jsonStudent.password,
            role: 'student',
          });
        }

        // Check if student record exists
        const students = await storage.getAllStudents();
        const existingStudent = students.find(s => s.userId === user.id);

        if (!existingStudent) {
          // Create student record
          await storage.createStudent({
            userId: user.id,
            studentName: jsonStudent.studentName,
            passwordHash: jsonStudent.password,
            dateOfBirth: jsonStudent.dateOfBirth,
            grade: jsonStudent.grade || null,
            monthlySessionsCount: 0,
            monthlyPrice: "0",
            isPaid: false,
            isActive: jsonStudent.isActive,
            memorizedSurahs: JSON.stringify(jsonStudent.memorizedSurahs || []),
            currentLevel: jsonStudent.currentLevel || 'beginner',
            notes: jsonStudent.notes || null,
            zoomLink: jsonStudent.zoomLink || null,
            whatsappContact: jsonStudent.phone || '+966532441566',
          });
          syncedCount++;
        }
      }

      res.json({ 
        message: `تم مزامنة ${syncedCount} طالب إلى قاعدة البيانات`,
        syncedCount 
      });
    } catch (error) {
      console.error('Error syncing students:', error);
      res.status(500).json({ message: 'فشل في مزامنة البيانات' });
    }
  });

  // Student registration with WhatsApp notification
  app.post('/api/register', async (req, res) => {
    try {
      const registrationData = registrationSchema.parse(req.body);

      // Hash password before storing
      const hashedPassword = await hashPassword(registrationData.password);

      // Create new student
      const student = await jsonStorage.createStudent({
        ...registrationData,
        password: hashedPassword, // Store hashed password
        memorizedSurahs: [],
        errors: [],
        sessions: [],
        payments: [],
        schedules: [],
        currentLevel: 'beginner',
        notes: 'طالب جديد',
        zoomLink: '',
        isActive: true,
      });

      // Send registration details to WhatsApp (without password for security)
      const whatsappMessage = `
🌟 تسجيل طالب جديد في بستان الإيمان 🌟

الاسم: ${student.studentName}
الإيميل: ${student.email}
الهاتف: ${student.phone}
تاريخ الميلاد: ${student.dateOfBirth}
العمر: ${student.age} سنة

تم التسجيل بنجاح في ${new Date().toLocaleString('ar-SA')}
سيتم التواصل معك قريباً لتأكيد بيانات الدخول.
      `.trim();

      // Create WhatsApp link for user to send the message
      const whatsappLink = `https://wa.me/966549947386?text=${encodeURIComponent(whatsappMessage)}`;

      console.log(`Sending to +966549947386: ${whatsappMessage}`);

      res.status(201).json({ 
        message: "تم التسجيل بنجاح! انقر على الرابط للتواصل عبر الواتساب",
        whatsappLink,
        shouldRedirectToWhatsApp: true,
        student: {
          id: student.id,
          studentName: student.studentName,
          email: student.email,
        }
      });
    } catch (error) {
      console.error("Error registering student:", error);
      res.status(500).json({ message: "فشل في التسجيل، يرجى المحاولة مرة أخرى" });
    }
  });

  // Student login - supports both student name and email
  app.post('/api/student-login', async (req, res) => {
    try {
      const { identifier, password } = req.body; // Changed from email to identifier

      // Find student by name or email first
      const students = await jsonStorage.getAllStudents();
      const student = students.find(s => 
        (s.studentName === identifier || s.email === identifier) && 
        s.isActive
      );

      if (!student) {
        return res.status(401).json({ message: "بيانات الدخول غير صحيحة" });
      }

      // Verify password against stored hash
      const isValidPassword = await verifyPassword(password, student.password);

      if (!isValidPassword) {
        return res.status(401).json({ message: "بيانات الدخول غير صحيحة" });
      }

      // Get or create user record for session consistency
      const users = await storage.getAllUsers();
      let user = users.find(u => u.email === student.email && u.isActive);

      // Auto-create user record if it doesn't exist (for legacy student compatibility)
      if (!user) {
        // Ensure password is properly hashed (legacy passwords should already be hashed)
        let passwordHash = student.password;
        if (!student.password.startsWith('$2b$')) {
          console.log('Legacy password not hashed, hashing now for student:', student.email);
          passwordHash = await hashPassword(student.password);
        }

        user = await storage.upsertUser({
          email: student.email,
          firstName: student.studentName?.split(' ')[0] || student.email.split('@')[0],
          lastName: student.studentName?.split(' ').slice(1).join(' ') || '',
          role: 'student',
          passwordHash: passwordHash, // Ensure hashed password
          isActive: true,
          registrationCompleted: true,
        });
      }

      // Store student session (create session object if it doesn't exist)
      if (!req.session) {
        req.session = {} as any;
      }
      req.session.studentId = student.id;
      req.session.userId = user.id;
      req.session.userRole = 'student';

      res.json({
        message: "تم تسجيل الدخول بنجاح",
        student: {
          id: student.id,
          studentName: student.studentName,
          email: student.email,
          memorizedSurahs: student.memorizedSurahs,
          currentLevel: student.currentLevel,
          schedules: student.schedules,
          errors: student.errors,
          sessions: student.sessions,
          payments: student.payments,
          notes: student.notes,
        }
      });
    } catch (error) {
      console.error("Error authenticating student:", error);
      res.status(500).json({ message: "فشل في تسجيل الدخول" });
    }
  });

  // Get student profile
  app.get('/api/student/profile', requireAuth, async (req, res) => {
    try {
      const student = await getCurrentStudent(req);
      if (!student) {
        return res.status(404).json({ message: "الطالب غير موجود" });
      }

      // Sanitize response - never expose password hash to client
      const { password, ...safeStudent } = student;
      res.json(safeStudent);
    } catch (error) {
      console.error("Error fetching student profile:", error);
      res.status(500).json({ message: "فشل في جلب بيانات الطالب" });
    }
  });

  // Update student progress
  app.post('/api/student/progress', requireAuth, async (req, res) => {
    try {
      const studentId = req.session?.studentId;
      if (!studentId) {
        return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
      }

      const { memorizedVerses, currentSurah, mistakes } = req.body;

      // This would update the student's local progress
      // For now, we'll just store it in localStorage on the client side

      res.json({ message: "تم حفظ التقدم بنجاح" });
    } catch (error) {
      console.error("Error updating progress:", error);
      res.status(500).json({ message: "فشل في حفظ التقدم" });
    }
  });

  // Get student errors
  app.get('/api/student/errors', requireAuth, async (req, res) => {
    try {
      const studentId = req.session?.studentId;
      if (!studentId) {
        return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
      }

      const student = await jsonStorage.getStudent(studentId);
      if (!student) {
        return res.status(404).json({ message: "الطالب غير موجود" });
      }

      res.json(student.errors);
    } catch (error) {
      console.error("Error fetching student errors:", error);
      res.status(500).json({ message: "فشل في جلب الأخطاء" });
    }
  });

  // Add student error
  app.post('/api/student/errors', requireAuth, async (req, res) => {
    try {
      const studentId = req.session?.studentId;
      if (!studentId) {
        return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
      }

      const { surah, ayahNumber, errorType, errorDescription } = req.body;

      const error = await jsonStorage.addStudentError(studentId, {
        surah,
        ayahNumber,
        errorType,
        errorDescription,
        isResolved: false,
      });

      res.status(201).json(error);
    } catch (error) {
      console.error("Error adding student error:", error);
      res.status(500).json({ message: "فشل في إضافة الخطأ" });
    }
  });

  // Student logout
  app.post('/api/student-logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "فشل في تسجيل الخروج" });
      }
      res.json({ message: "تم تسجيل الخروج بنجاح" });
    });
  });

  // Get all students (for admin purposes) - REQUIRES ADMIN AUTH
  app.get('/api/admin/students', requireSupervisorOrAdmin, async (req, res) => {
    try {
      const students = await jsonStorage.getAllStudents();

      // Sanitize response - never expose password hashes
      const sanitizedStudents = students.map(student => {
        const { password, ...safeStudent } = student;
        return safeStudent;
      });

      res.json(sanitizedStudents);
    } catch (error) {
      console.error("Error fetching all students:", error);
      res.status(500).json({ message: "فشل في جلب قائمة الطلاب" });
    }
  });

  // Send renewal request to WhatsApp
  app.post('/api/request-renewal', async (req, res) => {
    try {
      const studentId = req.session?.studentId;
      if (!studentId) {
        return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
      }

      const student = await jsonStorage.getStudent(studentId);
      if (!student) {
        return res.status(404).json({ message: "الطالب غير موجود" });
      }

      const { sessionsRequested } = req.body;

      const renewalMessage = `
🔄 طلب تجديد اشتراك 🔄

الطالب: ${student.studentName}
الهاتف: ${student.phone}
عدد الحصص المطلوبة: ${sessionsRequested}
التاريخ: ${new Date().toLocaleString('ar-SA')}

يرجى التواصل مع الطالب لتأكيد التجديد.
      `.trim();

      await jsonStorage.sendToWhatsApp('+966549947386', renewalMessage);

      res.json({ message: "تم إرسال طلب التجديد بنجاح" });
    } catch (error) {
      console.error("Error requesting renewal:", error);
      res.status(500).json({ message: "فشل في إرسال طلب التجديد" });
    }
  });

  // Quran API endpoints
  app.get('/api/quran/surah/:surahNumber', async (req, res) => {
    try {
      const surahNumber = parseInt(req.params.surahNumber);

      if (isNaN(surahNumber) || surahNumber < 1 || surahNumber > 114) {
        return res.status(400).json({ message: "رقم السورة غير صحيح" });
      }

      // Load Quran data
      const fs = await import('fs').then(m => m.promises);
      const path = await import('path');

      const quranDataPath = path.join(process.cwd(), 'client/src/assets/quran-data.json');
      const quranDataRaw = await fs.readFile(quranDataPath, 'utf-8');
      const quranData = JSON.parse(quranDataRaw);

      const surah = quranData.data.surahs.find((s: any) => s.number === surahNumber);

      if (!surah) {
        return res.status(404).json({ message: "السورة غير موجودة" });
      }

      res.json(surah);
    } catch (error) {
      console.error("Error fetching surah:", error);
      res.status(500).json({ message: "فشل في جلب بيانات السورة" });
    }
  });

  app.get('/api/quran/page/:pageNumber', async (req, res) => {
    try {
      const pageNumber = parseInt(req.params.pageNumber);

      if (isNaN(pageNumber) || pageNumber < 1 || pageNumber > 604) {
        return res.status(400).json({ message: "رقم الصفحة غير صحيح" });
      }

      // Load Quran data
      const fs = await import('fs').then(m => m.promises);
      const path = await import('path');

      const quranDataPath = path.join(process.cwd(), 'client/src/assets/quran-data.json');
      const quranDataRaw = await fs.readFile(quranDataPath, 'utf-8');
      const quranData = JSON.parse(quranDataRaw);

      // Filter ayahs by page number
      const pageAyahs: any = {};

      quranData.data.surahs.forEach((surah: any) => {
        const surahAyahs = surah.ayahs.filter((ayah: any) => ayah.page === pageNumber);
        if (surahAyahs.length > 0) {
          pageAyahs[surah.number] = {
            name: surah.name,
            ayahs: surahAyahs
          };
        }
      });

      const pageData = {
        page: pageNumber,
        surahs: pageAyahs
      };

      res.json(pageData);
    } catch (error) {
      console.error("Error fetching page:", error);
      res.status(500).json({ message: "فشل في جلب بيانات الصفحة" });
    }
  });

  app.get('/api/quran/surahs', async (req, res) => {
    try {
      // Load Surah list
      const fs = await import('fs').then(m => m.promises);
      const path = await import('path');

      const surahListPath = path.join(process.cwd(), 'client/src/assets/surah-list.json');
      const surahListRaw = await fs.readFile(surahListPath, 'utf-8');
      const surahList = JSON.parse(surahListRaw);

      res.json(surahList.data);
    } catch (error) {
      console.error("Error fetching surah list:", error);
      res.status(500).json({ message: "فشل في جلب قائمة السور" });
    }
  });

  // ===== نظام إدارة الدورات =====

  // Get all available courses
  app.get('/api/courses', (req, res) => {
    try {
      const courses = courseManager.getAllCourses();
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "فشل في جلب الدورات" });
    }
  });

  // Get specific course details
  app.get('/api/courses/:courseId', (req, res) => {
    try {
      const course = courseManager.getCourse(req.params.courseId);
      if (!course) {
        return res.status(404).json({ message: "الدورة غير موجودة" });
      }
      res.json(course);
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({ message: "فشل في جلب بيانات الدورة" });
    }
  });

  // Enroll in a course
  app.post('/api/courses/:courseId/enroll', async (req, res) => {
    try {
      const studentId = req.session?.studentId;
      if (!studentId) {
        return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
      }

      const courseId = req.params.courseId;
      const enrollment = await courseManager.enrollStudent(studentId, courseId);

      if (!enrollment) {
        return res.status(404).json({ message: "الدورة غير موجودة" });
      }

      // إرسال إشعار WhatsApp للأستاذ
      const course = courseManager.getCourse(courseId);
      const student = await jsonStorage.getStudent(studentId);

      if (course && student) {
        const enrollmentMessage = `
📚 تسجيل جديد في الدورة 📚

الدورة: ${course.title}
الطالب: ${student.studentName}
الهاتف: ${student.phone}
تاريخ التسجيل: ${new Date().toLocaleString('ar-SA')}

مرحباً بالطالب الجديد! 🎉
        `.trim();

        console.log(`New enrollment notification: ${enrollmentMessage}`);
      }

      res.status(201).json({
        message: "تم التسجيل في الدورة بنجاح! سيتم التواصل معك قريباً",
        enrollment
      });
    } catch (error) {
      console.error("Error enrolling in course:", error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "فشل في التسجيل" 
      });
    }
  });

  // Get student's enrollments
  app.get('/api/my-courses', (req, res) => {
    try {
      const studentId = req.session?.studentId;
      if (!studentId) {
        return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
      }

      const enrollments = courseManager.getStudentEnrollments(studentId);
      const coursesWithDetails = enrollments.map(enrollment => {
        const course = courseManager.getCourse(enrollment.courseId);
        return {
          ...enrollment,
          course
        };
      });

      res.json(coursesWithDetails);
    } catch (error) {
      console.error("Error fetching student courses:", error);
      res.status(500).json({ message: "فشل في جلب دوراتك" });
    }
  });

  // Update course progress
  app.post('/api/courses/progress', (req, res) => {
    try {
      const studentId = req.session?.studentId;
      if (!studentId) {
        return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
      }

      const { enrollmentId, progress, completedLesson } = req.body;
      const success = courseManager.updateProgress(enrollmentId, progress, completedLesson);

      if (!success) {
        return res.status(404).json({ message: "الالتحاق غير موجود" });
      }

      res.json({ message: "تم تحديث التقدم بنجاح" });
    } catch (error) {
      console.error("Error updating progress:", error);
      res.status(500).json({ message: "فشل في تحديث التقدم" });
    }
  });

  // Add attendance record
  app.post('/api/courses/attendance', (req, res) => {
    try {
      const { enrollmentId, date, attended, notes } = req.body;
      const success = courseManager.addAttendance(enrollmentId, date, attended, notes);

      if (!success) {
        return res.status(404).json({ message: "الالتحاق غير موجود" });
      }

      res.json({ message: "تم تسجيل الحضور بنجاح" });
    } catch (error) {
      console.error("Error recording attendance:", error);
      res.status(500).json({ message: "فشل في تسجيل الحضور" });
    }
  });

  // Check if student can access class now (time-based access)
  app.get('/api/student/class-access', async (req, res) => {
    try {
      const studentId = req.session?.studentId;
      if (!studentId) {
        return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
      }

      const student = await jsonStorage.getStudent(studentId);
      if (!student) {
        return res.status(404).json({ message: "الطالب غير موجود" });
      }

      const now = new Date();
      const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const currentTime = now.getHours() * 60 + now.getMinutes(); // Minutes since midnight

      // Find if there's a schedule for today
      const todaySchedule = student.schedules.find(schedule => 
        schedule.dayOfWeek === currentDay && schedule.isActive
      );

      if (!todaySchedule) {
        return res.json({
          canAccess: false,
          reason: "لا توجد حصة مجدولة اليوم",
          nextClass: getNextClassTime(student.schedules)
        });
      }

      // Parse schedule times
      const [startHour, startMinute] = todaySchedule.startTime.split(':').map(Number);
      const [endHour, endMinute] = todaySchedule.endTime.split(':').map(Number);
      const classStart = startHour * 60 + startMinute;
      const classEnd = endHour * 60 + endMinute;

      // Check if current time is within class time (with 5 minute buffer before)
      const canAccess = currentTime >= (classStart - 5) && currentTime <= classEnd;

      res.json({
        canAccess,
        reason: canAccess ? 
          "يمكنك الدخول للحصة الآن" : 
          currentTime < classStart ? 
            `الحصة تبدأ في ${todaySchedule.startTime}` :
            "انتهت الحصة لهذا اليوم",
        classTime: todaySchedule,
        nextClass: canAccess ? null : getNextClassTime(student.schedules),
        zoomLink: canAccess ? todaySchedule.zoomLink : null
      });
    } catch (error) {
      console.error("Error checking class access:", error);
      res.status(500).json({ message: "فشل في التحقق من إمكانية الوصول للحصة" });
    }
  });

  // Helper function to get next class time
  function getNextClassTime(schedules: any[]) {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    // Sort schedules by day and time
    const sortedSchedules = schedules
      .filter(s => s.isActive)
      .sort((a, b) => {
        if (a.dayOfWeek !== b.dayOfWeek) {
          return a.dayOfWeek - b.dayOfWeek;
        }
        const aTime = a.startTime.split(':').map(Number);
        const bTime = b.startTime.split(':').map(Number);
        return (aTime[0] * 60 + aTime[1]) - (bTime[0] * 60 + bTime[1]);
      });

    // Find next class
    for (const schedule of sortedSchedules) {
      const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
      const classStart = startHour * 60 + startMinute;

      if (schedule.dayOfWeek > currentDay || 
          (schedule.dayOfWeek === currentDay && classStart > currentTime)) {
        return {
          dayOfWeek: schedule.dayOfWeek,
          startTime: schedule.startTime,
          dayName: getDayName(schedule.dayOfWeek)
        };
      }
    }

    // If no class found this week, return first class of next week
    const firstClass = sortedSchedules[0];
    return firstClass ? {
      dayOfWeek: firstClass.dayOfWeek,
      startTime: firstClass.startTime,
      dayName: getDayName(firstClass.dayOfWeek)
    } : null;
  }

  function getDayName(dayOfWeek: number): string {
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return days[dayOfWeek];
  }
}