import React, { useState, useEffect } from 'react';
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Import our new components
import { BustanSplashScreen } from "./components/BustanSplashScreen";
import { MainHomepage } from "./components/MainHomepage";
import { AboutUsPage } from "./components/AboutUsPage";
import { CoursesPage } from "./components/CoursesPage";
import { RegistrationForm } from "./components/RegistrationForm";
import { StudentLogin } from "./components/StudentLogin";
import { StudentDashboard } from "./components/StudentDashboard";
import { PersonalProfile } from "./components/PersonalProfile";
import QuranReader from "./components/QuranReader";

type AppState = 'splash' | 'home' | 'about' | 'courses' | 'auth' | 'register' | 'dashboard' | 'profile' | 'quran';

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
    // Instead of changing state, just stay on the same page
    // The user will now be able to login and see their profile
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
          <MainHomepage
            onLoginClick={() => setAppState('auth')}
            onRegisterClick={() => setAppState('register')}
            onQuranReader={() => setAppState('quran')}
            onAboutUs={() => setAppState('about')}
            onCourses={() => setAppState('courses')}
          />
        );
      
      case 'about':
        return (
          <AboutUsPage
            onBack={() => setAppState('home')}
          />
        );
      
      case 'courses':
        return (
          <CoursesPage
            onBack={() => setAppState('home')}
            onRegisterClick={() => setAppState('register')}
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
            onProfile={() => setAppState('profile')}
          />
        ) : null;
      
      case 'profile':
        return currentStudent ? (
          <PersonalProfile
            student={currentStudent}
            onBack={() => setAppState('dashboard')}
            onQuranReader={() => setAppState('quran')}
          />
        ) : null;
      
      case 'quran':
        return (
          <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
            {/* Header with back button */}
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white p-4">
              <div className="max-w-6xl mx-auto flex justify-between items-center flex-wrap">
                <h1 className="text-xl md:text-2xl font-bold mb-2 md:mb-0" style={{ fontFamily: 'Amiri, serif' }}>
                  قارئ القرآن الكريم
                </h1>
                <div className="flex items-center space-x-2 md:space-x-4 flex-wrap">
                  <button
                    onClick={() => currentStudent ? setAppState('dashboard') : setAppState('home')}
                    className="bg-white/20 hover:bg-white/30 px-3 md:px-4 py-2 rounded-lg transition-colors text-sm md:text-base"
                  >
                    ← العودة
                  </button>
                  {currentStudent && (
                    <span className="text-amber-200 text-sm md:text-base">
                      {currentStudent.studentName}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Quran Reader Container */}
            <div className="p-2 md:p-6">
              <div className="max-w-6xl mx-auto">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-2xl p-3 md:p-6">
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