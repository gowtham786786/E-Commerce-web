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

async function updateIqooImages() {
  const name = "iQOO Z9 Lite 5G";
  const basePath = "/images/products/Electronics/iQOO Z9 Lite 5G";

  console.log(`Fixing paths for ${name}...`);
  // Try finding the exact name
  const q = query(collection(db, "products"), where("name", "==", name));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    console.log(`Could not find ${name}.`);
    process.exit(1);
  }

  const productDoc = snapshot.docs[0];
  const newImages = [
    `${basePath}/image-1.png`,
    `${basePath}/image-2.png`,
    `${basePath}/image-3.png`
  ];
  
  await updateDoc(doc(db, "products", productDoc.id), {
    thumbnail: newImages[0],
    images: newImages
  });
  
  console.log(`✅ Successfully fixed paths for ${name}!`);
  process.exit(0);
}

updateIqooImages().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
