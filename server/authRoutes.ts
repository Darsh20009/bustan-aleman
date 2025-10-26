import type { Express } from "express";
import { hashPassword, verifyPassword } from "./authUtils";
import { storage } from "./storage";
import { z } from "zod";

// Enhanced registration schema supporting all roles
const userRegistrationSchema = z.object({
  firstName: z.string().min(2, "الاسم الأول مطلوب"),
  lastName: z.string().min(2, "اسم العائلة مطلوب"),
  email: z.string().email("بريد إلكتروني صالح مطلوب"),
  password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
  phoneNumber: z.string().min(10, "رقم الهاتف مطلوب"),
  // Role is always 'student' for public registration - supervisors/admins must be created separately
  role: z.literal("student").default("student"),
  // Optional fields for students
  age: z.number().min(5).max(100).optional(),
  educationLevel: z.string().optional(),
  quranExperience: z.string().optional(),
  learningGoals: z.string().optional(),
  preferredTime: z.string().optional(),
  whatsappNumber: z.string().optional(),
});

const loginSchema = z.object({
  phoneNumber: z.string().min(10, "رقم الجوال مطلوب"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

export function setupAuthRoutes(app: Express) {
  // Universal user registration
  app.post('/api/auth/register', async (req, res) => {
    try {
      const registrationData = userRegistrationSchema.parse(req.body);

      // Check if email already exists
      const existingUsers = await storage.getAllUsers();
      const emailExists = existingUsers.some((user: any) => user.email === registrationData.email);

      if (emailExists) {
        return res.status(409).json({
          message: "البريد الإلكتروني مُستخدم بالفعل"
        });
      }

      // Hash password before storing
      const hashedPassword = await hashPassword(registrationData.password);

      // Create new user with hashed password (always as student for security)
      const userData = {
        email: registrationData.email,
        firstName: registrationData.firstName,
        lastName: registrationData.lastName,
        role: "student" as const, // Force role to student for public registration
        passwordHash: hashedPassword,
        phoneNumber: registrationData.phoneNumber,
        age: registrationData.age,
        educationLevel: registrationData.educationLevel,
        quranExperience: registrationData.quranExperience,
        learningGoals: registrationData.learningGoals,
        preferredTime: registrationData.preferredTime,
        whatsappNumber: registrationData.whatsappNumber,
        isActive: true,
        registrationCompleted: true,
      };

      const user = await storage.upsertUser(userData);

      // Create student record (all public registrations are students)
      const student = await storage.createStudent({
        userId: user.id,
        studentName: `${registrationData.firstName} ${registrationData.lastName}`,
        passwordHash: hashedPassword,
        dateOfBirth: null,
        grade: null,
        monthlySessionsCount: 0,
        monthlyPrice: "0",
        isPaid: false,
        isActive: true,
        memorizedSurahs: "[]",
        currentLevel: "beginner",
        notes: "طالب جديد",
        zoomLink: null,
        whatsappContact: registrationData.whatsappNumber || "+966532441566", // Use provided WhatsApp or fallback
      });

      // Create session automatically after successful registration
      if (!req.session) {
        req.session = {} as any;
      }
      req.session.userId = user.id;
      req.session.userRole = user.role as "student" | "supervisor" | "admin";
      req.session.studentId = student.id; // For compatibility with legacy routes

      res.status(201).json({
        message: "تم التسجيل بنجاح!",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          studentId: student.id,
          currentLevel: student.currentLevel,
          memorizedSurahs: student.memorizedSurahs,
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "بيانات غير صحيحة",
          errors: error.errors.map(e => e.message)
        });
      }
      console.error("Error registering user:", error);
      res.status(500).json({ message: "فشل في التسجيل، يرجى المحاولة مرة أخرى" });
    }
  });

  // Universal user login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { phoneNumber, password } = loginSchema.parse(req.body);

      // Find user by phone number
      const users = await storage.getAllUsers();
      const user = users.find((u: any) =>
        u.phoneNumber === phoneNumber && u.isActive
      );

      if (!user) {
        return res.status(401).json({ message: "بيانات الدخول غير صحيحة" });
      }

      // Verify password against user's stored hash
      let isValidPassword = false;

      if (user.passwordHash) {
        // Check if passwordHash is already hashed or plain text
        if (user.passwordHash.startsWith('$2b$') || user.passwordHash.startsWith('$2a$')) {
          isValidPassword = await verifyPassword(password, user.passwordHash);
        } else {
          // Plain text password for pre-registered users
          isValidPassword = password === user.passwordHash;

          // If valid, hash it for future use
          if (isValidPassword) {
            const hashedPassword = await hashPassword(password);
            await storage.upsertUser({ ...user, passwordHash: hashedPassword });
          }
        }
      } else {
        // For legacy students, check against student record
        if (user.role === 'student') {
          const students = await storage.getAllStudents();
          const student = students.find(s => s.userId === user.id);

          if (student && student.passwordHash) {
            if (student.passwordHash.startsWith('$2b$') || student.passwordHash.startsWith('$2a$')) {
              isValidPassword = await verifyPassword(password, student.passwordHash);
            } else {
              isValidPassword = password === student.passwordHash;
            }
          }
        }
      }

      if (!isValidPassword) {
        return res.status(401).json({ message: "بيانات الدخول غير صحيحة" });
      }

      // Create session
      if (!req.session) {
        req.session = {} as any;
      }
      req.session.userId = user.id;
      req.session.userRole = user.role as "student" | "supervisor" | "admin";

      // Get additional data based on role
      let additionalData: any = {};

      if (user.role === 'student') {
        const students = await storage.getStudents();
        let student = students.find(s => s.userId === user.id);

        // If no student record exists, create one automatically
        if (!student) {
          console.log('[auth] No student record found for userId:', user.id, 'Creating new student record...');

          const newStudentData = {
            userId: user.id,
            studentName: user.firstName || 'طالب جديد',
            phoneNumber: user.phoneNumber || '',
            currentLevel: 'المستوى الأول',
            memorizedSurahs: '[]',
            isActive: true,
          };

          student = await storage.createStudent(newStudentData);
          console.log('[auth] Created student record with id:', student.id);
        }

        if (student) {
          additionalData = {
            studentId: student.id,
            currentLevel: student.currentLevel,
            memorizedSurahs: student.memorizedSurahs,
          };
          console.log('[auth] Student data loaded, studentId:', student.id, 'for userId:', user.id);
        }
      }

      const loginResponse = {
        message: "تم تسجيل الدخول بنجاح",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          phoneNumber: user.phoneNumber,
          ...additionalData,
        }
      };

      console.log('[auth] Login response:', JSON.stringify(loginResponse, null, 2));

      res.json(loginResponse);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "بيانات غير صحيحة",
          errors: error.errors.map(e => e.message)
        });
      }
      console.error("Error during login:", error);
      res.status(500).json({ message: "فشل في تسجيل الدخول" });
    }
  });

  // Get current user
  app.get('/api/auth/user', async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ message: "غير مسجل الدخول" });
      }

      const user = await storage.getUser(userId);
      if (!user || !user.isActive) {
        return res.status(401).json({ message: "المستخدم غير موجود" });
      }

      // Get additional data based on role
      let additionalData: any = {};

      if (user.role === 'student') {
        const students = await storage.getStudents();
        let student = students.find(s => s.userId === user.id);

        // If no student record exists, create one automatically
        if (!student) {
          console.log('[auth/user] No student record found for userId:', user.id, 'Creating new student record...');

          const newStudentData = {
            userId: user.id,
            studentName: user.firstName || 'طالب جديد',
            phoneNumber: user.phoneNumber || '',
            currentLevel: 'المستوى الأول',
            memorizedSurahs: '[]',
            isActive: true,
          };

          student = await storage.createStudent(newStudentData);
          console.log('[auth/user] Created student record with id:', student.id);
        }

        if (student) {
          additionalData = {
            studentId: student.id,
            currentLevel: student.currentLevel,
            memorizedSurahs: student.memorizedSurahs,
          };
        }
      }

      const responseData = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phoneNumber: user.phoneNumber,
        registrationCompleted: user.registrationCompleted,
        ...additionalData,
      };

      console.log('[auth/user] Sending user data with studentId:', additionalData.studentId);

      res.json(responseData);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "خطأ في جلب بيانات المستخدم" });
    }
  });

  // Logout
  app.post('/api/auth/logout', async (req, res) => {
    try {
      req.session?.destroy?.((err) => {
        if (err) {
          console.error("Session destruction error:", err);
          return res.status(500).json({ message: "خطأ في تسجيل الخروج" });
        }
        res.clearCookie('connect.sid');
        res.json({ message: "تم تسجيل الخروج بنجاح" });
      });
    } catch (error) {
      console.error("Error during logout:", error);
      res.status(500).json({ message: "خطأ في تسجيل الخروج" });
    }
  });
}