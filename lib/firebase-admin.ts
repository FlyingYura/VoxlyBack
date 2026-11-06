import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import 'dotenv/config';

type ServiceAccountData = {
  project_id?: string;
  projectId?: string;
  private_key?: string;
  privateKey?: string;
  client_email?: string;
  clientEmail?: string;
};

function findServiceAccountFiles(): string[] {
  try {
    return readdirSync(process.cwd())
      .filter((name) => /firebase-adminsdk.*\.json$/i.test(name))
      .map((name) => join(process.cwd(), name));
  } catch {
    return [];
  }
}

function readServiceAccountFile(): ServiceAccountData | null {
  const candidates = [
    process.env.GOOGLE_APPLICATION_CREDENTIALS,
    join(process.cwd(), 'serviceAccount.json'),
    ...findServiceAccountFiles(),
  ].filter(Boolean) as string[];

  for (const filePath of candidates) {
    try {
      if (!existsSync(filePath)) continue;
      return JSON.parse(readFileSync(filePath, 'utf8')) as ServiceAccountData;
    } catch (error) {
      console.error('Failed to read service account file:', filePath, error);
    }
  }

  return null;
}

function getCredentials() {
  const fromFile = readServiceAccountFile();

  let projectId = process.env.FIREBASE_PROJECT_ID || fromFile?.project_id || fromFile?.projectId;
  let clientEmail = process.env.FIREBASE_CLIENT_EMAIL || fromFile?.client_email || fromFile?.clientEmail;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY || fromFile?.private_key || fromFile?.privateKey;

  if (privateKey) {
    privateKey = privateKey.replace(/\\n/g, '\n').trim();
  }

  if (!projectId || !privateKey || !clientEmail) {
    throw new Error(
      'Firebase Admin credentials are missing. Add the service account JSON or FIREBASE_* env variables.'
    );
  }

  return { projectId, clientEmail, privateKey };
}

function initializeFirebaseAdmin(): App {
  const existing = getApps()[0];
  if (existing) return existing;

  const { projectId, clientEmail, privateKey } = getCredentials();

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
    projectId,
  });
}

let _adminAuth: Auth | null = null;
let _db: Firestore | null = null;

export function getAdminAuth() {
  if (!_adminAuth) {
    initializeFirebaseAdmin();
    _adminAuth = getAuth();
  }
  return _adminAuth;
}

export function getDb() {
  if (!_db) {
    initializeFirebaseAdmin();
    _db = getFirestore();
  }
  return _db;
}

export const adminAuth = new Proxy({} as Auth, {
  get(_target, prop, _receiver) {
    const value = (getAdminAuth() as unknown as Record<PropertyKey, unknown>)[prop];
    return typeof value === 'function' ? value.bind(getAdminAuth()) : value;
  },
});

export const db = new Proxy({} as Firestore, {
  get(_target, prop) {
    const instance = getDb();
    const value = (instance as unknown as Record<PropertyKey, unknown>)[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});
