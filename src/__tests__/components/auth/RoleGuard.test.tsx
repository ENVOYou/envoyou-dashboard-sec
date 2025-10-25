import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { RoleGuard } from '@/components/auth/RoleGuard';

// Create a mock function that can be controlled per test
const mockUseAuthStore = jest.fn();

jest.mock('@/stores/auth-store', () => ({
  useAuthStore: () => mockUseAuthStore()
}));

test('should return null when user is not authenticated', () => {
  mockUseAuthStore.mockReturnValue({
    user: null,
    isLoading: false,
    isAuthenticated: false,
    isInitialized: true
  });

  const { container } = render(
    <RoleGuard allowedRoles={['admin']}>
      <div>Konten Rahasia</div>
    </RoleGuard>
  );

  expect(container.firstChild).toBeNull();
});

test('should render children when user has required role', () => {
  mockUseAuthStore.mockReturnValue({
    user: { id: '1', role: 'admin' },
    isLoading: false,
    isAuthenticated: true,
    isInitialized: true
  });

  render(
    <RoleGuard allowedRoles={['admin']}>
      <div>Konten Rahasia</div>
    </RoleGuard>
  );

  expect(screen.getByText('Konten Rahasia')).toBeInTheDocument();
});

test('should not render children when user lacks required role', () => {
  mockUseAuthStore.mockReturnValue({
    user: { id: '1', role: 'user' },
    isLoading: false,
    isAuthenticated: true,
    isInitialized: true
  });

  render(
    <RoleGuard allowedRoles={['admin']}>
      <div>Konten Rahasia</div>
    </RoleGuard>
  );

  expect(screen.queryByText('Konten Rahasia')).not.toBeInTheDocument();
  // Check for the alert component by role
  expect(screen.getByRole('alert')).toBeInTheDocument();
  // Check that the alert contains the role text
  const roleElements = screen.getAllByText((content, element) => {
    return element?.textContent?.includes('admin') || false;
  });
  expect(roleElements.length).toBeGreaterThan(0);
});

test('should render custom fallback when provided', () => {
  mockUseAuthStore.mockReturnValue({
    user: { id: '1', role: 'user' },
    isLoading: false,
    isAuthenticated: true,
    isInitialized: true
  });

  render(
    <RoleGuard allowedRoles={['admin']} fallback={<div>Custom Access Denied</div>}>
      <div>Konten Rahasia</div>
    </RoleGuard>
  );

  expect(screen.getByText('Custom Access Denied')).toBeInTheDocument();
  expect(screen.queryByText('Konten Rahasia')).not.toBeInTheDocument();
});

test('should handle multiple allowed roles correctly', () => {
  mockUseAuthStore.mockReturnValue({
    user: { id: '1', role: 'auditor' },
    isLoading: false,
    isAuthenticated: true,
    isInitialized: true
  });

  render(
    <RoleGuard allowedRoles={['admin', 'auditor']}>
      <div>Konten Auditor</div>
    </RoleGuard>
  );

  expect(screen.getByText('Konten Auditor')).toBeInTheDocument();
});