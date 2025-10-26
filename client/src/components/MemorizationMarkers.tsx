import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Bookmark, 
  BookMarked, 
  CheckCircle2, 
  AlertCircle,
  Star,
  Trash2,
  Plus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { QuranAyahMarker } from '@shared/schema';

interface MemorizationMarkersProps {
  surahNumber: number;
  ayahNumber: number;
}

const MARKER_TYPES = [
  { value: 'memorization', label: 'حفظ', icon: BookMarked, color: 'blue' },
  { value: 'review', label: 'مراجعة', icon: AlertCircle, color: 'yellow' },
  { value: 'bookmark', label: 'علامة مرجعية', icon: Bookmark, color: 'green' },
  { value: 'completed', label: 'مكتمل', icon: CheckCircle2, color: 'emerald' },
] as const;

const COLOR_OPTIONS = [
  { value: 'blue', label: 'أزرق', class: 'bg-blue-500' },
  { value: 'green', label: 'أخضر', class: 'bg-green-500' },
  { value: 'yellow', label: 'أصفر', class: 'bg-yellow-500' },
  { value: 'red', label: 'أحمر', class: 'bg-red-500' },
  { value: 'orange', label: 'برتقالي', class: 'bg-orange-500' },
] as const;

export function MemorizationMarkers({ surahNumber, ayahNumber }: MemorizationMarkersProps) {
  const [note, setNote] = useState('');
  const [selectedColor, setSelectedColor] = useState<'blue' | 'green' | 'yellow' | 'red' | 'orange'>('blue');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { toast } = useToast();

  const { data: markers, isLoading } = useQuery<QuranAyahMarker[]>({
    queryKey: ['/api/quran/markers', surahNumber, ayahNumber],
  });

  const createMarkerMutation = useMutation({
    mutationFn: async (data: {
      surahNumber: number;
      ayahNumber: number;
      markerType: 'memorization' | 'review' | 'bookmark' | 'completed';
      markerColor?: 'blue' | 'green' | 'yellow' | 'red' | 'orange';
      note?: string;
    }) => {
      return await apiRequest('/api/quran/markers', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quran/markers'] });
      setIsPopoverOpen(false);
      setNote('');
      toast({
        title: "تم بنجاح",
        description: "تمت إضافة العلامة بنجاح",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في إضافة العلامة",
      });
    },
  });

  const deleteMarkerMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/quran/markers/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quran/markers'] });
      toast({
        title: "تم الحذف",
        description: "تم حذف العلامة بنجاح",
      });
    },
  });

  const handleAddMarker = (markerType: 'memorization' | 'review' | 'bookmark' | 'completed') => {
    createMarkerMutation.mutate({
      surahNumber,
      ayahNumber,
      markerType,
      markerColor: selectedColor,
      note: note || undefined,
    });
  };

  const getMarkerBadge = (marker: QuranAyahMarker) => {
    const markerConfig = MARKER_TYPES.find(t => t.value === marker.markerType);
    if (!markerConfig) return null;

    const colorClass = {
      blue: 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
      green: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-800',
      yellow: 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800',
      red: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
      orange: 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800',
    }[marker.markerColor || 'blue'];

    return (
      <Badge
        variant="outline"
        className={`${colorClass} cursor-pointer hover:opacity-80 transition-opacity`}
        onClick={() => {
          if (marker.note) {
            toast({
              title: markerConfig.label,
              description: marker.note,
            });
          }
        }}
      >
        <markerConfig.icon className="h-3 w-3 ml-1" />
        {markerConfig.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex gap-1">
        <div className="h-6 w-16 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {/* Display existing markers */}
      <div className="flex flex-wrap gap-1">
        {markers?.map((marker) => (
          <div key={marker.id} className="relative group">
            {getMarkerBadge(marker)}
            <button
              onClick={() => deleteMarkerMutation.mutate(marker.id)}
              className="absolute -top-1 -left-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              data-testid={`button-delete-marker-${marker.id}`}
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Add marker dropdown */}
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            data-testid="button-add-marker"
          >
            <Plus className="h-3 w-3 ml-1" />
            علامة
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-3">إضافة علامة</h4>
              
              <div className="grid grid-cols-2 gap-2 mb-4">
                {MARKER_TYPES.map((type) => (
                  <Button
                    key={type.value}
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddMarker(type.value)}
                    disabled={createMarkerMutation.isPending}
                    className="justify-start"
                    data-testid={`button-marker-${type.value}`}
                  >
                    <type.icon className="h-4 w-4 ml-2" />
                    {type.label}
                  </Button>
                ))}
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-xs mb-2 block">اللون</Label>
                  <div className="flex gap-2">
                    {COLOR_OPTIONS.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setSelectedColor(color.value)}
                        className={`w-6 h-6 rounded-full ${color.class} ${
                          selectedColor === color.value
                            ? 'ring-2 ring-offset-2 ring-foreground'
                            : ''
                        }`}
                        title={color.label}
                        data-testid={`button-color-${color.value}`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="marker-note" className="text-xs mb-2 block">
                    ملاحظة (اختياري)
                  </Label>
                  <Textarea
                    id="marker-note"
                    placeholder="أضف ملاحظة..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="min-h-[60px]"
                    data-testid="textarea-marker-note"
                  />
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
