import type { Express } from "express";
import { storage } from "./storage";
import { requireAuth, requireSupervisorOrAdmin, requireStudent, type AuthenticatedRequest } from "./authMiddleware";
import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import {
  insertStudentNoteSchema,
  insertCertificateSchema,
  insertQuranProgressSchema,
} from "@shared/schema";

// Validation schemas
const studentProgressUpdateSchema = z.object({
  bookmarks: z.array(z.object({
    surah: z.number(),
    ayah: z.number(),
    note: z.string().optional(),
  })).optional(),
  lastRead: z.object({
    surah: z.number(),
    ayah: z.number(),
    mode: z.enum(['reading', 'memorizing']).optional(),
  }).optional(),
  memorization: z.array(z.object({
    surah: z.number(),
    ayat: z.array(z.number()),
  })).optional(),
});

// Add memorization to QuranProgress schema extension
const memorizedSurahsSchema = z.array(z.object({
  surah: z.number(),
  ayat: z.array(z.number()),
}));

const studentUpdateSchema = z.object({
  currentLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  zoomLink: z.string().url().optional(),
  isPaid: z.boolean().optional(),
  isActive: z.boolean().optional(),
  monthlyPrice: z.string().optional(),
});

const certificateCreateSchema = insertCertificateSchema.omit({
  issuedBy: true,
  verificationToken: true,
  qrImageDataUrl: true,
  status: true,
});

const studentNoteCreateSchema = insertStudentNoteSchema.omit({
  studentId: true,
  authorId: true,
});

