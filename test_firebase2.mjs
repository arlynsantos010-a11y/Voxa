import { initializeApp } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBJhMQHabjINkaAO7E6nc9nzT3xcWolNRA",
  authDomain: "voxa-bb5c7.firebaseapp.com",
  databaseURL: "https://voxa-bb5c7-default-rtdb.firebaseio.com",
  projectId: "voxa-bb5c7",
  storageBucket: "voxa-bb5c7.firebasestorage.app",
  messagingSenderId: "617434803286",
  appId: "1:617434803286:web:a1869139979afb2c3bdff7",
  measurementId: "G-V4T96W23WQ"
};

const app = initializeApp(firebaseConfig);
const rtdb = getDatabase(app);

const users = [
  { username: "admin", password: "admin123", role: "admin" },
  { username: "profesor", password: "12345", role: "professor" },
  { username: "estudiante", password: "12345", role: "student", languages: ["Inglés", "Francés"], level: "B2" },
  { username: "AdminMaster", password: "AdminPassword123", role: "admin" },
  { username: "profe2", password: "abc", role: "professor" },
  { username: "Ana Torres", password: "password", role: "student", languages: ["Francés"], level: "A1" },
  { username: "Carlos Gomez", password: "password", role: "student", languages: ["Alemán", "Italiano"], level: "B1" },
];

const sanitizeKey = (key) => key.replace(/[.#$\[\]]/g, "_");

async function seedFirebase() {
  try {
    const promises = users.map(u => {
      const uRef = ref(rtdb, `users/${sanitizeKey(u.username)}`);
      return set(uRef, u);
    });
    await Promise.all(promises);
    console.log("Seeding successful");
  } catch (err) {
    console.error("Firebase error details:", err);
  } finally {
    process.exit(0);
  }
}

seedFirebase();
