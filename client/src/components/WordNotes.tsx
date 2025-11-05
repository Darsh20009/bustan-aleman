import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Save, Trash2 } from 'lucide-react';

interface WordNote {
  surahNumber: number;
  ayahNumber: number;
  wordIndex: number;
  wordText: string;
  note: string;
  createdAt: string;
}

interface WordNotesProps {
  surahNumber: number;
  ayahNumber: number;
  wordIndex: number;
  wordText: string;
}

// مفتاح تخزين الملاحظات في localStorage
const NOTES_STORAGE_KEY = 'quran_word_notes';

export function WordNotes({ surahNumber, ayahNumber, wordIndex, wordText }: WordNotesProps) {
  const [note, setNote] = useState('');
  const { toast } = useToast();

  // تحميل الملاحظات من localStorage
  useEffect(() => {
    loadNote();
  }, [surahNumber, ayahNumber, wordIndex]);

  const loadNote = () => {
    try {
      const storedNotes = localStorage.getItem(NOTES_STORAGE_KEY);
      if (storedNotes) {
        const notes: WordNote[] = JSON.parse(storedNotes);
        const existingNote = notes.find(
          n => n.surahNumber === surahNumber && 
               n.ayahNumber === ayahNumber && 
               n.wordIndex === wordIndex
        );

        if (existingNote) {
          setNote(existingNote.note);
        } else {
          setNote('');
        }
      }
    } catch (error) {
      console.error('Error loading note from localStorage:', error);
      setNote('');
    }
  };

  const handleSave = () => {
    if (!note.trim()) {
      toast({
        title: "تنبيه",
        description: "الرجاء كتابة ملاحظة",
        variant: "destructive",
      });
      return;
    }

    try {
      // قراءة الملاحظات الحالية
      const storedNotes = localStorage.getItem(NOTES_STORAGE_KEY);
      let notes: WordNote[] = storedNotes ? JSON.parse(storedNotes) : [];

      // البحث عن ملاحظة موجودة
      const existingIndex = notes.findIndex(
        n => n.surahNumber === surahNumber && 
             n.ayahNumber === ayahNumber && 
             n.wordIndex === wordIndex
      );

      const newNote: WordNote = {
        surahNumber,
        ayahNumber,
        wordIndex,
        wordText,
        note: note.trim(),
        createdAt: new Date().toISOString(),
      };

      if (existingIndex !== -1) {
        // تحديث الملاحظة الموجودة
        notes[existingIndex] = newNote;
      } else {
        // إضافة ملاحظة جديدة
        notes.push(newNote);
      }

      // حفظ في localStorage
      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));

      toast({
        title: "✅ تم الحفظ",
        description: "تم حفظ الملاحظة بنجاح على جهازك",
      });
    } catch (error) {
      console.error('Error saving note:', error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ الملاحظة",
        variant: "destructive",
      });
    }
  };

  const handleDelete = () => {
    try {
      const storedNotes = localStorage.getItem(NOTES_STORAGE_KEY);
      if (storedNotes) {
        let notes: WordNote[] = JSON.parse(storedNotes);

        // حذف الملاحظة
        notes = notes.filter(
          n => !(n.surahNumber === surahNumber && 
                 n.ayahNumber === ayahNumber && 
                 n.wordIndex === wordIndex)
        );

        localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
        setNote('');

        toast({
          title: "تم الحذف",
          description: "تم حذف الملاحظة بنجاح",
        });
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

  return (
    <Card className="p-4 mt-2">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-sm">ملاحظات على الكلمة: {wordText}</h4>
          {note && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          )}
        </div>

        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="اكتب ملاحظاتك هنا... (سيتم حفظها على جهازك)"
          className="min-h-[100px]"
        />

        <Button
          onClick={handleSave}
          disabled={!note.trim()}
          className="w-full"
        >
          <Save className="ml-2 h-4 w-4" />
          حفظ الملاحظة على الجهاز
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          💾 يتم حفظ الملاحظات محليًا على جهازك
        </p>
      </div>
    </Card>
  );
}