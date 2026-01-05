import { db } from '../lib/firebase-admin';
import { COLLECTIONS, FirestoreCourse } from '../lib/firestore';
import { FieldValue } from 'firebase-admin/firestore';

export class CourseService {
  // Отримати всі курси
  static async getAllCourses(): Promise<(FirestoreCourse & { id: string })[]> {
    const coursesSnapshot = await db.collection(COLLECTIONS.COURSES).get();
    return coursesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as (FirestoreCourse & { id: string })[];
  }

  // Отримати курс за ID
  static async getCourseById(courseId: string): Promise<(FirestoreCourse & { id: string }) | null> {
    const courseDoc = await db.collection(COLLECTIONS.COURSES).doc(courseId).get();
    
    if (!courseDoc.exists) {
      return null;
    }
    
    return { id: courseDoc.id, ...courseDoc.data() } as FirestoreCourse & { id: string };
  }

  // Створити курс
  static async createCourse(courseData: Omit<FirestoreCourse, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const now = FieldValue.serverTimestamp();
    const courseRef = await db.collection(COLLECTIONS.COURSES).add({
      ...courseData,
      createdAt: now,
      updatedAt: now,
    });
    
    return courseRef.id;
  }

  // Оновити курс
  static async updateCourse(courseId: string, updates: Partial<FirestoreCourse>): Promise<void> {
    await db.collection(COLLECTIONS.COURSES).doc(courseId).update({
      ...updates,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  // Збільшити кількість студентів
  static async incrementStudentsCount(courseId: string): Promise<void> {
    await db.collection(COLLECTIONS.COURSES).doc(courseId).update({
      studentsCount: FieldValue.increment(1),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }
}

