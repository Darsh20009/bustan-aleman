
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import logoImage from '@assets/bustan aleman logo_1763041603537.png';

interface BustanSplashScreenProps {
  onComplete: () => void;
}

export function BustanSplashScreen({ onComplete }: BustanSplashScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setProgress(50), 200);
    const timer2 = setTimeout(() => setProgress(100), 400);
    const timer3 = setTimeout(() => onComplete(), 800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center">
      <div className="text-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <img 
            src={logoImage} 
            alt="بستان الإيمان" 
            className="w-24 h-24 mx-auto mb-4 drop-shadow-lg"
          />
          <h1
            className="text-4xl md:text-5xl font-bold text-white mb-2"
            style={{ fontFamily: 'Amiri, serif' }}
          >
            بستان الإيمان
          </h1>
          <p className="text-emerald-100 text-lg">
            منصة تحفيظ القرآن الكريم
          </p>
        </motion.div>

        <div className="w-48 h-1.5 bg-emerald-900/50 rounded-full mx-auto overflow-hidden">
          <motion.div
            className="h-full bg-white rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>

        <button
          onClick={onComplete}
          className="absolute bottom-6 left-6 text-emerald-200 text-sm hover:text-white transition-colors"
          data-testid="button-skip-splash"
        >
          تخطي
        </button>
      </div>
    </div>
  );
}
