# Frontend Architecture Design

## Overview
This document outlines the architecture design for implementing missing frontend features in the Envoyou Dashboard SEC project, ensuring scalability, maintainability, and feature parity with the backend API.

## Architecture Principles

### 1. **Modular Architecture**
- Feature-based module organization
- Shared components and utilities
- Clear separation of concerns
- Reusable business logic

### 2. **Performance First**
- Code splitting and lazy loading
- Efficient state management
- Optimized API calls with caching
- Progressive loading strategies

### 3. **Developer Experience**
- TypeScript for type safety
- Consistent coding patterns
- Comprehensive error handling
- Automated testing setup

### 4. **Security & Compliance**
- Role-based access control
- Secure API communication
- Input validation and sanitization
- Audit logging

## Application Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication routes
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   └── verify-email/
│   ├── dashboard/                # Main dashboard routes
│   │   ├── layout.tsx           # Dashboard layout
│   │   ├── page.tsx             # Dashboard home
│   │   ├── reports/             # Reports management
│   │   │   ├── page.tsx         # Reports list
│   │   │   ├── [id]/            # Report detail
│   │   │   └── new/             # Create report
│   │   ├── workflow/            # Workflow management
│   │   │   ├── page.tsx         # Workflows list
│   │   │   ├── [id]/            # Workflow detail
│   │   │   └── approvals/       # Pending approvals
│   │   ├── anomalies/           # Anomaly detection
│   │   │   ├── page.tsx         # Anomalies dashboard
│   │   │   └── trends/          # Trend analysis
│   │   ├── audit/               # Audit system
│   │   │   ├── page.tsx         # Audit logs
│   │   │   └── forensics/       # Enhanced audit
│   │   ├── epa/                 # EPA integration
│   │   │   ├── page.tsx         # EPA dashboard
│   │   │   └── ghgrp/           # GHGRP reports
│   │   ├── emissions/           # Enhanced emissions
│   │   │   ├── page.tsx         # Emissions management
│   │   │   └── validation/     # Validation interface
│   │   ├── entities/            # Company entities
│   │   │   ├── page.tsx         # Entities list
│   │   │   └── [id]/            # Entity detail
│   │   ├── performance/         # Performance monitoring
│   │   ├── security/            # Security monitoring
│   │   ├── backup/              # Backup management
│   │   └── settings/            # System settings
│   ├── api/                     # API routes (if needed)
│   └── globals.css              # Global styles
├── components/                  # Reusable components
│   ├── ui/                      # Base UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── dialog.tsx
│   │   ├── table.tsx
│   │   ├── form.tsx
│   │   └── ...
│   ├── layout/                  # Layout components
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   ├── navigation.tsx
│   │   └── ...
│   ├── features/                # Feature-specific components
│   │   ├── reports/
│   │   │   ├── report-list.tsx
│   │   │   ├── report-card.tsx
│   │   │   ├── report-locks.tsx
│   │   │   ├── report-comments.tsx
│   │   │   └── report-revisions.tsx
│   │   ├── workflow/
│   │   │   ├── workflow-list.tsx
│   │   │   ├── workflow-card.tsx
│   │   │   ├── approval-queue.tsx
│   │   │   └── workflow-status.tsx
│   │   ├── anomalies/
│   │   │   ├── anomaly-dashboard.tsx
│   │   │   ├── anomaly-trends.tsx
│   │   │   └── risk-indicators.tsx
│   │   └── ...
│   └── common/                  # Common components
│       ├── loading.tsx
│       ├── error.tsx
│       ├── empty-state.tsx
│       └── ...
├── hooks/                       # Custom React hooks
│   ├── use-api.ts               # API integration hook
│   ├── use-auth.ts              # Authentication hook
│   ├── use-notifications.ts     # Notification hook
│   ├── use-websocket.ts         # Real-time updates
│   └── ...
├── lib/                         # Utilities and configurations
│   ├── api-client.ts            # API client configuration
│   ├── query-client.ts          # TanStack Query setup
│   ├── auth.ts                  # Auth utilities
│   ├── validation.ts            # Form validation schemas
│   ├── constants.ts             # Application constants
│   └── utils.ts                 # General utilities
├── stores/                      # State management
│   ├── auth-store.ts            # Authentication state
│   ├── ui-store.ts              # UI state
│   ├── notification-store.ts    # Notifications state
│   └── ...
├── types/                       # TypeScript type definitions
│   ├── api.ts                   # API response types
│   ├── auth.ts                  # Authentication types
│   ├── reports.ts               # Reports types
│   ├── workflow.ts              # Workflow types
│   └── ...
└── styles/                      # Additional styles
    └── ...
