// scripts/update-pets-table.ts
import { db } from '../src/lib/db';
import { sql } from 'drizzle-orm';

async function updatePetsTable() {
  try {
    // Add missing columns to the pets table
    await db.execute(sql`
      ALTER TABLE pets 
      ADD COLUMN IF NOT EXISTS medical_history JSONB,
      ADD COLUMN IF NOT EXISTS vaccinated BOOLEAN,
      ADD COLUMN IF NOT EXISTS neutered BOOLEAN,
      ADD COLUMN IF NOT EXISTS adoption_fee INTEGER,
      ADD COLUMN IF NOT EXISTS images TEXT[];
    `);
    console.log('Pets table updated successfully!');
  } catch (error) {
    console.error('Error updating pets table:', error);
  } finally {
    process.exit(0);
  }
}

updatePetsTable();