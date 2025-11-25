import React, { useState, useEffect } from 'react';
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "./hooks/useAuth";
import { Route, Switch, Redirect } from "wouter";
import { ThemeProvider } from "./contexts/ThemeContext";

// Import our new authentication components
import { AuthPage } from "./components/AuthPage";
import { RoleBasedNav } from "./components/RoleBasedNav";
import { SupportChat } from "./components/SupportChat";

// Import existing components
import { BustanSplashScreen } from "./components/BustanSplashScreen";
import { MainHomepage } from "./components/MainHomepage";
import { AboutUsPage } from "./components/AboutUsPage";
import { CoursesPage } from "./components/CoursesPage";
import { MyCoursesPage } from "./components/MyCoursesPage";
import { StudentDashboard } from "./components/StudentDashboard";
import { PersonalProfile } from "./components/PersonalProfile";
import CertificatesPage from "./components/CertificatesPage";
import QuranPageReader from "./components/QuranPageReader";
import { AnnouncementsPage } from "./pages/AnnouncementsPage";
import QuranStats from "./pages/QuranStats";
import MemorizationPage from "./pages/MemorizationPage";
import QuranWorkspace from "./pages/QuranWorkspace";
import MySessionPage from "./pages/MySessionPage";
import MyNotesPage from "./pages/MyNotesPage";
import SheikhScheduleManager from "./pages/SheikhScheduleManager";
import SheikhQuranEditing from "./pages/SheikhQuranEditing";
import DataManagement from "./pages/DataManagement";
import LiveSession from "./pages/LiveSession";
import { CreateCoursePage } from "./pages/CreateCoursePage";
import CartPage from "./pages/CartPage";
import StudentSessions from "./pages/StudentSessions";
import ForgotPassword from "./pages/ForgotPassword";
import PaymentManagementPage from "./pages/PaymentManagementPage";
import CourseStudentManagementPage from "./pages/CourseStudentManagementPage";
import NotificationsPage from "./pages/NotificationsPage";
import { EducationalTripsPage } from "./pages/EducationalTripsPage";
import EnrollmentManagementPage from "./pages/EnrollmentManagementPage";
import MySubscriptionsPage from "./pages/MySubscriptionsPage";

type AppState = 'splash' | 'home' | 'about' | 'courses' | 'my-courses' | 'auth' | 'dashboard' | 'profile' | 'quran' | 'certificates' | 'announcements' | 'trips' | 'quran-stats' | 'memorization' | 'quran-workspace' | 'my-session' | 'my-notes' | 'sheikh-schedule' | 'sheikh-quran-editing' | 'data-management' | 'create-course' | 'cart' | 'student-sessions' | 'forgot-password' | 'payments' | 'course-students' | 'notifications' | 'enrollments' | 'my-subscriptions';

