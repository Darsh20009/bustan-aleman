import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertCourseSchema,
  insertInstructorSchema,
  insertEnrollmentSchema,
  insertContactMessageSchema,
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

      res.json({ message: "Sample data created successfully" });
    } catch (error) {
      console.error("Error seeding data:", error);
      res.status(500).json({ message: "Failed to seed data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
