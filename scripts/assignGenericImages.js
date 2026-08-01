import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc, query, where } from "firebase/firestore";
import fs from 'fs';
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

const sourceDir = "C:\\Users\\Admin\\.gemini\\antigravity-ide\\brain\\49467993-a6c9-4614-8ae6-1ec773003689";
const targetDir = path.resolve(__dirname, '../public/images/products/categories');

// Create target directory if it doesn't exist
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const images = {
  audio: "generic_audio_1785577859137.png",
  mobile: "generic_mobile_1785577870422.png",
  laptop: "generic_laptop_1785577881874.png",
  camera: "generic_camera_1785577891607.png",
  tv: "generic_tv_1785577900525.png",
  gaming: "generic_gaming_1785577913551.png",
  accessory: "generic_accessory_1785577925619.png",
  electronics: "generic_electronics_1785577938819.png"
};

// Copy images to public directory
for (const key in images) {
  const sourcePath = path.join(sourceDir, images[key]);
  const targetPath = path.join(targetDir, `${key}.png`);
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, targetPath);
    console.log(`Copied ${key}.png`);
  } else {
    console.log(`Missing source image: ${sourcePath}`);
  }
}

const getCategoryKey = (subCategory) => {
  const sub = subCategory.toLowerCase();
  if (sub.includes('audio') || sub.includes('wearable')) return 'audio';
  if (sub.includes('mobile') || sub.includes('tablet')) return 'mobile';
  if (sub.includes('laptop') || sub.includes('monitor')) return 'laptop';
  if (sub.includes('camera')) return 'camera';
  if (sub.includes('tv') || sub.includes('streaming')) return 'tv';
  if (sub.includes('gaming')) return 'gaming';
  if (sub.includes('accessory') || sub.includes('storage') || sub.includes('mouse') || sub.includes('keyboard')) return 'accessory';
  return 'electronics'; // fallback
};

async function updateProducts() {
  console.log("Fetching electronics products from Firestore...");
  const q = query(collection(db, "products"), where("category", "==", "Electronics"));
  const snapshot = await getDocs(q);
  
  let count = 0;
  for (const productDoc of snapshot.docs) {
    const data = productDoc.data();
    const catKey = getCategoryKey(data.subCategory || '');
    
    // Create an array of 5 identical URLs for the gallery (to replace the blank ones)
    const imgUrl = `/images/products/categories/${catKey}.png`;
    const newImages = Array(5).fill(imgUrl);
    
    await updateDoc(doc(db, "products", productDoc.id), {
      thumbnail: imgUrl,
      images: newImages
    });
    
    count++;
    if (count % 10 === 0) console.log(`Updated ${count} products...`);
  }
  
  console.log(`✅ Successfully updated ${count} products with high-quality generic images!`);
  process.exit(0);
}

updateProducts().catch(err => {
  console.error("Error updating products:", err);
  process.exit(1);
});
