import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getFirestore, initializeFirestore, memoryLocalCache } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import 'dotenv/config';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app;
if (firebaseConfig.projectId) {
  try {
    app = getApp();
  } catch (e) {
    app = initializeApp(firebaseConfig);
  }
} else {
  console.warn("Firebase projectId is not set. Firebase will not be initialized.");
}

const db = app ? initializeFirestore(app, {
  localCache: memoryLocalCache(),
}) : null;

const auth = app ? getAuth(app) : null;

export { db, auth };
