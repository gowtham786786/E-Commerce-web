import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { electronicsProducts } from '../data/catalog/electronics.js';
import { fashionProducts } from '../data/catalog/fashion.js';
import { homeKitchenProducts } from '../data/catalog/homeKitchen.js';
import { beautyProducts } from '../data/catalog/beauty.js';
import { sportsProducts } from '../data/catalog/sports.js';
import { accessoriesProducts } from '../data/catalog/accessories.js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
}
const supabase = createClient(supabaseUrl, supabaseKey);

const CATEGORIES = [
  { name: 'Electronics', image: '/images/categories/electronics.jpg', slug: 'electronics' },
  { name: 'Fashion', image: '/images/categories/fashion.jpg', slug: 'fashion' },
  { name: 'Home & Kitchen', image: '/images/categories/home-kitchen.jpg', slug: 'home-kitchen' },
  { name: 'Beauty', image: '/images/categories/beauty.jpg', slug: 'beauty' },
  { name: 'Sports', image: '/images/categories/sports.jpg', slug: 'sports' },
  { name: 'Accessories', image: '/images/categories/accessories.jpg', slug: 'accessories' }
];

async function seed() {
  console.log('🚀 Starting Full Catalog Database Seeding...');
  console.log(`Supabase Endpoint: ${supabaseUrl}`);

  // 1. Upsert Categories
  console.log('\n📁 Seeding 6 primary categories...');
  const { error: catErr } = await supabase.from('categories').upsert(CATEGORIES, { onConflict: 'name' });
  if (catErr) {
    console.error('Error seeding categories:', catErr);
  } else {
    console.log('✅ Categories successfully seeded.');
  }

  // 2. Prepare 300 Products
  const allProducts = [
    ...electronicsProducts,
    ...fashionProducts,
    ...homeKitchenProducts,
    ...beautyProducts,
    ...sportsProducts,
    ...accessoriesProducts
  ];

  console.log(`\n📦 Total products to seed: ${allProducts.length}`);
  console.log(`   - Electronics: ${electronicsProducts.length}`);
  console.log(`   - Fashion: ${fashionProducts.length}`);
  console.log(`   - Home & Kitchen: ${homeKitchenProducts.length}`);
  console.log(`   - Beauty: ${beautyProducts.length}`);
  console.log(`   - Sports: ${sportsProducts.length}`);
  console.log(`   - Accessories: ${accessoriesProducts.length}`);

  // Clean old cart and wishlist references to avoid foreign key conflicts
  console.log('\n🧹 Clearing dependent cart & wishlist test items...');
  await supabase.from('cart_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('wishlist_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // Clear existing products
  console.log('🧹 Clearing existing products from database...');
  const { error: delErr } = await supabase.from('products').delete().neq('id', 'none');
  if (delErr) {
    console.warn('Note on delete products:', delErr.message);
  } else {
    console.log('✅ Old products cleared.');
  }

  // 3. Batch Insert All 300 Products
  console.log('\n⬆️  Uploading 300 products in batches...');
  const batchSize = 50;
  for (let i = 0; i < allProducts.length; i += batchSize) {
    const batch = allProducts.slice(i, i + batchSize);
    const categoryName = batch[0]?.category;
    const { error: prodErr } = await supabase.from('products').insert(batch);
    if (prodErr) {
      console.error(`❌ Error uploading ${categoryName} batch:`, prodErr);
    } else {
      console.log(`✅ Uploaded batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allProducts.length / batchSize)}: ${batch.length} ${categoryName} products`);
    }
  }

  // 4. Verification queries
  console.log('\n🔍 Verifying database counts...');
  const { data: countData, error: countErr } = await supabase
    .from('products')
    .select('category');

  if (countErr) {
    console.error('Error verifying counts:', countErr);
    return;
  }

  const categoryCounts = {};
  countData.forEach(p => {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  });

  console.log('📊 Actual products in Supabase:');
  console.table(categoryCounts);
  console.log(`Total items in Supabase: ${countData.length}`);

  console.log('\n🎉 FULL CATALOG SEEDING FINISHED SUCCESSFULLY!');
}

seed().catch(err => {
  console.error('Fatal seed error:', err);
  process.exit(1);
});
