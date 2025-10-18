'use client';

import { usePathname } from 'next/navigation';
import { RoleGuard } from '../auth/RoleGuard';
import { Alert, AlertDescription } from '../ui/alert';
import { Lock } from 'lucide-react';

// Define route permissions
const routePermissions: Record<string, {
  roles: string[];
  description?: string;
}> = {
  '/dashboard/reports': {
    roles: ['admin', 'auditor', 'cfo'],
    description: 'View and generate reports'
  },
  '/dashboard/audit': {
    roles: ['admin', 'auditor'],
    description: 'Access audit trail'
  },
  '/dashboard/settings': {
    roles: ['admin'],
    description: 'System configuration'
  },
  '/dashboard/entities': {
    roles: ['admin', 'auditor'],
    description: 'Manage company entities'
  },
};

interface RouteGuardProps {
  children: React.ReactNode;
}

export function RouteGuard({ children }: RouteGuardProps) {
  const pathname = usePathname();

  // Find matching route permission
  const routePermission = Object.entries(routePermissions).find(([route]) =>
    pathname.startsWith(route)
  )?.[1];

  // If no specific permission required, allow access
  if (!routePermission) {
    return <>{children}</>;
  }

  // Check if user has required permissions
  return (
    <RoleGuard
      allowedRoles={routePermission.roles}
      fallback={
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="max-w-md w-full">
            <Alert variant="destructive">
              <Lock className="h-4 w-4" />
              <AlertDescription className="space-y-2">
                <div className="font-medium">Access Denied</div>
                <div>
                  You need one of these roles to access this page:
                </div>
                <div className="font-mono text-sm">
                  {routePermission.roles.join(', ')}
                </div>
                {routePermission.description && (
                  <div className="text-sm opacity-75">
                    Required for: {routePermission.description}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          </div>
        </div>
      }
    >
      {children}
    </RoleGuard>
  );
}