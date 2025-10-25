'use client';

import { useAuthStore } from '../../stores/auth-store';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Loading } from '../ui/loading';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function AuthGuard({
  children,
  fallback,
  redirectTo = '/login'
}: AuthGuardProps) {
  const { user, isLoading, isInitialized, initialize } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Initialize auth state on mount
    console.log('AuthGuard - Initializing auth state');
    initialize();
  }, [initialize]);

  useEffect(() => {
    console.log('AuthGuard - Auth check:', {
      isLoading,
      isInitialized,
      hasUser: !!user,
      shouldRedirect: isInitialized && !isLoading && !user
    });

    // Only redirect after initialization is complete
    if (isInitialized && !isLoading && !user) {
      console.log('AuthGuard - Redirecting to login (no user)');
      router.push(redirectTo);
    }
  }, [user, isLoading, isInitialized, router, redirectTo]);

  // Show loading state while checking authentication
  if (isLoading || !isInitialized) {
    console.log('AuthGuard - Showing loading state');
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 h-12 w-12"></div>
          <p className="text-sm text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show nothing while redirecting (prevents flash of protected content)
  if (!user) {
    console.log('AuthGuard - No user, redirecting...');
    return null;
  }

  // User is authenticated, render children
  console.log('AuthGuard - User authenticated, rendering protected content');
  return <>{children}</>;
}