import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '../../../../lib/firebase-admin';
import { UserService } from '../../../../services/userService';
import { verifyFirebaseToken } from '../../../../lib/auth';
import { handleCors, addCorsHeaders } from '../../../../lib/cors';

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
      return addCorsHeaders(
        NextResponse.json({ error: 'ID token is required' }, { status: 400 }),
        req
      );
    }

    // Верифікація токену через Firebase
    const firebaseUid = await verifyFirebaseToken(idToken);

    if (!firebaseUid) {
      return addCorsHeaders(
        NextResponse.json({ error: 'Invalid token' }, { status: 401 }),
        req
      );
    }

    // Перевірка чи існує користувач
    let user = await UserService.getUserByFirebaseUid(firebaseUid);

    if (!user) {
      // Отримуємо дані користувача з Firebase
      const firebaseUser = await adminAuth.getUser(firebaseUid);
      
      // Перевірка чи існує користувач з таким email
      const existingUser = await UserService.getUserByEmail(firebaseUser.email || '');
      
      if (existingUser) {
        // Оновлюємо існуючого користувача з firebaseUid
        await UserService.updateUserFirebaseUid(existingUser.id, firebaseUid);
        user = await UserService.getUserByFirebaseUid(firebaseUid);
      } else {
        // Створюємо нового користувача
        await UserService.createUser({
          firebaseUid,
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
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

    const response = NextResponse.json({
      success: true,
      user: UserService.formatUserForAPI(user as any),
    });

    return addCorsHeaders(response, req);
  } catch (error: any) {
    console.error('Registration error:', error);
    return addCorsHeaders(
      NextResponse.json({ error: error.message || 'Registration failed' }, { status: 500 }),
      req
    );
  }
}

