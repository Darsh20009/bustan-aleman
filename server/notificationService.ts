/**
 * Notification Service for Bustan Al-Iman
 * Handles SMS, Email, and Push notifications
 * 
 * This service provides a unified interface for sending notifications
 * through multiple channels. It can be extended with actual providers
 * like Twilio (SMS), SendGrid/Resend (Email), or Firebase (Push).
 */

interface NotificationPayload {
  userId: string;
  channels: string[];
  messageAr: string;
  messageEn?: string;
  metadata?: Record<string, any>;
}

interface SMSPayload {
  to: string;
  message: string;
}

interface EmailPayload {
  to: string;
  subject: string;
  bodyHtml: string;
  bodyText?: string;
}

interface PushPayload {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

/**
 * Send SMS notification
 * Currently logs the message - replace with Twilio implementation
 * 
 * To integrate Twilio:
 * 1. npm install twilio
 * 2. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN secrets
 * 3. Replace the implementation below
 */
export async function sendSMS(payload: SMSPayload): Promise<boolean> {
  try {
    // Check for Twilio credentials
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (accountSid && authToken && fromNumber) {
      // Twilio integration would go here
      // const client = require('twilio')(accountSid, authToken);
      // await client.messages.create({
      //   body: payload.message,
      //   from: fromNumber,
      //   to: payload.to
      // });
      console.log(`[SMS] Would send to ${payload.to}: ${payload.message.substring(0, 50)}...`);
      return true;
    } else {
      console.log(`[SMS - Mock] To: ${payload.to}`);
      console.log(`[SMS - Mock] Message: ${payload.message}`);
      return true;
    }
  } catch (error) {
    console.error('[SMS] Failed to send SMS:', error);
    return false;
  }
}

/**
 * Send Email notification
 * Currently logs the message - replace with SendGrid/Resend implementation
 * 
 * To integrate SendGrid:
 * 1. npm install @sendgrid/mail
 * 2. Set SENDGRID_API_KEY secret
 * 3. Replace the implementation below
 * 
 * To integrate Resend:
 * 1. npm install resend
 * 2. Set RESEND_API_KEY secret
 * 3. Replace the implementation below
 */
export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  try {
    // Check for email service credentials
    const sendgridKey = process.env.SENDGRID_API_KEY;
    const resendKey = process.env.RESEND_API_KEY;

    if (sendgridKey) {
      // SendGrid integration would go here
      // const sgMail = require('@sendgrid/mail');
      // sgMail.setApiKey(sendgridKey);
      // await sgMail.send({
      //   to: payload.to,
      //   from: 'noreply@bustan-aliman.com',
      //   subject: payload.subject,
      //   text: payload.bodyText,
      //   html: payload.bodyHtml,
      // });
      console.log(`[Email] Would send to ${payload.to}: ${payload.subject}`);
      return true;
    } else if (resendKey) {
      // Resend integration would go here
      // const { Resend } = require('resend');
      // const resend = new Resend(resendKey);
      // await resend.emails.send({
      //   from: 'noreply@bustan-aliman.com',
      //   to: payload.to,
      //   subject: payload.subject,
      //   html: payload.bodyHtml,
      // });
      console.log(`[Email] Would send to ${payload.to}: ${payload.subject}`);
      return true;
    } else {
      console.log(`[Email - Mock] To: ${payload.to}`);
      console.log(`[Email - Mock] Subject: ${payload.subject}`);
      console.log(`[Email - Mock] Body: ${payload.bodyText?.substring(0, 100) || payload.bodyHtml.substring(0, 100)}...`);
      return true;
    }
  } catch (error) {
    console.error('[Email] Failed to send email:', error);
    return false;
  }
}

/**
 * Send Push notification
 * Currently logs the message - replace with Firebase/OneSignal implementation
 * 
 * To integrate Firebase:
 * 1. npm install firebase-admin
 * 2. Set FIREBASE_SERVICE_ACCOUNT secret (JSON)
 * 3. Replace the implementation below
 */
export async function sendPush(payload: PushPayload): Promise<boolean> {
  try {
    // Firebase integration would go here
    // This would require storing user device tokens
    console.log(`[Push - Mock] To user: ${payload.userId}`);
    console.log(`[Push - Mock] Title: ${payload.title}`);
    console.log(`[Push - Mock] Body: ${payload.body}`);
    return true;
  } catch (error) {
    console.error('[Push] Failed to send push notification:', error);
    return false;
  }
}

/**
 * Send notification through multiple channels
 */
export async function sendNotification(
  payload: NotificationPayload,
  userPhone?: string,
  userEmail?: string
): Promise<{ success: boolean; results: Record<string, boolean> }> {
  const results: Record<string, boolean> = {};

  for (const channel of payload.channels) {
    switch (channel) {
      case 'sms':
        if (userPhone) {
          results.sms = await sendSMS({
            to: userPhone,
            message: payload.messageAr,
          });
        } else {
          results.sms = false;
          console.log('[SMS] No phone number provided');
        }
        break;

      case 'email':
        if (userEmail) {
          results.email = await sendEmail({
            to: userEmail,
            subject: 'تذكير من بستان الإيمان',
            bodyHtml: `<div dir="rtl" style="font-family: Arial, sans-serif;">
              <h2>تذكير</h2>
              <p>${payload.messageAr}</p>
              ${payload.messageEn ? `<p style="color: #666;">${payload.messageEn}</p>` : ''}
            </div>`,
            bodyText: payload.messageAr,
          });
        } else {
          results.email = false;
          console.log('[Email] No email address provided');
        }
        break;

      case 'push':
        results.push = await sendPush({
          userId: payload.userId,
          title: 'بستان الإيمان',
          body: payload.messageAr,
          data: payload.metadata,
        });
        break;

      default:
        console.log(`[Notification] Unknown channel: ${channel}`);
    }
  }

  const success = Object.values(results).some(r => r === true);
  return { success, results };
}

/**
 * Process scheduled reminders
 * This function should be called periodically (e.g., every minute by a cron job)
 */
export async function processScheduledReminders(storage: any): Promise<void> {
  try {
    const pendingReminders = await storage.getPendingRemindersToSend();
    
    for (const reminder of pendingReminders) {
      try {
        // Get user info for phone/email
        const user = await storage.getUser(reminder.userId);
        const channels = reminder.channels ? JSON.parse(reminder.channels) : ['push'];
        
        const result = await sendNotification(
          {
            userId: reminder.userId,
            channels,
            messageAr: reminder.messageAr || 'لديك تذكير قادم',
            messageEn: reminder.messageEn,
            metadata: reminder.metadata ? JSON.parse(reminder.metadata) : undefined,
          },
          user?.phoneNumber,
          user?.email
        );

        // Update reminder status
        if (result.success) {
          await storage.updateLessonReminder(reminder.id, {
            status: 'sent',
            sentAt: new Date(),
          });
        } else {
          await storage.updateLessonReminder(reminder.id, {
            status: 'failed',
          });
        }
      } catch (error) {
        console.error(`[Reminder] Failed to process reminder ${reminder.id}:`, error);
        await storage.updateLessonReminder(reminder.id, {
          status: 'failed',
        });
      }
    }
  } catch (error) {
    console.error('[Reminder] Failed to process scheduled reminders:', error);
  }
}

export default {
  sendSMS,
  sendEmail,
  sendPush,
  sendNotification,
  processScheduledReminders,
};
