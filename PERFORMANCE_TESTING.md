# Performance Testing Guide

This document outlines the comprehensive performance testing setup for the Envoyou Dashboard, optimized for Vercel deployment.

## 🚀 Quick Start

### Environment Overview
- **Production**: `app.envoyou.com` (main branch)
- **Staging**: `staging.envoyou.com` (all other branches)
- **Development**: `localhost:3000` (vercel dev)

### Local Development with Vercel Dev

```bash
# Start development server with Vercel optimizations
npm run vercel:dev

# Run performance monitoring
npm run test:performance:monitor

# Run Lighthouse audit locally
npm run test:performance:local

# Analyze bundle size
npm run analyze
```

### Vercel Deployment

```bash
# Deploy to staging (automatic for non-main branches)
# Just push to any branch except main → staging.envoyou.com

# Manual deployment commands (if needed)
npm run vercel:preview  # Deploy to preview
npm run vercel:prod     # Deploy to production (main branch)
```

### GitHub Actions Workflow

**Automatic Testing:**
- **Pull Requests**: `pull-request.yml` runs full test suite + staging performance
- **Main Branch**: `production-monitoring.yml` runs production performance tracking
- **All Changes**: Unit, integration, E2E, and performance testing

### CI/CD Pipeline

Performance tests run automatically on:
- Pull requests to `main` and `develop`
- Pushes to `main` branch

## 📊 Performance Metrics

### Lighthouse Scores (Target)
- **Performance**: ≥80/100
- **Accessibility**: ≥90/100
- **Best Practices**: ≥85/100
- **SEO**: ≥90/100

### Core Web Vitals (Target)
- **First Contentful Paint (FCP)**: ≤2.0s
- **Largest Contentful Paint (LCP)**: ≤3.0s
- **Cumulative Layout Shift (CLS)**: ≤0.1
- **Total Blocking Time (TBT)**: ≤500ms

### Bundle Size (Target)
- **Total Bundle**: ≤1000KB
- **Vendor Bundle**: ≤500KB

## 🛠️ Tools & Configuration

### Lighthouse CI
- **Production Config**: `lighthouserc.js` - Strict performance budgets
- **Local Config**: `lighthouserc.local.js` - Relaxed for development
- **Budgets**: `performance/budgets.json` - Performance thresholds

### Bundle Analysis
- **Webpack Bundle Analyzer**: Integrated with Next.js build
- **Build Analysis**: `npm run build:analyze`

### GitHub Actions Workflows
- **Pull Request Testing**: `.github/workflows/pull-request.yml` - Full test suite + staging performance
- **Production Monitoring**: `.github/workflows/production-monitoring.yml` - Main branch performance tracking

## 📈 Performance Monitoring

### Automated Checks
1. **Unit & Integration Tests**: Run on every PR
2. **E2E Tests**: Run after successful unit tests
3. **Lighthouse CI**: Performance audit on build
4. **Bundle Analysis**: Bundle size tracking

### Manual Checks
```bash
# Run comprehensive performance monitoring
npm run test:performance:monitor

# Check specific pages
npx lighthouse http://localhost:3000 --output html --output-path ./lighthouse-report.html

# Bundle analysis
npm run analyze
```

## 🎯 Performance Budgets

### Page-Specific Budgets
- **Homepage (`/`)**: FCP ≤2.0s, LCP ≤3.0s
- **Dashboard (`/dashboard`)**: FCP ≤2.5s, LCP ≤3.5s

### Bundle Budgets
- **JavaScript**: ≤500KB gzipped
- **CSS**: ≤100KB gzipped
- **Images**: Optimized WebP/AVIF formats

## ⚡ Vercel Environment Integration

### Your Environment Setup
- **Production**: `app.envoyou.com` (main branch) - Full production environment
- **Staging**: `staging.envoyou.com` (feature branches) - Production-like with staging data
- **Development**: `localhost:3000` (vercel dev) - Development environment variables

### Why This Setup Rocks
- **Edge Runtime**: Global CDN for faster load times across all environments
- **Automatic Optimization**: Images, fonts, and assets optimized per environment
- **Environment-Specific Testing**: Test against real staging/production data
- **Built-in Analytics**: Real User Monitoring (RUM) for all environments

### Development Workflow
1. **Local Development**: Use `npm run vercel:dev` for accurate local testing with dev env vars
2. **Staging Testing**: Push to feature branch → automatic deployment to staging.envoyou.com
3. **Performance Testing**: GitHub Actions test against staging environment
4. **Production**: Merge to main → automatic deployment to app.envoyou.com

### Environment-Specific Features
- **Edge Functions**: API routes deployed globally across all environments
- **Image Optimization**: Automatic format conversion and sizing per environment
- **Environment Variables**: Separate variables for dev/staging/production
- **Performance Monitoring**: Lighthouse CI runs against staging for each PR

## 🔧 Performance Optimizations

### Already Configured
- **Image Optimization**: WebP/AVIF formats, responsive sizing
- **Code Splitting**: Automatic route-based splitting
- **Compression**: Gzip/Brotli enabled
- **Caching**: Optimized cache headers
- **Tree Shaking**: Unused code elimination

### Recommendations
1. **Images**: Use Next.js Image component for all images
2. **Fonts**: Optimize font loading with `next/font`
3. **Third-party Scripts**: Load scripts asynchronously
4. **Bundle Size**: Monitor and split large dependencies

## 📊 Reports & Dashboards

### Local Reports
- **Lighthouse Reports**: `./lhci-reports/`
- **Bundle Analysis**: Opens in browser after `npm run analyze`
- **Performance Reports**: `./performance-reports/`

### CI/CD Reports
- **Coverage Reports**: Available on Codecov
- **Lighthouse Results**: Available in GitHub Actions artifacts
- **Bundle Analysis**: Available in GitHub Actions artifacts

## 🚨 Troubleshooting

### Common Issues

**Lighthouse CI fails to start server:**
```bash
# Check if port 3000 is available
lsof -i :3000

# Kill existing processes
kill -9 <PID>
```

**Bundle analysis fails:**
```bash
# Clear Next.js cache
rm -rf .next

# Rebuild with fresh dependencies
npm ci && npm run build:analyze
```

**Performance scores are low:**
1. Check bundle size with `npm run analyze`
2. Identify large dependencies
3. Optimize images and assets
4. Review third-party scripts

## 📋 Best Practices

### Development
1. **Monitor bundle size** during development
2. **Test on slower devices** regularly
3. **Optimize images** before adding to components
4. **Use performance budgets** to catch regressions

### Production
1. **Enable compression** (already configured)
2. **Set up CDN** for static assets
3. **Monitor Core Web Vitals** in production
4. **Set up alerts** for performance regressions

## 🎉 Success Metrics

With this setup, you should achieve:
- **Performance Score**: ≥80 (Lighthouse)
- **Accessibility Score**: ≥90 (Lighthouse)
- **Bundle Size**: ≤1000KB total
- **Load Time**: ≤3s on 3G connection
- **Zero performance regressions** in CI/CD

## 📞 Support

For performance-related issues:
1. Check the GitHub Actions logs for detailed error messages
2. Review Lighthouse reports for specific recommendations
3. Analyze bundle composition for optimization opportunities
4. Monitor performance trends over time