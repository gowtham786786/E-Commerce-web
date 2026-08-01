import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, limit, query } from "firebase/firestore";
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkProducts() {
  const q = query(collection(db, "products"), limit(5));
  const snapshot = await getDocs(q);
  
  for (const productDoc of snapshot.docs) {
    const data = productDoc.data();
    console.log(`Product: ${data.name}`);
    console.log(`Thumbnail: ${data.thumbnail}`);
    console.log(`Images: ${JSON.stringify(data.images)}`);
    console.log("---");
  }
  process.exit(0);
}

checkProducts().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
