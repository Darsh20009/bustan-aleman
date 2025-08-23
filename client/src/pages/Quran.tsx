import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { BookOpen, Play, Volume2, RotateCcw, CheckCircle, Search, Bookmark, Settings, Pause, SkipBack, SkipForward, Plus, Minus } from "lucide-react";
import { useState, useRef } from "react";

export default function Quran() {
  const { user, isAuthenticated } = useAuth();
  const [currentSurah, setCurrentSurah] = useState(1);
  const [memorizedVerses, setMemorizedVerses] = useState(285); // Sample data
  const [currentAyah, setCurrentAyah] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReader, setSelectedReader] = useState("maher");
  const [isPlaying, setIsPlaying] = useState(false);
  const [fontSize, setFontSize] = useState(24);
  const [bookmarks, setBookmarks] = useState<{surah: number, ayah: number}[]>([
    { surah: 2, ayah: 255 }, // آية الكرسي
    { surah: 36, ayah: 1 },  // سورة يس
  ]);
  const [showTafseer, setShowTafseer] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Complete Quran Surahs list (showing key surahs)
  const surahs = [
    { number: 1, name: "الفاتحة", verses: 7, arabicName: "الْفَاتِحَة", revelation: "مكية" },
    { number: 2, name: "البقرة", verses: 286, arabicName: "الْبَقَرَة", revelation: "مدنية" },
    { number: 3, name: "آل عمران", verses: 200, arabicName: "آل عِمْرَان", revelation: "مدنية" },
    { number: 4, name: "النساء", verses: 176, arabicName: "النِّسَاء", revelation: "مدنية" },
    { number: 5, name: "المائدة", verses: 120, arabicName: "الْمَائِدَة", revelation: "مدنية" },
    { number: 6, name: "الأنعام", verses: 165, arabicName: "الْأَنْعَام", revelation: "مكية" },
    { number: 7, name: "الأعراف", verses: 206, arabicName: "الْأَعْرَاف", revelation: "مكية" },
    { number: 8, name: "الأنفال", verses: 75, arabicName: "الْأَنْفَال", revelation: "مدنية" },
    { number: 9, name: "التوبة", verses: 129, arabicName: "التَّوْبَة", revelation: "مدنية" },
    { number: 10, name: "يونس", verses: 109, arabicName: "يُونُس", revelation: "مكية" },
    { number: 18, name: "الكهف", verses: 110, arabicName: "الْكَهْف", revelation: "مكية" },
    { number: 19, name: "مريم", verses: 98, arabicName: "مَرْيَم", revelation: "مكية" },
    { number: 20, name: "طه", verses: 135, arabicName: "طه", revelation: "مكية" },
    { number: 36, name: "يس", verses: 83, arabicName: "يس", revelation: "مكية" },
    { number: 55, name: "الرحمن", verses: 78, arabicName: "الرَّحْمَن", revelation: "مكية" },
    { number: 67, name: "الملك", verses: 30, arabicName: "الْمُلْك", revelation: "مكية" },
    { number: 110, name: "النصر", verses: 3, arabicName: "النَّصْر", revelation: "مدنية" },
    { number: 111, name: "المسد", verses: 5, arabicName: "الْمَسَد", revelation: "مكية" },
    { number: 112, name: "الإخلاص", verses: 4, arabicName: "الْإِخْلَاص", revelation: "مكية" },
    { number: 113, name: "الفلق", verses: 5, arabicName: "الْفَلَق", revelation: "مكية" },
    { number: 114, name: "الناس", verses: 6, arabicName: "النَّاس", revelation: "مكية" },
  ];

  const readers = [
    { id: "maher", name: "ماهر المعيقلي", country: "السعودية" },
    { id: "sudais", name: "عبد الرحمن السديس", country: "السعودية" },
    { id: "shuraim", name: "سعود الشريم", country: "السعودية" },
    { id: "mishary", name: "مشاري العفاسي", country: "الكويت" },
    { id: "husary", name: "محمود خليل الحصري", country: "مصر" },
    { id: "ajmi", name: "أحمد علي العجمي", country: "السعودية" },
    { id: "ghamdi", name: "سعد الغامدي", country: "السعودية" },
    { id: "minshawi", name: "محمد صديق المنشاوي", country: "مصر" },
  ];

  const selectedSurah = surahs.find(s => s.number === currentSurah) || surahs[0];
  const progress = memorizedVerses > 0 ? (memorizedVerses / 6236) * 100 : 0; // Total Quran verses
  const memorizedSurahs = Math.floor(memorizedVerses / 100); // Better calculation

  const filteredSurahs = surahs.filter(surah => 
    surah.name.includes(searchTerm) || 
    surah.arabicName.includes(searchTerm) ||
    surah.number.toString().includes(searchTerm)
  );

  const toggleBookmark = () => {
    const bookmark = { surah: currentSurah, ayah: currentAyah };
    const exists = bookmarks.some(b => b.surah === bookmark.surah && b.ayah === bookmark.ayah);
    
    if (exists) {
      setBookmarks(bookmarks.filter(b => !(b.surah === bookmark.surah && b.ayah === bookmark.ayah)));
    } else {
      setBookmarks([...bookmarks, bookmark]);
    }
  };

  const isBookmarked = bookmarks.some(b => b.surah === currentSurah && b.ayah === currentAyah);

  const playAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Sample verses for demonstration
  const getVerseText = (surahNum: number, ayahNum: number) => {
    if (surahNum === 1) {
      const verses = [
        "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
        "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
        "الرَّحْمَٰنِ الرَّحِيمِ",
        "مَالِكِ يَوْمِ الدِّينِ",
        "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
        "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
        "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ"
      ];
      return verses[ayahNum - 1] || verses[0];
    } else if (surahNum === 112) {
      const verses = [
        "قُلْ هُوَ اللَّهُ أَحَدٌ",
        "اللَّهُ الصَّمَدُ",
        "لَمْ يَلِدْ وَلَمْ يُولَدْ",
        "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ"
      ];
      return verses[ayahNum - 1] || verses[0];
    } else if (surahNum === 113) {
      const verses = [
        "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ",
        "مِن شَرِّ مَا خَلَقَ",
        "وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ",
        "وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ",
        "وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ"
      ];
      return verses[ayahNum - 1] || verses[0];
    } else if (surahNum === 114) {
      const verses = [
        "قُلْ أَعُوذُ بِرَبِّ النَّاسِ",
        "مَلِكِ النَّاسِ",
        "إِلَٰهِ النَّاسِ",
        "مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ",
        "الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ",
        "مِنَ الْجِنَّةِ وَالنَّاسِ"
      ];
      return verses[ayahNum - 1] || verses[0];
    }
    return "نص تجريبي للآية - في التطبيق الحقيقي سيتم تحميل النص من قاعدة البيانات";
  };

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
            المصحف الشريف المطور
          </h1>
          <p className="text-xl mb-8 opacity-90">
            مصحف تفاعلي شامل مع إمكانيات متقدمة للحفظ والمراجعة
          </p>
          {!isAuthenticated && (
            <Button 
              onClick={() => window.location.href = "/api/login"}
              className="btn-islamic-secondary px-8 py-3 text-lg font-semibold"
              data-testid="button-login-to-start"
            >
              سجل دخولك للبدء
            </Button>
          )}
        </div>
      </section>

      {isAuthenticated ? (
        <>
          {/* Enhanced Controls Bar */}
          <section className="py-6 bg-islamic-green text-white">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-white" size={20} />
                  <Input
                    type="text"
                    placeholder="البحث في السور..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/70"
                    data-testid="search-surahs"
                  />
                </div>

                {/* Reader Selection */}
                <Select value={selectedReader} onValueChange={setSelectedReader}>
                  <SelectTrigger className="bg-white/20 border-white/30 text-white" data-testid="select-reader">
                    <SelectValue placeholder="اختر القارئ" />
                  </SelectTrigger>
                  <SelectContent>
                    {readers.map((reader) => (
                      <SelectItem key={reader.id} value={reader.id}>
                        {reader.name} - {reader.country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Font Size Control */}
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setFontSize(Math.max(16, fontSize - 2))}
                    className="text-white hover:bg-white/20"
                    data-testid="decrease-font"
                  >
                    <Minus size={16} />
                  </Button>
                  <span className="min-w-[50px] text-center text-sm">حجم النص</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setFontSize(Math.min(36, fontSize + 2))}
                    className="text-white hover:bg-white/20"
                    data-testid="increase-font"
                  >
                    <Plus size={16} />
                  </Button>
                </div>

                {/* Settings */}
                <Button 
                  variant="ghost" 
                  className="text-white hover:bg-white/20"
                  onClick={() => setShowTafseer(!showTafseer)}
                  data-testid="toggle-tafseer"
                >
                  <Settings className="mr-2" size={16} />
                  {showTafseer ? "إخفاء التفسير" : "إظهار التفسير"}
                </Button>
              </div>
            </div>
          </section>

          {/* Progress Overview */}
          <section className="py-12 bg-light-beige">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                    <Bookmark className="text-3xl text-earth-brown mb-4 mx-auto" size={48} />
                    <h3 className="text-2xl font-bold text-earth-brown mb-2">
                      {bookmarks.length}
                    </h3>
                    <p className="text-gray-600">العلامات المرجعية</p>
                  </CardContent>
                </Card>

                <Card className="islamic-card text-center">
                  <CardContent className="p-6">
                    <RotateCcw className="text-3xl text-islamic-green mb-4 mx-auto" size={48} />
                    <h3 className="text-2xl font-bold text-islamic-green mb-2">
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

          {/* Enhanced Quran Reader */}
          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto">
                <Card className="mb-8">
                  <CardContent className="p-8">
                    <div className="text-center mb-6">
                      <h2 className="text-2xl font-bold font-arabic-serif text-islamic-green mb-2">
                        {selectedSurah.arabicName}
                      </h2>
                      <p className="text-gray-600">
                        {selectedSurah.name} - الآية {currentAyah} من {selectedSurah.verses} - {selectedSurah.revelation}
                      </p>
                    </div>
                    
                    {/* Enhanced Verse Display */}
                    <div className="text-center bg-light-beige p-8 rounded-lg mb-6">
                      <div className="mb-4">
                        <span className="inline-block bg-islamic-green text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold mb-4">
                          {currentAyah}
                        </span>
                      </div>
                      <p 
                        className="font-arabic-serif leading-relaxed text-dark-charcoal"
                        style={{ fontSize: `${fontSize}px` }}
                      >
                        {getVerseText(currentSurah, currentAyah)}
                      </p>
                    </div>
                    
                    {/* Enhanced Audio Controls */}
                    <div className="flex justify-center gap-2 mb-6 flex-wrap">
                      <Button 
                        variant="outline" 
                        onClick={() => setCurrentAyah(Math.max(1, currentAyah - 1))}
                        disabled={currentAyah === 1}
                        data-testid="button-previous-ayah"
                      >
                        <SkipBack size={16} />
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        onClick={playAudio}
                        className="flex items-center gap-2"
                        data-testid="button-play-audio"
                      >
                        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                        {isPlaying ? "إيقاف" : "تشغيل"}
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        onClick={() => setCurrentAyah(Math.min(selectedSurah.verses, currentAyah + 1))}
                        disabled={currentAyah === selectedSurah.verses}
                        data-testid="button-next-ayah"
                      >
                        <SkipForward size={16} />
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        onClick={toggleBookmark}
                        className={`flex items-center gap-2 ${isBookmarked ? 'bg-warm-gold text-white' : ''}`}
                        data-testid="button-bookmark"
                      >
                        <Bookmark size={16} />
                        {isBookmarked ? "محفوظة" : "حفظ"}
                      </Button>
                    </div>

                    {/* Tafseer Section */}
                    {showTafseer && (
                      <div className="bg-gray-50 p-6 rounded-lg mb-6">
                        <h4 className="font-bold text-lg mb-3 text-islamic-green">التفسير</h4>
                        <p className="text-gray-700 leading-relaxed">
                          هذا نص تجريبي للتفسير. في التطبيق الحقيقي سيتم عرض تفسير الآية من مصادر معتمدة مثل تفسير ابن كثير أو الطبري أو غيرهما من المفسرين المعتبرين.
                        </p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Enhanced Surah List with Tabs */}
          <section className="py-16 bg-light-beige">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold font-arabic-serif text-islamic-green text-center mb-12">
                فهرس القرآن الكريم
              </h2>
              
              <Tabs defaultValue="all" className="max-w-6xl mx-auto">
                <TabsList className="grid grid-cols-3 w-full mb-8" data-testid="surah-tabs">
                  <TabsTrigger value="all">جميع السور</TabsTrigger>
                  <TabsTrigger value="bookmarks">العلامات المرجعية</TabsTrigger>
                  <TabsTrigger value="memorized">المحفوظة</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="surahs-list">
                    {filteredSurahs.map((surah) => (
                      <Card 
                        key={surah.number} 
                        className={`islamic-card cursor-pointer transition-all hover:shadow-lg ${
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
                            <div className="flex-1">
                              <h3 className="font-bold text-lg">{surah.arabicName}</h3>
                              <p className="text-gray-600">{surah.name}</p>
                              <p className="text-xs text-gray-500">{surah.revelation}</p>
                            </div>
                            <div className="text-center">
                              <div className="w-10 h-10 bg-islamic-green text-white rounded-full flex items-center justify-center text-sm font-bold">
                                {surah.number}
                              </div>
                              <p className="text-xs text-gray-500 mt-1">{surah.verses} آية</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="bookmarks">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {bookmarks.map((bookmark, index) => {
                      const surah = surahs.find(s => s.number === bookmark.surah);
                      return (
                        <Card key={index} className="islamic-card cursor-pointer" onClick={() => {
                          setCurrentSurah(bookmark.surah);
                          setCurrentAyah(bookmark.ayah);
                        }}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <h3 className="font-bold">{surah?.arabicName}</h3>
                                <p className="text-gray-600">الآية {bookmark.ayah}</p>
                              </div>
                              <Bookmark className="text-warm-gold" size={20} />
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>
                
                <TabsContent value="memorized">
                  <div className="text-center py-8">
                    <CheckCircle className="text-6xl text-islamic-green mb-4 mx-auto" size={96} />
                    <p className="text-gray-600">سيتم عرض السور المحفوظة هنا</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </section>

          {/* Audio Element */}
          <audio ref={audioRef} />
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
                    المصحف الشريف المطور
                  </h2>
                  <p className="text-xl text-gray-700 mb-8 arabic-text">
                    سجل دخولك للوصول إلى المصحف التفاعلي مع إمكانيات الحفظ والمراجعة وتتبع التقدم
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="text-center p-4">
                      <Volume2 className="text-3xl text-islamic-green mb-3 mx-auto" size={48} />
                      <h3 className="font-bold mb-2">تلاوات متعددة</h3>
                      <p className="text-gray-600">أصوات أشهر القراء في العالم الإسلامي</p>
                    </div>
                    <div className="text-center p-4">
                      <Bookmark className="text-3xl text-warm-gold mb-3 mx-auto" size={48} />
                      <h3 className="font-bold mb-2">العلامات المرجعية</h3>
                      <p className="text-gray-600">احفظ الآيات المهمة للمراجعة السريعة</p>
                    </div>
                    <div className="text-center p-4">
                      <CheckCircle className="text-3xl text-earth-brown mb-3 mx-auto" size={48} />
                      <h3 className="font-bold mb-2">تتبع الحفظ</h3>
                      <p className="text-gray-600">راقب تقدمك في حفظ القرآن الكريم</p>
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