import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {

  const origin = request.headers.get('origin');
  

  const allowedOrigins = [
    'https://www.laksdentagency.co.uk',
    'https://laksdentagency.co.uk',
    'https://laks-crm.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
  ];


  const isAllowedOrigin = origin && allowedOrigins.includes(origin);

  if (request.method === 'OPTIONS') {
    const preflightHeaders = {
      'Access-Control-Allow-Origin': isAllowedOrigin ? origin : allowedOrigins[0],
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin',
      'Access-Control-Max-Age': '86400', // 24 hours
      'Access-Control-Allow-Credentials': 'true',
    };

    return NextResponse.json({}, { headers: preflightHeaders });
  }

  const response = NextResponse.next();

  if (isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  return response;
}
export const config = {
  matcher: [
    '/api/:path*', 
  ],
};

