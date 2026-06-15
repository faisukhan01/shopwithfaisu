// Script to set up Turso database with schema
require('dotenv').config();
const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

async function setupTurso() {
  console.log('🚀 Setting up Turso database...');

  const dbUrl = process.env.DATABASE_URL;
  const authToken = process.env.DATABASE_AUTH_TOKEN;

  if (!dbUrl || !authToken) {
    console.error('❌ Missing DATABASE_URL or DATABASE_AUTH_TOKEN in .env');
    console.error('DATABASE_URL:', dbUrl ? 'Found' : 'Missing');
    console.error('DATABASE_AUTH_TOKEN:', authToken ? 'Found' : 'Missing');
    process.exit(1);
  }

  const client = createClient({
    url: dbUrl,
    authToken: authToken,
  });

  try {
    // Read and execute SQL schema
    const schemaPath = path.join(__dirname, 'turso-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by semicolons and execute each statement
    const statements = schema.split(';').filter(s => s.trim());
    
    console.log(`📝 Executing ${statements.length} SQL statements...`);
    
    for (const statement of statements) {
      if (statement.trim()) {
        await client.execute(statement);
      }
    }

    console.log('✅ Turso database schema created successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Run: npm run dev');
    console.log('2. Visit: http://localhost:3000/api/seed to populate data');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    process.exit(1);
  } finally {
    client.close();
  }
}

setupTurso();
