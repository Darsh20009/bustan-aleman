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
      const response = await fetch('/api/auth/user', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Not authenticated');
      }
      
      return response.json();
    },
    retry: false,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: false, // Disable automatic refetching
    refetchOnWindowFocus: false, // Disable refetch on window focus
    refetchOnMount: false, // Only fetch on first mount
  });

  const logout = async () => {
    try {
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
