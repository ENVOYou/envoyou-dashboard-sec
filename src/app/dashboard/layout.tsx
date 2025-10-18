'use client';

import { AuthGuard } from '../../components/auth/AuthGuard';
import { RouteGuard } from '../../components/dashboard/RouteGuard';
import { DashboardSidebar } from '../../components/dashboard/DashboardSidebar';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <RouteGuard>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <DashboardSidebar />
          <div className="lg:pl-72">
            <DashboardHeader />
            <main className="py-8">
              <div className="px-4 sm:px-6 lg:px-8">
                {children}
              </div>
            </main>
          </div>
        </div>
      </RouteGuard>
    </AuthGuard>
  );
}