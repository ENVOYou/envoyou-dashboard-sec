'use client';

import { useAuthStore } from '../../stores/auth-store';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertTriangle } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallback?: React.ReactNode;
}

export function RoleGuard({
  children,
  allowedRoles,
  fallback,
}: RoleGuardProps) {
  const { user } = useAuthStore();

  if (!user) {
    return null; // AuthGuard should handle this
  }

  const userRole = user.role || '';
  const hasAccess = allowedRoles.includes(userRole);

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          You don&rsquo;t have permission to access this resource.
          Required roles: {allowedRoles.join(', ')}
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
}

// Convenience components for common role checks
export function AdminOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['admin']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

export function AuditorOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['auditor']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

export function CFOOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['cfo']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}

export function AdminOrAuditor({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={['admin', 'auditor']} fallback={fallback}>
      {children}
    </RoleGuard>
  );
}