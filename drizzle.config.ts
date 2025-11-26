import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({ path: '.env' });

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',  // Changed from 'turso' to 'postgresql'
  dbCredentials: {
    url: process.env.DATABASE_URL,  // Using the Neon database URL
  },
  tablesFilter: ['*'],
  verbose: true,
  strict: true
} satisfies Config;