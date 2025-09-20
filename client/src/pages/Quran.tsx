import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { motion } from "framer-motion";
import { BookOpen, Play, Volume2, RotateCcw, CheckCircle, Search, Bookmark, Settings, Pause, SkipBack, SkipForward, Plus, Minus, FileText, Save, Star, Calendar, Clock } from "lucide-react";
import { useState, useRef } from "react";
import type { QuranNote, QuranProgress } from "@shared/schema";

export default function Quran() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentSurah, setCurrentSurah] = useState(1);
  const [currentAyah, setCurrentAyah] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReader, setSelectedReader] = useState("maher");
  const [isPlaying, setIsPlaying] = useState(false);
  const [fontSize, setFontSize] = useState(24);
  const [showTafseer, setShowTafseer] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Fetch user's notes
  const { data: allNotes = [], isLoading: notesLoading } = useQuery<QuranNote[]>({
    queryKey: ["/api/student/notes"],
    enabled: isAuthenticated
  });

  // Find current note for this ayah
  const currentNote = allNotes.find(note => note.surahNumber === currentSurah && note.ayahNumber === currentAyah);

  // Mock progress data (since there's no GET endpoint for progress)
  const userProgress = { lastSurah: currentSurah, lastAyah: currentAyah, bookmarkedVerses: '[]' };
  const progressLoading = false;

  // Bookmarks from progress data (with error handling)
  let bookmarks = [];
  try {
    bookmarks = userProgress?.bookmarkedVerses ? JSON.parse(userProgress.bookmarkedVerses) : [];
  } catch (e) {
    console.warn('Error parsing bookmarked verses:', e);
    bookmarks = [];
  }
  const memorizedVerses = allNotes.filter(note => note.tags?.includes('محفوظ')).length || 0;

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
  const progressPercentage = memorizedVerses > 0 ? (memorizedVerses / 6236) * 100 : 0; // Total Quran verses
  const memorizedSurahs = Math.floor(memorizedVerses / 100); // Better calculation

  const filteredSurahs = surahs.filter(surah => 
    surah.name.includes(searchTerm) || 
    surah.arabicName.includes(searchTerm) ||
    surah.number.toString().includes(searchTerm)
  );

  // Update progress mutation (using student progress endpoint)
  const updateProgressMutation = useMutation({
    mutationFn: async (data: { lastSurah: number; lastAyah: number; bookmarkedVerses?: string }) => {
      const response = await fetch(`/api/student/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onError: (error) => {
      toast({ title: "خطأ في حفظ التقدم", description: "لم يتم حفظ التقدم، حاول مرة أخرى", variant: "destructive" });
    }
  });

  // Save note mutation (using student notes endpoint)
  const saveNoteMutation = useMutation({
    mutationFn: async (data: { surahNumber: number; ayahNumber: number; note: string; tags?: string }) => {
      const response = await fetch(`/api/student/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/student/notes"] });
      setNoteText("");
      setIsNoteDialogOpen(false);
      toast({ title: "تم حفظ الملاحظة بنجاح", description: "تم إضافة ملاحظتك للآية" });
    },
    onError: (error) => {
      toast({ title: "خطأ في حفظ الملاحظة", description: "لم يتم حفظ الملاحظة، حاول مرة أخرى", variant: "destructive" });
    }
  });

  const toggleBookmark = () => {
    const bookmark = { surah: currentSurah, ayah: currentAyah };
    const currentBookmarks = bookmarks || [];
    const exists = currentBookmarks.some((b: any) => b.surah === bookmark.surah && b.ayah === bookmark.ayah);
    
    let newBookmarks;
    if (exists) {
      newBookmarks = currentBookmarks.filter((b: any) => !(b.surah === bookmark.surah && b.ayah === bookmark.ayah));
    } else {
      newBookmarks = [...currentBookmarks, bookmark];
    }
    
    updateProgressMutation.mutate({
      lastSurah: currentSurah,
      lastAyah: currentAyah,
      bookmarkedVerses: JSON.stringify(newBookmarks)
    });
  };

  const saveNote = () => {
    if (!noteText.trim()) return;
    
    saveNoteMutation.mutate({
      surahNumber: currentSurah,
      ayahNumber: currentAyah,
      note: noteText.trim()
    });
  };

  const updateProgress = () => {
    updateProgressMutation.mutate({
      lastSurah: currentSurah,
      lastAyah: currentAyah
    });
  };

  const isBookmarked = bookmarks?.some((b: any) => b.surah === currentSurah && b.ayah === currentAyah) || false;

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
              {notesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  {[...Array(4)].map((_, i) => (
                    <Card key={i} className="islamic-card text-center">
                      <CardContent className="p-6">
                        <div className="islamic-spinner w-12 h-12 mx-auto mb-4"></div>
                        <div className="h-8 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-100 rounded"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <>
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
                          {Math.round(progressPercentage)}%
                        </h3>
                        <p className="text-gray-600">التقدم الإجمالي</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-4">تقدم الحفظ</h3>
                      <Progress value={progressPercentage} className="mb-2" />
                      <p className="text-sm text-gray-600">
                        لقد حفظت {memorizedVerses} آية من أصل 6,236 آية في القرآن الكريم
                      </p>
                    </CardContent>
                  </Card>
                </>
              )}
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
                        onClick={() => {
                          setCurrentAyah(Math.max(1, currentAyah - 1));
                          updateProgress();
                        }}
                        disabled={currentAyah === 1}
                        className="btn-islamic-secondary"
                        data-testid="button-previous-ayah"
                      >
                        <SkipBack size={16} />
                        السابق
                      </Button>
                      
                      <Button 
                        onClick={playAudio}
                        className="btn-islamic-gradient flex items-center gap-2 px-6"
                        data-testid="button-play-audio"
                      >
                        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                        {isPlaying ? "إيقاف" : "تشغيل"}
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setCurrentAyah(Math.min(selectedSurah.verses, currentAyah + 1));
                          updateProgress();
                        }}
                        disabled={currentAyah === selectedSurah.verses}
                        className="btn-islamic-secondary"
                        data-testid="button-next-ayah"
                      >
                        التالي
                        <SkipForward size={16} />
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        onClick={toggleBookmark}
                        disabled={updateProgressMutation.isPending}
                        className={`flex items-center gap-2 ${isBookmarked ? 'bg-royal-gold text-white border-royal-gold' : 'btn-islamic-secondary'}`}
                        data-testid="button-bookmark"
                      >
                        <Bookmark size={16} />
                        {isBookmarked ? "★ محفوظة" : "🔖 حفظ"}
                      </Button>
                      
                      {/* Note Button */}
                      <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            className={`flex items-center gap-2 ${currentNote ? 'bg-islamic-emerald text-white border-islamic-emerald' : 'btn-islamic-secondary'}`}
                            data-testid="button-add-note"
                          >
                            <FileText size={16} />
                            {currentNote ? "📝 ملاحظة" : "➕ ملاحظة"}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md" dir="rtl">
                          <DialogHeader>
                            <DialogTitle className="font-arabic-serif text-islamic-emerald">
                              ملاحظة على الآية {currentAyah} من {selectedSurah.arabicName}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            {currentNote && (
                              <div className="bg-islamic-emerald/10 p-4 rounded-lg">
                                <h4 className="font-bold text-islamic-emerald mb-2">ملاحظة محفوظة:</h4>
                                <p className="text-copper-bronze font-arabic-sans">{currentNote.note}</p>
                              </div>
                            )}
                            <Textarea
                              placeholder="اكتب ملاحظتك على هذه الآية..."
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              className="min-h-[100px] font-arabic-sans"
                              data-testid="textarea-note"
                            />
                            <div className="flex gap-2">
                              <Button 
                                onClick={saveNote}
                                disabled={!noteText.trim() || saveNoteMutation.isPending}
                                className="btn-islamic-gradient flex-1"
                                data-testid="button-save-note"
                              >
                                {saveNoteMutation.isPending ? (
                                  <><div className="islamic-spinner w-4 h-4 mr-2"></div> جاري الحفظ...</>
                                ) : (
                                  <><Save size={16} className="mr-2" /> حفظ الملاحظة</>
                                )}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button 
                        className="btn-islamic-gradient py-4 text-lg font-arabic-sans"
                        onClick={() => {
                          saveNoteMutation.mutate({
                            surahNumber: currentSurah,
                            ayahNumber: currentAyah,
                            note: `حفظت هـه الآية في ${new Date().toLocaleDateString('ar-SA')}`,
                            tags: JSON.stringify(['محفوظ'])
                          });
                        }}
                        disabled={saveNoteMutation.isPending}
                        data-testid="button-mark-memorized"
                      >
                        <CheckCircle className="ml-2" size={20} />
                        ✨ حفظت هذه الآية
                      </Button>
                      <Button 
                        variant="outline" 
                        className="btn-islamic-secondary py-4 text-lg font-arabic-sans"
                        onClick={() => {
                          // Go to a random memorized verse for review
                          const memorizedNotes = allNotes.filter(note => note.tags?.includes('محفوظ'));
                          if (memorizedNotes.length > 0) {
                            const randomNote = memorizedNotes[Math.floor(Math.random() * memorizedNotes.length)];
                            setCurrentSurah(randomNote.surahNumber);
                            setCurrentAyah(randomNote.ayahNumber);
                          }
                        }}
                        data-testid="button-review-memorized"
                      >
                        <RotateCcw className="ml-2" size={20} />
                        🔄 مراجعة المحفوظ
                      </Button>
                      <Button 
                        variant="outline" 
                        className="btn-islamic-secondary py-4 text-lg font-arabic-sans"
                        onClick={() => {
                          setCurrentAyah(Math.min(selectedSurah.verses, currentAyah + 1));
                          updateProgress();
                        }}
                        disabled={currentAyah === selectedSurah.verses}
                        data-testid="button-continue-reading"
                      >
                        <BookOpen className="ml-2" size={20} />
                        📚 متابعة القراءة
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
                <TabsList className="grid grid-cols-4 w-full mb-8" data-testid="surah-tabs">
                  <TabsTrigger value="all">جميع السور</TabsTrigger>
                  <TabsTrigger value="bookmarks">العلامات المرجعية</TabsTrigger>
                  <TabsTrigger value="memorized">المحفوظة</TabsTrigger>
                  <TabsTrigger value="notes">الملاحظات</TabsTrigger>
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
                    {bookmarks && bookmarks.length > 0 ? bookmarks.map((bookmark: any, index: number) => {
                      const surah = surahs.find(s => s.number === bookmark.surah);
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className="islamic-card cursor-pointer hover:shadow-xl transition-all duration-300 border-royal-gold/20" 
                                onClick={() => {
                                  setCurrentSurah(bookmark.surah);
                                  setCurrentAyah(bookmark.ayah);
                                  updateProgress();
                                }}
                                data-testid={`bookmark-${index}`}>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-center">
                                <div>
                                  <h3 className="font-bold text-islamic-emerald font-arabic-serif">{surah?.arabicName}</h3>
                                  <p className="text-copper-bronze font-arabic-sans">الآية {bookmark.ayah}</p>
                                  <p className="text-xs text-gray-500 mt-1">{surah?.revelation}</p>
                                </div>
                                <div className="text-center">
                                  <Bookmark className="text-royal-gold mb-1" size={24} />
                                  <p className="text-xs text-royal-gold font-bold">محفوظة</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    }) : (
                      <div className="col-span-full text-center py-12">
                        <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-600 mb-2 font-arabic-serif">لا توجد علامات مرجعية</h3>
                        <p className="text-gray-500 font-arabic-sans">ابدأ بحفظ الآيات المهمة لك</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="memorized">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {allNotes && allNotes.length > 0 ? allNotes.filter(note => note.tags?.includes('محفوظ')).map((note, index) => {
                      const surah = surahs.find(s => s.number === note.surahNumber);
                      return (
                        <motion.div
                          key={note.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className="islamic-card cursor-pointer hover:shadow-xl transition-all duration-300 border-islamic-emerald/20" 
                                onClick={() => {
                                  setCurrentSurah(note.surahNumber);
                                  setCurrentAyah(note.ayahNumber);
                                  updateProgress();
                                }}
                                data-testid={`memorized-${index}`}>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h3 className="font-bold text-islamic-emerald font-arabic-serif">{surah?.arabicName}</h3>
                                  <p className="text-copper-bronze font-arabic-sans">الآية {note.ayahNumber}</p>
                                  <p className="text-sm text-gray-600 mt-2 font-arabic-sans line-clamp-2">{note.note}</p>
                                  <p className="text-xs text-gray-400 mt-2 flex items-center">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {note.createdAt ? new Date(note.createdAt).toLocaleDateString('ar-SA') : ''}
                                  </p>
                                </div>
                                <div className="text-center">
                                  <Star className="text-islamic-emerald mb-1" size={24} />
                                  <p className="text-xs text-islamic-emerald font-bold">محفوظ</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    }) : (
                      <div className="col-span-full text-center py-12">
                        <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-600 mb-2 font-arabic-serif">لا توجد آيات محفوظة</h3>
                        <p className="text-gray-500 font-arabic-sans">ابدأ بحفظ بعض الآيات وستظهر هنا</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="notes">
                  <div className="grid grid-cols-1 gap-4">
                    {allNotes && allNotes.length > 0 ? allNotes.map((note, index) => {
                      const surah = surahs.find(s => s.number === note.surahNumber);
                      const isMemorized = note.tags?.includes('محفوظ');
                      return (
                        <motion.div
                          key={note.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <Card className="islamic-card cursor-pointer hover:shadow-lg transition-all duration-300" 
                                onClick={() => {
                                  setCurrentSurah(note.surahNumber);
                                  setCurrentAyah(note.ayahNumber);
                                  updateProgress();
                                }}
                                data-testid={`note-${index}`}>
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle className="text-lg font-arabic-serif text-islamic-emerald">
                                    {surah?.arabicName} - الآية {note.ayahNumber}
                                  </CardTitle>
                                  <p className="text-sm text-copper-bronze">{surah?.name}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {isMemorized && <Star className="text-islamic-emerald" size={16} />}
                                  <FileText className="text-royal-gold" size={16} />
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <p className="text-gray-700 font-arabic-sans leading-relaxed mb-3">{note.note}</p>
                              <div className="flex justify-between items-center text-xs text-gray-500">
                                <div className="flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {note.createdAt ? new Date(note.createdAt).toLocaleDateString('ar-SA') : ''}
                                </div>
                                {isMemorized && (
                                  <span className="bg-islamic-emerald/10 text-islamic-emerald px-2 py-1 rounded-full">
                                    محفوظ
                                  </span>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    }) : (
                      <div className="text-center py-12">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-600 mb-2 font-arabic-serif">لا توجد ملاحظات</h3>
                        <p className="text-gray-500 font-arabic-sans">ابدأ بإضافة ملاحظات على الآيات</p>
                      </div>
                    )}
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