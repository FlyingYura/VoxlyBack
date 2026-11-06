import { NextRequest, NextResponse } from 'next/server';

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(item => item.trim()) || [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  if (allowedOrigins.includes(origin)) return true;
  if (origin.endsWith('.vercel.app')) return true;
  if (origin.startsWith('http://localhost:') || origin.startsWith('https://localhost:')) return true;
  if (origin.startsWith('http://127.0.0.1:') || origin.startsWith('https://127.0.0.1:')) return true;
  return false;
}

function applyCors(response: NextResponse, origin: string) {
  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With'
  );
  response.headers.set('Access-Control-Max-Age', '86400');
  response.headers.set('Vary', 'Origin');
}

export function handleCors(req: NextRequest) {
  const origin = req.headers.get('origin');
  const isAllowed = isAllowedOrigin(origin);

  if (req.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });
    if (origin && isAllowed) applyCors(response, origin);
    return response;
  }

  return null;
}

export function addCorsHeaders(response: NextResponse, req: NextRequest): NextResponse {
  const origin = req.headers.get('origin');
  if (origin && isAllowedOrigin(origin)) {
    applyCors(response, origin);
  }
  return response;
}
