const fs = require('fs');
const https = require('https');

function testUrl(url) {
  return new Promise((resolve) => {
    https.get(url, { method: 'HEAD' }, (res) => {
      resolve(res.statusCode === 200);
    }).on('error', () => resolve(false));
  });
}

// Curated pools of Unsplash IDs by category:
const categoryCandidates = {
  beauty: [
    '1522337360788-8b13dee7a37e', // makeup brush
    '1596462502278-27bfdc403348', // cosmetics bottles
    '1571781926291-c477ebfd024b', // lotion bottle
    '1556228720-195a672e8a03', // skincare dropper
    '1608248597359-2e622416f272', // cosmetic jars
    '1585232351009-aa87416fca90', // lipstick
    '1512496015851-a90fb38ba796', // cosmetics bottles
    '1526947425960-945c6e72858f', // dropper bottle
    '1617897903246-719242758050', // serum bottle
    '1620916566398-39f1143ab7be', // cosmetic tube
    '1567928804476-ae380056b29e', // perfume bottle
    '1592945403244-b3fbafd7f539', // perfume bottle
    '1588405748880-12d1d2a59f75', // skincare bottle
    '1616683693504-3ea7e9ad6fec', // skincare jars
    '1570172619644-dfd03ed5d881', // facial cream
    '1535585209827-a15fcdbc4c2d', // soap cleanser
    '1556228722-d0b5de70b798', // shampoo bottle
    '1601049541289-9b1b7bbbfe19', // serum pipettes
    '1598440947619-2c35fc9aa908', // cosmetic bottle
    '1584308666744-24d5c474f2ae', // skincare dropper
    '1515377905703-c4788e51af15', // makeup brushes
    '1503236823255-94609f598e71', // lipstick swatches
    '1527632984834-3df86ac66ef8', // cosmetic cream jar
    '1531299204812-e6d44d9a185c', // skincare product
    '1576426863848-c21f53c60b19', // clean beauty product
    '1612817288484-6f916006741a', // beauty product mock
    '1614859268652-e9d6d3dcaee6', // hair dryer
    '1522337660859-02fbefca4702', // makeup flatlay
    '1522335789203-aabd1fc54bc9', // mascara makeup
    '1629732047847-50219e9c5aef', // shampoo pump
    '1631729371254-42c2892f0e68', // lotion bottle
    '1608248543803-ba4f8c70ae0b', // toner bottle
    '1556228724-52d3a3c26d8f', // face wash pump
    '1512290900672-1f0230a6cbe3', // hair product
    '1522337094315-404fa20c2336', // cosmetics palette
    '1516975080664-ed2fc6a32937', // cosmetic brush
    '1590156206657-3a1efd019f39', // serum dropper
    '1563178406-4cdc2923acbc', // lipstick red
    '1512496015851-a90fb38ba796', // skincare
    '1608248597359-2e622416f272', // beauty cream
    '1571781926291-c477ebfd024b'  // moisturizer
  ],
  sports: [
    '1517838277536-f5f99be501cd', // gym fitness
    '1584735935682-2f2b69dff9d2', // dumbbells
    '1574680096145-d05b474e2155', // gym weights
    '1540497077202-7c8a3999166f', // fitness gym
    '1599058945520-2c7003058097', // dumbbells
    '1534438327276-14e5300c3a48', // fitness workout
    '1581009146145-b5ef050c2e1e', // gym barbell
    '1518611012118-696072aa579a', // sports workout
    '1594737625785-a6cbdabd333c', // yoga mat
    '1601925260368-ae2f83cf8b7f', // yoga pose
    '1506126613408-eca07ce68773', // yoga
    '1576678927484-cc907957088c', // gym equipment
    '1623874514711-0f321325f318', // kettlebell
    '1530549387789-4c1017266635', // swimming pool
    '1600965962361-9035dbfc106d', // badminton racket
    '1595435934249-5df7ed86e1c0', // tennis racket
    '1529900748604-07564a03e7a6', // soccer ball
    '1519766304817-4f37bda74a29', // basketball
    '1517649763962-0c623266ddc0', // sports running
    '1485965120184-e220f721d03e', // bicycle
    '1502680390469-be75c86b636f', // running shoes
    '1542291026-7eec264c27ff', // nike running shoe
    '1556817411-31ae72fa3ea0', // boxing gloves
    '1517963879433-6ad2b056d712', // weights workout
    '1571019613454-1cb2f99b2d8b', // running fitness
    '1574680178050-55c6a6a56e84', // barbell gym
    '1584735935682-2f2b69dff9d2', // dumbbell hex
    '1599058945520-2c7003058097', // dumbbell pair
    '1540497077202-7c8a3999166f', // barbell rack
    '1517838277536-f5f99be501cd'  // gym
  ],
  accessories: [
    '1523275335684-37898b6baf30', // white watch
    '1522335789203-aabd1fc54bc9', // accessories
    '1509319117193-57bab727e09d', // sunglasses
    '1511499767150-a48a237f0083', // sunglasses
    '1627123424574-724758594e93', // leather wallet
    '1553062407-98eeb64c6a62', // backpack
    '1548036328-c9fa89d128fa', // leather bag
    '1584917865442-de89df76afd3', // luxury handbag
    '1599643478518-a784e5dc4c8f', // jewelry necklace
    '1605100804763-247f67b3557e', // gold ring
    '1611085583191-a3b181a88401', // silver bracelet
    '1515562141207-7a88fb7ce338', // diamond jewelry
    '1535683577427-740742111166', // watch luxury
    '1524805444758-089113d48a6d', // mechanical watch
    '1546868871-7041f2a55e12', // smartwatch
    '1572635196237-14b3f281503f', // sunglasses rayban
    '1508296695146-257a814070b4', // sunglasses
    '1583394838336-acd977736f90', // gold watch
    '1600003014755-ba31aa59c4b6', // watch wrist
    '1617038260897-41a1f14a8ca0', // jewelry
    '1598532163257-ae3c6b2524b6', // leather handbag
    '1584917865442-de89df76afd3', // handbag luxury
    '1590874103328-eac38a683ce7', // tote bag
    '1553062407-98eeb64c6a62', // travel backpack
    '1627123424574-724758594e93'  // wallet
  ],
  homeKitchen: [
    '1556911220-e15b29be8c8f', // kitchen cooking
    '1584269600464-37b1b58a9fe7', // cookware pan
    '1585515320310-259814833e62', // kitchen blender
    '1517668808822-9ebb02ae2a0e', // coffee mug / cup
    '1544816155-12df9643f363', // knife chef
    '1583847268964-b28dc8f51f92', // kitchen dining
    '1590794056226-79ef3a8147e1', // kitchen pots
    '1514432324607-a09d9b4aefdd', // kettle pour
    '1586023492125-27b2c045efd7', // modern armchair / home
    '1555041469-a586c61ea9bc', // modern sofa
    '1513694203232-719a280e022f', // home decor lamp
    '1616486338812-3dadae4b4ace'  // living room furniture
  ]
};

async function run() {
  const verified = {};
  for (const [cat, ids] of Object.entries(categoryCandidates)) {
    const valid = [];
    const uniqueIds = [...new Set(ids)];
    for (const id of uniqueIds) {
      const url = `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`;
      const ok = await testUrl(url);
      if (ok) valid.push(id);
      else console.log(`[${cat}] FAILED:`, id);
    }
    verified[cat] = valid;
    console.log(`[${cat}] Valid: ${valid.length} / ${uniqueIds.length}`);
  }

  fs.writeFileSync('scratch/category_verified_unsplash.json', JSON.stringify(verified, null, 2));
  console.log('Saved to scratch/category_verified_unsplash.json');
}

run();
