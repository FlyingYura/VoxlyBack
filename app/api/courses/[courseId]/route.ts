import { NextRequest, NextResponse } from 'next/server';
import { CourseService } from '../../../../services/courseService';
import { handleCors, addCorsHeaders } from '../../../../middleware/cors';

export async function OPTIONS(req: NextRequest) {
  const corsResponse = handleCors(req);
  return corsResponse || new NextResponse(null, { status: 200 });
}

export async function GET(
  req: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    const { courseId } = params;
    const course = await CourseService.getCourseById(courseId);

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    const response = NextResponse.json({
      success: true,
      course: {
        id: course.id,
        title: course.title,
        language: course.language,
        level: course.level,
        duration: course.duration,
        price: course.price,
        description: course.description,
        instructor: course.instructor,
        studentsCount: course.studentsCount,
        topics: course.topics,
      },
    });

    return addCorsHeaders(response, req);
  } catch (error: any) {
    console.error('Get course error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get course' },
      { status: 500 }
    );
  }
}

