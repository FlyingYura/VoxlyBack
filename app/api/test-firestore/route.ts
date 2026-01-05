import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../lib/firebase-admin';
import { handleCors, addCorsHeaders } from '../../../middleware/cors';

export async function OPTIONS(req: NextRequest) {
  const corsResponse = handleCors(req);
  return corsResponse || new NextResponse(null, { status: 200 });
}

export async function GET(req: NextRequest) {
  try {
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    try {
      const usersRef = db.collection('users');
      const snapshot = await usersRef.limit(1).get();
      
      const response = NextResponse.json({
        success: true,
        message: 'Firestore connection successful',
        usersCount: snapshot.size,
        projectId: process.env.FIREBASE_PROJECT_ID,
        test: 'read_collection',
      });

      return addCorsHeaders(response, req);
    } catch (readError: any) {
      try {
        const testRef = await db.collection('test').add({
          test: true,
          timestamp: new Date(),
        });
        
        await testRef.delete();
        
        const response = NextResponse.json({
          success: true,
          message: 'Firestore write successful, but read failed',
          projectId: process.env.FIREBASE_PROJECT_ID,
          test: 'write_success_read_failed',
          error: readError.message,
        });

        return addCorsHeaders(response, req);
      } catch (writeError: any) {
        const errorResponse = NextResponse.json({
          success: false,
          error: 'Both read and write failed',
          readError: {
            code: readError.code,
            message: readError.message,
            details: readError.details,
          },
          writeError: {
            code: writeError.code,
            message: writeError.message,
            details: writeError.details,
          },
          projectId: process.env.FIREBASE_PROJECT_ID,
          hint: writeError.code === 7 
            ? 'Перевірте правила Firestore в Firebase Console. Вони повинні бути опубліковані!'
            : 'Перевірте налаштування Firebase Admin SDK',
        }, { status: 500 });
        return addCorsHeaders(errorResponse, req);
      }
    }
  } catch (error: any) {
    const errorResponse = NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      details: error.details,
      projectId: process.env.FIREBASE_PROJECT_ID,
    }, { status: 500 });
    return addCorsHeaders(errorResponse, req);
  }
}

