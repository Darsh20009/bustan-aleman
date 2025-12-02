import type { Express } from "express";
import { storage } from "./storage";
import { isPhoneAuthenticated } from "./phoneAuth";
import {
  insertHalaqaSchema,
  insertHalaqaMemberSchema,
  insertHalaqaScheduleSchema,
  insertHalaqaAttendanceSchema,
} from "@shared/schema";

async function canManageHalaqa(
  halaqaId: string,
  userId: string,
  role: string
): Promise<boolean> {
  if (role === "admin" || role === "owner" || role === "supervisor") {
    return true;
  }
  if (role === "teacher") {
    const halaqa = await storage.getHalaqa(halaqaId);
    return halaqa?.teacherId === userId;
  }
  return false;
}

export function setupHalaqaRoutes(app: Express) {
  app.get("/api/halaqat", isPhoneAuthenticated, async (req: any, res) => {
    try {
      const role = req.session.userRole;
      const userId = req.session.userId;

      let halaqatList;
      if (role === "teacher") {
        halaqatList = await storage.getTeacherHalaqat(userId);
      } else if (role === "admin" || role === "supervisor" || role === "owner") {
        halaqatList = await storage.getHalaqat();
      } else {
        const memberships = await storage.getStudentHalaqat(userId);
        halaqatList = await Promise.all(
          memberships.map((m) => storage.getHalaqa(m.halaqaId))
        );
        halaqatList = halaqatList.filter(Boolean);
      }

      res.json(halaqatList);
    } catch (error) {
      console.error("Error fetching halaqat:", error);
      res.status(500).json({ message: "فشل في جلب الحلقات" });
    }
  });

  app.get("/api/halaqat/active", isPhoneAuthenticated, async (req: any, res) => {
    try {
      const halaqatList = await storage.getActiveHalaqat();
      res.json(halaqatList);
    } catch (error) {
      console.error("Error fetching active halaqat:", error);
      res.status(500).json({ message: "فشل في جلب الحلقات النشطة" });
    }
  });

  app.get("/api/halaqat/:id", isPhoneAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const halaqa = await storage.getHalaqa(id);
      if (!halaqa) {
        return res.status(404).json({ message: "الحلقة غير موجودة" });
      }
      res.json(halaqa);
    } catch (error) {
      console.error("Error fetching halaqa:", error);
      res.status(500).json({ message: "فشل في جلب الحلقة" });
    }
  });

  app.post("/api/halaqat", isPhoneAuthenticated, async (req: any, res) => {
    try {
      const role = req.session.userRole;
      if (role !== "admin" && role !== "owner" && role !== "supervisor") {
        return res.status(403).json({ message: "ليس لديك صلاحية إنشاء حلقة" });
      }

      const parsed = insertHalaqaSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          message: "بيانات غير صالحة",
          errors: parsed.error.errors,
        });
      }

      const halaqa = await storage.createHalaqa(parsed.data);
      res.status(201).json(halaqa);
    } catch (error) {
      console.error("Error creating halaqa:", error);
      res.status(500).json({ message: "فشل في إنشاء الحلقة" });
    }
  });

  app.patch("/api/halaqat/:id", isPhoneAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const role = req.session.userRole;
      const userId = req.session.userId;

      if (!(await canManageHalaqa(id, userId, role))) {
        return res.status(403).json({ message: "ليس لديك صلاحية تعديل هذه الحلقة" });
      }

      const updated = await storage.updateHalaqa(id, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating halaqa:", error);
      res.status(500).json({ message: "فشل في تحديث الحلقة" });
    }
  });

  app.delete("/api/halaqat/:id", isPhoneAuthenticated, async (req: any, res) => {
    try {
      const role = req.session.userRole;
      if (role !== "admin" && role !== "owner") {
        return res.status(403).json({ message: "ليس لديك صلاحية حذف الحلقة" });
      }

      const { id } = req.params;
      await storage.deleteHalaqa(id);
      res.json({ message: "تم حذف الحلقة بنجاح" });
    } catch (error) {
      console.error("Error deleting halaqa:", error);
      res.status(500).json({ message: "فشل في حذف الحلقة" });
    }
  });

  app.get("/api/halaqat/:id/members", isPhoneAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const members = await storage.getHalaqaMembers(id);
      res.json(members);
    } catch (error) {
      console.error("Error fetching halaqa members:", error);
      res.status(500).json({ message: "فشل في جلب أعضاء الحلقة" });
    }
  });

  app.post("/api/halaqat/:id/members", isPhoneAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const role = req.session.userRole;
      const userId = req.session.userId;

      if (!(await canManageHalaqa(id, userId, role))) {
        return res.status(403).json({ message: "ليس لديك صلاحية إضافة طلاب لهذه الحلقة" });
      }

      const parsed = insertHalaqaMemberSchema.safeParse({
        ...req.body,
        halaqaId: id,
      });

      if (!parsed.success) {
        return res.status(400).json({
          message: "بيانات غير صالحة",
          errors: parsed.error.errors,
        });
      }

      const member = await storage.addHalaqaMember(parsed.data);
      res.status(201).json(member);
    } catch (error) {
      console.error("Error adding halaqa member:", error);
      res.status(500).json({ message: "فشل في إضافة الطالب للحلقة" });
    }
  });

  app.delete(
    "/api/halaqat/:halaqaId/members/:studentId",
    isPhoneAuthenticated,
    async (req: any, res) => {
      try {
        const { halaqaId, studentId } = req.params;
        const role = req.session.userRole;
        const userId = req.session.userId;

        if (!(await canManageHalaqa(halaqaId, userId, role))) {
          return res.status(403).json({ message: "ليس لديك صلاحية إزالة طلاب من هذه الحلقة" });
        }

        await storage.removeHalaqaMember(halaqaId, studentId);
        res.json({ message: "تم إزالة الطالب من الحلقة" });
      } catch (error) {
        console.error("Error removing halaqa member:", error);
        res.status(500).json({ message: "فشل في إزالة الطالب من الحلقة" });
      }
    }
  );

  app.get("/api/halaqat/:id/schedules", isPhoneAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const schedules = await storage.getHalaqaSchedules(id);
      res.json(schedules);
    } catch (error) {
      console.error("Error fetching halaqa schedules:", error);
      res.status(500).json({ message: "فشل في جلب جداول الحلقة" });
    }
  });

  app.post("/api/halaqat/:id/schedules", isPhoneAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const role = req.session.userRole;
      const userId = req.session.userId;

      if (!(await canManageHalaqa(id, userId, role))) {
        return res.status(403).json({ message: "ليس لديك صلاحية إنشاء جدول لهذه الحلقة" });
      }

      const parsed = insertHalaqaScheduleSchema.safeParse({
        ...req.body,
        halaqaId: id,
      });

      if (!parsed.success) {
        return res.status(400).json({
          message: "بيانات غير صالحة",
          errors: parsed.error.errors,
        });
      }

      const schedule = await storage.createHalaqaSchedule(parsed.data);
      res.status(201).json(schedule);
    } catch (error) {
      console.error("Error creating halaqa schedule:", error);
      res.status(500).json({ message: "فشل في إنشاء الجدول" });
    }
  });

  app.patch(
    "/api/halaqat/:halaqaId/schedules/:id",
    isPhoneAuthenticated,
    async (req: any, res) => {
      try {
        const { halaqaId, id } = req.params;
        const role = req.session.userRole;
        const userId = req.session.userId;

        if (!(await canManageHalaqa(halaqaId, userId, role))) {
          return res.status(403).json({ message: "ليس لديك صلاحية تعديل الجدول" });
        }

        const updated = await storage.updateHalaqaSchedule(id, req.body);
        res.json(updated);
      } catch (error) {
        console.error("Error updating halaqa schedule:", error);
        res.status(500).json({ message: "فشل في تحديث الجدول" });
      }
    }
  );

  app.delete(
    "/api/halaqat/:halaqaId/schedules/:id",
    isPhoneAuthenticated,
    async (req: any, res) => {
      try {
        const { halaqaId, id } = req.params;
        const role = req.session.userRole;
        const userId = req.session.userId;

        if (!(await canManageHalaqa(halaqaId, userId, role))) {
          return res.status(403).json({ message: "ليس لديك صلاحية حذف الجدول" });
        }

        await storage.deleteHalaqaSchedule(id);
        res.json({ message: "تم حذف الجدول بنجاح" });
      } catch (error) {
        console.error("Error deleting halaqa schedule:", error);
        res.status(500).json({ message: "فشل في حذف الجدول" });
      }
    }
  );

  app.get(
    "/api/halaqat/:id/attendance",
    isPhoneAuthenticated,
    async (req: any, res) => {
      try {
        const { id } = req.params;
        const { date } = req.query;
        const attendance = await storage.getHalaqaAttendance(id, date as string);
        res.json(attendance);
      } catch (error) {
        console.error("Error fetching halaqa attendance:", error);
        res.status(500).json({ message: "فشل في جلب سجل الحضور" });
      }
    }
  );

  app.post(
    "/api/halaqat/:id/attendance",
    isPhoneAuthenticated,
    async (req: any, res) => {
      try {
        const { id } = req.params;
        const role = req.session.userRole;
        const userId = req.session.userId;

        if (!(await canManageHalaqa(id, userId, role))) {
          return res.status(403).json({ message: "ليس لديك صلاحية تسجيل الحضور لهذه الحلقة" });
        }

        const parsed = insertHalaqaAttendanceSchema.safeParse({
          ...req.body,
          halaqaId: id,
          recordedBy: userId,
        });

        if (!parsed.success) {
          return res.status(400).json({
            message: "بيانات غير صالحة",
            errors: parsed.error.errors,
          });
        }

        const attendance = await storage.recordHalaqaAttendance(parsed.data);
        res.status(201).json(attendance);
      } catch (error) {
        console.error("Error recording halaqa attendance:", error);
        res.status(500).json({ message: "فشل في تسجيل الحضور" });
      }
    }
  );

  app.post(
    "/api/halaqat/:id/attendance/bulk",
    isPhoneAuthenticated,
    async (req: any, res) => {
      try {
        const { id } = req.params;
        const role = req.session.userRole;
        const userId = req.session.userId;

        if (!(await canManageHalaqa(id, userId, role))) {
          return res.status(403).json({ message: "ليس لديك صلاحية تسجيل الحضور لهذه الحلقة" });
        }

        const { sessionDate, attendanceRecords } = req.body;

        if (!Array.isArray(attendanceRecords)) {
          return res.status(400).json({ message: "بيانات غير صالحة" });
        }

        const results = await Promise.all(
          attendanceRecords.map((record: any) =>
            storage.recordHalaqaAttendance({
              halaqaId: id,
              studentId: record.studentId,
              sessionDate,
              attended: record.attended,
              excuseReason: record.excuseReason,
              notes: record.notes,
              recordedBy: userId,
            })
          )
        );

        res.status(201).json(results);
      } catch (error) {
        console.error("Error bulk recording attendance:", error);
        res.status(500).json({ message: "فشل في تسجيل الحضور" });
      }
    }
  );

  app.get(
    "/api/students/:studentId/attendance",
    isPhoneAuthenticated,
    async (req: any, res) => {
      try {
        const { studentId } = req.params;
        const attendance = await storage.getStudentHalaqaAttendance(studentId);
        res.json(attendance);
      } catch (error) {
        console.error("Error fetching student attendance:", error);
        res.status(500).json({ message: "فشل في جلب سجل حضور الطالب" });
      }
    }
  );

  console.log("✅ Halaqa routes setup");
}
