import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;


  if (pathname.startsWith('/api/')) {
    const referer = request.headers.get('referer');
    const origin = request.headers.get('origin');
    const userAgent = request.headers.get('user-agent');
    

    const securityChecks = {
      hasValidReferer: referer && referer.includes('auracord.vercel.app'),
      hasValidOrigin: origin && origin.includes('auracord.vercel.app'),
      hasUserAgent: userAgent && userAgent.length > 0,
      isNotDirectAccess: referer !== null, 
    };


    if (!securityChecks.hasValidReferer || !securityChecks.hasValidOrigin || !securityChecks.hasUserAgent) {
      return new NextResponse(
        JSON.stringify({
          error: 'Unauthorized access',
          message: 'API access is restricted to authorized requests only',
          code: 'UNAUTHORIZED_ACCESS'
        }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
            'X-Error-Code': 'UNAUTHORIZED_ACCESS'
          }
        }
      );
    }


    const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `rate_limit_${clientIP}`;
    

    return NextResponse.next();
  }


  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
  ],
}; 