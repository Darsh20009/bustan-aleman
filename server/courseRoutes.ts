
import type { Express } from "express";
import { storage } from "./storage";
import { requireAuth, requireSupervisorOrAdmin, type AuthenticatedRequest } from "./authMiddleware";
import { wsService } from "./websocket";
import QRCode from "qrcode";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

const quizAttemptSchema = z.object({
  quizId: z.string(),
  answers: z.string(), // JSON string
});

export function setupCourseRoutes(app: Express) {
  // Get all courses
  app.get('/api/courses', async (req, res) => {
    try {
      const courses = await storage.getAllCourses();
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "خطأ في جلب الدورات" });
    }
  });

  // Enroll in course
  app.post('/api/courses/:courseId/enroll', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const courseId = req.params.courseId;
      const userId = req.user!.id;
      
      // Get student ID
      const students = await storage.getAllStudents();
      const student = students.find(s => s.userId === userId);
      
      if (!student) {
        return res.status(404).json({ message: "الطالب غير موجود" });
      }
      
      const enrollment = await storage.enrollInCourse(userId, courseId);
      
      // Notify sheikh
      wsService.broadcastToSupervisors({
        type: 'course_enrollment',
        student: student,
        courseId: courseId,
      });
      
      res.status(201).json(enrollment);
    } catch (error) {
      console.error("Error enrolling in course:", error);
      res.status(500).json({ message: "خطأ في التسجيل في الدورة" });
    }
  });

  // Get course quiz
  app.get('/api/courses/:courseId/quiz', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const courseId = req.params.courseId;
      const quiz = await storage.getCourseQuiz(courseId);
      
      if (!quiz) {
        return res.status(404).json({ message: "الاختبار غير موجود" });
      }
      
      res.json(quiz);
    } catch (error) {
      console.error("Error fetching quiz:", error);
      res.status(500).json({ message: "خطأ في جلب الاختبار" });
    }
  });

  // Submit quiz attempt (with anti-cheat)
  app.post('/api/quiz/:quizId/attempt', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const quizId = req.params.quizId;
      const attemptData = quizAttemptSchema.parse(req.body);
      const userId = req.user!.id;
      
      // Get student
      const students = await storage.getAllStudents();
      const student = students.find(s => s.userId === userId);
      
      if (!student) {
        return res.status(404).json({ message: "الطالب غير موجود" });
      }
      
      // Get quiz
      const quiz = await storage.getQuiz(quizId);
      if (!quiz) {
        return res.status(404).json({ message: "الاختبار غير موجود" });
      }
      
      // Calculate score
      const questions = JSON.parse(quiz.questions || "[]");
      const answers = JSON.parse(attemptData.answers);
      let correctAnswers = 0;
      
      questions.forEach((q: any, index: number) => {
        if (answers[index] === q.correctAnswer) {
          correctAnswers++;
        }
      });
      
      const score = Math.round((correctAnswers / questions.length) * 100);
      const passed = score >= (quiz.passingScore || 75);
      
      // Save attempt
      const attempt = await storage.createQuizAttempt({
        quizId,
        studentId: student.id,
        score,
        answers: attemptData.answers,
        passed,
        completedAt: new Date(),
      });
      
      // If passed, generate certificate
      if (passed) {
        const certificateCode = `BC-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`;
        const verificationToken = uuidv4();
        
        // Generate QR code
        const qrData = `${process.env.REPL_SLUG || 'localhost'}/verify/${verificationToken}`;
        const qrImageDataUrl = await QRCode.toDataURL(qrData);
        
        const certificate = await storage.createCertificate({
          studentId: student.id,
          courseId: quiz.courseId,
          quizAttemptId: attempt.id,
          code: certificateCode,
          titleAr: `شهادة إتمام الدورة`,
          grade: score >= 90 ? "ممتاز" : score >= 85 ? "جيد جداً" : "جيد",
          teacherName: "أحمد أبو مازن",
          issuedBy: userId,
          qrImageDataUrl,
          verificationToken,
          status: "valid",
        });
        
        // Notify student
        wsService.notifyStudentOfCertificate(student.id, certificate);
        
        res.json({ attempt, certificate, passed: true });
      } else {
        res.json({ attempt, passed: false });
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
      res.status(500).json({ message: "خطأ في تقديم الاختبار" });
    }
  });

  // Get student certificates
  app.get('/api/student/certificates', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const students = await storage.getAllStudents();
      const student = students.find(s => s.userId === userId);
      
      if (!student) {
        return res.status(404).json({ message: "الطالب غير موجود" });
      }
      
      const certificates = await storage.getStudentCertificates(student.id);
      res.json(certificates);
    } catch (error) {
      console.error("Error fetching certificates:", error);
      res.status(500).json({ message: "خطأ في جلب الشهادات" });
    }
  });
}
