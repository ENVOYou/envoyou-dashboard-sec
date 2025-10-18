import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

// Mock the auth store
const mockUseAuthStore = jest.fn();
jest.mock('../../../stores/auth-store', () => ({
  useAuthStore: () => mockUseAuthStore(),
}));

// Mock the ThemeToggle component
jest.mock('@/components/ui/theme-toggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">Theme Toggle</div>,
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Bell: ({ className }: { className?: string }) => <div data-testid="bell-icon" className={className}>🔔</div>,
  User: ({ className }: { className?: string }) => <div data-testid="user-icon" className={className}>👤</div>,
  Settings: ({ className }: { className?: string }) => <div data-testid="settings-icon" className={className}>⚙️</div>,
}));

describe('DashboardHeader Component', () => {
  beforeEach(() => {
    mockUseAuthStore.mockReturnValue({
      user: {
        id: '1',
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'admin',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z'
      },
      logout: jest.fn(),
    });
  });

  test('renders dashboard title correctly', () => {
    render(<DashboardHeader />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toHaveClass('text-lg', 'font-semibold');
  });

  test('renders theme toggle component', () => {
    render(<DashboardHeader />);

    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
  });

  test('renders notifications button with correct accessibility', () => {
    render(<DashboardHeader />);

    // Check for the screen reader text instead of aria-label
    expect(screen.getByText('View notifications')).toHaveClass('sr-only');
    expect(screen.getByTestId('bell-icon')).toBeInTheDocument();
  });

  test('renders user profile information correctly', () => {
    render(<DashboardHeader />);

    // Should show user avatar with first letter
    expect(screen.getByText('T')).toBeInTheDocument();

    // Should show user name (only on larger screens due to responsive design)
    const userNameElements = screen.getAllByText('Test User');
    expect(userNameElements.length).toBeGreaterThan(0);

    // Should show user role
    const roleElements = screen.getAllByText('admin');
    expect(roleElements.length).toBeGreaterThan(0);
  });

  test('renders profile section with user avatar', () => {
    render(<DashboardHeader />);

    // Check for user avatar (the circular div with first letter)
    const avatar = screen.getByText('T').closest('.rounded-full');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveClass('bg-blue-600', 'text-white');
  });

  test('applies correct styling classes', () => {
    render(<DashboardHeader />);

    const header = screen.getByText('Dashboard').closest('.sticky');
    expect(header).toBeInTheDocument();
    expect(header).toHaveClass(
      'top-0',
      'z-40',
      'flex',
      'h-16',
      'shrink-0',
      'items-center',
      'gap-x-4',
      'border-b',
      'bg-white',
      'px-4',
      'shadow-sm'
    );
  });

  test('handles user without full_name gracefully', () => {
    mockUseAuthStore.mockReturnValue({
      user: {
        id: '1',
        email: 'test@example.com',
        full_name: null,
        role: 'admin',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z'
      },
      logout: jest.fn(),
    });

    render(<DashboardHeader />);

    // Should show 'U' as fallback for missing name
    expect(screen.getByText('U')).toBeInTheDocument();
  });

  test('renders responsive design elements', () => {
    render(<DashboardHeader />);

    // Check for responsive classes on the main header container
    const header = screen.getByText('Dashboard').closest('.sticky');
    expect(header).toHaveClass('sm:gap-x-6', 'lg:px-8');
  });

  test('renders dark mode styling classes', () => {
    render(<DashboardHeader />);

    const header = screen.getByText('Dashboard').closest('.sticky');
    expect(header).toHaveClass(
      'dark:bg-gray-900',
      'dark:border-gray-800'
    );
  });

  test('renders all main sections correctly', () => {
    render(<DashboardHeader />);

    // Main sections that should be present
    expect(screen.getByText('Dashboard')).toBeInTheDocument(); // Title section
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument(); // Theme section
    expect(screen.getByText('View notifications')).toHaveClass('sr-only'); // Notifications section
    expect(screen.getByText('T')).toBeInTheDocument(); // Profile section
  });
});