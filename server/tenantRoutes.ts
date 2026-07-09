/**
 * مسارات API لإدارة الجهات (Tenants)
 * بستان الإيمان - المرحلة الأولى
 */
import { Express, Request, Response } from 'express';
import { Tenant } from './models/tenantModel.js';
import { User } from './models/index.js';

function requireSuperAdmin(req: Request, res: Response, next: Function) {
  const session = req.session as any;
  if (!session?.userId) return res.status(401).json({ message: 'غير مصرح' });
  User.findById(session.userId).then(user => {
    if (!user || user.role !== 'super_admin') {
      return res.status(403).json({ message: 'تحتاج صلاحيات Super Admin' });
    }
    (req as any).currentUser = user;
    next();
  }).catch(() => res.status(500).json({ message: 'خطأ في التحقق من الصلاحيات' }));
}

function requireAuth(req: Request, res: Response, next: Function) {
  const session = req.session as any;
  if (!session?.userId) return res.status(401).json({ message: 'غير مصرح' });
  User.findById(session.userId).then(user => {
    if (!user) return res.status(401).json({ message: 'غير مصرح' });
    (req as any).currentUser = user;
    next();
  }).catch(() => res.status(500).json({ message: 'خطأ في التحقق' }));
}

export function setupTenantRoutes(app: Express) {
  // ==============================
  // GET /api/tenants - قائمة الجهات (super_admin فقط)
  // ==============================
  app.get('/api/tenants', requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 20, search } = req.query;
      const filter: any = {};
      if (search) filter.name = { $regex: search, $options: 'i' };

      const [tenants, total] = await Promise.all([
        Tenant.find(filter)
          .populate('ownerId', 'firstName lastName email phoneNumber')
          .sort({ createdAt: -1 })
          .skip((+page - 1) * +limit)
          .limit(+limit),
        Tenant.countDocuments(filter),
      ]);

      res.json({ tenants, total, page: +page, limit: +limit });
    } catch (error: any) {
      res.status(500).json({ message: 'خطأ في جلب الجهات', error: error.message });
    }
  });

  // ==============================
  // GET /api/tenants/slug/:slug - جلب جهة بالـ slug
  // ==============================
  app.get('/api/tenants/slug/:slug', async (req: Request, res: Response) => {
    try {
      const tenant = await Tenant.findOne({ slug: req.params.slug, isActive: true })
        .populate('ownerId', 'firstName lastName');
      if (!tenant) return res.status(404).json({ message: 'الجهة غير موجودة' });
      res.json(tenant);
    } catch (error: any) {
      res.status(500).json({ message: 'خطأ في جلب الجهة', error: error.message });
    }
  });

  // ==============================
  // GET /api/tenants/:id - جلب جهة بالـ ID
  // ==============================
  app.get('/api/tenants/:id', requireAuth, async (req: Request, res: Response) => {
    try {
      const tenant = await Tenant.findById(req.params.id)
        .populate('ownerId', 'firstName lastName email phoneNumber');
      if (!tenant) return res.status(404).json({ message: 'الجهة غير موجودة' });
      
      const user = (req as any).currentUser;
      // السماح لـ super_admin أو صاحب الجهة أو أعضاء الجهة
      if (user.role !== 'super_admin' && tenant.ownerId.toString() !== user._id.toString()
          && user.tenantId?.toString() !== tenant._id.toString()) {
        return res.status(403).json({ message: 'غير مصرح' });
      }

      res.json(tenant);
    } catch (error: any) {
      res.status(500).json({ message: 'خطأ في جلب الجهة', error: error.message });
    }
  });

  // ==============================
  // POST /api/tenants - إنشاء جهة جديدة
  // ==============================
  app.post('/api/tenants', requireAuth, async (req: Request, res: Response) => {
    try {
      const user = (req as any).currentUser;
      const { name, slug, type, city, country, colors, settings } = req.body;

      if (!name || !slug) {
        return res.status(400).json({ message: 'الاسم والـ slug مطلوبان' });
      }

      // التحقق من عدم تكرار الـ slug
      const existing = await Tenant.findOne({ slug: slug.toLowerCase() });
      if (existing) return res.status(409).json({ message: 'هذا الـ slug مستخدم بالفعل' });

      const tenant = new Tenant({
        name,
        slug: slug.toLowerCase().trim(),
        type: type || 'halaqa',
        city,
        country: country || 'SA',
        ownerId: user._id,
        colors,
        settings,
        isActive: true,
      });

      await tenant.save();

      // تحديث دور المستخدم ليكون tenant_admin
      if (user.role !== 'super_admin') {
        await User.findByIdAndUpdate(user._id, {
          role: 'tenant_admin',
          tenantId: tenant._id,
          tenantSlug: tenant.slug,
        });
      }

      res.status(201).json({ message: 'تم إنشاء الجهة بنجاح', tenant });
    } catch (error: any) {
      if (error.code === 11000) {
        return res.status(409).json({ message: 'هذا الـ slug مستخدم بالفعل' });
      }
      res.status(500).json({ message: 'خطأ في إنشاء الجهة', error: error.message });
    }
  });

  // ==============================
  // PATCH /api/tenants/:id - تعديل جهة
  // ==============================
  app.patch('/api/tenants/:id', requireAuth, async (req: Request, res: Response) => {
    try {
      const user = (req as any).currentUser;
      const tenant = await Tenant.findById(req.params.id);
      if (!tenant) return res.status(404).json({ message: 'الجهة غير موجودة' });

      if (user.role !== 'super_admin' && tenant.ownerId.toString() !== user._id.toString()) {
        return res.status(403).json({ message: 'غير مصرح — فقط مالك الجهة أو Super Admin' });
      }

      const allowed = ['name', 'type', 'logo', 'colors', 'city', 'country', 'settings'];
      const updates: any = {};
      allowed.forEach(field => {
        if (req.body[field] !== undefined) updates[field] = req.body[field];
      });
      // super_admin فقط يستطيع تغيير isActive
      if (user.role === 'super_admin' && req.body.isActive !== undefined) {
        updates.isActive = req.body.isActive;
      }

      const updated = await Tenant.findByIdAndUpdate(req.params.id, updates, { new: true });
      res.json({ message: 'تم التحديث بنجاح', tenant: updated });
    } catch (error: any) {
      res.status(500).json({ message: 'خطأ في التحديث', error: error.message });
    }
  });

  // ==============================
  // DELETE /api/tenants/:id - حذف جهة (super_admin فقط)
  // ==============================
  app.delete('/api/tenants/:id', requireSuperAdmin, async (req: Request, res: Response) => {
    try {
      const tenant = await Tenant.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
      if (!tenant) return res.status(404).json({ message: 'الجهة غير موجودة' });
      res.json({ message: 'تم تعطيل الجهة بنجاح' });
    } catch (error: any) {
      res.status(500).json({ message: 'خطأ في الحذف', error: error.message });
    }
  });

  // ==============================
  // GET /api/tenants/:id/stats - إحصائيات الجهة
  // ==============================
  app.get('/api/tenants/:id/stats', requireAuth, async (req: Request, res: Response) => {
    try {
      const user = (req as any).currentUser;
      const tenant = await Tenant.findById(req.params.id);
      if (!tenant) return res.status(404).json({ message: 'الجهة غير موجودة' });

      if (user.role !== 'super_admin' && user.tenantId?.toString() !== tenant._id.toString()) {
        return res.status(403).json({ message: 'غير مصرح' });
      }

      const [students, sheikhs, supervisors] = await Promise.all([
        User.countDocuments({ tenantId: tenant._id, role: 'student', isActive: true }),
        User.countDocuments({ tenantId: tenant._id, role: 'sheikh', isActive: true }),
        User.countDocuments({ tenantId: tenant._id, role: 'supervisor', isActive: true }),
      ]);

      res.json({ students, sheikhs, supervisors, tenantName: tenant.name });
    } catch (error: any) {
      res.status(500).json({ message: 'خطأ في جلب الإحصائيات', error: error.message });
    }
  });

  // ==============================
  // POST /api/tenants/:id/invite - دعوة مستخدم لجهة
  // ==============================
  app.post('/api/tenants/:id/invite', requireAuth, async (req: Request, res: Response) => {
    try {
      const user = (req as any).currentUser;
      const tenant = await Tenant.findById(req.params.id);
      if (!tenant) return res.status(404).json({ message: 'الجهة غير موجودة' });

      const isSuperAdmin = user.role === 'super_admin';
      const isOwner = tenant.ownerId.toString() === user._id.toString();
      const isTenantAdmin = user.role === 'tenant_admin' &&
                            user.tenantId?.toString() === tenant._id.toString();

      if (!isSuperAdmin && !isOwner && !isTenantAdmin) {
        return res.status(403).json({ message: 'غير مصرح — فقط مالك الجهة أو مديرها' });
      }

      const { phoneNumber, email, role } = req.body;
      if (!phoneNumber && !email) {
        return res.status(400).json({ message: 'رقم الهاتف أو البريد الإلكتروني مطلوب' });
      }

      const allowedRoles = ['sheikh', 'supervisor', 'student', 'parent'];
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({ message: 'الدور غير صحيح' });
      }

      const filter = phoneNumber ? { phoneNumber } : { email };
      let targetUser = await User.findOne(filter);

      if (targetUser) {
        // تحديث الجهة والدور
        await User.findByIdAndUpdate(targetUser._id, {
          tenantId: tenant._id,
          tenantSlug: tenant.slug,
          role,
        });
        res.json({ message: 'تم ربط المستخدم بالجهة بنجاح', userId: targetUser._id });
      } else {
        res.status(404).json({ 
          message: 'المستخدم غير موجود في النظام. يمكنه التسجيل أولاً.',
          hint: `bustan.qiroxstudio.online/${tenant.slug}/register`
        });
      }
    } catch (error: any) {
      res.status(500).json({ message: 'خطأ في الدعوة', error: error.message });
    }
  });

  console.log('✅ Tenant routes setup');
}
