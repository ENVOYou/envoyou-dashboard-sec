This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Staging Environment Protection

This project includes middleware that protects staging environments from unauthorized access and prevents search engine indexing.

### Features

- **Basic Authentication**: Protects staging deployments with username/password authentication
- **Search Engine Protection**: Adds `noindex` headers to prevent duplicate content issues
- **Security Headers**: Includes security headers (X-Frame-Options, X-Content-Type-Options, etc.)
- **Environment Detection**: Only activates in staging/preview environments

### Configuration

Set the following environment variables in your staging deployment:

```bash
# Staging Environment Protection
STAGING_USERNAME=staging
STAGING_PASSWORD=your_secure_password

# Environment Detection
NEXT_PUBLIC_ENV=staging
```

### Default Credentials

For development/testing, the default credentials are:
- **Username**: `staging`
- **Password**: `envoyou2024!`

### How It Works

1. **Environment Detection**: The middleware checks if the app is running in a staging environment
2. **Authentication Challenge**: When accessing protected routes, users see a login prompt
3. **No-Index Headers**: All responses include headers that prevent search engine indexing
4. **Asset Access**: Static assets and API routes remain accessible without authentication

### Protected Routes

All routes except static assets (`/_next/`, `/api/`, etc.) require authentication in staging environments.

### Security Benefits

- Prevents unauthorized access to staging deployments
- Avoids duplicate content penalties from search engines
- Provides clean staging environment isolation
- Includes comprehensive security headers