```

## State Management Strategy

### 1. **Server State Management**
```typescript
// TanStack Query for server state
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: (failureCount, error) => {
        // Custom retry logic
        if (error instanceof UnauthorizedError) return false;
        return failureCount < 3;
      },
    },
  },
});
```

### 2. **Client State Management**
```typescript
// Zustand for client state
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  permissions: string[];
  setUser: (user: User | null) => void;
  logout: () => void;
}
```

### 3. **Form State Management**
```typescript
// React Hook Form with Zod validation
const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;
```

## API Integration Layer

### 1. **API Client Configuration**
```typescript
// lib/api-client.ts
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || '/api';
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      throw new ApiError(response.status, await response.text());
    }

    return response.json();
  }

  // HTTP methods
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}
```

### 2. **API Hooks Pattern**
```typescript
// hooks/use-reports.ts
export const useReports = (filters?: ReportFilters) => {
  return useQuery({
    queryKey: ['reports', filters],
    queryFn: () => apiClient.get<Report[]>('/reports', { params: filters }),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useReport = (id: string) => {
  return useQuery({
    queryKey: ['report', id],
    queryFn: () => apiClient.get<Report>(`/reports/${id}`),
    enabled: !!id,
  });
};

export const useCreateReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReportData) =>
      apiClient.post<Report>('/reports', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};
```

## Component Architecture

### 1. **Feature-Based Components**
```typescript
// components/features/reports/report-list.tsx
interface ReportListProps {
  filters?: ReportFilters;
  onReportSelect?: (report: Report) => void;
}

export const ReportList: React.FC<ReportListProps> = ({
  filters,
  onReportSelect,
}) => {
  const { data: reports, isLoading, error } = useReports(filters);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="space-y-4">
      {reports?.map((report) => (
        <ReportCard
          key={report.id}
          report={report}
          onClick={() => onReportSelect?.(report)}
        />
      ))}
    </div>
  );
};
```

### 2. **Compound Components Pattern**
```typescript
// components/ui/report-locks.tsx
interface ReportLocksProps {
  reportId: string;
  onLockChange?: (locked: boolean) => void;
}

export const ReportLocks: React.FC<ReportLocksProps> = ({
  reportId,
  onLockChange,
}) => {
  const { data: lockStatus } = useReportLockStatus(reportId);
  const lockMutation = useLockReport();
  const unlockMutation = useUnlockReport();

  const handleLock = async (reason: string) => {
    await lockMutation.mutateAsync({ reportId, reason });
    onLockChange?.(true);
  };

  const handleUnlock = async () => {
    await unlockMutation.mutateAsync({ reportId });
    onLockChange?.(false);
  };

  return (
    <div className="flex items-center gap-2">
      {lockStatus?.isLocked ? (
        <LockIndicator
          lockedBy={lockStatus.lockedBy}
          reason={lockStatus.reason}
          onUnlock={handleUnlock}
        />
      ) : (
        <LockButton onLock={handleLock} />
      )}
    </div>
  );
};
```

## Security Implementation

### 1. **Route Protection**
```typescript
// components/layout/protected-route.tsx
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  fallback = <UnauthorizedPage />,
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles.length > 0 && !hasRequiredRoles(user, requiredRoles)) {
    return fallback;
  }

  return <>{children}</>;
};
```

### 2. **Permission-Based Rendering**
```typescript
// components/common/permission-guard.tsx
interface PermissionGuardProps {
  permissions: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permissions,
  children,
  fallback = null,
}) => {
  const { user } = useAuth();

  if (!user || !permissions.every(p => user.permissions.includes(p))) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
```

## Real-Time Features

### 1. **WebSocket Integration**
```typescript
// hooks/use-websocket.ts
export const useWebSocket = (url: string) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const ws = new WebSocket(url);

    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      setMessages(prev => [...prev, message]);
    };

    setSocket(ws);

    return () => ws.close();
  }, [url]);

  const sendMessage = useCallback((message: any) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify(message));
    }
  }, [socket, isConnected]);

  return { isConnected, messages, sendMessage };
};
```

### 2. **Real-Time Notifications**
```typescript
// hooks/use-notifications.ts
export const useNotifications = () => {
  const { sendMessage } = useWebSocket('/ws/notifications');
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const newNotification: Notification = {
      id: generateId(),
      ...notification,
    };

    setNotifications(prev => [newNotification, ...prev]);
    sendMessage({ type: 'notification', data: newNotification });
  }, [sendMessage]);

  return { notifications, addNotification };
};
```

## Performance Optimization

### 1. **Code Splitting Strategy**
```typescript
// app/dashboard/reports/page.tsx
import dynamic from 'next/dynamic';

