import { Express, Request, Response } from 'express';
import { storage } from './storage';
import { requireAuth, requireTeacherOrHigher, AuthenticatedRequest } from './authMiddleware';
import {
  insertHomeworkSchema,
  insertHomeworkSubmissionSchema,
  insertStudentEvaluationSchema,
  insertParentReportSchema,
} from '@shared/schema';

export function setupHomeworkRoutes(app: Express) {
  // ==================== Homework Management ====================

  // Get all homeworks (for teachers - their own, for students - assigned to them)
  app.get('/api/homeworks', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user!;
      let homeworks;

      if (['teacher', 'supervisor', 'admin', 'owner'].includes(user.role)) {
        // Teachers see all homeworks they created
        homeworks = await storage.getHomeworksByTeacher(user.id);
      } else {
        // Students see homeworks assigned to them
        homeworks = await storage.getHomeworksForStudent(user.id);
      }

      res.json(homeworks);
    } catch (error) {
      console.error("Error fetching homeworks:", error);
      res.status(500).json({ message: "خطأ في جلب الواجبات" });
    }
  });

  // Get homework by ID
  app.get('/api/homeworks/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const homework = await storage.getHomework(req.params.id);
      if (!homework) {
        return res.status(404).json({ message: "الواجب غير موجود" });
      }
      res.json(homework);
    } catch (error) {
      console.error("Error fetching homework:", error);
      res.status(500).json({ message: "خطأ في جلب الواجب" });
    }
  });

  // Create homework (teachers only)
  app.post('/api/homeworks', requireAuth, requireTeacherOrHigher, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const parsed = insertHomeworkSchema.safeParse({
        ...req.body,
        createdBy: req.user!.id,
      });

      if (!parsed.success) {
        return res.status(400).json({ message: "بيانات غير صحيحة", errors: parsed.error.errors });
      }

      const homework = await storage.createHomework(parsed.data);
      res.status(201).json(homework);
    } catch (error) {
      console.error("Error creating homework:", error);
      res.status(500).json({ message: "خطأ في إنشاء الواجب" });
    }
  });

  // Update homework (teachers only)
  app.patch('/api/homeworks/:id', requireAuth, requireTeacherOrHigher, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const homework = await storage.getHomework(req.params.id);
      if (!homework) {
        return res.status(404).json({ message: "الواجب غير موجود" });
      }

      // Check ownership
      if (homework.createdBy !== req.user!.id && !['admin', 'owner'].includes(req.user!.role)) {
        return res.status(403).json({ message: "غير مخول لتعديل هذا الواجب" });
      }

      const updated = await storage.updateHomework(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating homework:", error);
      res.status(500).json({ message: "خطأ في تحديث الواجب" });
    }
  });

  // Delete homework (teachers only)
  app.delete('/api/homeworks/:id', requireAuth, requireTeacherOrHigher, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const homework = await storage.getHomework(req.params.id);
      if (!homework) {
        return res.status(404).json({ message: "الواجب غير موجود" });
      }

      // Check ownership
      if (homework.createdBy !== req.user!.id && !['admin', 'owner'].includes(req.user!.role)) {
        return res.status(403).json({ message: "غير مخول لحذف هذا الواجب" });
      }

      await storage.deleteHomework(req.params.id);
      res.json({ message: "تم حذف الواجب بنجاح" });
    } catch (error) {
      console.error("Error deleting homework:", error);
      res.status(500).json({ message: "خطأ في حذف الواجب" });
    }
  });

  // ==================== Homework Submissions ====================

  // Get submissions for a homework (teachers)
  app.get('/api/homeworks/:id/submissions', requireAuth, requireTeacherOrHigher, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const submissions = await storage.getHomeworkSubmissions(req.params.id);
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      res.status(500).json({ message: "خطأ في جلب التسليمات" });
    }
  });

  // Get my submission for a homework (students)
  app.get('/api/homeworks/:id/my-submission', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const submission = await storage.getStudentSubmission(req.params.id, req.user!.id);
      if (!submission) {
        return res.status(404).json({ message: "لم يتم التسليم بعد" });
      }
      res.json(submission);
    } catch (error) {
      console.error("Error fetching submission:", error);
      res.status(500).json({ message: "خطأ في جلب التسليم" });
    }
  });

  // Submit homework (students)
  app.post('/api/homeworks/:id/submit', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const homework = await storage.getHomework(req.params.id);
      if (!homework) {
        return res.status(404).json({ message: "الواجب غير موجود" });
      }

      // Check if already submitted
      const existing = await storage.getStudentSubmission(req.params.id, req.user!.id);
      if (existing && existing.status !== 'pending') {
        return res.status(400).json({ message: "تم تسليم الواجب مسبقاً" });
      }

      // Check if late
      const now = new Date();
      const dueDate = new Date(homework.dueDate);
      const isLate = now > dueDate;

      const parsed = insertHomeworkSubmissionSchema.safeParse({
        homeworkId: req.params.id,
        studentId: req.user!.id,
        ...req.body,
        status: isLate ? 'late' : 'submitted',
        submittedAt: now,
      });

      if (!parsed.success) {
        return res.status(400).json({ message: "بيانات غير صحيحة", errors: parsed.error.errors });
      }

      let submission;
      if (existing) {
        submission = await storage.updateHomeworkSubmission(existing.id, parsed.data);
      } else {
        submission = await storage.createHomeworkSubmission(parsed.data);
      }

      res.status(201).json(submission);
    } catch (error) {
      console.error("Error submitting homework:", error);
      res.status(500).json({ message: "خطأ في تسليم الواجب" });
    }
  });

  // Grade submission (teachers)
  app.patch('/api/submissions/:id/grade', requireAuth, requireTeacherOrHigher, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { grade, teacherFeedbackAr, teacherFeedbackEn } = req.body;

      if (grade === undefined || grade < 0) {
        return res.status(400).json({ message: "الدرجة مطلوبة" });
      }

      const updated = await storage.gradeHomeworkSubmission(req.params.id, {
        grade,
        teacherFeedbackAr,
        teacherFeedbackEn,
        gradedBy: req.user!.id,
        gradedAt: new Date(),
        status: 'graded',
      });

      res.json(updated);
    } catch (error) {
      console.error("Error grading submission:", error);
      res.status(500).json({ message: "خطأ في تقييم الواجب" });
    }
  });

  // ==================== Student Evaluations ====================

  // Get evaluations for a student
  app.get('/api/students/:studentId/evaluations', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user!;
      const studentId = req.params.studentId;

      // Students can only see their own evaluations
      if (user.role === 'student' && user.id !== studentId) {
        return res.status(403).json({ message: "غير مخول لعرض هذه التقييمات" });
      }

      const evaluations = await storage.getStudentEvaluations(studentId);
      res.json(evaluations);
    } catch (error) {
      console.error("Error fetching evaluations:", error);
      res.status(500).json({ message: "خطأ في جلب التقييمات" });
    }
  });

  // Create evaluation (teachers)
  app.post('/api/evaluations', requireAuth, requireTeacherOrHigher, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const parsed = insertStudentEvaluationSchema.safeParse({
        ...req.body,
        teacherId: req.user!.id,
      });

      if (!parsed.success) {
        return res.status(400).json({ message: "بيانات غير صحيحة", errors: parsed.error.errors });
      }

      // Calculate overall score
      const scores = [
        parsed.data.memorizationScore,
        parsed.data.tajweedScore,
        parsed.data.attendanceScore,
        parsed.data.participationScore,
        parsed.data.homeworkScore,
      ].filter((s): s is number => s !== null && s !== undefined);

      const overallScore = scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : undefined;

      const evaluation = await storage.createStudentEvaluation({
        ...parsed.data,
        overallScore,
      });

      res.status(201).json(evaluation);
    } catch (error) {
      console.error("Error creating evaluation:", error);
      res.status(500).json({ message: "خطأ في إنشاء التقييم" });
    }
  });

  // Update evaluation
  app.patch('/api/evaluations/:id', requireAuth, requireTeacherOrHigher, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const updated = await storage.updateStudentEvaluation(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating evaluation:", error);
      res.status(500).json({ message: "خطأ في تحديث التقييم" });
    }
  });

  // ==================== Parent Reports ====================

  // Get reports for a student
  app.get('/api/students/:studentId/parent-reports', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const user = req.user!;
      const studentId = req.params.studentId;

      // Students can only see their own reports
      if (user.role === 'student' && user.id !== studentId) {
        return res.status(403).json({ message: "غير مخول لعرض هذه التقارير" });
      }

      const reports = await storage.getParentReports(studentId);
      res.json(reports);
    } catch (error) {
      console.error("Error fetching parent reports:", error);
      res.status(500).json({ message: "خطأ في جلب التقارير" });
    }
  });

  // Generate weekly report (teachers)
  app.post('/api/students/:studentId/parent-reports', requireAuth, requireTeacherOrHigher, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const studentId = req.params.studentId;

      const parsed = insertParentReportSchema.safeParse({
        ...req.body,
        studentId,
        generatedBy: req.user!.id,
      });

      if (!parsed.success) {
        return res.status(400).json({ message: "بيانات غير صحيحة", errors: parsed.error.errors });
      }

      const report = await storage.createParentReport(parsed.data);
      res.status(201).json(report);
    } catch (error) {
      console.error("Error creating parent report:", error);
      res.status(500).json({ message: "خطأ في إنشاء التقرير" });
    }
  });

  // Mark report as sent
  app.patch('/api/parent-reports/:id/send', requireAuth, requireTeacherOrHigher, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { sentVia } = req.body;

      const updated = await storage.updateParentReport(req.params.id, {
        sentVia,
        sentAt: new Date(),
      });

      res.json(updated);
    } catch (error) {
      console.error("Error updating report:", error);
      res.status(500).json({ message: "خطأ في تحديث التقرير" });
    }
  });

  // ==================== My Homeworks (Student) ====================

  // Get my pending homeworks
  app.get('/api/my-homeworks', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const homeworks = await storage.getHomeworksForStudent(req.user!.id);
      res.json(homeworks);
    } catch (error) {
      console.error("Error fetching my homeworks:", error);
      res.status(500).json({ message: "خطأ في جلب الواجبات" });
    }
  });

  // Get my submissions
  app.get('/api/my-submissions', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const submissions = await storage.getStudentSubmissions(req.user!.id);
      res.json(submissions);
    } catch (error) {
      console.error("Error fetching my submissions:", error);
      res.status(500).json({ message: "خطأ في جلب التسليمات" });
    }
  });

  // Get my evaluations
  app.get('/api/my-evaluations', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const evaluations = await storage.getStudentEvaluations(req.user!.id);
      res.json(evaluations);
    } catch (error) {
      console.error("Error fetching my evaluations:", error);
      res.status(500).json({ message: "خطأ في جلب التقييمات" });
    }
  });

  console.log("✅ Homework routes registered");
}
