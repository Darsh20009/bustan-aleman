import type { Express } from "express";
import { hashPassword, verifyPassword } from "./authUtils";
import { storage } from "./storage";
import { z } from "zod";
import { normalizePhoneNumber, phonesMatch } from "./phoneUtils";

// Enhanced registration schema supporting all roles
const userRegistrationSchema = z.object({
  firstName: z.string().min(2, "الاسم الأول مطلوب"),
  lastName: z.string().min(2, "اسم العائلة مطلوب"),
  email: z.string().email("بريد إلكتروني صالح مطلوب"),
  password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
  phoneNumber: z.string().min(10, "رقم الهاتف مطلوب"),
  // Academy selection for students
  academy: z.string().min(1, "الرجاء اختيار الأكاديمية"),
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
  phoneNumber: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
}).refine(data => data.phoneNumber || data.email, {
  message: "رقم الجوال أو البريد الإلكتروني مطلوب",
});

const forgotPasswordSchema = z.object({
  email: z.string().email("بريد إلكتروني صالح مطلوب"),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "رمز التحقق مطلوب"),
  newPassword: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
});

export function setupAuthRoutes(app: Express) {
  // Universal user registration
  app.post('/api/auth/register', async (req, res) => {
    try {
      const registrationData = userRegistrationSchema.parse(req.body);

      // Check if email or phone already exists (with normalized phone comparison)
      const existingUsers = await storage.getAllUsers();
      const normalizedInputPhone = normalizePhoneNumber(registrationData.phoneNumber);
      const emailExists = existingUsers.some((user: any) => user.email === registrationData.email);
      const phoneExists = existingUsers.some((user: any) => {
        const userPhone = normalizePhoneNumber(user.phoneNumber);
        return userPhone && normalizedInputPhone && userPhone === normalizedInputPhone;
      });

      if (emailExists) {
        return res.status(409).json({
          message: "البريد الإلكتروني مُستخدم بالفعل"
        });
      }

      if (phoneExists) {
        return res.status(409).json({
          message: "رقم الهاتف مُستخدم بالفعل"
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

      // Check if student record already exists for this user (check by multiple fields to prevent duplicates)
      const existingStudents = await storage.getAllStudents();
      let student = existingStudents.find(s => {
        if (s.userId === user.id) return true;
        const studentPhone = normalizePhoneNumber(s.phoneNumber);
        if (studentPhone && normalizedInputPhone && studentPhone === normalizedInputPhone) return true;
        if (s.email && s.email === registrationData.email) return true;
        const studentName = `${registrationData.firstName} ${registrationData.lastName}`;
        if (s.studentName === studentName) return true;
        return false;
      });
      
      if (!student) {
        // Create student record (all public registrations are students)
        student = await storage.createStudent({
          userId: user.id,
          studentName: `${registrationData.firstName} ${registrationData.lastName}`,
          passwordHash: hashedPassword,
          phoneNumber: registrationData.phoneNumber,
          email: registrationData.email,
          dateOfBirth: null,
          grade: null,
          academy: registrationData.academy,
          monthlySessionsCount: 0,
          monthlyPrice: "0",
          isPaid: false,
          isActive: true,
          memorizedSurahs: "[]",
          currentLevel: "beginner",
          notes: "طالب جديد",
          whatsappContact: registrationData.whatsappNumber || "+966532441566",
        });
      } else if (!student.userId) {
        // Link existing student to user account if they weren't linked
        await storage.updateStudent(student.id, { 
          userId: user.id,
          email: registrationData.email,
          phoneNumber: registrationData.phoneNumber,
        });
        student.userId = user.id;
      }

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

  // Universal user login (supports phone or email)
  app.post('/api/auth/login', async (req, res) => {
    try {
      console.log('[auth] Login attempt:', { phoneNumber: req.body.phoneNumber, email: req.body.email });
      const { phoneNumber, email, password } = loginSchema.parse(req.body);

      // Find user by phone number or email (with normalized phone comparison)
      const users = await storage.getAllUsers();
      const normalizedInputPhone = phoneNumber ? normalizePhoneNumber(phoneNumber) : null;
      const user = users.find((u: any) => {
        if (!u.isActive) return false;
        if (email && u.email === email) return true;
        if (normalizedInputPhone && u.phoneNumber) {
          const userPhone = normalizePhoneNumber(u.phoneNumber);
          return userPhone && userPhone === normalizedInputPhone;
        }
        return false;
      });

      if (!user) {
        console.log('[auth] User not found');
        return res.status(401).json({ message: "بيانات الدخول غير صحيحة" });
      }
      
      console.log('[auth] User found:', user.id);

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
      
      console.log('[auth] Session created:', { userId: user.id, role: user.role });

      // Get additional data based on role
      let additionalData: any = {};

      if (user.role === 'student') {
        const students = await storage.getAllStudents();
        
        // البحث عن الطالب بطرق متعددة لتجنب التكرار
        let student = students.find(s => 
          s.userId === user.id || 
          (user.phoneNumber && s.phoneNumber === user.phoneNumber) ||
          (user.email && s.email === user.email) ||
          (user.firstName && s.studentName === user.firstName)
        );
        
        // إذا وجدنا الطالب ولكن غير مربوط بـ userId، نقوم بربطه فقط
        if (student && !student.userId) {
          await storage.updateStudent(student.id, { userId: user.id });
          student.userId = user.id;
          console.log('[auth] Linked existing student to userId:', user.id);
        }
        
        // فقط إذا لم نجد الطالب نهائياً، نقوم بإنشاء سجل جديد
        if (!student) {
          console.log('[auth] No student record found for userId:', user.id, 'Creating new student record...');

          const newStudentData = {
            userId: user.id,
            studentName: user.firstName || 'طالب جديد',
            passwordHash: user.passwordHash || '',
            phoneNumber: user.phoneNumber,
            email: user.email,
            dateOfBirth: null,
            grade: null,
            monthlySessionsCount: 0,
            monthlyPrice: "0",
            isPaid: false,
            isActive: true,
            memorizedSurahs: '[]',
            currentLevel: 'المستوى الأول',
            notes: null,
            whatsappContact: user.phoneNumber || '+966532441566',
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

      // حفظ الجلسة بشكل صريح
      req.session.save((err) => {
        if (err) {
          console.error('[auth] Session save error:', err);
          return res.status(500).json({ message: "خطأ في حفظ الجلسة" });
        }
        console.log('[auth] Session saved successfully');
        res.json(loginResponse);
      });
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
        const students = await storage.getAllStudents();
        
        // البحث عن الطالب بطرق متعددة لتجنب التكرار
        let student = students.find(s => 
          s.userId === user.id || 
          (user.phoneNumber && s.phoneNumber === user.phoneNumber) ||
          (user.email && s.email === user.email) ||
          (user.firstName && s.studentName === user.firstName)
        );

        // إذا وجدنا الطالب ولكن غير مربوط بـ userId، نقوم بربطه فقط
        if (student && !student.userId) {
          await storage.updateStudent(student.id, { userId: user.id });
          student.userId = user.id;
          console.log('[auth/user] Linked existing student to userId:', user.id);
        }
        
        // فقط إذا لم نجد الطالب نهائياً، نقوم بإنشاء سجل جديد
        if (!student) {
          console.log('[auth/user] No student record found for userId:', user.id, 'Creating new student record...');

          const newStudentData = {
            userId: user.id,
            studentName: user.firstName || 'طالب جديد',
            passwordHash: user.passwordHash || '',
            phoneNumber: user.phoneNumber,
            email: user.email,
            dateOfBirth: null,
            grade: null,
            monthlySessionsCount: 0,
            monthlyPrice: "0",
            isPaid: false,
            isActive: true,
            memorizedSurahs: '[]',
            currentLevel: 'المستوى الأول',
            notes: null,
            whatsappContact: user.phoneNumber || '+966532441566',
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

  // Forgot Password - Request Reset
  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);

      const users = await storage.getAllUsers();
      const user = users.find((u: any) => u.email === email && u.isActive);

      if (!user) {
        // Don't reveal if email exists for security
        return res.json({ message: "إذا كان البريد الإلكتروني موجوداً، سيتم إرسال رابط إعادة التعيين" });
      }

      // Generate reset token (valid for 1 hour)
      const resetToken = require('crypto').randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

      // Update user with reset token
      await storage.upsertUser({
        ...user,
        passwordResetToken: resetToken,
        passwordResetExpiry: resetTokenExpiry,
      });

      // Generate reset link
      const resetLink = `${process.env.REPL_SLUG || 'http://localhost:5000'}/reset-password?token=${resetToken}`;
      
      // ⚠️ DEVELOPMENT ONLY: Log the reset link to console
      // In production, this should be sent via email only!
      console.log('🔑 [DEV ONLY] Password reset link:', resetLink);
      console.log('⚠️  WARNING: Email service not configured. Please set up email to send reset links securely.');

      // TODO: Send email using email service (e.g., SendGrid, AWS SES)
      // Example: await sendEmail(user.email, 'Reset Password', resetLink);

      // ✅ SECURITY FIX: Never return the token in the response!
      // Always send it via a trusted channel (email)
      res.json({ 
        message: "إذا كان البريد الإلكتروني موجوداً، سيتم إرسال رابط إعادة التعيين"
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "بريد إلكتروني غير صالح",
          errors: error.errors.map(e => e.message)
        });
      }
      console.error("Error in forgot password:", error);
      res.status(500).json({ message: "حدث خطأ، يرجى المحاولة مرة أخرى" });
    }
  });

  // Reset Password - Complete Reset
  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { token, newPassword } = resetPasswordSchema.parse(req.body);

      const users = await storage.getAllUsers();
      const user = users.find((u: any) => 
        u.passwordResetToken === token && 
        u.passwordResetExpiry && 
        new Date(u.passwordResetExpiry) > new Date() &&
        u.isActive
      );

      if (!user) {
        return res.status(400).json({ message: "رمز إعادة التعيين غير صالح أو منتهي الصلاحية" });
      }

      // Hash new password
      const hashedPassword = await hashPassword(newPassword);

      // Update user password and clear reset token
      await storage.upsertUser({
        ...user,
        passwordHash: hashedPassword,
        passwordResetToken: null,
        passwordResetExpiry: null,
      });

      // Also update student record if exists
      if (user.role === 'student') {
        const students = await storage.getAllStudents();
        const student = students.find(s => s.userId === user.id);
        if (student) {
          await storage.updateStudent(student.id, {
            ...student,
            passwordHash: hashedPassword,
          });
        }
      }

      res.json({ message: "تم تغيير كلمة المرور بنجاح" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "بيانات غير صالحة",
          errors: error.errors.map(e => e.message)
        });
      }
      console.error("Error in reset password:", error);
      res.status(500).json({ message: "حدث خطأ، يرجى المحاولة مرة أخرى" });
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