import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { quranService } from "./quranService";
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
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User profile routes
  app.patch('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userData = req.body;
      
      const updatedUser = await storage.updateUserProfile(userId, userData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
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

  app.post('/api/courses', isAuthenticated, async (req, res) => {
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
  app.post('/api/enrollments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  app.get('/api/user/enrollments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  app.get('/api/contact', isAuthenticated, async (req, res) => {
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
        password: "182009",
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
        password: "123789",
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

  const httpServer = createServer(app);
  return httpServer;
}
