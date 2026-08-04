import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = initializeApp({
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
});
const db = getFirestore(app);

async function run() {
  const docRef = doc(db, 'products', '6AeVMfqSqX2OdjNtmFNc');
  const snap = await getDoc(docRef);
  if (!snap.exists()) {
    console.log('Document not found');
    process.exit(1);
  }
  console.log('Current images:', snap.data().images);

  const newImages = [
    '/images/products/Electronics/Fastrack Reflex Play Smartwatch/1.png',
    '/images/products/Electronics/Fastrack Reflex Play Smartwatch/2.png',
    '/images/products/Electronics/Fastrack Reflex Play Smartwatch/3.png',
    '/images/products/Electronics/Fastrack Reflex Play Smartwatch/4.png',
    '/images/products/Electronics/Fastrack Reflex Play Smartwatch/5.png'
  ];
  await updateDoc(docRef, {
    thumbnail: newImages[0],
    images: newImages
  });
  console.log('Updated to new images successfully!');
  process.exit(0);
}
run();
