import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Plus, BookMarked, RefreshCw, Trash2, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { QuranMemorization } from "@shared/schema";

const SURAHS = [
  { number: 1, name: 'الفاتحة', ayahs: 7 },
  { number: 2, name: 'البقرة', ayahs: 286 },
  { number: 3, name: 'آل عمران', ayahs: 200 },
  // Add more surahs as needed
];

export default function MemorizationPage() {
  const [open, setOpen] = useState(false);
  const [selectedSurah, setSelectedSurah] = useState<number>(1);
  const [fromAyah, setFromAyah] = useState<number>(1);
  const [toAyah, setToAyah] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  const { toast } = useToast();

  const { data: memorizations, isLoading } = useQuery<QuranMemorization[]>({
    queryKey: ['/api/quran/memorization'],
  });

  const createMemorizationMutation = useMutation({
    mutationFn: async (data: {
      surahNumber: number;
      fromAyah: number;
      toAyah: number;
      notes?: string;
    }) => {
      return await apiRequest('/api/quran/memorization', 'POST', {
        ...data,
        status: 'in_progress',
        masteryLevel: 0,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quran/memorization'] });
      setOpen(false);
      setFromAyah(1);
      setToAyah(1);
      setNotes('');
      toast({
        title: "تم بنجاح",
        description: "تمت إضافة مقطع الحفظ بنجاح",
      });
    },
  });

  const updateMemorizationMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<QuranMemorization> }) => {
      return await apiRequest(`/api/quran/memorization/${id}`, 'PATCH', updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quran/memorization'] });
      toast({
        title: "تم بنجاح",
        description: "تم تحديث مقطع الحفظ بنجاح",
      });
    },
  });

  const deleteMemorizationMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/quran/memorization/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quran/memorization'] });
      toast({
        title: "تم الحذف",
        description: "تم حذف مقطع الحفظ بنجاح",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromAyah > toAyah) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "رقم الآية الأولى يجب أن يكون أقل من أو يساوي رقم الآية الأخيرة",
      });
      return;
    }
    createMemorizationMutation.mutate({
      surahNumber: selectedSurah,
      fromAyah,
      toAyah,
      notes,
    });
  };

  const handleReview = (id: string) => {
    updateMemorizationMutation.mutate({
      id,
      updates: {
        lastReviewed: new Date() as any,
        reviewCount: (memorizations?.find(m => m.id === id)?.reviewCount || 0) + 1,
      },
    });
  };

  const handleMasteryUpdate = (id: string, masteryLevel: number) => {
    updateMemorizationMutation.mutate({
      id,
      updates: { masteryLevel },
    });
  };

  const handleStatusUpdate = (id: string, status: string) => {
    updateMemorizationMutation.mutate({
      id,
      updates: { status },
    });
  };

  const getSurahName = (surahNumber: number) => {
    return SURAHS.find(s => s.number === surahNumber)?.name || `سورة ${surahNumber}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"><CheckCircle className="w-3 h-3 ml-1" /> مكتمل</span>;
      case 'reviewing':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"><RefreshCw className="w-3 h-3 ml-1" /> مراجعة</span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300"><AlertCircle className="w-3 h-3 ml-1" /> قيد الحفظ</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-6xl mx-auto p-4 md:p-8" dir="rtl">
        <Skeleton className="h-12 w-64 mb-8 bg-emerald-100 dark:bg-emerald-900" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 bg-emerald-100 dark:bg-emerald-900" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto p-4 md:p-8" dir="rtl" data-testid="memorization-page">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-emerald-700 dark:text-emerald-300 mb-2 flex items-center gap-3">
            <BookMarked className="w-8 h-8" />
            متابعة الحفظ والمراجعة
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            سجّل مقاطع حفظك وتابع تقدمك
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white"
              data-testid="button-add-memorization"
            >
              <Plus className="w-4 h-4 ml-2" />
              إضافة مقطع حفظ
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md" dir="rtl">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>إضافة مقطع حفظ جديد</DialogTitle>
                <DialogDescription>
                  حدد السورة والآيات التي تريد حفظها
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="surah">السورة</Label>
                  <Select 
                    value={selectedSurah.toString()} 
                    onValueChange={(value) => setSelectedSurah(parseInt(value))}
                  >
                    <SelectTrigger data-testid="select-surah">
                      <SelectValue placeholder="اختر السورة" />
                    </SelectTrigger>
                    <SelectContent>
                      {SURAHS.map((surah) => (
                        <SelectItem key={surah.number} value={surah.number.toString()}>
                          {surah.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fromAyah">من الآية</Label>
                    <Input
                      id="fromAyah"
                      type="number"
                      min={1}
                      value={fromAyah}
                      onChange={(e) => setFromAyah(parseInt(e.target.value))}
                      data-testid="input-from-ayah"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="toAyah">إلى الآية</Label>
                    <Input
                      id="toAyah"
                      type="number"
                      min={1}
                      value={toAyah}
                      onChange={(e) => setToAyah(parseInt(e.target.value))}
                      data-testid="input-to-ayah"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">ملاحظات (اختياري)</Label>
                  <Textarea
                    id="notes"
                    placeholder="ملاحظات حول الحفظ..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    data-testid="textarea-notes"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="submit" 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  disabled={createMemorizationMutation.isPending}
                  data-testid="button-submit-memorization"
                >
                  {createMemorizationMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {memorizations && memorizations.length > 0 ? (
          memorizations.map((mem) => (
            <Card 
              key={mem.id} 
              className="p-6 bg-gradient-to-br from-white to-emerald-50 dark:from-gray-800 dark:to-gray-900 border-2 border-emerald-200 dark:border-emerald-700"
              data-testid={`memorization-card-${mem.id}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mb-2">
                    {getSurahName(mem.surahNumber)}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    من الآية {mem.fromAyah} إلى الآية {mem.toAyah}
                  </p>
                  <div className="mt-2">
                    {getStatusBadge(mem.status || "")}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteMemorizationMutation.mutate(mem.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900"
                  data-testid={`button-delete-${mem.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      مستوى الإتقان
                    </span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {mem.masteryLevel || 0}%
                    </span>
                  </div>
                  <Progress value={mem.masteryLevel || 0} className="h-2" />
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">عدد المراجعات:</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {mem.reviewCount || 0}
                    </span>
                  </div>
                  {mem.lastReviewed && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">آخر مراجعة:</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200">
                        {mem.lastReviewed ? new Date(mem.lastReviewed).toLocaleDateString('ar-SA') : '-'}
                      </span>
                    </div>
                  )}
                </div>

                {mem.notes && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{mem.notes}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReview(mem.id)}
                    className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900"
                    data-testid={`button-review-${mem.id}`}
                  >
                    <RefreshCw className="w-3 h-3 ml-1" />
                    مراجعة
                  </Button>
                  
                  {(mem.masteryLevel || 0) < 100 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMasteryUpdate(mem.id, Math.min((mem.masteryLevel || 0) + 20, 100))}
                      className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900"
                      data-testid={`button-increase-mastery-${mem.id}`}
                    >
                      زيادة الإتقان +20%
                    </Button>
                  )}
                  
                  {mem.status !== 'completed' && (mem.masteryLevel || 0) >= 80 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusUpdate(mem.id, 'completed')}
                      className="border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900"
                      data-testid={`button-mark-completed-${mem.id}`}
                    >
                      <CheckCircle className="w-3 h-3 ml-1" />
                      تمييز كمكتمل
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-12 text-center bg-white dark:bg-gray-800">
            <BookMarked className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              لا توجد مقاطع حفظ بعد
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              ابدأ بإضافة مقطع الحفظ الأول لك
            </p>
            <Button
              onClick={() => setOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Plus className="w-4 h-4 ml-2" />
              إضافة مقطع حفظ
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
