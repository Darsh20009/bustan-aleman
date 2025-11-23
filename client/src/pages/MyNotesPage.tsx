import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useToast } from '../hooks/use-toast';
import { useAuth } from '../hooks/useAuth';
import { BookOpen, Plus, Trash2, Edit2, Save, X, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

interface QuranNote {
  id: string;
  surahNumber: number;
  ayahNumber: number;
  note: string;
  noteType?: string;
  createdAt: string;
}

const SURAH_NAMES = [
  'الفاتحة', 'البقرة', 'آل عمران', 'النساء', 'المائدة', 'الأنعام', 'الأعراف', 'الأنفال', 'التوبة', 'يونس',
  'هود', 'يوسف', 'الرعد', 'إبراهيم', 'الحجر', 'النحل', 'الإسراء', 'الكهف', 'مريم', 'طه',
  'الأنبياء', 'الحج', 'المؤمنون', 'النور', 'الفرقان', 'الشعراء', 'النمل', 'القصص', 'العنكبوت', 'الروم',
  'لقمان', 'السجدة', 'الأحزاب', 'سبأ', 'فاطر', 'يس', 'الصافات', 'ص', 'الزمر', 'غافر',
  'فصلت', 'الشورى', 'الزخرف', 'الدخان', 'الجاثية', 'الأحقاف', 'محمد', 'الفتح', 'الحجرات', 'ق',
  'الذاريات', 'الطور', 'النجم', 'القمر', 'الرحمن', 'الواقعة', 'الحديد', 'المجادلة', 'الحشر', 'الممتحنة',
  'الصف', 'الجمعة', 'المنافقون', 'التغابن', 'الطلاق', 'التحريم', 'الملك', 'القلم', 'الحاقة', 'المعارج',
  'نوح', 'الجن', 'المزمل', 'المدثر', 'القيامة', 'الإنسان', 'المرسلات', 'النبأ', 'النازعات', 'عبس',
  'التكوير', 'الانفطار', 'المطففين', 'الانشقاق', 'البروج', 'الطارق', 'الأعلى', 'الغاشية', 'الفجر', 'البلد',
  'الشمس', 'الليل', 'الضحى', 'الشرح', 'التين', 'العلق', 'القدر', 'البينة', 'الزلزلة', 'العاديات',
  'القارعة', 'التكاثر', 'العصر', 'الهمزة', 'الفيل', 'قريش', 'الماعون', 'الكوثر', 'الكافرون', 'النصر',
  'المسد', 'الإخلاص', 'الفلق', 'الناس'
];

export default function MyNotesPage() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<QuranNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editedText, setEditedText] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNote, setNewNote] = useState({
    surahNumber: 1,
    ayahNumber: 1,
    note: ''
  });
  const { toast } = useToast();

  // Only supervisors/sheikhs can manage notes
  if (user?.role === 'student') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-6" dir="rtl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">الوصول مقيد</h2>
          <p className="text-xl text-gray-600 mb-6">هذه الميزة متاحة فقط للمشرفين والمعلمين</p>
          <p className="text-sm text-gray-500">إذا كنت تريد إدارة الملاحظات، يرجى التواصل مع الشيخ</p>
        </motion.div>
      </div>
    );
  }

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await fetch('/api/quran/notes');
      if (response.ok) {
        const data = await response.json();
        setNotes(data);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const response = await fetch(`/api/quran/notes/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        toast({
          title: "تم حذف الملاحظة ✅",
          description: "تم حذف الملاحظة بنجاح",
        });
        fetchNotes();
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف الملاحظة",
        variant: "destructive",
      });
    }
  };

  const startEditing = (note: QuranNote) => {
    setEditingNote(note.id);
    setEditedText(note.note);
  };

  const saveEdit = async (id: string) => {
    try {
      const response = await fetch(`/api/quran/notes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: editedText }),
      });
      
      if (response.ok) {
        toast({
          title: "تم التحديث ✅",
          description: "تم تحديث الملاحظة بنجاح",
        });
        setEditingNote(null);
        fetchNotes();
      }
    } catch (error) {
      console.error('Error updating note:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث الملاحظة",
        variant: "destructive",
      });
    }
  };

  const createNote = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/quran/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNote),
      });
      
      if (response.ok) {
        toast({
          title: "تم إضافة الملاحظة ✅",
          description: "تم حفظ الملاحظة بنجاح",
        });
        setNewNote({ surahNumber: 1, ayahNumber: 1, note: '' });
        setShowAddForm(false);
        fetchNotes();
      }
    } catch (error) {
      console.error('Error creating note:', error);
      toast({
        title: "خطأ",
        description: "فشل في إضافة الملاحظة",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-6" dir="rtl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-emerald-700 text-lg font-medium">جاري التحميل...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50" dir="rtl">
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">ملاحظاتي</h1>
              <p className="text-emerald-100 text-lg">ملاحظاتك على آيات القرآن الكريم</p>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg"
            data-testid="button-add-note"
          >
            <Plus className="w-5 h-5 ml-2" />
            إضافة ملاحظة جديدة
          </Button>
        </div>
        
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="border-2 border-emerald-200 bg-emerald-50/50">
              <CardContent className="p-6">
                <form onSubmit={createNote} className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">ملاحظة جديدة</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-bold">اختر السورة</Label>
                      <Select 
                        value={newNote.surahNumber.toString()}
                        onValueChange={(val) => setNewNote({...newNote, surahNumber: parseInt(val)})}
                      >
                        <SelectTrigger data-testid="select-surah">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SURAH_NAMES.map((name, index) => (
                            <SelectItem key={index + 1} value={(index + 1).toString()}>
                              {index + 1}. {name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-bold">رقم الآية</Label>
                      <Input
                        type="number"
                        min="1"
                        value={newNote.ayahNumber}
                        onChange={(e) => setNewNote({...newNote, ayahNumber: parseInt(e.target.value)})}
                        required
                        data-testid="input-ayah-number"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-bold">الملاحظة</Label>
                    <Textarea
                      value={newNote.note}
                      onChange={(e) => setNewNote({...newNote, note: e.target.value})}
                      placeholder="اكتب ملاحظتك هنا..."
                      className="min-h-[120px] text-lg"
                      required
                      data-testid="textarea-note"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      type="submit" 
                      className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                      data-testid="button-submit-note"
                    >
                      <Save className="w-4 h-4 ml-2" />
                      حفظ الملاحظة
                    </Button>
                    <Button 
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      variant="outline"
                      className="px-6"
                    >
                      إلغاء
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 gap-6"
        >
          {notes.length === 0 && !showAddForm ? (
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="p-16 text-center">
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-12 h-12 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">لا توجد ملاحظات بعد</h3>
                <p className="text-gray-500 text-lg">يمكنك إضافة ملاحظات أثناء قراءة القرآن</p>
              </CardContent>
            </Card>
          ) : (
            notes.map((note, index) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-0 shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-white to-emerald-50">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                          {note.surahNumber}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">
                            {SURAH_NAMES[note.surahNumber - 1]} - الآية {note.ayahNumber}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {new Date(note.createdAt).toLocaleDateString('ar-SA')}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {editingNote === note.id ? (
                          <>
                            <Button
                              onClick={() => saveEdit(note.id)}
                              size="sm"
                              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                              data-testid={`button-save-note-${note.id}`}
                            >
                              <Save className="w-4 h-4 ml-1" />
                              حفظ
                            </Button>
                            <Button
                              onClick={() => setEditingNote(null)}
                              size="sm"
                              variant="outline"
                            >
                              <X className="w-4 h-4 ml-1" />
                              إلغاء
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              onClick={() => startEditing(note)}
                              size="sm"
                              variant="outline"
                              data-testid={`button-edit-note-${note.id}`}
                            >
                              <Edit2 className="w-4 h-4 ml-1" />
                              تعديل
                            </Button>
                            <Button
                              onClick={() => deleteNote(note.id)}
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:bg-red-50"
                              data-testid={`button-delete-note-${note.id}`}
                            >
                              <Trash2 className="w-4 h-4 ml-1" />
                              حذف
                            </Button>
                          </>
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {editingNote === note.id ? (
                      <Textarea
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        className="w-full min-h-[100px] text-lg border-2 border-emerald-200 focus:border-emerald-500"
                        data-testid={`textarea-edit-note-${note.id}`}
                      />
                    ) : (
                      <p className="text-gray-700 text-lg whitespace-pre-wrap">{note.note}</p>
                    )}
                    {note.noteType && (
                      <Badge className="mt-3 bg-amber-100 text-amber-700 border-amber-200">
                        {note.noteType}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
}
