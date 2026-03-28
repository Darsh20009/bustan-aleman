import bcrypt from "bcrypt";
import { storage } from "./storage";
import type { Express, RequestHandler } from "express";
import session from "express-session";
import preregisteredUsers from "./preregistered-users.json";

export function getPhoneSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const isProduction = process.env.NODE_ENV === 'production';
  
  return session({
    secret: process.env.SESSION_SECRET || "ZkkGjcF7yHW5r+3ca/QIiT+Yz3h/W+aHmpAFspW38Ss=",
    resave: true,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      maxAge: sessionTtl,
      sameSite: isProduction ? 'none' : 'lax',
    },
  });
}

// Initialize pre-registered users in database
export async function initializePreregisteredUsers() {
  try {
    console.log(`🔄 Initializing ${preregisteredUsers.length} pre-registered users...`);
    
    const createdUsers: string[] = [];
    const existingUsers: string[] = [];
    const failedUsers: { name: string; phone: string; error: string }[] = [];
    
    for (const user of preregisteredUsers) {
      try {
        console.log(`🔄 Checking user: ${user.name} (${user.phoneNumber})`);
        // Check if user already exists by phone number
        const existingUser = await storage.getUserByPhone(user.phoneNumber);
        
        if (existingUser) {
          let passwordOk = false;
          if (existingUser.passwordHash) {
            try {
              passwordOk = await bcrypt.compare(user.password, existingUser.passwordHash);
            } catch {}
          }
          if (!passwordOk) {
            const newHash = await bcrypt.hash(user.password, 10);
            await storage.upsertUser({ ...existingUser, passwordHash: newHash });
            console.log(`  🔄 Password re-synced for: ${user.name} (${user.phoneNumber})`);
          } else {
            console.log(`  ✓ User exists (ID: ${existingUser.id})`);
          }
          existingUsers.push(user.phoneNumber);
        } else {
          console.log(`  ✗ User not found, creating...`);
          // Hash password
          const passwordHash = await bcrypt.hash(user.password, 10);
          
          // Create user
          const newUser = await storage.createUserWithPhone({
            firstName: user.name,
            phoneNumber: user.phoneNumber,
            passwordHash,
            role: user.role,
          });
          console.log(`✅ Created pre-registered user: ${user.name} (${user.phoneNumber}) - ID: ${newUser.id}`);
          createdUsers.push(user.phoneNumber);
        }
      } catch (userError: any) {
        const errorMsg = userError?.message || String(userError);
        console.error(`❌ Error processing user ${user.name} (${user.phoneNumber}):`, errorMsg);
        
        // If we're in JSON mode, skip user creation gracefully
        if (errorMsg.includes("not available in JSON mode")) {
          console.log(`⚠️  Skipping user creation in JSON mode: ${user.name} (${user.phoneNumber})`);
          continue;
        }
        
        // Log failure but continue with other users
        failedUsers.push({ name: user.name, phone: user.phoneNumber, error: errorMsg });
      }
    }
    
    console.log(`\n📊 Pre-registered users initialization summary:`);
    console.log(`  ✅ Created: ${createdUsers.length} users`);
    console.log(`  ✓ Existing: ${existingUsers.length} users`);
    console.log(`  ❌ Failed: ${failedUsers.length} users`);
    
    if (failedUsers.length > 0) {
      console.error(`Failed users:`, failedUsers);
    }
    
    if (createdUsers.length > 0 || existingUsers.length > 0) {
      console.log("✅ All pre-registered users initialized successfully");
    } else if (failedUsers.length > 0) {
      console.error("⚠️  No users were created or found - there were only failures");
    }

    if (typeof storage.findOrCreateStudentForUser === 'function') {
      for (const preUser of preregisteredUsers) {
        if (preUser.role === 'student') {
          try {
            const dbUser = await storage.getUserByPhone(preUser.phoneNumber);
            if (dbUser) {
              const student = await storage.findOrCreateStudentForUser(dbUser.id, {
                firstName: preUser.name,
                phoneNumber: preUser.phoneNumber,
                passwordHash: dbUser.passwordHash || preUser.phoneNumber,
              });
              if (student) {
                console.log(`  📝 Student record ensured for: ${preUser.name} (${student.id})`);
              }
            }
          } catch (studentErr: any) {
            console.error(`  ⚠️ Failed to ensure student record for ${preUser.name}:`, studentErr?.message || studentErr);
          }
        }
      }
    }
  } catch (error: any) {
    const errorMsg = error?.message || String(error);
    
    // If we're in JSON mode, just log a warning and continue
    if (errorMsg.includes("not available in JSON mode")) {
      console.log("⚠️  Pre-registered users initialization skipped (JSON mode)");
      return;
    }
    
    console.error("❌ Error initializing pre-registered users:", errorMsg);
    // Don't re-throw - allow server to continue even if user initialization fails
    // This is important for production environments
  }
}

