import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { BookOpen, Play, Volume2, RotateCcw, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function Quran() {
  const { user, isAuthenticated } = useAuth();
  const [currentSurah, setCurrentSurah] = useState(1);
  const [memorizedVerses, setMemorizedVerses] = useState(0);
  const [currentAyah, setCurrentAyah] = useState(1);

  // Sample Quran data (in a real app, this would come from an API)
  const surahs = [
    { number: 1, name: "الفاتحة", verses: 7, arabicName: "سُورَةُ الْفَاتِحَةِ" },
    { number: 2, name: "البقرة", verses: 286, arabicName: "سُورَةُ الْبَقَرَةِ" },
    { number: 3, name: "آل عمران", verses: 200, arabicName: "سُورَةُ آلِ عِمْرَانَ" },
    { number: 4, name: "النساء", verses: 176, arabicName: "سُورَةُ النِّسَاءِ" },
    { number: 5, name: "المائدة", verses: 120, arabicName: "سُورَةُ الْمَائِدَةِ" },
  ];

  const selectedSurah = surahs.find(s => s.number === currentSurah) || surahs[0];
  const progress = memorizedVerses > 0 ? (memorizedVerses / 6236) * 100 : 0; // Total Quran verses

  const memorizedSurahs = Math.floor(memorizedVerses / 10); // Rough calculation

  return (
    <div className="min-h-screen bg-warm-white">
      <Navigation />
      
      {/* Header */}
      <section className="hero-section">
        <div className="islamic-pattern-overlay"></div>
        <div className="hero-content container mx-auto px-4">
          <h1 
            className="text-4xl md:text-5xl font-bold font-arabic-serif mb-6"
            data-testid="page-title"
          >
            حفظ القرآن الكريم
          </h1>
          <p className="text-xl mb-8 opacity-90">
            رحلتك المباركة لحفظ كتاب الله الكريم
          </p>
          {!isAuthenticated && (
            <Button 
              onClick={() => window.location.href = "/api/login"}
              className="btn-islamic-secondary px-8 py-3 text-lg font-semibold"
              data-testid="button-login-to-start"
            >
              سجل دخولك لبدء الحفظ
            </Button>
          )}
        </div>
      </section>

      {isAuthenticated ? (
        <>
          {/* Progress Overview */}
          <section className="py-12 bg-light-beige">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="islamic-card text-center">
                  <CardContent className="p-6">
                    <BookOpen className="text-3xl text-islamic-green mb-4 mx-auto" size={48} />
                    <h3 className="text-2xl font-bold text-islamic-green mb-2">
                      {memorizedVerses}
                    </h3>
                    <p className="text-gray-600">الآيات المحفوظة</p>
                  </CardContent>
                </Card>
                
                <Card className="islamic-card text-center">
                  <CardContent className="p-6">
                    <CheckCircle className="text-3xl text-warm-gold mb-4 mx-auto" size={48} />
                    <h3 className="text-2xl font-bold text-warm-gold mb-2">
                      {memorizedSurahs}
                    </h3>
                    <p className="text-gray-600">السور المحفوظة</p>
                  </CardContent>
                </Card>
                
                <Card className="islamic-card text-center">
                  <CardContent className="p-6">
                    <RotateCcw className="text-3xl text-earth-brown mb-4 mx-auto" size={48} />
                    <h3 className="text-2xl font-bold text-earth-brown mb-2">
                      {Math.round(progress)}%
                    </h3>
                    <p className="text-gray-600">التقدم الإجمالي</p>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">تقدم الحفظ</h3>
                  <Progress value={progress} className="mb-2" />
                  <p className="text-sm text-gray-600">
                    لقد حفظت {memorizedVerses} آية من أصل 6,236 آية في القرآن الكريم
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Quran Reader */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <Card className="mb-8">
                  <CardContent className="p-8">
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold font-arabic-serif text-islamic-green mb-2">
                        {selectedSurah.arabicName}
                      </h2>
                      <p className="text-gray-600">{selectedSurah.name} - الآية {currentAyah}</p>
                    </div>
                    
                    {/* Bismillah and Sample Verse */}
                    <div className="text-center bg-light-beige p-8 rounded-lg mb-6">
                      <p className="text-3xl font-arabic-serif leading-relaxed mb-4 text-islamic-green">
                        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                      </p>
                      {currentSurah === 1 && (
                        <p className="text-2xl font-arabic-serif leading-relaxed text-dark-charcoal">
                          الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ
                        </p>
                      )}
                    </div>
                    
                    <div className="flex justify-center gap-4 mb-6">
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-2"
                        data-testid="button-play-audio"
                      >
                        <Play size={16} />
                        تشغيل الصوت
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-2"
                        data-testid="button-repeat"
                      >
                        <RotateCcw size={16} />
                        إعادة
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-2"
                        data-testid="button-volume"
                      >
                        <Volume2 size={16} />
                        الصوت
                      </Button>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <Button 
                        variant="outline" 
                        onClick={() => setCurrentAyah(Math.max(1, currentAyah - 1))}
                        disabled={currentAyah === 1}
                        data-testid="button-previous-ayah"
                      >
                        الآية السابقة
                      </Button>
                      <span className="text-sm text-gray-600">
                        {currentAyah} من {selectedSurah.verses}
                      </span>
                      <Button 
                        variant="outline" 
                        onClick={() => setCurrentAyah(Math.min(selectedSurah.verses, currentAyah + 1))}
                        disabled={currentAyah === selectedSurah.verses}
                        data-testid="button-next-ayah"
                      >
                        الآية التالية
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Button 
                    className="btn-islamic-primary py-4 text-lg"
                    onClick={() => setMemorizedVerses(prev => prev + 1)}
                    data-testid="button-mark-memorized"
                  >
                    <CheckCircle className="ml-2" size={20} />
                    حفظت هذه الآية
                  </Button>
                  <Button 
                    variant="outline" 
                    className="py-4 text-lg"
                    data-testid="button-review-memorized"
                  >
                    <RotateCcw className="ml-2" size={20} />
                    مراجعة المحفوظ
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Surah List */}
          <section className="py-16 bg-light-beige">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold font-arabic-serif text-islamic-green text-center mb-12">
                فهرس السور
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="surahs-list">
                {surahs.map((surah) => (
                  <Card 
                    key={surah.number} 
                    className={`islamic-card cursor-pointer transition-all ${
                      currentSurah === surah.number ? 'ring-2 ring-islamic-green bg-accent' : ''
                    }`}
                    onClick={() => {
                      setCurrentSurah(surah.number);
                      setCurrentAyah(1);
                    }}
                    data-testid={`surah-card-${surah.number}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-bold text-lg">{surah.arabicName}</h3>
                          <p className="text-gray-600">{surah.name}</p>
                        </div>
                        <div className="text-center">
                          <div className="w-8 h-8 bg-islamic-green text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {surah.number}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{surah.verses} آية</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        </>
      ) : (
        /* Guest View */
        <section className="py-16 bg-light-beige">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <Card>
                <CardContent className="p-12">
                  <BookOpen className="text-6xl text-islamic-green mb-6 mx-auto" size={96} />
                  <h2 className="text-3xl font-bold font-arabic-serif text-islamic-green mb-4">
                    ابدأ رحلة حفظ القرآن الكريم
                  </h2>
                  <p className="text-xl text-gray-700 mb-8 arabic-text">
                    سجل دخولك للوصول إلى أدوات الحفظ والمراجعة وتتبع تقدمك في حفظ القرآن الكريم
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="text-center p-4">
                      <CheckCircle className="text-3xl text-warm-gold mb-3 mx-auto" size={48} />
                      <h3 className="font-bold mb-2">تتبع التقدم</h3>
                      <p className="text-gray-600">راقب تقدمك في حفظ الآيات والسور</p>
                    </div>
                    <div className="text-center p-4">
                      <Volume2 className="text-3xl text-earth-brown mb-3 mx-auto" size={48} />
                      <h3 className="font-bold mb-2">التلاوة الصوتية</h3>
                      <p className="text-gray-600">استمع لتلاوة القرآن بأصوات مختلفة</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => window.location.href = "/api/login"}
                    className="btn-islamic-primary px-8 py-3 text-lg font-semibold"
                    data-testid="button-guest-login"
                  >
                    سجل دخولك الآن
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
