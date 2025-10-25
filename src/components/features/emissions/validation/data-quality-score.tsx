'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';

interface DataQualityScoreProps {
  score: number;
  previousScore?: number;
  breakdown?: {
    completeness: number;
    accuracy: number;
    consistency: number;
    richness: number;
  };
  className?: string;
  showDetails?: boolean;
}

export function DataQualityScore({ 
  score, 
  previousScore, 
  breakdown,
  className,
  showDetails = true 
}: DataQualityScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBackgroundColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 border-green-200';
    if (score >= 80) return 'bg-blue-100 border-blue-200';
    if (score >= 70) return 'bg-yellow-100 border-yellow-200';
    if (score >= 60) return 'bg-orange-100 border-orange-200';
    return 'bg-red-100 border-red-200';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Fair';
    if (score >= 60) return 'Poor';
    return 'Critical';
  };

  const getProgressColor = (score: number) => {
    if (score >= 90) return 'bg-green-600';
    if (score >= 80) return 'bg-blue-600';
    if (score >= 70) return 'bg-yellow-600';
    if (score >= 60) return 'bg-orange-600';
    return 'bg-red-600';
  };

  const getTrendIcon = () => {
    if (!previousScore) return null;
    
    const difference = score - previousScore;
    if (difference > 2) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (difference < -2) {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return <Minus className="h-4 w-4 text-gray-600" />;
  };

  const getTrendText = () => {
    if (!previousScore) return null;
    
    const difference = score - previousScore;
    const absChange = Math.abs(difference);
    
    if (difference > 2) {
      return `+${absChange.toFixed(1)} from last validation`;
    } else if (difference < -2) {
      return `-${absChange.toFixed(1)} from last validation`;
    }
    return 'No significant change';
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Data Quality Score</CardTitle>
        <CardDescription>
          Overall assessment of your emissions data quality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Score Display */}
        <div className={`p-6 rounded-lg border-2 ${getScoreBackgroundColor(score)}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className={`text-4xl font-bold ${getScoreColor(score)}`} data-testid="quality-score-display">
                {Math.round(score)}
              </div>
              <div className="text-sm text-gray-600">out of 100</div>
            </div>
            <div className="text-right">
              <Badge 
                variant="secondary" 
                className={`${getScoreColor(score)} bg-white border-current`}
                data-testid="quality-score-label"
              >
                {getScoreLabel(score)}
              </Badge>
              {previousScore && (
                <div className="flex items-center gap-1 mt-2 text-sm text-gray-600">
                  {getTrendIcon()}
                  <span>{getTrendText()}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="w-full bg-white/50 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-700 ${getProgressColor(score)}`}
                style={{ width: `${Math.min(score, 100)}%` }}
                data-testid="quality-score-progress"
              />
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>0</span>
              <span>50</span>
              <span>100</span>
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        {showDetails && breakdown && (
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Info className="h-4 w-4" />
              Quality Breakdown
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Completeness */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Completeness</span>
                  <span className="text-sm text-gray-600">{Math.round(breakdown.completeness)}%</span>
                </div>
                <Progress 
                  value={breakdown.completeness} 
                  className="h-2"
                  data-testid="completeness-progress"
                />
                <p className="text-xs text-gray-500">Required fields filled</p>
              </div>

              {/* Accuracy */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Accuracy</span>
                  <span className="text-sm text-gray-600">{Math.round(breakdown.accuracy)}%</span>
                </div>
                <Progress 
                  value={breakdown.accuracy} 
                  className="h-2"
                  data-testid="accuracy-progress"
                />
                <p className="text-xs text-gray-500">Data within valid ranges</p>
              </div>

              {/* Consistency */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Consistency</span>
                  <span className="text-sm text-gray-600">{Math.round(breakdown.consistency)}%</span>
                </div>
                <Progress 
                  value={breakdown.consistency} 
                  className="h-2"
                  data-testid="consistency-progress"
                />
                <p className="text-xs text-gray-500">Internal data consistency</p>
              </div>

              {/* Richness */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Richness</span>
                  <span className="text-sm text-gray-600">{Math.round(breakdown.richness)}%</span>
                </div>
                <Progress 
                  value={breakdown.richness} 
                  className="h-2"
                  data-testid="richness-progress"
                />
                <p className="text-xs text-gray-500">Additional context provided</p>
              </div>
            </div>
          </div>
        )}

        {/* Quality Guidelines */}
        {showDetails && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-3">Quality Guidelines</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium text-green-600 mb-1">Excellent (90-100)</div>
                <p className="text-gray-600">Ready for regulatory submission</p>
              </div>
              <div>
                <div className="font-medium text-blue-600 mb-1">Good (80-89)</div>
                <p className="text-gray-600">Minor improvements recommended</p>
              </div>
              <div>
                <div className="font-medium text-yellow-600 mb-1">Fair (70-79)</div>
                <p className="text-gray-600">Some data quality issues</p>
              </div>
              <div>
                <div className="font-medium text-red-600 mb-1">Poor/Critical (&lt;70)</div>
                <p className="text-gray-600">Significant improvements needed</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}