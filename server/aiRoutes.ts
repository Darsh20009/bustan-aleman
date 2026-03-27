import type { Express } from "express";
import { requireAuth, requireSupervisorOrAdmin, type AuthenticatedRequest } from "./authMiddleware";
import { aiService } from "./aiService";

export function setupAIRoutes(app: Express) {
  app.post('/api/ai/evaluate-performance', requireAuth, requireSupervisorOrAdmin, async (req: any, res) => {
    try {
      if (!aiService.isConfigured()) {
        return res.status(503).json({ message: 'خدمة الذكاء الاصطناعي غير متاحة حالياً' });
      }
      const result = await aiService.evaluateStudentPerformance(req.body);
      res.json(result);
    } catch (error: any) {
      console.error('AI evaluate error:', error.message);
      res.status(500).json({ message: 'خطأ في تقييم الأداء' });
    }
  });

  app.post('/api/ai/memorization-plan', requireAuth, requireSupervisorOrAdmin, async (req: any, res) => {
    try {
      if (!aiService.isConfigured()) {
        return res.status(503).json({ message: 'خدمة الذكاء الاصطناعي غير متاحة حالياً' });
      }
      const result = await aiService.generateMemorizationPlan(req.body);
      res.json(result);
    } catch (error: any) {
      console.error('AI plan error:', error.message);
      res.status(500).json({ message: 'خطأ في إنشاء خطة الحفظ' });
    }
  });

  app.post('/api/ai/evaluate-recitation', requireAuth, async (req: any, res) => {
    try {
      if (!aiService.isConfigured()) {
        return res.status(503).json({ message: 'خدمة الذكاء الاصطناعي غير متاحة حالياً' });
      }
      const result = await aiService.evaluateRecitation(req.body);
      res.json(result);
    } catch (error: any) {
      console.error('AI recitation error:', error.message);
      res.status(500).json({ message: 'خطأ في تقييم التسميع' });
    }
  });

  app.get('/api/ai/level-test', async (_req, res) => {
    try {
      if (!aiService.isConfigured()) {
        return res.status(503).json({ message: 'خدمة الذكاء الاصطناعي غير متاحة حالياً' });
      }
      const result = await aiService.generateLevelTest();
      res.json(result);
    } catch (error: any) {
      console.error('AI level test error:', error.message);
      res.status(500).json({ message: 'خطأ في إنشاء اختبار المستوى' });
    }
  });

  const levelTestLimiter = new Map<string, number>();
  app.post('/api/ai/level-test', async (req: any, res) => {
    try {
      const clientIp = req.ip || 'unknown';
      const lastCall = levelTestLimiter.get(clientIp) || 0;
      if (Date.now() - lastCall < 10000) {
        return res.status(429).json({ message: 'يرجى الانتظار قبل المحاولة مجدداً' });
      }
      levelTestLimiter.set(clientIp, Date.now());

      const { answers } = req.body;
      if (!answers || typeof answers !== 'object') {
        return res.status(400).json({ message: 'الإجابات مطلوبة' });
      }

      if (aiService.isConfigured()) {
        try {
          const prompt = `أنت مقيّم في أكاديمية لتحفيظ القرآن الكريم. بناءً على إجابات الطالب التالية، حدد مستواه:
${JSON.stringify(answers, null, 2)}

أرجع الإجابة بصيغة JSON تحتوي على:
- level: مستوى الطالب (مبتدئ / مبتدئ متقدم / متوسط / متوسط متقدم / متقدم / حافظ)
- memorizedJuz: عدد الأجزاء المحفوظة تقريباً
- tajweedLevel: مستوى التجويد
- recommendation: توصية مفصلة للطالب
- startingSurah: السورة المقترحة للبدء
- weeklyPlan: خطة أسبوعية مقترحة`;

          const result = await aiService.chat(prompt);
          try {
            const jsonMatch = result.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              return res.json(parsed);
            }
          } catch (parseErr) {
            console.log('AI response parse failed, using fallback');
          }
        } catch (aiErr) {
          console.log('AI evaluation failed, using rule-based fallback');
        }
      }

      let memorizedJuz = parseInt(answers[2]) || 0;
      let level = 'مبتدئ';
      let tajweedLevel = 'مبتدئ';

      if (answers[1] === 'نعم، أحفظ القرآن كاملاً') {
        level = 'حافظ';
        memorizedJuz = 30;
      } else if (memorizedJuz >= 20) {
        level = 'متقدم';
      } else if (memorizedJuz >= 10) {
        level = 'متوسط متقدم';
      } else if (memorizedJuz >= 5) {
        level = 'متوسط';
      } else if (memorizedJuz >= 1) {
        level = 'مبتدئ متقدم';
      }

      if (answers[4]?.includes('ممتاز')) tajweedLevel = 'متقدم';
      else if (answers[4]?.includes('جيد')) tajweedLevel = 'متوسط';

      res.json({
        level,
        memorizedJuz,
        tajweedLevel,
        recommendation: `بناءً على مستواك (${level})، ننصحك بحفظ نصف وجه يومياً مع مراجعة ما تحفظ`,
        startingSurah: memorizedJuz === 0 ? 'الفاتحة' : 'استكمال من حيث توقفت',
      });
    } catch (error: any) {
      console.error('Level test error:', error.message);
      res.status(500).json({ message: 'خطأ في تقييم المستوى' });
    }
  });

  app.post('/api/ai/level-test/evaluate', async (req, res) => {
    try {
      const { answers, questions } = req.body;
      if (!answers || !questions) {
        return res.status(400).json({ message: 'بيانات ناقصة' });
      }

      let correct = 0;
      const categories: Record<string, { correct: number; total: number }> = {};
      
      for (const q of questions) {
        if (!categories[q.category]) {
          categories[q.category] = { correct: 0, total: 0 };
        }
        categories[q.category].total++;
        if (answers[q.id] === q.correctAnswer) {
          correct++;
          categories[q.category].correct++;
        }
      }

      const percentage = Math.round((correct / questions.length) * 100);
      let level = 'مبتدئ';
      if (percentage >= 90) level = 'متقدم';
      else if (percentage >= 70) level = 'متوسط متقدم';
      else if (percentage >= 50) level = 'متوسط';
      else if (percentage >= 30) level = 'مبتدئ متقدم';

      res.json({
        score: correct,
        total: questions.length,
        percentage,
        level,
        categories,
      });
    } catch (error: any) {
      res.status(500).json({ message: 'خطأ في تقييم الاختبار' });
    }
  });

  app.post('/api/ai/evaluate-student', requireAuth, requireSupervisorOrAdmin, async (req: any, res) => {
    try {
      const { studentId, reviewRating, newMemorizationRating, errors, teacherNotes } = req.body;

      if (aiService.isConfigured()) {
        const prompt = `أنت مقيّم في أكاديمية لتحفيظ القرآن. قيّم أداء الطالب بناءً على:
- تقييم المراجعة: ${reviewRating}/10
- تقييم الحفظ الجديد: ${newMemorizationRating}/10
- الأخطاء: ${JSON.stringify(errors || [])}
- ملاحظات المعلم: ${teacherNotes || 'لا يوجد'}

أرجع JSON يحتوي على:
- overallRating: التقييم العام (من 10)
- feedback: تعليق مفصل بالعربية
- recommendations: مصفوفة من التوصيات
- strengths: نقاط القوة
- weaknesses: نقاط الضعف`;

        const result = await aiService.chat(prompt);
        try {
          const jsonMatch = result.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            return res.json(JSON.parse(jsonMatch[0]));
          }
        } catch (e) {
          console.log('AI parse failed');
        }
      }

      const avg = ((reviewRating || 0) + (newMemorizationRating || 0)) / 2;
      res.json({
        overallRating: Math.round(avg),
        feedback: avg >= 7 ? 'أداء جيد، استمر في التقدم' : avg >= 5 ? 'أداء مقبول، يحتاج مزيد من المراجعة' : 'يحتاج تحسين، ننصح بمراجعة مكثفة',
        recommendations: ['المراجعة اليومية', 'التركيز على أحكام التجويد'],
      });
    } catch (error: any) {
      console.error('AI evaluate-student error:', error.message);
      res.status(500).json({ message: 'خطأ في تقييم الطالب' });
    }
  });

  app.post('/api/ai/sheikh-assistant', requireAuth, requireSupervisorOrAdmin, async (req: any, res) => {
    try {
      if (!aiService.isConfigured()) {
        return res.status(503).json({ message: 'خدمة الذكاء الاصطناعي غير متاحة حالياً' });
      }
      const result = await aiService.getSheikhAssistant(req.body);
      res.json(result);
    } catch (error: any) {
      console.error('AI assistant error:', error.message);
      res.status(500).json({ message: 'خطأ في المساعد الذكي' });
    }
  });

  app.get('/api/ai/status', (_req, res) => {
    res.json({ configured: aiService.isConfigured() });
  });

  console.log("✅ AI routes setup");
}
