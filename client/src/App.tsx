import React, { useState, useEffect } from 'react';
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Import our new components
import { BustanSplashScreen } from "./components/BustanSplashScreen";
import { NewHomepage } from "./components/NewHomepage";
import { RegistrationForm } from "./components/RegistrationForm";
import { StudentLogin } from "./components/StudentLogin";
import { StudentDashboard } from "./components/StudentDashboard";
import QuranReader from "./components/QuranReader";

type AppState = 'splash' | 'home' | 'auth' | 'register' | 'dashboard' | 'quran';

interface Student {
  id: string;
  studentName: string;
  email: string;
  memorizedSurahs: string[];
  currentLevel: string;
  schedules: any[];
  errors: any[];
  sessions: any[];
  payments: any[];
}

function App() {
  const [appState, setAppState] = useState<AppState>('splash');
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);

  // Initialize default students on app start
  useEffect(() => {
    const initializeData = async () => {
      try {
        await fetch('/api/init-data', { method: 'POST' });
      } catch (error) {
        console.error('Failed to initialize data:', error);
      }
    };

    initializeData();
  }, []);

  const handleSplashComplete = () => {
    setAppState('home');
  };

  const handleLoginSuccess = (student: Student) => {
    setCurrentStudent(student);
    setAppState('dashboard');
  };

  const handleRegistrationSuccess = () => {
    setAppState('home');
  };

  const handleLogout = () => {
    fetch('/api/student-logout', { method: 'POST' })
      .then(() => {
        setCurrentStudent(null);
        setAppState('home');
      })
      .catch(console.error);
  };

  const renderCurrentState = () => {
    switch (appState) {
      case 'splash':
        return <BustanSplashScreen onComplete={handleSplashComplete} />;
      
      case 'home':
        return (
          <NewHomepage
            onLoginClick={() => setAppState('auth')}
            onRegisterClick={() => setAppState('register')}
            onQuranReader={() => setAppState('quran')}
          />
        );
      
      case 'auth':
        return (
          <StudentLogin
            onLoginSuccess={handleLoginSuccess}
            onRegisterClick={() => setAppState('register')}
          />
        );
      
      case 'register':
        return (
          <RegistrationForm
            onRegistrationSuccess={handleRegistrationSuccess}
          />
        );
      
      case 'dashboard':
        return currentStudent ? (
          <StudentDashboard
            student={currentStudent}
            onLogout={handleLogout}
            onQuranReader={() => setAppState('quran')}
          />
        ) : null;
      
      case 'quran':
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
            {/* Header with back button */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
              <div className="max-w-6xl mx-auto flex justify-between items-center">
                <h1 className="text-2xl font-bold" style={{ fontFamily: 'Amiri, serif' }}>
                  قارئ القرآن الكريم
                </h1>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setAppState('dashboard')}
                    className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
                  >
                    ← العودة للوحة التحكم
                  </button>
                  <span className="text-blue-200">
                    {currentStudent?.studentName}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Quran Reader Container */}
            <div className="p-6">
              <div className="max-w-6xl mx-auto">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl p-6">
                  <QuranReader mode="page" pageNumber={1} />
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen" dir="rtl">
          <Toaster />
          {renderCurrentState()}
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;