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

async function updateProductImages() {
  const productName = process.argv[2];
  const basePath = process.argv[3];

  if (!productName || !basePath) {
    console.error("Usage: node updateProductImages.js \"Product Name\" \"/base/image/path\"");
    process.exit(1);
  }

  console.log(`Searching for ${productName}...`);
  const q = query(collection(db, "products"), where("name", "==", productName));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    console.log("Could not find the product.");
    process.exit(1);
  }

  const productDoc = snapshot.docs[0];
  
  const newImages = [
    `${basePath}/image-1.png`,
    `${basePath}/image-2.png`,
    `${basePath}/image-3.png`,
    `${basePath}/image-4.png`,
    `${basePath}/image-5.png`
  ];
  
  await updateDoc(doc(db, "products", productDoc.id), {
    thumbnail: newImages[0],
    images: newImages
  });
  
  console.log(`✅ Successfully updated images for ${productDoc.data().name}!`);
  process.exit(0);
}

updateProductImages().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
