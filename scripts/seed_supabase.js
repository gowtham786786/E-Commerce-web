import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csv from 'csv-parser';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
}
const supabase = createClient(supabaseUrl, supabaseKey);

const DEFAULT_CATEGORIES = [
  { name: 'Electronics', image: 'https://images.unsplash.com/photo-1491933382434-500287f9b54b?auto=format&fit=crop&w=600&q=80', slug: 'electronics' },
  { name: 'Fashion', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80', slug: 'fashion' },
  { name: 'Home & Kitchen', image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80', slug: 'home-kitchen' },
  { name: 'Beauty', image: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=600&q=80', slug: 'beauty' },
  { name: 'Sports', image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=600&q=80', slug: 'sports' },
  { name: 'Accessories', image: 'https://images.unsplash.com/photo-1523206489230-c012c64b2b48?auto=format&fit=crop&w=600&q=80', slug: 'accessories' }
];

const CURATED_SHOWCASE_PRODUCTS = [
  {
    id: 'prod-backpack-01',
    name: 'Minimalist Urban Backpack',
    description: 'Durable, water-resistant daily commuter backpack with dedicated laptop sleeve and ergonomic straps.',
    brand: 'Aerolite',
    category: 'Accessories',
    sub_category: 'Bags',
    price: 49.99,
    discount: 10,
    gst: 18,
    stock: 45,
    sku: 'AERO-BP-01',
    availability_status: 'In Stock',
    featured: true,
    trending: true,
    best_seller: true,
    status: 'published',
    thumbnail: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1546938576-6e6a64f317cc?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.8,
    review_count: 142
  },
  {
    id: 'prod-sneakers-02',
    name: 'Air Velocity Running Shoes',
    description: 'Ultra-lightweight breathable athletic running shoes with responsive cushioning for maximum comfort.',
    brand: 'Stride',
    category: 'Fashion',
    sub_category: 'Footwear',
    price: 89.99,
    discount: 15,
    gst: 18,
    stock: 30,
    sku: 'STR-RUN-02',
    availability_status: 'In Stock',
    featured: true,
    trending: true,
    best_seller: true,
    status: 'published',
    thumbnail: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.9,
    review_count: 220
  },
  {
    id: 'prod-watch-03',
    name: 'Chronograph Classic Watch',
    description: 'Precision quartz movement with stainless steel case and genuine leather strap.',
    brand: 'Aethel',
    category: 'Accessories',
    sub_category: 'Watches',
    price: 129.99,
    discount: 20,
    gst: 18,
    stock: 18,
    sku: 'AETH-CHRO-03',
    availability_status: 'In Stock',
    featured: true,
    trending: false,
    best_seller: true,
    status: 'published',
    thumbnail: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.7,
    review_count: 88
  },
  {
    id: 'prod-coffee-04',
    name: 'Artisan Ceramic Pour-Over Dripper',
    description: 'Handcrafted ceramic coffee brewer designed for rich, flavorful manual pour-over extraction.',
    brand: 'Kaffé',
    category: 'Home & Kitchen',
    sub_category: 'Drinkware',
    price: 34.50,
    discount: 5,
    gst: 12,
    stock: 50,
    sku: 'KAF-POUR-04',
    availability_status: 'In Stock',
    featured: true,
    trending: true,
    best_seller: false,
    status: 'published',
    thumbnail: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.6,
    review_count: 53
  },
  {
    id: 'prod-sunglasses-05',
    name: 'Polarized Aviator Sunglasses',
    description: '100% UV400 polarized optical protection with ultra-light titanium alloy wire frame.',
    brand: 'Solaris',
    category: 'Accessories',
    sub_category: 'Eyewear',
    price: 54.00,
    discount: 10,
    gst: 18,
    stock: 25,
    sku: 'SOL-AVI-05',
    availability_status: 'In Stock',
    featured: true,
    trending: true,
    best_seller: true,
    status: 'published',
    thumbnail: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80'
    ],
    rating: 4.8,
    review_count: 95
  }
];

// Helper to load CSV products
function loadCsvProducts() {
  return new Promise((resolve) => {
    const csvPath = path.resolve(__dirname, '../data/electronics_products_clean.csv');
    if (!fs.existsSync(csvPath)) return resolve([]);
    
    const results = [];
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        const mapped = results.map((row, index) => {
          const inrPrice = parseFloat(row.price) || 999;
          const usdPrice = parseFloat((inrPrice / 93).toFixed(2));
          const ratingVal = parseFloat(row.rating) || 4.2;
          const isBestSeller = row.badge?.toLowerCase().includes('best') || false;
          
          return {
            id: `prod-elec-${index + 1}`,
            name: row.name,
            description: `${row.name} with premium performance and high quality build.`,
            brand: row.name.split(' ')[0] || 'Generic',
            category: 'Electronics',
            sub_category: row.subcategory || 'Gadgets',
            price: usdPrice,
            discount: 10,
            gst: 18,
            stock: 35,
            sku: `ELEC-${index + 100}`,
            availability_status: row.stockStatus || 'In Stock',
            featured: index < 6,
            trending: isBestSeller,
            best_seller: isBestSeller,
            status: 'published',
            thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
            images: [
              'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'
            ],
            rating: ratingVal,
            review_count: Math.floor(Math.random() * 200) + 20
          };
        });
        resolve(mapped);
      });
  });
}

async function seed() {
  console.log('🌱 Seeding Supabase database with initial catalog...');

  // 1. Categories
  const { error: catErr } = await supabase.from('categories').upsert(DEFAULT_CATEGORIES, { onConflict: 'name' });
  if (catErr) {
    console.error('Error inserting categories:', catErr);
  } else {
    console.log(`✅ ${DEFAULT_CATEGORIES.length} categories seeded.`);
  }

  // 2. Products
  const csvProducts = await loadCsvProducts();
  const allProducts = [...CURATED_SHOWCASE_PRODUCTS, ...csvProducts];

  console.log(`Uploading ${allProducts.length} total products to Supabase...`);
  const batchSize = 50;
  for (let i = 0; i < allProducts.length; i += batchSize) {
    const chunk = allProducts.slice(i, i + batchSize);
    const { error: prodErr } = await supabase.from('products').upsert(chunk, { onConflict: 'id' });
    if (prodErr) {
      console.error(`Batch ${i / batchSize + 1} error:`, prodErr);
    } else {
      console.log(`✅ Uploaded batch ${i / batchSize + 1}/${Math.ceil(allProducts.length / batchSize)}`);
    }
  }

  console.log('\n🎉 Supabase seeding complete!');
}

seed();
