import { NextResponse } from 'next/server';
import { rateLimit, getClientIp } from './lib/security/rate-limit';

const SESSION_COOKIE_NAME = 'nainix_session';

/**
 * Global Security Middleware
 * Implements high-level security headers, rate limiting, and verification guards.
 */
export function middleware(request) {
  const url = request.nextUrl.pathname;
  const ip = getClientIp(request);

  // ─── Coming Soon Mode ──────────────────────────────────────────
  // Block all public pages and redirect to /coming-soon
  // EXCEPT: the coming-soon page itself, API routes, static assets, preview API
  const PREVIEW_SECRET = process.env.PREVIEW_SECRET;
  const previewCookie = request.cookies.get('nainix_preview')?.value;
  const hasPreviewAccess = PREVIEW_SECRET && previewCookie === PREVIEW_SECRET;

  const isPublicBypass =
    url.startsWith('/api/') ||
    url.startsWith('/_next/') ||
    url.startsWith('/coming-soon') ||
    url === '/favicon.ico' ||
    url.endsWith('.png') ||
    url.endsWith('.jpg') ||
    url.endsWith('.svg') ||
    url.endsWith('.ico') ||
    url === '/sitemap.xml' ||
    url === '/robots.txt';

  if (!hasPreviewAccess && !isPublicBypass) {
    return NextResponse.redirect(new URL('/coming-soon', request.url));
  }
  // ──────────────────────────────────────────────────────────────

  // --- Auth Redirect Phase ---
  // If already logged in, redirect away from auth pages
  if (url === '/login' || url === '/register') {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (sessionCookie) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // --- Verification Guard Phase ---
  // Protect dashboard routes: if logged in but not verified, redirect to /verify
  if (url.startsWith('/dashboard')) {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (sessionCookie) {
      try {
        // Basic extraction (Note: This doesn't verify signature, just reads payload for UI/UX redirection)
        // Authentic verification happens in API routes/Server components.
        const [encodedPayload] = sessionCookie.split('.');
        const payload = JSON.parse(atob(encodedPayload.replace(/-/g, '+').replace(/_/g, '/')));
        
        if (payload && !payload.emailVerified && url !== '/verify') {
          return NextResponse.redirect(new URL('/verify', request.url));
        }
      } catch (e) {
        // Ignore parsing errors, let original flow handle it
      }
    }
  }

  // --- Rate Limiting Phase ---
  // Stricter limits for login and register (5 attempts per minute)
  if (url === '/api/auth/login' || url === '/api/auth/register') {
    const { allowed, reset } = rateLimit({
      id: `auth_${ip}`,
      limit: 5,
      windowMs: 60 * 1000,
    });

    if (!allowed) {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Too many attempts. Please try again later.' }),
        { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString() } }
      );
    }
  }

  // Analytics spam protection (20 events per minute)
  if (url === '/api/analytics/event') {
    const { allowed } = rateLimit({
      id: `analytics_${ip}`,
      limit: 20,
      windowMs: 60 * 1000,
    });

    if (!allowed) {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Too many requests.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // --- Security Headers Phase ---
  const response = NextResponse.next();

  // 1. Content Security Policy (CSP)
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.google.com https://*.gstatic.com https://checkout.razorpay.com https://va.vercel-scripts.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https://*.supabase.co https://*.googleusercontent.com https://images.unsplash.com https://i.pravatar.cc https://*.razorpay.com https://*.dicebear.com;
    font-src 'self' data: https://fonts.gstatic.com;
    connect-src 'self' https://api.razorpay.com https://*.supabase.co https://*.google.com;
    frame-src 'self' https://api.razorpay.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();

  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Disables features like camera, microphone, and geolocation by default.
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

// Only run the middleware on relevant paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