const ReportList = dynamic(() => import('@/components/features/reports/report-list'), {
  loading: () => <LoadingSpinner />,
});

const ReportFilters = dynamic(() => import('@/components/features/reports/report-filters'), {
  loading: () => <LoadingSpinner />,
});
```

### 2. **Virtual Scrolling for Large Lists**
```typescript
// components/ui/virtual-list.tsx
interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
}

export const VirtualList = <T,>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
}: VirtualListProps<T>) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.floor(scrollTop / itemHeight);
  const visibleItems = items.slice(startIndex, startIndex + visibleCount + 1);

  return (
    <div
      className="overflow-auto"
      style={{ height: containerHeight }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: items.length * itemHeight }}>
        {visibleItems.map((item, index) => (
          <div key={startIndex + index} style={{ height: itemHeight }}>
            {renderItem(item, startIndex + index)}
          </div>
        ))}
      </div>
    </div>
  );
};
```

## Error Handling Strategy

### 1. **Error Boundary**
```typescript
// components/common/error-boundary.tsx
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service
    logger.error('Component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error!} />;
    }

    return this.props.children;
  }
}
```

### 2. **API Error Handling**
```typescript
// lib/api-client.ts
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Global error handler
const handleApiError = (error: ApiError) => {
  switch (error.status) {
    case 401:
      // Redirect to login
      redirectToLogin();
      break;
    case 403:
      // Show permission error
      showNotification('Access denied', 'error');
      break;
    case 404:
      // Show not found error
      showNotification('Resource not found', 'error');
      break;
    case 500:
      // Show server error
      showNotification('Server error occurred', 'error');
      break;
    default:
      showNotification(error.message, 'error');
  }
};
```

## Testing Strategy

### 1. **Unit Tests**
```typescript
// components/features/reports/__tests__/report-list.test.tsx
describe('ReportList', () => {
  it('renders reports correctly', () => {
    const mockReports = [/* mock data */];

    render(<ReportList reports={mockReports} />);

    expect(screen.getByText('Report 1')).toBeInTheDocument();
  });

  it('handles loading state', () => {
    render(<ReportList loading={true} />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});
```

### 2. **Integration Tests**
```typescript
// __tests__/pages/reports.test.tsx
describe('Reports Page', () => {
  it('loads and displays reports', async () => {
    render(<ReportsPage />);

    await waitFor(() => {
      expect(screen.getByText('Reports')).toBeInTheDocument();
    });
  });
});
```

## Development Workflow

### 1. **Component Development Process**
1. Create TypeScript interfaces
2. Implement base functionality
3. Add error handling
4. Implement loading states
5. Add accessibility features
6. Write unit tests
7. Add integration tests

### 2. **Feature Implementation Checklist**
- [ ] API integration completed
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Accessibility features included
- [ ] Unit tests written
- [ ] Integration tests added
- [ ] Documentation updated
- [ ] Code review completed

## Deployment Strategy

### 1. **Environment Configuration**
```typescript
// lib/config.ts
export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
  websocketUrl: process.env.NEXT_PUBLIC_WS_URL,
  environment: process.env.NODE_ENV,
  features: {
    enableRealTime: process.env.NEXT_PUBLIC_ENABLE_REALTIME === 'true',
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  },
};
```

### 2. **Performance Monitoring**
```typescript
// Integrate with performance monitoring service
if (config.environment === 'production') {
  // Initialize performance monitoring
  initPerformanceMonitoring();
}
```

This architecture provides a solid foundation for implementing all missing frontend features while maintaining scalability, performance, and code quality.