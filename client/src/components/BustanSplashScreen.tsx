import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';

interface BustanSplashScreenProps {
  onComplete: () => void;
}

export function BustanSplashScreen({ onComplete }: BustanSplashScreenProps) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fade out animation after 2 seconds
    const timer = setTimeout(() => {
      setFadeOut(true);
    }, 2000);

    // Complete after fade out animation
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <motion.div 
      className="fixed inset-0 flex flex-col items-center justify-center bg-emerald-600 dark:bg-emerald-700 z-50"
      initial={{ opacity: 1 }}
      animate={{ opacity: fadeOut ? 0 : 1 }}
      transition={{ duration: 1 }}
    >
      {/* Islamic Pattern Background */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.1) 35px, rgba(255,255,255,.1) 70px)`,
        }}></div>
      </div>

      {/* Content */}
      <motion.div
        className="text-white text-4xl md:text-6xl mb-8 font-amiri relative z-10"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        style={{ fontFamily: 'Amiri, serif' }}
      >
        مصحف
      </motion.div>

      <motion.div
        className="text-orange-400 text-2xl md:text-4xl mb-12 font-amiri relative z-10"
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        style={{ fontFamily: 'Amiri, serif' }}
      >
        مقدم من بستان الإيمان
      </motion.div>

      <motion.div
        className="w-24 h-24 border-4 border-orange-400 rounded-full flex items-center justify-center relative z-10"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.7, duration: 0.8, type: "spring" }}
      >
        <BookOpen className="w-12 h-12 text-white" />
      </motion.div>

      {/* Skip button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        whileHover={{ opacity: 1 }}
        onClick={onComplete}
        className="absolute bottom-6 right-6 text-orange-400 text-sm hover:text-white transition-colors"
      >
        تخطي ←
      </motion.button>
    </motion.div>
  );
}