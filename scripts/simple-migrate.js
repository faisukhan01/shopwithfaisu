// Simple migration using direct Prisma client calls
require('dotenv').config();
const sqlite3 = require('better-sqlite3');
const { createClient } = require('@libsql/client');

async function migrate() {
  console.log('🚀 Starting simple migration...\n');

  // Open local SQLite database
  const db = sqlite3('./db/dev.db');

  // Connect to Turso
  const turso = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  try {
    // Get all categories
    console.log('📦 Migrating Categories...');
    const categories = db.prepare('SELECT * FROM Category').all();
    console.log(`Found ${categories.length} categories`);
    
    for (const cat of categories) {
      await turso.execute({
        sql: `INSERT OR REPLACE INTO Category (id, name, slug, description, image, parentId, sortOrder, isActive, createdAt, updatedAt)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [cat.id, cat.name, cat.slug, cat.description, cat.image, cat.parentId, cat.sortOrder, cat.isActive, cat.createdAt, cat.updatedAt]
      });
    }
    console.log('✅ Categories migrated\n');

    // Get all products
    console.log('📦 Migrating Products...');
    const products = db.prepare('SELECT * FROM Product').all();
    console.log(`Found ${products.length} products`);
    
    for (const prod of products) {
      await turso.execute({
        sql: `INSERT OR REPLACE INTO Product (id, name, slug, description, shortDesc, price, comparePrice, costPrice, images, categoryId, stock, sku, weight, dimensions, isFeatured, isNew, isActive, attributes, rating, reviewCount, soldCount, createdAt, updatedAt)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [prod.id, prod.name, prod.slug, prod.description, prod.shortDesc, prod.price, prod.comparePrice, prod.costPrice, prod.images, prod.categoryId, prod.stock, prod.sku, prod.weight, prod.dimensions, prod.isFeatured, prod.isNew, prod.isActive, prod.attributes, prod.rating, prod.reviewCount, prod.soldCount, prod.createdAt, prod.updatedAt]
      });
    }
    console.log('✅ Products migrated\n');

    // Get all settings
    console.log('📦 Migrating Settings...');
    const settings = db.prepare('SELECT * FROM StoreSetting').all();
    console.log(`Found ${settings.length} settings`);
    
    for (const setting of settings) {
      await turso.execute({
        sql: `INSERT OR REPLACE INTO StoreSetting (id, key, value, type, "group", label, createdAt, updatedAt)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [setting.id, setting.key, setting.value, setting.type, setting.group, setting.label, setting.createdAt, setting.updatedAt]
      });
    }
    console.log('✅ Settings migrated\n');

    // Get all coupons
    console.log('📦 Migrating Coupons...');
    const coupons = db.prepare('SELECT * FROM Coupon').all();
    console.log(`Found ${coupons.length} coupons`);
    
    for (const coupon of coupons) {
      await turso.execute({
        sql: `INSERT OR REPLACE INTO Coupon (id, code, type, value, minOrder, maxUses, usedCount, expiresAt, isActive, createdAt, updatedAt)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [coupon.id, coupon.code, coupon.type, coupon.value, coupon.minOrder, coupon.maxUses, coupon.usedCount, coupon.expiresAt, coupon.isActive, coupon.createdAt, coupon.updatedAt]
      });
    }
    console.log('✅ Coupons migrated\n');

    // Get all reviews
    console.log('📦 Migrating Reviews...');
    const reviews = db.prepare('SELECT * FROM Review').all();
    console.log(`Found ${reviews.length} reviews`);
    
    for (const review of reviews) {
      await turso.execute({
        sql: `INSERT OR REPLACE INTO Review (id, productId, userId, userName, rating, title, comment, isApproved, createdAt, updatedAt)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [review.id, review.productId, review.userId, review.userName, review.rating, review.title, review.comment, review.isApproved, review.createdAt, review.updatedAt]
      });
    }
    console.log('✅ Reviews migrated\n');

    console.log('🎉 Migration completed successfully!');
    console.log('\nSummary:');
    console.log(`- Categories: ${categories.length}`);
    console.log(`- Products: ${products.length}`);
    console.log(`- Settings: ${settings.length}`);
    console.log(`- Coupons: ${coupons.length}`);
    console.log(`- Reviews: ${reviews.length}`);

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    db.close();
    turso.close();
  }
}

migrate();