export function setupAdditionalRoutes(app: Express) {
  // Student Progress Routes
  app.get('/api/student/progress', requireAuth, requireStudent, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      
      // Get student record from userId
      const allStudents = await storage.getAllStudents();
      const student = allStudents.find(s => s.userId === userId);
      
      // Get student progress from quran_progress table
      const progress = await storage.getQuranProgress(userId);
      
      // Calculate attendance rate from sessions
      let attendanceRate = 0;
      let completedSessions = 0;
      let totalSessions = 0;
      
      if (student) {
        try {
          const sessions = await storage.getStudentSessions(student.id);
          const now = new Date();
          const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          
          // Filter sessions for this month, handling mixed date formats
          const monthSessions = sessions.filter(s => {
            let sessionDate: Date | null = null;
            
            // Try multiple date fields and formats
            const possibleDateFields = [
              (s as any).sessionDate,
              (s as any).date,
              (s as any).createdAt,
              (s as any).startTime
            ];
            
            for (const field of possibleDateFields) {
              if (!field) continue;
              
              // Handle Date objects
              if (field instanceof Date) {
                sessionDate = field;
                break;
              }
              
              // Handle ISO date strings (YYYY-MM-DD or full ISO)
              if (typeof field === 'string') {
                const parsed = new Date(field);
                if (!isNaN(parsed.getTime()) && parsed.getFullYear() > 2000) {
                  sessionDate = parsed;
                  break;
                }
              }
            }
            
            if (!sessionDate) return false;
            return sessionDate >= thisMonthStart && sessionDate <= now;
          });
          
          // If no sessions found this month, use all sessions for rate calculation
          const sessionsToCount = monthSessions.length > 0 ? monthSessions : sessions.slice(0, 10);
          
          totalSessions = sessionsToCount.length;
          completedSessions = sessionsToCount.filter(s => s.status !== 'absent' && s.status !== 'cancelled').length;
          attendanceRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 100;
        } catch (err) {
          console.log("Could not calculate attendance:", err);
        }
      }
      
      // Calculate memorized parts (estimate from lastSurah)
      const lastSurah = progress?.lastSurah || 1;
      // Rough estimate: each juz has about 2 surahs on average
      const memorizedParts = Math.min(30, Math.ceil(lastSurah / 4));
      
      const responseData = {
        id: progress?.id || "temp-" + userId,
        studentId: userId,
        lastSurah: progress?.lastSurah || 1,
        lastAyah: progress?.lastAyah || 1,
        bookmarkedVerses: progress?.bookmarkedVerses || "[]",
        createdAt: progress?.createdAt || new Date(),
        updatedAt: progress?.updatedAt || new Date(),
        // Dashboard-specific fields
        attendanceRate,
        memorizedParts,
        completedSessions,
        totalSessions,
      };
      
      res.json(responseData);
    } catch (error) {
      console.error("Error fetching student progress:", error);
      // Return a default progress even on error for better UX
      const defaultProgress = {
        id: "temp-" + req.user!.id,
        studentId: req.user!.id,
        lastSurah: 1,
        lastAyah: 1,
        bookmarkedVerses: "[]",
        createdAt: new Date(),
        updatedAt: new Date(),
        attendanceRate: 0,
        memorizedParts: 0,
        completedSessions: 0,
        totalSessions: 0,
      };
      res.json(defaultProgress);
    }
  });

  app.put('/api/student/progress', requireAuth, requireStudent, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const updateData = studentProgressUpdateSchema.parse(req.body);
      
      // Get existing progress
      let progress = await storage.getQuranProgress(userId);
      
      if (!progress) {
        // Create if doesn't exist
        progress = await storage.createQuranProgress({
          studentId: userId,
          lastSurah: updateData.lastRead?.surah || 1,
          lastAyah: updateData.lastRead?.ayah || 1,
          bookmarkedVerses: JSON.stringify(updateData.bookmarks || []),
        });
      } else {
        // Update existing
        const updateFields: any = {};
        
        if (updateData.lastRead) {
          updateFields.lastSurah = updateData.lastRead.surah;
          updateFields.lastAyah = updateData.lastRead.ayah;
        }
        
        if (updateData.bookmarks) {
          updateFields.bookmarkedVerses = JSON.stringify(updateData.bookmarks);
        }
        
        // Also update the student's memorized surahs if memorization data is provided
        if (updateData.memorization) {
          await storage.updateStudentMemorization(userId, updateData.memorization);
        }
        
        if (Object.keys(updateFields).length > 0) {
          progress = await storage.updateQuranProgress(userId, updateFields);
        }
      }
      
      res.json(progress);
    } catch (error) {
      console.error("Error updating student progress:", error);
      res.status(500).json({ message: "خطأ في تحديث تقدم الطالب" });
    }
  });

  // Supervisor Management Routes
  app.get('/api/students', requireAuth, requireSupervisorOrAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const students = await storage.getAllStudents();
      
      // Include user information for each student
      const studentsWithUsers = await Promise.all(
        students.map(async (student) => {
          const user = student.userId ? await storage.getUser(student.userId) : null;
          const progress = student.userId ? await storage.getQuranProgress(student.userId) : null;
          
          return {
            ...student,
            user,
            progress,
          };
        })
      );
      
      res.json(studentsWithUsers);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ message: "خطأ في جلب بيانات الطلاب" });
    }
  });

  app.patch('/api/students/:id', requireAuth, requireSupervisorOrAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const studentId = req.params.id;
      const updateData = studentUpdateSchema.parse(req.body);
      
      const updatedStudent = await storage.updateStudent(studentId, updateData);
      res.json(updatedStudent);
    } catch (error) {
      console.error("Error updating student:", error);
      res.status(500).json({ message: "خطأ في تحديث بيانات الطالب" });
    }
  });

  app.post('/api/students/:id/notes', requireAuth, requireSupervisorOrAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const studentId = req.params.id;
      const validatedData = studentNoteCreateSchema.parse(req.body);
      const noteData = {
        ...validatedData,
        studentId,
        authorId: req.user!.id,
      };
      
      const note = await storage.createStudentNote(noteData);
      res.status(201).json(note);
    } catch (error) {
      console.error("Error creating student note:", error);
      res.status(500).json({ message: "خطأ في إضافة ملاحظة" });
    }
  });

  app.get('/api/students/:id/notes', requireAuth, requireSupervisorOrAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const studentId = req.params.id;
      const notes = await storage.getStudentNotes(studentId);
      res.json(notes);
    } catch (error) {
      console.error("Error fetching student notes:", error);
      res.status(500).json({ message: "خطأ في جلب الملاحظات" });
    }
  });

  // Certificate Management Routes
  app.post('/api/certificates', requireAuth, requireSupervisorOrAdmin, async (req: AuthenticatedRequest, res) => {
    try {
      const certificateData = certificateCreateSchema.parse(req.body);
      
      // Generate verification token and QR code
      const verificationToken = uuidv4();
      const verificationUrl = `${req.protocol}://${req.get('host')}/api/certificates/verify/${verificationToken}`;
      
      // Generate QR code as data URL
      const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#1a472a',
          light: '#FFFFFF',
        },
        width: 256,
      });
      
      const certificate = await storage.createCertificate({
        ...certificateData,
        issuedBy: req.user!.id,
        verificationToken,
        qrImageDataUrl: qrDataUrl,
        status: 'valid',
      });
      
      res.status(201).json(certificate);
    } catch (error) {
      console.error("Error creating certificate:", error);
      res.status(500).json({ message: "خطأ في إنشاء الشهادة" });
    }
  });

  app.get('/api/certificates/:id', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const certificateId = req.params.id;
      const certificate = await storage.getCertificate(certificateId);
      
      if (!certificate) {
        return res.status(404).json({ message: "الشهادة غير موجودة" });
      }
      
      // Only allow student to see their own certificates or supervisors/admins to see all
      if (req.user!.role === 'student' && certificate.studentId !== req.user!.id) {
        return res.status(403).json({ message: "غير مخول للوصول لهذه الشهادة" });
      }
      
      res.json(certificate);
    } catch (error) {
      console.error("Error fetching certificate:", error);
      res.status(500).json({ message: "خطأ في جلب الشهادة" });
    }
  });

  app.get('/api/certificates/verify/:token', async (req, res) => {
    try {
      const verificationToken = req.params.token;
      const certificate = await storage.getCertificateByToken(verificationToken);
      
      if (!certificate) {
        return res.status(404).json({ 
          valid: false, 
          message: "رمز التحقق غير صحيح أو الشهادة غير موجودة" 
        });
      }
      
      if (certificate.status !== 'valid') {
        return res.status(400).json({ 
          valid: false, 
          message: "الشهادة غير صالحة أو منتهية الصلاحية" 
        });
      }
      
      // Get student information
      const student = await storage.getUser(certificate.studentId);
      
      res.json({
        valid: true,
        certificate: {
          titleAr: certificate.titleAr,
          titleEn: certificate.titleEn,
          issuedAt: certificate.issuedAt,
          grade: certificate.grade,
          teacherName: certificate.teacherName,
          student: student ? {
            firstName: student.firstName,
            lastName: student.lastName,
          } : null,
        },
      });
    } catch (error) {
      console.error("Error verifying certificate:", error);
      res.status(500).json({ 
        valid: false, 
        message: "خطأ في التحقق من الشهادة" 
      });
    }
  });

  app.get('/api/certificates', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      let certificates;
      
      if (req.user!.role === 'student') {
        // Students only see their own certificates
        certificates = await storage.getStudentCertificates(req.user!.id);
      } else {
        // Supervisors and admins see all certificates
        certificates = await storage.getAllCertificates();
      }
      
      res.json(certificates);
    } catch (error) {
      console.error("Error fetching certificates:", error);
      res.status(500).json({ message: "خطأ في جلب الشهادات" });
    }
  });

  // ==================== Student Dashboard Stats (aggregated) ====================
  app.get('/api/student/dashboard', requireAuth, requireStudent, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;

      // Get student record
      let student = await storage.getStudentByUserId(userId);
      if (!student) {
        const user = await storage.getUser(userId);
        if (user?.phoneNumber) {
          student = await storage.getStudentByPhone(user.phoneNumber);
        }
      }

      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];

      // Sessions stats
      let upcomingSessions: any[] = [];
      let completedSessions = 0;
      let totalSessions = 0;
      let attendanceRate = 0;
      let nextSession: any = null;

      if (student) {
        try {
          const sessions = await storage.getAllSessionAccess(student.id);
          totalSessions = sessions.length;
          const attended = sessions.filter((s: any) => s.attendanceStatus === 'present');
          completedSessions = attended.length;
          attendanceRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

          upcomingSessions = sessions
            .filter((s: any) => {
              const d = s.sessionDate || s.date;
              return d && String(d) >= todayStr;
            })
            .sort((a: any, b: any) => {
              const da = String(a.sessionDate || a.date || '');
              const db = String(b.sessionDate || b.date || '');
              return da.localeCompare(db);
            })
            .slice(0, 3);

          nextSession = upcomingSessions[0] || null;
        } catch (_) {}
      }

      // Homework stats
      let pendingHomework = 0;
      let completedHomework = 0;
      let recentHomework: any[] = [];
      if (student) {
        try {
          const hw = await storage.getHomeworksForStudent(student.id);
          pendingHomework = hw.filter((h: any) => {
            const due = h.dueDate ? new Date(h.dueDate) : null;
            return h.status !== 'submitted' && h.status !== 'graded' && (!due || due >= now);
          }).length;
          completedHomework = hw.filter((h: any) => h.status === 'graded' || h.status === 'submitted').length;
          recentHomework = hw
            .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
            .slice(0, 3);
        } catch (_) {}
      }

      // Quran progress
      let quranProgress: any = null;
      let memorizedCount = 0;
      try {
        quranProgress = await storage.getQuranProgress(userId);
        if (quranProgress) {
          const memorized = student?.memorizedSurahs || quranProgress.memorizedSurahs;
          if (memorized) {
            try {
              const parsed = typeof memorized === 'string' ? JSON.parse(memorized) : memorized;
              memorizedCount = Array.isArray(parsed) ? parsed.length : 0;
            } catch (_) {}
          }
        }
      } catch (_) {}

      // Subscription status
      let subscriptionStatus = 'inactive';
      let subscriptionPlan = null;
      if (student) {
        try {
          subscriptionStatus = student.isPaid ? 'active' : 'inactive';
        } catch (_) {}
      }

      res.json({
        student: student ? {
          id: student.id,
          name: student.studentName,
          level: student.currentLevel,
          isPaid: student.isPaid,
          isActive: student.isActive,
        } : null,
        sessions: {
          total: totalSessions,
          completed: completedSessions,
          upcoming: upcomingSessions.length,
          attendanceRate,
          nextSession,
          recentUpcoming: upcomingSessions,
        },
        homework: {
          pending: pendingHomework,
          completed: completedHomework,
          recent: recentHomework,
        },
        quran: {
          lastSurah: quranProgress?.lastSurah || 1,
          lastAyah: quranProgress?.lastAyah || 1,
          memorizedSurahs: memorizedCount,
        },
        subscription: {
          status: subscriptionStatus,
          plan: subscriptionPlan,
        },
      });
    } catch (error) {
      console.error("Error fetching student dashboard:", error);
      res.status(500).json({ message: "خطأ في جلب بيانات لوحة الطالب" });
    }
  });

  // ==================== Teacher Dashboard Stats (aggregated) ====================
  app.get('/api/teacher/dashboard', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;

      // Get students assigned to this teacher
      let students: any[] = [];
      try {
        const allStudents = await storage.getAllStudents();
        students = allStudents.filter((s: any) => s.supervisorId === userId || s.teacherId === userId);
        if (students.length === 0) students = allStudents.slice(0, 20);
      } catch (_) {}

      const activeStudents = students.filter((s: any) => s.isActive);
      const paidStudents = students.filter((s: any) => s.isPaid);

      // Today's sessions
      let todaySessions = 0;
      let upcomingSessions: any[] = [];
      try {
        const liveRooms = await storage.getAllLiveRooms();
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        todaySessions = liveRooms.filter((r: any) => {
          const d = r.sessionDate instanceof Date ? r.sessionDate.toISOString().split('T')[0] : String(r.sessionDate || '').split('T')[0];
          return d === todayStr;
        }).length;
        upcomingSessions = liveRooms
          .filter((r: any) => {
            const d = r.sessionDate instanceof Date ? r.sessionDate.toISOString().split('T')[0] : String(r.sessionDate || '').split('T')[0];
            return d >= todayStr;
          })
          .slice(0, 5);
      } catch (_) {}

      // Pending homework count
      let pendingHomework = 0;
      try {
        const hw = await storage.getHomeworksByTeacher(userId);
        pendingHomework = hw.filter((h: any) => {
          const due = h.dueDate ? new Date(h.dueDate) : null;
          return !due || due >= new Date();
        }).length;
      } catch (_) {}

      res.json({
        students: {
          total: students.length,
          active: activeStudents.length,
          paid: paidStudents.length,
        },
        sessions: {
          today: todaySessions,
          upcoming: upcomingSessions,
        },
        homework: {
          pending: pendingHomework,
        },
      });
    } catch (error) {
      console.error("Error fetching teacher dashboard:", error);
      res.status(500).json({ message: "خطأ في جلب بيانات لوحة المعلم" });
    }
  });

  // ==================== User Profile ====================
  app.get('/api/profile', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });

      let studentData = null;
      if (user.role === 'student') {
        let student = await storage.getStudentByUserId(userId);
        if (!student && user.phoneNumber) {
          student = await storage.getStudentByPhone(user.phoneNumber);
        }
        if (student) {
          studentData = {
            id: student.id,
            name: student.studentName,
            level: student.currentLevel,
            isPaid: student.isPaid,
            isActive: student.isActive,
            memorizedSurahs: student.memorizedSurahs,
            phoneNumber: student.phoneNumber,
          };
        }
      }

      res.json({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        age: (user as any).age,
        preferredTime: (user as any).preferredTime,
        registrationCompleted: user.registrationCompleted,
        student: studentData,
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: 'خطأ في جلب الملف الشخصي' });
    }
  });

  const profileUpdateSchema = z.object({
    firstName: z.string().min(2).optional(),
    lastName: z.string().min(2).optional(),
    email: z.string().email().optional().or(z.literal('')),
    age: z.number().min(5).max(100).optional(),
    preferredTime: z.string().optional(),
  });

  app.patch('/api/profile', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const data = profileUpdateSchema.parse(req.body);
      const updated = await storage.updateUserProfile(userId, data as any);
      res.json({ message: 'تم تحديث الملف الشخصي', user: updated });
    } catch (error: any) {
      if (error?.name === 'ZodError') {
        return res.status(400).json({ message: 'بيانات غير صالحة', errors: error.errors });
      }
      console.error("Error updating profile:", error);
      res.status(500).json({ message: 'خطأ في تحديث الملف الشخصي' });
    }
  });
}