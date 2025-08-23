import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type SurahInfo = {
  number: number;
  name: string;
  englishName: string;
  revelationType: string;
  numberOfAyahs: number;
};

const SurahList = ({ onSurahSelect }: { onSurahSelect?: () => void }) => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: surahs, isLoading } = useQuery<SurahInfo[]>({
    queryKey: ['/api/surahs'],
  });

  const filteredSurahs = surahs?.filter(surah => 
    surah.name.includes(searchQuery) || 
    surah.englishName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Convert number to Arabic numeral
  const toArabicNumeral = (num: number): string => {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().split('').map(digit => arabicNumerals[parseInt(digit)]).join('');
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 bg-primary text-white sticky top-0 z-10">
        <h2 className="text-xl font-amiri">فهرس السور</h2>
      </div>
      <div className="p-4">
        <div className="relative mb-4">
          <Input
            type="text"
            placeholder="بحث عن سورة..."
            className="bg-background w-full pl-10 pr-4 py-2 rounded-md text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary w-4 h-4" />
        </div>
        
        <ScrollArea className="h-[calc(100vh-170px)]">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex justify-between items-center p-2">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>
          ) : (
            <ul className="space-y-2">
              {filteredSurahs?.map((surah) => (
                <li 
                  key={surah.number}
                  className="hover:bg-background cursor-pointer p-2 rounded-md"
                >
                  <Link href={`/surah/${surah.number}`} onClick={onSurahSelect}>
                    <div className="flex justify-between items-center">
                      <span className="font-amiri">
                        {toArabicNumeral(surah.number)}. {surah.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {toArabicNumeral(surah.numberOfAyahs)} آيات
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default SurahList;
