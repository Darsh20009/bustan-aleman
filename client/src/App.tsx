import React, { useState, useEffect } from 'react';
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "./hooks/useAuth";

// Import our new authentication components
import { AuthPage } from "./components/AuthPage";
import { RoleBasedNav } from "./components/RoleBasedNav";

// Import existing components
import { BustanSplashScreen } from "./components/BustanSplashScreen";
import { MainHomepage } from "./components/MainHomepage";
import { AboutUsPage } from "./components/AboutUsPage";
import { CoursesPage } from "./components/CoursesPage";
import { MyCoursesPage } from "./components/MyCoursesPage";
import { StudentDashboard } from "./components/StudentDashboard";
import { PersonalProfile } from "./components/PersonalProfile";
import EnhancedQuranReader from "./components/EnhancedQuranReader";

type AppState = 'splash' | 'home' | 'about' | 'courses' | 'my-courses' | 'auth' | 'dashboard' | 'profile' | 'quran';

function AppContent() {
  const [appState, setAppState] = useState<AppState>('splash');
  const { user, isAuthenticated, isLoading } = useAuth();

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

  // Check if user is authenticated and redirect to appropriate state
  useEffect(() => {
    if (isAuthenticated && user && appState === 'auth') {
      setAppState('dashboard');
    }
  }, [isAuthenticated, user, appState]);

  const renderCurrentState = () => {
    // Show loading state while checking authentication
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري التحميل...</p>
          </div>
        </div>
      );
    }

    switch (appState) {
      case 'splash':
        return <BustanSplashScreen onComplete={handleSplashComplete} />;
      
      case 'home':
        // If authenticated, show role-based navigation instead of homepage
        if (isAuthenticated && user) {
          return <RoleBasedNav />;
        }
        return (
          <MainHomepage
            onLoginClick={() => setAppState('auth')}
            onRegisterClick={() => setAppState('auth')}
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
            onRegisterClick={() => setAppState('auth')}
            isLoggedIn={isAuthenticated}
            currentStudent={user?.role === 'student' ? user : null}
          />
        );
      
      case 'auth':
        // If already authenticated, redirect to appropriate dashboard
        if (isAuthenticated && user) {
          return <RoleBasedNav />;
        }
        return <AuthPage />;
      
      case 'dashboard':
        // Use the new role-based navigation instead of old dashboard
        if (isAuthenticated && user) {
          return <RoleBasedNav />;
        } else {
          return <AuthPage />;
        }

      case 'my-courses':
        return user?.role === 'student' ? (
          <MyCoursesPage
            onBack={() => setAppState('dashboard')}
            student={user}
          />
        ) : <AuthPage />;
      
      case 'profile':
        // Temporarily disable profile until updated for new user system
        return <div className="p-4">Profile page being updated...</div>;
      
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
                    onClick={() => isAuthenticated && user ? setAppState('dashboard') : setAppState('home')}
                    className="bg-white/20 hover:bg-white/30 px-3 md:px-4 py-2 rounded-lg transition-colors text-sm md:text-base"
                  >
                    ← العودة
                  </button>
                  {isAuthenticated && user && (
                    <span className="text-amber-200 text-sm md:text-base">
                      {user.firstName} {user.lastName}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Enhanced Quran Reader Container */}
            <div className="p-2 md:p-6">
              <div className="max-w-7xl mx-auto">
                <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl">
                  <EnhancedQuranReader 
                    initialSurah={1} 
                    studentId={user?.studentId}
                  />
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
    <div className="min-h-screen" dir="rtl">
      <Toaster />
      {renderCurrentState()}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;