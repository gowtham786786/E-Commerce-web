import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
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
  const q = query(collection(db, 'products'), where('name', '==', 'Havells Hair Dryer HD3151'));
  const snap = await getDocs(q);
  if (snap.empty) {
    console.log('Product Havells Hair Dryer HD3151 not found in DB');
    process.exit(1);
  }
  const docRef = doc(db, 'products', snap.docs[0].id);
  
  const newImages = [
    '/images/products/Electronics/Havells Hair Dryer HD3151/1.png',
    '/images/products/Electronics/Havells Hair Dryer HD3151/2.png',
    '/images/products/Electronics/Havells Hair Dryer HD3151/3.png'
  ];
  await updateDoc(docRef, {
    thumbnail: newImages[0],
    images: newImages
  });
  console.log('Updated DB with 3 new images successfully!');
  process.exit(0);
}
run();
