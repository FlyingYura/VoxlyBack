import { NextRequest } from 'next/server';
import { adminAuth } from './firebase-admin';

export async function verifyFirebaseToken(req: NextRequest): Promise<string | null>;
export async function verifyFirebaseToken(token: string): Promise<string | null>;
export async function verifyFirebaseToken(reqOrToken: NextRequest | string): Promise<string | null> {
  try {
    let token: string;
    
    if (typeof reqOrToken === 'string') {
      token = reqOrToken;
    } else {
      const authHeader = reqOrToken.headers.get('authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
      }

      token = authHeader.split('Bearer ')[1];
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    
    return decodedToken.uid;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

