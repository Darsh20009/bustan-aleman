import { useState } from 'react';
import { useParams } from 'wouter';
import { Menu, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import QuranReader from '@/components/QuranReader';
import QuranNavigation from '@/components/QuranNavigation';
import SurahList from '@/components/SurahList';
import SearchBar from '@/components/SearchBar';

const QuranPage = () => {
  const { pageNumber } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const currentPage = pageNumber ? parseInt(pageNumber) : 1;
  const totalPages = 604; // Total pages in the Quran

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <button className="mr-4 focus:outline-none">
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="p-0 max-w-xs w-full">
                <SurahList onSurahSelect={() => setSidebarOpen(false)} />
              </SheetContent>
            </Sheet>
            <h1 className="text-2xl font-amiri">مصحف بستان الإيمان</h1>
          </div>
          <div className="flex items-center">
            <div className="hidden md:block search-container ml-4">
              <SearchBar />
            </div>
          </div>
        </div>
      </header>
      
      <div className="md:flex">
        {/* Sidebar for larger screens */}
        <aside className="hidden md:block md:w-64 bg-white shadow-md h-[calc(100vh-56px)] overflow-y-auto sticky top-14">
          <SurahList />
        </aside>
        
        {/* Main Quran Content */}
        <main className="flex-1 p-2 md:p-6 overflow-y-auto">
          <QuranReader mode="page" pageNumber={currentPage} />
          
          {/* Navigation Controls */}
          <QuranNavigation 
            currentPage={currentPage} 
            totalPages={totalPages}
            mode="page"
          />
        </main>
      </div>
    </div>
  );
};

export default QuranPage;
