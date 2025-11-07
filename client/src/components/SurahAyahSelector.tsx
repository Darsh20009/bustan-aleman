import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { PlusCircle, XCircle, BookOpen } from 'lucide-react';
import { Card, CardContent } from './ui/card';

interface SurahData {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
}

interface SelectedRange {
  surahNumber: number;
  surahName: string;
  fromAyah: number;
  toAyah: number;
}

interface SurahAyahSelectorProps {
  label: string;
  onChange: (value: string) => void;
  value?: string;
}

export function SurahAyahSelector({ label, onChange, value }: SurahAyahSelectorProps) {
  const [surahs, setSurahs] = useState<SurahData[]>([]);
  const [selectedRanges, setSelectedRanges] = useState<SelectedRange[]>([]);
  const [currentSurah, setCurrentSurah] = useState<number | null>(null);
  const [fromAyah, setFromAyah] = useState<number>(1);
  const [toAyah, setToAyah] = useState<number>(1);

  useEffect(() => {
    fetch('/api/surahs')
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setSurahs(data.data);
        }
      })
      .catch(err => console.error('Error loading surahs:', err));
  }, []);

  useEffect(() => {
    if (value && surahs.length > 0) {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          setSelectedRanges(parsed);
        }
      } catch {}
    }
  }, [value, surahs]);

  const addRange = () => {
    if (currentSurah) {
      const surah = surahs.find(s => s.number === currentSurah);
      if (surah) {
        // Validate that fromAyah <= toAyah
        if (fromAyah > toAyah) {
          alert('رقم الآية الأولى يجب أن يكون أصغر من أو يساوي رقم الآية الأخيرة');
          return;
        }
        
        const newRange: SelectedRange = {
          surahNumber: currentSurah,
          surahName: surah.name,
          fromAyah,
          toAyah: Math.min(toAyah, surah.numberOfAyahs),
        };
        const updated = [...selectedRanges, newRange];
        setSelectedRanges(updated);
        onChange(JSON.stringify(updated));
        
        setCurrentSurah(null);
        setFromAyah(1);
        setToAyah(1);
      }
    }
  };

  const removeRange = (index: number) => {
    const updated = selectedRanges.filter((_, i) => i !== index);
    setSelectedRanges(updated);
    onChange(JSON.stringify(updated));
  };

  const selectedSurah = surahs.find(s => s.number === currentSurah);

  return (
    <div className="space-y-4">
      <Label className="text-lg font-bold text-gray-800">{label}</Label>
      
      <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200">
        <CardContent className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">اختر السورة</Label>
              <Select 
                value={currentSurah?.toString()} 
                onValueChange={(val) => {
                  setCurrentSurah(parseInt(val));
                  setFromAyah(1);
                  setToAyah(1);
                }}
              >
                <SelectTrigger className="bg-white border-emerald-300" data-testid="select-surah">
                  <SelectValue placeholder="اختر سورة" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {surahs.map(surah => (
                    <SelectItem key={surah.number} value={surah.number.toString()}>
                      {surah.number}. {surah.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">من آية</Label>
              <Select 
                value={fromAyah.toString()} 
                onValueChange={(val) => setFromAyah(parseInt(val))}
                disabled={!selectedSurah}
              >
                <SelectTrigger className="bg-white border-emerald-300" data-testid="select-from-ayah">
                  <SelectValue placeholder="1" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {selectedSurah && Array.from({ length: selectedSurah.numberOfAyahs }, (_, i) => i + 1).map(ayah => (
                    <SelectItem key={ayah} value={ayah.toString()}>
                      {ayah}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700">إلى آية</Label>
              <Select 
                value={toAyah.toString()} 
                onValueChange={(val) => setToAyah(parseInt(val))}
                disabled={!selectedSurah}
              >
                <SelectTrigger className="bg-white border-emerald-300" data-testid="select-to-ayah">
                  <SelectValue placeholder="1" />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {selectedSurah && Array.from({ length: selectedSurah.numberOfAyahs }, (_, i) => i + 1).map(ayah => (
                    <SelectItem key={ayah} value={ayah.toString()}>
                      {ayah}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            type="button"
            onClick={addRange}
            disabled={!currentSurah}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            data-testid="button-add-range"
          >
            <PlusCircle className="w-4 h-4 ml-2" />
            إضافة النطاق
          </Button>
        </CardContent>
      </Card>

      {selectedRanges.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700">النطاقات المحددة:</Label>
          <div className="space-y-2">
            {selectedRanges.map((range, index) => (
              <Card key={index} className="bg-white border-emerald-200">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-emerald-600" />
                      <span className="font-semibold text-gray-800">
                        {range.surahName}: من آية {range.fromAyah} إلى {range.toAyah}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRange(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      data-testid={`button-remove-range-${index}`}
                    >
                      <XCircle className="w-5 h-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
