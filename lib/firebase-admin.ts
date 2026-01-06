import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

function initializeFirebaseAdmin() {
  if (!getApps().length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

    if (!projectId || !privateKey || !clientEmail) {
      throw new Error('Firebase Admin credentials are missing. Please check your .env file.');
    }

    // Handle private key formatting - handle multiple formats
    // If the key already has actual newlines, keep them
    // If it has escaped \n, replace them with actual newlines
    if (!privateKey.includes('\n') && privateKey.includes('\\n')) {
      // Key has escaped newlines, replace them
      privateKey = privateKey.replace(/\\n/g, '\n');
    }
    // If key has actual newlines but also has \n sequences, clean it up
    privateKey = privateKey.replace(/\\n/g, '\n');
    
    // Ensure the key starts and ends correctly
    if (!privateKey.trim().startsWith('-----BEGIN PRIVATE KEY-----')) {
      throw new Error('Invalid private key format: missing BEGIN marker');
    }
    if (!privateKey.trim().endsWith('-----END PRIVATE KEY-----')) {
      throw new Error('Invalid private key format: missing END marker');
    }

    const serviceAccount = {
      projectId,
      privateKey: privateKey.trim(),
      clientEmail,
    };

    try {
      initializeApp({
        credential: cert(serviceAccount as any),
        projectId: serviceAccount.projectId,
      });
    } catch (error) {
      console.error('Firebase Admin initialization error:', error);
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

