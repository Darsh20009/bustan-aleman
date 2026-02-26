import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, Redirect } from "wouter";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { useAuth } from "./hooks/useAuth";
import { InstallPrompt } from "@/components/InstallPrompt";

import { MainHomepage } from "./components/MainHomepage";
import { AuthPage } from "./components/AuthPage";
import { RegisterPage } from "./pages/RegisterPage";
import ForgotPassword from "./pages/ForgotPassword";
import QuranPageReader from "./components/QuranPageReader";
import QuranRecitationPage from "./pages/QuranRecitationPage";
import { AboutUsPage } from "./components/AboutUsPage";
import { CoursesPage } from "./components/CoursesPage";
import LiveSession from "./pages/LiveSession";
import BankTransferCheckoutPage from "./pages/BankTransferCheckoutPage";
import BankTransferAdminPage from "./pages/BankTransferAdminPage";

import { StudentDashboardPage } from "./pages/student/StudentDashboard";
import { StudentHomeworkPage } from "./pages/student/StudentHomework";
import { StudentMemorizationPage } from "./pages/student/StudentMemorization";
import { StudentAttendancePage } from "./pages/student/StudentAttendance";
import { StudentSubscriptionPage } from "./pages/student/StudentSubscription";
import { StudentContactPage } from "./pages/student/StudentContact";
import { StudentSessionsPage } from "./pages/student/StudentSessions";
import { StudentQuranTrackingPage } from "./pages/student/StudentQuranTracking";

import { TeacherDashboardPage } from "./pages/teacher/TeacherDashboard";
import { TeacherStudentsPage } from "./pages/teacher/TeacherStudents";
import { TeacherAttendancePage } from "./pages/teacher/TeacherAttendance";
import { TeacherMemorizationPage } from "./pages/teacher/TeacherMemorization";
import { TeacherHomeworkPage } from "./pages/teacher/TeacherHomework";
import { TeacherReportsPage } from "./pages/teacher/TeacherReports";
import { TeacherSessionsPage } from "./pages/teacher/TeacherSessions";
import { TeacherSchedulePage } from "./pages/teacher/TeacherSchedule";
import { TeacherSubscriptionsPage } from "./pages/teacher/TeacherSubscriptions";
import { TeacherMessagesPage } from "./pages/teacher/TeacherMessages";
import { TeacherQuranTrackingPage } from "./pages/teacher/TeacherQuranTracking";

import CartPage from "./pages/CartPage";
import { ProfilePage } from "./pages/ProfilePage";

import { AdminStatisticsPage } from "./pages/admin/AdminStatistics";
import { AdminUsersPage } from "./pages/admin/AdminUsers";
import { AdminTeachersPage } from "./pages/admin/AdminTeachers";
import { AdminHalaqasPage } from "./pages/admin/AdminHalaqas";
import { AdminSubscriptionsPage } from "./pages/admin/AdminSubscriptions";
import { AdminMessagesPage } from "./pages/admin/AdminMessages";

