import { initializeApp } from "firebase/app";
import { getFirestore, collection, writeBatch, doc } from "firebase/firestore";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file at the project root
dotenv.config({ path: resolve(__dirname, '../.env') });

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Replaced hardcoded productsData with JSON import

async function seedDatabase() {
  console.log("Starting bulk database seeding...");
  
  try {
    const productsPath = resolve(__dirname, '../data/products.json');
    if (!fs.existsSync(productsPath)) {
      console.error("Products JSON file not found. Please run generateCatalog.js first.");
      process.exit(1);
    }

    const rawData = fs.readFileSync(productsPath, 'utf8');
    const productsData = JSON.parse(rawData);

    const productsRef = collection(db, "products");
    
    // Firestore allows max 500 writes per batch
    const BATCH_SIZE = 450; 
    let currentBatch = writeBatch(db);
    let operationCount = 0;
    let totalAdded = 0;

    for (let i = 0; i < productsData.length; i++) {
      const product = productsData[i];
      const newDocRef = doc(productsRef); // Automatically generates an ID
      
      // Preserve generated ID if we want, or let Firestore generate it. We will use Firestore ID but keep our data consistent.
      // We overwrite product.id with the Firestore ID so they match if queried
      const productToSave = {
        ...product,
        id: newDocRef.id
      };
      
      currentBatch.set(newDocRef, productToSave);
      operationCount++;
      totalAdded++;

      // If we reach batch limit, commit and start a new batch
      if (operationCount >= BATCH_SIZE) {
        await currentBatch.commit();
        console.log(`Committed batch of ${operationCount} products. Total added: ${totalAdded}`);
        currentBatch = writeBatch(db);
        operationCount = 0;
      }
    }
    
    // Commit any remaining items in the last batch
    if (operationCount > 0) {
      await currentBatch.commit();
      console.log(`Committed final batch of ${operationCount} products. Total added: ${totalAdded}`);
    }
    
    console.log(`Successfully seeded ${totalAdded} products!`);
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
