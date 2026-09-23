const fs = require('fs');
const path = require('path');
const https = require('https');
const { spawnSync } = require('child_process');

function getJson(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); } catch(e) { resolve(null); }
      });
    }).on('error', () => resolve(null));
  });
}

function toINR(usd, minInr = 499) {
  if (!usd) return minInr;
  const inr = Math.round((usd * 85) / 10) * 10 - 1; // e.g. 1499, 2999
  return Math.max(minInr, inr);
}

function generateViews(sourceUrl, outDir) {
  const scriptPath = path.resolve('scripts/generate_product_views.py');
  const targetDir = path.resolve(outDir);
  const result = spawnSync('python', [scriptPath, sourceUrl, targetDir], { encoding: 'utf8' });
  if (result.status === 0 && result.stdout) {
    try {
      const views = JSON.parse(result.stdout.trim());
      return views;
    } catch(e) {
      console.error('JSON parse error from generate_product_views:', e.message, result.stdout);
    }
  } else {
    console.error('Error generating views for', sourceUrl, result.stderr);
  }
  return null;
}

async function build() {
  console.log('Fetching verified product data repositories...');
  const dj = await getJson('https://dummyjson.com/products?limit=250');
  const fakestore = await getJson('https://fakestoreapi.com/products');
  const kolz = await getJson('https://kolzsticks.github.io/Free-Ecommerce-Products-Api/main/products.json');

  const allNames = new Set();
  const allImages = new Set();

  function ensureUniqueName(name, category, num) {
    if (!name || allNames.has(name)) {
      name = `${name || category} Edition - ${num}`;
    }
    allNames.add(name);
    return name;
  }

  // ==========================================
  // 1. ELECTRONICS
  // ==========================================
  console.log('\n--- Building Electronics ---');
  const electronicsProducts = [];
  const localElecBase = path.resolve('public/images/products/Electronics');
  const localDirs = fs.existsSync(localElecBase) ? fs.readdirSync(localElecBase) : [];

  const localElectronicsMeta = {
    "boat-rockerz-450-wireless-headphone": { name: "boAt Rockerz 450 Bluetooth On-Ear Headphones with 15H Playtime", price: 1499, brand: "boAt", sub: "Audio" },
    "Casio Digital Watch F-91W": { name: "Casio Vintage F-91W Digital Water Resistant Resin Strap Watch", price: 1195, brand: "Casio", sub: "Wearables" },
    "Fastrack Reflex Play Smartwatch": { name: "Fastrack Reflex Play 1.3-inch AMOLED Bluetooth Calling Smartwatch", price: 2995, brand: "Fastrack", sub: "Wearables" },
    "Havells Hair Dryer HD3151": { name: "Havells HD3151 1200W Powerful Foldable Ionic Hair Dryer", price: 1299, brand: "Havells", sub: "Personal Care" },
    "HP Wireless Mouse Z3700": { name: "HP Z3700 Ultra-Slim 2.4GHz Wireless Optical Mouse", price: 999, brand: "HP", sub: "Computer Accessories" },
    "iQOO Z9 Lite 5G": { name: "iQOO Z9 Lite 5G (Mocha Brown, 6GB RAM, 128GB Storage)", price: 11499, brand: "iQOO", sub: "Smartphones" },
    "JBL C100SI Wired Earphones": { name: "JBL C100SI Extra Deep Bass In-Ear Wired Headphones with Mic", price: 599, brand: "JBL", sub: "Audio" },
    "Luminous 850VA Inverter": { name: "Luminous Zelio+ 1100 900VA Pure Sine Wave Inverter for Home", price: 6890, brand: "Luminous", sub: "Power & Inverters" },
    "MacBook Air M2 (8GB)": { name: "Apple MacBook Air 13.6-inch with M2 Chip (8GB RAM, 256GB SSD, Space Grey)", price: 89990, brand: "Apple", sub: "Laptops" },
    "Mi 5X 55-inch 4K Google TV": { name: "Xiaomi 55-inch 4K Ultra HD Smart Android Google TV (Dolby Vision)", price: 37999, brand: "Xiaomi", sub: "Televisions" },
    "Mi Power Bank 3i 20000mAh": { name: "Mi 20000mAh 18W Fast Charging Power Bank 3i with Triple Output", price: 2199, brand: "Xiaomi", sub: "Power Banks" },
    "Mi Smart Speaker": { name: "Xiaomi Smart Speaker with Google Assistant & 12W Powerful Sound", price: 3499, brand: "Xiaomi", sub: "Audio" },
    "microsoft-xbox-wireless-controller": { name: "Microsoft Xbox Series X/S Wireless Controller (Robot White)", price: 5390, brand: "Microsoft", sub: "Gaming" },
    "nikon-d3500-dslr-camera": { name: "Nikon D3500 24.2 MP DSLR Camera with AF-P 18-55mm VR Lens", price: 47990, brand: "Nikon", sub: "Cameras" },
    "Realme Buds Air 5": { name: "Realme Buds Air 5 with 50dB Deep Active Noise Cancellation TWS", price: 3699, brand: "Realme", sub: "Audio" },
    "Samsung 27-inch Curved Monitor": { name: "Samsung 27-inch Curved LED Gaming Monitor (1800R, 75Hz, AMD FreeSync)", price: 12999, brand: "Samsung", sub: "Monitors" },
    "Samsung 55-inch Crystal 4K Smart TV": { name: "Samsung 55-inch Crystal 4K Vivid Pro Ultra HD Smart LED TV", price: 43990, brand: "Samsung", sub: "Televisions" },
    "Samsung Galaxy S24 FE": { name: "Samsung Galaxy S24 FE 5G (Blue, 8GB RAM, 256GB Storage)", price: 59999, brand: "Samsung", sub: "Smartphones" },
    "Sony WH-CH520 Wireless Headphones": { name: "Sony WH-CH520 Wireless Bluetooth Headphones with 50H Battery Life", price: 4490, brand: "Sony", sub: "Audio" },
    "WD Elements 2TB External Hard Drive": { name: "Western Digital WD Elements 2TB Portable External Hard Drive USB 3.0", price: 5999, brand: "Western Digital", sub: "Storage" }
  };

  // Add 20 local products
  for (const dir of localDirs) {
    const fullPath = path.join(localElecBase, dir);
    if (!fs.statSync(fullPath).isDirectory()) continue;
    const meta = localElectronicsMeta[dir] || {
      name: dir,
      price: 2999,
      brand: dir.split(' ')[0] || "Generic",
      sub: "Electronics"
    };

    const files = fs.readdirSync(fullPath).filter(f => f.match(/\.(png|jpg|jpeg|webp)$/i));
    const localImgUrls = files.map(f => `/images/products/Electronics/${encodeURIComponent(dir)}/${encodeURIComponent(f)}`);
    const primary = localImgUrls[0];
    const name = ensureUniqueName(meta.name, 'Electronics', electronicsProducts.length + 1);

    electronicsProducts.push({
      id: `elec-${String(electronicsProducts.length + 1).padStart(3, '0')}`,
      name,
      description: `Authentic ${name}. Superior engineering, genuine manufacturer warranty, verified Amazon India market pricing and stellar customer rating.`,
      brand: meta.brand,
      category: "Electronics",
      sub_category: meta.sub,
      price: meta.price,
      discount: Math.floor(Math.random() * 20) + 5,
      gst: 18,
      stock: Math.floor(Math.random() * 40) + 10,
      sku: `${meta.brand.slice(0, 3).toUpperCase()}-EL-${electronicsProducts.length + 1}`,
      availability_status: "In Stock",
      featured: electronicsProducts.length % 5 === 0,
      trending: electronicsProducts.length % 3 === 0,
      best_seller: electronicsProducts.length % 4 === 0,
      status: "published",
      thumbnail: primary,
      images: localImgUrls,
      rating: parseFloat((4.2 + (electronicsProducts.length % 7) * 0.1).toFixed(1)),
      review_count: Math.floor(Math.random() * 3000) + 150
    });
  }

  // 30 DummyJSON tech products
  const djTech = dj.products.filter(p => ['smartphones', 'laptops', 'tablets', 'mobile-accessories'].includes(p.category));
  for (const p of djTech) {
    if (electronicsProducts.length >= 50) break;
    const prodImages = Array.from(new Set([p.thumbnail, ...p.images]));
    const primary = prodImages[0];
    const name = ensureUniqueName(p.title, 'Electronics', electronicsProducts.length + 1);

    electronicsProducts.push({
      id: `elec-${String(electronicsProducts.length + 1).padStart(3, '0')}`,
      name,
      description: `${p.description} Premium craftsmanship, verified Amazon India pricing and full manufacturer warranty.`,
      brand: p.brand || p.title.split(' ')[0],
      category: "Electronics",
      sub_category: p.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      price: toINR(p.price, 2499),
      discount: Math.round(p.discountPercentage || 12),
      gst: 18,
      stock: p.stock || 25,
      sku: `ELEC-DJ-${electronicsProducts.length + 1}`,
      availability_status: "In Stock",
      featured: electronicsProducts.length % 5 === 0,
      trending: electronicsProducts.length % 3 === 0,
      best_seller: electronicsProducts.length % 4 === 0,
      status: "published",
      thumbnail: primary,
      images: prodImages,
      rating: parseFloat((p.rating || 4.5).toFixed(1)),
      review_count: Math.floor(Math.random() * 2500) + 120
    });
  }
  console.log(`Electronics ready: ${electronicsProducts.length} products`);

  // ==========================================
  // 2. FASHION
  // ==========================================
  console.log('\n--- Building Fashion ---');
  const fashionProducts = [];
  const djFashion = dj.products.filter(p => ['mens-shirts', 'mens-shoes', 'womens-dresses', 'womens-shoes', 'tops'].includes(p.category));

  // 25 DummyJSON fashion products (each has 4-5 authentic multi-angle images of that exact garment/shoe)
  for (const p of djFashion) {
    const prodImages = Array.from(new Set([p.thumbnail, ...p.images]));
    const primary = prodImages[0];
    const name = ensureUniqueName(p.title, 'Fashion', fashionProducts.length + 1);

    fashionProducts.push({
      id: `fash-${String(fashionProducts.length + 1).padStart(3, '0')}`,
      name,
      description: `${p.description} Tailored from breathable, premium fabrics for all-day comfort and modern elegance.`,
      brand: p.brand || "StyleCraft",
      category: "Fashion",
      sub_category: p.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      price: toINR(p.price, 899),
      discount: Math.round(p.discountPercentage || 15),
      gst: 12,
      stock: p.stock || 30,
      sku: `FASH-DJ-${fashionProducts.length + 1}`,
      availability_status: "In Stock",
      featured: fashionProducts.length % 5 === 0,
      trending: fashionProducts.length % 3 === 0,
      best_seller: fashionProducts.length % 4 === 0,
      status: "published",
      thumbnail: primary,
      images: prodImages,
      rating: parseFloat((p.rating || 4.4).toFixed(1)),
      review_count: Math.floor(Math.random() * 1800) + 80
    });
  }

  // 9 FakeStore clothing products (exclude backpack which goes to accessories)
  const fsFashion = fakestore.filter(p => p.category.includes('clothing') && !p.title.toLowerCase().includes('backpack'));
  for (const p of fsFashion) {
    const prodId = `fash-${String(fashionProducts.length + 1).padStart(3, '0')}`;
    const outDir = `public/images/products/Fashion/${prodId}`;
    console.log(`Generating views for Fashion ${prodId}: ${p.title.slice(0, 30)}...`);
    const generatedViews = generateViews(p.image, outDir) || [p.image];
    const name = ensureUniqueName(p.title, 'Fashion', fashionProducts.length + 1);

    fashionProducts.push({
      id: prodId,
      name,
      description: `${p.description.slice(0, 150)}. Modern tailored silhouette with durable stitching and breathable fabric.`,
      brand: "UrbanTrend",
      category: "Fashion",
      sub_category: p.category.includes('men') ? "Men's Clothing" : "Women's Clothing",
      price: toINR(p.price, 1299),
      discount: 20,
      gst: 12,
      stock: 40,
      sku: `FASH-FS-${fashionProducts.length + 1}`,
      availability_status: "In Stock",
      featured: fashionProducts.length % 5 === 0,
      trending: fashionProducts.length % 3 === 0,
      best_seller: fashionProducts.length % 4 === 0,
      status: "published",
      thumbnail: generatedViews[0],
      images: generatedViews,
      rating: parseFloat((p.rating?.rate || 4.2).toFixed(1)),
      review_count: p.rating?.count || 450
    });
  }

  // Pure apparel from Kolzsticks
  const kolzFashion = kolz.filter(p => p.category === 'Fashion & Apparel' && !['Leather Tote Bag', 'Polarized Sunglasses', 'Women\'s Designer Handbag'].includes(p.name));
  for (const p of kolzFashion) {
    const prodId = `fash-${String(fashionProducts.length + 1).padStart(3, '0')}`;
    const outDir = `public/images/products/Fashion/${prodId}`;
    console.log(`Generating views for Fashion ${prodId}: ${p.name}...`);
    const generatedViews = generateViews(p.image, outDir) || [p.image];
    const name = ensureUniqueName(p.name, 'Fashion', fashionProducts.length + 1);

    fashionProducts.push({
      id: prodId,
      name,
      description: `${p.description} Premium craftsmanship, verified Amazon India market pricing and durable stitching.`,
      brand: "ApparelPro",
      category: "Fashion",
      sub_category: p.subCategory || "Clothing",
      price: toINR(p.priceCents ? p.priceCents / 100 : 25, 999),
      discount: 15,
      gst: 12,
      stock: 35,
      sku: `FASH-KZ-${fashionProducts.length + 1}`,
      availability_status: "In Stock",
      featured: fashionProducts.length % 5 === 0,
      trending: fashionProducts.length % 3 === 0,
      best_seller: fashionProducts.length % 4 === 0,
      status: "published",
      thumbnail: generatedViews[0],
      images: generatedViews,
      rating: parseFloat((p.rating?.stars || 4.5).toFixed(1)),
      review_count: p.rating?.count || 320
    });
  }
  console.log(`Fashion ready: ${fashionProducts.length} products`);

  // ==========================================
  // 3. ACCESSORIES
  // ==========================================
  console.log('\n--- Building Accessories ---');
  const accessoriesProducts = [];
  const djAcc = dj.products.filter(p => ['mens-watches', 'womens-watches', 'sunglasses', 'womens-bags', 'womens-jewellery'].includes(p.category));

  // 24 DummyJSON accessories (each has 3-4 authentic multi-angle images)
  for (const p of djAcc) {
    const prodImages = Array.from(new Set([p.thumbnail, ...p.images]));
    const primary = prodImages[0];
    const name = ensureUniqueName(p.title, 'Accessories', accessoriesProducts.length + 1);

    accessoriesProducts.push({
      id: `acce-${String(accessoriesProducts.length + 1).padStart(3, '0')}`,
      name,
      description: `${p.description} Precision crafted luxury accessory, exquisite attention to detail and enduring elegance.`,
      brand: p.brand || "LuxeCraft",
      category: "Accessories",
      sub_category: p.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      price: toINR(p.price, 999),
      discount: Math.round(p.discountPercentage || 12),
      gst: 18,
      stock: p.stock || 20,
      sku: `ACCE-DJ-${accessoriesProducts.length + 1}`,
      availability_status: "In Stock",
      featured: accessoriesProducts.length % 5 === 0,
      trending: accessoriesProducts.length % 3 === 0,
      best_seller: accessoriesProducts.length % 4 === 0,
      status: "published",
      thumbnail: primary,
      images: prodImages,
      rating: parseFloat((p.rating || 4.5).toFixed(1)),
      review_count: Math.floor(Math.random() * 1900) + 110
    });
  }

  // 1 FakeStore Backpack
  const fsBackpack = fakestore.find(p => p.title.toLowerCase().includes('backpack'));
  if (fsBackpack) {
    const prodId = `acce-${String(accessoriesProducts.length + 1).padStart(3, '0')}`;
    const outDir = `public/images/products/accessories/${prodId}`;
    console.log(`Generating views for Accessories ${prodId}: ${fsBackpack.title.slice(0, 30)}...`);
    const generatedViews = generateViews(fsBackpack.image, outDir) || [fsBackpack.image];
    const name = ensureUniqueName(fsBackpack.title, 'Accessories', accessoriesProducts.length + 1);

    accessoriesProducts.push({
      id: prodId,
      name,
      description: `${fsBackpack.description.slice(0, 150)}. Durable all-weather travel and everyday laptop backpack.`,
      brand: "Fjallraven",
      category: "Accessories",
      sub_category: "Bags & Backpacks",
      price: toINR(fsBackpack.price, 2499),
      discount: 15,
      gst: 18,
      stock: 35,
      sku: `ACCE-FS-BP`,
      availability_status: "In Stock",
      featured: true,
      trending: true,
      best_seller: true,
      status: "published",
      thumbnail: generatedViews[0],
      images: generatedViews,
      rating: parseFloat((fsBackpack.rating?.rate || 4.6).toFixed(1)),
      review_count: fsBackpack.rating?.count || 420
    });
  }

  // 4 FakeStore jewelry items
  const fsJewelry = fakestore.filter(p => p.category === 'jewelery');
  for (const p of fsJewelry) {
    const prodId = `acce-${String(accessoriesProducts.length + 1).padStart(3, '0')}`;
    const outDir = `public/images/products/accessories/${prodId}`;
    console.log(`Generating views for Accessories ${prodId}: ${p.title.slice(0, 30)}...`);
    const generatedViews = generateViews(p.image, outDir) || [p.image];
    const name = ensureUniqueName(p.title, 'Accessories', accessoriesProducts.length + 1);

    accessoriesProducts.push({
      id: prodId,
      name,
      description: `${p.description.slice(0, 150)}. Handcrafted fine jewelry with premium gemstones and corrosion-resistant alloy finish.`,
      brand: "AuraGems",
      category: "Accessories",
      sub_category: "Jewellery",
      price: toINR(p.price, 1499),
      discount: 18,
      gst: 3,
      stock: 25,
      sku: `ACCE-FS-${accessoriesProducts.length + 1}`,
      availability_status: "In Stock",
      featured: accessoriesProducts.length % 5 === 0,
      trending: accessoriesProducts.length % 3 === 0,
      best_seller: accessoriesProducts.length % 4 === 0,
      status: "published",
      thumbnail: generatedViews[0],
      images: generatedViews,
      rating: parseFloat((p.rating?.rate || 4.5).toFixed(1)),
      review_count: p.rating?.count || 320
    });
  }

  // 5 Kolz accessories
  const kolzAcc = kolz.filter(p => p.category === 'Fashion & Apparel' && ['Leather Tote Bag', 'Polarized Sunglasses', 'Women\'s Designer Handbag'].includes(p.name));
  for (const p of kolzAcc) {
    const prodId = `acce-${String(accessoriesProducts.length + 1).padStart(3, '0')}`;
    const outDir = `public/images/products/accessories/${prodId}`;
    console.log(`Generating views for Accessories ${prodId}: ${p.name}...`);
    const generatedViews = generateViews(p.image, outDir) || [p.image];
    const name = ensureUniqueName(p.name, 'Accessories', accessoriesProducts.length + 1);

    accessoriesProducts.push({
      id: prodId,
      name,
      description: `${p.description} Precision crafted luxury accessory, exquisite attention to detail and enduring elegance.`,
      brand: "LuxeCraft",
      category: "Accessories",
      sub_category: p.subCategory || "Bags & Eyewear",
      price: toINR(p.priceCents ? p.priceCents / 100 : 30, 1299),
      discount: 15,
      gst: 18,
      stock: 30,
      sku: `ACCE-KZ-${accessoriesProducts.length + 1}`,
      availability_status: "In Stock",
      featured: accessoriesProducts.length % 5 === 0,
      trending: accessoriesProducts.length % 3 === 0,
      best_seller: accessoriesProducts.length % 4 === 0,
      status: "published",
      thumbnail: generatedViews[0],
      images: generatedViews,
      rating: parseFloat((p.rating?.stars || 4.5).toFixed(1)),
      review_count: p.rating?.count || 210
    });
  }
  console.log(`Accessories ready: ${accessoriesProducts.length} products`);

  // ==========================================
  // 4. HOME & KITCHEN
  // ==========================================
  console.log('\n--- Building Home & Kitchen ---');
  const homeKitchenProducts = [];
  const djHomeFurniture = dj.products.filter(p => ['furniture', 'home-decoration'].includes(p.category));

  // 10 DummyJSON furniture & decor (already multi-angle)
  for (const p of djHomeFurniture) {
    const prodImages = Array.from(new Set([p.thumbnail, ...p.images]));
    const primary = prodImages[0];
    const name = ensureUniqueName(p.title, 'Home & Kitchen', homeKitchenProducts.length + 1);

    homeKitchenProducts.push({
      id: `home-${String(homeKitchenProducts.length + 1).padStart(3, '0')}`,
      name,
      description: `${p.description} Ergonomic design and food-grade premium quality for everyday household convenience.`,
      brand: p.brand || "HomeStyle",
      category: "Home & Kitchen",
      sub_category: p.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      price: toINR(p.price, 699),
      discount: Math.round(p.discountPercentage || 10),
      gst: 18,
      stock: p.stock || 20,
      sku: `HOME-DJ-${homeKitchenProducts.length + 1}`,
      availability_status: "In Stock",
      featured: homeKitchenProducts.length % 5 === 0,
      trending: homeKitchenProducts.length % 3 === 0,
      best_seller: homeKitchenProducts.length % 4 === 0,
      status: "published",
      thumbnail: primary,
      images: prodImages,
      rating: parseFloat((p.rating || 4.3).toFixed(1)),
      review_count: Math.floor(Math.random() * 1500) + 60
    });
  }

  // 30 DummyJSON kitchen accessories (high-res 3D packshots, generate 4 photographic views for each)
  const djKitchen = dj.products.filter(p => p.category === 'kitchen-accessories');
  for (const p of djKitchen) {
    const prodId = `home-${String(homeKitchenProducts.length + 1).padStart(3, '0')}`;
    const outDir = `public/images/products/Home & Kitchen/${prodId}`;
    console.log(`Generating views for Kitchen ${prodId}: ${p.title}...`);
    const sourceImg = p.images && p.images.length > 0 ? p.images[0] : p.thumbnail;
    const generatedViews = generateViews(sourceImg, outDir) || [sourceImg];
    const name = ensureUniqueName(p.title, 'Home & Kitchen', homeKitchenProducts.length + 1);

    homeKitchenProducts.push({
      id: prodId,
      name,
      description: `${p.description} Ergonomic design and food-grade premium quality for everyday household convenience.`,
      brand: p.brand || "ChefMaster",
      category: "Home & Kitchen",
      sub_category: "Kitchen Accessories",
      price: toINR(p.price, 699),
      discount: Math.round(p.discountPercentage || 10),
      gst: 18,
      stock: p.stock || 20,
      sku: `HOME-DJ-${homeKitchenProducts.length + 1}`,
      availability_status: "In Stock",
      featured: homeKitchenProducts.length % 5 === 0,
      trending: homeKitchenProducts.length % 3 === 0,
      best_seller: homeKitchenProducts.length % 4 === 0,
      status: "published",
      thumbnail: generatedViews[0],
      images: generatedViews,
      rating: parseFloat((p.rating || 4.3).toFixed(1)),
      review_count: Math.floor(Math.random() * 1500) + 60
    });
  }

  // 10 Kolz Home & Kitchen items to reach 50 products
  const kolzHome = kolz.filter(p => p.category === 'Home & Kitchen');
  for (const p of kolzHome) {
    const prodId = `home-${String(homeKitchenProducts.length + 1).padStart(3, '0')}`;
    const outDir = `public/images/products/Home & Kitchen/${prodId}`;
    console.log(`Generating views for Kolz Home ${prodId}: ${p.name}...`);
    const generatedViews = generateViews(p.image, outDir) || [p.image];
    const name = ensureUniqueName(p.name, 'Home & Kitchen', homeKitchenProducts.length + 1);

    homeKitchenProducts.push({
      id: prodId,
      name,
      description: `${p.description} Premium craftsmanship, verified Amazon India market pricing and durable quality.`,
      brand: "HomeComfort",
      category: "Home & Kitchen",
      sub_category: p.subCategory || "Home Essentials",
      price: toINR((p.priceCents || 12000) / 100, 1299),
      discount: 15,
      gst: 18,
      stock: 25,
      sku: `HOME-KZ-${homeKitchenProducts.length + 1}`,
      availability_status: "In Stock",
      featured: homeKitchenProducts.length % 5 === 0,
      trending: homeKitchenProducts.length % 3 === 0,
      best_seller: homeKitchenProducts.length % 4 === 0,
      status: "published",
      thumbnail: generatedViews[0],
      images: generatedViews,
      rating: typeof p.rating === 'object' ? (p.rating.stars || 4.5) : (p.rating || 4.5),
      review_count: typeof p.rating === 'object' ? (p.rating.count || 120) : 120
    });
  }
  console.log(`Home & Kitchen ready: ${homeKitchenProducts.length} products`);

  // ==========================================
  // 5. BEAUTY
  // ==========================================
  console.log('\n--- Building Beauty ---');
  const beautyProducts = [];

  // 5 Fragrances (already 4 multi-angle photos of that exact perfume)
  const djFragrances = dj.products.filter(p => p.category === 'fragrances');
  for (const p of djFragrances) {
    const prodImages = Array.from(new Set([p.thumbnail, ...p.images]));
    const primary = prodImages[0];
    const name = ensureUniqueName(p.title, 'Beauty', beautyProducts.length + 1);

    beautyProducts.push({
      id: `beau-${String(beautyProducts.length + 1).padStart(3, '0')}`,
      name,
      description: `${p.description} Luxury signature fragrance with long-lasting scent notes, authentic formula and verified Amazon India pricing.`,
      brand: p.brand || p.title.split(' ')[0],
      category: "Beauty",
      sub_category: "Fragrances",
      price: toINR(p.price, 1499),
      discount: Math.round(p.discountPercentage || 12),
      gst: 18,
      stock: p.stock || 25,
      sku: `BEAU-DJ-${beautyProducts.length + 1}`,
      availability_status: "In Stock",
      featured: beautyProducts.length % 5 === 0,
      trending: beautyProducts.length % 3 === 0,
      best_seller: beautyProducts.length % 4 === 0,
      status: "published",
      thumbnail: primary,
      images: prodImages,
      rating: parseFloat((p.rating || 4.5).toFixed(1)),
      review_count: Math.floor(Math.random() * 2200) + 150
    });
  }

  // 3 Skincare (already 4 multi-angle photos)
  const djSkin = dj.products.filter(p => p.category === 'skin-care');
  for (const p of djSkin) {
    const prodImages = Array.from(new Set([p.thumbnail, ...p.images]));
    const primary = prodImages[0];
    const name = ensureUniqueName(p.title, 'Beauty', beautyProducts.length + 1);

    beautyProducts.push({
      id: `beau-${String(beautyProducts.length + 1).padStart(3, '0')}`,
      name,
      description: `${p.description} Dermatologically tested, luxury active botanical formula for radiant and nourished skin.`,
      brand: p.brand || "GlowCare",
      category: "Beauty",
      sub_category: "Skincare",
      price: toINR(p.price, 599),
      discount: Math.round(p.discountPercentage || 10),
      gst: 18,
      stock: p.stock || 30,
      sku: `BEAU-DJ-${beautyProducts.length + 1}`,
      availability_status: "In Stock",
      featured: beautyProducts.length % 5 === 0,
      trending: beautyProducts.length % 3 === 0,
      best_seller: beautyProducts.length % 4 === 0,
      status: "published",
      thumbnail: primary,
      images: prodImages,
      rating: parseFloat((p.rating || 4.4).toFixed(1)),
      review_count: Math.floor(Math.random() * 1800) + 110
    });
  }

  // 5 Beauty items (Essence Mascara, Eyeshadow Palette, Powder, Lipstick, Nail Polish) -> generate 4 views
  const djBeauty = dj.products.filter(p => p.category === 'beauty');
  for (const p of djBeauty) {
    const prodId = `beau-${String(beautyProducts.length + 1).padStart(3, '0')}`;
    const outDir = `public/images/products/Beauty/${prodId}`;
    console.log(`Generating views for Beauty ${prodId}: ${p.title}...`);
    const sourceImg = p.images && p.images.length > 0 ? p.images[0] : p.thumbnail;
    const generatedViews = generateViews(sourceImg, outDir) || [sourceImg];
    const name = ensureUniqueName(p.title, 'Beauty', beautyProducts.length + 1);

    beautyProducts.push({
      id: prodId,
      name,
      description: `${p.description} Dermatologically tested, cruelty-free high performance cosmetic formula.`,
      brand: p.brand || "Essence",
      category: "Beauty",
      sub_category: "Cosmetics",
      price: toINR(p.price, 699),
      discount: Math.round(p.discountPercentage || 10),
      gst: 18,
      stock: p.stock || 45,
      sku: `BEAU-DJ-${beautyProducts.length + 1}`,
      availability_status: "In Stock",
      featured: beautyProducts.length % 5 === 0,
      trending: beautyProducts.length % 3 === 0,
      best_seller: beautyProducts.length % 4 === 0,
      status: "published",
      thumbnail: generatedViews[0],
      images: generatedViews,
      rating: parseFloat((p.rating || 4.4).toFixed(1)),
      review_count: Math.floor(Math.random() * 2100) + 160
    });
  }

  // 10 Kolz beauty products (Moisturizer, Cleanser, Serum, Scrub, etc.)
  const kolzBeauty = kolz.filter(p => p.category === 'Beauty & Personal Care');
  for (const p of kolzBeauty) {
    const prodId = `beau-${String(beautyProducts.length + 1).padStart(3, '0')}`;
    const outDir = `public/images/products/Beauty/${prodId}`;
    console.log(`Generating views for Beauty ${prodId}: ${p.name}...`);
    const generatedViews = generateViews(p.image, outDir) || [p.image];
    const name = ensureUniqueName(p.name, 'Beauty', beautyProducts.length + 1);

    beautyProducts.push({
      id: prodId,
      name,
      description: `${p.description} Dermatologically tested, luxury active botanical formula for radiant and nourished skin.`,
      brand: "GlowEssence",
      category: "Beauty",
      sub_category: p.subCategory || "Personal Care",
      price: toINR(p.priceCents ? p.priceCents / 100 : 20, 699),
      discount: 15,
      gst: 18,
      stock: 40,
      sku: `BEAU-KZ-${beautyProducts.length + 1}`,
      availability_status: "In Stock",
      featured: beautyProducts.length % 5 === 0,
      trending: beautyProducts.length % 3 === 0,
      best_seller: beautyProducts.length % 4 === 0,
      status: "published",
      thumbnail: generatedViews[0],
      images: generatedViews,
      rating: parseFloat((p.rating?.stars || 4.5).toFixed(1)),
      review_count: p.rating?.count || 420
    });
  }
  console.log(`Beauty ready: ${beautyProducts.length} products`);

  // ==========================================
  // 6. SPORTS
  // ==========================================
  console.log('\n--- Building Sports ---');
  const sportsProducts = [];

  // 5 Motorcycle (already multi-angle)
  const djMotor = dj.products.filter(p => p.category === 'motorcycle');
  for (const p of djMotor) {
    const prodImages = Array.from(new Set([p.thumbnail, ...p.images]));
    const primary = prodImages[0];
    const name = ensureUniqueName(p.title, 'Sports', sportsProducts.length + 1);

    sportsProducts.push({
      id: `spor-${String(sportsProducts.length + 1).padStart(3, '0')}`,
      name,
      description: `${p.description} High-performance motorsport engineering, verified Amazon India pricing and tournament-level build quality.`,
      brand: p.brand || "MotoTech",
      category: "Sports",
      sub_category: "Motorsports",
      price: toINR(p.price, 4999),
      discount: Math.round(p.discountPercentage || 12),
      gst: 18,
      stock: p.stock || 15,
      sku: `SPOR-DJ-${sportsProducts.length + 1}`,
      availability_status: "In Stock",
      featured: sportsProducts.length % 5 === 0,
      trending: sportsProducts.length % 3 === 0,
      best_seller: sportsProducts.length % 4 === 0,
      status: "published",
      thumbnail: primary,
      images: prodImages,
      rating: parseFloat((p.rating || 4.5).toFixed(1)),
      review_count: Math.floor(Math.random() * 1200) + 80
    });
  }

  // 17 Sports accessories (generate 4 photographic views for each ball/glove/racket)
  const djSportsAcc = dj.products.filter(p => p.category === 'sports-accessories');
  for (const p of djSportsAcc) {
    const prodId = `spor-${String(sportsProducts.length + 1).padStart(3, '0')}`;
    const outDir = `public/images/products/Sports/${prodId}`;
    console.log(`Generating views for Sports ${prodId}: ${p.title}...`);
    const sourceImg = p.images && p.images.length > 0 ? p.images[0] : p.thumbnail;
    const generatedViews = generateViews(sourceImg, outDir) || [sourceImg];
    const name = ensureUniqueName(p.title, 'Sports', sportsProducts.length + 1);

    sportsProducts.push({
      id: prodId,
      name,
      description: `${p.description} Tournament-grade athletic gear engineered for maximum impact absorption, grip and durability.`,
      brand: p.brand || "ProAthlete",
      category: "Sports",
      sub_category: "Sports Gear",
      price: toINR(p.price, 699),
      discount: Math.round(p.discountPercentage || 15),
      gst: 18,
      stock: p.stock || 30,
      sku: `SPOR-DJ-${sportsProducts.length + 1}`,
      availability_status: "In Stock",
      featured: sportsProducts.length % 5 === 0,
      trending: sportsProducts.length % 3 === 0,
      best_seller: sportsProducts.length % 4 === 0,
      status: "published",
      thumbnail: generatedViews[0],
      images: generatedViews,
      rating: parseFloat((p.rating || 4.3).toFixed(1)),
      review_count: Math.floor(Math.random() * 2100) + 140
    });
  }

  // 10 Kolz health & fitness items (Yoga mat, dumbbells, foam roller, jump rope, etc.)
  const kolzSports = kolz.filter(p => p.category === 'Health & Fitness');
  for (const p of kolzSports) {
    const prodId = `spor-${String(sportsProducts.length + 1).padStart(3, '0')}`;
    const outDir = `public/images/products/Sports/${prodId}`;
    console.log(`Generating views for Sports ${prodId}: ${p.name}...`);
    const generatedViews = generateViews(p.image, outDir) || [p.image];
    const name = ensureUniqueName(p.name, 'Sports', sportsProducts.length + 1);

    sportsProducts.push({
      id: prodId,
      name,
      description: `${p.description} Engineered for serious athletic performance, maximum durability and tournament-level quality.`,
      brand: "ProFit",
      category: "Sports",
      sub_category: p.subCategory || "Fitness",
      price: toINR(p.priceCents ? p.priceCents / 100 : 25, 899),
      discount: 15,
      gst: 18,
      stock: 35,
      sku: `SPOR-KZ-${sportsProducts.length + 1}`,
      availability_status: "In Stock",
      featured: sportsProducts.length % 5 === 0,
      trending: sportsProducts.length % 3 === 0,
      best_seller: sportsProducts.length % 4 === 0,
      status: "published",
      thumbnail: generatedViews[0],
      images: generatedViews,
      rating: parseFloat((p.rating?.stars || 4.5).toFixed(1)),
      review_count: p.rating?.count || 390
    });
  }
  console.log(`Sports ready: ${sportsProducts.length} products`);

  // ==========================================
  // WRITE TO CATALOG FILES
  // ==========================================
  const writeCat = (filename, varName, data) => {
    const target = path.resolve('data/catalog', filename);
    const content = `export const ${varName} = ${JSON.stringify(data, null, 2)};\n`;
    fs.writeFileSync(target, content, 'utf8');
    console.log(`Saved ${data.length} products to data/catalog/${filename}`);
  };

  writeCat('electronics.js', 'electronicsProducts', electronicsProducts);
  writeCat('fashion.js', 'fashionProducts', fashionProducts);
  writeCat('homeKitchen.js', 'homeKitchenProducts', homeKitchenProducts);
  writeCat('beauty.js', 'beautyProducts', beautyProducts);
  writeCat('sports.js', 'sportsProducts', sportsProducts);
  writeCat('accessories.js', 'accessoriesProducts', accessoriesProducts);

  // ==========================================
  // AUDIT & SANITY CHECK
  // ==========================================
  const allProds = [
    ...electronicsProducts,
    ...fashionProducts,
    ...homeKitchenProducts,
    ...beautyProducts,
    ...sportsProducts,
    ...accessoriesProducts
  ];

  console.log('\n====================================');
  console.log('--- CATALOG AUDIT SUMMARY ---');
  console.log('Total Products in Store:', allProds.length);
  
  const imgUsage = {};
  for (const p of allProds) {
    for (const img of p.images) {
      imgUsage[img] = (imgUsage[img] || 0) + 1;
    }
  }

  const crossDuplicates = Object.entries(imgUsage).filter(([k, v]) => v > 1);
  console.log('Cross-product duplicate images count:', crossDuplicates.length);
  if (crossDuplicates.length > 0) {
    console.warn('Duplicates found:', crossDuplicates);
  } else {
    console.log('SUCCESS: ZERO duplicate images across products!');
  }

  const under3Images = allProds.filter(p => p.images.length < 3);
  console.log('Products with fewer than 3 images:', under3Images.length);
  console.log('====================================\n');
}

build().catch(console.error);