import NotFound from "./pages/not-found";

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles: string[] }) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  if (user && !allowedRoles.includes(user.role)) {
    if (user.role === 'student') return <Redirect to="/student" />;
    if (user.role === 'supervisor') return <Redirect to="/teacher" />;
    if (user.role === 'admin') return <Redirect to="/admin" />;
  }

  return <>{children}</>;
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    if (user.role === 'student') return <Redirect to="/student" />;
    if (user.role === 'supervisor') return <Redirect to="/teacher" />;
    if (user.role === 'admin') return <Redirect to="/admin" />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Switch>
      <Route path="/">
        <PublicOnlyRoute>
          <MainHomepage
            onLoginClick={() => window.location.href = '/login'}
            onRegisterClick={() => window.location.href = '/register'}
            onQuranReader={() => window.location.href = '/quran'}
            onAboutUs={() => window.location.href = '/about'}
            onCourses={() => window.location.href = '/courses'}
          />
        </PublicOnlyRoute>
      </Route>

      <Route path="/login">
        <PublicOnlyRoute>
          <AuthPage />
        </PublicOnlyRoute>
      </Route>

      <Route path="/register">
        <PublicOnlyRoute>
          <RegisterPage />
        </PublicOnlyRoute>
      </Route>

      <Route path="/forgot-password">
        <ForgotPassword onBack={() => window.location.href = '/login'} />
      </Route>

      <Route path="/quran">
        <QuranPageReader onBack={() => window.history.back()} />
      </Route>

      <Route path="/quran/recitation">
        <QuranRecitationPage onBack={() => window.history.back()} />
      </Route>

      <Route path="/about">
        <AboutUsPage onBack={() => window.location.href = '/'} />
      </Route>

      <Route path="/courses">
        <CoursesPage
          onBack={() => window.location.href = '/'}
          onRegisterClick={() => window.location.href = '/register'}
          isLoggedIn={false}
          currentStudent={null}
        />
      </Route>

      <Route path="/session/:roomToken">
        <LiveSession />
      </Route>

      <Route path="/bank-transfer-checkout">
        <BankTransferCheckoutPage />
      </Route>

      <Route path="/admin/bank-transfers">
        <ProtectedRoute allowedRoles={['admin']}>
          <BankTransferAdminPage />
        </ProtectedRoute>
      </Route>

      <Route path="/student">
        <ProtectedRoute allowedRoles={['student']}>
          <StudentDashboardPage />
        </ProtectedRoute>
      </Route>

      <Route path="/student/homework">
        <ProtectedRoute allowedRoles={['student']}>
          <StudentHomeworkPage />
        </ProtectedRoute>
      </Route>

      <Route path="/student/memorization">
        <ProtectedRoute allowedRoles={['student']}>
          <StudentMemorizationPage />
        </ProtectedRoute>
      </Route>

      <Route path="/student/attendance">
        <ProtectedRoute allowedRoles={['student']}>
          <StudentAttendancePage />
        </ProtectedRoute>
      </Route>

      <Route path="/student/subscription">
        <ProtectedRoute allowedRoles={['student']}>
          <StudentSubscriptionPage />
        </ProtectedRoute>
      </Route>

      <Route path="/student/contact">
        <ProtectedRoute allowedRoles={['student']}>
          <StudentContactPage />
        </ProtectedRoute>
      </Route>

      <Route path="/student/sessions">
        <ProtectedRoute allowedRoles={['student']}>
          <StudentSessionsPage />
        </ProtectedRoute>
      </Route>

      <Route path="/student/quran-tracking">
        <ProtectedRoute allowedRoles={['student']}>
          <StudentQuranTrackingPage />
        </ProtectedRoute>
      </Route>

      <Route path="/cart">
        <ProtectedRoute allowedRoles={['student']}>
          <CartPage onBack={() => window.history.back()} />
        </ProtectedRoute>
      </Route>

      <Route path="/profile">
        <ProtectedRoute allowedRoles={['student', 'supervisor', 'admin', 'owner', 'teacher']}>
          <ProfilePage />
        </ProtectedRoute>
      </Route>

      <Route path="/teacher/dashboard">
        <ProtectedRoute allowedRoles={['supervisor']}>
          <TeacherDashboardPage />
        </ProtectedRoute>
      </Route>

      <Route path="/teacher">
        <ProtectedRoute allowedRoles={['supervisor']}>
          <TeacherStudentsPage />
        </ProtectedRoute>
      </Route>

      <Route path="/teacher/attendance">
        <ProtectedRoute allowedRoles={['supervisor']}>
          <TeacherAttendancePage />
        </ProtectedRoute>
      </Route>

      <Route path="/teacher/memorization">
        <ProtectedRoute allowedRoles={['supervisor']}>
          <TeacherMemorizationPage />
        </ProtectedRoute>
      </Route>

      <Route path="/teacher/homework">
        <ProtectedRoute allowedRoles={['supervisor']}>
          <TeacherHomeworkPage />
        </ProtectedRoute>
      </Route>

      <Route path="/teacher/reports">
        <ProtectedRoute allowedRoles={['supervisor']}>
          <TeacherReportsPage />
        </ProtectedRoute>
      </Route>

      <Route path="/teacher/sessions">
        <ProtectedRoute allowedRoles={['supervisor']}>
          <TeacherSessionsPage />
        </ProtectedRoute>
      </Route>

      <Route path="/teacher/schedule">
        <ProtectedRoute allowedRoles={['supervisor']}>
          <TeacherSchedulePage />
        </ProtectedRoute>
      </Route>

      <Route path="/teacher/subscriptions">
        <ProtectedRoute allowedRoles={['supervisor']}>
          <TeacherSubscriptionsPage />
        </ProtectedRoute>
      </Route>

      <Route path="/teacher/messages">
        <ProtectedRoute allowedRoles={['supervisor']}>
          <TeacherMessagesPage />
        </ProtectedRoute>
      </Route>

      <Route path="/teacher/quran-tracking">
        <ProtectedRoute allowedRoles={['supervisor']}>
          <TeacherQuranTrackingPage />
        </ProtectedRoute>
      </Route>

      <Route path="/admin">
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminStatisticsPage />
        </ProtectedRoute>
      </Route>

      <Route path="/admin/users">
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminUsersPage />
        </ProtectedRoute>
      </Route>

      <Route path="/admin/teachers">
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminTeachersPage />
        </ProtectedRoute>
      </Route>

      <Route path="/admin/halaqas">
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminHalaqasPage />
        </ProtectedRoute>
      </Route>

      <Route path="/admin/subscriptions">
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminSubscriptionsPage />
        </ProtectedRoute>
      </Route>

      <Route path="/admin/messages">
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminMessagesPage />
        </ProtectedRoute>
      </Route>

      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <TooltipProvider>
            <AppRoutes />
            <Toaster />
            <InstallPrompt />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;