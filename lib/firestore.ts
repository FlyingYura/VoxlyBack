import { db as firestoreDb } from './firebase-admin';

export const db = firestoreDb;

export interface FirestoreUser {
  firebaseUid: string;
  email: string;
  name: string;
  enrolledCourses: string[];
  paidCourses: string[];
  testResults: Array<{
    testId: string;
    score: number;
    maxScore: number;
    answers: Record<string, string | string[]>;
    completedAt: FirebaseFirestore.Timestamp;
  }>;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

export interface FirestoreCourse {
  id: string;
  title: string;
  language: string;
  level: 'Початковий' | 'Середній' | 'Продвинутий';
  duration: string;
  price: number;
  description: string;
  instructor: string;
  studentsCount: number;
  topics?: any[];
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

export interface FirestoreUserProgress {
  userId: string;
  courseId: string;
  progress: number; 
  completedTopics: string[];
  completedSubtopics?: string[]; 
  currentTopic?: string;
  lastAccessed: FirebaseFirestore.Timestamp;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

export const COLLECTIONS = {
  USERS: 'users',
  COURSES: 'courses',
  USER_PROGRESS: 'userProgress',
} as const;

export default db;

