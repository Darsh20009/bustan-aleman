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
      
      // Get student progress from quran_progress table
      const progress = await storage.getQuranProgress(userId);
      
      if (!progress) {
        // Create default progress if none exists
        const defaultProgress = {
          studentId: userId,
          lastSurah: 1,
          lastAyah: 1,
          bookmarkedVerses: "[]",
        };
        
        const newProgress = await storage.createQuranProgress(defaultProgress);
        return res.json(newProgress);
      }
      
      res.json(progress);
    } catch (error) {
      console.error("Error fetching student progress:", error);
      res.status(500).json({ message: "خطأ في جلب تقدم الطالب" });
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
}