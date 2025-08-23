import { Link } from "wouter";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuranNavigationProps {
  currentPage: number;
  totalPages: number;
  currentSurah?: number;
  nextSurah?: number;
  prevSurah?: number;
  mode: 'page' | 'surah';
}

const QuranNavigation = ({ 
  currentPage, 
  totalPages,
  currentSurah,
  nextSurah,
  prevSurah,
  mode
}: QuranNavigationProps) => {
  // Convert number to Arabic numeral
  const toArabicNumeral = (num: number): string => {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().split('').map(digit => arabicNumerals[parseInt(digit)]).join('');
  };

  const nextPageUrl = mode === 'page' 
    ? `/page/${Math.min(currentPage + 1, totalPages)}`
    : `/surah/${nextSurah || (currentSurah ? currentSurah + 1 : 1)}`;
  
  const prevPageUrl = mode === 'page'
    ? `/page/${Math.max(currentPage - 1, 1)}`
    : `/surah/${prevSurah || (currentSurah && currentSurah > 1 ? currentSurah - 1 : 1)}`;

  const isFirstPage = mode === 'page' ? currentPage <= 1 : !prevSurah;
  const isLastPage = mode === 'page' ? currentPage >= totalPages : !nextSurah;

  return (
    <div className="flex justify-between items-center max-w-4xl mx-auto my-4 px-4">
      <Button
        variant="default"
        className="bg-primary text-white rounded-full shadow-md hover:bg-opacity-90 flex items-center"
        disabled={isFirstPage}
        asChild
      >
        <Link href={prevPageUrl}>
          <ChevronRight className="ml-2 h-4 w-4" />
          <span>{mode === 'page' ? 'الصفحة السابقة' : 'السورة السابقة'}</span>
        </Link>
      </Button>
      
      <div className="flex text-primary font-medium">
        {mode === 'page' ? (
          <>
            صفحة <span className="mx-1">{toArabicNumeral(currentPage)}</span> من <span className="mr-1">{toArabicNumeral(totalPages)}</span>
          </>
        ) : (
          <>
            سورة <span className="mx-1">{currentSurah && toArabicNumeral(currentSurah)}</span>
          </>
        )}
      </div>
      
      <Button
        variant="outline"
        className="text-primary border border-primary rounded-full shadow-md hover:bg-primary hover:bg-opacity-10 flex items-center"
        disabled={isLastPage}
        asChild
      >
        <Link href={nextPageUrl}>
          <span>{mode === 'page' ? 'الصفحة التالية' : 'السورة التالية'}</span>
          <ChevronLeft className="mr-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
};

export default QuranNavigation;
