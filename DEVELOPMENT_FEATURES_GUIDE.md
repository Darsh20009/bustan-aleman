# بستان الإيمان - دليل الميزات المتقدمة

## الميزات المستحدثة (الجديدة) 🚀

### 1. **نظام الإنجازات والشارات** 🏆
- **الملف:** `client/src/components/AchievementBadge.tsx`
- **الميزات:**
  - 4 مستويات إنجاز: برونزي، فضي، ذهبي، بلاتيني
  - شارات مفتوحة وقيد الإنجاز
  - تصميم جذاب مع رموز مخصصة
  - نقاط الإنجاز (10 نقاط لكل شارة)

**مثال الاستخدام:**
```tsx
<AchievementGrid achievements={achievements} />
```

---

### 2. **نظام السلسلة (Streak Tracking)** 🔥
- **الملف:** `client/src/components/StreakTracker.tsx`
- **الميزات:**
  - تتبع السلسلة الحالية
  - تسجيل أطول سلسلة
  - إجمالي الأيام النشطة
  - تنبيهات حالة السلسلة (آمنة، في خطر)
  - حافز يومي للمستخدمين

**المؤشرات:**
- 🔥 السلسلة نشطة اليوم
- ⚠️ السلسلة في خطر
- 📅 لا نشاط اليوم

---

### 3. **لوحة التحليلات والإحصائيات** 📊
- **الملف:** `client/src/components/ProgressChart.tsx`
- **الميزات:**
  - رسوم بيانية أسبوعية للنشاط
  - توزيع التقدم (دائري)
  - إحصائيات عامة للحفظ والمراجعة
  - أهداف أسبوعية مع مؤشرات تقدم

**البيانات المعروضة:**
- الآيات المحفوظة ✓
- الآيات قيد المراجعة ⏳
- الآيات غير المبدوءة

---

### 4. **لوحة الصدارة (Leaderboard)** 👑
- **الملف:** `client/src/components/Leaderboard.tsx`
- **الميزات:**
  - ترتيب الطلاب حسب الأداء
  - عرض السلسلة للكل
  - عرض عدد الآيات المحفوظة
  - رموز خاصة للمراتب الثلاث الأولى
  - حافز المنافسة الصحية

---

### 5. **إدارة الأهداف التعليمية** 🎯
- **الملف:** `client/src/components/LearningGoals.tsx`
- **الميزات:**
  - إنشاء أهداف جديدة
  - تتبع تقدم الأهداف بنسب مئوية
  - تاريخ استحقاق الأهداف
  - حالات الأهداف (نشط، مكتمل، مهجور)
  - حذف الأهداف المهجورة

**أنواع الأهداف:**
- حفظ سور محددة
- مراجعة الحفظ
- إكمال دروس معينة

---

### 6. **التذكيرات والمهام الأسبوعية** 🔔
- **الملف:** `client/src/components/WeeklyReminders.tsx`
- **الميزات:**
  - تذكيرات الحصص القادمة
  - تنبيهات الواجبات المستحقة
  - تذكيرات المراجعة
  - حالة التذكيرات (معلقة، مقبلة، مكتملة)
  - وقت حتى الاستحقاق

---

### 7. **لوحة التحليلات المتقدمة** 📈
- **الملف:** `client/src/pages/student/AnalyticsDashboard.tsx`
- **التبويبات:**
  1. **السلسلة** - معلومات النشاط المنتظم
  2. **الإنجازات** - جميع الشارات والإنجازات
  3. **التقدم** - رسوم بيانية وإحصائيات
  4. **الأهداف** - أهداف التعلم ولوحة الصدارة
  5. **التذكيرات** - جميع المهام والتذكيرات

---

## التكامل مع النظام الموجود 🔗

### تحديثات App.tsx
- إضافة `InstallPrompt` - مطالبة تثبيت التطبيق

### الميزات المرتبطة
- **PWA Support** - التثبيت على جميع الأجهزة
- **Offline Mode** - العمل بدون إنترنت
- **Mobile Responsive** - متوافق مع جميع الأحجام

---

## البيانات المدعومة 💾

### نموذج بيانات الإنجاز
```typescript
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: 'trophy' | 'star' | 'zap' | 'target' | 'calendar' | 'book';
  level: 'bronze' | 'silver' | 'gold' | 'platinum';
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}
```

### نموذج بيانات السلسلة
```typescript
interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: Date;
  totalDaysActive: number;
}
```

