import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Heart, Star, Users, BookOpen, Target, Eye } from "lucide-react";

export default function About() {
  const values = [
    {
      icon: Heart,
      title: "الإخلاص",
      description: "كل ما نقدمه يهدف إلى رضا الله",
      color: "text-islamic-green"
    },
    {
      icon: Star,
      title: "الجودة",
      description: "نحرص على تقديم محتوى تعليمي وترفيهي بمستوى عالٍ من الاحترافية",
      color: "text-warm-gold"
    },
    {
      icon: Users,
      title: "الشمولية",
      description: "نهتم بتلبية احتياجات جميع الفئات العمرية",
      color: "text-earth-brown"
    },
    {
      icon: BookOpen,
      title: "الإبداع",
      description: "نبتكر طرقًا جديدة تجمع بين التعليم والمتعة لتعزيز الإيمان",
      color: "text-islamic-green"
    }
  ];

  const faqs = [
    {
      question: "ما الخدمات التي تقدمها المنصة؟",
      answer: "نقدم دورات تحفيظ القرآن الكريم، دورات الفقه الإسلامي، البرامج الرمضانية التعليمية، والألعاب التعليمية للأطفال. جميع برامجنا مصممة لتناسب مختلف الأعمار والمستويات التعليمية."
    },
    {
      question: "لماذا تختار بستان الإيمان؟",
      answer: "نحن نجمع بين الأصالة الإسلامية والأساليب التعليمية الحديثة. فريقنا من المتخصصين المؤهلين يقدم برامج مخصصة لكل طالب، مع اهتمام خاص بالجانب الروحي والتعليمي معًا."
    },
    {
      question: "ما هي قيمنا؟",
      answer: "قيمنا الأساسية هي الإخلاص في العمل لله، الجودة في التعليم، الشمولية لجميع الفئات، والإبداع في طرق التدريس. نؤمن بأن التعليم الديني يجب أن يكون ممتعًا وهادفًا في الوقت نفسه."
    },
    {
      question: "تعرف على التزامنا؟",
      answer: "نحن ملتزمون بأن نكون شريكك الدائم في رحلتك نحو رضا الله. هدفنا تقديم تجربة تعليمية فريدة تشعل شغفك بالدين، وتمنحك الأدوات اللازمة لنقل هذا الشغف إلى من حولك."
    }
  ];

  return (
    <div className="min-h-screen bg-warm-white">
      <Navigation />
      
      {/* Header */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 
              className="text-5xl font-bold font-arabic-serif text-islamic-green mb-6"
              data-testid="page-title"
            >
              من نحن
            </h1>
            <div className="max-w-4xl mx-auto">
              <p className="text-xl text-gray-700 leading-relaxed arabic-text">
                مرحبًا بكم في بستان الإيمان، المنصة التي تُلهم القلوب وتنير العقول برحلة مميزة نحو العلم والإيمان. هنا تجدون مزيجًا متكاملاً بين تحفيظ القرآن الكريم، تعلم الفقه بأسلوب مبسط، والاستمتاع بألعاب رمضانية تعليمية مصممة خصيصًا للأطفال لتغرس فيهم القيم الدينية منذ الصغر.
              </p>
            </div>
            <img 
              src="https://images.unsplash.com/photo-1542816417-0983c9c9ad53?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500" 
              alt="Quran book" 
              className="rounded-xl shadow-lg mx-auto mt-8 w-full max-w-2xl h-auto"
              data-testid="img-quran-book"
            />
          </div>
        </div>
      </section>

      {/* Mission and Vision */}
      <section className="py-16 bg-light-beige">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Mission */}
            <Card className="bg-white islamic-card">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <Target className="text-4xl text-islamic-green mb-4 mx-auto" size={64} />
                  <h2 className="text-3xl font-bold font-arabic-serif text-islamic-green">
                    رسالتنا
                  </h2>
                </div>
                <p className="text-lg text-gray-700 leading-relaxed arabic-text">
                  في بستان الإيمان، نؤمن بأن الإيمان يبدأ من القلب ويكبر بالعلم والعمل. رسالتنا هي أن نوفر لكل فرد فرصة لتعزيز علاقته بالله، سواء من خلال الحفظ، التعلّم، أو المشاركة في أنشطة ممتعة وهادفة.
                </p>
                <img 
                  src="https://images.unsplash.com/photo-1584467735815-f778f274e296?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=300" 
                  alt="Islamic book with wooden pen" 
                  className="rounded-lg mt-6 w-full h-48 object-cover"
                  data-testid="img-mission"
                />
              </CardContent>
            </Card>

            {/* Vision */}
            <Card className="bg-islamic-green text-white islamic-card">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <Eye className="text-4xl text-warm-gold mb-4 mx-auto" size={64} />
                  <h2 className="text-3xl font-bold font-arabic-serif">رؤيتنا</h2>
                </div>
                <p className="text-lg leading-relaxed opacity-95 arabic-text">
                  أن نكون الوجهة الأولى لكل من يبحث عن تعليم ديني متكامل، يجمع بين الأصالة الإسلامية والأساليب التعليمية الحديثة، ونخلق أجيالًا تفخر بدينها وتساهم في بناء مجتمع قائم على القيم النبيلة.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 
            className="text-4xl font-bold font-arabic-serif text-islamic-green text-center mb-12"
            data-testid="values-title"
          >
            قيمنا
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="values-grid">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <Card key={index} className="islamic-card text-center border-t-4 border-islamic-green">
                  <CardContent className="p-6">
                    <IconComponent 
                      className={`text-3xl ${value.color} mb-4 mx-auto`} 
                      size={48} 
                    />
                    <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                    <p className="text-gray-600 arabic-text">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-light-beige">
        <div className="container mx-auto px-4">
          <h2 
            className="text-4xl font-bold font-arabic-serif text-islamic-green text-center mb-12"
            data-testid="faq-title"
          >
            أهم الأسئلة التي تمت الإجابة عنها
          </h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-center text-gray-600 mb-8">
              في هذا القسم، يمكنك الإجابة عن الأسئلة الشائعة بسهولة وفعالية.
            </p>
            <Accordion type="single" collapsible className="space-y-4" data-testid="faq-accordion">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`}
                  className="bg-white rounded-lg border border-border"
                >
                  <AccordionTrigger 
                    className="px-6 py-4 text-right hover:no-underline hover:bg-accent/50 rounded-lg font-semibold"
                    data-testid={`faq-question-${index}`}
                  >
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent 
                    className="px-6 pb-4 text-gray-700 arabic-text"
                    data-testid={`faq-answer-${index}`}
                  >
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Commitment Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 
              className="text-4xl font-bold font-arabic-serif text-islamic-green mb-8"
              data-testid="commitment-title"
            >
              التزامنا معك
            </h2>
            <div className="bg-gradient-to-r from-islamic-green to-warm-gold p-8 rounded-xl text-white">
              <p className="text-xl leading-relaxed arabic-text">
                نحن في بستان الإيمان ملتزمون بأن نكون شريكك الدائم في رحلتك نحو رضا الله. هدفنا هو تقديم تجربة تعليمية فريدة تشعل شغفك بالدين، وتمنحك الأدوات اللازمة لنقل هذا الشغف إلى من حولك.
              </p>
              <p className="text-lg mt-6 arabic-text">
                انضم إلينا اليوم وازرع في قلبك بذرة الإيمان، لتنمو وتُثمر نورًا وهداية!
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
