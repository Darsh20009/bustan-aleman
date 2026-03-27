import https from 'https';

const SMTP2GO_API_KEY = process.env.SMTP2GO_API_KEY || '';
const FROM_EMAIL = process.env.SMTP2GO_FROM_EMAIL || 'noreply@bustanaliman.com';
const FROM_NAME = process.env.SMTP2GO_FROM_NAME || 'بستان الإيمان';
const API_URL = 'https://api.smtp2go.com/v3/email/send';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  toName?: string;
}

async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!SMTP2GO_API_KEY) {
    console.log('⚠️ SMTP2Go not configured - email skipped:', options.subject);
    return false;
  }

  const payload = JSON.stringify({
    api_key: SMTP2GO_API_KEY,
    to: [options.toName ? `${options.toName} <${options.to}>` : options.to],
    sender: `${FROM_NAME} <${FROM_EMAIL}>`,
    subject: options.subject,
    html_body: options.html,
  });

  return new Promise((resolve) => {
    const url = new URL(API_URL);
    const req = https.request({
      hostname: url.hostname,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.data?.succeeded > 0) {
            console.log(`✅ Email sent: ${options.subject} → ${options.to}`);
            resolve(true);
          } else {
            console.error('❌ Email failed:', result);
            resolve(false);
          }
        } catch {
          console.error('❌ Email parse error:', data);
          resolve(false);
        }
      });
    });
    req.on('error', (err) => {
      console.error('❌ Email error:', err.message);
      resolve(false);
    });
    req.write(payload);
    req.end();
  });
}

