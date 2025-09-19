import React, { useState } from 'react';
import { AuthForm } from './AuthForm';
import { useAuth } from '../hooks/useAuth';
import { useMutation } from '@tanstack/react-query';

interface AuthResponse {
  message: string;
  user?: any;
}

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState<string>('');
  
  const { refetch } = useAuth();

  const authMutation = useMutation({
    mutationFn: async (data: any) => {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'حدث خطأ أثناء المعالجة');
      }

      return result;
    },
    onSuccess: (data: AuthResponse) => {
      setError('');
      
      // Refresh auth state
      refetch();
      
      // Show success message
      alert(data.message);
      
      // Redirect based on user role
      if (data.user) {
        const role = data.user.role;
        switch (role) {
          case 'student':
            window.location.href = '/dashboard';
            break;
          case 'supervisor':
            window.location.href = '/supervisor';
            break;
          case 'admin':
            window.location.href = '/admin';
            break;
          default:
            window.location.href = '/';
        }
      } else {
        window.location.href = '/';
      }
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const handleSubmit = async (data: any) => {
    setError('');
    authMutation.mutate(data);
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
  };

  return (
    <AuthForm
      mode={mode}
      onSubmit={handleSubmit}
      onToggleMode={toggleMode}
      loading={authMutation.isPending}
      error={error}
    />
  );
}