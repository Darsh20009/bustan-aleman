// نظام إدارة الدورات التحفيظية
export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  startDate: string;
  endDate: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: 'quran' | 'fiqh' | 'ramadan';
  maxStudents: number;
  currentStudents: number;
  price: number;
  isActive: boolean;
  requirements: string[];
  schedule: {
    days: string[];
    time: string;
    duration: string;
  };
  curriculum: {
    week: number;
    topic: string;
    objectives: string[];
    surahs?: string[];
  }[];
}

export interface CourseEnrollment {
  id: string;
  studentId: string;
  courseId: string;
  enrollmentDate: string;
  status: 'enrolled' | 'active' | 'completed' | 'dropped';
  progress: number;
  currentWeek: number;
  completedLessons: string[];
  attendance: {
    date: string;
    attended: boolean;
    notes?: string;
  }[];
  grades: {
    assessment: string;
    score: number;
    date: string;
  }[];
}

export class CourseManager {
  private courses: Course[] = [
    // رحلة إتقان التجويد - الدورة المميزة الأولى
    {
      id: 'tajweed-mastery-journey',
      title: 'رحلة إتقان التجويد',
      description: 'مسار تفاعلي متكامل يركز على الأحكام النظرية والتطبيق العملي للتجويد، مع متابعة فردية وتصحيح مباشر من المشرف المختص',
      instructor: 'الشيخ أحمد عبدالعزيز',
      startDate: '2025-02-01',
      endDate: '2025-06-01',
      level: 'intermediate',
      category: 'quran',
      maxStudents: 15,
      currentStudents: 8,
      price: 200,
      isActive: true,
      requirements: ['إتقان قراءة القرآن الكريم', 'معرفة أساسيات التجويد', 'الالتزام بالحضور والمراجعة'],
      schedule: {
        days: ['الأحد', 'الثلاثاء', 'الخميس'],
        time: '17:00',
        duration: '90 دقيقة'
      },
      curriculum: [
        {
          week: 1,
          topic: 'أحكام النون الساكنة والتنوين',
          objectives: ['إتقان الإظهار والإدغام', 'تطبيق الإقلاب والإخفاء', 'التدريب الصوتي المكثف'],
          surahs: ['البقرة (1-20)', 'آل عمران (1-10)']
        },
        {
          week: 2,
          topic: 'أحكام الميم الساكنة',
          objectives: ['فهم الإخفاء الشفوي', 'إتقان الإدغام الصغير', 'تطبيق الإظهار الشفوي'],
          surahs: ['النساء (1-15)', 'المائدة (1-10)']
        },
        {
          week: 3,
          topic: 'المدود وأنواعها',
          objectives: ['تعلم المد الطبيعي والفرعي', 'إتقان مد البدل والعوض', 'تطبيق المد المنفصل والمتصل'],
          surahs: ['الأنعام (1-20)', 'الأعراف (1-15)']
        },
        {
          week: 4,
          topic: 'القلقلة وأحكام الوقف',
          objectives: ['إتقان قلقلة الحروف الخمسة', 'فهم أحكام الوقف والابتداء', 'تطبيق السكتات'],
          surahs: ['الأنفال', 'التوبة (1-30)']
        }
      ]
    },
    
    // رحلة حفظ جزء عم - للمبتدئين والأطفال
    {
      id: 'juz-amma-journey',
      title: 'رحلة حفظ جزء عم',
      description: 'رحلة تعليمية مصممة خصيصاً للصغار والمبتدئين بأساليب تحفيزية ومتنوعة، مع نظام مكافآت وتتبع تقدم يومي',
      instructor: 'الأستاذة فاطمة الزهراء',
      startDate: '2025-01-15',
      endDate: '2025-05-15',
      level: 'beginner',
      category: 'quran',
      maxStudents: 25,
      currentStudents: 12,
      price: 0,
      isActive: true,
      requirements: ['معرفة الحروف العربية', 'العمر من 6-16 سنة', 'موافقة ولي الأمر'],
      schedule: {
        days: ['السبت', 'الاثنين', 'الأربعاء'],
        time: '16:00',
        duration: '60 دقيقة'
      },
      curriculum: [
        {
          week: 1,
          topic: 'السور القصيرة الأساسية',
          objectives: ['حفظ الفاتحة والمعوذتين', 'فهم معاني السور البسيطة', 'إتقان التلاوة مع التجويد الأساسي'],
          surahs: ['الفاتحة', 'الناس', 'الفلق', 'الإخلاص']
        },
        {
          week: 2,
          topic: 'سور التوحيد والدعاء',
          objectives: ['حفظ سورة المسد والكافرون', 'فهم مفهوم التوحيد', 'تعلم آداب الدعاء'],
          surahs: ['الكافرون', 'المسد', 'النصر']
        },
        {
          week: 3,
          topic: 'سور النهاية والبداية',
          objectives: ['حفظ الماعون والكوثر', 'فهم أهمية العمل الصالح', 'تطبيق معاني السور في الحياة'],
          surahs: ['الكوثر', 'الماعون', 'قريش']
        }
      ]
    },
    
    // رحلة المتون العلمية - للمتقدمين
    {
      id: 'matn-journey',
      title: 'رحلة المتون العلمية',
      description: 'دورات متقدمة لحفظ ودراسة المتون التراثية مثل تحفة الأطفال والجزرية، مع شرح مفصل وتطبيقات عملية',
      instructor: 'الدكتور عبدالله الحكيم',
      startDate: '2025-03-01',
      endDate: '2025-12-01',
      level: 'advanced',
      category: 'quran',
      maxStudents: 12,
      currentStudents: 5,
      price: 500,
      isActive: true,
      requirements: ['إتقان التجويد النظري والعملي', 'حفظ جزء عم كاملاً', 'خبرة في دراسة العلوم الشرعية'],
      schedule: {
        days: ['الجمعة', 'السبت'],
        time: '19:00',
        duration: '120 دقيقة'
      },
      curriculum: [
        {
          week: 1,
          topic: 'مقدمة في علم التجويد وتحفة الأطفال',
          objectives: ['فهم منهجية المتون', 'حفظ مقدمة تحفة الأطفال', 'دراسة تاريخ علم التجويد'],
          surahs: ['مراجعة عامة للتطبيق']
        },
        {
          week: 2,
          topic: 'أحكام الاستعاذة والبسملة',
          objectives: ['حفظ الأبيات المتعلقة بالاستعاذة', 'فهم أحكام البسملة', 'تطبيق عملي مع المتون'],
          surahs: ['تطبيق على فواتح السور']
        },
        {
          week: 3,
          topic: 'أحكام النون الساكنة في المتن',
          objectives: ['حفظ أبيات النون الساكنة والتنوين', 'شرح مفصل للأحكام الأربعة', 'تطبيق شفهي وتحليلي'],
          surahs: ['تطبيق متقدم على آيات مختارة']
        }
      ]
    },
    
    // إبقاء بعض الدورات الأساسية الموجودة
    {
      id: 'quran-basic',
      title: 'دورة تحفيظ القرآن الكريم - المستوى الأساسي',
      description: 'دورة شاملة لحفظ القرآن الكريم مع أحدث الأساليب التعليمية والمتابعة الشخصية لكل طالب',
      instructor: 'الشيخ أحمد يوسف',
      startDate: '2025-02-15',
      endDate: '2025-08-15',
      level: 'beginner',
      category: 'quran',
      maxStudents: 20,
      currentStudents: 5,
      price: 0,
      isActive: true,
      requirements: ['إتقان قراءة الحروف العربية', 'الالتزام بالحضور'],
      schedule: {
        days: ['الأحد', 'الثلاثاء', 'الخميس'],
        time: '16:00',
        duration: '90 دقيقة'
      },
      curriculum: [
        {
          week: 1,
          topic: 'مراجعة التجويد الأساسي',
          objectives: ['إتقان الحروف والحركات', 'فهم أحكام النون الساكنة'],
          surahs: ['الفاتحة', 'الناس', 'الفلق']
        },
        {
          week: 2,
          topic: 'حفظ جزء عم - القسم الأول',
          objectives: ['حفظ سورة النبأ', 'فهم معاني الآيات'],
          surahs: ['النبأ']
        }
      ]
    },
    {
      id: 'ramadan-level1',
      title: 'المسابقة الرمضانية - المستوى الأول',
      description: 'مسابقة رمضانية مخصصة للمبتدئين في حفظ القرآن مع جوائز قيمة ومتابعة يومية',
      instructor: 'الأستاذة فاطمة الزهراء',
      startDate: '2025-03-01',
      endDate: '2025-03-30',
      level: 'beginner',
      category: 'ramadan',
      maxStudents: 15,
      currentStudents: 8,
      price: 0,
      isActive: true,
      requirements: ['حفظ جزء عم'],
      schedule: {
        days: ['يومياً'],
        time: '19:00',
        duration: '60 دقيقة'
      },
      curriculum: [
        {
          week: 1,
          topic: 'مراجعة جزء عم',
          objectives: ['إتقان التلاوة', 'فهم المعاني'],
          surahs: ['النبأ', 'النازعات', 'عبس']
        }
      ]
    },
    {
      id: 'fiqh-kids',
      title: 'دورة الفقه للأطفال',
      description: 'دورة تفاعلية لتعليم الأطفال أساسيات الفقه والعبادات بطريقة ممتعة ومبسطة',
      instructor: 'الشيخ محمد العلي',
      startDate: '2025-03-20',
      endDate: '2025-06-20',
      level: 'beginner',
      category: 'fiqh',
      maxStudents: 30,
      currentStudents: 12,
      price: 0,
      isActive: true,
      requirements: ['العمر: 6-12 سنة'],
      schedule: {
        days: ['السبت'],
        time: '10:00',
        duration: '60 دقيقة'
      },
      curriculum: [
        {
          week: 1,
          topic: 'الطهارة',
          objectives: ['تعلم الوضوء', 'أهمية النظافة'],
        }
      ]
    },

    // الدورات الإبداعية الجديدة المضافة
    {
      id: 'seerah-adventure',
      title: 'رحلة السيرة النبوية التفاعلية',
      description: 'رحلة شيقة عبر حياة الرسول صلى الله عليه وسلم مع قصص تفاعلية ومحطات تاريخية مصورة، تجمع بين التعلم والمتعة',
      instructor: 'الدكتور إبراهيم الصالح',
      startDate: '2025-02-10',
      endDate: '2025-07-10',
      level: 'beginner',
      category: 'fiqh',
      maxStudents: 25,
      currentStudents: 8,
      price: 150,
      isActive: true,
      requirements: ['حب التعلم والاستطلاع', 'العمر من 10 سنوات فما فوق'],
      schedule: {
        days: ['الجمعة'],
        time: '15:30',
        duration: '90 دقيقة'
      },
      curriculum: [
        {
          week: 1,
          topic: 'ولادة النور - مكة المكرمة',
          objectives: ['التعرف على نسب النبي الكريم', 'قصة الفيل وحماية البيت الحرام', 'أحوال الجاهلية قبل الإسلام'],
          surahs: ['سورة الفيل للتدبر والحفظ']
        },
        {
          week: 2,
          topic: 'طفولة وشباب الأمين',
          objectives: ['صفات النبي في صغره', 'حادثة شق الصدر', 'رحلاته التجارية وصدقه'],
          surahs: ['سورة الشرح وارتباطها بشق الصدر']
        },
        {
          week: 3,
          topic: 'بداية الوحي والدعوة',
          objectives: ['حادثة غار حراء', 'أول آية نزلت', 'الدعوة السرية والجهرية'],
          surahs: ['سورة العلق - أول ما نزل من القرآن']
        },
        {
          week: 4,
          topic: 'الهجرة المباركة',
          objectives: ['أسباب الهجرة وحكمتها', 'قصة الغار وحماية الله', 'وصول المدينة واستقبال الأنصار'],
          surahs: ['آيات الهجرة في سورة التوبة']
        }
      ]
    },

    {
      id: 'quran-stories',
      title: 'حكايات القرآن الذهبية',
      description: 'استكشاف قصص الأنبياء والصالحين في القرآن الكريم بأسلوب سردي جميل مع الدروس والعبر المستفادة',
      instructor: 'الأستاذة نور الهدى',
      startDate: '2025-01-25',
      endDate: '2025-06-25',
      level: 'beginner',
      category: 'quran',
      maxStudents: 20,
      currentStudents: 15,
      price: 100,
      isActive: true,
      requirements: ['محبة القصص والعبر', 'القدرة على الحفظ والفهم'],
      schedule: {
        days: ['الثلاثاء', 'الخميس'],
        time: '17:00',
        duration: '75 دقيقة'
      },
      curriculum: [
        {
          week: 1,
          topic: 'قصة آدم عليه السلام',
          objectives: ['خلق آدم وتكريم الإنسان', 'قصة الشيطان والمعصية', 'التوبة والاستغفار'],
          surahs: ['آيات خلق آدم في سورة البقرة', 'سورة طه']
        },
        {
          week: 2,
          topic: 'نوح وقومه - دروس في الصبر',
          objectives: ['دعوة نوح الطويلة', 'بناء السفينة والطوفان', 'جزاء الصابرين'],
          surahs: ['سورة نوح', 'قصة نوح في سورة هود']
        },
        {
          week: 3,
          topic: 'إبراهيم الخليل - قصة التوحيد',
          objectives: ['كسر الأصنام والحجة على قومه', 'النار والمعجزة', 'قصة الذبح العظيم'],
          surahs: ['سورة إبراهيم', 'قصة إبراهيم في سورة الأنبياء']
        },
        {
          week: 4,
          topic: 'موسى وفرعون - نصرة المظلومين',
          objectives: ['ولادة موسى وإنقاذه', 'الآيات التسع', 'خروج بني إسرائيل'],
          surahs: ['سورة طه', 'سورة القصص']
        }
      ]
    },

    {
      id: 'islamic-values',
      title: 'أخلاقنا الجميلة - بناء الشخصية الإسلامية',
      description: 'دورة تطبيقية لغرس القيم والأخلاق الإسلامية في الحياة اليومية مع أنشطة تفاعلية وقصص ملهمة',
      instructor: 'الشيخ عمر الفاروق',
      startDate: '2025-03-15',
      endDate: '2025-08-15',
      level: 'intermediate',
      category: 'fiqh',
      maxStudents: 30,
      currentStudents: 18,
      price: 0,
      isActive: true,
      requirements: ['الرغبة في التطوير الشخصي', 'الاستعداد للتطبيق العملي'],
      schedule: {
        days: ['الأحد', 'الأربعاء'],
        time: '20:00',
        duration: '60 دقيقة'
      },
      curriculum: [
        {
          week: 1,
          topic: 'الصدق والأمانة - أساس التعامل',
          objectives: ['تعريف الصدق وأهميته', 'قصص الأنبياء في الصدق', 'تطبيقات عملية في الحياة'],
          surahs: ['آيات الصدق في القرآن الكريم']
        },
        {
          week: 2,
          topic: 'الرحمة والتسامح',
          objectives: ['رحمة النبي بالناس والحيوان', 'العفو عند المقدرة', 'التسامح مع المخطئين'],
          surahs: ['سورة الرحمن', 'آيات الرحمة والمغفرة']
        },
        {
          week: 3,
          topic: 'العدل والإنصاف',
          objectives: ['العدل في الإسلام', 'عدم الظلم حتى مع الأعداء', 'إنصاف الضعيف والمظلوم'],
          surahs: ['آيات العدل في سورة النساء والمائدة']
        },
        {
          week: 4,
          topic: 'التواضع والرفق',
          objectives: ['التواضع مع الناس', 'الرفق في التعامل', 'خفض الجناح للوالدين'],
          surahs: ['سورة الفرقان - صفات عباد الرحمن']
        }
      ]
    },

    {
      id: 'quran-healing',
      title: 'القرآن شفاء - الرقية الشرعية والأذكار',
      description: 'تعلم الرقية الشرعية الصحيحة من القرآن والسنة، مع الأذكار اليومية وآدابها لحفظ النفس والأهل',
      instructor: 'الشيخ أبو بكر الرقاشي',
      startDate: '2025-04-01',
      endDate: '2025-06-01',
      level: 'intermediate',
      category: 'quran',
      maxStudents: 15,
      currentStudents: 7,
      price: 200,
      isActive: true,
      requirements: ['إتقان قراءة القرآن', 'فهم أهمية الرقية الشرعية', 'الالتزام بالسنة النبوية'],
      schedule: {
        days: ['الجمعة'],
        time: '21:00',
        duration: '90 دقيقة'
      },
      curriculum: [
        {
          week: 1,
          topic: 'أسس الرقية الشرعية من الكتاب والسنة',
          objectives: ['ما هي الرقية وحكمها', 'الفرق بين الرقية الشرعية والشركية', 'آداب الراقي والمسترقي'],
          surahs: ['الفاتحة', 'آية الكرسي', 'المعوذتين']
        },
        {
          week: 2,
          topic: 'سور وآيات الشفاء',
          objectives: ['حفظ سورة البقرة وخواصها', 'آيات إبطال السحر', 'الآيات المجربة للشفاء'],
          surahs: ['سورة البقرة (255-257)', 'سورة الصافات', 'سورة طه']
        },
        {
          week: 3,
          topic: 'الأذكار اليومية للحفظ والوقاية',
          objectives: ['أذكار الصباح والمساء', 'دعاء دخول المنزل والخروج', 'التحصينات النبوية'],
          surahs: ['سورة الملك للتحصين', 'خواتيم سورة البقرة']
        },
        {
          week: 4,
          topic: 'العلاج بالقرآن والدعاء',
          objectives: ['طرق الرقية العملية', 'الأدعية المأثورة للشفاء', 'علاج أمراض القلوب'],
          surahs: ['سورة الشفاء (الإسراء 82)', 'أدعية من السنة']
        }
      ]
    },

    {
      id: 'family-quran',
      title: 'البيت القرآني - تربية الأسرة على القرآن',
      description: 'دورة موجهة للآباء والأمهات لبناء بيئة قرآنية في المنزل وتربية الأبناء على حب القرآن وتطبيق تعاليمه',
      instructor: 'الدكتورة أسماء الحسنى',
      startDate: '2025-02-20',
      endDate: '2025-07-20',
      level: 'beginner',
      category: 'fiqh',
      maxStudents: 20,
      currentStudents: 12,
      price: 180,
      isActive: true,
      requirements: ['كونك أب أو أم', 'الرغبة في التربية القرآنية', 'الاستعداد للتطبيق مع الأسرة'],
      schedule: {
        days: ['السبت'],
        time: '14:00',
        duration: '120 دقيقة'
      },
      curriculum: [
        {
          week: 1,
          topic: 'بناء البيئة القرآنية في المنزل',
          objectives: ['أهمية القرآن في التربية', 'جعل القرآن جزءًا من الحياة اليومية', 'القدوة العملية للوالدين'],
          surahs: ['سورة لقمان - نصائح الوالد لابنه']
        },
        {
          week: 2,
          topic: 'تعليم الأطفال حب القرآن',
          objectives: ['طرق ممتعة لتحفيظ الأطفال', 'ربط القرآن بالأنشطة اليومية', 'مكافآت وتشجيع الحفظ'],
          surahs: ['السور القصيرة المناسبة للأطفال']
        },
        {
          week: 3,
          topic: 'التربية بالقصص القرآنية',
          objectives: ['استخراج العبر من قصص القرآن', 'تبسيط المفاهيم للأطفال', 'التطبيق العملي للقيم'],
          surahs: ['قصص مختارة من سور يوسف ومريم والكهف']
        },
        {
          week: 4,
          topic: 'الأخلاق القرآنية في التعامل الأسري',
          objectives: ['آداب التعامل بين أفراد الأسرة', 'حل المشكلات بالحكمة القرآنية', 'بناء التواصل الإيجابي'],
          surahs: ['آيات الأخلاق والمعاملة في القرآن']
        }
      ]
    },

    {
      id: 'quran-sciences',
      title: 'علوم القرآن المبسطة',
      description: 'جولة في علوم القرآن الكريم: أسباب النزول، الناسخ والمنسوخ، إعجاز القرآن، وغيرها من العلوم بأسلوب مبسط وشيق',
      instructor: 'الدكتور محمد التفسير',
      startDate: '2025-05-01',
      endDate: '2025-10-01',
      level: 'advanced',
      category: 'quran',
      maxStudents: 18,
      currentStudents: 6,
      price: 300,
      isActive: true,
      requirements: ['حفظ جزء عم على الأقل', 'خلفية في العلوم الشرعية', 'الرغبة في التعمق في علوم القرآن'],
      schedule: {
        days: ['الاثنين', 'الأربعاء'],
        time: '21:30',
        duration: '90 دقيقة'
      },
      curriculum: [
        {
          week: 1,
          topic: 'نزول القرآن وجمعه',
          objectives: ['كيف نزل القرآن', 'مراحل جمع المصحف', 'المصاحف العثمانية'],
          surahs: ['مراجعة سورة القيامة والواقعة']
        },
        {
          week: 2,
          topic: 'أسباب النزول وأثرها في التفسير',
          objectives: ['أهمية معرفة أسباب النزول', 'أمثلة من أسباب النزول', 'الاستفادة في الفهم والتطبيق'],
          surahs: ['آيات لها أسباب نزول واضحة']
        },
        {
          week: 3,
          topic: 'المكي والمدني',
          objectives: ['خصائص القرآن المكي والمدني', 'الحكمة من التدرج في التشريع', 'أمثلة عملية'],
          surahs: ['مقارنة بين سور مكية ومدنية']
        },
        {
          week: 4,
          topic: 'إعجاز القرآن اللغوي والعلمي',
          objectives: ['الإعجاز البلاغي والبياني', 'الإشارات العلمية في القرآن', 'التحدي للبشر'],
          surahs: ['آيات الإعجاز في القرآن الكريم']
        }
      ]
    }
  ];

