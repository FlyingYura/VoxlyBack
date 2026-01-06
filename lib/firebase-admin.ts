import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

function initializeFirebaseAdmin() {
  if (!getApps().length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

    if (!projectId || !privateKey || !clientEmail) {
      console.error('Missing Firebase credentials:', {
        hasProjectId: !!projectId,
        hasPrivateKey: !!privateKey,
        hasClientEmail: !!clientEmail,
      });
      throw new Error('Firebase Admin credentials are missing. Please check your .env file.');
    }

    // Handle private key formatting - replace escaped newlines with actual newlines
    privateKey = privateKey.replace(/\\n/g, '\n');
    
    // Remove any leading/trailing whitespace
    privateKey = privateKey.trim();
    
    // Ensure the key starts and ends correctly
    if (!privateKey.startsWith('-----BEGIN PRIVATE KEY-----')) {
      console.error('Invalid private key format: missing BEGIN marker');
      throw new Error('Invalid private key format: missing BEGIN marker');
    }
    if (!privateKey.endsWith('-----END PRIVATE KEY-----')) {
      console.error('Invalid private key format: missing END marker');
      throw new Error('Invalid private key format: missing END marker');
    }

    const serviceAccount = {
      projectId,
      privateKey,
      clientEmail,
    };

    try {
      console.log('Initializing Firebase Admin SDK...');
      console.log('Project ID:', projectId);
      console.log('Client Email:', clientEmail);
      console.log('Private Key length:', privateKey.length);
      console.log('Private Key starts correctly:', privateKey.startsWith('-----BEGIN PRIVATE KEY-----'));
      console.log('Private Key ends correctly:', privateKey.endsWith('-----END PRIVATE KEY-----'));
      
      initializeApp({
        credential: cert(serviceAccount as any),
        projectId: serviceAccount.projectId,
      });
      
      console.log('Firebase Admin SDK initialized successfully');
    } catch (error: any) {
      console.error('Firebase Admin initialization error:', error);
      console.error('Error message:', error.message);
      console.error('Error code:', error.code);
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

// Use Proxy but cache the instances properly
// The issue was that each get() call was creating a new instance
export const adminAuth = new Proxy({} as Auth, {
  get(_target, prop) {
    const auth = getAdminAuth();
    const value = (auth as any)[prop];
    return typeof value === 'function' ? value.bind(auth) : value;
  },
}) as Auth;

export const db = new Proxy({} as Firestore, {
  get(_target, prop) {
    const firestore = getDb();
    const value = (firestore as any)[prop];
    return typeof value === 'function' ? value.bind(firestore) : value;
  },
}) as Firestore;

