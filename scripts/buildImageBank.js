import fs from 'fs';
import https from 'https';

const fetchJson = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { resolve(null); }
      });
    }).on('error', reject);
  });
};

const run = async () => {
  console.log("Fetching DummyJSON products...");
  const dummyjson = await fetchJson('https://dummyjson.com/products?limit=200');
  
  console.log("Fetching Platzi Fake Store products...");
  const platzi = await fetchJson('https://api.escuelajs.co/api/v1/products');

  console.log("Fetching FakeStoreAPI products...");
  const fakestore = await fetchJson('https://fakestoreapi.com/products');

  const imageBank = {
    Electronics: [],
    Fashion: [],
    'Home & Kitchen': [],
    Beauty: [],
    Sports: [],
    Accessories: [],
    Grocery: []
  };

  const mapCategory = (cat, title) => {
    cat = cat.toLowerCase();
    title = title.toLowerCase();
    if (cat.includes('phone') || cat.includes('laptop') || cat.includes('electronic') || cat.includes('tablet')) return 'Electronics';
    if (cat.includes('shirt') || cat.includes('shoe') || cat.includes('dress') || cat.includes('cloth')) return 'Fashion';
    if (cat.includes('home') || cat.includes('furniture') || cat.includes('kitchen') || cat.includes('lighting')) return 'Home & Kitchen';
    if (cat.includes('beauty') || cat.includes('skin') || cat.includes('fragrance')) return 'Beauty';
    if (cat.includes('sport') || cat.includes('motorcycle')) return 'Sports';
    if (cat.includes('bag') || cat.includes('jewel') || cat.includes('watch') || cat.includes('sunglass')) return 'Accessories';
    if (cat.includes('grocer') || cat.includes('food')) return 'Grocery';
    return 'Accessories'; // Default
  };

  const processImages = (products, getCat, getImgs, getTitle) => {
    if (!products) return;
    products.forEach(p => {
      const cat = mapCategory(getCat(p), getTitle(p));
      const imgs = getImgs(p);
      if (Array.isArray(imgs)) {
        imgs.forEach(img => {
          if (typeof img === 'string' && img.startsWith('http')) {
            // Clean URL
            const cleanImg = img.replace(/["\[\]]/g, '');
            if (cleanImg.startsWith('http') && !imageBank[cat].includes(cleanImg)) {
              imageBank[cat].push(cleanImg);
            }
          }
        });
      } else if (typeof imgs === 'string' && imgs.startsWith('http')) {
        if (!imageBank[cat].includes(imgs)) imageBank[cat].push(imgs);
      }
    });
  };

  if (dummyjson && dummyjson.products) processImages(dummyjson.products, p => p.category, p => p.images, p => p.title);
  if (Array.isArray(platzi)) processImages(platzi, p => p.category.name, p => p.images, p => p.title);
  if (Array.isArray(fakestore)) processImages(fakestore, p => p.category, p => p.image, p => p.title);

  // Print counts
  let total = 0;
  Object.keys(imageBank).forEach(k => {
    console.log(`${k}: ${imageBank[k].length} images`);
    total += imageBank[k].length;
  });
  console.log(`Total unique professional product images acquired: ${total}`);

  fs.writeFileSync('data/imageBank.json', JSON.stringify(imageBank, null, 2));
  console.log("Saved to data/imageBank.json");
};

run();
