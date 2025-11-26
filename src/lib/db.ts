// src/lib/db.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({ path: '.env' });

console.log('Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const connectionString = process.env.DATABASE_URL;
console.log('Connecting to database with URL:', 
  connectionString.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@') // Hide credentials in logs
);

const client = postgres(connectionString, { 
  ssl: 'require',
  max: 1 // For testing, use a single connection
});

export const db = drizzle(client, { schema });