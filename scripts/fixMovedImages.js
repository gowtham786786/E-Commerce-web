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

async function fixMovedImages() {
  const productsToUpdate = [
    {
      name: "Microsoft Xbox Wireless Controller",
      basePath: "/images/products/Electronics/microsoft-xbox-wireless-controller"
    },
    {
      name: "Nikon D3500 DSLR Camera",
      basePath: "/images/products/Electronics/nikon-d3500-dslr-camera"
    }
  ];

  for (const item of productsToUpdate) {
    console.log(`Fixing paths for ${item.name}...`);
    const q = query(collection(db, "products"), where("name", "==", item.name));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log(`Could not find ${item.name}.`);
      continue;
    }

    const productDoc = snapshot.docs[0];
    const newImages = [
      `${item.basePath}/image-1.png`,
      `${item.basePath}/image-2.png`,
      `${item.basePath}/image-3.png`,
      `${item.basePath}/image-4.png`,
      `${item.basePath}/image-5.png`
    ];
    
    await updateDoc(doc(db, "products", productDoc.id), {
      thumbnail: newImages[0],
      images: newImages
    });
    
    console.log(`✅ Successfully fixed paths for ${item.name}!`);
  }
  
  process.exit(0);
}

fixMovedImages().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
