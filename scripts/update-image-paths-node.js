import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

const MONGO_URI = 'mongodb://localhost:27017/ecommerce-db';
const backupDir = path.join(process.cwd(), '..', 'backend', 'db-backups');
const backupFile = path.join(backupDir, 'products-backup.json');

async function main() {
  await mongoose.connect(MONGO_URI, { });
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;
  const productsColl = db.collection('products');

  // Ensure backup dir exists
  fs.mkdirSync(backupDir, { recursive: true });

  // Export all documents to backup
  const all = await productsColl.find({}).toArray();
  fs.writeFileSync(backupFile, JSON.stringify(all, null, 2), 'utf8');
  console.log('Backup written to', backupFile, 'documents:', all.length);

  // Update when imagesUrl is a string
  const res1 = await productsColl.updateMany(
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
  console.log('String updates matched:', res1.matchedCount, 'modified:', res1.modifiedCount);

  // Update when imagesUrl is an array
  const res2 = await productsColl.updateMany(
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
  console.log('Array updates matched:', res2.matchedCount, 'modified:', res2.modifiedCount);

  // Sample check: print first 3 documents
  const sample = await productsColl.find({}).limit(3).toArray();
  console.log('Sample after update:', sample.map(p => ({ _id: p._id, imagesUrl: p.imagesUrl })));

  await mongoose.disconnect();
  console.log('Disconnected');
}

main().catch(err => {
  console.error('Script error:', err);
  process.exit(1);
});
