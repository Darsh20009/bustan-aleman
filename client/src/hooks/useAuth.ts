import { useQuery } from "@tanstack/react-query";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'supervisor' | 'admin';
  phoneNumber?: string;
  registrationCompleted: boolean;
  studentId?: string;
  currentLevel?: string;
  memorizedSurahs?: string;
}

export function useAuth() {
  const { data: user, isLoading, refetch, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      try {
        const response = await fetch('/api/auth/user', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            console.log('[useAuth] Not authenticated');
          } else {
            console.error('[useAuth] Error:', response.status);
          }
          throw new Error('Not authenticated');
        }

        const userData = await response.json();
        console.log('[useAuth] User data received:', userData);
        return userData;
      } catch (err) {
        console.error('[useAuth] Fetch error:', err);
        throw err;
      }
    },
    retry: 1,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 دقائق
    gcTime: 10 * 60 * 1000, // 10 دقائق
    refetchInterval: false,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });

  const logout = async () => {
    try {
      // Clear remember me data
      localStorage.removeItem('rememberMe');
      localStorage.removeItem('rememberMeExpiry');
      localStorage.removeItem('rememberMePhone');

      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });

      // Clear query cache and refetch
      refetch();

      // Redirect to home page
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !error,
    isStudent: user?.role === 'student',
    isSupervisor: user?.role === 'supervisor',
    isAdmin: user?.role === 'admin',
    logout,
    refetch,
  };
}