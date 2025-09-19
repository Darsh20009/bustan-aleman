import type { Request, Response, NextFunction } from "express";

// Extend session interface
declare module 'express-session' {
  interface SessionData {
    userId: string;
    userRole: 'student' | 'supervisor' | 'admin';
    studentId?: string;
  }
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: 'student' | 'supervisor' | 'admin';
    studentId?: string;
  };
}

/**
 * Middleware to check if user is authenticated
 */
export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const userId = req.session?.userId;
  const userRole = req.session?.userRole;
  
  if (!userId || !userRole) {
    return res.status(401).json({ 
      message: "يجب تسجيل الدخول للوصول لهذه الصفحة" 
    });
  }
  
  // Attach user info to request
  req.user = {
    id: userId,
    role: userRole,
    studentId: req.session?.studentId,
  };
  
  next();
};

/**
 * Middleware to check if user has required role
 */
export const requireRole = (roles: ('student' | 'supervisor' | 'admin')[]) => {
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
 * Middleware to check if user is a supervisor
 */
export const requireSupervisor = requireRole(['supervisor']);

/**
 * Middleware to check if user is an admin
 */
export const requireAdmin = requireRole(['admin']);

/**
 * Middleware to check if user is supervisor or admin
 */
export const requireSupervisorOrAdmin = requireRole(['supervisor', 'admin']);