import { useState } from 'react';
import { useLocation } from 'wouter';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface SearchResult {
  surah: number;
  surahName: string;
  ayah: number;
  text: string;
}

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [_, navigate] = useLocation();

  const { data: results, isLoading, refetch, isFetching } = useQuery<SearchResult[]>({
    queryKey: [`/api/search?q=${encodeURIComponent(searchTerm)}`],
    enabled: false,
  });

  const handleSearch = async () => {
    if (searchTerm.trim().length > 0) {
      await refetch();
      setIsOpen(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const navigateToAyah = (surah: number, ayah: number) => {
    navigate(`/surah/${surah}`);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex">
        <PopoverTrigger asChild>
          <div className="relative w-full md:w-40">
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="بحث..."
              className="bg-white bg-opacity-90 text-textDark pl-8 pr-2 py-1 rounded-full text-sm w-full focus:outline-none focus:ring-2 focus:ring-secondary"
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute left-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0" 
              onClick={handleSearch}
            >
              <Search className="h-4 w-4 text-primary"/>
            </Button>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-80 max-h-80 overflow-y-auto p-0" align="end">
          {isFetching ? (
            <div className="flex justify-center items-center h-20">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : results && results.length > 0 ? (
            <div className="p-1">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="p-2 hover:bg-background rounded cursor-pointer"
                  onClick={() => navigateToAyah(result.surah, result.ayah)}
                >
                  <div className="flex justify-between mb-1">
                    <span className="font-amiri text-primary">{result.surahName}</span>
                    <span className="text-sm text-gray-500">آية {result.ayah}</span>
                  </div>
                  <p className="text-sm font-amiri truncate">{result.text.substring(0, 80)}...</p>
                </div>
              ))}
            </div>
          ) : results && results.length === 0 ? (
            <div className="p-4 text-center">
              <p>لا توجد نتائج</p>
            </div>
          ) : (
            <div className="p-4 text-center">
              <p>ابحث في القرآن الكريم</p>
            </div>
          )}
        </PopoverContent>
      </div>
    </Popover>
  );
};

export default SearchBar;
