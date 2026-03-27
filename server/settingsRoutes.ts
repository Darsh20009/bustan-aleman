import type { Express } from "express";
import { requireAuth, requireDirectorOrAdmin, type AuthenticatedRequest } from "./authMiddleware";
import { storage } from "./storage";
import { emailService } from "./emailService";
import { aiService } from "./aiService";
import { kiroxService } from "./kiroxService";

let systemSettings: Record<string, any> = {
  timezone: 'Asia/Riyadh',
  academyName: 'بستان الإيمان',
  academyNameEn: 'Bustan Al-Iman',
  academyDescription: 'منصة تحفيظ القرآن الكريم والدورات الشرعية',
  contactEmail: '',
  contactPhone: '',
  contactWhatsapp: '',
  paymentMethod: 'bank_transfer',
  bankName: '',
  bankAccountName: '',
  bankAccountNumber: '',
  bankIBAN: '',
  bankLogo: '',
  currency: 'SAR',
  currencySymbol: 'ر.س',
  sessionDuration: 30,
  sessionProvider: 'kirox',
  enableAI: true,
  enableEmailNotifications: true,
  enableRecitationAI: true,
  enableLevelTest: true,
  defaultMemorizationType: 'half_page',
  nearReviewDays: 3,
  farReviewDays: 14,
  maxStudentsPerSheikh: 20,
  autoAbsentMinutes: 15,
};

export function getSystemSettings() {
  return { ...systemSettings };
}

export function getTimezone(): string {
  return systemSettings.timezone || 'Asia/Riyadh';
}

export function formatDateInTimezone(date: Date): string {
  return date.toLocaleString('ar-SA', { timeZone: getTimezone() });
}

export function setupSettingsRoutes(app: Express) {
  app.get('/api/settings', requireAuth, (_req, res) => {
    res.json(systemSettings);
  });

  app.get('/api/settings/public', (_req, res) => {
    res.json({
      timezone: systemSettings.timezone,
      academyName: systemSettings.academyName,
      academyNameEn: systemSettings.academyNameEn,
      academyDescription: systemSettings.academyDescription,
      currency: systemSettings.currency,
      currencySymbol: systemSettings.currencySymbol,
      paymentMethod: systemSettings.paymentMethod,
      bankName: systemSettings.bankName,
      bankLogo: systemSettings.bankLogo,
      sessionProvider: systemSettings.sessionProvider,
      enableAI: systemSettings.enableAI,
      enableRecitationAI: systemSettings.enableRecitationAI,
      enableLevelTest: systemSettings.enableLevelTest,
    });
  });

  app.put('/api/settings', requireAuth, requireDirectorOrAdmin, async (req: any, res) => {
    try {
      const updates = req.body;
      systemSettings = { ...systemSettings, ...updates };
      res.json({ message: 'تم تحديث الإعدادات بنجاح', settings: systemSettings });
    } catch (error: any) {
      res.status(500).json({ message: 'خطأ في تحديث الإعدادات' });
    }
  });

  app.get('/api/settings/services-status', requireAuth, requireDirectorOrAdmin, (_req, res) => {
    res.json({
      email: emailService.isConfigured(),
      ai: aiService.isConfigured(),
      kirox: kiroxService.isConfigured(),
      timezone: systemSettings.timezone,
    });
  });

  app.get('/api/settings/timezone', (_req, res) => {
    res.json({ timezone: systemSettings.timezone });
  });

  app.get('/api/time/now', (_req, res) => {
    const now = new Date();
    res.json({
      utc: now.toISOString(),
      local: formatDateInTimezone(now),
      timezone: systemSettings.timezone,
    });
  });

  console.log("✅ Settings routes setup");
}
