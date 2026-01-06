import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '../../../../lib/firebase-admin';
import { UserService } from '../../../../services/userService';
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
      const errorResponse = NextResponse.json(
        { error: 'ID token is required' },
        { status: 400 }
      );
      return addCorsHeaders(errorResponse, req);
    }

    console.log('Verifying ID token...');
    console.log('Token length:', idToken?.length);
    console.log('Token preview:', idToken?.substring(0, 50));
    
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
      console.log('Token verified successfully');
    } catch (verifyError: any) {
      console.error('Token verification error:', verifyError);
      console.error('Error code:', verifyError.code);
      console.error('Error message:', verifyError.message);
      throw verifyError;
    }
    
    const { uid, email, name } = decodedToken;

    if (!email) {
      const errorResponse = NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
      return addCorsHeaders(errorResponse, req);
    }

    let user: (any & { id: string }) | null = null;
    
    try {
      console.log('Getting user by Firebase UID:', uid);
      user = await UserService.getUserByFirebaseUid(uid);
      console.log('User found:', !!user);
    } catch (error: any) {
      console.error('Error getting user by Firebase UID:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      if (error.code === 7) {
        console.log('PERMISSION_DENIED');
      } else {
        throw error;
      }
    }

    if (!user) {
      try {
        console.log('User not found, checking by email:', email);
        const existingUser = await UserService.getUserByEmail(email);
        console.log('Existing user found:', !!existingUser);
        
        if (existingUser) {
          console.log('Updating existing user Firebase UID');
          await UserService.updateUserFirebaseUid(existingUser.id, uid);
          user = await UserService.getUserByFirebaseUid(uid);
        } else {
          console.log('📝 Створюємо нового користувача в Firestore');
          const userId = await UserService.createUser({
            firebaseUid: uid,
            email,
            name: name || email.split('@')[0],
            enrolledCourses: [],
            paidCourses: [],
            testResults: [],
          });
          console.log('Користувач створений з ID:', userId);
          user = await UserService.getUserByFirebaseUid(uid);
        }
      } catch (createError: any) {
        console.error('Помилка при створенні/оновленні користувача:', createError);
        console.error('Error code:', createError.code);
        console.error('Error message:', createError.message);
        console.error('Error details:', createError.details);
        throw createError;
      }
    }

    if (!user) {
      const errorResponse = NextResponse.json(
        { error: 'Failed to create or retrieve user' },
        { status: 500 }
      );
      return addCorsHeaders(errorResponse, req);
    }

    const response = NextResponse.json({
      success: true,
      user: UserService.formatUserForAPI(user as any),
    });

    return addCorsHeaders(response, req);
  } catch (error: any) {
    console.error('Google auth error:', error);
    const errorResponse = NextResponse.json(
      { error: error.message || 'Authentication failed' },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse, req);
  }
}

