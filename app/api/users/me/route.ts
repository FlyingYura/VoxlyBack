import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '../../../../services/userService';
import { verifyFirebaseToken } from '../../../../lib/auth';
import { handleCors, addCorsHeaders } from '../../../../middleware/cors';

export async function OPTIONS(req: NextRequest) {
  const corsResponse = handleCors(req);
  return corsResponse || new NextResponse(null, { status: 200 });
}

export async function GET(req: NextRequest) {
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

    const response = NextResponse.json({
      success: true,
      user: UserService.formatUserForAPI(user as any),
    });

    return addCorsHeaders(response, req);
  } catch (error: any) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get user' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
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

    const { name, enrolledCourses, paidCourses } = await req.json();
    const updates: any = {};

    if (name) updates.name = name;
    if (enrolledCourses !== undefined) updates.enrolledCourses = enrolledCourses;
    if (paidCourses !== undefined) updates.paidCourses = paidCourses;

    await UserService.updateUser(user.id, updates);

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
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update user' },
      { status: 500 }
    );
  }
}

