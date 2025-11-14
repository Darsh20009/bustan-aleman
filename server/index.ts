import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import session from 'express-session';
import { registerRoutes } from "./routes";
import { setupJSONRoutes } from "./jsonRoutes";
import { setupAuthRoutes } from "./authRoutes";
import { setupAdditionalRoutes } from "./additionalRoutes";
import { setupVite, serveStatic, log } from "./vite";
import { migratePasswords } from "./passwordMigration";
import { initializeTelegramBot } from "./telegramBot";
import { wsService } from "./websocket";
import { initializeDatabase } from "./db";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configure sessions
app.use(session({
  secret: process.env.SESSION_SECRET || 'bustan-al-iman-secret-key-2025',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  const method = req.method;
  const userId = (req.session as any)?.userId;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${method} ${path} ${res.statusCode} in ${duration}ms`;
      
      if (userId) {
        logLine += ` [user:${userId.slice(0, 8)}]`;
      }
      
      if (duration > 1000) {
        logLine += ` ⚠️ SLOW`;
      }
      
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 120) {
        logLine = logLine.slice(0, 119) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Initialize database connection first (AWS RDS or local)
    await initializeDatabase();
    console.log("✅ Database connection initialized");
    
    // Run password migration on startup
    await migratePasswords();
    console.log("✅ Password migration completed");
    
    // Note: Pre-registered users are now initialized in routes.ts using phone auth
    
    // Initialize Telegram Bot
    initializeTelegramBot();
    console.log("✅ Telegram bot initialized");
    
    // Setup authentication routes (universal auth system)
    setupAuthRoutes(app);
    console.log("✅ Auth routes setup");
    
    // Setup additional routes (student progress, supervisor management, certificates)
    setupAdditionalRoutes(app);
    console.log("✅ Additional routes setup");
    
    // Setup JSON routes (legacy student system)
    setupJSONRoutes(app);
    console.log("✅ JSON routes setup");
    
    // Setup Sheikh routes (session management, assignments)
    const { setupSheikhRoutes } = await import("./sheikhRoutes");
    setupSheikhRoutes(app);
    console.log("✅ Sheikh routes setup");
    
    // Setup Student Session routes (my sessions page)
    const { setupStudentSessionRoutes } = await import("./studentSessionRoutes");
    setupStudentSessionRoutes(app);
    console.log("✅ Student session routes setup");
    
    // Setup Surah routes (surah list API)
    const { setupSurahRoutes } = await import("./surahRoutes");
    setupSurahRoutes(app);
    console.log("✅ Surah routes setup");
    
    // Setup Course routes (enrollments, quizzes, certificates)
    const { setupCourseRoutes } = await import("./courseRoutes");
    setupCourseRoutes(app);
    console.log("✅ Course routes setup");
    
    console.log("🔄 Starting registerRoutes...");
    const server = await registerRoutes(app);
    console.log("✅ Routes registered");
  
    // Initialize WebSocket server
    wsService.initialize(server);
    console.log("✅ WebSocket initialized");
    
    // جدولة تنظيف الحصص المنتهية كل ساعة
    const { storage } = await import("./storage");
    setInterval(async () => {
      try {
        await storage.cleanupExpiredSessions();
      } catch (error) {
        console.error('❌ خطأ في تنظيف الحصص المنتهية:', error);
      }
    }, 60 * 60 * 1000); // كل ساعة
    
    // تنفيذ تنظيف فوري عند بدء السيرفر
    setTimeout(async () => {
      try {
        await storage.cleanupExpiredSessions();
        console.log("✅ تم تنظيف الحصص المنتهية");
      } catch (error) {
        console.error('❌ خطأ في تنظيف الحصص المنتهية:', error);
      }
    }, 5000); // بعد 5 ثواني من بدء السيرفر

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      throw err;
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      await setupVite(app, server);
      console.log("✅ Vite setup completed");
    } else {
      serveStatic(app);
      console.log("✅ Static files serving");
    }

    // ALWAYS serve the app on the port specified in the environment variable PORT
    // Other ports are firewalled. Default to 5000 if not specified.
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = parseInt(process.env.PORT || '5000', 10);
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`serving on port ${port}`);
    });
  } catch (error) {
    console.error("❌ Fatal error during server startup:", error);
    process.exit(1);
  }
})();
