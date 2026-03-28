const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const API_URL = 'https://api.openai.com/v1/chat/completions';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

async function callOpenAI(messages: ChatMessage[], temperature = 0.7, maxTokens = 1500): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

export const aiService = {
  async evaluateStudentPerformance(data: {
    studentName: string;
    newMemorization?: string;
    review?: string;
    errors: { surah: string; ayah: number; type: string; details?: string }[];
    totalAyahs: number;
    previousLevel?: string;
  }): Promise<{ rating: number; comment: string; recommendations: string[] }> {
    const errorDetails = data.errors.length > 0
      ? data.errors.map(e => `- ${e.surah} آية ${e.ayah}: ${e.type}${e.details ? ` (${e.details})` : ''}`).join('\n')
      : 'لا توجد أخطاء';

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `أنت معلم قرآن كريم خبير ومتخصص في التجويد والحفظ. مهمتك تقييم أداء الطالب وتقديم ملاحظات بناءة باللغة العربية.
يجب أن تُرجع JSON بالتنسيق التالي:
{
  "rating": رقم من 1 إلى 5,
  "comment": "تعليق مفصل على الأداء",
  "recommendations": ["توصية 1", "توصية 2", "توصية 3"]
}`
      },
      {
        role: 'user',
        content: `قيّم أداء الطالب ${data.studentName}:
- الحفظ الجديد: ${data.newMemorization || 'لم يُحدد'}
- المراجعة: ${data.review || 'لم تُحدد'}
- إجمالي الآيات المسمعة: ${data.totalAyahs}
- الأخطاء:
${errorDetails}
- المستوى السابق: ${data.previousLevel || 'غير محدد'}`
      }
    ];

    try {
      const response = await callOpenAI(messages, 0.5, 800);
      const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const result = JSON.parse(cleaned);
      return {
        rating: Math.min(5, Math.max(1, result.rating || 3)),
        comment: result.comment || 'تم التقييم',
        recommendations: result.recommendations || [],
      };
    } catch (error) {
      console.error('AI evaluation error:', error);
      const errorCount = data.errors.length;
      const rating = errorCount === 0 ? 5 : errorCount <= 2 ? 4 : errorCount <= 5 ? 3 : 2;
      return {
        rating,
        comment: errorCount === 0 ? 'أداء ممتاز! استمر في التميز.' : `تم رصد ${errorCount} أخطاء. يُنصح بمراجعة الآيات التي وردت فيها الأخطاء.`,
        recommendations: ['مراجعة الآيات التي وردت فيها أخطاء', 'الاستماع للقارئ قبل التسميع'],
      };
    }
  },

  async generateMemorizationPlan(data: {
    studentName: string;
    currentLevel: string;
    lastMemorized?: string;
    reviewNeeded?: string[];
    repetitionType: 'half_page' | 'full_page' | 'custom';
    customAmount?: string;
  }): Promise<{ newMemorization: string; nearReview: string; farReview: string; tips: string }> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `أنت مخطط حفظ قرآن ذكي. بناءً على مستوى الطالب وتقدمه، حدد خطة الحفظ والمراجعة.
أرجع JSON:
{
  "newMemorization": "الحفظ الجديد المطلوب (سورة وآيات)",
  "nearReview": "مراجعة قريبة (ما تم حفظه مؤخراً)",
  "farReview": "مراجعة بعيدة (حفظ قديم)",
  "tips": "نصائح للطالب"
}`
      },
      {
        role: 'user',
        content: `خطط للطالب ${data.studentName}:
- المستوى الحالي: ${data.currentLevel}
- آخر ما حفظه: ${data.lastMemorized || 'غير محدد'}
- ما يحتاج مراجعة: ${data.reviewNeeded?.join(', ') || 'غير محدد'}
- نوع التكرار: ${data.repetitionType === 'half_page' ? 'نصف وجه' : data.repetitionType === 'full_page' ? 'وجه كامل' : data.customAmount || 'مخصص'}`
      }
    ];

    try {
      const response = await callOpenAI(messages, 0.5, 600);
      const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      return {
        newMemorization: 'يُحدد بواسطة الشيخ',
        nearReview: 'مراجعة آخر ما تم حفظه',
        farReview: 'مراجعة من بداية الحفظ',
        tips: 'استمر في المراجعة اليومية',
      };
    }
  },

  async evaluateRecitation(data: {
    expectedText: string;
    spokenText: string;
    surahName: string;
    startAyah: number;
    endAyah: number;
  }): Promise<{
    accuracy: number;
    errors: { ayah: number; expected: string; spoken: string; type: string }[];
    feedback: string;
    rating: number;
  }> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `أنت نظام تقييم تسميع القرآن الكريم. قارن بين النص المتوقع والنص المنطوق وحدد الأخطاء.
أنواع الأخطاء: حفظ (نسيان/خلط)، تجويد (مخارج/صفات)، ترتيب (تقديم/تأخير)
أرجع JSON:
{
  "accuracy": نسبة الدقة من 0 لـ 100,
  "errors": [{"ayah": رقم, "expected": "المتوقع", "spoken": "المنطوق", "type": "نوع الخطأ"}],
  "feedback": "ملاحظات",
  "rating": تقييم من 1 لـ 5
}`
      },
      {
        role: 'user',
        content: `قيّم التسميع:
سورة: ${data.surahName}
الآيات: ${data.startAyah} - ${data.endAyah}
النص المتوقع: ${data.expectedText}
النص المنطوق: ${data.spokenText}`
      }
    ];

    try {
      const response = await callOpenAI(messages, 0.3, 1000);
      const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      return {
        accuracy: 0,
        errors: [],
        feedback: 'لم يتم التقييم - يرجى المحاولة مرة أخرى',
        rating: 0,
      };
    }
  },

  async generateLevelTest(): Promise<{
    questions: { id: number; question: string; options: string[]; correctAnswer: number; category: string }[];
  }> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `أنشئ اختبار تحديد مستوى لطالب قرآن كريم جديد. الاختبار يتكون من 10 أسئلة متنوعة تغطي:
- معرفة السور وترتيبها
- التجويد الأساسي
- الحفظ (إكمال آيات)
- معاني كلمات قرآنية
أرجع JSON:
{
  "questions": [
    {
      "id": 1,
      "question": "نص السؤال",
      "options": ["خيار1", "خيار2", "خيار3", "خيار4"],
      "correctAnswer": 0,
      "category": "حفظ/تجويد/معرفة/معاني"
    }
  ]
}`
      },
      {
        role: 'user',
        content: 'أنشئ اختبار تحديد مستوى لطالب جديد يشمل 10 أسئلة متنوعة.'
      }
    ];

    try {
      const response = await callOpenAI(messages, 0.8, 2000);
      const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      return {
        questions: [
          { id: 1, question: 'ما هي أول سورة في القرآن الكريم؟', options: ['البقرة', 'الفاتحة', 'الناس', 'الإخلاص'], correctAnswer: 1, category: 'معرفة' },
          { id: 2, question: 'كم عدد أجزاء القرآن الكريم؟', options: ['20', '25', '30', '35'], correctAnswer: 2, category: 'معرفة' },
          { id: 3, question: 'ما حكم النون الساكنة قبل حرف الباء؟', options: ['إظهار', 'إدغام', 'إقلاب', 'إخفاء'], correctAnswer: 2, category: 'تجويد' },
          { id: 4, question: 'أكمل: "إِيَّاكَ نَعْبُدُ..."', options: ['وإياك نستعين', 'وإياك نسأل', 'وإياك نرجو', 'وإياك نخاف'], correctAnswer: 0, category: 'حفظ' },
          { id: 5, question: 'ما هي أطول سورة في القرآن؟', options: ['آل عمران', 'النساء', 'البقرة', 'المائدة'], correctAnswer: 2, category: 'معرفة' },
          { id: 6, question: 'ما معنى "الصمد"؟', options: ['الأول', 'المستغنى عن كل شيء', 'القوي', 'العظيم'], correctAnswer: 1, category: 'معاني' },
          { id: 7, question: 'كم عدد آيات سورة الفاتحة؟', options: ['5', '6', '7', '8'], correctAnswer: 2, category: 'معرفة' },
          { id: 8, question: 'ما هو الإدغام؟', options: ['إخراج الحرف من مخرجه', 'دمج حرفين في حرف واحد', 'قلب الحرف', 'إخفاء الحرف'], correctAnswer: 1, category: 'تجويد' },
          { id: 9, question: 'أكمل: "قُلْ هُوَ اللَّهُ..."', options: ['أحد', 'واحد', 'صمد', 'عظيم'], correctAnswer: 0, category: 'حفظ' },
          { id: 10, question: 'ما هي السورة التي تعدل ثلث القرآن؟', options: ['الفاتحة', 'الكوثر', 'الإخلاص', 'الفلق'], correctAnswer: 2, category: 'معرفة' },
        ],
      };
    }
  },

  async getSheikhAssistant(data: {
    sheikhName: string;
    students: { name: string; lastSession?: string; pendingReview?: string; level?: string }[];
  }): Promise<{ reminders: string[]; suggestions: string[] }> {
    const studentInfo = data.students.map(s =>
      `- ${s.name}: آخر حصة ${s.lastSession || 'غير محدد'}, مراجعة معلقة: ${s.pendingReview || 'لا يوجد'}, المستوى: ${s.level || 'غير محدد'}`
    ).join('\n');

    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `أنت مساعد ذكي للشيخ في منصة تحفيظ القرآن. قدم تذكيرات واقتراحات مفيدة.
أرجع JSON:
{
  "reminders": ["تذكير 1", "تذكير 2"],
  "suggestions": ["اقتراح 1", "اقتراح 2"]
}`
      },
      {
        role: 'user',
        content: `الشيخ: ${data.sheikhName}\nالطلاب:\n${studentInfo}`
      }
    ];

    try {
      const response = await callOpenAI(messages, 0.6, 600);
      const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(cleaned);
    } catch {
      return {
        reminders: ['تأكد من متابعة جميع طلابك اليوم'],
        suggestions: ['راجع تقدم الطلاب الذين لم يحضروا مؤخراً'],
      };
    }
  },

  async chat(prompt: string): Promise<string> {
    return callOpenAI([
      { role: 'system', content: 'أنت مساعد ذكي في أكاديمية بستان الإيمان لتحفيظ القرآن الكريم. أجب دائماً بالعربية.' },
      { role: 'user', content: prompt }
    ]);
  },

  isConfigured(): boolean {
    return !!OPENAI_API_KEY;
  },

};
