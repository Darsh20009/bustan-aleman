import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const Home = () => {
  const [_, navigate] = useLocation();

  useEffect(() => {
    // Automatically redirect to page 1 of the Quran
    const timer = setTimeout(() => {
      navigate('/page/1');
    }, 100);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6 flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <h1 className="text-2xl font-amiri text-primary mb-4">جاري التحميل...</h1>
        </CardContent>
      </Card>
    </div>
  );
};

export default Home;
