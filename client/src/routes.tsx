import { Route, Switch } from "wouter";
import SessionManagementPage from "./pages/SessionManagementPage";
import { useAuth } from "./hooks/useAuth";
import { AuthPage } from "./components/AuthPage";

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

  return (
    <Switch>
      <Route path="/sessions" component={() => requireSheikh(SessionManagementPage)} />
      <Route>404: لم يتم العثور على الصفحة</Route>
    </Switch>
  );
}
