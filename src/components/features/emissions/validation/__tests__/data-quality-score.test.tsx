/**
 * Unit Tests for DataQualityScore Component
 * Tests score display, visual indicators, and breakdown functionality
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { DataQualityScore } from '../data-quality-score';

// Mock UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={className} data-testid="card">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div data-testid="card-content">{children}</div>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <div data-testid="card-description">{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <div data-testid="card-title">{children}</div>,
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className, ...props }: { children: React.ReactNode; className?: string; [key: string]: unknown }) => <span className={className} {...props} data-testid="badge">{children}</span>,
}));

jest.mock('@/components/ui/progress', () => ({
  Progress: ({ value, className, ...props }: { value: number; className?: string; [key: string]: unknown }) => (
    <div className={className} {...props} data-testid="progress" data-value={value}>
      <div style={{ width: `${value}%` }} />
    </div>
  ),
}));

describe('DataQualityScore Component', () => {
  const mockBreakdown = {
    completeness: 90,
    accuracy: 85,
    consistency: 95,
    richness: 80
  };

  describe('✅ Score Display', () => {
    it('should display the quality score correctly', () => {
      render(<DataQualityScore score={87} />);

      expect(screen.getByTestId('quality-score-display')).toHaveTextContent('87');
      expect(screen.getByText('out of 100')).toBeInTheDocument();
    });

    it('should round decimal scores to nearest integer', () => {
      render(<DataQualityScore score={87.6} />);

      expect(screen.getByTestId('quality-score-display')).toHaveTextContent('88');
    });

    it('should display correct quality labels for different score ranges', () => {
      const testCases = [
        { score: 95, label: 'Excellent' },
        { score: 85, label: 'Good' },
        { score: 75, label: 'Fair' },
        { score: 65, label: 'Poor' },
        { score: 45, label: 'Critical' }
      ];

      testCases.forEach(({ score, label }) => {
        const { rerender } = render(<DataQualityScore score={score} />);
        
        expect(screen.getByText(label)).toBeInTheDocument();
        
        rerender(<div />); // Clean up for next test
      });
    });
  });

  describe('🎨 Visual Indicators', () => {
    it('should use green color for excellent scores (90+)', () => {
      render(<DataQualityScore score={95} />);

      const progressBar = screen.getByTestId('quality-score-progress');
      expect(progressBar).toHaveClass('bg-green-600');
      expect(progressBar).toHaveStyle({ width: '95%' });
    });

    it('should use blue color for good scores (80-89)', () => {
      render(<DataQualityScore score={85} />);

      const progressBar = screen.getByTestId('quality-score-progress');
      expect(progressBar).toHaveClass('bg-blue-600');
    });

    it('should use yellow color for fair scores (70-79)', () => {
      render(<DataQualityScore score={75} />);

      const progressBar = screen.getByTestId('quality-score-progress');
      expect(progressBar).toHaveClass('bg-yellow-600');
    });

    it('should use orange color for poor scores (60-69)', () => {
      render(<DataQualityScore score={65} />);

      const progressBar = screen.getByTestId('quality-score-progress');
      expect(progressBar).toHaveClass('bg-orange-600');
    });

    it('should use red color for critical scores (<60)', () => {
      render(<DataQualityScore score={45} />);

      const progressBar = screen.getByTestId('quality-score-progress');
      expect(progressBar).toHaveClass('bg-red-600');
    });

    it('should cap progress bar width at 100%', () => {
      render(<DataQualityScore score={105} />);

      const progressBar = screen.getByTestId('quality-score-progress');
      expect(progressBar).toHaveStyle({ width: '100%' });
    });
  });

  describe('📈 Trend Indicators', () => {
    it('should show upward trend for significant improvement', () => {
      render(<DataQualityScore score={85} previousScore={80} />);

      expect(screen.getByText('+5.0 from last validation')).toBeInTheDocument();
    });

    it('should show downward trend for significant decline', () => {
      render(<DataQualityScore score={75} previousScore={82} />);

      expect(screen.getByText('-7.0 from last validation')).toBeInTheDocument();
    });

    it('should show no significant change for small differences', () => {
      render(<DataQualityScore score={85} previousScore={84} />);

      expect(screen.getByText('No significant change')).toBeInTheDocument();
    });

    it('should not show trend when no previous score provided', () => {
      render(<DataQualityScore score={85} />);

      expect(screen.queryByText(/from last validation/)).not.toBeInTheDocument();
      expect(screen.queryByText('No significant change')).not.toBeInTheDocument();
    });
  });

  describe('📊 Quality Breakdown', () => {
    it('should display breakdown when provided and showDetails is true', () => {
      render(<DataQualityScore score={87} breakdown={mockBreakdown} showDetails={true} />);

      expect(screen.getByText('Quality Breakdown')).toBeInTheDocument();
      expect(screen.getByText('Completeness')).toBeInTheDocument();
      expect(screen.getByText('Accuracy')).toBeInTheDocument();
      expect(screen.getByText('Consistency')).toBeInTheDocument();
      expect(screen.getByText('Richness')).toBeInTheDocument();
    });

    it('should display correct breakdown percentages', () => {
      render(<DataQualityScore score={87} breakdown={mockBreakdown} showDetails={true} />);

      expect(screen.getByText('90%')).toBeInTheDocument(); // Completeness
      expect(screen.getByText('85%')).toBeInTheDocument(); // Accuracy
      expect(screen.getByText('95%')).toBeInTheDocument(); // Consistency
      expect(screen.getByText('80%')).toBeInTheDocument(); // Richness
    });

    it('should show progress bars for each breakdown metric', () => {
      render(<DataQualityScore score={87} breakdown={mockBreakdown} showDetails={true} />);

      const progressBars = screen.getAllByTestId('progress');
      
      // Should have progress bars for completeness, accuracy, consistency, richness
      expect(progressBars.length).toBeGreaterThanOrEqual(4);
      
      // Check that progress bars exist with correct values
      expect(progressBars[0]).toHaveAttribute('data-value', '90'); // Completeness
      expect(progressBars[1]).toHaveAttribute('data-value', '85'); // Accuracy
      expect(progressBars[2]).toHaveAttribute('data-value', '95'); // Consistency
      expect(progressBars[3]).toHaveAttribute('data-value', '80'); // Richness
    });

    it('should hide breakdown when showDetails is false', () => {
      render(<DataQualityScore score={87} breakdown={mockBreakdown} showDetails={false} />);

      expect(screen.queryByText('Quality Breakdown')).not.toBeInTheDocument();
      expect(screen.queryByText('Completeness')).not.toBeInTheDocument();
    });

    it('should hide breakdown when no breakdown data provided', () => {
      render(<DataQualityScore score={87} showDetails={true} />);

      expect(screen.queryByText('Quality Breakdown')).not.toBeInTheDocument();
    });
  });

  describe('📋 Quality Guidelines', () => {
    it('should display quality guidelines when showDetails is true', () => {
      render(<DataQualityScore score={87} showDetails={true} />);

      expect(screen.getByText('Quality Guidelines')).toBeInTheDocument();
      expect(screen.getByText('Excellent (90-100)')).toBeInTheDocument();
      expect(screen.getByText('Good (80-89)')).toBeInTheDocument();
      expect(screen.getByText('Fair (70-79)')).toBeInTheDocument();
      expect(screen.getByText('Poor/Critical (<70)')).toBeInTheDocument();
    });

    it('should display guideline descriptions', () => {
      render(<DataQualityScore score={87} showDetails={true} />);

      expect(screen.getByText('Ready for regulatory submission')).toBeInTheDocument();
      expect(screen.getByText('Minor improvements recommended')).toBeInTheDocument();
      expect(screen.getByText('Some data quality issues')).toBeInTheDocument();
      expect(screen.getByText('Significant improvements needed')).toBeInTheDocument();
    });

    it('should hide guidelines when showDetails is false', () => {
      render(<DataQualityScore score={87} showDetails={false} />);

      expect(screen.queryByText('Quality Guidelines')).not.toBeInTheDocument();
    });
  });

  describe('🎯 Component Props', () => {
    it('should apply custom className when provided', () => {
      render(<DataQualityScore score={87} className="custom-class" />);

      const card = screen.getByTestId('card');
      expect(card).toHaveClass('custom-class');
    });

    it('should have default showDetails as true', () => {
      render(<DataQualityScore score={87} />);

      expect(screen.getByText('Quality Guidelines')).toBeInTheDocument();
    });
  });

  describe('🔄 Edge Cases', () => {
    it('should handle score of 0', () => {
      render(<DataQualityScore score={0} />);

      expect(screen.getByTestId('quality-score-display')).toHaveTextContent('0');
      expect(screen.getByText('Critical')).toBeInTheDocument();
    });

    it('should handle score of 100', () => {
      render(<DataQualityScore score={100} />);

      expect(screen.getByTestId('quality-score-display')).toHaveTextContent('100');
      expect(screen.getByText('Excellent')).toBeInTheDocument();
    });

    it('should handle negative scores gracefully', () => {
      render(<DataQualityScore score={-5} />);

      expect(screen.getByTestId('quality-score-display')).toHaveTextContent('-5');
      expect(screen.getByText('Critical')).toBeInTheDocument();
    });

    it('should handle very high scores', () => {
      render(<DataQualityScore score={150} />);

      expect(screen.getByTestId('quality-score-display')).toHaveTextContent('150');
      // Progress bar should still cap at 100%
      const progressBar = screen.getByTestId('quality-score-progress');
      expect(progressBar).toHaveStyle({ width: '100%' });
    });
  });

  describe('📱 Responsive Design', () => {
    it('should render card structure correctly', () => {
      render(<DataQualityScore score={87} />);

      expect(screen.getByTestId('card')).toBeInTheDocument();
      expect(screen.getByTestId('card-header')).toBeInTheDocument();
      expect(screen.getByTestId('card-content')).toBeInTheDocument();
      expect(screen.getByTestId('card-title')).toHaveTextContent('Data Quality Score');
      expect(screen.getByTestId('card-description')).toHaveTextContent('Overall assessment of your emissions data quality');
    });
  });
});