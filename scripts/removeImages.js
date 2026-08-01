import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc, query, where } from "firebase/firestore";
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

async function removeImages() {
  console.log("Fetching electronics products to remove images...");
  const q = query(collection(db, "products"), where("category", "==", "Electronics"));
  const snapshot = await getDocs(q);
  
  let count = 0;
  for (const productDoc of snapshot.docs) {
    await updateDoc(doc(db, "products", productDoc.id), {
      thumbnail: "",
      images: []
    });
    count++;
  }
  
  console.log(`✅ Successfully removed images from ${count} products.`);
  process.exit(0);
}

removeImages().catch(err => {
  console.error("Error removing images:", err);
  process.exit(1);
});
