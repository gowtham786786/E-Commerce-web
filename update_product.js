import { initializeApp } from "firebase/app";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import dotenv from 'dotenv';
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

async function update() {
  try {
    const productRef = doc(db, 'products', '002a9398-9d08-4395-9c4c-af18d4e693da');
    await updateDoc(productRef, {
      images: [
        '/images/products/grater_front.png',
        '/images/products/grater_side.png',
        '/images/products/grater_top.png',
        '/images/products/grater_back.png',
        '/images/products/grater_close.png'
      ]
    });
    console.log('Successfully updated product images');
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
update();
