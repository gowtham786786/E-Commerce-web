import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, writeBatch } from "firebase/firestore";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env') });

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

async function clearProducts() {
  console.log("Starting deletion of all products in Firestore...");
  try {
    const productsRef = collection(db, "products");
    const snapshot = await getDocs(productsRef);
    
    if (snapshot.empty) {
      console.log("Collection is already empty.");
      process.exit(0);
    }

    console.log(`Found ${snapshot.size} products to delete. Proceeding in batches...`);
    
    let batch = writeBatch(db);
    let count = 0;
    let totalDeleted = 0;

    for (const doc of snapshot.docs) {
      batch.delete(doc.ref);
      count++;
      totalDeleted++;

      if (count === 400) {
        await batch.commit();
        console.log(`Deleted 400 products...`);
        batch = writeBatch(db);
        count = 0;
      }
    }

    if (count > 0) {
      await batch.commit();
      console.log(`Deleted final ${count} products.`);
    }

    console.log(`✅ Successfully deleted all ${totalDeleted} products!`);
    process.exit(0);
  } catch (error) {
    console.error("Error clearing collection:", error);
    process.exit(1);
  }
}

clearProducts();
