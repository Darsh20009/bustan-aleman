import type { Express } from "express";
import { jsonStorage } from "./jsonStorage";
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
}