export function setupPhoneAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getPhoneSession());

  // Login with phone number
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { phoneNumber, password } = req.body;

      if (!phoneNumber || !password) {
        return res.status(400).json({ message: "رقم الجوال وكلمة المرور مطلوبة" });
      }

      // Find user by phone number
      const user = await storage.getUserByPhone(phoneNumber);
      
      if (!user || !user.passwordHash) {
        return res.status(401).json({ message: "رقم الجوال أو كلمة المرور غير صحيحة" });
      }

      // Verify password
      const isValid = await bcrypt.compare(password, user.passwordHash);
      
      if (!isValid) {
        return res.status(401).json({ message: "رقم الجوال أو كلمة المرور غير صحيحة" });
      }

      // Set session
      (req.session as any).userId = user.id;
      (req.session as any).userRole = user.role;
      
      // If student, find or create their student record atomically
      let studentId = null;
      if (user.role === 'student') {
        try {
          const student = await storage.findOrCreateStudentForUser(user.id, {
            firstName: user.firstName || undefined,
            phoneNumber: user.phoneNumber || undefined,
            passwordHash: user.passwordHash || undefined,
          });
          
          if (student) {
            studentId = student.id;
          }
        } catch (err) {
          console.error('Error linking student record:', err);
          // Continue with login even if student linking fails
        }
        (req.session as any).studentId = studentId;
      }
      
      // Save session explicitly
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ message: "حدث خطأ أثناء حفظ الجلسة" });
        }
        
        res.json({
          message: "تم تسجيل الدخول بنجاح",
          user: {
            id: user.id,
            firstName: user.firstName,
            phoneNumber: user.phoneNumber,
            role: user.role,
          },
        });
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "حدث خطأ أثناء تسجيل الدخول" });
    }
  });

  // Get current user
  app.get("/api/auth/user", async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      
      if (!userId) {
        return res.status(401).json({ message: "غير مسجل الدخول" });
      }

      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }

      res.json({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        role: user.role,
        profileImageUrl: user.profileImageUrl,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "حدث خطأ أثناء جلب بيانات المستخدم" });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "حدث خطأ أثناء تسجيل الخروج" });
      }
      res.json({ message: "تم تسجيل الخروج بنجاح" });
    });
  });

  // Verify account for password recovery
  app.post("/api/auth/verify-account", async (req, res) => {
    try {
      const { email, phoneNumber } = req.body;

      if (!email || !phoneNumber) {
        return res.status(400).json({ message: "البريد الإلكتروني ورقم الجوال مطلوبان" });
      }

      // Find user by email AND phone number
      const user = await storage.getUser(email) || 
                   (await Promise.resolve(
                     storage.getAllUsers().then((users: any[]) => 
                       users.find((u: any) => u.email === email && u.phoneNumber === phoneNumber)
                     )
                   ));

      // Fallback: search by phone and verify email
      if (!user) {
        const userByPhone = await storage.getUserByPhone(phoneNumber);
        if (!userByPhone || userByPhone.email !== email) {
          return res.status(401).json({ message: "البريد الإلكتروني ورقم الجوال غير متطابقين" });
        }
      } else if (user.phoneNumber !== phoneNumber) {
        return res.status(401).json({ message: "البريد الإلكتروني ورقم الجوال غير متطابقين" });
      }

      const finalUser = user || (await storage.getUserByPhone(phoneNumber));

      if (!finalUser) {
        return res.status(401).json({ message: "المستخدم غير موجود" });
      }

      // Return current password hash (will be displayed to user for reference)
      res.json({
        userId: finalUser.id,
        currentPassword: finalUser.passwordHash || "••••••••",
        message: "تم التحقق بنجاح",
      });
    } catch (error) {
      console.error("Verify account error:", error);
      res.status(500).json({ message: "حدث خطأ أثناء التحقق من الحساب" });
    }
  });

  // Reset password
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { userId, newPassword } = req.body;

      if (!userId || !newPassword) {
        return res.status(400).json({ message: "معرف المستخدم وكلمة المرور الجديدة مطلوبة" });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ message: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" });
      }

      // Get user
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update user password
      await storage.updateUserProfile(userId, { passwordHash: hashedPassword });

      res.json({
        message: "تم تحديث كلمة المرور بنجاح",
      });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ message: "حدث خطأ أثناء تحديث كلمة المرور" });
    }
  });
}

export const isPhoneAuthenticated: RequestHandler = (req, res, next) => {
  const userId = (req.session as any).userId;
  
  if (!userId) {
    return res.status(401).json({ message: "غير مسجل الدخول" });
  }
  
  next();
};

export const isTeacher: RequestHandler = (req, res, next) => {
  const role = (req.session as any).userRole;
  
  if (role !== "supervisor" && role !== "admin") {
    return res.status(403).json({ message: "غير مصرح لك بالوصول" });
  }
  
  next();
};
