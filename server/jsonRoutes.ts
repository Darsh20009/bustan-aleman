import type { Express } from "express";
import { jsonStorage } from "./jsonStorage";
import { courseManager } from "./courseSystem";
import { z } from "zod";

// Extend session data
declare module 'express-session' {
  interface SessionData {
    studentId: string;
  }
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
  // Initialize default students
  app.post('/api/init-data', async (req, res) => {
    try {
      await jsonStorage.initializeDefaultStudents();
      res.json({ message: "Default students initialized successfully" });
    } catch (error) {
      console.error("Error initializing data:", error);
      res.status(500).json({ message: "Failed to initialize data" });
    }
  });

  // Student registration with WhatsApp notification
  app.post('/api/register', async (req, res) => {
    try {
      const registrationData = registrationSchema.parse(req.body);
      
      // Create new student
      const student = await jsonStorage.createStudent({
        ...registrationData,
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

      // Send registration details to WhatsApp
      const whatsappMessage = `
🌟 تسجيل طالب جديد في بستان الإيمان 🌟

الاسم: ${student.studentName}
الإيميل: ${student.email}
الهاتف: ${student.phone}
تاريخ الميلاد: ${student.dateOfBirth}
العمر: ${student.age} سنة
كلمة السر: ${student.password}

تم التسجيل بنجاح في ${new Date().toLocaleString('ar-SA')}
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

  // Student login
  app.post('/api/student-login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const student = await jsonStorage.authenticateStudent(email, password);
      
      if (!student) {
        return res.status(401).json({ message: "بيانات الدخول غير صحيحة" });
      }

      // Store student session (create session object if it doesn't exist)
      if (!req.session) {
        req.session = {} as any;
      }
      req.session.studentId = student.id;
      
      res.json({
        message: "تم تسجيل الدخول بنجاح",
        student: {
          id: student.id,
          studentName: student.studentName,
          email: student.email,
          memorizedSurahs: student.memorizedSurahs,
          currentLevel: student.currentLevel,
          schedules: student.schedules,
        }
      });
    } catch (error) {
      console.error("Error authenticating student:", error);
      res.status(500).json({ message: "فشل في تسجيل الدخول" });
    }
  });

  // Get student profile
  app.get('/api/student/profile', async (req, res) => {
    try {
      const studentId = req.session?.studentId;
      if (!studentId) {
        return res.status(401).json({ message: "يجب تسجيل الدخول أولاً" });
      }

      const student = await jsonStorage.getStudent(studentId);
      if (!student) {
        return res.status(404).json({ message: "الطالب غير موجود" });
      }

      res.json(student);
    } catch (error) {
      console.error("Error fetching student profile:", error);
      res.status(500).json({ message: "فشل في جلب بيانات الطالب" });
    }
  });

  // Update student progress
  app.post('/api/student/progress', async (req, res) => {
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
  app.get('/api/student/errors', async (req, res) => {
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
  app.post('/api/student/errors', async (req, res) => {
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

  // Get all students (for admin purposes)
  app.get('/api/admin/students', async (req, res) => {
    try {
      const students = await jsonStorage.getAllStudents();
      res.json(students);
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
}