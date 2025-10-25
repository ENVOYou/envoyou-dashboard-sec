'use client';

import { useAuthStore } from '../../stores/auth-store';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Bell, User, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu';

export function DashboardHeader() {
  const { user, logout } = useAuthStore();

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 dark:bg-gray-900 dark:border-gray-800">
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* Mobile menu button is now in sidebar */}
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex items-center">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Dashboard</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-x-4 lg:gap-x-6">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200">
          <Bell className="h-5 w-5" />
          <span className="sr-only">View notifications</span>
        </Button>

        {/* Profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-x-2 px-3 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold">
                {user?.full_name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="hidden lg:flex lg:flex-col lg:items-start">
                <span className="text-sm font-medium text-gray-900 dark:text-white">{user?.full_name || 'User'}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{user?.role || 'User'}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
            <DropdownMenuLabel className="px-3 py-2 text-gray-900 dark:text-white">
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user?.full_name || 'User'}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="h-px bg-gray-200 dark:bg-gray-700" />
            <DropdownMenuItem className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-gray-900 dark:text-white">
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-gray-900 dark:text-white">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="h-px bg-gray-200 dark:bg-gray-700" />
            <DropdownMenuItem asChild>
              <button
                className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-red-600 dark:text-red-400"
                onClick={() => {
                  console.log('DashboardHeader - Logout clicked');
                  logout();
                }}
                aria-label="Logout"
              >
                Sign out
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}