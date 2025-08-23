import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BustanSplashScreenProps {
  onComplete: () => void;
}

export function BustanSplashScreen({ onComplete }: BustanSplashScreenProps) {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [showLogo, setShowLogo] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setShowLogo(true), 500);
    const timer2 = setTimeout(() => setCurrentPhase(1), 2000);
    const timer3 = setTimeout(() => setCurrentPhase(2), 3500);
    const timer4 = setTimeout(() => setCurrentPhase(3), 5000);
    const timer5 = setTimeout(() => onComplete(), 6500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-white/5 animate-pulse"></div>
        
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-20 h-20 opacity-10"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              rotate: [0, 360],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="w-full h-full border-2 border-blue-300 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-blue-300 rounded-full opacity-50"></div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 text-center">
        <AnimatePresence mode="wait">
          {showLogo && (
            <motion.div
              initial={{ scale: 0, rotate: -180, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, rotate: 180, opacity: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="mb-8"
            >
              <div className="relative mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-32 h-32 mx-auto mb-4"
                >
                  <svg viewBox="0 0 200 200" className="w-full h-full text-blue-300">
                    {/* مصحف مفتوح */}
                    <path
                      d="M30 60 L30 160 L100 160 L100 60 Z"
                      fill="currentColor"
                      stroke="white"
                      strokeWidth="2"
                    />
                    <path
                      d="M100 60 L170 60 L170 160 L100 160 Z"
                      fill="currentColor"
                      stroke="white"
                      strokeWidth="2"
                    />
                    {/* خطوط النص */}
                    <line x1="40" y1="80" x2="90" y2="80" stroke="white" strokeWidth="1" opacity="0.8" />
                    <line x1="40" y1="90" x2="90" y2="90" stroke="white" strokeWidth="1" opacity="0.8" />
                    <line x1="40" y1="100" x2="90" y2="100" stroke="white" strokeWidth="1" opacity="0.8" />
                    <line x1="110" y1="80" x2="160" y2="80" stroke="white" strokeWidth="1" opacity="0.8" />
                    <line x1="110" y1="90" x2="160" y2="90" stroke="white" strokeWidth="1" opacity="0.8" />
                    <line x1="110" y1="100" x2="160" y2="100" stroke="white" strokeWidth="1" opacity="0.8" />
                    {/* نجمة صغيرة */}
                    <polygon
                      points="100,40 105,50 115,50 107,57 110,67 100,62 90,67 93,57 85,50 95,50"
                      fill="white"
                      opacity="0.9"
                    />
                    <defs>
                      <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="50%" stopColor="#60a5fa" />
                        <stop offset="100%" stopColor="#93c5fd" />
                      </linearGradient>
                    </defs>
                    <polygon
                      points="100,20 120,70 170,70 130,110 150,160 100,130 50,160 70,110 30,70 80,70"
                      fill="url(#starGradient)"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <circle cx="100" cy="100" r="15" fill="white" opacity="0.9" />
                  </svg>
                </motion.div>

                <motion.h1
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="text-6xl font-bold text-white mb-2"
                  style={{ fontFamily: 'Amiri, serif' }}
                >
                  بستان الإيمان
                </motion.h1>
                
                <motion.h2
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                  className="text-2xl text-blue-200 mb-4"
                  style={{ fontFamily: 'Amiri, serif' }}
                >
                  Garden of Faith
                </motion.h2>

                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.8 }}
                  className="text-lg text-blue-100"
                  style={{ fontFamily: 'Amiri, serif' }}
                >
                  منصة تحفيظ القرآن الكريم الإبداعية
                </motion.p>
              </div>
            </motion.div>
          )}

          {currentPhase >= 1 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6 }}
              className="mt-8"
            >
              <div className="relative">
                <motion.p
                  className="text-blue-200 mb-4 text-lg"
                  style={{ fontFamily: 'Amiri, serif' }}
                >
                  {currentPhase === 1 && "جاري تحميل المصحف الشريف..."}
                  {currentPhase === 2 && "إعداد البيئة التعليمية..."}
                  {currentPhase === 3 && "مرحباً بك في رحلة الحفظ..."}
                </motion.p>

                <div className="w-64 h-2 bg-blue-800 rounded-full mx-auto overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-400 to-blue-200 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ 
                      width: currentPhase === 1 ? '33%' : 
                             currentPhase === 2 ? '66%' : 
                             currentPhase === 3 ? '100%' : '0%' 
                    }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>

                <div className="flex justify-center mt-4 space-x-2">
                  {[0, 1, 2].map((dot) => (
                    <motion.div
                      key={dot}
                      className="w-3 h-3 bg-blue-300 rounded-full"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: dot * 0.2,
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: currentPhase >= 2 ? 1 : 0 }}
          transition={{ duration: 1 }}
          className="absolute bottom-20 left-1/2 transform -translate-x-1/2"
        >
          <p className="text-blue-200 text-sm" style={{ fontFamily: 'Amiri, serif' }}>
            "وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ"
          </p>
          <p className="text-blue-300 text-xs mt-1">
            And We have certainly made the Quran easy for remembrance, so is there any who will remember?
          </p>
        </motion.div>
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        whileHover={{ opacity: 1 }}
        onClick={onComplete}
        className="absolute bottom-6 right-6 text-blue-300 text-sm hover:text-white transition-colors"
      >
        تخطي ←
      </motion.button>
    </div>
  );
}