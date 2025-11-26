// src/config/db.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from './env';

let client;
let db;

if (process.env.NODE_ENV === 'test') {
  // Use SQLite for tests
  const { Database } = require('better-sqlite3');
  const { drizzle: drizzleSQLite } = require('drizzle-orm/better-sqlite3');
  const sqlite = new Database(':memory:');
  db = drizzleSQLite(sqlite);
} else {
  // Use PostgreSQL for development/production
  const connectionString = env.DATABASE_URL;
  client = postgres(connectionString);
  db = drizzle(client);
}

export { db, client };