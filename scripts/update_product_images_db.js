import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
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

async function updateProduct() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.log("Usage: node update_product_images.js \"Product Name\"");
    process.exit(1);
  }
  
  const productName = args[0];
  
  const q = query(collection(db, "products"), where("name", "==", productName));
  const snapshot = await getDocs(q);
  
  if (!snapshot.empty) {
    const productDoc = snapshot.docs[0];
    console.log("Found product:", productDoc.data().name);
    
    // We assume the folder name in Electronics is exactly the product name
    const basePath = `/images/products/Electronics/${productName}`;
    const images = [
      `${basePath}/front_view.jpg`,
      `${basePath}/right_side_view.jpg`,
      `${basePath}/left_side_view.jpg`,
      `${basePath}/top_view.jpg`,
      `${basePath}/back_view.jpg`
    ];
    
    await updateDoc(doc(db, "products", productDoc.id), {
      thumbnail: images[0],
      images: images
    });
    
    console.log(`Successfully updated images for ${productName}`);
  } else {
    console.log(`Could not find the product by name: ${productName}`);
  }
  process.exit(0);
}

updateProduct().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
