import { Route, Switch } from "wouter";
import SessionManagementPage from "./pages/SessionManagementPage";
import LiveSession from "./pages/LiveSession";
import { useAuth } from "./hooks/useAuth";
import { AuthPage } from "./components/AuthPage";
import { AdminStatisticsPage } from "./pages/admin/AdminStatistics";
import { AdminTeachersPage } from "./pages/admin/AdminTeachers";
import { AdminHalaqasPage } from "./pages/admin/AdminHalaqas";
import { AdminSubscriptionsPage } from "./pages/admin/AdminSubscriptions";
import { AdminMessagesPage } from "./pages/admin/AdminMessages";

export function AppRoutes() {
  const { isAuthenticated, user } = useAuth();

  const requireAuth = (Component: React.ComponentType) => {
    if (!isAuthenticated || !user) {
      return <AuthPage />;
    }
    return <Component />;
  };

  const requireSheikh = (Component: React.ComponentType) => {
    if (!isAuthenticated || !user || (user.role !== 'supervisor' && user.role !== 'admin')) {
      return <AuthPage />;
    }
    return <Component />;
  };

  const requireAdminOrOwner = (Component: React.ComponentType) => {
    if (!isAuthenticated || !user || !['supervisor', 'admin', 'owner'].includes(user.role)) {
      return <AuthPage />;
    }
    return <Component />;
  };

  return (
    <Switch>
      <Route path="/sessions" component={() => requireSheikh(SessionManagementPage)} />
      <Route path="/session/:roomToken" component={() => requireAuth(LiveSession)} />
      {/* Admin Routes - accessible by admin and owner roles */}
      <Route path="/admin/statistics" component={() => requireAdminOrOwner(AdminStatisticsPage)} />
      <Route path="/admin/teachers" component={() => requireAdminOrOwner(AdminTeachersPage)} />
      <Route path="/admin/halaqas" component={() => requireAdminOrOwner(AdminHalaqasPage)} />
      <Route path="/admin/subscriptions" component={() => requireAdminOrOwner(AdminSubscriptionsPage)} />
      <Route path="/admin/messages" component={() => requireAdminOrOwner(AdminMessagesPage)} />
      <Route>404: لم يتم العثور على الصفحة</Route>
    </Switch>
  );
}
