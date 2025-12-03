// src/test/test-utils.ts
import { Pool } from 'pg';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import * as schema from '../db/schema.js';

// Use the TEST_DATABASE_URL from environment or a fallback
const TEST_DB_URL = process.env.TEST_DATABASE_URL || 
  'postgresql://postgres:postgres@localhost:5432/testdb';

export interface TestDatabase {
  db: ReturnType<typeof drizzle<typeof schema>>;
  sql: (strings: TemplateStringsArray, ...values: any[]) => Promise<any>;
  pool: Pool;
  teardown: () => Promise<void>;
}

export async function setupTestDB(): Promise<TestDatabase> {
  if (!TEST_DB_URL) {
    throw new Error('TEST_DATABASE_URL environment variable is not set');
  }

  const pool = new Pool({
    connectionString: TEST_DB_URL,
    ssl: process.env.NODE_ENV === 'production' ? { 
      rejectUnauthorized: false 
    } : false,
  });

  try {
    const db = drizzle(pool, { schema });

    const sql = async (strings: TemplateStringsArray, ...values: any[]) => {
      const query = {
        text: strings[0],
        values: values
      };
      const result = await pool.query(query);
      return result;
    };

    if (process.env.RUN_MIGRATIONS === 'true') {
      await migrate(db, { 
        migrationsFolder: process.env.MIGRATIONS_FOLDER || './drizzle' 
      });
    }

    const teardown = async () => {
      try {
        await pool.end();
      } catch (error) {
        console.error('Error during teardown:', error);
      }
    };

    return { db, sql, pool, teardown };
  } catch (error) {
    console.error('Failed to setup test database:', error);
    await pool.end();
    throw error;
  }
}

export async function clearTestData(db: ReturnType<typeof drizzle>): Promise<void> {
  try {
    // Get all tables from the schema
    const tables = [
      'users', 'sessions', 'accounts', 'ngos', 'animal_shelters', 
      'pets', 'rescue_reports', 'adoption_applications', 
      'whatsapp_messages', 'email_notifications', 'team_members'
    ];
    
    // Truncate all tables
    for (const table of tables) {
      try {
        await db.execute(sql.raw(`TRUNCATE TABLE "${table}" CASCADE`));
      } catch (error) {
        console.warn(`Failed to clear table ${table}:`, error);
      }
    }
  } catch (error) {
    console.error('Error clearing test data:', error);
    throw error;
  }
}

export async function teardownTestDB(db: TestDatabase): Promise<void> {
  try {
    if (db) {
      await db.teardown();
    }
  } catch (error) {
    console.error('Error during teardown:', error);
    throw error;
  }
}