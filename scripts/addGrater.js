import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env') });

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

async function addGrater() {
  console.log("Adding Stainless Steel Grater to Firestore...");
  try {
    const productData = {
      name: "Stainless Steel Box Grater",
      description: "High-quality stainless steel box grater with 4-sided design for all your grating needs. Features a comfortable handle and non-slip base.",
      brand: "Home Essentials",
      category: "Home & Kitchen",
      subCategory: "Kitchen Tools",
      price: 15,
      discount: 0,
      gst: 18,
      stock: 100,
      sku: "HE-GRATER-01",
      weight: "300g",
      dimensions: "10x10x24 cm",
      colors: ["Silver", "Black"],
      sizes: ["Standard"],
      tags: ["grater", "kitchen tool", "cooking", "stainless steel"],
      featured: true,
      trending: false,
      bestSeller: true,
      status: "published",
      metaTitle: "Stainless Steel Box Grater - Home & Kitchen",
      metaDescription: "Buy the best stainless steel box grater online. Perfect for cheese, vegetables, and more.",
      thumbnail: "/images/products/grater_front.png",
      images: [
        "/images/products/grater_front.png",
        "/images/products/grater_side.png",
        "/images/products/grater_top.png",
        "/images/products/grater_back.png",
        "/images/products/grater_close.png"
      ],
      availabilityStatus: "In Stock",
      rating: 4.8,
      reviewCount: 15,
      soldCount: 45,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, "products"), productData);
    console.log(`✅ Successfully added Grater with ID: ${docRef.id}`);
    process.exit(0);
  } catch (error) {
    console.error("Error adding product:", error);
    process.exit(1);
  }
}

addGrater();
