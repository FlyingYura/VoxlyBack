import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '../../../../services/userService';
import { verifyFirebaseToken } from '../../../../lib/auth';
import { handleCors, addCorsHeaders } from '../../../../middleware/cors';

export async function OPTIONS(req: NextRequest) {
  const corsResponse = handleCors(req);
  return corsResponse || new NextResponse(null, { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json(
        { error: 'ID token is required' },
        { status: 400 }
      );
    }

    // Верифікація токену через Firebase
    const firebaseUid = await verifyFirebaseToken(idToken);

    if (!firebaseUid) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Знаходимо користувача
    const user = await UserService.getUserByFirebaseUid(firebaseUid);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user: UserService.formatUserForAPI(user as any),
    });

    return addCorsHeaders(response, req);
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error.message || 'Login failed' },
      { status: 500 }
    );
  }
}

