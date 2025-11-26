// scripts/test-db.ts
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import { db } from '../src/lib/db';
import { sql } from 'drizzle-orm';

async function testDb() {
  try {
    const result = await db.execute(sql`SELECT version()`);
    console.log('Database connection successful!');
    console.log('Database version:', result[0]?.version);
  } catch (error) {
    console.error('Database connection failed:', error);
  } finally {
    process.exit(0);
  }
}

testDb();