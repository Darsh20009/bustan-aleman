import { useState, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useQuery } from '@tanstack/react-query';

interface SearchResult {
  surah: number;
  surahName: string;
  ayah: number;
  text: string;
  tafsir?: string;
}

interface QuranSearchProps {
  onResultClick?: (surah: number, ayah: number) => void;
}

export function QuranSearch({ onResultClick }: QuranSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: results, isLoading } = useQuery<SearchResult[]>({
    queryKey: [`/api/search?q=${encodeURIComponent(debouncedSearch)}`],
    enabled: debouncedSearch.length > 0,
  });

  const handleResultClick = (surah: number, ayah: number) => {
    if (onResultClick) {
      onResultClick(surah, ayah);
    }
    setIsOpen(false);
    setSearchTerm('');
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-900 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2"
          data-testid="button-open-search"
        >
          <Search className="h-4 w-4" />
          <span className="hidden md:inline">بحث في القرآن</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-arabic-serif text-emerald-700 dark:text-emerald-300">
            البحث في القرآن الكريم
          </DialogTitle>
          <DialogDescription>
            ابحث عن آيات، كلمات، أو مواضيع في القرآن الكريم
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="اكتب كلمة أو جملة للبحث..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 text-lg"
              autoFocus
              data-testid="input-search-quran"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-2 top-1/2 transform -translate-y-1/2"
                onClick={() => setSearchTerm('')}
                data-testid="button-clear-search"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Search Results */}
          <ScrollArea className="h-[400px]">
            {isLoading && debouncedSearch ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600 dark:text-emerald-400" />
              </div>
            ) : results && results.length > 0 ? (
              <div className="space-y-3">
                {results.map((result, index) => (
                  <Card
                    key={index}
                    className="p-4 cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-colors border-r-4 border-r-emerald-500"
                    onClick={() => handleResultClick(result.surah, result.ayah)}
                    data-testid={`search-result-${index}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="font-arabic-serif">
                          {result.surahName}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          الآية {result.ayah}
                        </span>
                      </div>
                      <Badge variant="outline">{result.surah}</Badge>
                    </div>
                    <p className="text-lg font-arabic-serif leading-loose text-justify">
                      {highlightText(result.text, searchTerm)}
                    </p>
                    {result.tafsir && (
                      <p className="mt-2 text-sm text-muted-foreground border-r-2 border-emerald-200 dark:border-emerald-800 pr-3">
                        {result.tafsir}
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            ) : debouncedSearch && !isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Search className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg">لا توجد نتائج لـ "{debouncedSearch}"</p>
                <p className="text-sm mt-2">جرب كلمات بحث مختلفة</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Search className="h-12 w-12 mb-4 opacity-50" />
                <p className="text-lg">ابدأ البحث عن آية أو كلمة</p>
                <p className="text-sm mt-2">يمكنك البحث بالنص العربي</p>
              </div>
            )}
          </ScrollArea>

          {/* Search Tips */}
          {!searchTerm && (
            <div className="bg-muted/50 p-3 rounded-lg text-sm text-muted-foreground">
              <p className="font-medium mb-1">نصائح للبحث:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>ابحث بكلمة واحدة أو عدة كلمات</li>
                <li>البحث يدعم اللغة العربية</li>
                <li>النتائج محدودة بـ 10 آيات لسرعة البحث</li>
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
