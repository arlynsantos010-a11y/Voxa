import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "dummy_api_key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "dummy_auth_domain",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://dummy-default-rtdb.firebaseio.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "dummy_project_id",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "dummy_bucket",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "dummy_sender",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "dummy_app_id",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Next.js Hot Reload Safe Initialization
let app;
try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
} catch (e) {
  // Ignora el error de inicialización en tiempo de build en Vercel
  app = getApp();
}

// Initialize Realtime Database (the one created in the screenshot)
export const rtdb = getDatabase(app);

// Initialize Firestore (just in case it's activated later)
export const db = getFirestore(app);

export default app;
