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
  const { data: user, isLoading, refetch, error } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      const response = await fetch('/api/auth/user', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        return null;
      }

      if (!response.ok) {
        console.error('[useAuth] Error:', response.status);
        throw new Error('Auth error');
      }

      const userData = await response.json();
      return userData;
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
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
    isError: !!error,
    error,
    isAuthenticated: !!user,
    isStudent: user?.role === 'student',
    isSupervisor: user?.role === 'supervisor',
    isAdmin: user?.role === 'admin',
    logout,
    refetch,
  };
}