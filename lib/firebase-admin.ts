import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

function initializeFirebaseAdmin() {
  if (!getApps().length) {
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    };

    if (!serviceAccount.projectId || !serviceAccount.privateKey || !serviceAccount.clientEmail) {
      throw new Error('Firebase Admin credentials are missing. Please check your .env file.');
    }

    try {
      initializeApp({
        credential: cert(serviceAccount as any),
        projectId: serviceAccount.projectId,
      });
    } catch (error) {
      throw error;
    }
  }
}

let _adminAuth: Auth | null = null;
let _db: Firestore | null = null;

function getAdminAuth() {
  if (!_adminAuth) {
    initializeFirebaseAdmin();
    _adminAuth = getAuth();
  }
  return _adminAuth;
}

function getDb() {
  if (!_db) {
    initializeFirebaseAdmin();
    _db = getFirestore();
  }
  return _db;
}

// Lazy initialization using getters
export const adminAuth = new Proxy({} as Auth, {
  get(_target, prop) {
    const auth = getAdminAuth();
    const value = (auth as any)[prop];
    // Bind functions to preserve 'this' context
    return typeof value === 'function' ? value.bind(auth) : value;
  },
}) as Auth;

export const db = new Proxy({} as Firestore, {
  get(_target, prop) {
    const firestore = getDb();
    const value = (firestore as any)[prop];
    // Bind functions to preserve 'this' context
    return typeof value === 'function' ? value.bind(firestore) : value;
  },
}) as Firestore;

