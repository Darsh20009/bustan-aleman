import TelegramBot from 'node-telegram-bot-api';
import { storage } from './storage';
import { log } from './vite';

export class BustanTelegramBot {
  private bot: TelegramBot;
  private userSessions: Map<number, any> = new Map();

  constructor() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      throw new Error('TELEGRAM_BOT_TOKEN is required');
    }
    
    this.bot = new TelegramBot(token, { polling: true });
    this.setupHandlers();
    log('🤖 بوت تليجرام بستان الإيمان تم تشغيله بنجاح', 'telegram');
  }

  private setupHandlers() {
    // أمر البدء /start
    this.bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      const userId = msg.from?.id;
      const firstName = msg.from?.first_name || '';
      const lastName = msg.from?.last_name || '';
      const username = msg.from?.username || '';

      log(`🔔 مستخدم جديد: ${firstName} ${lastName} (@${username}) - ID: ${userId}`, 'telegram');

      // التحقق من وجود المستخدم في قاعدة البيانات
      try {
        let user = await storage.getUserByTelegramId(userId?.toString() || '');
        
        if (user) {
          // المستخدم موجود - تسجيل دخول
          const loginCode = this.generateLoginCode();
          this.userSessions.set(chatId, { 
            action: 'login', 
            code: loginCode, 
            user,
            expires: Date.now() + (5 * 60 * 1000) // 5 دقائق
          });

          await this.bot.sendMessage(chatId, `
🌟 أهلاً وسهلاً ${firstName}! 

لقد تم التعرف عليك في منصة بستان الإيمان.

🔐 كود تسجيل الدخول الخاص بك:
\`${loginCode}\`

⏰ هذا الكود صالح لمدة 5 دقائق فقط.

📱 استخدم هذا الكود في موقع بستان الإيمان لتسجيل الدخول.

🕌 بارك الله فيك
          `, { parse_mode: 'Markdown' });

        } else {
          // مستخدم جديد - تسجيل حساب
          this.userSessions.set(chatId, { 
            action: 'register', 
            telegramData: {
              telegramId: userId?.toString(),
              firstName,
              lastName,
              username
            }
          });

          await this.bot.sendMessage(chatId, `
🌟 أهلاً وسهلاً ${firstName}! 

مرحباً بك في بوت منصة بستان الإيمان للتعليم الإسلامي.

📝 لإنشاء حساب جديد، أرسل المعلومات التالية:

الاسم الأول:
الاسم الأخير:
رقم الهاتف:
العمر:

📝 مثال:
محمد
أحمد  
0512345678
25

🕌 بارك الله فيك
          `);
        }
      } catch (error) {
        console.error('خطأ في معالجة /start:', error);
        await this.bot.sendMessage(chatId, `
❌ حدث خطأ في النظام. 

يرجى المحاولة مرة أخرى أو التواصل مع الدعم الفني.

📞 للدعم: +966532441566
        `);
      }
    });

    // معالجة الرسائل النصية
    this.bot.on('message', async (msg) => {
      if (msg.text?.startsWith('/')) return; // تجاهل الأوامر

      const chatId = msg.chat.id;
      const session = this.userSessions.get(chatId);

      if (!session) {
        await this.bot.sendMessage(chatId, `
👋 مرحباً! أرسل /start للبدء مع بوت بستان الإيمان.

🕌 منصة التعليم الإسلامي
        `);
        return;
      }

      if (session.action === 'register') {
        await this.handleRegistration(chatId, msg.text || '', session);
      }
    });

    // أمر الحالة /status
    this.bot.onText(/\/status/, async (msg) => {
      const chatId = msg.chat.id;
      const userId = msg.from?.id;

      try {
        const user = await storage.getUserByTelegramId(userId?.toString() || '');
        
        if (user) {
          await this.bot.sendMessage(chatId, `
📊 حالة حسابك:

👤 الاسم: ${user.firstName} ${user.lastName}
📧 الإيميل: ${user.email || 'غير محدد'}
📱 الهاتف: ${user.phoneNumber || 'غير محدد'}
🎓 الدور: ${this.translateRole(user.role || 'student')}
✅ الحالة: ${user.isActive ? 'نشط' : 'غير نشط'}

📅 تاريخ التسجيل: ${new Date(user.createdAt!).toLocaleDateString('ar-SA')}

🕌 بارك الله فيك
          `);
        } else {
          await this.bot.sendMessage(chatId, `
❌ لم يتم العثور على حسابك.

📝 أرسل /start لإنشاء حساب جديد.

🕌 بارك الله فيك
          `);
        }
      } catch (error) {
        console.error('خطأ في معالجة /status:', error);
        await this.bot.sendMessage(chatId, '❌ حدث خطأ في جلب المعلومات.');
      }
    });

    // أمر المساعدة /help
    this.bot.onText(/\/help/, async (msg) => {
      const chatId = msg.chat.id;
      
      await this.bot.sendMessage(chatId, `
🤖 مساعدة بوت بستان الإيمان

🔹 /start - بدء استخدام البوت أو تسجيل الدخول
🔹 /status - عرض معلومات حسابك 
🔹 /help - عرض هذه المساعدة

📝 كيفية التسجيل:
1. أرسل /start
2. أدخل بياناتك المطلوبة
3. احصل على كود تسجيل الدخول
4. استخدم الكود في الموقع

🌐 موقع بستان الإيمان: 
${process.env.REPL_SLUG ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co` : 'قيد التشغيل...'}

📞 للدعم: +966532441566

🕌 بارك الله فيك
      `);
    });
  }

  private async handleRegistration(chatId: number, text: string, session: any) {
    try {
      const lines = text.trim().split('\n').map(line => line.trim()).filter(line => line);
      
      if (lines.length < 4) {
        await this.bot.sendMessage(chatId, `
❌ يرجى إرسال جميع المعلومات المطلوبة:

📝 الاسم الأول
📝 الاسم الأخير  
📱 رقم الهاتف
🎂 العمر

مثال:
محمد
أحمد
0512345678
25
        `);
        return;
      }

      const [firstName, lastName, phoneNumber, ageText] = lines;
      const age = parseInt(ageText);

      if (isNaN(age) || age < 5 || age > 100) {
        await this.bot.sendMessage(chatId, '❌ يرجى إدخال عمر صحيح (5-100 سنة).');
        return;
      }

      // إنشاء المستخدم الجديد
      const newUser = await storage.createTelegramUser({
        telegramId: session.telegramData.telegramId,
        firstName,
        lastName,
        phoneNumber,
        age,
        email: `${session.telegramData.username || session.telegramData.telegramId}@telegram.user`,
        role: 'student',
        isActive: true,
        registrationCompleted: true
      });

      // إنتاج كود تسجيل الدخول
      const loginCode = this.generateLoginCode();
      this.userSessions.set(chatId, { 
        action: 'login', 
        code: loginCode, 
        user: newUser,
        expires: Date.now() + (5 * 60 * 1000)
      });

      await this.bot.sendMessage(chatId, `
✅ تم إنشاء حسابك بنجاح!

👤 اسمك: ${firstName} ${lastName}
📱 هاتفك: ${phoneNumber}
🎂 عمرك: ${age} سنة

🔐 كود تسجيل الدخول:
\`${loginCode}\`

⏰ هذا الكود صالح لمدة 5 دقائق.

🌐 ادخل على موقع بستان الإيمان واستخدم هذا الكود لتسجيل الدخول.

🕌 بارك الله فيك ومرحباً بك في منصة بستان الإيمان!
      `, { parse_mode: 'Markdown' });

      // مسح الجلسة بعد التسجيل الناجح
      this.userSessions.delete(chatId);

    } catch (error) {
      console.error('خطأ في التسجيل:', error);
      await this.bot.sendMessage(chatId, `
❌ حدث خطأ أثناء إنشاء الحساب.

يرجى المحاولة مرة أخرى أو التواصل مع الدعم الفني.

📞 للدعم: +966532441566
      `);
    }
  }

  private generateLoginCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  private translateRole(role: string): string {
    const roles = {
      'student': 'طالب',
      'supervisor': 'مشرف',
      'admin': 'مدير'
    };
    return roles[role as keyof typeof roles] || 'طالب';
  }

  // التحقق من كود تسجيل الدخول
  public verifyLoginCode(code: string): any {
    for (const [chatId, session] of Array.from(this.userSessions.entries())) {
      if (session.action === 'login' && 
          session.code === code && 
          session.expires > Date.now()) {
        
        // مسح الكود بعد الاستخدام
        this.userSessions.delete(chatId);
        return session.user;
      }
    }
    return null;
  }

  // إرسال إشعار للمستخدم
  public async sendNotification(telegramId: string, message: string) {
    try {
      await this.bot.sendMessage(parseInt(telegramId), message);
      return true;
    } catch (error) {
      console.error('خطأ في إرسال الإشعار:', error);
      return false;
    }
  }

  // تنظيف الجلسات المنتهية الصلاحية
  public cleanExpiredSessions() {
    const now = Date.now();
    for (const [chatId, session] of Array.from(this.userSessions.entries())) {
      if (session.expires && session.expires < now) {
        this.userSessions.delete(chatId);
      }
    }
  }
}

export let telegramBot: BustanTelegramBot | null = null;

export function initializeTelegramBot() {
  try {
    if (process.env.TELEGRAM_BOT_TOKEN) {
      telegramBot = new BustanTelegramBot();
      
      // تنظيف الجلسات كل 5 دقائق
      setInterval(() => {
        telegramBot?.cleanExpiredSessions();
      }, 5 * 60 * 1000);
      
      log('✅ تم تشغيل بوت تليجرام بنجاح', 'telegram');
    } else {
      log('⚠️ رمز بوت التليجرام غير موجود - تم تخطي تشغيل البوت', 'telegram');
    }
  } catch (error) {
    console.error('❌ خطأ في تشغيل بوت التليجرام:', error);
  }
}