// Helper function to check if a path is a valid AppState
const isValidAppState = (path: string): path is AppState => {
  const validStates: AppState[] = ['splash', 'home', 'about', 'courses', 'my-courses', 'auth', 'dashboard', 'profile', 'quran', 'certificates', 'announcements', 'trips', 'quran-stats', 'memorization', 'quran-workspace', 'my-session', 'my-notes', 'sheikh-schedule', 'sheikh-quran-editing', 'data-management', 'create-course', 'cart', 'student-sessions', 'forgot-password', 'payments', 'course-students', 'notifications', 'enrollments', 'my-subscriptions'];
  return validStates.includes(path as AppState);
};

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
    // لا نعرض شاشة تحميل مطولة - فقط نتابع مع الحالة الحالية
    // هذا يمنع الحلقة اللانهائية

    switch (appState) {
      case 'splash':
        return <BustanSplashScreen onComplete={handleSplashComplete} />;
      
      case 'home':
        // If authenticated, show role-based navigation instead of homepage
        if (isAuthenticated && user) {
          return <RoleBasedNav onNavigate={(path) => {
            // Normalize path by removing leading and trailing slashes
            const normalized = path.replace(/^\/+|\/+$/g, "");
            
            // If it's a valid app state, use state navigation
            if (isValidAppState(normalized)) {
              setAppState(normalized);
            } else {
              // For other paths (like supervisor/students), use URL navigation
              // Ensure path has leading slash
              const fullPath = path.startsWith('/') ? path : `/${path}`;
              window.location.href = fullPath;
            }
          }} />;
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
          return <RoleBasedNav onNavigate={(path) => {
            // Normalize path by removing leading and trailing slashes
            const normalized = path.replace(/^\/+|\/+$/g, "");
            if (isValidAppState(normalized)) {
              setAppState(normalized);
            } else {
              const fullPath = path.startsWith('/') ? path : `/${path}`;
              window.location.href = fullPath;
            }
          }} />;
        }
        return <AuthPage onForgotPasswordClick={() => setAppState('forgot-password')} />;
      
      case 'dashboard':
        // Use the new role-based navigation instead of old dashboard
        if (isAuthenticated && user) {
          return <RoleBasedNav onNavigate={(path) => {
            // Normalize path by removing leading and trailing slashes
            const normalized = path.replace(/^\/+|\/+$/g, "");
            if (isValidAppState(normalized)) {
              setAppState(normalized);
            } else {
              const fullPath = path.startsWith('/') ? path : `/${path}`;
              window.location.href = fullPath;
            }
          }} />;
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
      
      case 'certificates':
        if (isAuthenticated && user) {
          return <CertificatesPage />;
        } else {
          return <AuthPage />;
        }
      
      case 'announcements':
        if (isAuthenticated && user) {
          return <AnnouncementsPage />;
        } else {
          return <AuthPage />;
        }
      
      case 'trips':
        return (
          <EducationalTripsPage
            onBack={() => isAuthenticated && user ? setAppState('dashboard') : setAppState('home')}
            onRegisterClick={() => setAppState('auth')}
          />
        );
      
      case 'quran-stats':
        if (isAuthenticated && user) {
          return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                  <h1 className="text-xl md:text-2xl font-bold">إحصائيات القراءة</h1>
                  <button
                    onClick={() => setAppState('dashboard')}
                    className="bg-white/20 hover:bg-white/30 px-3 md:px-4 py-2 rounded-lg transition-colors"
                    data-testid="button-back-quran-stats"
                  >
                    ← العودة
                  </button>
                </div>
              </div>
              <QuranStats />
            </div>
          );
        } else {
          return <AuthPage />;
        }
      
      case 'quran-workspace':
        return <QuranWorkspace />;
      
      case 'my-session':
        if (isAuthenticated && user) {
          return <MySessionPage onBack={() => setAppState('dashboard')} />;
        } else {
          return <AuthPage />;
        }
      
      case 'my-notes':
        if (isAuthenticated && user) {
          return <MyNotesPage />;
        } else {
          return <AuthPage />;
        }
      
      case 'sheikh-schedule':
        if (isAuthenticated && (user?.role === 'supervisor' || user?.role === 'admin')) {
          return <SheikhScheduleManager />;
        } else {
          return <AuthPage />;
        }
      
      case 'sheikh-quran-editing':
        if (isAuthenticated && (user?.role === 'supervisor' || user?.role === 'admin')) {
          return <SheikhQuranEditing />;
        } else {
          return <AuthPage />;
        }
      
      case 'data-management':
        if (isAuthenticated && (user?.role === 'supervisor' || user?.role === 'admin')) {
          return <DataManagement />;
        } else {
          return <AuthPage />;
        }
      
      case 'create-course':
        if (isAuthenticated && (user?.role === 'supervisor' || user?.role === 'admin')) {
          return <CreateCoursePage onBack={() => setAppState('dashboard')} />;
        } else {
          return <AuthPage />;
        }
      
      case 'cart':
        if (isAuthenticated) {
          return <CartPage onBack={() => setAppState('courses')} />;
        } else {
          return <AuthPage />;
        }
      
      case 'student-sessions':
        if (isAuthenticated && user?.role === 'student') {
          return <StudentSessions />;
        } else {
          return <AuthPage />;
        }
      
      case 'forgot-password':
        return <ForgotPassword onBack={() => setAppState('auth')} />;
      
      case 'payments':
        if (isAuthenticated && (user?.role === 'supervisor' || user?.role === 'admin')) {
          return <PaymentManagementPage />;
        } else {
          return <AuthPage />;
        }
      
      case 'course-students':
        if (isAuthenticated && (user?.role === 'supervisor' || user?.role === 'admin')) {
          return <CourseStudentManagementPage />;
        } else {
          return <AuthPage />;
        }
      
      case 'notifications':
        if (isAuthenticated && user) {
          return <NotificationsPage />;
        } else {
          return <AuthPage />;
        }
      
      case 'enrollments':
        if (isAuthenticated && (user?.role === 'supervisor' || user?.role === 'admin')) {
          return <EnrollmentManagementPage />;
        } else {
          return <AuthPage />;
        }
      
      case 'my-subscriptions':
        if (isAuthenticated && user?.role === 'student') {
          return <MySubscriptionsPage />;
        } else {
          return <AuthPage />;
        }
      
      case 'memorization':
        if (isAuthenticated && user) {
          return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                  <h1 className="text-xl md:text-2xl font-bold">متابعة الحفظ</h1>
                  <button
                    onClick={() => setAppState('dashboard')}
                    className="bg-white/20 hover:bg-white/30 px-3 md:px-4 py-2 rounded-lg transition-colors"
                    data-testid="button-back-memorization"
                  >
                    ← العودة
                  </button>
                </div>
              </div>
              <MemorizationPage />
            </div>
          );
        } else {
          return <AuthPage />;
        }
      
      case 'quran':
        return (
          <QuranPageReader 
            studentId={user?.studentId} 
            onBack={() => isAuthenticated && user ? setAppState('dashboard') : setAppState('home')}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen" dir="rtl">
      <Toaster />
      {renderCurrentState()}
      {user && <SupportChat userId={user.id} userRole={user.role} />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Switch>
            <Route path="/session/:roomToken">
              <LiveSession />
            </Route>
            <Route>
              <AppContent />
            </Route>
          </Switch>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;