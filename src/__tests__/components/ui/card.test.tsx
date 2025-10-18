import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

describe('Card Components', () => {
  describe('Card', () => {
    test('renders with default styling', () => {
      render(<Card data-testid="card">Card Content</Card>);

      const card = screen.getByTestId('card');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass(
        'rounded-lg',
        'border',
        'bg-card',
        'text-card-foreground',
        'shadow-sm'
      );
    });

    test('forwards props correctly', () => {
      render(
        <Card data-testid="card" id="custom-card" role="article">
          Card Content
        </Card>
      );

      const card = screen.getByTestId('card');
      expect(card).toHaveAttribute('id', 'custom-card');
      expect(card).toHaveAttribute('role', 'article');
    });

    test('merges custom className with default classes', () => {
      render(
        <Card data-testid="card" className="custom-class">
          Card Content
        </Card>
      );

      const card = screen.getByTestId('card');
      expect(card).toHaveClass('custom-class');
      expect(card).toHaveClass('rounded-lg'); // Should still have default classes
    });

    test('renders children correctly', () => {
      render(
        <Card>
          <p>Child content</p>
          <span>Another child</span>
        </Card>
      );

      expect(screen.getByText('Child content')).toBeInTheDocument();
      expect(screen.getByText('Another child')).toBeInTheDocument();
    });
  });

  describe('CardHeader', () => {
    test('renders with default styling', () => {
      render(
        <CardHeader data-testid="card-header">
          Header Content
        </CardHeader>
      );

      const header = screen.getByTestId('card-header');
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6');
    });

    test('forwards props correctly', () => {
      render(
        <CardHeader data-testid="card-header" role="banner">
          Header Content
        </CardHeader>
      );

      const header = screen.getByTestId('card-header');
      expect(header).toHaveAttribute('role', 'banner');
    });
  });

  describe('CardTitle', () => {
    test('renders with default styling', () => {
      render(
        <CardTitle data-testid="card-title">
          Card Title
        </CardTitle>
      );

      const title = screen.getByTestId('card-title');
      expect(title).toBeInTheDocument();
      expect(title.tagName).toBe('H3');
      expect(title).toHaveClass(
        'text-2xl',
        'font-semibold',
        'leading-none',
        'tracking-tight'
      );
    });

    test('forwards props correctly', () => {
      render(
        <CardTitle data-testid="card-title" id="main-title">
          Card Title
        </CardTitle>
      );

      const title = screen.getByTestId('card-title');
      expect(title).toHaveAttribute('id', 'main-title');
    });
  });

  describe('CardDescription', () => {
    test('renders with default styling', () => {
      render(
        <CardDescription data-testid="card-description">
          Card description text
        </CardDescription>
      );

      const description = screen.getByTestId('card-description');
      expect(description).toBeInTheDocument();
      expect(description.tagName).toBe('P');
      expect(description).toHaveClass('text-sm', 'text-muted-foreground');
    });

    test('forwards props correctly', () => {
      render(
        <CardDescription data-testid="card-description" role="note">
          Card description text
        </CardDescription>
      );

      const description = screen.getByTestId('card-description');
      expect(description).toHaveAttribute('role', 'note');
    });
  });

  describe('CardContent', () => {
    test('renders with default styling', () => {
      render(
        <CardContent data-testid="card-content">
          Main content
        </CardContent>
      );

      const content = screen.getByTestId('card-content');
      expect(content).toBeInTheDocument();
      expect(content).toHaveClass('p-6', 'pt-0');
    });

    test('forwards props correctly', () => {
      render(
        <CardContent data-testid="card-content" role="main">
          Main content
        </CardContent>
      );

      const content = screen.getByTestId('card-content');
      expect(content).toHaveAttribute('role', 'main');
    });
  });

  describe('CardFooter', () => {
    test('renders with default styling', () => {
      render(
        <CardFooter data-testid="card-footer">
          Footer content
        </CardFooter>
      );

      const footer = screen.getByTestId('card-footer');
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0');
    });

    test('forwards props correctly', () => {
      render(
        <CardFooter data-testid="card-footer" role="contentinfo">
          Footer content
        </CardFooter>
      );

      const footer = screen.getByTestId('card-footer');
      expect(footer).toHaveAttribute('role', 'contentinfo');
    });
  });

  describe('Card Composition', () => {
    test('renders complete card with all sections', () => {
      render(
        <Card data-testid="complete-card">
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Main content goes here</p>
          </CardContent>
          <CardFooter>
            <button>Action Button</button>
          </CardFooter>
        </Card>
      );

      expect(screen.getByText('Card Title')).toBeInTheDocument();
      expect(screen.getByText('Card description')).toBeInTheDocument();
      expect(screen.getByText('Main content goes here')).toBeInTheDocument();
      expect(screen.getByText('Action Button')).toBeInTheDocument();
    });

    test('applies custom className to composed card', () => {
      render(
        <Card data-testid="composed-card" className="custom-card-class">
          <CardHeader>
            <CardTitle>Composed Card</CardTitle>
          </CardHeader>
        </Card>
      );

      const card = screen.getByTestId('composed-card');
      expect(card).toHaveClass('custom-card-class');
      expect(card).toHaveClass('rounded-lg'); // Should still have default classes
    });
  });
});