// Script to update imagesUrl paths from 'assets/imagen' to 'img/products'
const conn = new Mongo();
const db = conn.getDB('ecommerce-db');

print('Starting update-image-paths script');

// Update when imagesUrl is a string
const res1 = db.products.updateMany(
  { imagesUrl: { $type: 'string', $regex: '^assets/imagen' } },
  [{
    $set: {
      imagesUrl: {
        $replaceOne: {
          input: '$imagesUrl',
          find: 'assets/imagen',
          replacement: 'img/products'
        }
      }
    }
  }]
);
print('String updates matched:', res1.matchedCount, 'modified:', res1.modifiedCount);

// Update when imagesUrl is an array
const res2 = db.products.updateMany(
  { imagesUrl: { $type: 'array' } },
  [{
    $set: {
      imagesUrl: {
        $map: {
          input: '$imagesUrl',
          as: 'item',
          in: {
            $cond: [
              { $regexMatch: { input: '$$item', regex: '^assets/imagen' } },
              { $replaceOne: { input: '$$item', find: 'assets/imagen', replacement: 'img/products' } },
              '$$item'
            ]
          }
        }
      }
    }
  }]
);
print('Array updates matched:', res2.matchedCount, 'modified:', res2.modifiedCount);

print('update-image-paths script finished');
