import { initializeApp } from "firebase/app";
import { getFirestore, collection, writeBatch, doc, getDocs, deleteDoc } from "firebase/firestore";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

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

const seedDatabase = async () => {
  try {
    const productsRef = collection(db, "products");
    
    console.log("Fetching existing products to delete...");
    const snapshot = await getDocs(productsRef);
    console.log(`Found ${snapshot.size} products to delete.`);
    
    // Delete in batches of 500
    const chunks = [];
    let currentChunk = [];
    snapshot.docs.forEach(d => {
      currentChunk.push(d);
      if (currentChunk.length === 500) {
        chunks.push(currentChunk);
        currentChunk = [];
      }
    });
    if (currentChunk.length > 0) chunks.push(currentChunk);

    for (let i = 0; i < chunks.length; i++) {
      const batch = writeBatch(db);
      chunks[i].forEach(d => batch.delete(d.ref));
      await batch.commit();
      console.log(`Deleted chunk ${i + 1}/${chunks.length}`);
    }
    console.log("Successfully wiped existing products.");

    // Upload new catalog
    console.log("Reading professional catalog...");
    const data = JSON.parse(fs.readFileSync('data/deterministic_products.json', 'utf8'));
    const products = data.products;
    
    console.log(`Starting upload of ${products.length} products...`);
    
    const uploadChunks = [];
    let curUpChunk = [];
    products.forEach(p => {
      curUpChunk.push(p);
      if (curUpChunk.length === 500) {
        uploadChunks.push(curUpChunk);
        curUpChunk = [];
      }
    });
    if (curUpChunk.length > 0) uploadChunks.push(curUpChunk);

    for (let i = 0; i < uploadChunks.length; i++) {
      const batch = writeBatch(db);
      uploadChunks[i].forEach(p => {
        // use p.id as the document ID
        const docRef = doc(productsRef, p.id);
        batch.set(docRef, p);
      });
      await batch.commit();
      console.log(`Uploaded chunk ${i + 1}/${uploadChunks.length}`);
    }

    console.log(`✅ Success! ${products.length} professional products uploaded to Firestore.`);
    console.log(`Final Report:`);
    console.log(JSON.stringify(data.report, null, 2));

  } catch (error) {
    console.error("Error seeding database:", error);
  }
};

seedDatabase();
