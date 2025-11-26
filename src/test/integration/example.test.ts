// src/test/integration/example.test.ts
import { setupTestDB, clearTestData, teardownTestDB } from '../test-utils';
import type { TestDatabase } from '../test-utils';
import { describe, beforeAll, afterEach, afterAll, it, expect } from '@jest/globals';
import { sql } from 'drizzle-orm';

// Define result type interfaces
interface TestQueryResult {
  test: number;
}

interface DatabaseNameResult {
  db_name: string;
}

describe('Database Tests', () => {
  let testDB: TestDatabase | null = null;
  let setupFailed = false;

  beforeAll(async () => {
    try {
      testDB = await setupTestDB();
    } catch (error) {
      console.error('Failed to setup test database:', error);
      setupFailed = true;
    }
  });

  afterEach(async () => {
    if (testDB?.db) {
      try {
        await clearTestData(testDB.db);
      } catch (error) {
        console.error('Error clearing test data:', error);
      }
    }
  });

  afterAll(async () => {
    if (testDB) {
      try {
        await teardownTestDB(testDB);
      } catch (error) {
        console.error('Error during teardown:', error);
      }
    }

    if (setupFailed) {
      console.warn('\n⚠️  Database tests were skipped due to setup failure.');
      console.warn('   Please check your TEST_DB_URL and database connection.\n');
    }
  });

  const itWithDB = setupFailed ? it.skip : it;

  itWithDB('should connect to the test database', async () => {
    if (!testDB) throw new Error('Test database not initialized');
    
    const result = await testDB.sql`SELECT 1 as test`;
    const typedResult = result.rows[0] as TestQueryResult;
    expect(typedResult.test).toBe(1);
  });

  itWithDB('should be able to execute queries', async () => {
    if (!testDB) throw new Error('Test database not initialized');
    
    const result = await testDB.sql`SELECT current_database() as db_name`;
    const typedResult = result.rows[0] as DatabaseNameResult;
    expect(typedResult.db_name).toBeDefined();
    console.log('Connected to database:', typedResult.db_name);
  });

  itWithDB('should be able to use Drizzle ORM', async () => {
    if (!testDB) throw new Error('Test database not initialized');
    
    // Using the sql template tag for Drizzle queries
    const result = await testDB.db.select().from(sql`users`).limit(1);
    expect(Array.isArray(result)).toBe(true);
  });

  itWithDB('should handle transactions', async () => {
    if (!testDB) throw new Error('Test database not initialized');
    
    await testDB.db.transaction(async (tx) => {
      const result = await tx.execute(sql`SELECT 1 as test`);
      expect(result.rows[0].test).toBe(1);
    });
  });
});