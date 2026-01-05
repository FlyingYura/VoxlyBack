import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '../../../../../services/userService';
import { ProgressService } from '../../../../../services/progressService';
import { verifyFirebaseToken } from '../../../../../lib/auth';
import { handleCors, addCorsHeaders } from '../../../../../middleware/cors';

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

    const allProgress = await ProgressService.getAllUserProgress(user.id);

    const response = NextResponse.json({
      success: true,
      progress: allProgress.map((p) => ({
        id: p.id,
        courseId: p.courseId,
        progress: p.progress,
        completedTopics: p.completedTopics,
        completedSubtopics: p.completedSubtopics || [],
        currentTopic: p.currentTopic,
        lastAccessed: p.lastAccessed.toDate().toISOString(),
      })),
    });

    return addCorsHeaders(response, req);
  } catch (error: any) {
    console.error('Get progress error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get progress' },
      { status: 500 }
    );
  }
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

    const { courseId, progress, completedTopics, completedSubtopics, currentTopic } = await req.json();

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    await ProgressService.upsertProgress(user.id, courseId, {
      progress,
      completedTopics,
      completedSubtopics,
      currentTopic,
    });

    const updatedProgress = await ProgressService.getUserProgress(user.id, courseId);

    const response = NextResponse.json({
      success: true,
      progress: updatedProgress ? {
        id: updatedProgress.id,
        courseId: updatedProgress.courseId,
        progress: updatedProgress.progress,
        completedTopics: updatedProgress.completedTopics,
        completedSubtopics: updatedProgress.completedSubtopics || [],
        currentTopic: updatedProgress.currentTopic,
        lastAccessed: updatedProgress.lastAccessed.toDate().toISOString(),
      } : null,
    });

    return addCorsHeaders(response, req);
  } catch (error: any) {
    console.error('Update progress error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update progress' },
      { status: 500 }
    );
  }
}