function rtlWrapper(content: string, title: string): string {
  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; background: #f5f5f0; margin: 0; padding: 20px; direction: rtl; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #2D5A3D 0%, #1a3a25 100%); color: #D4AF37; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .header p { margin: 8px 0 0; opacity: 0.8; font-size: 14px; }
    .content { padding: 30px; color: #333; line-height: 1.8; }
    .highlight { background: #f0f7f2; border-right: 4px solid #2D5A3D; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .btn { display: inline-block; background: #2D5A3D; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 15px 0; }
    .footer { background: #f8f8f4; padding: 20px; text-align: center; color: #888; font-size: 12px; border-top: 1px solid #eee; }
    .badge { display: inline-block; background: #D4AF37; color: #2D5A3D; padding: 4px 12px; border-radius: 20px; font-weight: bold; font-size: 13px; }
    .error-item { background: #fff5f5; border-right: 3px solid #e53e3e; padding: 8px 12px; margin: 5px 0; border-radius: 4px; }
    .success-item { background: #f0fff4; border-right: 3px solid #38a169; padding: 8px 12px; margin: 5px 0; border-radius: 4px; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th { background: #2D5A3D; color: white; padding: 10px; text-align: right; }
    td { padding: 10px; border-bottom: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🌿 بستان الإيمان</h1>
      <p>منصة تحفيظ القرآن الكريم</p>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>بستان الإيمان - منصة تحفيظ القرآن الكريم والدورات الشرعية</p>
      <p>هذا البريد تلقائي، الرجاء عدم الرد عليه</p>
    </div>
  </div>
</body>
</html>`;
}

export const emailService = {
  async sendWelcomeEmail(to: string, name: string): Promise<boolean> {
    const html = rtlWrapper(`
      <h2>مرحباً ${name} 🌟</h2>
      <p>أهلاً وسهلاً بك في <strong>بستان الإيمان</strong>، منصتك المتكاملة لتحفيظ القرآن الكريم.</p>
      <div class="highlight">
        <p>✨ يمكنك الآن:</p>
        <ul>
          <li>📖 تصفح المصحف الإلكتروني</li>
          <li>🎯 حضور حصص التسميع مع الشيوخ</li>
          <li>📊 تتبع تقدمك في الحفظ والمراجعة</li>
          <li>🤖 التسميع بالذكاء الاصطناعي</li>
        </ul>
      </div>
      <p>ابدأ رحلتك الآن!</p>
    `, 'مرحباً بك في بستان الإيمان');

    return sendEmail({ to, toName: name, subject: '🌿 مرحباً بك في بستان الإيمان', html });
  },

  async sendSessionSummary(to: string, name: string, data: {
    sheikhName: string;
    date: string;
    newMemorization?: string;
    review?: string;
    errors?: { surah: string; ayah: number; type: string }[];
    rating?: number;
    aiComment?: string;
    nextAssignment?: string;
  }): Promise<boolean> {
    const errorsHtml = data.errors?.length
      ? data.errors.map(e => `<div class="error-item">📌 ${e.surah} - آية ${e.ayah}: ${e.type}</div>`).join('')
      : '<div class="success-item">✅ لا توجد أخطاء - ممتاز!</div>';

    const ratingStars = data.rating ? '⭐'.repeat(Math.min(data.rating, 5)) : '';

    const html = rtlWrapper(`
      <h2>ملخص الحصة 📝</h2>
      <p>عزيزي/عزيزتي <strong>${name}</strong>،</p>
      <p>إليك ملخص حصتك مع الشيخ <strong>${data.sheikhName}</strong> بتاريخ ${data.date}:</p>
      
      ${data.newMemorization ? `<div class="highlight"><strong>📗 الحفظ الجديد:</strong><br>${data.newMemorization}</div>` : ''}
      ${data.review ? `<div class="highlight"><strong>📘 المراجعة:</strong><br>${data.review}</div>` : ''}
      
      <h3>الأخطاء:</h3>
      ${errorsHtml}
      
      ${data.rating ? `<div class="highlight"><strong>التقييم:</strong> ${ratingStars} (${data.rating}/5)</div>` : ''}
      ${data.aiComment ? `<div class="highlight"><strong>🤖 تعليق المساعد الذكي:</strong><br>${data.aiComment}</div>` : ''}
      ${data.nextAssignment ? `<div class="highlight" style="background: #fffdf0; border-color: #D4AF37;"><strong>📋 الواجب القادم:</strong><br>${data.nextAssignment}</div>` : ''}
    `, 'ملخص الحصة');

    return sendEmail({ to, toName: name, subject: `📝 ملخص حصتك - ${data.date}`, html });
  },

  async sendSubscriptionExpiry(to: string, name: string, planName: string, expiryDate: string): Promise<boolean> {
    const html = rtlWrapper(`
      <h2>تنبيه انتهاء الاشتراك ⚠️</h2>
      <p>عزيزي/عزيزتي <strong>${name}</strong>،</p>
      <p>نود إعلامك بأن اشتراكك في خطة <span class="badge">${planName}</span> سينتهي بتاريخ <strong>${expiryDate}</strong>.</p>
      <div class="highlight">
        <p>💡 لتجنب انقطاع الخدمة، يرجى تجديد اشتراكك قبل تاريخ الانتهاء.</p>
      </div>
      <p>شكراً لثقتك في بستان الإيمان 🌿</p>
    `, 'تنبيه انتهاء الاشتراك');

    return sendEmail({ to, toName: name, subject: `⚠️ تنبيه: اشتراكك ينتهي قريباً - ${planName}`, html });
  },

  async sendAssignmentNotification(to: string, name: string, data: {
    memorization?: string;
    review?: string;
    sheikhName: string;
  }): Promise<boolean> {
    const html = rtlWrapper(`
      <h2>واجب جديد 📚</h2>
      <p>عزيزي/عزيزتي <strong>${name}</strong>،</p>
      <p>قام الشيخ <strong>${data.sheikhName}</strong> بتحديد الواجب التالي لك:</p>
      ${data.memorization ? `<div class="highlight"><strong>📗 الحفظ الجديد:</strong><br>${data.memorization}</div>` : ''}
      ${data.review ? `<div class="highlight"><strong>📘 المراجعة:</strong><br>${data.review}</div>` : ''}
      <p>بالتوفيق! 🌟</p>
    `, 'واجب جديد');

    return sendEmail({ to, toName: name, subject: `📚 واجب جديد من الشيخ ${data.sheikhName}`, html });
  },

  async sendPaymentApproval(to: string, name: string, amount: string, planName: string): Promise<boolean> {
    const html = rtlWrapper(`
      <h2>تم قبول الدفع ✅</h2>
      <p>عزيزي/عزيزتي <strong>${name}</strong>،</p>
      <p>تم قبول عملية الدفع الخاصة بك بنجاح.</p>
      <div class="highlight">
        <table>
          <tr><td><strong>الخطة:</strong></td><td>${planName}</td></tr>
          <tr><td><strong>المبلغ:</strong></td><td>${amount}</td></tr>
          <tr><td><strong>الحالة:</strong></td><td><span class="badge">مقبول ✅</span></td></tr>
        </table>
      </div>
      <p>شكراً لثقتك في بستان الإيمان 🌿</p>
    `, 'تم قبول الدفع');

    return sendEmail({ to, toName: name, subject: '✅ تم قبول عملية الدفع بنجاح', html });
  },

  async sendPaymentRejection(to: string, name: string, reason: string): Promise<boolean> {
    const html = rtlWrapper(`
      <h2>تم رفض الدفع ❌</h2>
      <p>عزيزي/عزيزتي <strong>${name}</strong>،</p>
      <p>نأسف لإبلاغك بأن عملية الدفع الخاصة بك قد رُفضت.</p>
      <div class="highlight" style="background: #fff5f5; border-color: #e53e3e;">
        <strong>السبب:</strong> ${reason}
      </div>
      <p>يرجى المحاولة مرة أخرى أو التواصل مع الإدارة.</p>
    `, 'تم رفض الدفع');

    return sendEmail({ to, toName: name, subject: '❌ تم رفض عملية الدفع', html });
  },

  async sendPasswordReset(to: string, name: string, resetCode: string): Promise<boolean> {
    const html = rtlWrapper(`
      <h2>إعادة تعيين كلمة المرور 🔑</h2>
      <p>عزيزي/عزيزتي <strong>${name}</strong>،</p>
      <p>تم طلب إعادة تعيين كلمة المرور لحسابك.</p>
      <div class="highlight" style="text-align: center;">
        <p style="font-size: 12px; margin: 0;">رمز التحقق:</p>
        <p style="font-size: 32px; font-weight: bold; color: #2D5A3D; letter-spacing: 8px; margin: 10px 0;">${resetCode}</p>
        <p style="font-size: 12px; color: #888;">صالح لمدة 15 دقيقة</p>
      </div>
      <p>إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد.</p>
    `, 'إعادة تعيين كلمة المرور');

    return sendEmail({ to, toName: name, subject: '🔑 رمز إعادة تعيين كلمة المرور', html });
  },

  async sendSessionSummaryEmail(student: any, report: any): Promise<boolean> {
    if (!student.email) return false;
    const html = wrapInTemplate(`
      <h2>تقرير الحصة 📖</h2>
      <p>عزيزي/عزيزتي <strong>${student.name}</strong>،</p>
      <p>تم تقييم حصتك اليوم. إليك ملخص التقرير:</p>
      <div class="highlight">
        <table style="width: 100%; text-align: right;">
          <tr><td>الحضور:</td><td><strong>${report.attendance === 'present' ? 'حاضر' : report.attendance === 'late' ? 'متأخر' : 'غائب'}</strong></td></tr>
          <tr><td>تقييم المراجعة:</td><td><strong>${report.reviewRating}/10</strong></td></tr>
          <tr><td>تقييم الحفظ:</td><td><strong>${report.newMemorizationRating}/10</strong></td></tr>
          <tr><td>عدد الأخطاء:</td><td><strong>${report.errorsCount}</strong></td></tr>
        </table>
      </div>
      ${report.teacherNotes ? `<p><strong>ملاحظات المعلم:</strong> ${report.teacherNotes}</p>` : ''}
      ${report.aiEvaluation?.feedback ? `<p><strong>تقييم الذكاء الاصطناعي:</strong> ${report.aiEvaluation.feedback}</p>` : ''}
      <p>تابع تقدمك عبر لوحة التحكم الخاصة بك.</p>
    `, 'تقرير الحصة');

    return sendEmail({ to: student.email, toName: student.name, subject: '📖 تقرير حصتك اليوم', html });
  },

  isConfigured(): boolean {
    return !!SMTP2GO_API_KEY;
  },
};
