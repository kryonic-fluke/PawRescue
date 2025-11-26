// scripts/alter-pets-table.ts
import { db } from '../src/lib/db';
import { sql } from 'drizzle-orm';

async function alterPetsTable() {
  try {
    // Rename organization_id to shelter_id
    await db.execute(sql`
      ALTER TABLE pets 
      RENAME COLUMN organization_id TO shelter_id;
    `);
    console.log('Pets table altered successfully!');
  } catch (error) {
    console.error('Error altering pets table:', error);
  } finally {
    process.exit(0);
  }
}

alterPetsTable();