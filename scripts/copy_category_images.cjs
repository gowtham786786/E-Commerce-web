const fs = require('fs');
const path = require('path');

const targetDir = path.resolve('public/images/categories');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const artifactDir = path.resolve('C:/Users/Admin/.gemini/antigravity-ide/brain/4a29ae20-dfad-4126-9adf-5b1cd886dde9');

const mapping = {
  'category_electronics_1790134205448.jpg': 'electronics.jpg',
  'category_fashion_1790134252497.jpg': 'fashion.jpg',
  'category_home_kitchen_1790134274863.jpg': 'home-kitchen.jpg',
  'category_beauty_1790134445025.jpg': 'beauty.jpg',
  'category_sports_1790134470098.jpg': 'sports.jpg',
  'category_accessories_1790134490758.jpg': 'accessories.jpg'
};

for (const [srcName, destName] of Object.entries(mapping)) {
  const src = path.join(artifactDir, srcName);
  const dest = path.join(targetDir, destName);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    const size = fs.statSync(dest).size;
    console.log(`Saved ${destName} (${(size / 1024).toFixed(1)} KB)`);
  } else {
    console.error(`File missing: ${src}`);
  }
}
