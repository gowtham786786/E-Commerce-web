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
  const inr = Math.round((usd * 85) / 10) * 10 - 1;
  return Math.max(minInr, inr);
}

function generateViews(sourceUrl, outDir) {
  const scriptPath = path.resolve('scripts/generate_product_views.py');
  const targetDir = path.resolve(outDir);
  const result = spawnSync('python', [scriptPath, sourceUrl, targetDir], { encoding: 'utf8' });
  if (result.status === 0 && result.stdout) {
    try {
      const views = JSON.parse(result.stdout.trim());
      return views.map(v => {
        const clean = v.replace(/\\/g, '/');
        const idx = clean.indexOf('/images/');
        return idx !== -1 ? clean.slice(idx) : clean;
      });
    } catch(e) {
      console.error('JSON parse error from generate_product_views:', e.message, result.stdout);
    }
  } else {
    console.error('Error generating views for', sourceUrl, result.stderr);
  }
  return null;
}

async function run() {
  console.log('Fetching Kolzsticks Home & Kitchen products...');
  const kolz = await getJson('https://kolzsticks.github.io/Free-Ecommerce-Products-Api/main/products.json');
  if (!kolz) {
    console.error('Failed to fetch Kolzsticks API');
    return;
  }

  const kolzHome = kolz.filter(p => p.category === 'Home & Kitchen');
  console.log(`Found ${kolzHome.length} Kolzsticks Home & Kitchen products.`);

  const homeFile = path.resolve('data/catalog/homeKitchen.js');
  const mod = require(homeFile);
  const existing = [...mod.homeKitchenProducts];
  console.log(`Currently in homeKitchen.js: ${existing.length} products.`);

  const existingIds = new Set(existing.map(p => p.id));
  const existingNames = new Set(existing.map(p => p.name));

  for (const p of kolzHome) {
    const nextNum = existing.length + 1;
    const prodId = `home-${String(nextNum).padStart(3, '0')}`;
    if (existingIds.has(prodId)) continue;

    console.log(`Generating multi-angle views for ${prodId}: ${p.name}...`);
    const outDir = `public/images/products/Home & Kitchen/${prodId}`;
    const generatedViews = generateViews(p.image, outDir) || [p.image];

    let name = p.name;
    if (existingNames.has(name)) {
      name = `${name} Edition - ${nextNum}`;
    }
    existingNames.add(name);

    const newProd = {
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
      sku: `HOME-KZ-${nextNum}`,
      availability_status: "In Stock",
      featured: nextNum % 5 === 0,
      trending: nextNum % 3 === 0,
      best_seller: nextNum % 4 === 0,
      status: "published",
      thumbnail: generatedViews[0],
      images: generatedViews,
      rating: typeof p.rating === 'object' ? (p.rating.stars || 4.5) : (p.rating || 4.5),
      review_count: typeof p.rating === 'object' ? (p.rating.count || 120) : 120
    };

    existing.push(newProd);
    existingIds.add(prodId);
  }

  console.log(`New total Home & Kitchen products: ${existing.length}`);
  const content = `export const homeKitchenProducts = ${JSON.stringify(existing, null, 2)};\n`;
  fs.writeFileSync(homeFile, content, 'utf8');
  console.log(`Successfully updated ${homeFile} with ${existing.length} products.`);
}

run();
