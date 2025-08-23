import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";

const SplashScreen = () => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fade out animation after 2 seconds
    const timer = setTimeout(() => {
      setFadeOut(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`fixed inset-0 flex flex-col items-center justify-center bg-primary z-50 ${fadeOut ? 'fade-out' : 'fade-in'}`}>
      <div className="absolute inset-0 islamic-pattern opacity-15"></div>
      <div className="text-white text-4xl md:text-6xl mb-8 font-amiri relative z-10">مصحف</div>
      <div className="text-secondary text-2xl md:text-4xl mb-12 font-amiri relative z-10">مقدم من بستان الإيمان</div>
      <div className="w-24 h-24 border-4 border-secondary rounded-full flex items-center justify-center relative z-10">
        <BookOpen className="w-12 h-12 text-white" />
      </div>
    </div>
  );
};

export default SplashScreen;
