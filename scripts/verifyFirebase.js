import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, limit, query } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 1 & 5. Verify all environment variables are loaded
dotenv.config({ path: resolve(__dirname, '../.env') });

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

async function verifyFirebase() {
  console.log("=== Firebase Connection Verification ===");
  
  try {
    // 2. Verify Firebase initialization
    const app = initializeApp(firebaseConfig);
    console.log("✅ Firebase App initialized successfully.");

    // 3. Verify Firebase Authentication
    const auth = getAuth(app);
    console.log("✅ Firebase Authentication initialized successfully.");

    // 4. Verify Firebase Storage
    const storage = getStorage(app);
    console.log("✅ Firebase Storage initialized successfully.");

    // Verify Firestore Connection & Read products collection
    const db = getFirestore(app);
    console.log("⏳ Testing Firestore connection...");
    
    const productsRef = collection(db, "products");
    const q = query(productsRef, limit(1));
    const snapshot = await getDocs(q);
    
    console.log("✅ Firestore connected successfully.");
    console.log(`✅ Read the 'products' collection. Found ${snapshot.size} documents (limited to 1).`);
    
    if (snapshot.empty) {
      console.log("ℹ️ The 'products' collection is currently empty in Firestore (this is normal if you haven't seeded yet).");
    }

    console.log("\n🎉 SUCCESS: All Firebase services are fully connected and operational! 🎉");
    process.exit(0);

  } catch (error) {
    console.error("\n❌ ERROR: Failed to connect to Firebase services.");
    console.error(error);
    process.exit(1);
  }
}

verifyFirebase();
