#!/usr/bin/env node

/**
 * Performance Monitoring Script
 * Runs Lighthouse audits and bundle analysis
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class PerformanceMonitor {
  constructor() {
    this.projectRoot = path.join(__dirname, '..');
    this.reportsDir = path.join(this.projectRoot, 'performance-reports');
  }

  async runAllChecks() {
    console.log('🚀 Starting Performance Monitoring...\n');

    try {
      // Ensure reports directory exists
      if (!fs.existsSync(this.reportsDir)) {
        fs.mkdirSync(this.reportsDir, { recursive: true });
      }

      // Run bundle analysis
      await this.analyzeBundle();

      // Run Lighthouse audit (if server is running)
      await this.runLighthouseAudit();

      // Generate performance report
      await this.generateReport();

      console.log('✅ Performance monitoring completed successfully!');
    } catch (error) {
      console.error('❌ Performance monitoring failed:', error.message);
      process.exit(1);
    }
  }

  async analyzeBundle() {
    console.log('📦 Analyzing bundle size...');

    try {
      // Build the application
      execSync('npm run build', {
        cwd: this.projectRoot,
        stdio: 'inherit'
      });

      // Get bundle stats
      const stats = this.getBundleStats();
      console.log(`   Bundle size: ${stats.totalSize} KB`);
      console.log(`   Chunks: ${stats.chunks}`);

      return stats;
    } catch (error) {
      console.log('   ⚠️  Bundle analysis failed, but continuing...');
      return null;
    }
  }

  getBundleStats() {
    try {
      const buildStatsPath = path.join(this.projectRoot, '.next/build-stats.json');

      if (fs.existsSync(buildStatsPath)) {
        const stats = JSON.parse(fs.readFileSync(buildStatsPath, 'utf8'));
        return {
          totalSize: Math.round(stats.totalSize / 1024), // Convert to KB
          chunks: stats.chunks.length,
          assets: stats.assets.length
        };
      }
    } catch (error) {
      console.log('   Could not read build stats');
    }

    return { totalSize: 0, chunks: 0, assets: 0 };
  }

  async runLighthouseAudit() {
    console.log('🔍 Running Lighthouse audit...');

    try {
      // Check if server is running
      const isServerRunning = await this.checkServerStatus();

      if (!isServerRunning) {
        console.log('   ⚠️  Server not running, skipping Lighthouse audit');
        return null;
      }

      // Run Lighthouse CI
      execSync('npm run test:performance:local', {
        cwd: this.projectRoot,
        stdio: 'inherit'
      });

      return true;
    } catch (error) {
      console.log('   ⚠️  Lighthouse audit failed, but continuing...');
      return null;
    }
  }

  async checkServerStatus() {
    try {
      const response = await fetch('http://localhost:3000', {
        timeout: 5000
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async generateReport() {
    console.log('📊 Generating performance report...');

    const report = {
      timestamp: new Date().toISOString(),
      bundle: this.getBundleStats(),
      lighthouse: this.getLighthouseResults(),
      recommendations: this.generateRecommendations()
    };

    const reportPath = path.join(this.reportsDir, `performance-report-${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`   Report saved to: ${reportPath}`);
    return report;
  }

  getLighthouseResults() {
    try {
      const lhciReports = path.join(this.projectRoot, 'lhci-reports');
      if (fs.existsSync(lhciReports)) {
        const files = fs.readdirSync(lhciReports);
        const latestReport = files
          .filter(f => f.endsWith('.json'))
          .sort()
          .pop();

        if (latestReport) {
          const report = JSON.parse(
            fs.readFileSync(path.join(lhciReports, latestReport), 'utf8')
          );

          return {
            performance: report.summary?.performance || 0,
            accessibility: report.summary?.accessibility || 0,
            bestPractices: report.summary?.['best-practices'] || 0,
            seo: report.summary?.seo || 0
          };
        }
      }
    } catch (error) {
      console.log('   Could not read Lighthouse results');
    }

    return null;
  }

  generateRecommendations() {
    const recommendations = [];

    // Bundle size recommendations
    const bundleStats = this.getBundleStats();
    if (bundleStats.totalSize > 1000) {
      recommendations.push({
        type: 'bundle-size',
        priority: 'high',
        message: `Bundle size (${bundleStats.totalSize}KB) exceeds recommended limit of 1000KB`
      });
    }

    // Lighthouse score recommendations
    const lighthouse = this.getLighthouseResults();
    if (lighthouse) {
      if (lighthouse.performance < 0.8) {
        recommendations.push({
          type: 'performance',
          priority: 'medium',
          message: `Performance score (${Math.round(lighthouse.performance * 100)}) is below target of 80`
        });
      }

      if (lighthouse.accessibility < 0.9) {
        recommendations.push({
          type: 'accessibility',
          priority: 'high',
          message: `Accessibility score (${Math.round(lighthouse.accessibility * 100)}) is below target of 90`
        });
      }
    }

    return recommendations;
  }
}

// Run if called directly
if (require.main === module) {
  const monitor = new PerformanceMonitor();
  monitor.runAllChecks().catch(console.error);
}

module.exports = PerformanceMonitor;