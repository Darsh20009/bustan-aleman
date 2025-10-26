import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  StickyNote, 
  Trash2, 
  Save,
  Highlighter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { QuranWordHighlight } from '@shared/schema';

interface WordNotesProps {
  surahNumber: number;
  ayahNumber: number;
  wordIndex: number;
  wordText: string;
  children?: React.ReactNode;
}

const HIGHLIGHT_COLORS = [
  { value: 'red', label: 'أحمر', class: 'bg-red-200 dark:bg-red-900' },
  { value: 'yellow', label: 'أصفر', class: 'bg-yellow-200 dark:bg-yellow-900' },
  { value: 'blue', label: 'أزرق', class: 'bg-blue-200 dark:bg-blue-900' },
  { value: 'green', label: 'أخضر', class: 'bg-green-200 dark:bg-green-900' },
] as const;

export function WordNotes({ 
  surahNumber, 
  ayahNumber, 
  wordIndex, 
  wordText, 
  children 
}: WordNotesProps) {
  const [note, setNote] = useState('');
  const [highlightColor, setHighlightColor] = useState<'red' | 'yellow' | 'blue' | 'green'>('yellow');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { toast } = useToast();

  const { data: highlights } = useQuery<QuranWordHighlight[]>({
    queryKey: ['/api/quran/word-highlights', surahNumber, ayahNumber, wordIndex],
  });

  const existingHighlight = highlights?.[0];

  const saveHighlightMutation = useMutation({
    mutationFn: async (data: {
      surahNumber: number;
      ayahNumber: number;
      wordIndex: number;
      wordText: string;
      highlightColor: string;
      note?: string;
    }) => {
      if (existingHighlight) {
        return await apiRequest(
          `/api/quran/word-highlights/${existingHighlight.id}`,
          'PATCH',
          data
        );
      }
      return await apiRequest('/api/quran/word-highlights', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quran/word-highlights'] });
      setIsPopoverOpen(false);
      toast({
        title: "تم الحفظ",
        description: "تم حفظ الملاحظة بنجاح",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في حفظ الملاحظة",
      });
    },
  });

  const deleteHighlightMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/quran/word-highlights/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quran/word-highlights'] });
      setIsPopoverOpen(false);
      setNote('');
      toast({
        title: "تم الحذف",
        description: "تم حذف الملاحظة بنجاح",
      });
    },
  });

  const handleSave = () => {
    saveHighlightMutation.mutate({
      surahNumber,
      ayahNumber,
      wordIndex,
      wordText,
      highlightColor,
      note: note || undefined,
    });
  };

  const handleDelete = () => {
    if (existingHighlight) {
      deleteHighlightMutation.mutate(existingHighlight.id);
    }
  };

  const getHighlightClass = (color: string) => {
    return HIGHLIGHT_COLORS.find(c => c.value === color)?.class || '';
  };

  // Initialize note from existing highlight
  if (existingHighlight && !note && isPopoverOpen) {
    setNote(existingHighlight.note || '');
    setHighlightColor((existingHighlight.highlightColor as any) || 'yellow');
  }

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <span
          className={`inline-block cursor-pointer rounded px-0.5 transition-all hover:ring-2 hover:ring-offset-1 hover:ring-emerald-500 ${
            existingHighlight
              ? getHighlightClass(existingHighlight.highlightColor || 'yellow')
              : 'hover:bg-yellow-100 dark:hover:bg-yellow-900/30'
          }`}
          data-testid={`word-${wordIndex}`}
        >
          {children || wordText}
          {existingHighlight?.note && (
            <StickyNote className="inline h-3 w-3 mr-0.5 text-emerald-600 dark:text-emerald-400" />
          )}
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">ملاحظة على الكلمة</h4>
            {existingHighlight && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={deleteHighlightMutation.isPending}
                data-testid="button-delete-word-note"
              >
                <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
              </Button>
            )}
          </div>

          <div className="bg-muted/50 p-3 rounded-lg">
            <p className="font-arabic-serif text-lg text-center">{wordText}</p>
          </div>

          <div>
            <Label htmlFor="highlight-color" className="text-xs mb-2 block">
              لون التظليل
            </Label>
            <Select
              value={highlightColor}
              onValueChange={(v: any) => setHighlightColor(v)}
            >
              <SelectTrigger id="highlight-color" data-testid="select-highlight-color">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HIGHLIGHT_COLORS.map((color) => (
                  <SelectItem key={color.value} value={color.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded ${color.class}`} />
                      {color.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="word-note" className="text-xs mb-2 block">
              الملاحظة
            </Label>
            <Textarea
              id="word-note"
              placeholder="أضف ملاحظة عن هذه الكلمة..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[80px]"
              data-testid="textarea-word-note"
            />
          </div>

          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
            onClick={handleSave}
            disabled={saveHighlightMutation.isPending}
            data-testid="button-save-word-note"
          >
            <Save className="ml-2 h-4 w-4" />
            حفظ
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
