'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '../../stores/auth-store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  Calculator,
  Building2,
  FileText,
  History,
  Search,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';


const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Emissions Calculator', href: '/dashboard/emissions', icon: Calculator },
  { name: 'Company Entities', href: '/dashboard/entities', icon: Building2 },
  { name: 'Reports', href: '/dashboard/reports', icon: FileText },
  { name: 'Calculation History', href: '/dashboard/calculations', icon: History },
  { name: 'Audit Trail', href: '/dashboard/audit', icon: Search },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

interface DashboardSidebarProps {
  collapsed: boolean;
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}
export function DashboardSidebar({ collapsed, setCollapsed }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* 🟦 Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-white dark:bg-gray-800 shadow-md border-gray-200 dark:border-gray-700"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* 🔲 Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* 🧭 Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-lg transform transition-all duration-300 ease-in-out flex flex-col',
          collapsed ? 'w-20' : 'w-72',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header + Collapse Button */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 overflow-hidden">
            <h1 className={cn('text-xl font-bold text-gray-900 dark:text-white transition-all', collapsed && 'opacity-0 w-0')}>
              EnvoYou
            </h1>
            {!collapsed && (
              <span className="text-xs text-gray-500 dark:text-gray-400">SEC Dashboard</span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>

        {/* Navigation */}
        {navigation.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;
        return (
            <li key={item.name}>
            <TooltipProvider>
                <Tooltip>
                <TooltipTrigger asChild>
                    <Link
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={cn(
                        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition-colors',
                        active
                        ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    )}
                    >
                    <Icon className="h-5 w-5 shrink-0" />
                    {!collapsed && <span>{item.name}</span>}
                    </Link>
                </TooltipTrigger>

                {collapsed && (
                    <TooltipContent side="right" className="text-sm">
                    {item.name}
                    </TooltipContent>
                )}
                </Tooltip>
            </TooltipProvider>
            </li>
        );
        })}


        {/* Footer / User Info */}
        <div className="border-t border-gray-200 dark:border-gray-800 px-3 py-4">
          <div className="flex items-center justify-between gap-2">
            {!collapsed && (
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
                  {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user?.full_name || 'User'}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.email}
                  </span>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => logout()}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200 shrink-0"
              title="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
