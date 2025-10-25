/**
 * Unit Tests for ValidationResults Component
 * Tests UI rendering, data display, and user interactions
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { ValidationResults } from '../validation-results';
import type { ValidationResult } from '@/types/emissions';

// Mock UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={className} data-testid="card">{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div data-testid="card-content">{children}</div>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <div data-testid="card-description">{children}</div>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <div data-testid="card-title">{children}</div>,
}));

jest.mock('@/components/ui/alert', () => ({
  Alert: ({ children, className }: { children: React.ReactNode; className?: string }) => <div className={className} data-testid="alert">{children}</div>,
  AlertDescription: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => <div {...props} data-testid="alert-description">{children}</div>,
}));

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children, className, ...props }: { children: React.ReactNode; className?: string; [key: string]: unknown }) => <span className={className} {...props} data-testid="badge">{children}</span>,
}));

describe('ValidationResults Component', () => {
  const mockValidResult: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
    qualityScore: 95,
    recommendations: ['Excellent data quality! Continue following current practices'],
    validatedAt: new Date('2024-01-15T10:00:00Z')
  };

  const mockInvalidResult: ValidationResult = {
    isValid: false,
    errors: [
      {
        code: 'REQUIRED_ACTIVITY_VALUE',
        message: 'Activity data value is required',
        field: 'activityData.value',
        severity: 'critical',
        suggestion: 'Please provide a value for activityData.value'
      },
      {
        code: 'POSITIVE_ACTIVITY_VALUE',
        message: 'Activity data value must be positive',
        field: 'activityData.value',
        severity: 'major',
        suggestion: 'Value must be at least 0'
      }
    ],
    warnings: [
      {
        code: 'REASONABLE_EMISSION_VALUE',
        message: 'Emission value seems unreasonably high',
        field: 'emissions.co2e',
        suggestion: 'Please verify the emission calculation'
      }
    ],
    qualityScore: 45,
    recommendations: [
      'Address all critical validation errors before proceeding',
      'Improve data completeness by filling all required fields'
    ],
    validatedAt: new Date('2024-01-15T10:00:00Z')
  };

  describe('✅ Valid Results Display', () => {
    it('should display success status for valid results', () => {
      render(<ValidationResults result={mockValidResult} />);

      expect(screen.getByText('Data validation successful! All required fields are valid and meet quality standards.')).toBeInTheDocument();
      expect(screen.getByTestId('quality-score')).toHaveTextContent('95/100');
    });

    it('should show excellent quality score badge for high scores', () => {
      render(<ValidationResults result={mockValidResult} />);

      expect(screen.getByText('Excellent')).toBeInTheDocument();
    });

    it('should display green progress bar for high quality scores', () => {
      render(<ValidationResults result={mockValidResult} />);

      const progressBar = screen.getByTestId('quality-score-bar');
      expect(progressBar).toHaveStyle({ width: '95%' });
      expect(progressBar).toHaveClass('bg-green-600');
    });

    it('should show success message for excellent data', () => {
      render(<ValidationResults result={mockValidResult} />);

      expect(screen.getByText(/🎉 Excellent!/)).toBeInTheDocument();
      expect(screen.getByText(/You can proceed with confidence/)).toBeInTheDocument();
    });

    it('should display recommendations for valid results', () => {
      render(<ValidationResults result={mockValidResult} />);

      const recommendations = screen.getByTestId('recommendations');
      expect(recommendations).toHaveTextContent('Excellent data quality! Continue following current practices');
    });
  });

  describe('❌ Invalid Results Display', () => {
    it('should display failure status for invalid results', () => {
      render(<ValidationResults result={mockInvalidResult} />);

      expect(screen.getByText('Data validation failed. Please address the errors below to proceed.')).toBeInTheDocument();
      expect(screen.getByTestId('quality-score')).toHaveTextContent('45/100');
    });

    it('should show poor quality score badge for low scores', () => {
      render(<ValidationResults result={mockInvalidResult} />);

      expect(screen.getByText('Critical')).toBeInTheDocument();
    });

    it('should display red progress bar for low quality scores', () => {
      render(<ValidationResults result={mockInvalidResult} />);

      const progressBar = screen.getByTestId('quality-score-bar');
      expect(progressBar).toHaveStyle({ width: '45%' });
      expect(progressBar).toHaveClass('bg-red-600');
    });

    it('should display all validation errors', () => {
      render(<ValidationResults result={mockInvalidResult} />);

      expect(screen.getByText(/Activity data value is required/)).toBeInTheDocument();
      expect(screen.getByText(/Activity data value must be positive/)).toBeInTheDocument();
    });

    it('should display error suggestions', () => {
      render(<ValidationResults result={mockInvalidResult} />);

      expect(screen.getByText('💡 Suggestion: Please provide a value for activityData.value')).toBeInTheDocument();
      expect(screen.getByText('💡 Suggestion: Value must be at least 0')).toBeInTheDocument();
    });

    it('should display warnings', () => {
      render(<ValidationResults result={mockInvalidResult} />);

      expect(screen.getByText(/Emission value seems unreasonably high/)).toBeInTheDocument();
    });

    it('should show error and warning counts in summary', () => {
      render(<ValidationResults result={mockInvalidResult} />);

      // Check summary stats
      const summaryCards = screen.getAllByText('2');
      expect(summaryCards[0]).toBeInTheDocument(); // 2 errors

      const warningCount = screen.getByText('1');
      expect(warningCount).toBeInTheDocument(); // 1 warning
    });
  });

  describe('🎨 Quality Score Visual Indicators', () => {
    it('should use yellow color for fair quality scores (70-79)', () => {
      const fairResult = { ...mockValidResult, qualityScore: 75 };
      render(<ValidationResults result={fairResult} />);

      const progressBar = screen.getByTestId('quality-score-bar');
      expect(progressBar).toHaveClass('bg-yellow-600');
    });

    it('should use red color for poor quality scores (<70)', () => {
      const poorResult = { ...mockValidResult, qualityScore: 60 };
      render(<ValidationResults result={poorResult} />);

      const progressBar = screen.getByTestId('quality-score-bar');
      expect(progressBar).toHaveClass('bg-red-600');
    });

    it('should display correct quality score labels', () => {
      // Test different score ranges
      const testCases = [
        { score: 95, label: 'Excellent' },
        { score: 85, label: 'Good' },
        { score: 75, label: 'Fair' },
        { score: 65, label: 'Poor' },
        { score: 45, label: 'Critical' }
      ];

      testCases.forEach(({ score, label }) => {
        const result = { ...mockValidResult, qualityScore: score };
        const { rerender } = render(<ValidationResults result={result} />);
        
        expect(screen.getByText(label)).toBeInTheDocument();
        
        rerender(<div />); // Clean up for next test
      });
    });
  });

  describe('📊 Summary Statistics', () => {
    it('should display correct error and warning counts', () => {
      render(<ValidationResults result={mockInvalidResult} />);

      // Should show 2 errors, 1 warning, 2 recommendations in summary cards
      const summaryCards = screen.getAllByText('2');
      expect(summaryCards.length).toBeGreaterThanOrEqual(2); // Should have at least 2 cards with "2"
      
      const warningCount = screen.getByText('1');
      expect(warningCount).toBeInTheDocument();
    });

    it('should show zero counts for valid results', () => {
      render(<ValidationResults result={mockValidResult} />);

      // Should show 0 errors, 0 warnings
      const zeroCounts = screen.getAllByText('0');
      expect(zeroCounts.length).toBeGreaterThanOrEqual(2); // At least errors and warnings should be 0
    });
  });

  describe('🕒 Timestamp Display', () => {
    it('should display validation timestamp', () => {
      render(<ValidationResults result={mockValidResult} />);

      // Should show the formatted date
      expect(screen.getByText(/Validation completed at/)).toBeInTheDocument();
    });
  });

  describe('🎯 Error Severity Badges', () => {
    it('should display correct severity badges for errors', () => {
      render(<ValidationResults result={mockInvalidResult} />);

      // Should show CRITICAL and MAJOR badges
      expect(screen.getByText('CRITICAL')).toBeInTheDocument();
      expect(screen.getByText('MAJOR')).toBeInTheDocument();
    });

    it('should display error codes', () => {
      render(<ValidationResults result={mockInvalidResult} />);

      expect(screen.getByText('Code: REQUIRED_ACTIVITY_VALUE')).toBeInTheDocument();
      expect(screen.getByText('Code: POSITIVE_ACTIVITY_VALUE')).toBeInTheDocument();
    });
  });

  describe('📱 Responsive Design', () => {
    it('should apply custom className when provided', () => {
      render(<ValidationResults result={mockValidResult} className="custom-class" />);

      const card = screen.getByTestId('card');
      expect(card).toHaveClass('custom-class');
    });
  });

  describe('🔄 Edge Cases', () => {
    it('should handle empty errors and warnings arrays', () => {
      const emptyResult: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
        qualityScore: 100,
        recommendations: [],
        validatedAt: new Date()
      };

      render(<ValidationResults result={emptyResult} />);

      expect(screen.getByText('Data validation successful! All required fields are valid and meet quality standards.')).toBeInTheDocument();
      expect(screen.getByTestId('quality-score')).toHaveTextContent('100/100');
    });

    it('should handle missing suggestions in errors', () => {
      const errorWithoutSuggestion: ValidationResult = {
        isValid: false,
        errors: [{
          code: 'TEST_ERROR',
          message: 'Test error message',
          field: 'test.field',
          severity: 'minor'
          // No suggestion provided
        }],
        warnings: [],
        qualityScore: 80,
        recommendations: [],
        validatedAt: new Date()
      };

      render(<ValidationResults result={errorWithoutSuggestion} />);

      expect(screen.getByText(/Test error message/)).toBeInTheDocument();
      // Should not show suggestion section
      expect(screen.queryByText('💡 Suggestion:')).not.toBeInTheDocument();
    });
  });
});