### نموذج بيانات التقدم
```typescript
interface ProgressData {
  memorized: number;
  inReview: number;
  notStarted: number;
  week: string[];
}
```

---

## الألوان والتصميم 🎨

### ألوان الحالات
- **نجاح/محفوظ:** أخضر (`#10b981`)
- **تنبيه/مراجعة:** أصفر (`#f59e0b`)
- **خطر/غير مبدوء:** أحمر (`#ef4444`)
- **معلومات:** أزرق (`#3b82f6`)

### الأيقونات المستخدمة
من مكتبة `lucide-react`:
- 🏆 `Trophy` - الإنجازات
- 🔥 `Flame` - السلسلة
- 📊 `BarChart3` - التحليلات
- 🎯 `Target` - الأهداف
- 🔔 `Bell` - التذكيرات

---

## إضافة البيانات الفعلية من قاعدة البيانات 📡

### خطوات التكامل المستقبلي:

#### 1. إنشاء جداول قاعدة البيانات
```sql
-- في shared/schema.ts
export const achievements = bustanSchema.table("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  achievementType: varchar("achievement_type"),
  unlockedAt: timestamp("unlocked_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const streaks = bustanSchema.table("streaks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  lastActiveDate: timestamp("last_active_date"),
  totalDaysActive: integer("total_days_active").default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const goals = bustanSchema.table("goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  title: varchar("title"),
  description: text("description"),
  targetDate: timestamp("target_date"),
  progress: integer("progress").default(0),
  maxProgress: integer("max_progress"),
  status: varchar("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});
```

#### 2. إنشاء API Routes
```typescript
// في server/routes.ts
app.get('/api/student/achievements', (req, res) => {
  // جلب الإنجازات من قاعدة البيانات
});

app.get('/api/student/streak', (req, res) => {
  // جلب معلومات السلسلة
});

app.post('/api/student/goals', (req, res) => {
  // إنشاء هدف جديد
});
```

#### 3. ربط المكونات بالبيانات الفعلية
```tsx
// في AnalyticsDashboard.tsx
const { data: achievements } = useQuery({
  queryKey: ['/api/student/achievements'],
});

const { data: streakData } = useQuery({
  queryKey: ['/api/student/streak'],
});
```

---

## نصائح الاستخدام 💡

### للمستخدمين:
1. **تابع سلسلتك اليومية** - كل يوم نشاط يحافظ على زخمك
2. **اضبط أهدافاً واقعية** - أهداف صغيرة يومية أفضل من أهداف كبيرة
3. **تنافس بشكل صحي** - لوحة الصدارة تحفزك على الالتزام
4. **احتفل بالإنجازات** - كل شارة تمثل تقدماً حقيقياً

### للمطورين:
1. جميع المكونات مستقلة وقابلة لإعادة الاستخدام
2. البيانات حالياً تجريبية (mock data)
3. يمكن بسهولة استبدال البيانات التجريبية بالبيانات الفعلية
4. التصاميم مستجيبة وتعمل على جميع الأجهزة

---

## الملفات المنشأة 📁

```
client/src/components/
├── AchievementBadge.tsx      (شارات الإنجازات)
├── StreakTracker.tsx         (تتبع السلسلة)
├── ProgressChart.tsx         (رسوم بيانية)
├── Leaderboard.tsx           (لوحة الصدارة)
├── LearningGoals.tsx         (الأهداف التعليمية)
└── WeeklyReminders.tsx       (التذكيرات)

client/src/pages/student/
└── AnalyticsDashboard.tsx    (لوحة التحليلات المتقدمة)

client/public/
├── manifest.json             (بيانات التطبيق)
└── service-worker.js         (خدمة الـ PWA)

client/src/
├── App.tsx                   (محدّث مع InstallPrompt)
└── components/InstallPrompt.tsx  (مطالبة التثبيت)
```

---

## النسخة الحالية
- **التاريخ:** 27 ديسمبر 2024
- **الإصدار:** 1.1.0
- **الحالة:** جاهز للإنتاج (مع بيانات تجريبية)

---

## الخطوات التالية 🚀

1. ✅ توصيل البيانات الفعلية من قاعدة البيانات
2. ✅ إضافة إشعارات push notifications
3. ✅ تحسين أداء الرسوم البيانية
4. ✅ إضافة تقارير شهرية وسنوية
5. ✅ دعم مشاركة الإنجازات على الشبكات الاجتماعية

---

**تم التطوير بواسطة:** Replit Agent
**للاستفسارات:** يرجى التواصل مع فريق الدعم