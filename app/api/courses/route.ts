import { NextRequest, NextResponse } from 'next/server';
import { CourseService } from '../../../services/courseService';
import { handleCors, addCorsHeaders } from '../../../middleware/cors';

export async function OPTIONS(req: NextRequest) {
  const corsResponse = handleCors(req);
  return corsResponse || new NextResponse(null, { status: 200 });
}

export async function GET(req: NextRequest) {
  try {
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    const courses = await CourseService.getAllCourses();

    const response = NextResponse.json({
      success: true,
      courses: courses.map((course) => ({
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
      })),
    });

    return addCorsHeaders(response, req);
  } catch (error: any) {
    console.error('Get courses error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get courses' },
      { status: 500 }
    );
  }
}

