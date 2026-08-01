import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";
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

async function updateProducts() {
  console.log("Fetching all products from Firestore...");
  const snapshot = await getDocs(collection(db, "products"));
  
  let count = 0;
  for (const productDoc of snapshot.docs) {
    const data = productDoc.data();
    let updated = false;
    
    let newThumbnail = data.thumbnail;
    if (newThumbnail && newThumbnail.includes('/assets/products/')) {
      newThumbnail = newThumbnail.replace('/assets/products/', '/images/products/');
      updated = true;
    }
    
    let newImages = data.images;
    if (newImages && Array.isArray(newImages)) {
      newImages = newImages.map(img => {
        if (img && img.includes('/assets/products/')) {
          updated = true;
          return img.replace('/assets/products/', '/images/products/');
        }
        return img;
      });
    }
    
    if (updated) {
      await updateDoc(doc(db, "products", productDoc.id), {
        thumbnail: newThumbnail,
        images: newImages
      });
      count++;
      if (count % 10 === 0) console.log(`Updated ${count} products...`);
    }
  }
  
  console.log(`✅ Successfully updated image paths for ${count} products!`);
  process.exit(0);
}

updateProducts().catch(err => {
  console.error("Error updating products:", err);
  process.exit(1);
});
