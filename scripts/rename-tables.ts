// scripts/rename-tables.ts
import { db } from '../src/lib/db';
import { sql } from 'drizzle-orm';

async function renameTables() {
  try {
    // Rename organizations to shelters
    await db.execute(sql`
      ALTER TABLE organizations RENAME TO shelters;
    `);
    console.log('Tables renamed successfully!');
  } catch (error) {
    console.error('Error renaming tables:', error);
  } finally {
    process.exit(0);
  }
}

renameTables();