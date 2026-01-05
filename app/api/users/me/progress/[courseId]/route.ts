import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '../../../../../../services/userService';
import { ProgressService } from '../../../../../../services/progressService';
import { verifyFirebaseToken } from '../../../../../../lib/auth';
import { handleCors, addCorsHeaders } from '../../../../../../middleware/cors';

export async function OPTIONS(req: NextRequest) {
  const corsResponse = handleCors(req);
  return corsResponse || new NextResponse(null, { status: 200 });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
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

    const { courseId } = await params;
    const progress = await ProgressService.getUserProgress(user.id, courseId);

    const response = NextResponse.json({
      success: true,
      progress: progress ? {
        id: progress.id,
        courseId: progress.courseId,
        progress: progress.progress,
        completedTopics: progress.completedTopics,
        completedSubtopics: progress.completedSubtopics || [],
        currentTopic: progress.currentTopic,
        lastAccessed: progress.lastAccessed.toDate().toISOString(),
      } : null,
    });

    return addCorsHeaders(response, req);
  } catch (error: any) {
    console.error('Get course progress error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get course progress' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
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

    const { courseId } = await params;
    const { progress, completedTopics, completedSubtopics, currentTopic } = await req.json();

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
    console.error('Update course progress error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update course progress' },
      { status: 500 }
    );
  }
}

