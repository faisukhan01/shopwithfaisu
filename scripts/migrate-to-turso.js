// Script to migrate data from SQLite to Turso
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@libsql/client');
const { PrismaLibSQL } = require('@prisma/adapter-libsql');

async function migrateData() {
  console.log('🚀 Starting migration from SQLite to Turso...\n');

  // Verify environment variables
  const tursoUrl = process.env.DATABASE_URL;
  const tursoToken = process.env.DATABASE_AUTH_TOKEN;

  console.log('Turso URL:', tursoUrl ? tursoUrl.substring(0, 30) + '...' : 'NOT SET');
  console.log('Turso Token:', tursoToken ? 'SET (length: ' + tursoToken.length + ')' : 'NOT SET');
  console.log('');

  if (!tursoUrl || !tursoToken) {
    console.error('❌ Missing DATABASE_URL or DATABASE_AUTH_TOKEN');
    process.exit(1);
  }

  // Connect to local SQLite
  const localPrisma = new PrismaClient({
    datasources: {
      db: {
        url: 'file:./db/dev.db'
      }
    }
  });

  // Connect to Turso
  const libsql = createClient({
    url: tursoUrl,
    authToken: tursoToken,
  });

  const adapter = new PrismaLibSQL(libsql);
  const tursoPrisma = new PrismaClient({ 
    adapter,
    log: ['error']
  });

  try {
    // Test Turso connection
    console.log('Testing Turso connection...');
    await tursoPrisma.$connect();
    console.log('✅ Connected to Turso\n');

    // Migrate Categories
    console.log('📦 Migrating Categories...');
    const categories = await localPrisma.category.findMany();
    console.log(`Found ${categories.length} categories`);
    
    for (const category of categories) {
      await tursoPrisma.category.upsert({
        where: { id: category.id },
        update: category,
        create: category,
      });
    }
    console.log('✅ Categories migrated\n');

    // Migrate Products
    console.log('📦 Migrating Products...');
    const products = await localPrisma.product.findMany();
    console.log(`Found ${products.length} products`);
    
    for (const product of products) {
      await tursoPrisma.product.upsert({
        where: { id: product.id },
        update: product,
        create: product,
      });
    }
    console.log('✅ Products migrated\n');

    // Migrate Store Settings
    console.log('📦 Migrating Store Settings...');
    const settings = await localPrisma.storeSetting.findMany();
    console.log(`Found ${settings.length} settings`);
    
    for (const setting of settings) {
      await tursoPrisma.storeSetting.upsert({
        where: { id: setting.id },
        update: setting,
        create: setting,
      });
    }
    console.log('✅ Settings migrated\n');

    // Migrate Coupons
    console.log('📦 Migrating Coupons...');
    const coupons = await localPrisma.coupon.findMany();
    console.log(`Found ${coupons.length} coupons`);
    
    for (const coupon of coupons) {
      await tursoPrisma.coupon.upsert({
        where: { id: coupon.id },
        update: coupon,
        create: coupon,
      });
    }
    console.log('✅ Coupons migrated\n');

    // Migrate Reviews
    console.log('📦 Migrating Reviews...');
    const reviews = await localPrisma.review.findMany();
    console.log(`Found ${reviews.length} reviews`);
    
    for (const review of reviews) {
      await tursoPrisma.review.upsert({
        where: { id: review.id },
        update: review,
        create: review,
      });
    }
    console.log('✅ Reviews migrated\n');

    // Migrate Users (if any)
    console.log('📦 Migrating Users...');
    const users = await localPrisma.user.findMany();
    console.log(`Found ${users.length} users`);
    
    for (const user of users) {
      await tursoPrisma.user.upsert({
        where: { id: user.id },
        update: user,
        create: user,
      });
    }
    console.log('✅ Users migrated\n');

    // Migrate Orders (if any)
    console.log('📦 Migrating Orders...');
    const orders = await localPrisma.order.findMany();
    console.log(`Found ${orders.length} orders`);
    
    for (const order of orders) {
      await tursoPrisma.order.upsert({
        where: { id: order.id },
        update: order,
        create: order,
      });
    }
    console.log('✅ Orders migrated\n');

    console.log('🎉 Migration completed successfully!');
    console.log('\nSummary:');
    console.log(`- Categories: ${categories.length}`);
    console.log(`- Products: ${products.length}`);
    console.log(`- Settings: ${settings.length}`);
    console.log(`- Coupons: ${coupons.length}`);
    console.log(`- Reviews: ${reviews.length}`);
    console.log(`- Users: ${users.length}`);
    console.log(`- Orders: ${orders.length}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await localPrisma.$disconnect();
    await tursoPrisma.$disconnect();
  }
}

migrateData();