  private enrollments: CourseEnrollment[] = [];

  getAllCourses(): Course[] {
    return this.courses.filter(course => course.isActive);
  }

  getCourse(courseId: string): Course | null {
    return this.courses.find(c => c.id === courseId) || null;
  }

  async enrollStudent(studentId: string, courseId: string): Promise<CourseEnrollment | null> {
    const course = this.getCourse(courseId);
    if (!course) return null;

    if (course.currentStudents >= course.maxStudents) {
      throw new Error('الدورة ممتلئة');
    }

    // تحقق من التسجيل المسبق
    const existingEnrollment = this.enrollments.find(
      e => e.studentId === studentId && e.courseId === courseId
    );
    if (existingEnrollment) {
      throw new Error('أنت مسجل في هذه الدورة بالفعل');
    }

    const enrollment: CourseEnrollment = {
      id: `enrollment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      studentId,
      courseId,
      enrollmentDate: new Date().toISOString(),
      status: 'enrolled',
      progress: 0,
      currentWeek: 1,
      completedLessons: [],
      attendance: [],
      grades: []
    };

    this.enrollments.push(enrollment);
    course.currentStudents++;

    return enrollment;
  }

  getStudentEnrollments(studentId: string): CourseEnrollment[] {
    return this.enrollments.filter(e => e.studentId === studentId);
  }

  updateProgress(enrollmentId: string, progress: number, completedLesson?: string): boolean {
    const enrollment = this.enrollments.find(e => e.id === enrollmentId);
    if (!enrollment) return false;

    enrollment.progress = Math.min(100, Math.max(0, progress));
    
    if (completedLesson && !enrollment.completedLessons.includes(completedLesson)) {
      enrollment.completedLessons.push(completedLesson);
    }

    if (enrollment.progress >= 100) {
      enrollment.status = 'completed';
    } else if (enrollment.progress > 0) {
      enrollment.status = 'active';
    }

    return true;
  }

  addAttendance(enrollmentId: string, date: string, attended: boolean, notes?: string): boolean {
    const enrollment = this.enrollments.find(e => e.id === enrollmentId);
    if (!enrollment) return false;

    enrollment.attendance.push({
      date,
      attended,
      notes
    });

    return true;
  }
}

export const courseManager = new CourseManager();