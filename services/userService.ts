import { db } from '../lib/firebase-admin';
import { COLLECTIONS, FirestoreUser } from '../lib/firestore';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

export class UserService {
  static async getUserByFirebaseUid(firebaseUid: string): Promise<(FirestoreUser & { id: string }) | null> {
    try {
      const usersRef = db.collection(COLLECTIONS.USERS);
      const querySnapshot = await usersRef.where('firebaseUid', '==', firebaseUid).limit(1).get();
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as FirestoreUser & { id: string };
    } catch (error: any) {
      throw error;
    }
  }

  static async getUserByEmail(email: string): Promise<(FirestoreUser & { id: string }) | null> {
    const userDoc = await db.collection(COLLECTIONS.USERS).where('email', '==', email.toLowerCase()).limit(1).get();
    
    if (userDoc.empty) {
      return null;
    }
    
    return { id: userDoc.docs[0].id, ...userDoc.docs[0].data() } as FirestoreUser & { id: string };
  }

  static async createUser(userData: Omit<FirestoreUser, 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = FieldValue.serverTimestamp();
      const userRef = await db.collection(COLLECTIONS.USERS).add({
        ...userData,
        email: userData.email.toLowerCase(),
        createdAt: now,
        updatedAt: now,
      });
      
      return userRef.id;
    } catch (error: any) {
      throw error;
    }
  }

  static async updateUser(userId: string, updates: Partial<FirestoreUser>): Promise<void> {
    await db.collection(COLLECTIONS.USERS).doc(userId).update({
      ...updates,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  static async updateUserFirebaseUid(userId: string, firebaseUid: string): Promise<void> {
    await db.collection(COLLECTIONS.USERS).doc(userId).update({
      firebaseUid,
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  static async addEnrolledCourse(userId: string, courseId: string): Promise<void> {
    const userRef = db.collection(COLLECTIONS.USERS).doc(userId);
    await userRef.update({
      enrolledCourses: FieldValue.arrayUnion(courseId),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  static async addPaidCourse(userId: string, courseId: string): Promise<void> {
    const userRef = db.collection(COLLECTIONS.USERS).doc(userId);
    await userRef.update({
      paidCourses: FieldValue.arrayUnion(courseId),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  static async addTestResult(
    userId: string,
    testResult: {
      testId: string;
      score: number;
      maxScore: number;
      answers: Record<string, string | string[]>;
    }
  ): Promise<void> {
    const userRef = db.collection(COLLECTIONS.USERS).doc(userId);
    const userDoc = await userRef.get();
    const userData = userDoc.data() as FirestoreUser;
    
    const existingTestResults = userData.testResults || [];
    const existingIndex = existingTestResults.findIndex(
      (result: any) => result.testId === testResult.testId
    );
    
    // Використовуємо Timestamp.now() замість FieldValue.serverTimestamp() для масиву
    const newTestResult = {
      ...testResult,
      completedAt: Timestamp.now(),
    };
    
    if (existingIndex !== -1) {
      existingTestResults[existingIndex] = newTestResult;
      await userRef.update({
        testResults: existingTestResults,
        updatedAt: FieldValue.serverTimestamp(),
      });
    } else {
      // Для arrayUnion потрібно використовувати звичайний об'єкт з Timestamp, а не FieldValue
      existingTestResults.push(newTestResult);
      await userRef.update({
        testResults: existingTestResults,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
  }

  static formatUserForAPI(user: FirestoreUser & { id: string }) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      enrolledCourses: user.enrolledCourses || [],
      paidCourses: user.paidCourses || [],
      testResults: (user.testResults || []).map((result) => ({
        testId: result.testId,
        score: result.score,
        maxScore: result.maxScore,
        answers: result.answers,
        completedAt: result.completedAt.toDate().toISOString(),
      })),
    };
  }
}

