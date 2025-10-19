import { NextRequest, NextResponse } from 'next/server';

// Staging environment protection middleware
// This middleware prevents unauthorized access to staging environment
// and blocks search engine indexing to avoid duplicate content issues

export function middleware(request: NextRequest) {
  // Only apply middleware in staging environment
  const isStaging = process.env.NODE_ENV === 'production' &&
                   (process.env.VERCEL_ENV === 'preview' ||
                    process.env.NEXT_PUBLIC_ENV === 'staging' ||
                    process.env.VERCEL_URL?.includes('staging') ||
                    process.env.VERCEL_URL?.includes('preview'));

  if (!isStaging) {
    // Add no-index headers for all environments to be safe
    const response = NextResponse.next();
    addNoIndexHeaders(response);
    return response;
  }

  const { pathname } = request.nextUrl;

  // Allow access to static assets, API routes, login page, and Next.js internals
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/robots.txt') ||
    pathname.startsWith('/sitemap.xml') ||
    pathname.startsWith('/login') ||
    pathname.includes('.')
  ) {
    const response = NextResponse.next();
    addNoIndexHeaders(response);
    return response;
  }

  // Check for basic authentication
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return createAuthChallenge();
  }

  // Decode and verify credentials
  try {
    const credentials = decodeBasicAuth(authHeader);
    if (!isValidCredentials(credentials.username, credentials.password)) {
      return createAuthChallenge();
    }
  } catch {
    return createAuthChallenge();
  }

  // User is authenticated, proceed with no-index headers
  const response = NextResponse.next();
  addNoIndexHeaders(response);
  return response;
}

// Decode Basic Auth header
function decodeBasicAuth(authHeader: string): { username: string; password: string } {
  const base64Credentials = authHeader.replace('Basic ', '');
  const decoded = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  const [username, password] = decoded.split(':');

  if (!username || !password) {
    throw new Error('Invalid credentials format');
  }

  return { username, password };
}

// Validate credentials against environment variables
function isValidCredentials(username: string, password: string): boolean {
  const validUsername = process.env.STAGING_USERNAME;
  const validPassword = process.env.STAGING_PASSWORD;

  return username === validUsername && password === validPassword;
}

// Create authentication challenge response
function createAuthChallenge(): NextResponse {
  const response = new NextResponse(
    `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Staging Access Required</title>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #f8fafc;
          margin: 0;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
        }
        .container {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          text-align: center;
          max-width: 400px;
          width: 100%;
          margin: 1rem;
        }
        .logo {
          font-size: 2rem;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 1rem;
        }
        .staging-badge {
          background: #fef3c7;
          color: #92400e;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 500;
          display: inline-block;
          margin-bottom: 1rem;
        }
        .message {
          color: #6b7280;
          margin-bottom: 1.5rem;
          line-height: 1.5;
        }
        .credentials {
          background: #f3f4f6;
          padding: 1rem;
          border-radius: 4px;
          text-align: left;
          margin-bottom: 1rem;
          font-family: monospace;
          font-size: 0.875rem;
        }
        .credentials strong {
          color: #374151;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">EnvoYou</div>
        <div class="staging-badge">Staging Environment</div>
        <div class="message">
          This is a protected staging environment. Please use your credentials to access the application.
        </div>
        <div class="credentials">
          <strong>Username:</strong> your username<br>
          <strong>Password:</strong> your password
        </div>
        <div style="color: #9ca3af; font-size: 0.875rem;">
          <a href="mailto:hello@envoyou.com">Contact the development team</a> for access.
        </div>
      </div>
    </body>
    </html>
    `,
    {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="EnvoYou Staging Environment"',
        'Content-Type': 'text/html; charset=utf-8',
        ...getNoIndexHeaders(),
      },
    }
  );

  return response;
}

// Add headers to prevent search engine indexing
function addNoIndexHeaders(response: NextResponse): void {
  response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet, noimageindex, nocache');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
}

// Get no-index headers as object
function getNoIndexHeaders(): Record<string, string> {
  return {
    'X-Robots-Tag': 'noindex, nofollow, noarchive, nosnippet, noimageindex, nocache',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  };
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};