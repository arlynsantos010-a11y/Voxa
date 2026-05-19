import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get } from "firebase/database";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const rtdb = getDatabase(app);

async function testFirebase() {
  try {
    console.log("Config keys:", Object.keys(firebaseConfig));
    const testRef = ref(rtdb, "users_test");
    await set(testRef, { test_user: { username: "test_user", role: "admin" } });
    console.log("Set successful");
    const snapshot = await get(testRef);
    console.log("Get successful:", snapshot.val());
  } catch (err) {
    console.error("Firebase error details:", err);
  } finally {
    process.exit(0);
  }
}

testFirebase();
