import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '../../../../../services/userService';
import { verifyFirebaseToken } from '../../../../../lib/auth';
import { handleCors, addCorsHeaders } from '../../../../../middleware/cors';

export async function OPTIONS(req: NextRequest) {
  const corsResponse = handleCors(req);
  return corsResponse || new NextResponse(null, { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    const firebaseUid = await verifyFirebaseToken(req);

    if (!firebaseUid) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await UserService.getUserByFirebaseUid(firebaseUid);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { testId, score, maxScore, answers } = await req.json();

    if (!testId || score === undefined || maxScore === undefined) {
      return NextResponse.json(
        { error: 'testId, score, and maxScore are required' },
        { status: 400 }
      );
    }

    // Додаємо результат тесту
    await UserService.addTestResult(user.id, {
      testId,
      score,
      maxScore,
      answers: answers || {},
    });

    // Отримуємо оновленого користувача
    const updatedUser = await UserService.getUserByFirebaseUid(firebaseUid);

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Failed to retrieve updated user' },
        { status: 500 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user: UserService.formatUserForAPI(updatedUser as any),
    });

    return addCorsHeaders(response, req);
  } catch (error: any) {
    console.error('Add test result error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add test result' },
      { status: 500 }
    );
  }
}





