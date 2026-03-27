import type { Request, Response, NextFunction, RequestHandler } from "express";

// Define user roles type - 4 main roles: student, sheikh, director, admin
export type UserRole = 'student' | 'teacher' | 'supervisor' | 'sheikh' | 'director' | 'admin' | 'owner';

// Extend session interface
declare module 'express-session' {
  interface SessionData {
    userId?: string;
    userRole?: UserRole;
    studentId?: string;
  }
}

// Extend Express Request to include user
declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string;
      role: UserRole;
      studentId?: string;
    };
  }
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
    studentId?: string;
  };
}

/**
 * Middleware to check if user is authenticated
 */
export const requireAuth: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const userId = req.session?.userId;
  const userRole = req.session?.userRole;
  
  if (!userId || !userRole) {
    return res.status(401).json({ 
      message: "يجب تسجيل الدخول للوصول لهذه الصفحة" 
    });
  }
  
  // Attach user info to request
  (req as AuthenticatedRequest).user = {
    id: userId,
    role: userRole,
    studentId: req.session?.studentId,
  };
  
  next();
};

/**
 * Middleware to check if user has required role
 */
export const requireRole = (roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: "يجب تسجيل الدخول أولاً" 
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: "غير مخول للوصول لهذه الصفحة" 
      });
    }
    
    next();
  };
};

/**
 * Middleware to check if user is a student
 */
export const requireStudent = requireRole(['student']);

/**
 * Middleware to check if user is a sheikh (teacher/supervisor)
 */
export const requireSheikh = requireRole(['teacher', 'supervisor', 'sheikh']);
export const requireSupervisor = requireSheikh;
export const requireTeacher = requireSheikh;
export const requireOwner = requireRole(['owner', 'admin', 'director']);

/**
 * Middleware to check if user is a director
 */
export const requireDirector = requireRole(['director', 'owner']);

/**
 * Middleware to check if user is an admin
 */
export const requireAdmin = requireRole(['admin']);

/**
 * Middleware to check if user is sheikh or admin (supervisor or admin)
 */
export const requireSupervisorOrAdmin = requireRole(['teacher', 'supervisor', 'sheikh', 'director', 'admin', 'owner']);

/**
 * Middleware to check if user is teacher/sheikh or higher
 */
export const requireTeacherOrHigher = requireRole(['teacher', 'supervisor', 'sheikh', 'director', 'admin', 'owner']);

/**
 * Middleware to check if user is director or admin
 */
export const requireDirectorOrAdmin = requireRole(['director', 'admin', 'owner']);

/**
 * Middleware to check if user is admin or owner
 */
export const requireAdminOrOwner = requireRole(['admin', 'owner']);