import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupPhoneAuth, isPhoneAuthenticated, isTeacher, initializePreregisteredUsers } from "./phoneAuth";
import { quranService } from "./quranService";
import bcrypt from "bcrypt";
import { telegramBot } from "./telegramBot";
import {
  insertCourseSchema,
  insertInstructorSchema,
  insertEnrollmentSchema,
  insertContactMessageSchema,
  insertStudentSchema,
  insertStudentSessionSchema,
  insertStudentErrorSchema,
  insertStudentPaymentSchema,
  insertClassScheduleSchema,
  insertQuranWordHighlightSchema,
  insertQuranMemorizationSchema,
  insertQuranReadingStatsSchema,
  insertQuranAyahMarkerSchema,
  insertQuranRecitationAttemptSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  console.log("🔄 registerRoutes: Setting up phone auth...");
  // Setup phone authentication
  setupPhoneAuth(app);

  console.log("🔄 registerRoutes: Initializing pre-registered users...");
  // Initialize pre-registered users
  await initializePreregisteredUsers();
  console.log("✅ registerRoutes: Pre-registered users initialized");

  // User profile routes
  app.patch('/api/user/profile', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const userData = req.body;
      
      const updatedUser = await storage.updateUserProfile(userId, userData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Announcements routes
  app.get('/api/announcements', async (req, res) => {
    try {
      // Mock data for now - would come from database in production
      const announcements = [
        {
          id: "1",
          title: "مرحباً بكم في بستان الإيمان",
          content: "نرحب بجميع الطلاب في منصتنا التعليمية. نتمنى لكم رحلة مباركة في حفظ كتاب الله الكريم.",
          type: "announcement",
          authorId: "supervisor1",
          authorName: "الشيخ أحمد عبدالعزيز",
          createdAt: new Date().toISOString(),
          isRead: false
        },
        {
          id: "2",
          title: "بدء دورة تجويد جديدة",
          content: "سيتم بدء دورة تجويد جديدة للمستوى المتقدم يوم الأحد القادم. التسجيل متاح الآن.",
          type: "news",
          authorId: "supervisor1",
          authorName: "الشيخ أحمد عبدالعزيز",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          isRead: false
        },
        {
          id: "3",
          title: "موعد الاختبارات الشهرية",
          content: "تنبيه هام: ستبدأ الاختبارات الشهرية يوم الخميس القادم. يرجى المراجعة والاستعداد الجيد.",
          type: "important",
          authorId: "supervisor1",
          authorName: "الشيخ أحمد عبدالعزيز",
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          isRead: true
        }
      ];

      res.json(announcements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      res.status(500).json({ message: "خطأ في جلب الإعلانات" });
    }
  });

  app.post('/api/announcements/:id/read', isPhoneAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      res.json({ message: "تم تحديث حالة القراءة" });
    } catch (error) {
      console.error("Error marking announcement as read:", error);
      res.status(500).json({ message: "خطأ في تحديث الإعلان" });
    }
  });

  // Course routes
  app.get('/api/courses', async (req, res) => {
    try {
      const courses = await storage.getActiveCourses();
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.get('/api/courses/:id', async (req, res) => {
    try {
      const course = await storage.getCourse(req.params.id);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  app.post('/api/courses', isPhoneAuthenticated, async (req, res) => {
    try {
      const courseData = insertCourseSchema.parse(req.body);
      const course = await storage.createCourse(courseData);
      res.status(201).json(course);
    } catch (error) {
      console.error("Error creating course:", error);
      res.status(500).json({ message: "Failed to create course" });
    }
  });

  // Instructor routes
  app.get('/api/instructors', async (req, res) => {
    try {
      const instructors = await storage.getActiveInstructors();
      res.json(instructors);
    } catch (error) {
      console.error("Error fetching instructors:", error);
      res.status(500).json({ message: "Failed to fetch instructors" });
    }
  });

  app.get('/api/instructors/:id', async (req, res) => {
    try {
      const instructor = await storage.getInstructor(req.params.id);
      if (!instructor) {
        return res.status(404).json({ message: "Instructor not found" });
      }
      res.json(instructor);
    } catch (error) {
      console.error("Error fetching instructor:", error);
      res.status(500).json({ message: "Failed to fetch instructor" });
    }
  });

  // Enrollment routes
  app.post('/api/enrollments', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const enrollmentData = insertEnrollmentSchema.parse({
        ...req.body,
        userId,
      });
      
      const enrollment = await storage.enrollUserInCourse(enrollmentData);
      res.status(201).json(enrollment);
    } catch (error) {
      console.error("Error creating enrollment:", error);
      res.status(500).json({ message: "Failed to enroll in course" });
    }
  });

  app.get('/api/user/enrollments', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const enrollments = await storage.getUserEnrollments(userId);
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching user enrollments:", error);
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });

  // Contact routes
  app.post('/api/contact', async (req, res) => {
    try {
      const messageData = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating contact message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.get('/api/contact', isPhoneAuthenticated, async (req, res) => {
    try {
      const messages = await storage.getContactMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Student routes
  app.post('/api/students', async (req, res) => {
    try {
      const studentData = insertStudentSchema.parse(req.body);
      const student = await storage.createStudent(studentData);
      res.status(201).json(student);
    } catch (error) {
      console.error("Error creating student:", error);
      res.status(500).json({ message: "Failed to create student" });
    }
  });

  app.get('/api/students', async (req, res) => {
    try {
      const students = await storage.getAllStudents();
      res.json(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.get('/api/students/:id', async (req, res) => {
    try {
      const student = await storage.getStudent(req.params.id);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      res.json(student);
    } catch (error) {
      console.error("Error fetching student:", error);
      res.status(500).json({ message: "Failed to fetch student" });
    }
  });

  app.post('/api/students/login', async (req, res) => {
    try {
      const { studentName, password } = req.body;
      const student = await storage.authenticateStudent(studentName, password);
      if (!student) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      res.json(student);
    } catch (error) {
      console.error("Error authenticating student:", error);
      res.status(500).json({ message: "Failed to authenticate" });
    }
  });

  // Student sessions routes
  app.post('/api/students/:id/sessions', async (req, res) => {
    try {
      const sessionData = insertStudentSessionSchema.parse({
        ...req.body,
        studentId: req.params.id,
      });
      const session = await storage.createStudentSession(sessionData);
      res.status(201).json(session);
    } catch (error) {
      console.error("Error creating session:", error);
      res.status(500).json({ message: "Failed to create session" });
    }
  });

  app.get('/api/students/:id/sessions', async (req, res) => {
    try {
      const sessions = await storage.getStudentSessions(req.params.id);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });

  // Student errors routes
  app.post('/api/students/:id/errors', async (req, res) => {
    try {
      const errorData = insertStudentErrorSchema.parse({
        ...req.body,
        studentId: req.params.id,
      });
      const error = await storage.createStudentError(errorData);
      res.status(201).json(error);
    } catch (error) {
      console.error("Error creating student error:", error);
      res.status(500).json({ message: "Failed to create error record" });
    }
  });

  app.get('/api/students/:id/errors', async (req, res) => {
    try {
      const errors = await storage.getStudentErrors(req.params.id);
      res.json(errors);
    } catch (error) {
      console.error("Error fetching student errors:", error);
      res.status(500).json({ message: "Failed to fetch errors" });
    }
  });

  // Student payments routes
  app.post('/api/students/:id/payments', async (req, res) => {
    try {
      const paymentData = insertStudentPaymentSchema.parse({
        ...req.body,
        studentId: req.params.id,
      });
      const payment = await storage.createStudentPayment(paymentData);
      res.status(201).json(payment);
    } catch (error) {
      console.error("Error creating payment:", error);
      res.status(500).json({ message: "Failed to create payment" });
    }
  });

  app.get('/api/students/:id/payments', async (req, res) => {
    try {
      const payments = await storage.getStudentPayments(req.params.id);
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  // Class schedules routes
  app.post('/api/students/:id/schedules', async (req, res) => {
    try {
      const scheduleData = insertClassScheduleSchema.parse({
        ...req.body,
        studentId: req.params.id,
      });
      const schedule = await storage.createClassSchedule(scheduleData);
      res.status(201).json(schedule);
    } catch (error) {
      console.error("Error creating schedule:", error);
      res.status(500).json({ message: "Failed to create schedule" });
    }
  });

  app.get('/api/students/:id/schedules', async (req, res) => {
    try {
      const schedules = await storage.getStudentSchedules(req.params.id);
      res.json(schedules);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      res.status(500).json({ message: "Failed to fetch schedules" });
    }
  });

  // Quran API routes
  app.get('/api/quran/surahs', async (req, res) => {
    try {
      const surahs = await quranService.getSurahList();
      res.json(surahs);
    } catch (error) {
      console.error("Error fetching surahs:", error);
      res.status(500).json({ message: "Failed to fetch surahs" });
    }
  });

  app.get('/api/quran/surah/:number', async (req, res) => {
    try {
      const surahNumber = parseInt(req.params.number);
      if (isNaN(surahNumber) || surahNumber < 1 || surahNumber > 114) {
        return res.status(400).json({ message: "Invalid surah number" });
      }
      
      const surah = await quranService.getSurah(surahNumber);
      if (!surah) {
        return res.status(404).json({ message: "Surah not found" });
      }
      
      res.json(surah);
    } catch (error) {
      console.error("Error fetching surah:", error);
      res.status(500).json({ message: "Failed to fetch surah" });
    }
  });

  app.get('/api/quran/page/:number', async (req, res) => {
    try {
      const pageNumber = parseInt(req.params.number);
      if (isNaN(pageNumber) || pageNumber < 1 || pageNumber > 604) {
        return res.status(400).json({ message: "Invalid page number" });
      }
      
      const page = await quranService.getPage(pageNumber);
      if (!page) {
        return res.status(404).json({ message: "Page not found" });
      }
      
      res.json(page);
    } catch (error) {
      console.error("Error fetching page:", error);
      res.status(500).json({ message: "Failed to fetch page" });
    }
  });

  app.get('/api/quran/reciters', async (req, res) => {
    try {
      const reciters = await quranService.getReciters();
      res.json(reciters);
    } catch (error) {
      console.error("Error fetching reciters:", error);
      res.status(500).json({ message: "Failed to fetch reciters" });
    }
  });

  app.get('/api/quran/search', async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query || query.trim().length < 2) {
        return res.status(400).json({ message: "Search query must be at least 2 characters" });
      }
      
      const results = await quranService.searchQuran(query);
      res.json(results);
    } catch (error) {
      console.error("Error searching Quran:", error);
      res.status(500).json({ message: "Failed to search Quran" });
    }
  });

  app.get('/api/quran/tafsir/:surah/:ayah', async (req, res) => {
    try {
      const surahNumber = parseInt(req.params.surah);
      const ayahNumber = parseInt(req.params.ayah);
      
      if (isNaN(surahNumber) || isNaN(ayahNumber)) {
        return res.status(400).json({ message: "Invalid surah or ayah number" });
      }
      
      const tafsir = await quranService.getAyahTafsir(surahNumber, ayahNumber);
      if (!tafsir) {
        return res.status(404).json({ message: "Tafsir not found" });
      }
      
      res.json({ tafsir });
    } catch (error) {
      console.error("Error fetching tafsir:", error);
      res.status(500).json({ message: "Failed to fetch tafsir" });
    }
  });

  // Telegram login verification route
  app.post('/api/telegram/login', async (req, res) => {
    try {
      const { code } = req.body;
      
      if (!code) {
        return res.status(400).json({ message: "كود تسجيل الدخول مطلوب" });
      }
      
      if (!telegramBot) {
        return res.status(503).json({ message: "خدمة التليجرام غير متاحة حالياً" });
      }
      
      const user = telegramBot.verifyLoginCode(code.toUpperCase());
      
      if (!user) {
        return res.status(401).json({ message: "كود تسجيل الدخول غير صحيح أو منتهي الصلاحية" });
      }
      
      res.json({ 
        message: "تم تسجيل الدخول بنجاح",
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          phoneNumber: user.phoneNumber,
          age: user.age
        }
      });
    } catch (error) {
      console.error("خطأ في تسجيل الدخول عبر التليجرام:", error);
      res.status(500).json({ message: "حدث خطأ في النظام" });
    }
  });

  // Check telegram bot status
  app.get('/api/telegram/status', async (req, res) => {
    try {
      const status = telegramBot ? 'active' : 'inactive';
      res.json({ 
        status,
        message: status === 'active' ? 'بوت التليجرام يعمل بنجاح' : 'بوت التليجرام غير متاح'
      });
    } catch (error) {
      res.status(500).json({ message: "خطأ في التحقق من حالة البوت" });
    }
  });

  // Seed data route (for development)
  app.post('/api/seed', async (req, res) => {
    try {
      // Create sample instructor
      const instructor = await storage.createInstructor({
        nameAr: "الشيخ أحمد عبدالعزيز",
        nameEn: "Sheikh Ahmad Abdul Aziz",
        titleAr: "مسؤول المنصة",
        titleEn: "Platform Manager",
        bioAr: "يكرّس الشيخ أحمد جهوده لابتكار برامج تعليمية مخصّصة لكل طالب بما يتناسب مع تفضيلاته الفريدة.",
        bioEn: "Sheikh Ahmad dedicates his efforts to creating customized educational programs for each student according to their unique preferences.",
        profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300",
        qualifications: "حافظ للقرآن الكريم، إجازة في القراءات السبع",
        experience: "أكثر من 15 سنة في تحفيظ القرآن الكريم",
      });

      // Create sample courses
      const courses = [
        {
          titleAr: "دورة تحفيظ القرآن الكريم",
          titleEn: "Quran Memorization Course",
          descriptionAr: "دورة شاملة لتحفيظ القرآن الكريم مع التجويد",
          descriptionEn: "Comprehensive Quran memorization course with Tajweed",
          startDate: new Date("2025-02-15"),
          instructorId: instructor.id,
          level: "beginner",
          category: "quran",
          maxStudents: 50,
        },
        {
          titleAr: "دورة المسبقة الرمضانية المستوى الأول",
          titleEn: "Ramadan Preparatory Course Level 1",
          descriptionAr: "إعداد روحي وتعليمي لشهر رمضان المبارك",
          descriptionEn: "Spiritual and educational preparation for the blessed month of Ramadan",
          startDate: new Date("2025-03-01"),
          instructorId: instructor.id,
          level: "beginner",
          category: "ramadan",
          maxStudents: 30,
        },
        {
          titleAr: "دورة المسبقة الرمضانية المستوى الثاني",
          titleEn: "Ramadan Preparatory Course Level 2",
          descriptionAr: "المستوى المتوسط للإعداد لشهر رمضان",
          descriptionEn: "Intermediate level preparation for Ramadan",
          startDate: new Date("2025-03-01"),
          instructorId: instructor.id,
          level: "intermediate",
          category: "ramadan",
          maxStudents: 25,
        },
        {
          titleAr: "دورة المسبقة الرمضانية المستوى الثالث",
          titleEn: "Ramadan Preparatory Course Level 3",
          descriptionAr: "المستوى المتقدم للإعداد لشهر رمضان",
          descriptionEn: "Advanced level preparation for Ramadan",
          startDate: new Date("2025-03-01"),
          instructorId: instructor.id,
          level: "advanced",
          category: "ramadan",
          maxStudents: 20,
        },
      ];

      for (const course of courses) {
        await storage.createCourse(course);
      }

      // Basic seed data created successfully

      res.json({ message: "Sample data created successfully" });
    } catch (error) {
      console.error("Error seeding data:", error);
      res.status(500).json({ message: "Failed to seed data" });
    }
  });

  // Special endpoint to create specific students
  app.post('/api/create-students', async (req, res) => {
    try {
      // Create Yousef Darwish
      const yousefStudent = await storage.createStudent({
        studentName: "يوسف درويش",
        passwordHash: await bcrypt.hash("182009", 10),
        dateOfBirth: "2009-08-18",
        grade: "الثاني الثانوي",
        monthlySessionsCount: 16,
        monthlyPrice: "60.00",
        isPaid: true,
        isActive: true,
        memorizedSurahs: JSON.stringify(["البقرة", "آل عمران"]),
        currentLevel: "advanced",
        notes: "طالب متميز، حافظ سورة البقرة وآل عمران. مستوى الحفظ ممتاز لكن يريد التميز أكثر",
        zoomLink: "https://us05web.zoom.us/j/2150630036?pwd=lQD4VAFswkSMSIb5PqbkgxpR1waZVg.1&omn=81643358315#success",
        whatsappContact: "+966532441566",
      });

      // Add Yousef's schedule (Saturday, Tuesday, Wednesday, Thursday at 4 PM)
      const yousefSchedules = [
        { dayOfWeek: 6, startTime: "16:00", endTime: "17:00", studentId: yousefStudent.id }, // Saturday
        { dayOfWeek: 2, startTime: "16:00", endTime: "17:00", studentId: yousefStudent.id }, // Tuesday  
        { dayOfWeek: 3, startTime: "16:00", endTime: "17:00", studentId: yousefStudent.id }, // Wednesday
        { dayOfWeek: 4, startTime: "16:00", endTime: "17:00", studentId: yousefStudent.id }, // Thursday
      ];

      for (const schedule of yousefSchedules) {
        await storage.createClassSchedule({
          ...schedule,
          zoomLink: yousefStudent.zoomLink,
        });
      }

      // Add Yousef's payment record
      await storage.createStudentPayment({
        studentId: yousefStudent.id,
        amount: "60.00",
        currency: "SAR",
        paymentMethod: "whatsapp",
        subscriptionPeriod: "monthly",
        sessionsIncluded: 16,
        sessionsRemaining: 13, // 16 - 3 (current session)
        expiryDate: "2025-09-23",
        status: "active",
        notes: "مدفوع عن طريق الواتساب",
      });

      // Add Yousef's current session
      await storage.createStudentSession({
        studentId: yousefStudent.id,
        sessionNumber: 3,
        sessionDate: "2025-08-23",
        sessionTime: "4:00 PM",
        evaluationGrade: "جيد",
        nextSessionDate: "2025-08-24",
        newMaterial: "يوم الأحد سورة آل عمران إلى الآية (180) فلما أحس",
        reviewMaterial: "يوم الأربعاء أربع أرباع من قوله تعالى (ليس عليك هداهم...) البقرة",
        notes: "الطالب يحتاج للتميز أكثر",
        attended: true,
      });

      // Add Yousef's errors
      const yousefErrors = [
        { surah: "البقرة", ayahNumber: 285 },
        { surah: "البقرة", ayahNumber: 217 },
        { surah: "البقرة", ayahNumber: 15 },
        { surah: "آل عمران", ayahNumber: 1 },
        { surah: "آل عمران", ayahNumber: 5 },
        { surah: "آل عمران", ayahNumber: 6 },
      ];

      for (const error of yousefErrors) {
        await storage.createStudentError({
          studentId: yousefStudent.id,
          surah: error.surah,
          ayahNumber: error.ayahNumber,
          errorType: "recitation",
          errorDescription: `خطأ في التلاوة - ${error.surah} آية ${error.ayahNumber}`,
          isResolved: false,
        });
      }

      // Create Mohamed Ahmed
      const mohamedStudent = await storage.createStudent({
        studentName: "محمد أحمد",
        passwordHash: await bcrypt.hash("123789", 10),
        dateOfBirth: "2010-01-01", // Default date
        grade: "غير محدد",
        monthlySessionsCount: 8,
        monthlyPrice: "30.00",
        isPaid: true,
        isActive: true,
        memorizedSurahs: JSON.stringify([]),
        currentLevel: "beginner",
        notes: "طالب جديد، لم يكمل أي حصة بعد. سيبدأ من سورة الناس",
        zoomLink: "https://us05web.zoom.us/j/2150630036?pwd=lQD4VAFswkSMSIb5PqbkgxpR1waZVg.1&omn=81643358315#success",
        whatsappContact: "+966532441566",
      });

      // Add Mohamed's schedule (Sunday and Saturday at 6 PM)
      const mohamedSchedules = [
        { dayOfWeek: 0, startTime: "18:00", endTime: "19:00", studentId: mohamedStudent.id }, // Sunday
        { dayOfWeek: 6, startTime: "18:00", endTime: "19:00", studentId: mohamedStudent.id }, // Saturday
      ];

      for (const schedule of mohamedSchedules) {
        await storage.createClassSchedule({
          ...schedule,
          zoomLink: mohamedStudent.zoomLink,
        });
      }

      // Add Mohamed's payment record
      await storage.createStudentPayment({
        studentId: mohamedStudent.id,
        amount: "30.00",
        currency: "SAR",
        paymentMethod: "whatsapp",
        subscriptionPeriod: "monthly",
        sessionsIncluded: 8,
        sessionsRemaining: 8, // No sessions completed yet
        expiryDate: "2025-09-23",
        status: "active",
        notes: "مدفوع عن طريق الواتساب",
      });

      res.json({ 
        message: "Students created successfully",
        students: [yousefStudent, mohamedStudent]
      });
    } catch (error) {
      console.error("Error creating students:", error);
      res.status(500).json({ message: "Failed to create students" });
    }
  });

  // Quran word highlights routes
  app.get('/api/quran/highlights/:studentId', async (req, res) => {
    try {
      const { studentId } = req.params;
      const highlights = await storage.getAllWordHighlights(studentId);
      res.json(highlights);
    } catch (error) {
      console.error("Error fetching word highlights:", error);
      res.status(500).json({ message: "Failed to fetch word highlights" });
    }
  });

  app.post('/api/quran/highlights', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const highlightData = insertQuranWordHighlightSchema.parse({
        ...req.body,
        studentId: userId,
      });
      const highlight = await storage.createWordHighlight(highlightData);
      res.status(201).json(highlight);
    } catch (error) {
      console.error("Error creating word highlight:", error);
      res.status(500).json({ message: "Failed to create word highlight" });
    }
  });

  app.delete('/api/quran/highlights/:surahNumber/:ayahNumber/:wordIndex', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const { surahNumber, ayahNumber, wordIndex } = req.params;
      await storage.deleteWordHighlightByLocation(
        userId,
        parseInt(surahNumber),
        parseInt(ayahNumber),
        parseInt(wordIndex)
      );
      res.json({ message: "Word highlight deleted successfully" });
    } catch (error) {
      console.error("Error deleting word highlight:", error);
      res.status(500).json({ message: "Failed to delete word highlight" });
    }
  });

  app.post('/api/quran/word-highlights', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const highlightData = insertQuranWordHighlightSchema.parse({
        ...req.body,
        studentId: userId,
      });
      const highlight = await storage.createWordHighlight(highlightData);
      res.status(201).json(highlight);
    } catch (error) {
      console.error("Error creating word highlight:", error);
      res.status(500).json({ message: "Failed to create word highlight" });
    }
  });

  app.get('/api/quran/word-highlights/:surahNumber/:ayahNumber', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const { surahNumber, ayahNumber } = req.params;
      const highlights = await storage.getWordHighlights(userId, parseInt(surahNumber), parseInt(ayahNumber));
      res.json(highlights);
    } catch (error) {
      console.error("Error fetching word highlights:", error);
      res.status(500).json({ message: "Failed to fetch word highlights" });
    }
  });

  app.patch('/api/quran/word-highlights/:id', isPhoneAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const highlight = await storage.updateWordHighlight(id, updates);
      res.json(highlight);
    } catch (error) {
      console.error("Error updating word highlight:", error);
      res.status(500).json({ message: "Failed to update word highlight" });
    }
  });

  app.delete('/api/quran/word-highlights/:id', isPhoneAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteWordHighlight(id);
      res.json({ message: "Word highlight deleted successfully" });
    } catch (error) {
      console.error("Error deleting word highlight:", error);
      res.status(500).json({ message: "Failed to delete word highlight" });
    }
  });

  // Quran memorization routes
  app.post('/api/quran/memorization', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const memorizationData = insertQuranMemorizationSchema.parse({
        ...req.body,
        studentId: userId,
      });
      const memorization = await storage.createMemorization(memorizationData);
      res.status(201).json(memorization);
    } catch (error) {
      console.error("Error creating memorization:", error);
      res.status(500).json({ message: "Failed to create memorization" });
    }
  });

  app.get('/api/quran/memorization', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const memorizations = await storage.getStudentMemorization(userId);
      res.json(memorizations);
    } catch (error) {
      console.error("Error fetching memorization:", error);
      res.status(500).json({ message: "Failed to fetch memorization" });
    }
  });

  app.patch('/api/quran/memorization/:id', isPhoneAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const memorization = await storage.updateMemorization(id, updates);
      res.json(memorization);
    } catch (error) {
      console.error("Error updating memorization:", error);
      res.status(500).json({ message: "Failed to update memorization" });
    }
  });

  app.delete('/api/quran/memorization/:id', isPhoneAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteMemorization(id);
      res.json({ message: "Memorization deleted successfully" });
    } catch (error) {
      console.error("Error deleting memorization:", error);
      res.status(500).json({ message: "Failed to delete memorization" });
    }
  });

  // Quran reading statistics routes
  app.post('/api/quran/stats', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const statsData = insertQuranReadingStatsSchema.parse({
        ...req.body,
        studentId: userId,
      });
      const stats = await storage.createOrUpdateReadingStats(statsData);
      res.status(201).json(stats);
    } catch (error) {
      console.error("Error creating reading stats:", error);
      res.status(500).json({ message: "Failed to create reading stats" });
    }
  });

  app.get('/api/quran/stats', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const { startDate, endDate } = req.query;
      const stats = await storage.getStudentReadingStats(
        userId,
        startDate as string,
        endDate as string
      );
      res.json(stats);
    } catch (error) {
      console.error("Error fetching reading stats:", error);
      res.status(500).json({ message: "Failed to fetch reading stats" });
    }
  });

  app.get('/api/quran/stats/today', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const stats = await storage.getTodayReadingStats(userId);
      res.json(stats || null);
    } catch (error) {
      console.error("Error fetching today's reading stats:", error);
      res.status(500).json({ message: "Failed to fetch today's reading stats" });
    }
  });

  // Quran page route - fetch verses for a specific Mushaf page
  app.get('/api/quran/page/:pageNumber', async (req, res) => {
    try {
      const pageNumber = parseInt(req.params.pageNumber);
      if (pageNumber < 1 || pageNumber > 604) {
        return res.status(400).json({ message: "Invalid page number" });
      }
      
      // Fetch page data from AlQuran Cloud API or use cached data
      const pageData = await quranService.getPage(pageNumber);
      
      if (!pageData) {
        return res.status(404).json({ message: "Page not found" });
      }
      
      // Transform the data to match the expected format for the Mushaf reader
      const verses = [];
      for (const surahNumber in pageData.surahs) {
        const surahData = pageData.surahs[surahNumber];
        surahData.ayahs.forEach((ayah: any) => {
          verses.push({
            text: ayah.text,
            number: ayah.number,
            numberInSurah: ayah.numberInSurah,
            surahNumber: parseInt(surahNumber),
            surahName: surahData.name,
          });
        });
      }
      
      res.json({ verses });
    } catch (error) {
      console.error("Error fetching Quran page:", error);
      res.status(500).json({ message: "Failed to fetch Quran page" });
    }
  });

  // Get page number for a specific surah:ayah
  app.get('/api/quran/surah/:surahNumber/ayah/:ayahNumber/page', async (req, res) => {
    try {
      const surahNumber = parseInt(req.params.surahNumber);
      const ayahNumber = parseInt(req.params.ayahNumber);
      
      // Use quranService to find the page
      const pageNumber = await quranService.getPageForAyah(surahNumber, ayahNumber);
      
      if (pageNumber) {
        res.json({ page: pageNumber });
      } else {
        res.status(404).json({ message: "Ayah not found" });
      }
    } catch (error) {
      console.error("Error finding page for ayah:", error);
      res.status(500).json({ message: "Failed to find page" });
    }
  });

  // Quran stats summary route - returns aggregate statistics
  app.get('/api/quran/stats/:studentId', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const { studentId } = req.params;
      const userId = (req.session as any).userId;
      
      // Ensure user can only access their own stats
      if (userId !== studentId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      // Get all reading stats
      const readingStats = await storage.getStudentReadingStats(studentId);
      const memorization = await storage.getStudentMemorization(studentId);
      const markers = await storage.getStudentAyahMarkers(studentId);
      
      // Calculate aggregate stats
      const totalPages = readingStats.reduce((sum, stat) => sum + (stat.pagesRead || 0), 0);
      const totalMinutes = readingStats.reduce((sum, stat) => sum + (stat.minutesSpent || 0), 0);
      const memorizedAyahs = memorization.reduce((sum, m) => {
        return sum + (m.toAyah - m.fromAyah + 1);
      }, 0);
      
      const activeMarkers = markers.filter(m => m.isActive).length;
      
      // Calculate mastery level (simple formula based on various factors)
      const masteryLevel = Math.min(100, Math.round(
        (memorizedAyahs / 62.36) + // Out of 6236 total ayahs, weighted as percentage
        (totalPages / 6.04) +       // Out of 604 total pages, weighted as percentage
        (totalMinutes / 100)        // Time spent contributes to mastery
      ));
      
      res.json({
        pagesRead: totalPages,
        memorizedAyahs,
        minutesSpent: totalMinutes,
        masteryLevel,
        activeBookmarks: activeMarkers,
      });
    } catch (error) {
      console.error("Error fetching Quran stats:", error);
      res.status(500).json({ message: "Failed to fetch Quran stats" });
    }
  });

  // Quran markers route - get all markers for a student
  app.get('/api/quran/markers/:studentId', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const { studentId } = req.params;
      const userId = (req.session as any).userId;
      
      // Ensure user can only access their own markers
      if (userId !== studentId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      const markers = await storage.getStudentAyahMarkers(studentId);
      res.json(markers);
    } catch (error) {
      console.error("Error fetching Quran markers:", error);
      res.status(500).json({ message: "Failed to fetch Quran markers" });
    }
  });

  // Create ayah marker
  app.post('/api/quran/markers', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const markerData = insertQuranAyahMarkerSchema.parse({ 
        ...req.body, 
        studentId: userId 
      });
      const marker = await storage.createAyahMarker(markerData);
      res.json(marker);
    } catch (error) {
      console.error("Error creating ayah marker:", error);
      res.status(400).json({ message: "Invalid marker data" });
    }
  });

  // Update ayah marker
  app.patch('/api/quran/markers/:id', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = (req.session as any).userId;
      
      // Verify ownership before updating
      const markers = await storage.getStudentAyahMarkers(userId);
      const marker = markers.find(m => m.id === id);
      if (!marker) {
        return res.status(404).json({ message: "Marker not found or unauthorized" });
      }
      
      const updates = insertQuranAyahMarkerSchema.partial().parse(req.body);
      const updatedMarker = await storage.updateAyahMarker(id, updates);
      res.json(updatedMarker);
    } catch (error) {
      console.error("Error updating ayah marker:", error);
      res.status(400).json({ message: "Invalid marker data" });
    }
  });

  // Delete ayah marker
  app.delete('/api/quran/markers/:id', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = (req.session as any).userId;
      
      // Verify ownership before deleting
      const markers = await storage.getStudentAyahMarkers(userId);
      const marker = markers.find(m => m.id === id);
      if (!marker) {
        return res.status(404).json({ message: "Marker not found or unauthorized" });
      }
      
      await storage.deleteAyahMarker(id);
      res.json({ message: "Marker deleted successfully" });
    } catch (error) {
      console.error("Error deleting ayah marker:", error);
      res.status(500).json({ message: "Failed to delete marker" });
    }
  });

  // Quran Notes Routes
  app.get('/api/quran/notes', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const { surahNumber, ayahNumber } = req.query;
      
      const notes = await storage.getStudentQuranNotes(
        userId,
        surahNumber ? parseInt(surahNumber) : undefined,
        ayahNumber ? parseInt(ayahNumber) : undefined
      );
      res.json(notes);
    } catch (error) {
      console.error("Error fetching Quran notes:", error);
      res.status(500).json({ message: "Failed to fetch notes" });
    }
  });

  app.post('/api/quran/notes', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const noteData = insertQuranNoteSchema.parse({
        ...req.body,
        studentId: userId
      });
      const note = await storage.createQuranNote(noteData);
      res.json(note);
    } catch (error) {
      console.error("Error creating Quran note:", error);
      res.status(400).json({ message: "Invalid note data" });
    }
  });

  app.patch('/api/quran/notes/:id', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = (req.session as any).userId;
      
      // Verify ownership
      const notes = await storage.getStudentQuranNotes(userId);
      const note = notes.find(n => n.id === id);
      if (!note) {
        return res.status(404).json({ message: "Note not found or unauthorized" });
      }
      
      const updates = insertQuranNoteSchema.partial().parse(req.body);
      const updatedNote = await storage.updateQuranNote(id, updates);
      res.json(updatedNote);
    } catch (error) {
      console.error("Error updating Quran note:", error);
      res.status(400).json({ message: "Invalid note data" });
    }
  });

  app.delete('/api/quran/notes/:id', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const { id} = req.params;
      const userId = (req.session as any).userId;
      
      // Verify ownership
      const notes = await storage.getStudentQuranNotes(userId);
      const note = notes.find(n => n.id === id);
      if (!note) {
        return res.status(404).json({ message: "Note not found or unauthorized" });
      }
      
      await storage.deleteQuranNote(id);
      res.json({ message: "Note deleted successfully" });
    } catch (error) {
      console.error("Error deleting Quran note:", error);
      res.status(500).json({ message: "Failed to delete note" });
    }
  });

  // Word Highlights Routes
  app.get('/api/quran/word-highlights', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const { surahNumber, ayahNumber, wordIndex } = req.query;
      
      if (surahNumber && ayahNumber && wordIndex !== undefined) {
        const highlights = await storage.getWordHighlights(userId, parseInt(surahNumber), parseInt(ayahNumber));
        const filtered = highlights.filter(h => h.wordIndex === parseInt(wordIndex));
        return res.json(filtered);
      }
      
      const highlights = await storage.getAllWordHighlights(userId);
      res.json(highlights);
    } catch (error) {
      console.error("Error fetching word highlights:", error);
      res.status(500).json({ message: "Failed to fetch word highlights" });
    }
  });

  app.post('/api/quran/word-highlights', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const highlightData = insertQuranWordHighlightSchema.parse({
        ...req.body,
        studentId: userId
      });
      const highlight = await storage.createWordHighlight(highlightData);
      res.json(highlight);
    } catch (error) {
      console.error("Error creating word highlight:", error);
      res.status(400).json({ message: "Invalid highlight data" });
    }
  });

  app.patch('/api/quran/word-highlights/:id', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = insertQuranWordHighlightSchema.partial().parse(req.body);
      const highlight = await storage.updateWordHighlight(id, updates);
      res.json(highlight);
    } catch (error) {
      console.error("Error updating word highlight:", error);
      res.status(400).json({ message: "Invalid highlight data" });
    }
  });

  app.delete('/api/quran/word-highlights/:id', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteWordHighlight(id);
      res.json({ message: "Highlight deleted successfully" });
    } catch (error) {
      console.error("Error deleting word highlight:", error);
      res.status(500).json({ message: "Failed to delete highlight" });
    }
  });

  // Recitation Attempts Routes
  app.post('/api/quran/recitation-attempts', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const attemptData = insertQuranRecitationAttemptSchema.parse({
        ...req.body,
        studentId: userId
      });
      const attempt = await storage.createRecitationAttempt(attemptData);
      res.json(attempt);
    } catch (error) {
      console.error("Error creating recitation attempt:", error);
      res.status(400).json({ message: "Invalid attempt data" });
    }
  });

  // Analytics Routes
  app.get('/api/quran/analytics', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      
      const readingStats = await storage.getStudentReadingStats(userId);
      const memorization = await storage.getStudentMemorization(userId);
      const recitationAttempts = await storage.getStudentRecitationAttempts(userId);
      
      const totalAyahsRead = readingStats.reduce((sum, stat) => sum + (stat.ayahsRead || 0), 0);
      const totalPagesRead = readingStats.reduce((sum, stat) => sum + (stat.pagesRead || 0), 0);
      const totalMinutes = readingStats.reduce((sum, stat) => sum + (stat.minutesSpent || 0), 0);
      
      const memorizedAyahs = memorization.reduce((sum, m) => {
        return sum + (m.toAyah - m.fromAyah + 1);
      }, 0);
      
      const reviewedAyahs = memorization.filter(m => m.status === 'reviewing').reduce((sum, m) => {
        return sum + (m.toAyah - m.fromAyah + 1);
      }, 0);
      
      const completedSurahs = memorization.filter(m => m.status === 'completed').length;
      
      const totalRecitationAttempts = recitationAttempts.length;
      const averageAccuracy = recitationAttempts.length > 0 
        ? Math.round(recitationAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / recitationAttempts.length)
        : 0;
      
      res.json({
        totalAyahsRead,
        totalPagesRead,
        totalMinutes,
        currentStreak: 0, // Would need daily activity tracking
        longestStreak: 0, // Would need historical tracking
        averageDaily: totalAyahsRead / Math.max(1, readingStats.length),
        memorizedAyahs,
        reviewedAyahs,
        completedSurahs,
        totalRecitationAttempts,
        averageAccuracy
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  app.get('/api/quran/weekly-progress', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const stats = await storage.getStudentReadingStats(
        userId,
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );
      
      const daysOfWeek = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      const progress = daysOfWeek.map((day, index) => {
        const date = new Date(startDate.getTime() + index * 24 * 60 * 60 * 1000);
        const dayStats = stats.find(s => s.readingDate && new Date(s.readingDate).toDateString() === date.toDateString());
        return {
          day,
          ayahs: dayStats?.ayahsRead || 0,
          minutes: dayStats?.minutesSpent || 0
        };
      });
      
      res.json(progress);
    } catch (error) {
      console.error("Error fetching weekly progress:", error);
      res.status(500).json({ message: "Failed to fetch weekly progress" });
    }
  });

  app.get('/api/quran/recent-activity', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      
      const recentStats = await storage.getStudentReadingStats(userId);
      const recentMemorization = await storage.getStudentMemorization(userId);
      
      const activities = [
        ...recentStats.slice(0, 5).map(s => ({
          title: 'قراءة',
          description: `قرأت ${s.ayahsRead} آية في ${s.minutesSpent} دقيقة`,
          time: s.readingDate ? new Date(s.readingDate).toLocaleDateString('ar') : 'اليوم'
        })),
        ...recentMemorization.slice(0, 5).map(m => ({
          title: 'حفظ',
          description: `حفظ من الآية ${m.fromAyah} إلى ${m.toAyah}`,
          time: m.createdAt ? new Date(m.createdAt).toLocaleDateString('ar') : 'حديثاً'
        }))
      ];
      
      res.json(activities.slice(0, 10));
    } catch (error) {
      console.error("Error fetching recent activity:", error);
      res.status(500).json({ message: "Failed to fetch recent activity" });
    }
  });

  // Review System Endpoints
  app.get('/api/quran/review-items/:studentId', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const { studentId } = req.params;
      const userId = (req.session as any).userId;
      
      if (userId !== studentId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const SURAH_NAMES: Record<number, string> = {
        1: 'الفاتحة', 2: 'البقرة', 3: 'آل عمران', 4: 'النساء', 5: 'المائدة',
        6: 'الأنعام', 7: 'الأعراف', 8: 'الأنفال', 9: 'التوبة', 10: 'يونس',
        11: 'هود', 12: 'يوسف', 13: 'الرعد', 14: 'إبراهيم', 15: 'الحجر',
        16: 'النحل', 17: 'الإسراء', 18: 'الكهف', 19: 'مريم', 20: 'طه',
        114: 'الناس'
      };
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const allMemorizations = await storage.getStudentMemorization(studentId);
      
      const reviewItems = allMemorizations
        .filter(mem => mem.status !== 'in_progress')
        .map(mem => {
          const nextReview = mem.nextReviewDate 
            ? new Date(mem.nextReviewDate)
            : mem.lastReviewed 
              ? new Date(mem.lastReviewed)
              : new Date();
          
          nextReview.setHours(0, 0, 0, 0);
          const daysUntilReview = Math.floor((nextReview.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          let status: 'due' | 'soon' | 'later';
          if (daysUntilReview <= 0) {
            status = 'due';
          } else if (daysUntilReview <= 3) {
            status = 'soon';
          } else {
            status = 'later';
          }
          
          return {
            id: mem.id,
            surahNumber: mem.surahNumber,
            surahName: SURAH_NAMES[mem.surahNumber] || `سورة ${mem.surahNumber}`,
            fromAyah: mem.fromAyah,
            toAyah: mem.toAyah,
            lastReviewDate: mem.lastReviewed ? new Date(mem.lastReviewed).toISOString() : null,
            nextReviewDate: nextReview.toISOString(),
            reviewCount: mem.reviewCount || 0,
            difficultyLevel: mem.masteryLevel || 0,
            status
          };
        });
      
      res.json(reviewItems);
    } catch (error) {
      console.error("Error fetching review items:", error);
      res.status(500).json({ message: "Failed to fetch review items" });
    }
  });

  app.post('/api/quran/complete-review', isPhoneAuthenticated, async (req: any, res) => {
    try {
      const userId = (req.session as any).userId;
      const { reviewId, difficulty, studentId } = req.body;
      
      if (userId !== studentId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const memorizations = await storage.getStudentMemorization(studentId);
      const memorization = memorizations.find(m => m.id === reviewId);
      
      if (!memorization) {
        return res.status(404).json({ message: "Review item not found" });
      }
      
      const intervals = {
        easy: [1, 3, 7, 14, 30, 60, 90],
        medium: [1, 2, 4, 8, 15, 30, 60],
        hard: [1, 1, 2, 3, 5, 7, 14]
      };
      
      const reviewCount = (memorization.reviewCount || 0) + 1;
      const intervalList = intervals[difficulty as 'easy' | 'medium' | 'hard'];
      const index = Math.min(reviewCount - 1, intervalList.length - 1);
      const nextInterval = intervalList[index];
      
      const now = new Date();
      const nextReviewDate = new Date(now.getTime() + nextInterval * 24 * 60 * 60 * 1000);
      
      const currentMastery = memorization.masteryLevel || 50;
      let newMastery = currentMastery;
      
      if (difficulty === 'easy') {
        newMastery = Math.min(100, currentMastery + 15);
      } else if (difficulty === 'medium') {
        newMastery = Math.max(0, Math.min(100, currentMastery));
      } else {
        newMastery = Math.max(0, currentMastery - 10);
      }
      
      const newStatus = newMastery >= 90 ? 'completed' : 'reviewing';
      
      const updated = await storage.updateReviewOutcome(reviewId, {
        difficulty: difficulty as 'easy' | 'medium' | 'hard',
        reviewCount,
        lastReviewed: now,
        nextReviewDate,
        masteryLevel: newMastery,
        status: newStatus
      });
      
      res.json(updated);
    } catch (error) {
      console.error("Error completing review:", error);
      res.status(500).json({ message: "Failed to complete review" });
    }
  });

  // Reciters List
  app.get('/api/quran/reciters', async (req, res) => {
    try {
      const reciters = [
        { id: "1", name: "عبد الباسط عبد الصمد" },
        { id: "2", name: "ماهر المعيقلي" },
        { id: "3", name: "محمود خليل الحصري" },
        { id: "4", name: "مشاري راشد العفاسي" },
        { id: "5", name: "سعد الغامدي" },
        { id: "6", name: "عبد الرحمن السديس" },
        { id: "7", name: "سعود الشريم" },
        { id: "8", name: "أحمد العجمي" }
      ];
      res.json(reciters);
    } catch (error) {
      console.error("Error fetching reciters:", error);
      res.status(500).json({ message: "Failed to fetch reciters" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
