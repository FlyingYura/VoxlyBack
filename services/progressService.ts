import { db } from '../lib/firebase-admin';
import { COLLECTIONS, FirestoreUserProgress } from '../lib/firestore';
import { FieldValue } from 'firebase-admin/firestore';

export class ProgressService {
  // Отримати прогрес користувача по курсу
  static async getUserProgress(userId: string, courseId: string): Promise<(FirestoreUserProgress & { id: string }) | null> {
    const progressDoc = await db
      .collection(COLLECTIONS.USER_PROGRESS)
      .where('userId', '==', userId)
      .where('courseId', '==', courseId)
      .limit(1)
      .get();
    
    if (progressDoc.empty) {
      return null;
    }
    
    return { id: progressDoc.docs[0].id, ...progressDoc.docs[0].data() } as FirestoreUserProgress & { id: string };
  }

  // Отримати весь прогрес користувача
  static async getAllUserProgress(userId: string): Promise<(FirestoreUserProgress & { id: string })[]> {
    const progressSnapshot = await db
      .collection(COLLECTIONS.USER_PROGRESS)
      .where('userId', '==', userId)
      .get();
    
    return progressSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as (FirestoreUserProgress & { id: string })[];
  }

  // Створити або оновити прогрес
  static async upsertProgress(
    userId: string,
    courseId: string,
    progressData: {
      progress?: number;
      completedTopics?: string[];
      completedSubtopics?: string[];
      currentTopic?: string;
    }
  ): Promise<string> {
    const existingProgress = await this.getUserProgress(userId, courseId);
    const now = FieldValue.serverTimestamp();
    
    if (existingProgress) {
      // Оновлюємо існуючий прогрес
      const updateData: any = {
        ...progressData,
        lastAccessed: now,
        updatedAt: now,
      };
      
      // Якщо передано completedSubtopics, об'єднуємо з існуючими
      if (progressData.completedSubtopics) {
        const existingSubtopics = existingProgress.completedSubtopics || [];
        const newSubtopics = Array.isArray(progressData.completedSubtopics) 
          ? progressData.completedSubtopics 
          : [progressData.completedSubtopics];
        const uniqueSubtopics = [...new Set([...existingSubtopics, ...newSubtopics])];
        updateData.completedSubtopics = uniqueSubtopics;
      }
      
      await db.collection(COLLECTIONS.USER_PROGRESS).doc(existingProgress.id).update(updateData);
      return existingProgress.id;
    } else {
      // Створюємо новий прогрес
      const progressRef = await db.collection(COLLECTIONS.USER_PROGRESS).add({
        userId,
        courseId,
        progress: progressData.progress || 0,
        completedTopics: progressData.completedTopics || [],
        completedSubtopics: progressData.completedSubtopics || [],
        currentTopic: progressData.currentTopic,
        lastAccessed: now,
        createdAt: now,
        updatedAt: now,
      });
      return progressRef.id;
    }
  }

  // Додати завершений топик
  static async addCompletedTopic(userId: string, courseId: string, topicId: string): Promise<void> {
    const existingProgress = await this.getUserProgress(userId, courseId);
    
    if (existingProgress) {
      if (!existingProgress.completedTopics.includes(topicId)) {
        await db.collection(COLLECTIONS.USER_PROGRESS).doc(existingProgress.id).update({
          completedTopics: FieldValue.arrayUnion(topicId),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    } else {
      // Створюємо новий прогрес
      await this.upsertProgress(userId, courseId, {
        completedTopics: [topicId],
        progress: 0,
      });
    }
  }

  // Оновити прогрес (відсоток завершення)
  static async updateProgress(userId: string, courseId: string, progress: number): Promise<void> {
    await this.upsertProgress(userId, courseId, { progress: Math.min(100, Math.max(0, progress)) });
  }

  // Додати завершену підтему
  static async addCompletedSubtopic(userId: string, courseId: string, subtopicId: string): Promise<void> {
    const existingProgress = await this.getUserProgress(userId, courseId);
    
    if (existingProgress) {
      const existingSubtopics = existingProgress.completedSubtopics || [];
      if (!existingSubtopics.includes(subtopicId)) {
        await db.collection(COLLECTIONS.USER_PROGRESS).doc(existingProgress.id).update({
          completedSubtopics: FieldValue.arrayUnion(subtopicId),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    } else {
      // Створюємо новий прогрес
      await this.upsertProgress(userId, courseId, {
        completedSubtopics: [subtopicId],
        progress: 0,
      });
    }
  }
}

