import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '../../../../lib/firebase-admin';
import { UserService } from '../../../../services/userService';
import { verifyFirebaseToken } from '../../../../lib/auth';
import { handleCors, addCorsHeaders } from '../../../../lib/cors';

export async function OPTIONS(req: NextRequest) {
  const corsResponse = handleCors(req);
  return corsResponse || new NextResponse(null, { status: 204 });
}

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return addCorsHeaders(
        NextResponse.json({ error: 'ID token is required' }, { status: 400 }),
        req
      );
    }

    const firebaseUid = await verifyFirebaseToken(idToken);

    if (!firebaseUid) {
      return addCorsHeaders(
        NextResponse.json({ error: 'Invalid token' }, { status: 401 }),
        req
      );
    }

    let user = await UserService.getUserByFirebaseUid(firebaseUid);

    if (!user) {
      const firebaseUser = await adminAuth.getUser(firebaseUid);
      const email = firebaseUser.email || '';
      const existingUser = email ? await UserService.getUserByEmail(email) : null;

      if (existingUser) {
        await UserService.updateUserFirebaseUid(existingUser.id, firebaseUid);
        user = await UserService.getUserByFirebaseUid(firebaseUid);
      } else {
        await UserService.createUser({
          firebaseUid,
          email,
          name: firebaseUser.displayName || email.split('@')[0] || 'User',
          enrolledCourses: [],
          paidCourses: [],
          testResults: [],
        });
        user = await UserService.getUserByFirebaseUid(firebaseUid);
      }
    }

    if (!user) {
      return addCorsHeaders(
        NextResponse.json({ error: 'Failed to create or retrieve user' }, { status: 500 }),
        req
      );
    }

    return addCorsHeaders(
      NextResponse.json({
        success: true,
        user: UserService.formatUserForAPI(user as any),
      }),
      req
    );
  } catch (error: any) {
    console.error('Login error:', error);
    return addCorsHeaders(
      NextResponse.json({ error: error.message || 'Login failed' }, { status: 500 }),
      req
    );
  }
}
