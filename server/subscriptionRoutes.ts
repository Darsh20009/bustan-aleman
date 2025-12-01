import type { Express } from "express";
import { storage } from "./storage";
import { requireAuth, requireAdminOrOwner, requireTeacherOrHigher, type AuthenticatedRequest } from "./authMiddleware";
import {
  insertSubscriptionPlanSchema,
  insertSubscriptionSchema,
  insertPaymentTransactionSchema,
  insertPaymentGatewaySettingsSchema,
} from "@shared/schema";

export function setupSubscriptionRoutes(app: Express) {
  // ==================== Subscription Plans ====================
  
  // Get all subscription plans (public)
  app.get('/api/subscription-plans', async (req, res) => {
    try {
      const plans = await storage.getSubscriptionPlans();
      res.json(plans);
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      res.status(500).json({ message: "خطأ في جلب خطط الاشتراك" });
    }
  });

  // Get active subscription plans (public)
  app.get('/api/subscription-plans/active', async (req, res) => {
    try {
      const plans = await storage.getActiveSubscriptionPlans();
      res.json(plans);
    } catch (error) {
      console.error("Error fetching active subscription plans:", error);
      res.status(500).json({ message: "خطأ في جلب خطط الاشتراك" });
    }
  });

  // Get subscription plan by ID (public)
  app.get('/api/subscription-plans/:id', async (req, res) => {
    try {
      const plan = await storage.getSubscriptionPlan(req.params.id);
      if (!plan) {
        return res.status(404).json({ message: "خطة الاشتراك غير موجودة" });
      }
      res.json(plan);
    } catch (error) {
      console.error("Error fetching subscription plan:", error);
      res.status(500).json({ message: "خطأ في جلب خطة الاشتراك" });
    }
  });

  // Create subscription plan (admin/owner only)
  app.post('/api/subscription-plans', requireAuth, requireAdminOrOwner, async (req: AuthenticatedRequest, res) => {
    try {
      const parsed = insertSubscriptionPlanSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "بيانات غير صحيحة", errors: parsed.error.errors });
      }
      const plan = await storage.createSubscriptionPlan(parsed.data);
      res.status(201).json(plan);
    } catch (error) {
      console.error("Error creating subscription plan:", error);
      res.status(500).json({ message: "خطأ في إنشاء خطة الاشتراك" });
    }
  });

  // Update subscription plan (admin/owner only)
  app.patch('/api/subscription-plans/:id', requireAuth, requireAdminOrOwner, async (req: AuthenticatedRequest, res) => {
    try {
      const plan = await storage.updateSubscriptionPlan(req.params.id, req.body);
      res.json(plan);
    } catch (error) {
      console.error("Error updating subscription plan:", error);
      res.status(500).json({ message: "خطأ في تحديث خطة الاشتراك" });
    }
  });

  // Delete subscription plan (admin/owner only)
  app.delete('/api/subscription-plans/:id', requireAuth, requireAdminOrOwner, async (req: AuthenticatedRequest, res) => {
    try {
      await storage.deleteSubscriptionPlan(req.params.id);
      res.json({ message: "تم حذف خطة الاشتراك بنجاح" });
    } catch (error) {
      console.error("Error deleting subscription plan:", error);
      res.status(500).json({ message: "خطأ في حذف خطة الاشتراك" });
    }
  });

  // ==================== User Subscriptions ====================

  // Get current user's subscription
  app.get('/api/my-subscription', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const subscription = await storage.getUserActiveSubscription(userId);
      res.json(subscription || null);
    } catch (error) {
      console.error("Error fetching user subscription:", error);
      res.status(500).json({ message: "خطأ في جلب الاشتراك" });
    }
  });

  // Get user's subscription history
  app.get('/api/my-subscriptions', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const subscriptions = await storage.getUserSubscriptions(userId);
      res.json(subscriptions);
    } catch (error) {
      console.error("Error fetching user subscriptions:", error);
      res.status(500).json({ message: "خطأ في جلب سجل الاشتراكات" });
    }
  });

  // Subscribe to a plan
  app.post('/api/subscribe/:planId', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const planId = req.params.planId;
      const { paymentGateway, autoRenew } = req.body;

      // Check if plan exists
      const plan = await storage.getSubscriptionPlan(planId);
      if (!plan) {
        return res.status(404).json({ message: "خطة الاشتراك غير موجودة" });
      }

      // Check if user already has an active subscription
      const existingSubscription = await storage.getUserActiveSubscription(userId);
      if (existingSubscription) {
        return res.status(400).json({ message: "لديك اشتراك فعال بالفعل" });
      }

      // Create subscription
      const subscription = await storage.createSubscription({
        userId,
        planId,
        status: 'pending',
        autoRenew: autoRenew || false,
        paymentGateway: paymentGateway || 'stripe',
        sessionsRemaining: plan.sessionsCount || null,
      });

      res.status(201).json(subscription);
    } catch (error) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ message: "خطأ في إنشاء الاشتراك" });
    }
  });

  // Cancel subscription
  app.post('/api/subscriptions/:id/cancel', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const subscriptionId = req.params.id;
      const { reason } = req.body;

      const subscription = await storage.getSubscription(subscriptionId);
      if (!subscription || subscription.userId !== userId) {
        return res.status(404).json({ message: "الاشتراك غير موجود" });
      }

      const updated = await storage.cancelSubscription(subscriptionId, reason);
      res.json(updated);
    } catch (error) {
      console.error("Error canceling subscription:", error);
      res.status(500).json({ message: "خطأ في إلغاء الاشتراك" });
    }
  });

  // Get all subscriptions (admin/owner only)
  app.get('/api/admin/subscriptions', requireAuth, requireAdminOrOwner, async (req: AuthenticatedRequest, res) => {
    try {
      const { status, page = 1, limit = 20 } = req.query;
      const subscriptions = await storage.getAllSubscriptions({
        status: status as string | undefined,
        page: Number(page),
        limit: Number(limit),
      });
      res.json(subscriptions);
    } catch (error) {
      console.error("Error fetching all subscriptions:", error);
      res.status(500).json({ message: "خطأ في جلب الاشتراكات" });
    }
  });

  // ==================== Payment Transactions ====================

  // Get user's payment history
  app.get('/api/my-payments', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const userId = req.user!.id;
      const payments = await storage.getUserPaymentTransactions(userId);
      res.json(payments);
    } catch (error) {
      console.error("Error fetching user payments:", error);
      res.status(500).json({ message: "خطأ في جلب سجل المدفوعات" });
    }
  });

  // Create payment transaction (internal use)
  app.post('/api/payments', requireAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const parsed = insertPaymentTransactionSchema.safeParse({
        ...req.body,
        userId: req.user!.id,
      });
      if (!parsed.success) {
        return res.status(400).json({ message: "بيانات غير صحيحة", errors: parsed.error.errors });
      }
      const payment = await storage.createPaymentTransaction(parsed.data);
      res.status(201).json(payment);
    } catch (error) {
      console.error("Error creating payment:", error);
      res.status(500).json({ message: "خطأ في إنشاء المدفوعة" });
    }
  });

  // Get all payment transactions (admin/owner only)
  app.get('/api/admin/payments', requireAuth, requireAdminOrOwner, async (req: AuthenticatedRequest, res) => {
    try {
      const { status, gateway, page = 1, limit = 20 } = req.query;
      const payments = await storage.getAllPaymentTransactions({
        status: status as string | undefined,
        gateway: gateway as string | undefined,
        page: Number(page),
        limit: Number(limit),
      });
      res.json(payments);
    } catch (error) {
      console.error("Error fetching all payments:", error);
      res.status(500).json({ message: "خطأ في جلب المدفوعات" });
    }
  });

  // ==================== Payment Gateway Settings ====================

  // Get enabled payment gateways (public)
  app.get('/api/payment-gateways', async (req, res) => {
    try {
      const gateways = await storage.getEnabledPaymentGateways();
      res.json(gateways);
    } catch (error) {
      console.error("Error fetching payment gateways:", error);
      res.status(500).json({ message: "خطأ في جلب بوابات الدفع" });
    }
  });

  // Get all payment gateway settings (admin/owner only)
  app.get('/api/admin/payment-gateways', requireAuth, requireAdminOrOwner, async (req: AuthenticatedRequest, res) => {
    try {
      const gateways = await storage.getAllPaymentGatewaySettings();
      res.json(gateways);
    } catch (error) {
      console.error("Error fetching all payment gateway settings:", error);
      res.status(500).json({ message: "خطأ في جلب إعدادات بوابات الدفع" });
    }
  });

  // Update payment gateway settings (admin/owner only)
  app.patch('/api/admin/payment-gateways/:gateway', requireAuth, requireAdminOrOwner, async (req: AuthenticatedRequest, res) => {
    try {
      const gateway = await storage.updatePaymentGatewaySettings(req.params.gateway, req.body);
      res.json(gateway);
    } catch (error) {
      console.error("Error updating payment gateway settings:", error);
      res.status(500).json({ message: "خطأ في تحديث إعدادات بوابة الدفع" });
    }
  });

  console.log("✅ Subscription routes setup");
}
