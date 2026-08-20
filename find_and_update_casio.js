import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
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

async function findAndUpdate() {
  try {
    const q = query(collection(db, "products"), where("name", "==", "Casio Digital Watch F-91W"));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('No matching product found.');
      process.exit(1);
    }
    
    for (const document of querySnapshot.docs) {
      const productRef = doc(db, 'products', document.id);
      
      const newImages = [
        '/images/products/Electronics/Casio Digital Watch F-91W/1.jpg',
        '/images/products/Electronics/Casio Digital Watch F-91W/2.jpg',
        '/images/products/Electronics/Casio Digital Watch F-91W/3.jpg',
        '/images/products/Electronics/Casio Digital Watch F-91W/4.jpg',
        '/images/products/Electronics/Casio Digital Watch F-91W/5.jpg'
      ];
      
      await updateDoc(productRef, {
        images: newImages,
        thumbnail: newImages[0]
      });
      console.log(`Successfully updated product ${document.id} images`);
    }
    
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
findAndUpdate();
