import { NextRequest, NextResponse } from 'next/server';

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'];

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  
  // Exact match
  if (allowedOrigins.includes(origin)) return true;
  
  // Allow all Vercel preview and production domains
  if (origin.endsWith('.vercel.app')) return true;
  
  // Allow localhost for development
  if (origin.startsWith('http://localhost:') || origin.startsWith('https://localhost:')) return true;
  
  return false;
}

export function corsMiddleware(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  const origin = req.headers.get('origin');

  if (origin && isAllowedOrigin(origin)) {
    const response = NextResponse.next();
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    return response;
  }

  return handler(req);
}

export function handleCors(req: NextRequest) {
  const origin = req.headers.get('origin');
  const isAllowed = isAllowedOrigin(origin);
  
  if (req.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 200 });
    
    if (origin && isAllowed) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      response.headers.set('Access-Control-Max-Age', '86400');
    }
    
    return response;
  }
  
  return null;
}

export function addCorsHeaders(response: NextResponse, req: NextRequest): NextResponse {
  const origin = req.headers.get('origin');
  const isAllowed = isAllowedOrigin(origin);
  
  if (origin && isAllowed) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }
  
  return response;
}

