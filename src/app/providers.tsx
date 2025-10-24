'use client';

import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from '../lib/query-client';
import { useAuthStore } from '../stores/auth-store';

interface ProvidersProps {
  children: React.ReactNode;
}

// Component to initialize auth state
function AuthInitializer({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const isLoading = useAuthStore((state) => state.isLoading);

  useEffect(() => {
    console.log('AuthInitializer - App starting, initializing auth state');
    console.log('AuthInitializer - Current auth state:', { isInitialized, isLoading });
    initialize();
  }, [initialize, isInitialized, isLoading]);

  // Log state changes for debugging
  useEffect(() => {
    console.log('AuthInitializer - Auth state changed:', { isInitialized, isLoading });
  }, [isInitialized, isLoading]);

  return <>{children}</>;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer>
        {children}
      </AuthInitializer>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}