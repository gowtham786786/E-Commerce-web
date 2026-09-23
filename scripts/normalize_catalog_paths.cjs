const fs = require('fs');

const files = ['electronics.js', 'fashion.js', 'homeKitchen.js', 'beauty.js', 'sports.js', 'accessories.js'];

for (const f of files) {
  const fPath = 'data/catalog/' + f;
  let str = fs.readFileSync(fPath, 'utf8');
  // Replace absolute drive paths with clean web relative paths
  str = str.replace(/\/?[a-zA-Z]:\/[^"]*?\/images\//g, '/images/');
  str = str.replace(/\/?[a-zA-Z]:\\[^"]*?\\images\\/g, '/images/');
  str = str.replace(/\\/g, '/');
  fs.writeFileSync(fPath, str, 'utf8');
  console.log('Normalized paths in', f);
}

// Quick verification
const fashContent = fs.readFileSync('data/catalog/fashion.js', 'utf8');
const prods = JSON.parse(fashContent.substring(fashContent.indexOf('['), fashContent.lastIndexOf(']') + 1));
const p26 = prods.find(p => p.id === 'fash-026');
console.log('fash-026 thumbnails & images:');
console.log('Thumbnail:', p26.thumbnail);
console.log('Images:', p26.images);
