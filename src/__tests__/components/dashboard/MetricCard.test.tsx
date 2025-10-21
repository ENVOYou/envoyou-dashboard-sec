import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { MetricCard } from '@/components/dashboard/MetricCard';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  TrendingUp: ({ className }: { className?: string }) => <div data-testid="trending-up" className={className}>📈</div>,
  TrendingDown: ({ className }: { className?: string }) => <div data-testid="trending-down" className={className}>📉</div>,
  Minus: ({ className }: { className?: string }) => <div data-testid="minus" className={className}>➖</div>,
}));

describe('MetricCard Component', () => {
  test('renders basic metric card correctly', () => {
    render(
      <MetricCard
        title="Total Revenue"
        value="$1,234,567"
      />
    );

    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('$1,234,567')).toBeInTheDocument();
  });

  test('renders with custom icon', () => {
    const CustomIcon = () => <div data-testid="dollar-icon">💰</div>;

    render(
      <MetricCard
        title="Total Revenue"
        value="$1,234,567"
        icon={<CustomIcon />}
      />
    );

    expect(screen.getByTestId('dollar-icon')).toBeInTheDocument();
  });

  test('renders positive change correctly', () => {
    render(
      <MetricCard
        title="Total Revenue"
        value="$1,234,567"
        change="+12.5%"
        changeType="positive"
      />
    );

    expect(screen.getByText('+12.5%')).toBeInTheDocument();
    expect(screen.getByTestId('trending-up')).toBeInTheDocument();
    // Check that it has the change indicator styling
    expect(screen.getByText('+12.5%')).toHaveClass('ml-1');
  });

  test('renders negative change correctly', () => {
    render(
      <MetricCard
        title="Total Revenue"
        value="$1,234,567"
        change="-5.2%"
        changeType="negative"
      />
    );

    expect(screen.getByText('-5.2%')).toBeInTheDocument();
    expect(screen.getByTestId('trending-down')).toBeInTheDocument();
    expect(screen.getByText('-5.2%')).toHaveClass('ml-1');
  });

  test('renders neutral change correctly', () => {
    render(
      <MetricCard
        title="Total Revenue"
        value="$1,234,567"
        change="0.0%"
        changeType="neutral"
      />
    );

    expect(screen.getByText('0.0%')).toBeInTheDocument();
    expect(screen.getByTestId('minus')).toBeInTheDocument();
    expect(screen.getByText('0.0%')).toHaveClass('ml-1');
  });

  test('renders loading state correctly', () => {
    render(
      <MetricCard
        title="Total Revenue"
        value="$1,234,567"
        loading={true}
      />
    );

    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    // Should show skeleton loading animation
    expect(screen.getByText('Total Revenue')).toHaveClass('text-gray-600');

    // Should not show the actual value when loading
    expect(screen.queryByText('$1,234,567')).not.toBeInTheDocument();
  });

  test('applies hover effect correctly', () => {
    render(
      <MetricCard
        title="Total Revenue"
        value="$1,234,567"
      />
    );

    const card = screen.getByText('Total Revenue').closest('.hover\\:shadow-md');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('transition-shadow');
  });

  test('handles missing change gracefully', () => {
    render(
      <MetricCard
        title="Total Revenue"
        value="$1,234,567"
      />
    );

    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('$1,234,567')).toBeInTheDocument();

    // Should not show any change indicator
    expect(screen.queryByTestId('trending-up')).not.toBeInTheDocument();
    expect(screen.queryByTestId('trending-down')).not.toBeInTheDocument();
    expect(screen.queryByTestId('minus')).not.toBeInTheDocument();
  });

  test('handles all change types correctly', () => {
    const { rerender } = render(
      <MetricCard
        title="Test Metric"
        value="100"
        change="+10"
        changeType="positive"
      />
    );

    expect(screen.getByTestId('trending-up')).toBeInTheDocument();

    rerender(
      <MetricCard
        title="Test Metric"
        value="100"
        change="-10"
        changeType="negative"
      />
    );

    expect(screen.getByTestId('trending-down')).toBeInTheDocument();

    rerender(
      <MetricCard
        title="Test Metric"
        value="100"
        change="0"
        changeType="neutral"
      />
    );

    expect(screen.getByTestId('minus')).toBeInTheDocument();
  });

  test('applies correct styling classes for change indicators', () => {
    render(
      <MetricCard
        title="Test Metric"
        value="100"
        change="+10%"
        changeType="positive"
      />
    );

    const changeElement = screen.getByText('+10%');
    // Check for the basic structure - the element should exist and have some styling
    expect(changeElement).toBeInTheDocument();
    expect(changeElement).toHaveClass('ml-1');
  });

  test('renders value with correct styling', () => {
    render(
      <MetricCard
        title="Total Revenue"
        value="$1,234,567"
      />
    );

    const valueElement = screen.getByText('$1,234,567');
    expect(valueElement).toHaveClass('text-2xl', 'font-bold', 'text-gray-900');
  });

  test('renders title with correct styling', () => {
    render(
      <MetricCard
        title="Total Revenue"
        value="$1,234,567"
      />
    );

    const titleElement = screen.getByText('Total Revenue');
    expect(titleElement).toHaveClass('text-sm', 'font-medium', 'text-gray-600');
  });
});