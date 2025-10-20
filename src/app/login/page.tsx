'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import { useRecaptcha } from '@/hooks/useRecaptcha';
import { AuthResponse, LoginRequest, User } from '@/types/api';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const router = useRouter();
  const { login } = useAuthStore();
  const { executeRecaptcha, isLoaded: recaptchaLoaded } = useRecaptcha();

  const loginMutation = useMutation({
    mutationFn: async (data: LoginRequest) => {
      console.log('Attempting login to:', apiClient['baseURL']);
      const response = await apiClient.login(data);
      console.log('Login response:', response);
      return response;
    },
    onSuccess: async (data: AuthResponse) => {
      console.log('Login successful, response data:', data);

      // Backend returns user_id and role instead of full user object
      // We need to construct the user object or fetch it
      let userData: User | null = null;

      if (data.user) {
        // Full user object provided
        userData = data.user;
      } else if (data.user_id && data.role) {
        // Backend provided user_id and role, construct minimal user object
        console.log('Constructing user object from login response');
        userData = {
          id: data.user_id,
          email: '', // We don't have email in the response
          full_name: '', // We don't have full_name in the response
          role: data.role,
          is_active: true, // Assume active
          created_at: new Date().toISOString(), // Fallback
          // Try to fetch complete user data
        };

        // Try to fetch complete user data
        try {
          const fullUserData = await apiClient.getCurrentUser();
          userData = { ...userData, ...fullUserData };
          console.log('Fetched complete user data:', fullUserData);
        } catch {
          console.log('Could not fetch complete user data, using minimal data');
        }
      }

      if (!userData) {
        console.error('No user data available');
        alert('Login failed: User data not available');
        return;
      }

      console.log('Updating auth store with user:', userData);
      login(userData, data.access_token);
      console.log('Auth store updated, redirecting to dashboard...');
      router.push('/dashboard');
    },
    onError: (error: Error) => {
      console.error('Login failed:', error);
      alert(error.message || 'Login failed. Please check your credentials.');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Only check reCAPTCHA if it's enabled
    const isRecaptchaEnabled = process.env.NEXT_PUBLIC_RECAPTCHA_ENABLED === 'true';

    if (isRecaptchaEnabled) {
      if (!recaptchaLoaded) {
        alert('reCAPTCHA is still loading. Please try again.');
        return;
      }

      const token = await executeRecaptcha('login');
      if (!token) {
        alert('reCAPTCHA verification failed. Please try again.');
        return;
      }

      loginMutation.mutate({
        ...formData,
        recaptcha_token: token,
      });
    } else {
      // reCAPTCHA is disabled, proceed without token
      loginMutation.mutate(formData);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <h1 className="text-2xl font-bold text-gray-900">EnvoYou</h1>
          <span className="ml-2 text-sm text-gray-500 self-end">SEC Dashboard</span>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link
            href="/register"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Need help?</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="https://docs.envoyou.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                View Documentation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}