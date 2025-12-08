import { Route, Switch } from "wouter";
import SessionManagementPage from "./pages/SessionManagementPage";
import LiveSession from "./pages/LiveSession";
import { useAuth } from "./hooks/useAuth";
import { AuthPage } from "./components/AuthPage";
import AdminStatistics from "./pages/AdminStatistics";
import AdminTeachers from "./pages/AdminTeachers";
import AdminHalaqas from "./pages/AdminHalaqas";
import AdminSubscriptions from "./pages/AdminSubscriptions";
import AdminMessages from "./pages/AdminMessages";

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
    if (!isAuthenticated || !user || (user.role !== 'supervisor' && user.role !== 'admin' && user.role !== 'owner')) {
      return <AuthPage />;
    }
    return <Component />;
  };

  return (
    <Switch>
      <Route path="/sessions" component={() => requireSheikh(SessionManagementPage)} />
      <Route path="/session/:roomToken" component={() => requireAuth(LiveSession)} />
      {/* Admin Routes - accessible by admin and owner roles */}
      <Route path="/admin/statistics" component={() => requireAdminOrOwner(AdminStatistics)} />
      <Route path="/admin/teachers" component={() => requireAdminOrOwner(AdminTeachers)} />
      <Route path="/admin/halaqas" component={() => requireAdminOrOwner(AdminHalaqas)} />
      <Route path="/admin/subscriptions" component={() => requireAdminOrOwner(AdminSubscriptions)} />
      <Route path="/admin/messages" component={() => requireAdminOrOwner(AdminMessages)} />
      <Route>404: لم يتم العثور على الصفحة</Route>
    </Switch>
  );
}