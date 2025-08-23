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
    <div className="fixed inset-0 bg-gradient-to-br from-amber-900 via-orange-800 to-amber-950 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-white/5 animate-pulse"></div>
        
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={`floating-${i}`}
            className="absolute w-20 h-20 opacity-10"
            style={{
              left: `${20 + (i % 3) * 30}%`,
              top: `${20 + Math.floor(i / 3) * 25}%`,
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
            <div className="w-full h-full border-2 border-amber-300 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-amber-300 rounded-full opacity-50"></div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 text-center">
        <AnimatePresence>
          {showLogo && (
            <motion.div
              key="logo-section"
              initial={{ scale: 0, rotate: -180, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, rotate: 180, opacity: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="mb-8"
            >
              <div className="relative mb-6">
                <motion.div
                  animate={{ rotateY: [0, 10, -10, 0] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  className="w-40 h-40 mx-auto mb-4"
                >
                  <svg viewBox="0 0 240 200" className="w-full h-full text-amber-300">
                    <defs>
                      <linearGradient id="bookGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="50%" stopColor="#d97706" />
                        <stop offset="100%" stopColor="#92400e" />
                      </linearGradient>
                      <linearGradient id="pageGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fffbeb" />
                        <stop offset="100%" stopColor="#fef3c7" />
                      </linearGradient>
                    </defs>
                    
                    {/* غلاف المصحف */}
                    <motion.g
                      animate={{ rotateY: currentPhase >= 1 ? -15 : 0 }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      style={{ transformOrigin: "120px 100px" }}
                    >
                      {/* الصفحة اليسرى */}
                      <motion.path
                        d="M20 50 L20 170 Q20 175 25 175 L115 175 Q118 175 118 172 L118 53 Q118 50 115 50 Z"
                        fill="url(#pageGradient)"
                        stroke="#d97706"
                        strokeWidth="2"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: showLogo ? 1 : 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        style={{ transformOrigin: "118px 100px" }}
                      />
                      
                      {/* النص في الصفحة اليسرى */}
                      <motion.g
                        initial={{ opacity: 0 }}
                        animate={{ opacity: currentPhase >= 1 ? 1 : 0 }}
                        transition={{ delay: 1 }}
                      >
                        <text x="70" y="70" textAnchor="middle" fill="#92400e" fontSize="8" fontFamily="serif">بِسْمِ اللَّهِ</text>
                        <text x="70" y="85" textAnchor="middle" fill="#92400e" fontSize="8" fontFamily="serif">الرَّحْمَنِ الرَّحِيمِ</text>
                        <line x1="30" y1="95" x2="110" y2="95" stroke="#d97706" strokeWidth="1" opacity="0.6" />
                        <line x1="30" y1="105" x2="110" y2="105" stroke="#d97706" strokeWidth="1" opacity="0.4" />
                        <line x1="30" y1="115" x2="110" y2="115" stroke="#d97706" strokeWidth="1" opacity="0.4" />
                        <line x1="30" y1="125" x2="110" y2="125" stroke="#d97706" strokeWidth="1" opacity="0.4" />
                      </motion.g>
                    </motion.g>
                    
                    {/* الصفحة اليمنى */}
                    <motion.g
                      animate={{ rotateY: currentPhase >= 1 ? 15 : 0 }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      style={{ transformOrigin: "122px 100px" }}
                    >
                      <motion.path
                        d="M122 50 L217 50 Q220 50 220 53 L220 172 Q220 175 217 175 L125 175 Q122 175 122 172 Z"
                        fill="url(#pageGradient)"
                        stroke="#d97706"
                        strokeWidth="2"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: showLogo ? 1 : 0 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        style={{ transformOrigin: "122px 100px" }}
                      />
                      
                      {/* النص في الصفحة اليمنى */}
                      <motion.g
                        initial={{ opacity: 0 }}
                        animate={{ opacity: currentPhase >= 2 ? 1 : 0 }}
                        transition={{ delay: 1.5 }}
                      >
                        <text x="170" y="70" textAnchor="middle" fill="#92400e" fontSize="8" fontFamily="serif">الْحَمْدُ لِلَّهِ</text>
                        <text x="170" y="85" textAnchor="middle" fill="#92400e" fontSize="8" fontFamily="serif">رَبِّ الْعَالَمِينَ</text>
                        <line x1="130" y1="95" x2="210" y2="95" stroke="#d97706" strokeWidth="1" opacity="0.6" />
                        <line x1="130" y1="105" x2="210" y2="105" stroke="#d97706" strokeWidth="1" opacity="0.4" />
                        <line x1="130" y1="115" x2="210" y2="115" stroke="#d97706" strokeWidth="1" opacity="0.4" />
                        <line x1="130" y1="125" x2="210" y2="125" stroke="#d97706" strokeWidth="1" opacity="0.4" />
                      </motion.g>
                    </motion.g>
                    
                    {/* زخرفة إسلامية في الوسط */}
                    <motion.circle
                      cx="120" cy="100" r="8"
                      fill="url(#bookGradient)"
                      initial={{ scale: 0 }}
                      animate={{ scale: currentPhase >= 1 ? 1 : 0 }}
                      transition={{ delay: 0.8, type: "spring" }}
                    />
                    <motion.text
                      x="120" y="105" textAnchor="middle" fill="white"
                      fontSize="8" fontFamily="serif"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: currentPhase >= 2 ? 1 : 0 }}
                      transition={{ delay: 1.2 }}
                    >
                      📖
                    </motion.text>
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
              key="progress-section"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6 }}
              className="mt-8"
            >
              <div className="relative">
                <motion.p
                  className="text-amber-200 mb-4 text-lg"
                  style={{ fontFamily: 'Amiri, serif' }}
                >
                  {currentPhase === 1 && "جاري فتح المصحف الشريف..."}
                  {currentPhase === 2 && "إعداد البيئة التعليمية..."}
                  {currentPhase === 3 && "مرحباً بك في رحلة الحفظ..."}
                </motion.p>

                <div className="w-64 h-2 bg-amber-800 rounded-full mx-auto overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-300 rounded-full"
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
                      key={`dot-${dot}`}
                      className="w-3 h-3 bg-amber-300 rounded-full"
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
          className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-center px-4 max-w-xs md:max-w-md"
        >
          <p className="text-amber-200 text-sm" style={{ fontFamily: 'Amiri, serif' }}>
            "وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ"
          </p>
          <p className="text-amber-300 text-xs mt-1">
            And We have certainly made the Quran easy for remembrance, so is there any who will remember?
          </p>
        </motion.div>
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        whileHover={{ opacity: 1 }}
        onClick={onComplete}
        className="absolute bottom-6 right-6 text-amber-300 text-sm hover:text-white transition-colors"
      >
        تخطي ←
      </motion.button>
    </div>
  );
}