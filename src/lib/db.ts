// src/lib/db.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../db/schema.js';

// Environment variables should already be loaded by server.ts or parent module
console.log('Database URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Not set');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set. Make sure to load .env.local before importing this module.');
}

const connectionString = process.env.DATABASE_URL;
console.log('🔌 Connecting to database...');

const client = postgres(connectionString, {
  ssl: 'require',
  max: 10, // Connection pool size
  idle_timeout: 20,
  connect_timeout: 10
});

export const db = drizzle(client, { schema });