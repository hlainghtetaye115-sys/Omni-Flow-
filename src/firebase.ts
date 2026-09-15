import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  signInWithCredential,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously
} from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const firestoreOpts = { experimentalForceLongPolling: true, ignoreUndefinedProperties: true };
export const db = (firebaseConfig as any).firestoreDatabaseId 
  ? initializeFirestore(app, firestoreOpts, (firebaseConfig as any).firestoreDatabaseId)
  : initializeFirestore(app, firestoreOpts);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.warn("Firebase Google Sign-In failed:", error?.message || error);
    throw error;
  }
};

/**
 * Sign in or create an account with any Email / Gmail and password in Firebase Auth.
 */
export const signInWithFirebaseEmail = async (email: string, password: string) => {
  const pwd = password.trim();
  if (!email.trim() || pwd.length < 6) {
    throw new Error('A valid email and a password of at least 6 characters are required.');
  }
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, pwd);
    return userCredential.user;
  } catch (error: any) {
    if (error?.code === 'auth/user-not-found' || error?.code === 'auth/invalid-credential') {
      try {
        const newCredential = await createUserWithEmailAndPassword(auth, email, pwd);
        return newCredential.user;
      } catch (createErr) {
        throw createErr;
      }
    }
    throw error;
  }
};

export const signInFirebaseAnonymously = async () => {
  try {
    const userCredential = await signInAnonymously(auth);
    return userCredential.user;
  } catch (error) {
    console.warn("Anonymous sign-in notice:", error);
    throw error;
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};



export const signInWithGoogleCredential = async (accessToken: string) => {
  try {
    const credential = GoogleAuthProvider.credential(null, accessToken);
    const result = await signInWithCredential(auth, credential);
    return result.user;
  } catch (error) {
    console.error("Error signing in with credential:", error);
    throw error;
  }
};
